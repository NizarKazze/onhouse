"use client";

import { useEffect, useRef, useState } from "react";
import { ArtistCard } from "@/components/home/ArtistCard";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Artist } from "@/types";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Narrow-screen artists: a native scroll-snap strip showing one card with the
 * next one peeking in, plus a counter and prev/next controls. Swiping is the
 * browser's own; the controls just scroll the strip.
 */
export function ArtistsCarousel({ artists }: { artists: Artist[] }) {
  const { t } = useLanguage();
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const count = artists.length;

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = strip.scrollWidth - strip.clientWidth;
      const first = strip.children[0] as HTMLElement | undefined;
      const second = strip.children[1] as HTMLElement | undefined;
      if (!first) return;
      const step = second
        ? second.offsetLeft - first.offsetLeft
        : first.offsetWidth;
      // The last card can never reach the snap start, so the end of the
      // strip counts as the last card.
      setActive(
        strip.scrollLeft >= max - 2
          ? count - 1
          : Math.round(strip.scrollLeft / step),
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    strip.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      strip.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [count]);

  const goTo = (index: number) => {
    const strip = stripRef.current;
    const card = strip?.children[index] as HTMLElement | undefined;
    if (!strip || !card) return;
    const first = strip.children[0] as HTMLElement;
    strip.scrollTo({
      left: card.offsetLeft - first.offsetLeft,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <div
        ref={stripRef}
        className="-mx-[var(--onh-gutter)] flex snap-x snap-mandatory scroll-px-[var(--onh-gutter)] gap-[14px] overflow-x-auto px-[var(--onh-gutter)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
      >
        {artists.map((artist, index) => (
          <div
            key={artist.id}
            className="w-[min(78%,420px)] flex-none snap-start"
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${count}`}
          >
            <ArtistCard artist={artist} sizes="80vw" />
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="mt-[clamp(22px,6vw,32px)] flex items-center justify-between gap-[18px] border-t border-[var(--onh-line)] pt-[16px]">
          <span className="text-[11px] font-semibold tracking-[0.24em] text-onh-bone">
            {pad(active + 1)}{" "}
            <span className="text-[rgba(242,240,238,.42)]">/ {pad(count)}</span>
          </span>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              aria-label={t.prevPage}
              className="onh-btn-ghost h-[44px] w-[48px] cursor-pointer bg-transparent font-sans text-[15px] tracking-normal disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active === count - 1}
              aria-label={t.nextPage}
              className="onh-btn-ghost h-[44px] w-[48px] cursor-pointer bg-transparent font-sans text-[15px] tracking-normal disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
