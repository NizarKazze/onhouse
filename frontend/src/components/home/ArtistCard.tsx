"use client";

import { ImageSlot } from "@/components/ui/ImageSlot";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Artist } from "@/types";

/** Portrait, number, name and genre — the card used by grid and carousel. */
export function ArtistCard({
  artist,
  sizes,
}: {
  artist: Artist;
  sizes: string;
}) {
  const { lang } = useLanguage();

  return (
    <>
      <div className="relative overflow-hidden bg-onh-panel [aspect-ratio:3/4]">
        <div className="absolute inset-0 grayscale contrast-[1.12] brightness-[0.78]">
          <ImageSlot id={artist.slot} sizes={sizes} />
        </div>
        <div className="font-display pointer-events-none absolute top-[14px] left-[14px] text-[26px] leading-none text-onh-bone">
          {artist.num}
        </div>
      </div>
      <div className="mt-[16px] text-[clamp(20px,2vw,30px)] leading-none font-black tracking-[-0.01em] uppercase">
        {artist.name}
      </div>
      <div className="mt-[8px] text-[10.5px] font-semibold tracking-[0.24em] text-[rgba(242,240,238,.55)]">
        {artist.genre[lang]}
      </div>
    </>
  );
}
