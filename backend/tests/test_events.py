from datetime import date, timedelta

import pytest

from tests.conftest import artist_payload, event_payload


def _artists(admin, *names):
    return [admin.post("/api/admin/artists", json=artist_payload(name=n)).json()["id"] for n in names]


def test_event_crud_with_lineup(admin, client):
    a, b, c = _artists(admin, "A", "B", "C")

    created = admin.post("/api/admin/events", json=event_payload(artistIds=[b, a]))
    assert created.status_code == 201, created.text
    event = created.json()
    assert [x["name"] for x in event["artists"]] == ["B", "A"]  # billing order kept
    event_id = event["id"]

    public = client.get(f"/api/events/{event_id}").json()
    assert public["status"] == "next"
    assert public["doorsOpen"] == "23:59"
    assert public["description"] == {"en": "The first night.", "es": "La primera noche."}
    assert "isPublished" not in public

    updated = admin.put(
        f"/api/admin/events/{event_id}",
        json=event_payload(
            title="ONHOUSE 001 — OPENING",
            venue="Club X",
            date="2030-07-12",
            ticketUrl="https://tickets.example/001",
            artistIds=[c, a],
        ),
    )
    assert updated.status_code == 200, updated.text
    body = updated.json()
    assert body["venue"] == "Club X"
    assert body["date"] == "2030-07-12"
    assert [x["name"] for x in body["artists"]] == ["C", "A"]

    # The artist side of the relation follows.
    assert admin.get(f"/api/admin/artists/{b}").json()["eventIds"] == []
    assert admin.get(f"/api/admin/artists/{c}").json()["eventIds"] == [event_id]

    assert admin.delete(f"/api/admin/events/{event_id}").status_code == 204
    assert client.get(f"/api/events/{event_id}").status_code == 404
    # Artists survive the event; their links are gone.
    assert admin.get(f"/api/admin/artists/{c}").json()["eventIds"] == []


def test_deleting_an_artist_removes_it_from_lineups_only(admin):
    a, b = _artists(admin, "A", "B")
    event_id = admin.post("/api/admin/events", json=event_payload(artistIds=[a, b])).json()["id"]

    assert admin.delete(f"/api/admin/artists/{a}").status_code == 204
    event = admin.get(f"/api/admin/events/{event_id}").json()
    assert [x["name"] for x in event["artists"]] == ["B"]


def test_event_number_must_be_unique(admin):
    assert admin.post("/api/admin/events", json=event_payload(number=7)).status_code == 201
    duplicate = admin.post("/api/admin/events", json=event_payload(number=7))
    assert duplicate.status_code == 409
    assert duplicate.json()["error"]["code"] == "conflict"

    other = admin.post("/api/admin/events", json=event_payload(number=8)).json()
    clash = admin.put(f"/api/admin/events/{other['id']}", json=event_payload(number=7))
    assert clash.status_code == 409
    # Keeping its own number is fine.
    assert admin.put(f"/api/admin/events/{other['id']}", json=event_payload(number=8)).status_code == 200


def test_unknown_artist_ids_are_rejected(admin):
    response = admin.post("/api/admin/events", json=event_payload(artistIds=[424242]))
    assert response.status_code == 422
    assert response.json()["error"]["details"][0]["field"] == "artistIds"


def test_unpublished_events_and_artists_do_not_leak(admin, client):
    hidden_artist, shown_artist = _artists(admin, "HIDDEN", "SHOWN")
    admin.put(
        f"/api/admin/artists/{hidden_artist}",
        json=artist_payload(name="HIDDEN", isPublished=False),
    )
    draft = admin.post("/api/admin/events", json=event_payload(number=1, isPublished=False)).json()
    live = admin.post(
        "/api/admin/events",
        json=event_payload(number=2, title="ONHOUSE 002", artistIds=[hidden_artist, shown_artist]),
    ).json()

    listed = client.get("/api/events").json()
    assert [e["id"] for e in listed] == [live["id"]]
    # The draft doesn't take the "next" slot from the published event.
    assert listed[0]["status"] == "next"
    assert [a["name"] for a in listed[0]["artists"]] == ["SHOWN"]
    assert client.get(f"/api/events/{draft['id']}").status_code == 404


def test_status_and_ordering(admin, client):
    today = date.today()
    admin.post("/api/admin/events", json=event_payload(number=1, title="PAST", date=str(today - timedelta(days=30))))
    admin.post("/api/admin/events", json=event_payload(number=2, title="TBA"))
    admin.post("/api/admin/events", json=event_payload(number=3, title="LATER", date=str(today + timedelta(days=60))))
    admin.post("/api/admin/events", json=event_payload(number=4, title="SOON", date=str(today + timedelta(days=10))))

    events = client.get("/api/events").json()
    assert [(e["title"], e["status"]) for e in events] == [
        ("PAST", "past"),
        ("SOON", "next"),
        ("LATER", "upcoming"),
        ("TBA", "upcoming"),
    ]
    soon = events[1]
    # 23:59 → 06:00 crosses midnight; timestamps carry the Madrid offset.
    assert soon["startsAt"].startswith(str(today + timedelta(days=10)) + "T23:59:00+0")
    assert soon["endsAt"].startswith(str(today + timedelta(days=11)) + "T06:00:00+0")


@pytest.mark.parametrize(
    "overrides",
    [
        {"number": 0},
        {"number": "001; DROP TABLE events"},
        {"title": ""},
        {"city": "x" * 81},
        {"date": "not-a-date"},
        {"date": "2026-02-30"},
        {"doorsOpen": "25:00"},
        {"descriptionEn": ""},
        {"descriptionEs": "x" * 5001},
        {"ticketUrl": "javascript:alert(document.cookie)"},
        {"ticketUrl": "ftp://example.com/x"},
        {"imageUrl": "https://"},
        {"artistIds": [1, 1]},
        {"artistIds": [0]},
        {"artistIds": list(range(1, 60))},
        {"id": 5},
        {"status": "past"},
        {"updatedAt": "2020-01-01"},
    ],
)
def test_event_validation(admin, overrides):
    response = admin.post("/api/admin/events", json=event_payload(**overrides))
    assert response.status_code == 422, response.text
    assert response.json()["error"]["code"] == "validation_error"


def test_sql_injection_payloads_are_stored_as_plain_text(admin, client):
    payload = "'; DROP TABLE events; --"
    created = admin.post("/api/admin/events", json=event_payload(title=payload, venue="\" OR 1=1 --"))
    assert created.status_code == 201
    assert client.get(f"/api/events/{created.json()['id']}").json()["title"] == payload
    assert len(client.get("/api/events").json()) == 1
