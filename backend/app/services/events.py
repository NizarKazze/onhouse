"""Event queries, serialisation and writes."""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.config import Settings
from app.errors import AppError, not_found
from app.models import Artist, Event, EventArtist
from app.schemas.artists import Localized
from app.schemas.events import EventAdmin, EventIn, EventPublic, EventStatus, LineupArtist
from app.services.schedule import Schedule, compute_statuses, sort_key

_WITH_LINEUP = selectinload(Event.artist_links).selectinload(EventArtist.artist)


def _lineup(event: Event, published_only: bool) -> list[LineupArtist]:
    return [
        LineupArtist(id=link.artist.id, name=link.artist.name, genre=link.artist.genre)
        for link in event.artist_links
        if not published_only or link.artist.is_published
    ]


def _to_public(event: Event, schedule: Schedule, status: EventStatus) -> EventPublic:
    return EventPublic(
        id=event.id,
        number=event.number,
        title=event.title,
        city=event.city,
        venue=event.venue,
        date=event.event_date,
        doors_open=event.doors_open,
        doors_close=event.doors_close,
        starts_at=schedule.starts_at,
        ends_at=schedule.ends_at,
        status=status,
        description=Localized(en=event.description_en, es=event.description_es),
        image_url=event.image_url,
        ticket_url=event.ticket_url,
        artists=_lineup(event, published_only=True),
    )


def _to_admin(event: Event, status: EventStatus) -> EventAdmin:
    return EventAdmin(
        id=event.id,
        number=event.number,
        title=event.title,
        city=event.city,
        venue=event.venue,
        date=event.event_date,
        doors_open=event.doors_open,
        doors_close=event.doors_close,
        description_en=event.description_en,
        description_es=event.description_es,
        image_url=event.image_url,
        ticket_url=event.ticket_url,
        is_published=event.is_published,
        status=status,
        artists=_lineup(event, published_only=False),
        created_at=event.created_at,
        updated_at=event.updated_at,
    )


def _load_all(db: Session, published_only: bool) -> list[Event]:
    query = select(Event).options(_WITH_LINEUP)
    if published_only:
        query = query.where(Event.is_published.is_(True))
    return list(db.scalars(query))


def _sorted(events: list[Event], statuses: dict) -> list[Event]:
    return sorted(events, key=lambda e: sort_key(e, statuses[e.id][0]))


# --- Public -----------------------------------------------------------------


def list_public(db: Session, settings: Settings) -> list[EventPublic]:
    events = _load_all(db, published_only=True)
    statuses = compute_statuses(events, settings.event_timezone)
    return [_to_public(e, *statuses[e.id]) for e in _sorted(events, statuses)]


def get_public(db: Session, settings: Settings, event_id: int) -> EventPublic:
    # Status depends on the other published events, so compute over all of them.
    events = _load_all(db, published_only=True)
    statuses = compute_statuses(events, settings.event_timezone)
    for event in events:
        if event.id == event_id:
            return _to_public(event, *statuses[event.id])
    # Unpublished and missing look identical: drafts don't leak.
    raise not_found("Event")


# --- Admin ------------------------------------------------------------------


def list_admin(db: Session, settings: Settings) -> list[EventAdmin]:
    events = _load_all(db, published_only=False)
    statuses = compute_statuses(events, settings.event_timezone)
    return [_to_admin(e, statuses[e.id][1]) for e in _sorted(events, statuses)]


def get_admin(db: Session, settings: Settings, event_id: int) -> EventAdmin:
    events = _load_all(db, published_only=False)
    statuses = compute_statuses(events, settings.event_timezone)
    for event in events:
        if event.id == event_id:
            return _to_admin(event, statuses[event.id][1])
    raise not_found("Event")


def _check_number_free(db: Session, number: int, exclude_id: int | None = None) -> None:
    query = select(Event.id).where(Event.number == number)
    if exclude_id is not None:
        query = query.where(Event.id != exclude_id)
    if db.scalar(query) is not None:
        raise AppError(
            409,
            "conflict",
            "Another event already uses this number",
            [{"field": "number", "message": "already in use", "type": "unique"}],
        )


def _check_artists_exist(db: Session, artist_ids: list[int]) -> None:
    if not artist_ids:
        return
    found = set(db.scalars(select(Artist.id).where(Artist.id.in_(artist_ids))))
    missing = [i for i in artist_ids if i not in found]
    if missing:
        raise AppError(
            422,
            "validation_error",
            "Some artists do not exist",
            [{"field": "artistIds", "message": f"unknown artist ids: {missing}", "type": "missing"}],
        )


def _apply(event: Event, data: EventIn) -> None:
    # Explicit field-by-field copy: only these columns are client-writable.
    event.number = data.number
    event.title = data.title
    event.city = data.city
    event.venue = data.venue
    event.event_date = data.date
    event.doors_open = data.doors_open
    event.doors_close = data.doors_close
    event.description_en = data.description_en
    event.description_es = data.description_es
    event.image_url = data.image_url
    event.ticket_url = data.ticket_url
    event.is_published = data.is_published
    event.artist_links = [
        EventArtist(artist_id=artist_id, position=position)
        for position, artist_id in enumerate(data.artist_ids)
    ]


def _commit(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError as exc:
        # Race with a concurrent write (e.g. same number) — map to 409.
        db.rollback()
        raise AppError(409, "conflict", "The change conflicts with existing data") from exc


def create(db: Session, settings: Settings, data: EventIn) -> EventAdmin:
    _check_number_free(db, data.number)
    _check_artists_exist(db, data.artist_ids)
    event = Event()
    _apply(event, data)
    db.add(event)
    _commit(db)
    return get_admin(db, settings, event.id)


def update(db: Session, settings: Settings, event_id: int, data: EventIn) -> EventAdmin:
    event = db.scalar(select(Event).options(_WITH_LINEUP).where(Event.id == event_id))
    if event is None:
        raise not_found("Event")
    _check_number_free(db, data.number, exclude_id=event_id)
    _check_artists_exist(db, data.artist_ids)
    # Replace the line-up in two steps so the (event, artist) primary key never
    # collides between the old and new rows within one flush.
    event.artist_links.clear()
    db.flush()
    _apply(event, data)
    _commit(db)
    db.expire_all()
    return get_admin(db, settings, event_id)


def delete(db: Session, event_id: int) -> None:
    event = db.get(Event, event_id)
    if event is None:
        raise not_found("Event")
    db.delete(event)  # line-up rows go with it (ON DELETE CASCADE)
    db.commit()
