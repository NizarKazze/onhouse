"""Test setup.

By default the suite runs against a throwaway SQLite file for speed. Point
TEST_DATABASE_URL at an empty PostgreSQL database to run the very same tests
(and the migrations) against PostgreSQL:

    TEST_DATABASE_URL=postgresql+psycopg://user:pass@127.0.0.1:5432/onhouse_test pytest
"""

import os
import tempfile
from pathlib import Path

_tmp = Path(tempfile.mkdtemp(prefix="onhouse-tests-"))
os.environ["DATABASE_URL"] = os.environ.get("TEST_DATABASE_URL") or f"sqlite:///{_tmp / 'test.db'}"
# Never let a direct URL from the developer's .env redirect the migrations
# (which the suite downgrades to base) at a real database.
os.environ["DATABASE_URL_UNPOOLED"] = os.environ.get("TEST_DATABASE_URL", "")
os.environ["POSTGRES_URL_NON_POOLING"] = ""
os.environ["APP_ENV"] = "test"
os.environ["SECRET_KEY"] = "test-secret-key-0123456789abcdefghijklmnop"
os.environ["FRONTEND_URL"] = "http://localhost:3000"
os.environ["ALLOWED_HOSTS"] = "testserver"
os.environ["CLIENT_IP_HEADER"] = ""
os.environ["LOG_LEVEL"] = "WARNING"
os.environ["STORAGE_BACKEND"] = "local"
os.environ["UPLOAD_DIR"] = str(_tmp / "uploads")
os.environ["MAX_UPLOAD_MB"] = "1"

import pytest  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.db import SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.middleware import rate_counter  # noqa: E402
from app.models import AdminUser, Base  # noqa: E402
from app.security.passwords import hash_password  # noqa: E402

BACKEND_DIR = Path(__file__).resolve().parent.parent
ADMIN_USER = "admin"
ADMIN_PASSWORD = "correct-horse-battery-staple"
ORIGIN = "http://localhost:3000"


def alembic_config() -> Config:
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "migrations"))
    return cfg


@pytest.fixture(scope="session", autouse=True)
def _schema():
    """Build the schema through the real migrations, not create_all()."""
    cfg = alembic_config()
    command.downgrade(cfg, "base")
    command.upgrade(cfg, "head")
    yield
    command.downgrade(cfg, "base")


@pytest.fixture(autouse=True)
def _clean_db():
    rate_counter.reset()
    yield
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def admin_user() -> AdminUser:
    with SessionLocal() as db:
        user = AdminUser(username=ADMIN_USER, password_hash=hash_password(ADMIN_PASSWORD))
        db.add(user)
        db.commit()
        return user


class AdminClient:
    """A logged-in client that sends the CSRF header and Origin on writes."""

    def __init__(self, client: TestClient, csrf: str) -> None:
        self.client = client
        self.csrf = csrf

    def _headers(self) -> dict[str, str]:
        return {"X-CSRF-Token": self.csrf, "Origin": ORIGIN}

    def get(self, url: str, **kw):
        return self.client.get(url, **kw)

    def post(self, url: str, json=None, **kw):
        return self.client.post(url, json=json, headers=self._headers(), **kw)

    def put(self, url: str, json=None, **kw):
        return self.client.put(url, json=json, headers=self._headers(), **kw)

    def delete(self, url: str, **kw):
        return self.client.delete(url, headers=self._headers(), **kw)


def login(client: TestClient, username: str = ADMIN_USER, password: str = ADMIN_PASSWORD):
    return client.post(
        "/api/admin/auth/login",
        json={"username": username, "password": password},
        headers={"Origin": ORIGIN},
    )


@pytest.fixture
def admin(client: TestClient, admin_user: AdminUser) -> AdminClient:
    response = login(client)
    assert response.status_code == 200, response.text
    return AdminClient(client, response.json()["csrfToken"])


def artist_payload(**overrides) -> dict:
    data = {
        "name": "VCTR",
        "genre": "HOUSE",
        "descriptionEn": "Resident.",
        "descriptionEs": "Residente.",
        "imageUrl": "/images/ONHOUSE_2.webp",
        "sortOrder": 1,
        "isPublished": True,
        "links": [{"platform": "instagram", "url": "https://instagram.com/vctr"}],
    }
    data.update(overrides)
    return data


def event_payload(**overrides) -> dict:
    data = {
        "number": 1,
        "title": "ONHOUSE 001",
        "city": "IBIZA",
        "venue": None,
        "date": None,
        "doorsOpen": "23:59",
        "doorsClose": "06:00",
        "descriptionEn": "The first night.",
        "descriptionEs": "La primera noche.",
        "imageUrl": "/images/onh-next-poster.webp",
        "ticketUrl": None,
        "isPublished": True,
        "artistIds": [],
    }
    data.update(overrides)
    return data
