"""Pure ASGI middleware: security headers, request size limit, rate limiting."""

import json
import threading
import time
from collections.abc import Callable

from starlette.datastructures import Headers, MutableHeaders
from starlette.requests import Request
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.config import Settings
from app.errors import error_body

MAX_BODY_BYTES = 64 * 1024  # JSON only; images are URLs, never uploads.


async def _send_json(send: Send, status: int, body: dict, headers: dict[str, str] | None = None) -> None:
    payload = json.dumps(body).encode()
    raw_headers = [
        (b"content-type", b"application/json"),
        (b"content-length", str(len(payload)).encode()),
    ]
    raw_headers += [(k.lower().encode(), v.encode()) for k, v in (headers or {}).items()]
    await send({"type": "http.response.start", "status": status, "headers": raw_headers})
    await send({"type": "http.response.body", "body": payload})


class SecurityHeadersMiddleware:
    """The API only ever returns JSON, so the CSP can forbid everything."""

    def __init__(self, app: ASGIApp, settings: Settings) -> None:
        self.app = app
        self.settings = settings

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        path: str = scope.get("path", "")
        docs = not self.settings.is_production and path in ("/docs", "/redoc", "/openapi.json")

        async def send_wrapper(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)
                headers.setdefault("X-Content-Type-Options", "nosniff")
                headers.setdefault("X-Frame-Options", "DENY")
                headers.setdefault("Referrer-Policy", "no-referrer")
                headers.setdefault("Cross-Origin-Opener-Policy", "same-origin")
                # Uploaded images are public and may be embedded from the site.
                headers.setdefault(
                    "Cross-Origin-Resource-Policy",
                    "cross-origin" if path.startswith("/uploads/") else "same-site",
                )
                headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
                if not docs:
                    headers.setdefault(
                        "Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'"
                    )
                if self.settings.is_production:
                    headers.setdefault(
                        "Strict-Transport-Security", "max-age=63072000; includeSubDomains"
                    )
                # Admin data and auth responses must never be cached anywhere.
                if path.startswith("/api/admin"):
                    headers["Cache-Control"] = "no-store"
                    headers.setdefault("Pragma", "no-cache")
            await send(message)

        await self.app(scope, receive, send_wrapper)


class BodySizeLimitMiddleware:
    """64 KB for JSON everywhere; larger limits only on the paths listed in
    `overrides` (the image upload)."""

    def __init__(
        self,
        app: ASGIApp,
        max_bytes: int = MAX_BODY_BYTES,
        overrides: dict[str, int] | None = None,
    ) -> None:
        self.app = app
        self.max_bytes = max_bytes
        self.overrides = overrides or {}

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        max_bytes = self.overrides.get(scope.get("path", ""), self.max_bytes)
        length = Headers(scope=scope).get("content-length")
        if length is not None:
            if not length.isdigit() or int(length) > max_bytes:
                await _send_json(send, 413, error_body("payload_too_large", "Request body too large"))
                return
            await self.app(scope, receive, send)
            return

        # No Content-Length (chunked): count as we go.
        received = 0

        async def limited_receive() -> Message:
            nonlocal received
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > max_bytes:
                    raise _BodyTooLarge()
            return message

        try:
            await self.app(scope, limited_receive, send)
        except _BodyTooLarge:
            await _send_json(send, 413, error_body("payload_too_large", "Request body too large"))


class _BodyTooLarge(Exception):
    pass


class _FixedWindowCounter:
    """In-process fixed-window counter. Good enough for a single instance; on
    serverless each instance counts separately, which is why the login throttle
    (the one that matters) lives in the database instead."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._hits: dict[tuple[str, str, int], int] = {}
        self._last_sweep = 0

    def hit(self, bucket: str, key: str, limit: int, window: int = 60) -> int | None:
        """Register a hit; return seconds to wait if the limit is exceeded."""
        now = int(time.time())
        slot = now // window
        with self._lock:
            if now - self._last_sweep > window:
                self._hits = {k: v for k, v in self._hits.items() if k[2] >= slot}
                self._last_sweep = now
            counter_key = (bucket, key, slot)
            self._hits[counter_key] = self._hits.get(counter_key, 0) + 1
            if self._hits[counter_key] > limit:
                return (slot + 1) * window - now
        return None

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


rate_counter = _FixedWindowCounter()


class RateLimitMiddleware:
    def __init__(
        self,
        app: ASGIApp,
        settings: Settings,
        ip_resolver: Callable[[Request, Settings], str],
    ) -> None:
        self.app = app
        self.settings = settings
        self.ip_resolver = ip_resolver

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or not scope.get("path", "").startswith("/api"):
            await self.app(scope, receive, send)
            return
        request = Request(scope)
        ip = self.ip_resolver(request, self.settings)

        retry = rate_counter.hit("all", ip, self.settings.rate_limit_per_minute)
        if retry is None and request.method not in ("GET", "HEAD", "OPTIONS") and scope["path"].startswith("/api/admin"):
            retry = rate_counter.hit("admin-write", ip, self.settings.admin_write_limit_per_minute)
        if retry is not None:
            await _send_json(
                send,
                429,
                error_body("rate_limited", "Too many requests. Slow down."),
                {"Retry-After": str(max(1, retry))},
            )
            return
        await self.app(scope, receive, send)

