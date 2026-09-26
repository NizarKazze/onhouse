/**
 * Registry for the design's `<image-slot>` placeholders.
 *
 * The design stores each filled slot as an image plus a pan/zoom view
 * (`s`, `x`, `y`). `ImageSlot` reproduces that framing exactly — see the
 * component for the maths.
 *
 * To fill a slot: drop the file in `public/images/` and add `src` here.
 * `caption` is the art-direction note from the design and is what an unfilled
 * slot shows, so the intent survives until the photograph arrives.
 */
export type SlotView = {
  /** Zoom on top of the cover fit. 1 = plain cover. */
  s: number;
  /** Horizontal pan, in % of the frame width. */
  x: number;
  /** Vertical pan, in % of the frame height. */
  y: number;
};

export type Slot = {
  src?: string;
  view?: SlotView;
  caption: string;
  alt: string;
};

export const imageSlots: Record<string, Slot> = {
  "onh-hero": {
    src: "/images/ONHOUSE_12.webp",
    view: { s: 1.1617036742727436, x: -5.302862287927156, y: -0.5682478404051405 },
    caption: "Hero club photograph — dancefloor or booth, flash, high contrast",
    alt: "The ONHOUSE neon sign above a packed DJ booth, shot on flash in black and white",
  },
  "onh-next-poster": {
    src: "/images/onh-next-poster.webp",
    view: { s: 1, x: 0, y: 0 },
    caption: "ONHOUSE 001 poster image",
    alt: "A DJ in sunglasses lit through smoke, black and white",
  },

  "onh-deck-002": { caption: "ONHOUSE 002 poster", alt: "ONHOUSE 002 poster" },
  "onh-deck-003": { caption: "ONHOUSE 003 poster", alt: "ONHOUSE 003 poster" },
  "onh-deck-004": { caption: "ONHOUSE 004 poster", alt: "ONHOUSE 004 poster" },
  "onh-deck-005": { caption: "ONHOUSE 005 poster", alt: "ONHOUSE 005 poster" },

  "onh-about": {
    src: "/images/ONHOUSE_11.webp",
    caption: "Documentary crowd or booth photograph",
    alt: "ONHOUSE crowd photographed from the booth",
  },
  "onh-culture": {
    caption: "Dancefloor photograph — hands, crowd, darkness",
    alt: "Hands raised on a dark dancefloor",
  },

  "onh-artist-1": { caption: "Artist portrait", alt: "Artist portrait" },
  "onh-artist-2": { caption: "Artist portrait", alt: "Artist portrait" },
  "onh-artist-3": { caption: "Artist portrait", alt: "Artist portrait" },
  "onh-artist-4": { caption: "Artist portrait", alt: "Artist portrait" },
  "onh-artist-5": { caption: "Artist portrait", alt: "Artist portrait" },
  "onh-artist-6": { caption: "Artist portrait", alt: "Artist portrait" },

  "onh-ibiza-1": { caption: "Night architecture", alt: "Ibiza night architecture" },
  "onh-ibiza-2": { caption: "Sound system / booth detail", alt: "Sound system detail" },

  "onh-ev-001": {
    caption: "ONHOUSE 001 key visual",
    alt: "ONHOUSE 001 key visual",
  },
  "onh-arch-1": { caption: "Night 01", alt: "ONHOUSE night, archive frame 01" },
  "onh-arch-2": { caption: "Night 02", alt: "ONHOUSE night, archive frame 02" },
  "onh-arch-3": { caption: "Night 03", alt: "ONHOUSE night, archive frame 03" },

  "onh-vctr-1": { src: "/images/ONHOUSE_3.webp", caption: "VCTR — booth", alt: "VCTR in the DJ booth" },
  "onh-vctr-2": { src: "/images/ONHOUSE_2.webp", caption: "VCTR — portrait", alt: "Portrait of VCTR" },
  "onh-vctr-3": { src: "/images/ONHOUSE_4.webp", caption: "VCTR — crowd", alt: "The crowd during a VCTR set" },
  "onh-vctr-4": { src: "/images/ONHOUSE_10.webp", caption: "VCTR — room", alt: "The room during a VCTR set" },

  "onh-footer": {
    caption: "Footer background — wide, dark dancefloor or booth photograph",
    alt: "A dark, wide dancefloor",
  },
};

export function getSlot(id: string): Slot | undefined {
  return imageSlots[id];
}
