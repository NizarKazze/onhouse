# ONHOUSE

Front-end implementation of the ONHOUSE Claude Design project (`ONHOUSE.dc.html`).

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4.

## Running

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run build && npm start
npm run lint
npx tsc --noEmit
```

## Routes

| Route      | Content                                                              |
| ---------- | -------------------------------------------------------------------- |
| `/`        | Hero · Next event · Upcoming deck · About · The Sound · Club culture · The Experience · Artists preview · Ibiza after dark · Contact |
| `/events`  | Events header · ONHOUSE 001 feature · Upcoming rows · Archive (empty state) |
| `/artists` | Artists header · VCTR in focus · Artist roster · Booking CTA          |

The design drives navigation from a `page` state variable; here those are real
routes. In-page targets (`#about`, `#experience`, `#contact`, `#next`) scroll
with the fixed header's height subtracted, as the design does.

## Structure

```
src/
  app/          routes, root layout, error and not-found states
  components/
    layout/     header, footer, grain overlay, link + hash-scroll helpers
    home/       one component per home-page section
    events/     events page
    artists/    VCTR collage, artist roster
    ui/         ImageSlot, Reveal, MetaCell, LoadingScreen, StatusScreen
  data/         mock records (the future database)
  lib/          data access, image-slot registry, shared hooks
  i18n/         EN/ES copy and the language store
  types/        Event, Artist, Locale
```

## Data

One entity, `Event` (`src/types/index.ts`), plus `Artist`.

Components never touch `src/data/*`. They receive data from the access layer
in `src/lib/events.ts` and `src/lib/artists.ts`:

```ts
fetchEvents();        fetchEventById(id);
fetchNextEvent();     fetchUpcomingEvents();   fetchPastEvents();
fetchArtists();       fetchArtistById(id);     fetchArtistsPreview(n);
```

Each function currently returns from the mock array. Swapping a body for
`fetch('/api/events')` is the only change needed when the backend lands.

Text that differs per language is stored as `Record<Locale, string>` on the
record itself, so pages stay server components and the client picks the locale.

## Images

The design's `<image-slot>` placeholders are reproduced by
`components/ui/ImageSlot.tsx`, backed by the registry in `lib/images.ts`.

Two photographs were recovered from the design and are wired up
(`onh-hero`, `onh-next-poster`); the rest of the slots render a dark plate
carrying their art-direction note, so every composition holds its shape.

To fill a slot, drop the file in `public/images/` and set `src` on its entry:

```ts
"onh-about": {
  src: "/images/onh-about.webp",
  view: { s: 1, x: 0, y: 0 },   // optional zoom / pan, as in the design
  caption: "...",
  alt: "...",
},
```

`view` mirrors the design's framing model: a cover fit, scaled by `s`, panned
by `x`/`y` as a percentage of the frame.

## Notes on the design

- **Palette and type** come from the design: black `#0A0A0A`, bone `#F2F0EE`,
  grayscale photography, Jost + Bebas Neue. The brand brief also mentions a red
  accent and Gilroy; the design uses neither, and the design is the source of
  truth.
- **Tokens** live as CSS variables and `@theme` entries in `app/globals.css`.
  Base element styles sit in `@layer base` — unlayered rules would outrank
  every layered component style.
- **Fluid sizing** uses the design's `clamp()` values verbatim, as Tailwind
  arbitrary values. Recurring primitives (`.onh-btn-solid`, `.onh-kicker`,
  `.onh-shell`, …) are component classes.
- **`useNarrow()`** is the design's single `max-width: 900px` breakpoint. It
  drives layout *and* the scroll maths, so it is a hook rather than a CSS
  breakpoint.
- **Reveal-on-scroll** ports both of the design's mechanisms: an
  IntersectionObserver, and a scroll "sweep" that only tests the vertical axis.
  The sweep is load-bearing — the Experience numerals start at
  `translateX(46vw)` and never intersect the viewport.
