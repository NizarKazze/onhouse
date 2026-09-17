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

/** Past nights. Empty until 001 has happened — the archive's empty state. */
export async function fetchPastEvents(): Promise<Event[]> {
  const events = await fetchEvents();
  return events.filter((event) => event.status === "past");
}
