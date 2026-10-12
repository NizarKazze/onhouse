"""Image uploads from the admin panel.

Every upload is decoded and re-encoded to WebP: that proves the file really is
an image, strips metadata (EXIF, GPS), caps the resolution and neutralises
polyglot files. The stored name is random, so nothing the client sends ever
becomes part of a path.

Two storage backends:
  local — files in UPLOAD_DIR, served by this API at /uploads/<name>.
          For development or a host with a persistent disk.
  s3    — any S3-compatible bucket (Cloudflare R2, AWS S3, Backblaze B2),
          served from S3_PUBLIC_BASE_URL. Required on hosts whose disk is
          wiped on every deploy (Vercel, Render free).
"""

import io
import re
import secrets
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError

from app.config import Settings
from app.errors import AppError

ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP", "AVIF"}
MAX_SIDE = 2560  # px, longest side after re-encoding
WEBP_QUALITY = 85
UPLOAD_NAME = re.compile(r"^[a-f0-9]{32}\.webp$")

# Refuse decompression bombs outright (Pillow only warns by default).
Image.MAX_IMAGE_PIXELS = 60_000_000


def _invalid(message: str) -> AppError:
    return AppError(
        422, "validation_error", message, [{"field": "file", "message": message, "type": "value_error"}]
    )


def process_image(data: bytes) -> bytes:
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


def store(data: bytes, settings: Settings) -> str:
    """Process and store an image; return the URL to save in the database."""
    webp = process_image(data)
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

    (upload_dir(settings) / name).write_bytes(webp)
    return f"/uploads/{name}"


def local_path(name: str, settings: Settings) -> Path | None:
    """Resolve a served upload name, or None if it isn't one of ours."""
    if not UPLOAD_NAME.match(name):
        return None
    path = upload_dir(settings) / name
    return path if path.is_file() else None
