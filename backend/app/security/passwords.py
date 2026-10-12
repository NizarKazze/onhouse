"""Argon2id password hashing (argon2-cffi defaults follow RFC 9106)."""

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

_hasher = PasswordHasher()

# Verified against when the username does not exist, so a login for an unknown
# user costs the same time as one with a wrong password (no user enumeration).
_DUMMY_HASH = _hasher.hash("onhouse-timing-equaliser")

MIN_PASSWORD_LENGTH = 12


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password_hash: str | None, password: str) -> bool:
    try:
        return _hasher.verify(password_hash or _DUMMY_HASH, password) and password_hash is not None
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def needs_rehash(password_hash: str) -> bool:
    return _hasher.check_needs_rehash(password_hash)


def validate_new_password(password: str, username: str) -> None:
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
    if len(password) > 256:
        raise ValueError("Password must be at most 256 characters")
    if username.lower() in password.lower():
        raise ValueError("Password must not contain the username")
