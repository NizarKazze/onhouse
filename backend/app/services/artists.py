"""Artist queries, serialisation and writes."""

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import Settings
from app.errors import not_found
from app.models import Artist, ArtistLink, Event
from app.schemas.artists import (
    ArtistAdmin,
    ArtistIn,
    ArtistLinkOut,
    ArtistPublic,
    EventRef,
    Localized,
)
from app.schemas.events import EventStatus
from app.services.schedule import compute_statuses, sort_key

_ORDER = (Artist.sort_order, Artist.id)


def _next_events(db: Session, settings: Settings) -> dict[int, EventRef]:
    """Soonest published, not-yet-ended event for every booked artist."""
    events = list(
        db.scalars(
            select(Event)
            .options(selectinload(Event.artist_links))
            .where(Event.is_published.is_(True))
        )
    )
    statuses = compute_statuses(events, settings.event_timezone)
    upcoming = sorted(
        (e for e in events if statuses[e.id][1] is not EventStatus.past),
        key=lambda e: sort_key(e, statuses[e.id][0]),
    )
    result: dict[int, EventRef] = {}
    for event in upcoming:
        for link in event.artist_links:
            result.setdefault(
                link.artist_id, EventRef(id=event.id, number=event.number, title=event.title)
            )
    return result


def _description(artist: Artist) -> Localized | None:
    if not artist.description_en and not artist.description_es:
        return None
    # Fall back to the other language rather than showing nothing.
    en = artist.description_en or artist.description_es or ""
    es = artist.description_es or artist.description_en or ""
    return Localized(en=en, es=es)


def _links(artist: Artist) -> list[ArtistLinkOut]:
    return [ArtistLinkOut(platform=link.platform, url=link.url) for link in artist.links]


def _to_public(artist: Artist, next_event: EventRef | None) -> ArtistPublic:
    return ArtistPublic(
        id=artist.id,
        name=artist.name,
        genre=artist.genre,
        description=_description(artist),
        image_url=artist.image_url,
        links=_links(artist),
        next_event=next_event,
    )


def _to_admin(artist: Artist) -> ArtistAdmin:
    return ArtistAdmin(
        id=artist.id,
        name=artist.name,
        genre=artist.genre,
        description_en=artist.description_en,
        description_es=artist.description_es,
        image_url=artist.image_url,
        sort_order=artist.sort_order,
        is_published=artist.is_published,
        links=_links(artist),
        event_ids=sorted(link.event_id for link in artist.event_links),
        created_at=artist.created_at,
        updated_at=artist.updated_at,
    )


# --- Public -----------------------------------------------------------------


def list_public(db: Session, settings: Settings) -> list[ArtistPublic]:
    artists = db.scalars(
        select(Artist)
        .options(selectinload(Artist.links))
        .where(Artist.is_published.is_(True))
        .order_by(*_ORDER)
    )
    next_events = _next_events(db, settings)
    return [_to_public(a, next_events.get(a.id)) for a in artists]


def get_public(db: Session, settings: Settings, artist_id: int) -> ArtistPublic:
    artist = db.scalar(
        select(Artist)
        .options(selectinload(Artist.links))
        .where(Artist.id == artist_id, Artist.is_published.is_(True))
    )
    if artist is None:
        raise not_found("Artist")
    return _to_public(artist, _next_events(db, settings).get(artist.id))


# --- Admin ------------------------------------------------------------------

_ADMIN_OPTIONS = (selectinload(Artist.links), selectinload(Artist.event_links))


def list_admin(db: Session) -> list[ArtistAdmin]:
    artists = db.scalars(select(Artist).options(*_ADMIN_OPTIONS).order_by(*_ORDER))
    return [_to_admin(a) for a in artists]


def _get(db: Session, artist_id: int) -> Artist:
    artist = db.scalar(select(Artist).options(*_ADMIN_OPTIONS).where(Artist.id == artist_id))
    if artist is None:
        raise not_found("Artist")
    return artist


def get_admin(db: Session, artist_id: int) -> ArtistAdmin:
    return _to_admin(_get(db, artist_id))


def _apply(artist: Artist, data: ArtistIn) -> None:
    # Explicit field-by-field copy: only these columns are client-writable.
    artist.name = data.name
    artist.genre = data.genre
    artist.description_en = data.description_en
    artist.description_es = data.description_es
    artist.image_url = data.image_url
    artist.sort_order = data.sort_order
    artist.is_published = data.is_published
    artist.links = [ArtistLink(platform=link.platform, url=link.url) for link in data.links]


def create(db: Session, data: ArtistIn) -> ArtistAdmin:
    artist = Artist()
    _apply(artist, data)
    db.add(artist)
    db.commit()
    return get_admin(db, artist.id)


def update(db: Session, artist_id: int, data: ArtistIn) -> ArtistAdmin:
    artist = _get(db, artist_id)
    # Clear first so the (artist, platform) unique key can't collide mid-flush.
    artist.links.clear()
    db.flush()
    _apply(artist, data)
    db.commit()
    db.expire_all()
    return get_admin(db, artist_id)


def delete(db: Session, artist_id: int) -> None:
    artist = db.get(Artist, artist_id)
    if artist is None:
        raise not_found("Artist")
    # Links and line-up entries are removed by ON DELETE CASCADE; the events
    # themselves stay.
    db.delete(artist)
    db.commit()

