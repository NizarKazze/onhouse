import { mockEvents } from "@/data/events";
import type { Event } from "@/types";

/**
 * Data access for events.
 *
 * Today these read a hardcoded array. When the backend lands, each body is
 * replaced with a `fetch('/api/events')` call and nothing in the UI changes —
 * components only ever see the returned `Event` objects.
 */

export async function fetchEvents(): Promise<Event[]> {
  return mockEvents;
}

export async function fetchEventById(id: string): Promise<Event | null> {
  return mockEvents.find((event) => event.id === id) ?? null;
}

/** The headline event — the one the home hero and /events lead with. */
export async function fetchNextEvent(): Promise<Event | null> {
  const events = await fetchEvents();
  return events.find((event) => event.status === "next") ?? null;
}

/** Everything announced after the next event, in order. */
export async function fetchUpcomingEvents(): Promise<Event[]> {
  const events = await fetchEvents();
  return events.filter((event) => event.status === "upcoming");
}

/**
 * An event has expired once it is archived or its end time has passed.
 * Events without an `endsAt` (date TBA) are still to come.
 */
export function isExpired(event: Event, now: Date = new Date()): boolean {
  if (event.status === "past") return true;
  if (!event.endsAt) return false;
  return new Date(event.endsAt).getTime() < now.getTime();
}

/** Soonest first; TBA dates after every dated event, in editorial order. */
function compareBySchedule(a: Event, b: Event): number {
  if (a.startsAt && b.startsAt) {
    const diff = new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    if (diff !== 0) return diff;
  } else if (a.startsAt) {
    return -1;
  } else if (b.startsAt) {
    return 1;
  }
  return a.num.localeCompare(b.num, undefined, { numeric: true });
}

/** Every event that has not ended yet, soonest first. */
export async function fetchActiveEvents(now: Date = new Date()): Promise<Event[]> {
  const events = await fetchEvents();
  return events
    .filter((event) => !isExpired(event, now))
    .sort(compareBySchedule);
}

/** Past nights. Empty until 001 has happened — the archive's empty state. */
export async function fetchPastEvents(): Promise<Event[]> {
  const events = await fetchEvents();
  return events.filter((event) => event.status === "past");
}
