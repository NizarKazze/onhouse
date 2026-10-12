from datetime import timedelta

import pytest
from sqlalchemy import select, update

from app.db import SessionLocal
from app.models import AdminSession, AdminUser, LoginAttempt, utcnow
from tests.conftest import ADMIN_PASSWORD, ORIGIN, login

ADMIN_ROUTES = [
    ("get", "/api/admin/artists"),
    ("get", "/api/admin/artists/1"),
    ("post", "/api/admin/artists"),
    ("put", "/api/admin/artists/1"),
    ("delete", "/api/admin/artists/1"),
    ("get", "/api/admin/events"),
    ("get", "/api/admin/events/1"),
    ("post", "/api/admin/events"),
    ("put", "/api/admin/events/1"),
    ("delete", "/api/admin/events/1"),
    ("get", "/api/admin/auth/me"),
    ("post", "/api/admin/auth/logout"),
]


@pytest.mark.parametrize(("method", "url"), ADMIN_ROUTES)
def test_admin_routes_require_authentication(client, method, url):
    response = getattr(client, method)(url)
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthorized"


@pytest.mark.parametrize(("method", "url"), ADMIN_ROUTES)
def test_forged_session_cookie_is_rejected(client, admin_user, method, url):
    client.cookies.set("onh_session", "forged-token-value")
    response = getattr(client, method)(url)
    assert response.status_code == 401


def test_login_sets_hardened_cookie_and_me_works(client, admin_user):
    response = login(client)
    assert response.status_code == 200
    body = response.json()
    assert body["username"] == "admin"
    assert len(body["csrfToken"]) == 64
    # Nothing sensitive in the body.
    assert "password" not in response.text.lower()

    cookie = response.headers["set-cookie"].lower()
    assert "httponly" in cookie
    assert "samesite=strict" in cookie
    assert "path=/" in cookie

    me = client.get("/api/admin/auth/me")
    assert me.status_code == 200
    assert me.json()["csrfToken"] == body["csrfToken"]


def test_token_is_stored_hashed(client, admin_user):
    login(client)
    raw = client.cookies.get("onh_session")
    with SessionLocal() as db:
        stored = db.scalars(select(AdminSession.token_hash)).all()
    assert raw not in stored
    assert len(stored) == 1 and len(stored[0]) == 64


def test_password_is_hashed_with_argon2id(admin_user):
    with SessionLocal() as db:
        stored = db.scalar(select(AdminUser.password_hash))
    assert stored.startswith("$argon2id$")
    assert ADMIN_PASSWORD not in stored


def test_wrong_password_and_unknown_user_are_indistinguishable(client, admin_user):
    wrong = login(client, password="nope-nope-nope")
    unknown = login(client, username="ghost", password="nope-nope-nope")
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()
    assert "set-cookie" not in wrong.headers


def test_inactive_user_cannot_login(client, admin_user):
    with SessionLocal() as db:
        db.execute(update(AdminUser).values(is_active=False))
        db.commit()
    assert login(client).status_code == 401


def test_deactivating_user_kills_live_sessions(client, admin_user):
    login(client)
    with SessionLocal() as db:
        db.execute(update(AdminUser).values(is_active=False))
        db.commit()
    assert client.get("/api/admin/auth/me").status_code == 401


def test_logout_revokes_the_session_server_side(client, admin_user):
    csrf = login(client).json()["csrfToken"]
    token = client.cookies.get("onh_session")

    response = client.post(
        "/api/admin/auth/logout", headers={"X-CSRF-Token": csrf, "Origin": ORIGIN}
    )
    assert response.status_code == 204
    assert client.get("/api/admin/auth/me").status_code == 401

    # Replaying the old cookie value must not work either.
    client.cookies.set("onh_session", token)
    assert client.get("/api/admin/auth/me").status_code == 401


def test_logout_requires_csrf(client, admin_user):
    login(client)
    assert client.post("/api/admin/auth/logout").status_code == 403
    assert client.get("/api/admin/auth/me").status_code == 200


def test_relogin_rotates_the_session(client, admin_user):
    login(client)
    first = client.cookies.get("onh_session")
    login(client)
    second = client.cookies.get("onh_session")
    assert first != second
    with SessionLocal() as db:
        assert len(db.scalars(select(AdminSession)).all()) == 1


def test_idle_session_expires(client, admin_user):
    login(client)
    with SessionLocal() as db:
        db.execute(update(AdminSession).values(last_seen_at=utcnow() - timedelta(hours=5)))
        db.commit()
    assert client.get("/api/admin/auth/me").status_code == 401
    with SessionLocal() as db:
        assert db.scalars(select(AdminSession)).all() == []


def test_absolute_session_lifetime(client, admin_user):
    login(client)
    with SessionLocal() as db:
        db.execute(update(AdminSession).values(expires_at=utcnow() - timedelta(seconds=1)))
        db.commit()
    assert client.get("/api/admin/auth/me").status_code == 401


def test_brute_force_is_throttled(client, admin_user):
    for _ in range(5):
        assert login(client, password="wrong-password-x").status_code == 401

    blocked = login(client, password="wrong-password-x")
    assert blocked.status_code == 429
    assert int(blocked.headers["retry-after"]) > 0
    # Even the right password is refused while locked out.
    assert login(client).status_code == 429


def test_successful_login_clears_failures(client, admin_user):
    for _ in range(4):
        login(client, password="wrong-password-x")
    assert login(client).status_code == 200
    with SessionLocal() as db:
        failures = db.scalars(select(LoginAttempt).where(LoginAttempt.succeeded.is_(False))).all()
    assert failures == []


def test_username_lockout_is_case_insensitive(client, admin_user):
    for name in ["admin", "ADMIN", "Admin", "aDmin", "admIN"]:
        login(client, username=name, password="wrong-password-x")
    assert login(client, username="AdMiN").status_code == 429


def test_login_rejects_foreign_origin(client, admin_user):
    response = client.post(
        "/api/admin/auth/login",
        json={"username": "admin", "password": ADMIN_PASSWORD},
        headers={"Origin": "https://evil.example"},
    )
    assert response.status_code == 403
    assert "set-cookie" not in response.headers


def test_login_validates_input(client):
    too_long = client.post(
        "/api/admin/auth/login", json={"username": "a", "password": "x" * 300}
    )
    assert too_long.status_code == 422
    extra = client.post(
        "/api/admin/auth/login", json={"username": "a", "password": "b", "isAdmin": True}
    )
    assert extra.status_code == 422
