"""Public, read-only API consumed by the website. Only published content."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Response
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db import get_db
from app.errors import AppError
from app.schemas.artists import ArtistPublic
from app.schemas.events import EventPublic
from app.services import artists as artist_service
from app.services import events as event_service

router = APIRouter(prefix="/api", tags=["public"])

ItemId = Annotated[int, Path(ge=1, le=2_147_483_647)]

# Short shared caching: the site revalidates on its own schedule anyway.
PUBLIC_CACHE = "public, max-age=60, stale-while-revalidate=300"


@router.get("/health", include_in_schema=False)
def health(db: Session = Depends(get_db)) -> dict:
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001 — report state, never the reason
        raise AppError(503, "unavailable", "Database unavailable") from exc
    return {"status": "ok"}


@router.get("/events", response_model=list[EventPublic])
def list_events(
    response: Response,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> list[EventPublic]:
    response.headers["Cache-Control"] = PUBLIC_CACHE
    return event_service.list_public(db, settings)


@router.get("/events/{event_id}", response_model=EventPublic)
def get_event(
    response: Response,
    event_id: ItemId,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> EventPublic:
    response.headers["Cache-Control"] = PUBLIC_CACHE
    return event_service.get_public(db, settings, event_id)


@router.get("/artists", response_model=list[ArtistPublic])
def list_artists(
    response: Response,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> list[ArtistPublic]:
    response.headers["Cache-Control"] = PUBLIC_CACHE
    return artist_service.list_public(db, settings)


@router.get("/artists/{artist_id}", response_model=ArtistPublic)
def get_artist(
    response: Response,
    artist_id: ItemId,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> ArtistPublic:
    response.headers["Cache-Control"] = PUBLIC_CACHE
    return artist_service.get_public(db, settings, artist_id)
