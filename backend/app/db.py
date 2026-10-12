"""Engine and session factory. Every query goes through SQLAlchemy, so values
are always sent as bound parameters — never interpolated into SQL."""

from collections.abc import Iterator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool

from app.config import Settings, get_settings


def build_engine(settings: Settings) -> Engine:
    url = settings.sqlalchemy_url
    kwargs: dict = {"pool_pre_ping": True, "future": True}

    if url.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
    else:
        # TLS is driven by `sslmode` in the URL. Server-side prepared
        # statements are disabled so the app also works through a
        # transaction-mode pooler (Neon/Supabase "pooled" connection strings).
        kwargs["connect_args"] = {"connect_timeout": 10, "prepare_threshold": None}
        if settings.db_null_pool:
            kwargs["poolclass"] = NullPool
        else:
            kwargs.update(pool_size=5, max_overflow=5, pool_recycle=280)

    engine = create_engine(url, **kwargs)
    if url.startswith("sqlite"):
        # SQLite (tests only) ignores foreign keys unless asked; PostgreSQL
        # always enforces them.
        @event.listens_for(engine, "connect")
        def _fk_on(dbapi_connection, _record) -> None:  # pragma: no cover
            dbapi_connection.execute("PRAGMA foreign_keys=ON")

    return engine


engine = build_engine(get_settings())
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
