export type Locale = "en" | "es";

/** A string that exists in both site languages. */
export type Localized = Record<Locale, string>;

/**
 * Where an event sits in the ONHOUSE timeline.
 * - `next`     the headline event (001) — featured on the home page and /events
 * - `upcoming` announced but not yet the next one
 * - `past`     archived; the archive is empty until 001 has happened
 */
export type EventStatus = "next" | "upcoming" | "past";

export type Event = {
  id: string;
  /** Editorial number shown as a graphic element, e.g. "001". */
  num: string;
  title: string;
  city: string;
  /** Kept as free text: the design shows "TBA" until a date is confirmed. */
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
  /** Image-slot id; resolved to a file by `lib/images.ts`. */
  slot: string;
};

export type Artist = {
  id: string;
  num: string;
  name: string;
  genre: Localized;
  /** The ONHOUSE night this artist is booked for, if any. */
  nextEvent: string | null;
  slot: string;
};
