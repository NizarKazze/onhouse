"""Application settings, read from environment variables (and `.env` locally).

Nothing secret has a default: in production the app refuses to start when a
required value is missing or obviously unsafe.
"""

from functools import lru_cache
from typing import Annotated, Literal
from urllib.parse import parse_qsl, quote_plus, urlencode, urlsplit, urlunsplit

from pydantic import AliasChoices, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

CsvList = Annotated[list[str], NoDecode]

# Query parameters that providers add for other clients (Supabase's Vercel
# integration adds `supa`; Prisma URLs carry `pgbouncer`/`connection_limit`).
# libpq rejects unknown parameters, so they are dropped.
_NON_LIBPQ_PARAMS = {"supa", "pgbouncer", "connection_limit", "pool_timeout", "schema"}


def _split_csv(value: object) -> object:
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    return value


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    environment: Literal["development", "production", "test"] = Field(
        "development", alias="APP_ENV"
    )
    secret_key: str = Field("", alias="SECRET_KEY")

    # --- Database -----------------------------------------------------------
    # Either a full DATABASE_URL (POSTGRES_URL, as set by Vercel's Neon
    # integration, also works) or the standard libpq PG* values.
    database_url: str = Field(
        "", validation_alias=AliasChoices("DATABASE_URL", "POSTGRES_URL")
    )
    # Direct (non-pooler) connection, used only by Alembic migrations when set.
    database_url_unpooled: str = Field(
        "", validation_alias=AliasChoices("DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING")
    )
    pg_host: str = Field("127.0.0.1", alias="PGHOST")
    pg_port: int = Field(5432, alias="PGPORT")
    pg_database: str = Field("onhouse", alias="PGDATABASE")
    pg_user: str = Field("onhouse", alias="PGUSER")
    pg_password: str = Field("", alias="PGPASSWORD")
    # TLS to the database. Managed providers (Neon, Supabase...) need "require".
    pg_sslmode: str = Field("prefer", alias="PGSSLMODE")
    # Serverless hosts (Vercel) should not keep a pool between invocations.
    db_null_pool: bool = Field(False, alias="DB_NULL_POOL")

    # --- HTTP ---------------------------------------------------------------
    frontend_url: str = Field("http://localhost:3000", alias="FRONTEND_URL")
    # Extra origins allowed by CORS/Origin checks (e.g. preview deployments).
    extra_allowed_origins: CsvList = Field(
        default_factory=list, alias="EXTRA_ALLOWED_ORIGINS"
    )
    # Host header allow-list. Empty disables the check (development only).
    allowed_hosts: CsvList = Field(default_factory=list, alias="ALLOWED_HOSTS")
    # Header that carries the real client IP when behind a trusted proxy
    # (e.g. "x-real-ip" on Vercel). Empty = use the socket peer address.
    client_ip_header: str = Field("", alias="CLIENT_IP_HEADER")

    # --- Sessions -----------------------------------------------------------
    session_idle_minutes: int = Field(60, ge=5, alias="SESSION_IDLE_MINUTES")
    session_absolute_hours: int = Field(12, ge=1, alias="SESSION_ABSOLUTE_HOURS")

    # --- Brute force / rate limiting ---------------------------------------
    login_window_minutes: int = Field(15, ge=1, alias="LOGIN_WINDOW_MINUTES")
    login_max_failures_per_user_ip: int = Field(5, ge=1, alias="LOGIN_MAX_FAILURES_PER_USER_IP")
    login_max_failures_per_user: int = Field(20, ge=1, alias="LOGIN_MAX_FAILURES_PER_USER")
    login_max_failures_per_ip: int = Field(30, ge=1, alias="LOGIN_MAX_FAILURES_PER_IP")
    rate_limit_per_minute: int = Field(300, ge=1, alias="RATE_LIMIT_PER_MINUTE")
    admin_write_limit_per_minute: int = Field(60, ge=1, alias="ADMIN_WRITE_LIMIT_PER_MINUTE")

    # --- Image uploads ------------------------------------------------------
    # local: files in UPLOAD_DIR (needs a persistent disk).
    # s3: any S3-compatible bucket (Cloudflare R2, AWS S3...). Use on Vercel/Render.
    storage_backend: Literal["local", "s3"] = Field("local", alias="STORAGE_BACKEND")
    upload_dir: str = Field("uploads", alias="UPLOAD_DIR")
    max_upload_mb: float = Field(4, gt=0, le=20, alias="MAX_UPLOAD_MB")
    s3_bucket: str = Field("", alias="S3_BUCKET")
    s3_endpoint_url: str = Field("", alias="S3_ENDPOINT_URL")
    s3_region: str = Field("auto", alias="S3_REGION")
    s3_access_key_id: str = Field("", alias="S3_ACCESS_KEY_ID")
    s3_secret_access_key: str = Field("", alias="S3_SECRET_ACCESS_KEY")
    # Public https base the bucket is served from, e.g. https://media.onhouse.es
    s3_public_base_url: str = Field("", alias="S3_PUBLIC_BASE_URL")
    s3_prefix: str = Field("uploads", alias="S3_PREFIX")

    # --- Domain -------------------------------------------------------------
    event_timezone: str = Field("Europe/Madrid", alias="EVENT_TIMEZONE")
    log_level: str = Field("INFO", alias="LOG_LEVEL")

    @field_validator("extra_allowed_origins", "allowed_hosts", mode="before")
    @classmethod
    def _csv(cls, value: object) -> object:
        return _split_csv(value)

    @field_validator("frontend_url")
    @classmethod
    def _strip_slash(cls, value: str) -> str:
        return value.rstrip("/")

    @model_validator(mode="after")
    def _production_guards(self) -> "Settings":
        if self.storage_backend == "s3":
            required = {
                "S3_BUCKET": self.s3_bucket,
                "S3_ACCESS_KEY_ID": self.s3_access_key_id,
                "S3_SECRET_ACCESS_KEY": self.s3_secret_access_key,
                "S3_PUBLIC_BASE_URL": self.s3_public_base_url,
            }
            missing = [name for name, value in required.items() if not value]
            if missing:
                raise ValueError(f"STORAGE_BACKEND=s3 requires {', '.join(missing)}")
            if not self.s3_public_base_url.startswith("https://"):
                raise ValueError("S3_PUBLIC_BASE_URL must use https")
        if self.environment == "production":
            if len(self.secret_key) < 32:
                raise ValueError("SECRET_KEY must be set to at least 32 characters in production")
            if not self.frontend_url.startswith("https://"):
                raise ValueError("FRONTEND_URL must use https in production")
            if not self.allowed_hosts:
                raise ValueError("ALLOWED_HOSTS must be set in production")
        elif not self.secret_key:
            # Development convenience only; never reached in production.
            self.secret_key = "dev-insecure-secret-key-change-me-0000000000"
        return self

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def allowed_origins(self) -> list[str]:
        return [self.frontend_url, *[o.rstrip("/") for o in self.extra_allowed_origins]]

    @property
    def sqlalchemy_url(self) -> str:
        if self.database_url:
            url = self.database_url
            # Accept the common `postgres://` / `postgresql://` forms (what
            # Vercel, Neon and Supabase hand out) and pin the psycopg 3 driver.
            for prefix in ("postgres://", "postgresql://"):
                if url.startswith(prefix):
                    url = "postgresql+psycopg://" + url[len(prefix):]
            if not url.startswith("postgresql"):
                return url
            parts = urlsplit(url)
            query = [
                (key, value)
                for key, value in parse_qsl(parts.query, keep_blank_values=True)
                if key not in _NON_LIBPQ_PARAMS
            ]
            return urlunsplit(parts._replace(query=urlencode(query)))
        return (
            f"postgresql+psycopg://{quote_plus(self.pg_user)}:{quote_plus(self.pg_password)}"
            f"@{self.pg_host}:{self.pg_port}/{self.pg_database}"
            f"?sslmode={quote_plus(self.pg_sslmode)}"
        )

    @property
    def max_upload_bytes(self) -> int:
        return int(self.max_upload_mb * 1024 * 1024)

    @property
    def session_cookie_name(self) -> str:
        # `__Host-` binds the cookie to this exact host, https and path=/.
        return "__Host-onh_session" if self.is_production else "onh_session"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
