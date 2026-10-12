import { cache } from "react";
import { mockArtists } from "@/data/artists";
import { apiConfigured, apiGet, type ApiArtist } from "@/lib/api";
import type { Artist } from "@/types";

/**
 * Data access for artists. Same contract as `lib/events.ts`: reads
 * `GET /api/artists` (or the mock data without `API_URL`) and resolves the
 * display-ready `Artist` the components render.
 */

/** The roster number is the artist's position in the published order. */
function toArtist(artist: ApiArtist, index: number): Artist {
  return {
    id: artist.id,
    num: String(index + 1).padStart(2, "0"),
    name: artist.name,
    genre: artist.genre,
    nextEvent: artist.nextEvent?.title ?? null,
    image: artist.imageUrl,
  };
}

/** One request per render, however many helpers ask for the list. */
const loadArtists = cache(async (): Promise<ApiArtist[]> => {
  if (!apiConfigured()) return mockArtists;
  return (await apiGet<ApiArtist[]>("/api/artists")) ?? [];
});

export async function fetchArtists(): Promise<Artist[]> {
  return (await loadArtists()).map(toArtist);
}

export async function fetchArtistById(id: number): Promise<Artist | null> {
  const artists = await fetchArtists();
  return artists.find((artist) => artist.id === id) ?? null;
}

/** The first `count` artists — the home page shows a three-up preview. */
export async function fetchArtistsPreview(count = 3): Promise<Artist[]> {
  const artists = await fetchArtists();
  return artists.slice(0, count);
}
