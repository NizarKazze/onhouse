"""Derives an event's timeline position from its date and door times.

Status is computed, never stored, so it can't drift out of sync with the date:
  past     — the night has ended;
  next     — the first published event that hasn't ended (soonest date first,
             TBA dates after dated ones, then by edition number);
  upcoming — everything else still to come.
"""

from dataclasses import dataclass
from datetime import datetime, time, timedelta, timezone
from functools import lru_cache
from zoneinfo import ZoneInfo

from app.models import Event
from app.schemas.events import EventStatus

# Without a closing time, a night is assumed to finish at 06:00 the next day.
DEFAULT_CLOSE = time(6, 0)
# Reference used to decide whether a closing time falls on the next day when
# no opening time is set: before noon means "after midnight".
NOON = time(12, 0)


@dataclass(frozen=True)
class Schedule:
    starts_at: datetime | None
    ends_at: datetime | None


@lru_cache
def _zone(name: str) -> ZoneInfo:
    return ZoneInfo(name)


def schedule_for(event: Event, tz_name: str) -> Schedule:
    if event.event_date is None:
        return Schedule(None, None)
    tz = _zone(tz_name)
    opening = event.doors_open or time(0, 0)
    starts_at = datetime.combine(event.event_date, opening, tzinfo=tz)

    if event.doors_close is None:
        ends_at = datetime.combine(event.event_date + timedelta(days=1), DEFAULT_CLOSE, tzinfo=tz)
    else:
        reference = event.doors_open or NOON
        extra_day = 1 if event.doors_close <= reference else 0
        ends_at = datetime.combine(
            event.event_date + timedelta(days=extra_day), event.doors_close, tzinfo=tz
        )
    return Schedule(starts_at, ends_at)


def is_past(schedule: Schedule, now: datetime) -> bool:
    return schedule.ends_at is not None and schedule.ends_at <= now


def sort_key(event: Event, schedule: Schedule) -> tuple:
    if schedule.starts_at is None:
        return (1, 0.0, event.number)
    return (0, schedule.starts_at.timestamp(), event.number)


def compute_statuses(
    events: list[Event], tz_name: str, now: datetime | None = None
) -> dict[int, tuple[Schedule, EventStatus]]:
    """Status for every event. Only published events compete for `next`."""
    now = now or datetime.now(timezone.utc)
    result: dict[int, tuple[Schedule, EventStatus]] = {}
    active: list[tuple[tuple, Event]] = []

    for event in events:
        schedule = schedule_for(event, tz_name)
        if is_past(schedule, now):
            result[event.id] = (schedule, EventStatus.past)
        else:
            result[event.id] = (schedule, EventStatus.upcoming)
            if event.is_published:
                active.append((sort_key(event, schedule), event))

    if active:
        first = min(active, key=lambda item: item[0])[1]
        result[first.id] = (result[first.id][0], EventStatus.next)
    return result
