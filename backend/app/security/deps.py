"""FastAPI dependencies that guard the admin API.

`require_admin` is attached at router level to every /api/admin/* route except
login, so no admin endpoint can be added without authentication by accident.
"""

import ipaddress
from dataclasses import dataclass

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db import get_db
from app.errors import AppError
from app.models import AdminSession, AdminUser
from app.security.sessions import csrf_matches, resolve_session

SAFE_METHODS = frozenset({"GET", "HEAD", "OPTIONS"})


def client_ip(request: Request, settings: Settings | None = None) -> str:
    settings = settings or get_settings()
    if settings.client_ip_header:
        raw = request.headers.get(settings.client_ip_header, "")
        # X-Forwarded-For style lists: the left-most entry is the client as
        # seen by the first (trusted) proxy.
        candidate = raw.split(",")[0].strip()
        try:
            return str(ipaddress.ip_address(candidate))
        except ValueError:
            pass
    return request.client.host if request.client else "unknown"


def check_origin(request: Request, settings: Settings) -> None:
    """Defence in depth on top of SameSite=Strict and the CSRF token: browsers
    always send Origin on cross-origin POST/PUT/DELETE; reject foreign ones."""
    origin = request.headers.get("origin")
    if origin is not None and origin.rstrip("/") not in settings.allowed_origins:
        raise AppError(403, "forbidden", "Origin not allowed")


@dataclass
class AdminContext:
    user: AdminUser
    session: AdminSession
    token: str


def require_admin(
    request: Request,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> AdminContext:
    token = request.cookies.get(settings.session_cookie_name)
    resolved = resolve_session(db, token, settings)
    if resolved is None:
        raise AppError(401, "unauthorized", "Authentication required")
    session, user = resolved

    if request.method not in SAFE_METHODS:
        check_origin(request, settings)
        if not csrf_matches(token or "", request.headers.get("x-csrf-token"), settings):
            raise AppError(403, "csrf_failed", "Missing or invalid CSRF token")

    return AdminContext(user=user, session=session, token=token or "")
