"""Image uploads from the admin panel.

Every upload is decoded and re-encoded to WebP: that proves the file really is
an image, strips metadata (EXIF, GPS), caps the resolution and neutralises
polyglot files. The stored name is random, so nothing the client sends ever
becomes part of a path.

Three storage backends:
  local — files in UPLOAD_DIR, served by this API at /uploads/<name>.
          For development or a host with a persistent disk.
  blob  — Vercel Blob (public store). Authenticated with OIDC (BLOB_STORE_ID
          plus the per-request token Vercel issues) or, for older stores, a
          static BLOB_READ_WRITE_TOKEN. The simplest choice on Vercel.
  s3    — any S3-compatible bucket (Cloudflare R2, AWS S3, Backblaze B2),
          served from S3_PUBLIC_BASE_URL.
Vercel and Render free wipe the disk, so they need blob or s3.
"""

import io
import json
import logging
import os
import re
import secrets
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urlencode

from PIL import Image, ImageOps, UnidentifiedImageError

from app.config import Settings
from app.errors import AppError

ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP", "AVIF"}
MAX_SIDE = 2560  # px, longest side after re-encoding
# Event photos are always stored at exactly this size (16:9), centre-cropped,
# so every frame on the site shows the same picture.
EVENT_SIZE = (1920, 1080)
WEBP_QUALITY = 85
UPLOAD_NAME = re.compile(r"^[a-f0-9]{32}\.webp$")

# Vercel Blob REST API (the protocol used by Vercel's own SDKs).
BLOB_API_URL = "https://vercel.com/api/blob/"
BLOB_API_VERSION = "13"  # what @vercel/blob sends today
# Vercel issues the OIDC token per request (header), or in the env locally.
OIDC_HEADER = "x-vercel-oidc-token"
OIDC_ENV = "VERCEL_OIDC_TOKEN"

logger = logging.getLogger("onhouse.uploads")

# Refuse decompression bombs outright (Pillow only warns by default).
Image.MAX_IMAGE_PIXELS = 60_000_000


def _invalid(message: str) -> AppError:
    return AppError(
        422, "validation_error", message, [{"field": "file", "message": message, "type": "value_error"}]
    )


def process_image(data: bytes, size: tuple[int, int] | None = None) -> bytes:
    """Re-encode to WebP. With `size`, centre-crop and scale to exactly that."""
    try:
        with Image.open(io.BytesIO(data)) as probe:
            if probe.format not in ALLOWED_FORMATS:
                raise _invalid("Only JPEG, PNG, WebP or AVIF images are accepted")
            probe.verify()
        # verify() leaves the image unusable; open again to decode.
        with Image.open(io.BytesIO(data)) as image:
            image = ImageOps.exif_transpose(image)  # honour phone rotation, then drop EXIF
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
            if size:
                image = ImageOps.fit(image, size, Image.Resampling.LANCZOS)
            else:
                image.thumbnail((MAX_SIDE, MAX_SIDE))
            out = io.BytesIO()
            image.save(out, format="WEBP", quality=WEBP_QUALITY, method=4)
            return out.getvalue()
    except AppError:
        raise
    except (UnidentifiedImageError, Image.DecompressionBombError, OSError, ValueError, SyntaxError):
        raise _invalid("The file is not a valid image") from None


def _new_name() -> str:
    return f"{secrets.token_hex(16)}.webp"


def upload_dir(settings: Settings) -> Path:
    path = Path(settings.upload_dir).resolve()
    path.mkdir(parents=True, exist_ok=True)
    return path


def _s3_client(settings: Settings):
    import boto3  # imported lazily: only needed for the s3 backend

    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url or None,
        region_name=settings.s3_region or None,
        aws_access_key_id=settings.s3_access_key_id,
        aws_secret_access_key=settings.s3_secret_access_key,
    )


def _blob_auth(settings: Settings, oidc_token: str | None) -> dict[str, str]:
    """Same order as Vercel's SDK: OIDC + store id first, then the static token."""
    oidc_token = (oidc_token or os.environ.get(OIDC_ENV, "")).strip()
    if settings.blob_store_id and oidc_token:
        return {
            "authorization": f"Bearer {oidc_token}",
            # The OIDC token doesn't name the store; the API wants the bare id.
            "x-vercel-blob-store-id": settings.blob_store_id.removeprefix("store_"),
        }
    if settings.blob_read_write_token:
        return {"authorization": f"Bearer {settings.blob_read_write_token}"}
    logger.error("Vercel Blob: no OIDC token on the request and no BLOB_READ_WRITE_TOKEN")
    raise AppError(502, "storage_unavailable", "Image storage is unavailable")


def _blob_put(pathname: str, body: bytes, settings: Settings, oidc_token: str | None) -> str:
    """Upload to Vercel Blob; return the public URL it is served from."""
    request = urllib.request.Request(
        f"{BLOB_API_URL}?{urlencode({'pathname': pathname})}",
        data=body,
        method="PUT",
        headers={
            **_blob_auth(settings, oidc_token),
            "x-api-version": BLOB_API_VERSION,
            "x-vercel-blob-access": "public",
            "x-content-type": "image/webp",
            "x-add-random-suffix": "0",
            "x-allow-overwrite": "0",
            "x-cache-control-max-age": "31536000",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            url = json.load(response)["url"]
    except (urllib.error.URLError, KeyError, ValueError) as exc:
        detail = exc.read()[:300] if isinstance(exc, urllib.error.HTTPError) else exc
        logger.error("Vercel Blob upload failed: %s", detail)
        raise AppError(502, "storage_unavailable", "Image storage is unavailable") from exc
    if not url.startswith("https://"):
        raise AppError(502, "storage_unavailable", "Image storage is unavailable")
    return url


def store(
    data: bytes,
    settings: Settings,
    size: tuple[int, int] | None = None,
    oidc_token: str | None = None,
) -> str:
    """Process and store an image; return the URL to save in the database.

    `oidc_token` is the Vercel OIDC token of the current request (blob only).
    """
    webp = process_image(data, size)
    name = _new_name()

    if settings.storage_backend == "s3":
        key = f"{settings.s3_prefix.strip('/')}/{name}".lstrip("/")
        _s3_client(settings).put_object(
            Bucket=settings.s3_bucket,
            Key=key,
            Body=webp,
            ContentType="image/webp",
            CacheControl="public, max-age=31536000, immutable",
        )
        return f"{settings.s3_public_base_url.rstrip('/')}/{key}"

    if settings.storage_backend == "blob":
        return _blob_put(f"uploads/{name}", webp, settings, oidc_token)

    (upload_dir(settings) / name).write_bytes(webp)
    return f"/uploads/{name}"


def local_path(name: str, settings: Settings) -> Path | None:
    """Resolve a served upload name, or None if it isn't one of ours."""
    if not UPLOAD_NAME.match(name):
        return None
    path = upload_dir(settings) / name
    return path if path.is_file() else None
