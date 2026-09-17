"use client";

import { SectionLink } from "@/components/layout/SectionLink";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useNarrow } from "@/lib/hooks";
import type { Event } from "@/types";

type EventsPageContentProps = {
  nextEvent: Event | null;
  upcoming: Event[];
  past: Event[];
};

export function EventsPageContent({
  nextEvent,
  upcoming,
  past,
}: EventsPageContentProps) {
  const { t, lang } = useLanguage();
  const narrow = useNarrow();

  const halfCols = narrow ? "1fr" : "1fr 1fr";
  const rowCols = narrow
    ? "auto 1fr"
    : "clamp(56px,5vw,90px) minmax(0,1fr) 160px 140px";
  const sectionHead =
    "onh-kicker mb-[clamp(24px,3vw,44px)] border-b border-[var(--onh-line)] pb-[18px] text-[rgba(242,240,238,.6)]";

  return (
    <div className="pt-[var(--onh-nav-h)]">
      <section className="onh-gutter-x pt-[clamp(44px,7vw,110px)] pb-[clamp(30px,4vw,60px)]">
        <div className="onh-shell">
          <div className="onh-kicker mb-[clamp(18px,2.5vw,30px)] text-[rgba(242,240,238,.85)]">
            IBIZA · 2026
          </div>
          <h1 className="m-0 text-[clamp(56px,15vw,260px)] leading-[0.8] font-black tracking-[-0.04em] uppercase">
            {t.navEvents}
          </h1>
          <p
            className="mt-[clamp(24px,3vw,44px)] mb-0 max-w-[44ch] text-[clamp(15px,1.25vw,19px)] leading-[1.62] text-[rgba(242,240,238,.68)]"
            style={{ textWrap: "pretty" }}
          >
            {t.eventsIntro}
          </p>
        </div>
      </section>

      <section className="onh-gutter-x pb-[clamp(50px,7vw,110px)]">
        <div className="onh-shell">
          <div className={sectionHead}>{t.upcoming}</div>

          {nextEvent ? (
            <div
              className="mb-[clamp(28px,4vw,56px)] grid items-stretch gap-[clamp(24px,3vw,52px)]"
              style={{ gridTemplateColumns: halfCols }}
            >
              <div className="relative min-h-[280px] overflow-hidden bg-onh-panel [aspect-ratio:16/11]">
                <div className="absolute inset-0 grayscale contrast-[1.12] brightness-[0.8]">
                  <ImageSlot
                    id="onh-ev-001"
                    priority
                    sizes="(max-width: 900px) 100vw, 50vw"
                  />
                </div>
                <div className="pointer-events-none absolute top-[24px] left-0 bg-onh-bone px-[14px] py-[9px] text-[10.5px] font-bold tracking-[0.24em] text-onh-black">
                  NEXT
                </div>
              </div>

              <div className="flex flex-col justify-center gap-[clamp(18px,2.4vw,30px)]">
                <div className="font-display text-[clamp(52px,8vw,124px)] leading-[0.82]">
                  {nextEvent.title}
                </div>
                <div className="flex flex-wrap gap-[26px] text-[12px] font-semibold tracking-[0.2em] text-[rgba(242,240,238,.7)]">
                  <span>{nextEvent.city}</span>
                  <span>
                    {t.date} {nextEvent.date}
                  </span>
                  <span>
                    {t.venue} {nextEvent.venue}
                  </span>
                  <span>{nextEvent.doors}</span>
                </div>
                <p
                  className="m-0 max-w-[42ch] text-[15px] leading-[1.6] text-[rgba(242,240,238,.65)]"
                  style={{ textWrap: "pretty" }}
                >
                  {nextEvent.description[lang]}
                </p>
                <div className="flex flex-wrap gap-[14px]">
                  <SectionLink
                    href="/#contact"
                    className="onh-btn-solid px-[28px] py-[16px] text-[12px]"
                  >
                    {t.tickets}
                  </SectionLink>
                </div>
              </div>
            </div>
          ) : (
            <p className="mb-[clamp(28px,4vw,56px)] text-[clamp(20px,2.4vw,38px)] font-extrabold tracking-[-0.02em] uppercase">
              {t.noEvents}
            </p>
          )}

          {upcoming.length > 0 && (
            <div className="border-t border-[var(--onh-line)]">
              {upcoming.map((event) => (
                <div
                  key={event.id}
                  className="grid items-baseline gap-[clamp(12px,2vw,28px)] border-b border-[var(--onh-line)] py-[clamp(20px,2.6vw,34px)] transition-colors duration-300 hover:bg-[rgba(242,240,238,.04)]"
                  style={{ gridTemplateColumns: rowCols }}
                >
                  <div className="font-display text-[clamp(28px,3.4vw,56px)] leading-[0.9] text-[rgba(242,240,238,.4)]">
                    {event.num}
                  </div>
                  <div className="text-[clamp(20px,2.4vw,38px)] leading-none font-black tracking-[-0.02em] uppercase">
                    {event.title}
                  </div>
                  <div className="text-[11.5px] font-semibold tracking-[0.2em] text-[rgba(242,240,238,.6)]">
                    {event.city} — {t.date} {event.date}
                  </div>
                  <div className="text-[11.5px] font-semibold tracking-[0.2em] text-onh-bone">
                    {event.tag[lang]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="onh-gutter-x pb-[clamp(64px,9vw,150px)]">
        <div className="onh-shell">
          <div className={sectionHead}>{t.archive}</div>
          <div
            className="grid items-center gap-[clamp(28px,4vw,64px)]"
            style={{ gridTemplateColumns: halfCols }}
          >
            <div>
              <div
                className="text-[clamp(34px,5vw,84px)] leading-[0.9] font-black tracking-[-0.03em] uppercase"
                style={{ textWrap: "balance" }}
              >
                {t.archiveTitle}
              </div>
              <p
                className="mt-[clamp(20px,2.5vw,34px)] mb-0 max-w-[40ch] text-[15px] leading-[1.6] text-[rgba(242,240,238,.65)]"
                style={{ textWrap: "pretty" }}
              >
                {t.archiveBody}
              </p>
            </div>

            {/* The archive is empty until 001 has happened: the design shows
                three plates as a placeholder for the documentation to come. */}
            <div className="grid grid-cols-3 gap-[10px]">
              {(past.length > 0
                ? past.slice(0, 3).map((event) => event.slot)
                : ["onh-arch-1", "onh-arch-2", "onh-arch-3"]
              ).map((slot) => (
                <div
                  key={slot}
                  className="relative overflow-hidden grayscale contrast-[1.15] brightness-[0.8] [aspect-ratio:2/3]"
                >
                  <ImageSlot id={slot} sizes="(max-width: 900px) 33vw, 17vw" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
