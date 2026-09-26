"use client";

import Link from "next/link";
import { ArtistCard } from "@/components/home/ArtistCard";
import { ArtistsCarousel } from "@/components/home/ArtistsCarousel";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useNarrow } from "@/lib/hooks";
import type { Artist } from "@/types";

export function ArtistsPreview({ artists }: { artists: Artist[] }) {
  const { t } = useLanguage();
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

        {narrow ? (
          <ArtistsCarousel artists={artists} />
        ) : (
          <div
            className="grid gap-[clamp(16px,2vw,28px)]"
            style={{ gridTemplateColumns: "repeat(3,1fr)" }}
          >
            {artists.map((artist) => (
              <Reveal key={artist.id}>
                <ArtistCard artist={artist} sizes="33vw" />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
