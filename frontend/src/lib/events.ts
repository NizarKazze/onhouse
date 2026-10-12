import { cache } from "react";
import { mockEvents } from "@/data/events";
import { apiConfigured, apiGet, type ApiEvent } from "@/lib/api";
import type { Event, Localized } from "@/types";

/**
 * Data access for events.
 *
 * Reads `GET /api/events` from the backend (or the bundled mock data when
 * `API_URL` is not set) and resolves each record into the display-ready
 * `Event` the components render. Components never see the API shape.
 */

const TBA = "TBA";

const TAGS: Record<Event["status"], Localized> = {
  next: { en: "UPCOMING", es: "PRÓXIMO" },
  upcoming: { en: "UPCOMING", es: "PRÓXIMO" },
  past: { en: "PAST", es: "PASADO" },
};

/** "2026-07-12" → "12.07.2026". Language-neutral, like the rest of the meta. */
function formatDate(iso: string | null): string {
  if (!iso) return TBA;
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

function formatDoors(open: string | null, close: string | null): string {
  if (open && close) return `${open} — ${close}`;
  return open ?? close ?? TBA;
}

/** Billing order; placeholder "TBA" artists don't count as announced names. */
function formatLineup(artists: ApiEvent["artists"]): string {
  const names = artists
    .map((artist) => artist.name)
    .filter((name) => name.trim().toUpperCase() !== TBA);
  return names.length > 0 ? names.join(" / ") : TBA;
}

export function toEvent(event: ApiEvent): Event {
  return {
    id: event.id,
    num: String(event.number).padStart(3, "0"),
    title: event.title,
    city: event.city,
    date: formatDate(event.date),
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    venue: event.venue ?? TBA,
    doors: formatDoors(event.doorsOpen, event.doorsClose),
    lineup: formatLineup(event.artists),
    status: event.status,
    tag: TAGS[event.status],
    description: event.description,
    image: event.imageUrl,
    ticketUrl: event.ticketUrl,
  };
}

/** One request per render, however many helpers ask for the list. */
const loadEvents = cache(async (): Promise<ApiEvent[]> => {
  if (!apiConfigured()) return mockEvents;
  return (await apiGet<ApiEvent[]>("/api/events")) ?? [];
});

/** Every published event, already in schedule order from the API. */
export async function fetchEvents(): Promise<Event[]> {
  return (await loadEvents()).map(toEvent);
}

export async function fetchEventById(id: number): Promise<Event | null> {
  if (!apiConfigured()) {
    const event = mockEvents.find((item) => item.id === id);
    return event ? toEvent(event) : null;
  }
  const event = await apiGet<ApiEvent>(`/api/events/${encodeURIComponent(id)}`);
  return event ? toEvent(event) : null;
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
 * Checked again here because a cached page can outlive the API's verdict.
 */
export function isExpired(event: Event, now: Date = new Date()): boolean {
  if (event.status === "past") return true;
  if (!event.endsAt) return false;
  return new Date(event.endsAt).getTime() < now.getTime();
}

/** Every event that has not ended yet, soonest first. */
export async function fetchActiveEvents(now: Date = new Date()): Promise<Event[]> {
  const events = await fetchEvents();
  return events.filter((event) => !isExpired(event, now));
}

/** Past nights, most recent first. Empty until 001 has happened. */
export async function fetchPastEvents(now: Date = new Date()): Promise<Event[]> {
  const events = await fetchEvents();
  return events.filter((event) => isExpired(event, now)).reverse();
}
