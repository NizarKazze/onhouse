"""Shared schema building blocks and input sanitisers."""

import re
from typing import Annotated
from urllib.parse import urlsplit

from pydantic import AfterValidator, BaseModel, BeforeValidator, ConfigDict
from pydantic.alias_generators import to_camel

# C0/C1 control characters, except tab and newlines (allowed in long text).
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]")
_SAFE_LOCAL_IMAGE = re.compile(r"^/images/[A-Za-z0-9][A-Za-z0-9._/-]*\.(?:webp|jpe?g|png|avif|gif)$")
# Files uploaded through the admin (local storage backend).
_UPLOADED_IMAGE = re.compile(r"^/uploads/[a-f0-9]{32}\.webp$")


class InputModel(BaseModel):
    """Request bodies: camelCase, unknown fields rejected (no mass assignment)."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        validate_by_name=True,
        validate_by_alias=True,
        extra="forbid",
        str_strip_whitespace=True,
    )


class OutputModel(BaseModel):
    """Response bodies: serialised in camelCase for the frontend."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        validate_by_name=True,
        serialize_by_alias=True,
        from_attributes=True,
    )


def _reject_control_chars(value: str) -> str:
    if _CONTROL_CHARS.search(value):
        raise ValueError("contains control characters")
    return value


def _single_line(value: str) -> str:
    if "\n" in value or "\r" in value or "\t" in value:
        raise ValueError("must be a single line")
    return value


def _empty_to_none(value: object) -> object:
    if isinstance(value, str) and not value.strip():
        return None
    return value


def _http_url(value: str) -> str:
    """Absolute http(s) URL only. Blocks `javascript:`, `data:` and friends,
    which would otherwise become stored XSS once rendered in an href."""
    if len(value) > 500:
        raise ValueError("must be at most 500 characters")
    if any(ch.isspace() for ch in value):
        raise ValueError("must not contain whitespace")
    parts = urlsplit(value)
    if parts.scheme not in ("http", "https") or not parts.netloc:
        raise ValueError("must be an http(s) URL")
    if parts.username or parts.password:
        raise ValueError("must not contain credentials")
    return value


def _image_url(value: str) -> str:
    """An https URL, a file shipped with the frontend under /images/, or one
    uploaded through the admin under /uploads/."""
    if value.startswith("/"):
        if ".." in value or not (_SAFE_LOCAL_IMAGE.match(value) or _UPLOADED_IMAGE.match(value)):
            raise ValueError("local images must be /images/<file> or an uploaded file")
        return value
    _http_url(value)
    if not value.startswith("https://"):
        raise ValueError("remote images must use https")
    return value


SingleLine = Annotated[str, AfterValidator(_reject_control_chars), AfterValidator(_single_line)]
LongText = Annotated[str, AfterValidator(_reject_control_chars)]
HttpUrl = Annotated[str, AfterValidator(_http_url)]
ImageUrl = Annotated[str, AfterValidator(_image_url)]
EmptyToNone = BeforeValidator(_empty_to_none)
