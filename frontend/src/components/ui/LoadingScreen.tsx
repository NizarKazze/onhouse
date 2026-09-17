"use client";

import { useLanguage } from "@/i18n/LanguageProvider";

/**
 * Loading state for the pages, in the design's editorial language.
 *
 * Deliberately not wired up as `app/loading.tsx` yet. Every route is
 * prerendered and the data-access layer resolves from memory, so a root
 * `loading.tsx` would wrap all three pages in a Suspense boundary and ship
 * this fallback *instead of* the page content in the static HTML — the real
 * markup would only appear once React resolved the boundary on the client.
 * That costs LCP and breaks the page entirely without JavaScript, to cover a
 * wait that never happens.
 *
 * Once `lib/events.ts` and `lib/artists.ts` talk to a real backend, attach it
 * either as `app/loading.tsx`, or — better — around just the slow part:
 *
 *   <Suspense fallback={<LoadingScreen />}>
 *     <EventList />
 *   </Suspense>
 */
export function LoadingScreen() {
  const { t } = useLanguage();

  return (
    <section
      className="onh-gutter-x flex min-h-[70vh] items-center pt-[var(--onh-nav-h)]"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="onh-shell w-full">
        <div className="flex items-center gap-[12px]">
          <span className="h-[7px] w-[7px] animate-[onh-blink_2.4s_ease-in-out_infinite] rounded-full bg-onh-bone" />
          <span className="onh-kicker text-[rgba(242,240,238,.7)]">
            {t.loading}
          </span>
        </div>

        {/* Skeleton echoing the page headers: a display line, then a rule. */}
        <div className="mt-[clamp(24px,3vw,44px)] h-[clamp(56px,15vw,260px)] w-full max-w-[9ch] animate-pulse bg-[rgba(242,240,238,.08)]" />
        <div className="mt-[clamp(24px,3vw,44px)] h-[1px] w-full bg-[var(--onh-line)]" />
        <div className="mt-[clamp(24px,3vw,44px)] flex flex-col gap-[12px]">
          <div className="h-[14px] w-full max-w-[44ch] animate-pulse bg-[rgba(242,240,238,.06)]" />
          <div className="h-[14px] w-full max-w-[36ch] animate-pulse bg-[rgba(242,240,238,.06)]" />
        </div>
      </div>
    </section>
  );
}
