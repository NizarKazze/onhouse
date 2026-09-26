"use client";

import { SectionLink } from "@/components/layout/SectionLink";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { MetaCell } from "@/components/ui/MetaCell";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useNarrow } from "@/lib/hooks";
import { useStickyProgress } from "@/lib/useStickyProgress";
import type { Event } from "@/types";

/** Stage height, and the scroll distance spent on each additional card. */
const stageHeightFor = (narrow: boolean) =>
  narrow ? "clamp(668px,172vw,760px)" : "clamp(400px,44vw,560px)";
const VH_PER_CARD = { narrow: 66, wide: 76 } as const;

export function EventDeck({ events }: { events: Event[] }) {
  const { t, lang } = useLanguage();
  const narrow = useNarrow();
  const count = events.length;
  const { trackRef, stageRef, dp, goTo } = useStickyProgress(count);

  if (count === 0) {
    return (
      <section id="upcoming" className="onh-gutter-x pb-[clamp(64px,9vw,150px)]">
        <div className="onh-shell">
          <div className="onh-rule-head mb-[clamp(28px,4vw,52px)]">
            <h2 className="m-0 text-[clamp(11px,1.1vw,13px)] font-semibold tracking-[0.34em] text-[rgba(242,240,238,.6)]">
              {t.upcomingTitle}
            </h2>
          </div>
          <p className="m-0 text-[clamp(20px,2.4vw,34px)] font-extrabold tracking-[-0.02em] uppercase">
            {t.noEvents}
          </p>
        </div>
      </section>
    );
  }

  const active = Math.min(count - 1, Math.max(0, Math.round(dp)));
  const offsetX = narrow ? 13 : 30;
  const offsetY = narrow ? 16 : 26;
  const stageHeight = stageHeightFor(narrow);
  const trackHeight = `calc(${stageHeight} + ${
    (count - 1) * (narrow ? VH_PER_CARD.narrow : VH_PER_CARD.wide)
  }vh)`;

  return (
    <section id="upcoming" className="onh-gutter-x pb-[clamp(64px,9vw,150px)]">
      <div className="onh-shell">
        <Reveal className="onh-rule-head mb-[clamp(28px,4vw,52px)]">
          <h2 className="m-0 text-[clamp(11px,1.1vw,13px)] font-semibold tracking-[0.34em] text-[rgba(242,240,238,.6)]">
            {t.upcomingTitle}
          </h2>
          <div className="flex items-center gap-[14px]">
            <span className="text-[10px] font-semibold tracking-[0.28em] text-[rgba(242,240,238,.42)]">
              {t.scroll}
            </span>
            <span className="text-[11px] font-semibold tracking-[0.24em] text-onh-bone">
              {events[active].num} / {events[count - 1].num}
            </span>
          </div>
        </Reveal>

        <div ref={trackRef} className="relative" style={{ height: trackHeight }}>
          <div
            ref={stageRef}
            className="sticky top-[clamp(96px,12vw,150px)]"
          >
            <div className="relative" style={{ height: stageHeight }}>
              {events.map((event, index) => {
                const d = index - dp;
                let x: number;
                let y: number;
                let scale: number;
                let rotate: number;
                let opacity: number;
                let dim: number;

                if (d >= 0) {
                  x = offsetX * d;
                  y = offsetY * d;
                  scale = 1 - 0.05 * d;
                  rotate = -1.1 * d;
                  opacity = d <= 2.5 ? 1 : Math.max(0, 1 - (d - 2.5) / 0.7);
                  dim = Math.min(0.6, Math.max(0, d) * 0.26);
                } else {
                  const k = -d;
                  x = -offsetX * 0.5 * k;
                  y = -96 * k;
                  scale = 1 + 0.045 * k;
                  rotate = 1.5 * k;
                  opacity = Math.max(0, 1 - k * 1.55);
                  dim = 0;
                }

                const clickable = d > 0.4;
                const interactive = Math.abs(d) < 0.4;

                return (
                  <div
                    key={event.id}
                    onClick={clickable ? () => goTo(index) : undefined}
                    className="absolute inset-0 overflow-hidden border border-[var(--onh-line)] bg-onh-black will-change-transform"
                    style={{
                      boxShadow: "0 26px 70px rgba(0,0,0,.5)",
                      transform: `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${scale.toFixed(4)}) rotate(${rotate.toFixed(3)}deg)`,
                      opacity: opacity.toFixed(3),
                      zIndex: 200 - index,
                      cursor: clickable ? "pointer" : "default",
                    }}
                  >
                    <div
                      className="grid h-full"
                      style={{
                        gridTemplateColumns: narrow
                          ? "minmax(0,1fr)"
                          : "minmax(0,.86fr) minmax(0,1.14fr)",
                        gridTemplateRows: narrow
                          ? "clamp(150px,36vw,220px) minmax(0,1fr)"
                          : "minmax(0,1fr)",
                        pointerEvents: interactive ? "auto" : "none",
                      }}
                    >
                      <div className="relative min-h-0 overflow-hidden bg-onh-panel">
                        <div className="absolute inset-0 grayscale contrast-[1.12] brightness-[0.8]">
                          <ImageSlot
                            id={event.slot}
                            sizes="(max-width: 900px) 100vw, 40vw"
                          />
                        </div>
                        <div className="pointer-events-none absolute top-[24px] left-0 bg-onh-bone px-[14px] py-[9px] text-[10.5px] font-bold tracking-[0.24em] text-onh-black">
                          {event.tag[lang]}
                        </div>
                      </div>

                      <div className="flex min-h-0 min-w-0 flex-col justify-between gap-[clamp(16px,2vw,28px)] p-[clamp(20px,2.8vw,44px)]">
                        <div className="flex items-baseline justify-between gap-[16px]">
                          <span className="text-[11px] font-semibold tracking-[0.24em] text-[rgba(242,240,238,.6)]">
                            {event.num}
                          </span>
                          <span className="text-[10.5px] font-semibold tracking-[0.24em] text-[rgba(242,240,238,.45)]">
                            {event.city}
                          </span>
                        </div>

                        <div>
                          <div className="font-display text-[clamp(42px,5.2vw,96px)] leading-[0.84] tracking-[0.01em]">
                            {event.title}
                          </div>
                          <p
                            className="mt-[clamp(12px,1.5vw,22px)] mb-0 max-w-[42ch] text-[clamp(13px,1.05vw,16px)] leading-[1.6] text-[rgba(242,240,238,.74)]"
                            style={{ textWrap: "pretty" }}
                          >
                            {event.description[lang]}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-px bg-[var(--onh-line)]">
                          <MetaCell label={t.date} value={event.date} compact />
                          <MetaCell label={t.venue} value={event.venue} compact />
                        </div>

                        <div className="onh-btn-row [--onh-btn-gap:12px] [--onh-btn-px:26px] [--onh-btn-py:15px] [--onh-btn-fs:11.5px]">
                          <SectionLink
                            href="/#contact"
                            className="onh-btn-solid onh-btn-cta"
                          >
                            {t.tickets}
                          </SectionLink>
                          <SectionLink
                            href="/events"
                            className="onh-btn-ghost onh-btn-cta"
                          >
                            {t.allEvents}
                          </SectionLink>
                        </div>
                      </div>
                    </div>

                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{ background: `rgba(10,10,10,${dim.toFixed(3)})` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-[clamp(16px,2vw,26px)] flex items-center gap-[8px]">
              {events.map((event, index) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={event.title}
                  aria-current={index === active}
                  className="h-[2px] cursor-pointer border-none p-0"
                  style={{
                    background:
                      index === active
                        ? "#F2F0EE"
                        : "rgba(242,240,238,.26)",
                    width: index === active ? "46px" : "20px",
                    transition:
                      "background .35s ease, width .35s var(--onh-ease)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
