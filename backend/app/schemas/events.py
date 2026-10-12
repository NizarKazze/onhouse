import datetime as dt
from enum import StrEnum
from typing import Annotated

from pydantic import Field, PlainSerializer, StringConstraints, field_validator

from app.schemas.common import (
    EmptyToNone,
    HttpUrl,
    ImageUrl,
    InputModel,
    LongText,
    OutputModel,
    SingleLine,
)
from app.schemas.artists import Localized

Title = Annotated[SingleLine, StringConstraints(min_length=1, max_length=120)]
City = Annotated[SingleLine, StringConstraints(min_length=1, max_length=80)]
Venue = Annotated[Annotated[SingleLine, StringConstraints(max_length=120)] | None, EmptyToNone]
Description = Annotated[LongText, StringConstraints(min_length=1, max_length=5000)]
# Doors are shown as HH:MM; seconds are dropped on the way out.
HourMinute = Annotated[
    dt.time, PlainSerializer(lambda t: t.strftime("%H:%M"), return_type=str)
]

MAX_LINEUP = 50


class EventStatus(StrEnum):
    next = "next"
    upcoming = "upcoming"
    past = "past"


# --- Input ------------------------------------------------------------------


class EventIn(InputModel):
    """Full representation for POST and PUT (PUT replaces every field)."""

    number: int = Field(ge=1, le=9999)
    title: Title
    city: City
    venue: Venue = None
    date: Annotated[dt.date | None, EmptyToNone] = None
    doors_open: Annotated[dt.time | None, EmptyToNone] = None
    doors_close: Annotated[dt.time | None, EmptyToNone] = None
    description_en: Description
    description_es: Description
    image_url: Annotated[ImageUrl | None, EmptyToNone] = None
    ticket_url: Annotated[HttpUrl | None, EmptyToNone] = None
    is_published: bool = True
    # Billing order is the list order.
    artist_ids: list[Annotated[int, Field(ge=1)]] = Field(
        default_factory=list, max_length=MAX_LINEUP
    )

    @field_validator("artist_ids")
    @classmethod
    def _no_duplicates(cls, ids: list[int]) -> list[int]:
        if len(ids) != len(set(ids)):
            raise ValueError("an artist can only appear once in a line-up")
        return ids

    @field_validator("doors_open", "doors_close")
    @classmethod
    def _no_timezone(cls, value: dt.time | None) -> dt.time | None:
        if value is not None and value.tzinfo is not None:
            raise ValueError("times are local to the event; omit the timezone")
        return value.replace(second=0, microsecond=0) if value else value


# --- Output -----------------------------------------------------------------


class LineupArtist(OutputModel):
    id: int
    name: str
    genre: str


class EventPublic(OutputModel):
    id: int
    number: int
    title: str
    city: str
    venue: str | None
    date: dt.date | None
    doors_open: HourMinute | None
    doors_close: HourMinute | None
    # ISO 8601 with offset, derived from date + doors in the event timezone.
    starts_at: dt.datetime | None
    ends_at: dt.datetime | None
    status: EventStatus
    description: Localized
    image_url: str | None
    ticket_url: str | None
    artists: list[LineupArtist]


class EventAdmin(OutputModel):
    id: int
    number: int
    title: str
    city: str
    venue: str | None
    date: dt.date | None
    doors_open: HourMinute | None
    doors_close: HourMinute | None
    description_en: str
    description_es: str
    image_url: str | None
    ticket_url: str | None
    is_published: bool
    status: EventStatus
    artists: list[LineupArtist]
    created_at: dt.datetime
    updated_at: dt.datetime
