"use client";

import { useState } from "react";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { contactDetails } from "@/i18n/copy";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useNarrow } from "@/lib/hooks";
import type { Artist } from "@/types";

export function ArtistRows({ artists }: { artists: Artist[] }) {
  const { t } = useLanguage();
  const narrow = useNarrow();
  const [hovered, setHovered] = useState(-1);

  const rowCols = narrow
    ? "auto 1fr"
    : "clamp(56px,5vw,90px) minmax(0,1fr) 160px 140px";

  return (
    <section className="onh-gutter-x pb-[clamp(64px,9vw,150px)]">
      {artists.length === 0 ? (
        <div className="onh-shell border-t border-[var(--onh-line)] pt-[clamp(20px,2.8vw,38px)]">
          <p className="m-0 text-[clamp(20px,2.4vw,38px)] font-extrabold tracking-[-0.02em] uppercase">
            {t.noEvents}
          </p>
        </div>
      ) : (
        <div className="onh-shell border-t border-[var(--onh-line)]">
          {artists.map((artist, index) => {
            const isHovered = hovered === index;

            return (
              <div
                key={artist.id}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(-1)}
                className="relative grid items-center gap-[clamp(12px,2vw,28px)] border-b border-[var(--onh-line)] py-[clamp(20px,2.8vw,38px)]"
                style={{
                  gridTemplateColumns: rowCols,
                  background: isHovered
                    ? "rgba(242,240,238,.04)"
                    : "transparent",
                  transition: "background .45s ease",
                }}
              >
                <div
                  className="font-display text-[clamp(28px,3.4vw,56px)] leading-[0.9]"
                  style={{
                    color: isHovered ? "#F2F0EE" : "rgba(242,240,238,.35)",
                    transition: "color .45s ease",
                  }}
                >
                  {artist.num}
                </div>

                <div
                  className="text-[clamp(24px,4vw,64px)] leading-[0.94] font-black uppercase"
                  style={{
                    letterSpacing: isHovered ? ".02em" : "-.02em",
                    transition: "letter-spacing .5s var(--onh-ease)",
                  }}
                >
                  {artist.name}
                </div>

                <div className="text-[11.5px] font-semibold tracking-[0.2em] text-[rgba(242,240,238,.6)]">
                  {artist.genre}
                </div>

                <div className="text-[11.5px] font-semibold tracking-[0.2em] text-[rgba(242,240,238,.45)]">
                  {artist.nextEvent ?? ""}
                </div>

                {/* Portrait that fades in on hover. Pointer-driven, so it is
                    dropped entirely on narrow layouts. */}
                {!narrow && (
                  <div
                    className="pointer-events-none absolute top-1/2 right-[clamp(90px,14vw,220px)] h-[clamp(150px,17vw,230px)] w-[clamp(120px,13vw,180px)] overflow-hidden"
                    style={{
                      transform: "translateY(-50%)",
                      opacity: isHovered ? 1 : 0,
                      transition: "opacity .5s ease",
                    }}
                    aria-hidden="true"
                  >
                    <div className="absolute inset-0 grayscale contrast-[1.15] brightness-[0.75]">
                      <ImageSlot
                        src={artist.image}
                        caption="Artist portrait"
                        alt=""
                        sizes="180px"
                      />
                    </div>
                    <div className="absolute inset-0 bg-[rgba(10,10,10,.35)] mix-blend-multiply" />
                  </div>
                )}
              </div>
            );
          })}
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
