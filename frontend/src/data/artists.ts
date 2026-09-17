import type { Artist } from "@/types";

/**
 * Mock dataset for the artist roster.
 * The design ships every name as TBA — line-ups are only published once a set
 * is confirmed — so the roster carries the slot, number and genre only.
 * Nothing outside `lib/artists.ts` should import this.
 */
export const mockArtists: Artist[] = [
  {
    id: "artist-01",
    num: "01",
    name: "TBA",
    genre: { en: "HOUSE", es: "HOUSE" },
    nextEvent: "ONHOUSE 001",
    slot: "onh-artist-1",
  },
  {
    id: "artist-02",
    num: "02",
    name: "TBA",
    genre: { en: "DEEP HOUSE", es: "DEEP HOUSE" },
    nextEvent: "ONHOUSE 001",
    slot: "onh-artist-2",
  },
  {
    id: "artist-03",
    num: "03",
    name: "TBA",
    genre: { en: "TECH HOUSE", es: "TECH HOUSE" },
    nextEvent: "ONHOUSE 001",
    slot: "onh-artist-3",
  },
  {
    id: "artist-04",
    num: "04",
    name: "TBA",
    genre: { en: "HOUSE", es: "HOUSE" },
    nextEvent: "ONHOUSE 001",
    slot: "onh-artist-4",
  },
  {
    id: "artist-05",
    num: "05",
    name: "TBA",
    genre: { en: "DEEP HOUSE", es: "DEEP HOUSE" },
    nextEvent: "ONHOUSE 001",
    slot: "onh-artist-5",
  },
  {
    id: "artist-06",
    num: "06",
    name: "TBA",
    genre: { en: "TECH HOUSE", es: "TECH HOUSE" },
    nextEvent: "ONHOUSE 001",
    slot: "onh-artist-6",
  },
];
