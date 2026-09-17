"use client";

import Link from "next/link";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useNarrow } from "@/lib/hooks";
import type { Artist } from "@/types";

export function ArtistsPreview({ artists }: { artists: Artist[] }) {
  const { t, lang } = useLanguage();
  const narrow = useNarrow();

  if (artists.length === 0) return null;

  return (
    <section className="onh-gutter-x pt-[clamp(60px,8vw,130px)] pb-[clamp(64px,9vw,150px)]">
      <div className="onh-shell">
        <div className="onh-rule-head mb-[clamp(24px,3vw,44px)]">
          <div className="onh-kicker text-[rgba(242,240,238,.6)]">
            {t.artistsKicker}
          </div>
          <Link
            href="/artists"
            className="onh-link text-[11px] font-semibold tracking-[0.24em] text-onh-bone"
          >
            {t.viewAll} →
          </Link>
        </div>

        <div
          className="grid gap-[clamp(16px,2vw,28px)]"
          style={{ gridTemplateColumns: narrow ? "1fr" : "repeat(3,1fr)" }}
        >
          {artists.map((artist) => (
            <Reveal key={artist.id}>
              <div className="relative overflow-hidden bg-onh-panel [aspect-ratio:3/4]">
                <div className="absolute inset-0 grayscale contrast-[1.12] brightness-[0.78]">
                  <ImageSlot
                    id={artist.slot}
                    sizes="(max-width: 900px) 100vw, 33vw"
                  />
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
