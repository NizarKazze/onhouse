"use client";

import { SectionLink } from "@/components/layout/SectionLink";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { TicketLink } from "@/components/ui/TicketLink";
import { MetaCell } from "@/components/ui/MetaCell";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useNarrow } from "@/lib/hooks";
import type { Event } from "@/types";

export function NextEvent({ event }: { event: Event | null }) {
  const { t, lang } = useLanguage();
  const narrow = useNarrow();

  if (!event) {
    return (
      <section
        id="next"
        className="onh-gutter-x py-[clamp(64px,9vw,150px)]"
      >
        <div className="onh-shell">
          <div className="onh-rule-head mb-[clamp(28px,4vw,52px)]">
            <h2 className="m-0 text-[clamp(11px,1.1vw,13px)] font-semibold tracking-[0.34em] text-[rgba(242,240,238,.6)]">
              {t.nextEvent}
            </h2>
          </div>
          <p className="m-0 text-[clamp(20px,2.4vw,34px)] font-extrabold tracking-[-0.02em] uppercase">
            {t.noEvents}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="next" className="onh-gutter-x py-[clamp(64px,9vw,150px)]">
      <div className="onh-shell">
        <Reveal className="onh-rule-head mb-[clamp(28px,4vw,52px)]">
          <h2 className="m-0 text-[clamp(11px,1.1vw,13px)] font-semibold tracking-[0.34em] text-[rgba(242,240,238,.6)]">
            {t.nextEvent}
          </h2>
          <span className="text-[11px] font-semibold tracking-[0.24em] text-onh-bone">
            {event.num}
          </span>
        </Reveal>

        <Reveal
          delay={0.1}
          className="grid items-stretch gap-[clamp(24px,3vw,52px)]"
          style={{
            gridTemplateColumns: narrow
              ? "1fr"
              : "minmax(0,0.85fr) minmax(0,1.15fr)",
          }}
        >
          <div className="relative self-center overflow-hidden bg-onh-panel [aspect-ratio:16/9]">
            <div className="absolute inset-0 grayscale contrast-[1.12] brightness-[0.8]">
              <ImageSlot
                src={event.image}
                caption={`${event.title} poster`}
                alt={`${event.title} poster`}
                sizes="(max-width: 900px) 100vw, 45vw"
              />
            </div>
            <div className="pointer-events-none absolute top-[26px] left-0 bg-onh-bone px-[14px] py-[9px] text-[10.5px] font-bold tracking-[0.24em] text-onh-black">
              {event.tag[lang]}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-[clamp(20px,2.4vw,32px)]">
            <div>
              <div className="font-display text-[clamp(64px,12vw,168px)] leading-[0.82] tracking-[0.01em]">
                {event.title}
              </div>
              <div className="mt-[clamp(16px,2vw,26px)] text-[clamp(18px,2.4vw,34px)] font-light tracking-[0.06em] uppercase">
                {event.city}
              </div>
            </div>

            <div
              className="grid gap-px bg-[var(--onh-line)]"
              style={{
                gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
              }}
            >
              <MetaCell label={t.date} value={event.date} />
              <MetaCell label={t.venue} value={event.venue} />
              <MetaCell label={t.time} value={event.doors} />
              <MetaCell label={t.lineup} value={event.lineup} />
            </div>

            <div className="onh-btn-row mt-[clamp(2px,0.4vw,6px)]">
              <TicketLink
                href={event.ticketUrl}
                className="onh-btn-solid onh-btn-cta [--onh-btn-px:30px]"
              >
                {t.tickets}
              </TicketLink>
              <SectionLink
                href="/events"
                className="onh-btn-ghost onh-btn-cta [--onh-btn-px:30px]"
              >
                {t.allEvents}
              </SectionLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
