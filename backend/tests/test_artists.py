import pytest

from tests.conftest import artist_payload, event_payload


def test_artist_crud(admin, client):
    created = admin.post("/api/admin/artists", json=artist_payload())
    assert created.status_code == 201, created.text
    artist = created.json()
    assert artist["name"] == "VCTR"
    assert artist["links"] == [{"platform": "instagram", "url": "https://instagram.com/vctr"}]
    artist_id = artist["id"]

    listed = admin.get("/api/admin/artists").json()
    assert [a["id"] for a in listed] == [artist_id]
    assert admin.get(f"/api/admin/artists/{artist_id}").json()["genre"] == "HOUSE"

    updated = admin.put(
        f"/api/admin/artists/{artist_id}",
        json=artist_payload(
            name="VCTR B2B",
            genre="DEEP HOUSE",
            links=[
                {"platform": "soundcloud", "url": "https://soundcloud.com/vctr"},
                {"platform": "instagram", "url": "https://instagram.com/vctr2"},
            ],
        ),
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["name"] == "VCTR B2B"
    assert {link["platform"] for link in updated.json()["links"]} == {"soundcloud", "instagram"}
    assert updated.json()["updatedAt"] >= artist["updatedAt"]

    public = client.get(f"/api/artists/{artist_id}").json()
    assert public["name"] == "VCTR B2B"
    assert public["description"] == {"en": "Resident.", "es": "Residente."}
    assert "isPublished" not in public and "createdAt" not in public

    assert admin.delete(f"/api/admin/artists/{artist_id}").status_code == 204
    assert admin.get(f"/api/admin/artists/{artist_id}").status_code == 404
    assert admin.delete(f"/api/admin/artists/{artist_id}").status_code == 404


def test_unpublished_artist_is_hidden_publicly(admin, client):
    hidden = admin.post("/api/admin/artists", json=artist_payload(isPublished=False)).json()
    shown = admin.post("/api/admin/artists", json=artist_payload(name="SHOWN")).json()

    assert [a["id"] for a in client.get("/api/artists").json()] == [shown["id"]]
    # Draft ids can't be fetched directly either (no IDOR on drafts).
    response = client.get(f"/api/artists/{hidden['id']}")
    assert response.status_code == 404
    assert response.json() == client.get("/api/artists/999999").json()


def test_public_order_follows_sort_order(admin, client):
    admin.post("/api/admin/artists", json=artist_payload(name="B", sortOrder=2))
    admin.post("/api/admin/artists", json=artist_payload(name="A", sortOrder=1))
    assert [a["name"] for a in client.get("/api/artists").json()] == ["A", "B"]


def test_next_event_is_derived_from_lineups(admin, client):
    artist = admin.post("/api/admin/artists", json=artist_payload()).json()
    assert client.get(f"/api/artists/{artist['id']}").json()["nextEvent"] is None

    admin.post("/api/admin/events", json=event_payload(number=2, title="ONHOUSE 002", artistIds=[artist["id"]]))
    admin.post("/api/admin/events", json=event_payload(number=1, artistIds=[artist["id"]]))

    next_event = client.get(f"/api/artists/{artist['id']}").json()["nextEvent"]
    assert next_event["title"] == "ONHOUSE 001"


@pytest.mark.parametrize(
    "overrides",
    [
        {"name": ""},
        {"name": "x" * 121},
        {"name": "line\nbreak"},
        {"name": "null\x00byte"},
        {"genre": ""},
        {"imageUrl": "javascript:alert(1)"},
        {"imageUrl": "http://insecure.example/a.jpg"},
        {"imageUrl": "/images/../../etc/passwd"},
        {"imageUrl": "/other/path.webp"},
        {"links": [{"platform": "instagram", "url": "javascript:alert(1)"}]},
        {"links": [{"platform": "instagram", "url": "data:text/html,hi"}]},
        {"links": [{"platform": "instagram", "url": "https://user:pw@example.com"}]},
        {"links": [{"platform": "myspace", "url": "https://myspace.com/x"}]},
        {"links": [
            {"platform": "instagram", "url": "https://instagram.com/a"},
            {"platform": "instagram", "url": "https://instagram.com/b"},
        ]},
        {"sortOrder": -1},
        {"isPublished": "yes please"},
        # Mass assignment: server-owned fields are rejected, not ignored.
        {"id": 999},
        {"createdAt": "2020-01-01T00:00:00"},
        {"eventIds": [1]},
    ],
)
def test_artist_validation(admin, overrides):
    response = admin.post("/api/admin/artists", json=artist_payload(**overrides))
    assert response.status_code == 422, response.text
    body = response.json()["error"]
    assert body["code"] == "validation_error"
    # Structured details, and the submitted values are never echoed back.
    assert body["details"]
    assert all("input" not in detail for detail in body["details"])


def test_blank_optional_fields_become_null(admin):
    created = admin.post(
        "/api/admin/artists",
        json=artist_payload(imageUrl="", descriptionEn="  ", descriptionEs=None),
    ).json()
    assert created["imageUrl"] is None
    assert created["descriptionEn"] is None


def test_invalid_path_ids(admin, client):
    assert client.get("/api/artists/0").status_code == 422
    assert client.get("/api/artists/abc").status_code == 422
    assert client.get("/api/artists/1%20OR%201=1").status_code == 422
    assert admin.get("/api/admin/artists/99999999999").status_code == 422
