from datetime import datetime
from typing import Annotated

from pydantic import Field, StringConstraints, field_validator

from app.models import LinkPlatform
from app.schemas.common import (
    EmptyToNone,
    HttpUrl,
    ImageUrl,
    InputModel,
    LongText,
    OutputModel,
    SingleLine,
)

Name = Annotated[SingleLine, StringConstraints(min_length=1, max_length=120)]
Genre = Annotated[SingleLine, StringConstraints(min_length=1, max_length=80)]
Bio = Annotated[Annotated[LongText, StringConstraints(max_length=5000)] | None, EmptyToNone]


# --- Input ------------------------------------------------------------------


class ArtistLinkIn(InputModel):
    platform: LinkPlatform
    url: HttpUrl


class ArtistIn(InputModel):
    """Full representation for POST and PUT (PUT replaces every field)."""

    name: Name
    genre: Genre
    description_en: Bio = None
    description_es: Bio = None
    image_url: Annotated[ImageUrl | None, EmptyToNone] = None
    sort_order: int = Field(0, ge=0, le=10_000)
    is_published: bool = True
    links: list[ArtistLinkIn] = Field(default_factory=list, max_length=len(LinkPlatform))

    @field_validator("links")
    @classmethod
    def _one_link_per_platform(cls, links: list[ArtistLinkIn]) -> list[ArtistLinkIn]:
        platforms = [link.platform for link in links]
        if len(platforms) != len(set(platforms)):
            raise ValueError("each platform can only appear once")
        return links


# --- Output -----------------------------------------------------------------


class Localized(OutputModel):
    en: str
    es: str


class ArtistLinkOut(OutputModel):
    platform: LinkPlatform
    url: str


class EventRef(OutputModel):
    id: int
    number: int
    title: str


class ArtistPublic(OutputModel):
    id: int
    name: str
    genre: str
    description: Localized | None
    image_url: str | None
    links: list[ArtistLinkOut]
    # The soonest upcoming published event this artist is booked for.
    next_event: EventRef | None


class ArtistAdmin(OutputModel):
    id: int
    name: str
    genre: str
    description_en: str | None
    description_es: str | None
    image_url: str | None
    sort_order: int
    is_published: bool
    links: list[ArtistLinkOut]
    event_ids: list[int]
    created_at: datetime
    updated_at: datetime
