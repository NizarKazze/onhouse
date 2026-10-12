"""Server-side admin sessions.

The cookie holds 256 bits of randomness; the database stores only its SHA-256,
so a leaked table cannot be replayed. Sessions expire after an idle period and
after an absolute lifetime, and logout deletes the row (real revocation, unlike
a stateless JWT).

The CSRF token is an HMAC of the session token under SECRET_KEY: bound to the
session, never stored, and unforgeable without the key.
"""

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta

from fastapi import Response
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.config import Settings
from app.models import AdminSession, AdminUser, utcnow


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def csrf_token_for(token: str, settings: Settings) -> str:
    return hmac.new(settings.secret_key.encode(), f"csrf:{token}".encode(), hashlib.sha256).hexdigest()


def csrf_matches(token: str, provided: str | None, settings: Settings) -> bool:
    return bool(provided) and hmac.compare_digest(csrf_token_for(token, settings), provided or "")


def create_session(
    db: Session,
    user: AdminUser,
    settings: Settings,
    ip: str | None,
    user_agent: str | None,
) -> str:
    token = secrets.token_urlsafe(32)
    now = utcnow()
    db.add(
        AdminSession(
            user_id=user.id,
            token_hash=_hash_token(token),
            created_at=now,
            last_seen_at=now,
            expires_at=now + timedelta(hours=settings.session_absolute_hours),
            ip=(ip or "")[:45] or None,
            user_agent=(user_agent or "")[:255] or None,
        )
    )
    return token


def resolve_session(
    db: Session, token: str | None, settings: Settings
) -> tuple[AdminSession, AdminUser] | None:
    """Return the live session and its user, sliding the idle window. Expired or
    orphaned sessions are deleted on sight."""
    if not token or len(token) > 128:
        return None
    row = db.execute(
        select(AdminSession, AdminUser)
        .join(AdminUser, AdminUser.id == AdminSession.user_id)
        .where(AdminSession.token_hash == _hash_token(token))
    ).first()
    if row is None:
        return None
    session, user = row
    now = utcnow()
    idle_limit = session.last_seen_at + timedelta(minutes=settings.session_idle_minutes)
    if now >= session.expires_at or now >= idle_limit or not user.is_active:
        db.delete(session)
        db.commit()
        return None
    # Write at most once a minute to keep reads cheap.
    if now - session.last_seen_at > timedelta(seconds=60):
        session.last_seen_at = now
        db.commit()
    return session, user


def revoke_session(db: Session, token: str | None) -> None:
    if token:
        db.execute(delete(AdminSession).where(AdminSession.token_hash == _hash_token(token)))
        db.commit()


def revoke_all_for_user(db: Session, user_id: int) -> None:
    db.execute(delete(AdminSession).where(AdminSession.user_id == user_id))


def purge_expired(db: Session, now: datetime | None = None) -> None:
    db.execute(delete(AdminSession).where(AdminSession.expires_at < (now or utcnow())))


def set_session_cookie(response: Response, token: str, settings: Settings) -> None:
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        max_age=settings.session_absolute_hours * 3600,
        path="/",
        secure=settings.is_production,
        httponly=True,
        samesite="strict",
    )


def clear_session_cookie(response: Response, settings: Settings) -> None:
    response.delete_cookie(
        key=settings.session_cookie_name,
        path="/",
        secure=settings.is_production,
        httponly=True,
        samesite="strict",
    )
