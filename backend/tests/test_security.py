import pytest
from pydantic import ValidationError

from app.config import Settings
from app.middleware import MAX_BODY_BYTES
from tests.conftest import ORIGIN, artist_payload


def test_writes_require_csrf_token(admin):
    client = admin.client
    no_token = client.post("/api/admin/artists", json=artist_payload(), headers={"Origin": ORIGIN})
    assert no_token.status_code == 403
    assert no_token.json()["error"]["code"] == "csrf_failed"

    bad_token = client.post(
        "/api/admin/artists",
        json=artist_payload(),
        headers={"Origin": ORIGIN, "X-CSRF-Token": "0" * 64},
    )
    assert bad_token.status_code == 403
    assert admin.get("/api/admin/artists").json() == []


def test_writes_from_foreign_origin_are_rejected(admin):
    response = admin.client.post(
        "/api/admin/artists",
        json=artist_payload(),
        headers={"Origin": "https://evil.example", "X-CSRF-Token": admin.csrf},
    )
    assert response.status_code == 403


def test_cors_allows_only_the_site_origin(client):
    allowed = client.options(
        "/api/events",
        headers={"Origin": ORIGIN, "Access-Control-Request-Method": "GET"},
    )
    assert allowed.headers.get("access-control-allow-origin") == ORIGIN
    assert allowed.headers.get("access-control-allow-credentials") == "true"

    denied = client.options(
        "/api/admin/artists",
        headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"},
    )
    assert "access-control-allow-origin" not in denied.headers

    simple = client.get("/api/events", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in simple.headers


def test_security_headers(client, admin):
    public = client.get("/api/events")
    assert public.headers["x-content-type-options"] == "nosniff"
    assert public.headers["x-frame-options"] == "DENY"
    assert "default-src 'none'" in public.headers["content-security-policy"]
    assert public.headers["cache-control"].startswith("public")

    private = admin.get("/api/admin/artists")
    assert private.headers["cache-control"] == "no-store"


def test_unknown_host_is_rejected(client):
    assert client.get("/api/events", headers={"Host": "evil.example"}).status_code == 400


def test_oversized_body_is_rejected(admin):
    huge = artist_payload(descriptionEn="x" * (MAX_BODY_BYTES + 10))
    response = admin.post("/api/admin/artists", json=huge)
    assert response.status_code == 413


def test_malformed_json_gives_structured_error(admin):
    response = admin.client.post(
        "/api/admin/artists",
        content=b"{not json",
        headers={
            "Content-Type": "application/json",
            "Origin": ORIGIN,
            "X-CSRF-Token": admin.csrf,
        },
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_errors_do_not_leak_internals(client):
    response = client.get("/api/does-not-exist")
    assert response.status_code == 404
    assert response.json() == {"error": {"code": "not_found", "message": "Not Found"}}


def test_rate_limit(client, monkeypatch):
    from app.main import app  # noqa: F401 — settings object is shared
    from app.config import get_settings

    monkeypatch.setattr(get_settings(), "rate_limit_per_minute", 3)
    # The middleware captured the settings instance at startup, so patching the
    # shared cached object is enough.
    codes = [client.get("/api/events").status_code for _ in range(5)]
    assert codes[:3] == [200, 200, 200]
    assert codes[3] == 429


def test_docs_are_disabled_in_production():
    from app.main import create_app

    settings = Settings(
        APP_ENV="production",
        SECRET_KEY="x" * 40,
        FRONTEND_URL="https://www.onhouse.es",
        ALLOWED_HOSTS="api.onhouse.es",
        DATABASE_URL="sqlite://",
    )
    app = create_app(settings)
    assert app.docs_url is None and app.openapi_url is None
    assert settings.session_cookie_name == "__Host-onh_session"


@pytest.mark.parametrize(
    "overrides",
    [
        {"SECRET_KEY": ""},
        {"SECRET_KEY": "short"},
        {"FRONTEND_URL": "http://www.onhouse.es"},
        {"ALLOWED_HOSTS": ""},
    ],
)
def test_production_refuses_unsafe_config(overrides):
    values = {
        "APP_ENV": "production",
        "SECRET_KEY": "x" * 40,
        "FRONTEND_URL": "https://www.onhouse.es",
        "ALLOWED_HOSTS": "api.onhouse.es",
        **overrides,
    }
    with pytest.raises(ValidationError):
        Settings(**values)


def test_database_url_is_normalised_for_psycopg():
    from app.config import Settings

    url = "postgres://u:p%40ss@db.example.supabase.co:6543/postgres?sslmode=require&supa=base-pooler.x&pgbouncer=true"
    settings = Settings(_env_file=None, DATABASE_URL=url)
    assert settings.sqlalchemy_url == (
        "postgresql+psycopg://u:p%40ss@db.example.supabase.co:6543/postgres?sslmode=require"
    )
