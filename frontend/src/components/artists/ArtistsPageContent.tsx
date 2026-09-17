"use client";

import { ArtistRows } from "@/components/artists/ArtistRows";
import { VctrFocus } from "@/components/artists/VctrFocus";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Artist } from "@/types";

export function ArtistsPageContent({ artists }: { artists: Artist[] }) {
  const { t } = useLanguage();

  return (
    <div className="pt-[var(--onh-nav-h)]">
      <section className="onh-gutter-x pt-[clamp(44px,7vw,110px)] pb-[clamp(30px,4vw,60px)]">
        <div className="onh-shell">
          <div className="onh-kicker mb-[clamp(18px,2.5vw,30px)] text-[rgba(242,240,238,.85)]">
            HOUSE / DEEP HOUSE / TECH HOUSE
          </div>
          <h1 className="m-0 text-[clamp(56px,15vw,260px)] leading-[0.8] font-black tracking-[-0.04em] uppercase">
            {t.navArtists}
          </h1>
          <p
            className="mt-[clamp(24px,3vw,44px)] mb-0 max-w-[44ch] text-[clamp(15px,1.25vw,19px)] leading-[1.62] text-[rgba(242,240,238,.68)]"
            style={{ textWrap: "pretty" }}
          >
            {t.artistsIntro}
          </p>
        </div>
      </section>

      <VctrFocus />
      <ArtistRows artists={artists} />
    </div>
  );
}
