import { mockArtists } from "@/data/artists";
import type { Artist } from "@/types";

/**
 * Data access for artists. Same contract as `lib/events.ts`: swap the bodies
 * for `fetch('/api/artists')` when the backend exists.
 */

export async function fetchArtists(): Promise<Artist[]> {
  return mockArtists;
}

export async function fetchArtistById(id: string): Promise<Artist | null> {
  return mockArtists.find((artist) => artist.id === id) ?? null;
}

/** The first `count` artists — the home page shows a three-up preview. */
export async function fetchArtistsPreview(count = 3): Promise<Artist[]> {
  const artists = await fetchArtists();
  return artists.slice(0, count);
}
