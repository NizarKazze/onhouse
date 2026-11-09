"use client";

import { ArtistCard } from "@/components/home/ArtistCard";
import { Reveal } from "@/components/ui/Reveal";
import { contactDetails } from "@/i18n/copy";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Artist } from "@/types";

export function ArtistRows({ artists }: { artists: Artist[] }) {
  const { t } = useLanguage();
  return (
    <section className="onh-gutter-x pb-[clamp(64px,9vw,150px)]">
      {artists.length === 0 ? (
        <div className="onh-shell border-t border-[var(--onh-line)] pt-[clamp(20px,2.8vw,38px)]">
          <p className="m-0 text-[clamp(20px,2.4vw,38px)] font-extrabold tracking-[-0.02em] uppercase">
            {t.noEvents}
          </p>
        </div>
      ) : (
        <div className="onh-shell grid grid-cols-1 gap-x-[clamp(14px,2vw,28px)] gap-y-[clamp(32px,4vw,56px)] border-t border-[var(--onh-line)] pt-[clamp(24px,3vw,44px)] min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {artists.map((artist) => (
            <Reveal key={artist.id}>
              <ArtistCard
                artist={artist}
                sizes="(max-width: 419px) 100vw, (max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
              />
              {artist.nextEvent && (
                <div className="mt-[6px] text-[10.5px] font-semibold tracking-[0.2em] text-[rgba(242,240,238,.42)]">
                  {artist.nextEvent}
                </div>
              )}
            </Reveal>
          ))}
        </div>
      )}

      <div className="onh-shell mt-[clamp(40px,6vw,90px)] flex flex-wrap items-center justify-between gap-[24px] border border-[var(--onh-line)] p-[clamp(26px,3.5vw,52px)]">
        <div
          className="max-w-[26ch] text-[clamp(22px,2.8vw,44px)] leading-none font-black tracking-[-0.02em] uppercase"
          style={{ textWrap: "balance" }}
        >
          {t.bookingCta}
        </div>
        <a
          href={`mailto:${contactDetails.bookingsEmail}`}
          className="onh-btn-solid px-[30px] py-[17px] text-[12px]"
        >
          {t.bookings}
        </a>
      </div>
    </section>
  );
}
