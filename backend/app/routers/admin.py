"""Admin CRUD. `require_admin` is a router-level dependency, so every route
here needs a valid session (and a CSRF token for writes)."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, Path, Response, status
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db import get_db
from app.schemas.artists import ArtistAdmin, ArtistIn
from app.schemas.events import EventAdmin, EventIn
from app.security.deps import AdminContext, require_admin
from app.services import artists as artist_service
from app.services import events as event_service

logger = logging.getLogger("onhouse.admin")
router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])

ItemId = Annotated[int, Path(ge=1, le=2_147_483_647)]


# --- Artists ----------------------------------------------------------------


@router.get("/artists", response_model=list[ArtistAdmin])
def list_artists(db: Session = Depends(get_db)) -> list[ArtistAdmin]:
    return artist_service.list_admin(db)


@router.get("/artists/{artist_id}", response_model=ArtistAdmin)
def get_artist(artist_id: ItemId, db: Session = Depends(get_db)) -> ArtistAdmin:
    return artist_service.get_admin(db, artist_id)


@router.post("/artists", response_model=ArtistAdmin, status_code=status.HTTP_201_CREATED)
def create_artist(
    data: ArtistIn,
    db: Session = Depends(get_db),
    ctx: AdminContext = Depends(require_admin),
) -> ArtistAdmin:
    artist = artist_service.create(db, data)
    logger.info("Admin %r created artist %s", ctx.user.username, artist.id)
    return artist


@router.put("/artists/{artist_id}", response_model=ArtistAdmin)
def update_artist(
    data: ArtistIn,
    artist_id: ItemId,
    db: Session = Depends(get_db),
    ctx: AdminContext = Depends(require_admin),
) -> ArtistAdmin:
    artist = artist_service.update(db, artist_id, data)
    logger.info("Admin %r updated artist %s", ctx.user.username, artist_id)
    return artist


@router.delete("/artists/{artist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_artist(
    artist_id: ItemId,
    db: Session = Depends(get_db),
    ctx: AdminContext = Depends(require_admin),
) -> Response:
    artist_service.delete(db, artist_id)
    logger.info("Admin %r deleted artist %s", ctx.user.username, artist_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Events -----------------------------------------------------------------


@router.get("/events", response_model=list[EventAdmin])
def list_events(
    db: Session = Depends(get_db), settings: Settings = Depends(get_settings)
) -> list[EventAdmin]:
    return event_service.list_admin(db, settings)


@router.get("/events/{event_id}", response_model=EventAdmin)
def get_event(
    event_id: ItemId,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> EventAdmin:
    return event_service.get_admin(db, settings, event_id)


@router.post("/events", response_model=EventAdmin, status_code=status.HTTP_201_CREATED)
def create_event(
    data: EventIn,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    ctx: AdminContext = Depends(require_admin),
) -> EventAdmin:
    event = event_service.create(db, settings, data)
    logger.info("Admin %r created event %s", ctx.user.username, event.id)
    return event


@router.put("/events/{event_id}", response_model=EventAdmin)
def update_event(
    data: EventIn,
    event_id: ItemId,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    ctx: AdminContext = Depends(require_admin),
) -> EventAdmin:
    event = event_service.update(db, settings, event_id, data)
    logger.info("Admin %r updated event %s", ctx.user.username, event_id)
    return event


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: ItemId,
    db: Session = Depends(get_db),
    ctx: AdminContext = Depends(require_admin),
) -> Response:
    event_service.delete(db, event_id)
    logger.info("Admin %r deleted event %s", ctx.user.username, event_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
