"""ASGI entrypoint: `uvicorn app.main:app` (Vercel also picks up `app`)."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.config import Settings, get_settings
from app.errors import register_error_handlers
from app.middleware import BodySizeLimitMiddleware, RateLimitMiddleware, SecurityHeadersMiddleware
from app.routers import admin, auth, public, uploads
from app.security.deps import client_ip


def configure_logging(settings: Settings) -> None:
    logging.basicConfig(
        level=settings.log_level.upper(),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings)

    app = FastAPI(
        title="ONHOUSE API",
        version="1.0.0",
        # No interactive docs or schema in production: less surface to probe.
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None,
        openapi_url=None if settings.is_production else "/openapi.json",
    )
    register_error_handlers(app)

    app.include_router(public.router)
    app.include_router(auth.router)
    app.include_router(admin.router)
    app.include_router(uploads.admin_router)
    app.include_router(uploads.public_router)

    # Order: last added runs first. Requests pass through
    # TrustedHost -> SecurityHeaders -> CORS -> RateLimit -> BodySize -> app.
    app.add_middleware(
        BodySizeLimitMiddleware,
        # Room for the multipart envelope on top of the file itself.
        overrides={uploads.UPLOAD_PATH: settings.max_upload_bytes + 64 * 1024},
    )
    app.add_middleware(RateLimitMiddleware, settings=settings, ip_resolver=client_ip)
    app.add_middleware(
        CORSMiddleware,
        # The site normally calls through its own /api proxy (same origin), so
        # CORS only matters for direct calls: allow the site's origin(s) only.
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Content-Type", "X-CSRF-Token"],
        max_age=600,
    )
    app.add_middleware(SecurityHeadersMiddleware, settings=settings)
    if settings.allowed_hosts:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts)

    if settings.is_production and settings.storage_backend == "local":
        logging.getLogger("onhouse").warning(
            "STORAGE_BACKEND=local in production: uploads are lost on hosts with an "
            "ephemeral disk (Vercel, Render free). Use STORAGE_BACKEND=s3 there."
        )
    return app


app = create_app()
