"""Image upload (admin) and serving of locally stored uploads (public)."""

import logging

from fastapi import APIRouter, Depends, File, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import FileResponse

from app.config import Settings, get_settings
from app.errors import AppError, not_found
from app.security.deps import AdminContext, require_admin
from app.services import uploads as upload_service

logger = logging.getLogger("onhouse.uploads")

UPLOAD_PATH = "/api/admin/uploads"

admin_router = APIRouter(tags=["admin"], dependencies=[Depends(require_admin)])
public_router = APIRouter(tags=["public"])


@admin_router.post(UPLOAD_PATH, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
    ctx: AdminContext = Depends(require_admin),
) -> dict:
    # Read one byte past the limit so an oversized file is detected without
    # trusting the declared size.
    data = await file.read(settings.max_upload_bytes + 1)
    if len(data) > settings.max_upload_bytes:
        raise AppError(
            413, "payload_too_large", f"Images must be at most {settings.max_upload_mb:g} MB"
        )
    if not data:
        raise AppError(422, "validation_error", "The file is empty",
                       [{"field": "file", "message": "empty file", "type": "value_error"}])

    # Decoding/encoding is CPU-bound: keep it off the event loop.
    url = await run_in_threadpool(upload_service.store, data, settings)
    logger.info("Admin %r uploaded %s", ctx.user.username, url)
    return {"url": url}


@public_router.get("/uploads/{name}", include_in_schema=False)
def serve_upload(name: str, settings: Settings = Depends(get_settings)) -> FileResponse:
    path = upload_service.local_path(name, settings) if settings.storage_backend == "local" else None
    if path is None:
        raise not_found("File")
    return FileResponse(
        path,
        media_type="image/webp",
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )
