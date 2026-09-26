"use client";

import { ExperienceIntro } from "@/components/home/ExperienceIntro";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useStickyProgress } from "@/lib/useStickyProgress";

const RULE = "1px solid rgba(10,10,10,.4)";
/** Vertical scroll spent moving from one numeral to the next. */
const SVH_PER_PILLAR = 90;
/**
 * The numeral is sized off the viewport, not its column, so it is always far
 * wider than the space it sits in and runs off the right edge — the mobile
 * take on the desktop's oversized "horizon" numerals.
 */
const NUMBER_SIZE = "min(130vw, 52svh)";
const NUMBER_SCALE = "scaleY(1.45) scaleX(1.1)";
/**
 * Pinned stage: hugs the numeral (line box .78em × scaleY 1.45 ≈ 1.13em, plus
 * the counter row) so there is no dead band above it, and never exceeds the
 * viewport below the header.
 */
const STAGE_HEIGHT = `min(calc(${NUMBER_SIZE} * 1.14 + 60px), calc(100svh - var(--onh-nav-h) - 24px))`;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * How far numeral `index` is pushed off to the right, 0 (at rest) → 1 (gone).
 *
 * Each step between two numerals holds still at both ends; in between, the
 * current one accelerates out past the edge and then the next decelerates in
 * from it — so only one numeral is ever the focus, and every exit and
 * entrance happens through the edge of the screen.
 */
function offRight(index: number, dp: number) {
  const step = Math.floor(dp);
  const f = dp - step;
  if (index === step) return easeIn(clamp01((f - 0.15) / 0.35));
  if (index === step + 1) return 1 - easeOut(clamp01((f - 0.5) / 0.35));
  return 1;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Narrow-screen Experience. The intro reads first; then a stage pins below
 * the header with the pillar copy on the left and one oversized numeral on the
 * right, standing on a horizon rule and cropped by the screen edge. Vertical
 * scroll drives the numerals horizontally through that edge.
 */
export function ExperienceMobile() {
  const { t } = useLanguage();
  const pillars = t.pillars;
  const count = pillars.length;
  const { trackRef, stageRef, dp, goTo } = useStickyProgress(count);

  // The copy follows whichever numeral currently holds the stage.
  const active = Math.min(count - 1, Math.round(dp));
  const trackHeight = `calc(${STAGE_HEIGHT} + ${(count - 1) * SVH_PER_PILLAR}svh)`;

  return (
    <section
      id="experience"
      className="onh-gutter-x bg-onh-bone pt-[clamp(52px,14vw,88px)] pb-[clamp(40px,10vw,64px)] text-onh-black"
    >
      <ExperienceIntro fullWidth />

      <div
        ref={trackRef}
        className="relative mt-[clamp(8px,3vw,16px)]"
        style={{ height: trackHeight }}
      >
        {/* Bleeds past the right gutter so the numeral is cropped by the
            screen itself, not by the content column. */}
        <div
          ref={stageRef}
          className="sticky top-[calc(var(--onh-nav-h)+12px)] -mr-[var(--onh-gutter)] flex flex-col overflow-hidden"
          style={{ height: STAGE_HEIGHT }}
        >
          <div
            className="relative min-h-0 flex-1"
            style={{ borderBottom: RULE }}
          >
            {/* The first numeral slides in from the right as the stage
                arrives, like the desktop reveal; scroll owns it after that. */}
            <Reveal
              from="translateX(60vw)"
              transition="opacity 1.1s var(--onh-ease), transform 1.25s var(--onh-ease)"
              className="absolute inset-0"
            >
              {pillars.map((pillar, index) => (
                <div
                  key={pillar.num}
                  aria-hidden="true"
                  className="absolute bottom-0 left-[48%] leading-[0] will-change-transform"
                  style={{
                    transform: `translate3d(${(offRight(index, dp) * 110).toFixed(3)}vw,0,0)`,
                  }}
                >
                  <span
                    className="inline-block leading-[0.78] font-black tracking-[-0.07em]"
                    style={{
                      fontSize: NUMBER_SIZE,
                      transform: NUMBER_SCALE,
                      transformOrigin: "bottom left",
                    }}
                  >
                    {pillar.num}
                  </span>
                </div>
              ))}
            </Reveal>

            {/* Pillar copy, stacked in one cell and cross-faded, standing on
                the same horizon as the numeral. */}
            <div className="absolute bottom-0 left-0 grid w-[43%] pb-[clamp(16px,5vw,24px)]">
              {pillars.map((pillar, index) => (
                <div
                  key={pillar.num}
                  aria-hidden={index !== active}
                  className="self-end [grid-area:1/1]"
                  style={{
                    opacity: index === active ? 1 : 0,
                    transform:
                      index === active
                        ? "none"
                        : `translateY(${index < active ? -14 : 14}px)`,
                    transition:
                      "opacity .6s var(--onh-ease), transform .8s var(--onh-ease)",
                  }}
                >
                  <h3 className="mt-0 mb-[10px] text-[clamp(17px,5vw,22px)] leading-none font-extrabold tracking-[-0.01em]">
                    {pillar.title}
                  </h3>
                  <p
                    className="m-0 text-[clamp(12.5px,3.5vw,14px)] leading-[1.5] text-onh-ink-soft"
                    style={{ textWrap: "pretty" }}
                  >
                    {pillar.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-[14px] pr-[var(--onh-gutter)]">
            <span className="text-[11px] font-semibold tracking-[0.24em]">
              {pad(active + 1)}{" "}
              <span className="text-[rgba(10,10,10,.42)]">/ {pad(count)}</span>
            </span>
            <div className="flex items-center gap-[8px]">
              {pillars.map((pillar, index) => (
                <button
                  key={pillar.num}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={pillar.title}
                  aria-current={index === active}
                  className="h-[2px] cursor-pointer border-none p-0"
                  style={{
                    background:
                      index === active ? "#0A0A0A" : "rgba(10,10,10,.22)",
                    width: index === active ? "40px" : "18px",
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
