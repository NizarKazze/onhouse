export type Locale = "en" | "es";

/** A string that exists in both site languages. */
export type Localized = Record<Locale, string>;

/**
 * Where an event sits in the ONHOUSE timeline. Derived by the API from the
 * date, never stored:
 * - `next`     the headline event — the first published one still to come
 * - `upcoming` announced but not yet the next one
 * - `past`     the night has ended; feeds the archive
 */
export type EventStatus = "next" | "upcoming" | "past";

/** An event as the UI renders it (display strings already resolved). */
export type Event = {
  id: number;
  /** Editorial number shown as a graphic element, e.g. "001". */
  num: string;
  title: string;
  city: string;
  /** Display date, or "TBA" until one is confirmed. */
  date: string;
  /**
   * Machine-readable start/end (ISO 8601), or `null` while the date is TBA.
   * `date` stays the display string; these drive sorting and expiry.
   */
  startsAt: string | null;
  endsAt: string | null;
  venue: string;
  doors: string;
  lineup: string;
  status: EventStatus;
  /** Badge over the poster, e.g. UPCOMING / PRÓXIMO. */
  tag: Localized;
  description: Localized;
  /** Poster: an https URL or a file under /images, or null for the placeholder. */
  image: string | null;
  /** External ticketing page, when there is one. */
  ticketUrl: string | null;
};

export type Artist = {
  id: number;
  num: string;
  name: string;
  genre: string;
  /** The ONHOUSE night this artist is booked for, if any. */
  nextEvent: string | null;
  image: string | null;
};
