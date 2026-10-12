"""Admin login / logout / current session."""

import logging

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db import get_db
from app.errors import AppError
from app.models import AdminUser, utcnow
from app.schemas.auth import LoginIn, SessionOut
from app.security import throttle
from app.security.deps import AdminContext, check_origin, client_ip, require_admin
from app.security.passwords import hash_password, needs_rehash, verify_password
from app.security.sessions import (
    clear_session_cookie,
    create_session,
    csrf_token_for,
    purge_expired,
    revoke_session,
    set_session_cookie,
)

logger = logging.getLogger("onhouse.auth")
router = APIRouter(prefix="/api/admin/auth", tags=["auth"])

INVALID_CREDENTIALS = AppError(401, "invalid_credentials", "Invalid username or password")


@router.post("/login", response_model=SessionOut)
def login(
    data: LoginIn,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> SessionOut:
    # Login is unauthenticated, so the Origin check is its CSRF defence
    # (prevents login-CSRF into an attacker-chosen account).
    check_origin(request, settings)
    ip = client_ip(request, settings)
    throttle.check_login_allowed(db, data.username, ip, settings)

    user = db.scalar(
        select(AdminUser).where(func.lower(AdminUser.username) == data.username.lower())
    )
    # Always run the hasher, even for unknown users (constant-ish timing).
    valid = verify_password(user.password_hash if user else None, data.password)

    if not valid or user is None or not user.is_active:
        throttle.record_attempt(db, data.username, ip, succeeded=False)
        db.commit()
        logger.warning("Failed admin login for %r from %s", data.username[:64], ip)
        raise INVALID_CREDENTIALS

    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(data.password)

    # Fresh token on every login (no session fixation). Old cookie, if any, dies.
    revoke_session(db, request.cookies.get(settings.session_cookie_name))
    token = create_session(db, user, settings, ip, request.headers.get("user-agent"))
    user.last_login_at = utcnow()
    throttle.clear_failures(db, data.username, ip)
    throttle.record_attempt(db, data.username, ip, succeeded=True)
    purge_expired(db)
    throttle.purge_old_attempts(db, settings)
    db.commit()

    logger.info("Admin %r logged in from %s", user.username, ip)
    set_session_cookie(response, token, settings)
    return SessionOut(username=user.username, csrf_token=csrf_token_for(token, settings))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    request: Request,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    ctx: AdminContext = Depends(require_admin),
) -> Response:
    revoke_session(db, ctx.token)
    response = Response(status_code=status.HTTP_204_NO_CONTENT)
    clear_session_cookie(response, settings)
    logger.info("Admin %r logged out", ctx.user.username)
    return response


@router.get("/me", response_model=SessionOut)
def me(
    settings: Settings = Depends(get_settings),
    ctx: AdminContext = Depends(require_admin),
) -> SessionOut:
    return SessionOut(username=ctx.user.username, csrf_token=csrf_token_for(ctx.token, settings))
