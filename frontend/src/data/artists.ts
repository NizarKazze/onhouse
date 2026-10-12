import type { ApiArtist } from "@/lib/api";

/**
 * Fallback roster used only when `API_URL` is not configured. Same shape as
 * `GET /api/artists`. The design ships every name as TBA — line-ups are only
 * published once a set is confirmed.
 * Nothing outside `lib/artists.ts` should import this.
 */
export const mockArtists: ApiArtist[] = [
  {
    id: 1,
    name: "TBA",
    genre: "HOUSE",
    description: null,
    imageUrl: null,
    links: [],
    nextEvent: { id: 1, number: 1, title: "ONHOUSE 001" },
  },
  {
    id: 2,
    name: "TBA",
    genre: "DEEP HOUSE",
    description: null,
    imageUrl: null,
    links: [],
    nextEvent: { id: 1, number: 1, title: "ONHOUSE 001" },
  },
  {
    id: 3,
    name: "TBA",
    genre: "TECH HOUSE",
    description: null,
    imageUrl: null,
    links: [],
    nextEvent: { id: 1, number: 1, title: "ONHOUSE 001" },
  },
  {
    id: 4,
    name: "TBA",
    genre: "HOUSE",
    description: null,
    imageUrl: null,
    links: [],
    nextEvent: { id: 1, number: 1, title: "ONHOUSE 001" },
  },
  {
    id: 5,
    name: "TBA",
    genre: "DEEP HOUSE",
    description: null,
    imageUrl: null,
    links: [],
    nextEvent: { id: 1, number: 1, title: "ONHOUSE 001" },
  },
  {
    id: 6,
    name: "TBA",
    genre: "TECH HOUSE",
    description: null,
    imageUrl: null,
    links: [],
    nextEvent: { id: 1, number: 1, title: "ONHOUSE 001" },
  },
];
