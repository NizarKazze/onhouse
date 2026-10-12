/**
 * Server-side reads from the ONHOUSE API (public, published content only).
 *
 * `API_URL` is the backend origin, e.g. https://api.onhouse.es. It is read on
 * the server only and never shipped to the browser. When it is not set the
 * data layer falls back to the bundled mock data, so the site still runs
 * without a backend in local development.
 */

/** How long a rendered page may serve cached API data before refreshing. */
export const API_REVALIDATE_SECONDS = 60;

export function apiConfigured(): boolean {
  return Boolean(process.env.API_URL);
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** GET a public endpoint. Returns `null` on 404; throws on anything else. */
export async function apiGet<T>(path: string): Promise<T | null> {
  const base = process.env.API_URL?.replace(/\/+$/, "");
  if (!base) throw new ApiError("API_URL is not configured", 0);

  const response = await fetch(`${base}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: API_REVALIDATE_SECONDS },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    // With ISR a thrown error keeps the last good page online.
    throw new ApiError(`API ${path} failed with ${response.status}`, response.status);
  }
  return (await response.json()) as T;
}

// --- API response shapes (mirror backend/app/schemas) ----------------------

export type ApiEvent = {
  id: number;
  number: number;
  title: string;
  city: string;
  venue: string | null;
  date: string | null;
  doorsOpen: string | null;
  doorsClose: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: "next" | "upcoming" | "past";
  description: { en: string; es: string };
  imageUrl: string | null;
  ticketUrl: string | null;
  artists: { id: number; name: string; genre: string }[];
};

export type ApiArtist = {
  id: number;
  name: string;
  genre: string;
  description: { en: string; es: string } | null;
  imageUrl: string | null;
  links: { platform: string; url: string }[];
  nextEvent: { id: number; number: number; title: string } | null;
};
