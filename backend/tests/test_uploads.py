import io
import json

import pytest
from PIL import Image

from app.config import Settings, get_settings
from app.errors import AppError
from app.services import uploads as upload_service
from tests.conftest import ORIGIN, artist_payload

URL = "/api/admin/uploads"


def _image_bytes(fmt: str = "PNG", size=(64, 48), exif: bool = False) -> bytes:
    image = Image.new("RGB", size, (200, 30, 30))
    out = io.BytesIO()
    kwargs = {}
    if exif:
        data = Image.Exif()
        data[0x010F] = "SecretCam"  # Make
        kwargs["exif"] = data
    image.save(out, format=fmt, **kwargs)
    return out.getvalue()


def _upload(admin, content: bytes, name="photo.png", mime="image/png"):
    return admin.client.post(
        URL,
        files={"file": (name, content, mime)},
        headers={"X-CSRF-Token": admin.csrf, "Origin": ORIGIN},
    )


def test_upload_requires_authentication(client):
    response = client.post(URL, files={"file": ("a.png", _image_bytes(), "image/png")})
    assert response.status_code == 401


def test_upload_requires_csrf(admin):
    response = admin.client.post(
        URL, files={"file": ("a.png", _image_bytes(), "image/png")}, headers={"Origin": ORIGIN}
    )
    assert response.status_code == 403


@pytest.mark.parametrize("fmt", ["PNG", "JPEG", "WEBP"])
def test_upload_is_reencoded_to_webp_and_served(admin, client, fmt):
    response = _upload(admin, _image_bytes(fmt))
    assert response.status_code == 201, response.text
    url = response.json()["url"]
    assert url.startswith("/uploads/")
    assert url.endswith(".webp") and len(url) == len("/uploads/") + 32 + 5

    served = client.get(url)
    assert served.status_code == 200
    assert served.headers["content-type"] == "image/webp"
    assert served.headers["x-content-type-options"] == "nosniff"
    assert Image.open(io.BytesIO(served.content)).format == "WEBP"


def test_metadata_is_stripped(admin, client):
    url = _upload(admin, _image_bytes("JPEG", exif=True), "p.jpg", "image/jpeg").json()["url"]
    served = client.get(url).content
    assert b"SecretCam" not in served
    assert not Image.open(io.BytesIO(served)).getexif()


def test_large_images_are_downscaled(admin, client):
    url = _upload(admin, _image_bytes("PNG", size=(4000, 1000))).json()["url"]
    image = Image.open(io.BytesIO(client.get(url).content))
    assert max(image.size) == upload_service.MAX_SIDE


@pytest.mark.parametrize("size", [(4000, 1000), (800, 1200), (1920, 1080), (64, 48)])
def test_event_images_are_cropped_to_1920x1080(admin, client, size):
    response = admin.client.post(
        f"{URL}?variant=event",
        files={"file": ("p.png", _image_bytes("PNG", size=size), "image/png")},
        headers={"X-CSRF-Token": admin.csrf, "Origin": ORIGIN},
    )
    assert response.status_code == 201
    image = Image.open(io.BytesIO(client.get(response.json()["url"]).content))
    assert image.size == upload_service.EVENT_SIZE


def test_unknown_variant_is_rejected(admin):
    response = admin.client.post(
        f"{URL}?variant=huge",
        files={"file": ("p.png", _image_bytes(), "image/png")},
        headers={"X-CSRF-Token": admin.csrf, "Origin": ORIGIN},
    )
    assert response.status_code == 422


@pytest.mark.parametrize(
    ("content", "name", "mime"),
    [
        (b"<script>alert(1)</script>", "evil.png", "image/png"),
        (b"%PDF-1.4 fake", "doc.jpg", "image/jpeg"),
        (b"\x89PNG\r\n\x1a\n" + b"\x00" * 100, "broken.png", "image/png"),
        (None, "anim.gif", "image/gif"),
    ],
)
def test_non_images_are_rejected(admin, content, name, mime):
    if content is None:
        content = _image_bytes("GIF")
    response = _upload(admin, content, name, mime)
    assert response.status_code == 422
    assert response.json()["error"]["details"][0]["field"] == "file"


def test_empty_file_is_rejected(admin):
    assert _upload(admin, b"").status_code == 422


def test_oversized_upload_is_rejected(admin):
    too_big = b"\x00" * (get_settings().max_upload_bytes + 10)
    assert _upload(admin, too_big).status_code == 413


def test_json_endpoints_keep_the_small_limit(admin):
    huge = artist_payload(descriptionEn="x" * 100_000)
    assert admin.post("/api/admin/artists", json=huge).status_code == 413


@pytest.mark.parametrize(
    "path",
    [
        "/uploads/../.env",
        "/uploads/..%2F.env",
        "/uploads/%2e%2e%2fconftest.py",
        "/uploads/" + "a" * 32 + ".png",
        "/uploads/" + "0" * 32 + ".webp",  # well-formed but doesn't exist
    ],
)
def test_serving_only_returns_our_files(client, path):
    assert client.get(path).status_code == 404


def test_uploaded_url_can_be_saved_on_artist(admin, client):
    url = _upload(admin, _image_bytes()).json()["url"]
    created = admin.post("/api/admin/artists", json=artist_payload(imageUrl=url))
    assert created.status_code == 201
    assert client.get(f"/api/artists/{created.json()['id']}").json()["imageUrl"] == url
    # Forged upload-looking paths are still rejected.
    bad = admin.post("/api/admin/artists", json=artist_payload(imageUrl="/uploads/../../x.webp"))
    assert bad.status_code == 422


def test_s3_backend(monkeypatch):
    settings = get_settings().model_copy(
        update={
            "storage_backend": "s3",
            "s3_bucket": "media",
            "s3_public_base_url": "https://media.onhouse.es",
            "s3_prefix": "uploads",
        }
    )
    calls = []

    class FakeS3:
        def put_object(self, **kwargs):
            calls.append(kwargs)

    monkeypatch.setattr(upload_service, "_s3_client", lambda _settings: FakeS3())
    url = upload_service.store(_image_bytes(), settings)

    assert url.startswith("https://media.onhouse.es/uploads/") and url.endswith(".webp")
    assert calls[0]["Bucket"] == "media"
    assert calls[0]["ContentType"] == "image/webp"
    assert calls[0]["Key"] == url.removeprefix("https://media.onhouse.es/")


class _FakeResponse(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *_):
        return False


def _fake_blob(monkeypatch) -> list:
    calls = []

    def fake_urlopen(request, timeout):
        calls.append(request)
        pathname = request.full_url.split("pathname=", 1)[1].replace("%2F", "/")
        url = f"https://store.public.blob.vercel-storage.com/{pathname}"
        return _FakeResponse(json.dumps({"url": url, "pathname": pathname}).encode())

    monkeypatch.setattr(upload_service.urllib.request, "urlopen", fake_urlopen)
    monkeypatch.delenv(upload_service.OIDC_ENV, raising=False)
    return calls


def test_blob_backend(monkeypatch):
    settings = get_settings().model_copy(
        update={"storage_backend": "blob", "blob_read_write_token": "vercel_blob_rw_test"}
    )
    calls = _fake_blob(monkeypatch)
    url = upload_service.store(_image_bytes(), settings)

    assert url.startswith("https://store.public.blob.vercel-storage.com/uploads/")
    assert url.endswith(".webp")
    request = calls[0]
    assert request.get_method() == "PUT"
    assert request.headers["Authorization"] == "Bearer vercel_blob_rw_test"
    assert "X-vercel-blob-store-id" not in request.headers
    assert request.headers["X-vercel-blob-access"] == "public"
    assert request.headers["X-content-type"] == "image/webp"


def test_blob_backend_with_oidc(monkeypatch):
    settings = get_settings().model_copy(
        update={
            "storage_backend": "blob",
            "blob_store_id": "store_AbC123",
            "blob_read_write_token": "vercel_blob_rw_fallback",
        }
    )
    calls = _fake_blob(monkeypatch)
    upload_service.store(_image_bytes(), settings, oidc_token="oidc-from-request")

    # OIDC wins over the static token, like Vercel's own SDK.
    assert calls[0].headers["Authorization"] == "Bearer oidc-from-request"
    assert calls[0].headers["X-vercel-blob-store-id"] == "AbC123"


def test_blob_oidc_token_reaches_the_upload_from_the_request(admin, monkeypatch):
    settings = get_settings().model_copy(
        update={"storage_backend": "blob", "blob_store_id": "store_AbC123"}
    )
    admin.client.app.dependency_overrides[get_settings] = lambda: settings
    calls = _fake_blob(monkeypatch)
    try:
        response = admin.client.post(
            URL,
            files={"file": ("p.png", _image_bytes(), "image/png")},
            headers={
                "X-CSRF-Token": admin.csrf,
                "Origin": ORIGIN,
                upload_service.OIDC_HEADER: "oidc-from-vercel",
            },
        )
    finally:
        admin.client.app.dependency_overrides.pop(get_settings, None)
    assert response.status_code == 201
    assert calls[0].headers["Authorization"] == "Bearer oidc-from-vercel"


def test_blob_store_id_without_oidc_token_is_a_clean_502(monkeypatch):
    settings = get_settings().model_copy(
        update={"storage_backend": "blob", "blob_store_id": "store_AbC123"}
    )
    calls = _fake_blob(monkeypatch)
    with pytest.raises(AppError) as exc:
        upload_service.store(_image_bytes(), settings)
    assert exc.value.status_code == 502 and exc.value.code == "storage_unavailable"
    assert calls == []


def test_blob_backend_failure_is_a_clean_502(monkeypatch):
    settings = get_settings().model_copy(
        update={"storage_backend": "blob", "blob_read_write_token": "vercel_blob_rw_test"}
    )

    def broken_urlopen(request, timeout):
        raise upload_service.urllib.error.URLError("unreachable")

    monkeypatch.setattr(upload_service.urllib.request, "urlopen", broken_urlopen)
    try:
        upload_service.store(_image_bytes(), settings)
    except AppError as exc:
        assert exc.status_code == 502 and exc.code == "storage_unavailable"
    else:
        raise AssertionError("expected AppError")


def test_blob_backend_requires_credentials():
    with pytest.raises(ValueError, match="BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN"):
        Settings(_env_file=None, STORAGE_BACKEND="blob")


def test_blob_store_id_alone_is_enough_to_start():
    # What Vercel's Blob integration sets today: no static token at all.
    settings = Settings(_env_file=None, STORAGE_BACKEND="blob", BLOB_STORE_ID="store_AbC123")
    assert settings.blob_store_id == "store_AbC123"
