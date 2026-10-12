"""Login brute-force protection, persisted in the database.

Three sliding windows over *failed* attempts:
  - username + IP   (stops a single attacker quickly),
  - username        (stops a distributed attack on one account),
  - IP              (stops one host spraying many usernames).

The per-username limit is deliberately higher than the pair limit so a single
attacker cannot lock the real admin out from their own IP.
"""

import math
from datetime import timedelta

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.config import Settings
from app.errors import AppError
from app.models import LoginAttempt, utcnow


def _normalise(username: str) -> str:
    return username.strip().lower()[:64]


def check_login_allowed(db: Session, username: str, ip: str, settings: Settings) -> None:
    now = utcnow()
    window_start = now - timedelta(minutes=settings.login_window_minutes)
    user = _normalise(username)
    base = select(func.count(), func.min(LoginAttempt.attempted_at)).where(
        LoginAttempt.succeeded.is_(False), LoginAttempt.attempted_at >= window_start
    )

    checks = (
        (base.where(LoginAttempt.username == user, LoginAttempt.ip == ip),
         settings.login_max_failures_per_user_ip),
        (base.where(LoginAttempt.username == user), settings.login_max_failures_per_user),
        (base.where(LoginAttempt.ip == ip), settings.login_max_failures_per_ip),
    )
    for query, limit in checks:
        count, oldest = db.execute(query).one()
        if count >= limit:
            retry = (oldest + timedelta(minutes=settings.login_window_minutes) - now).total_seconds()
            raise AppError(
                429,
                "too_many_attempts",
                "Too many failed login attempts. Try again later.",
                headers={"Retry-After": str(max(1, math.ceil(retry)))},
            )


def record_attempt(db: Session, username: str, ip: str, succeeded: bool) -> None:
    db.add(LoginAttempt(username=_normalise(username), ip=ip[:45], succeeded=succeeded))


def clear_failures(db: Session, username: str, ip: str) -> None:
    """A successful login forgives that user's failures from that IP."""
    db.execute(
        delete(LoginAttempt).where(
            LoginAttempt.username == _normalise(username),
            LoginAttempt.ip == ip,
            LoginAttempt.succeeded.is_(False),
        )
    )


def purge_old_attempts(db: Session, settings: Settings) -> None:
    cutoff = utcnow() - timedelta(days=30)
    db.execute(delete(LoginAttempt).where(LoginAttempt.attempted_at < cutoff))
