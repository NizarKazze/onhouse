"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useNarrow } from "@/lib/hooks";

const RULE = "1px solid rgba(10,10,10,.4)";

export function Experience() {
  const { t } = useLanguage();
  const narrow = useNarrow();

  return (
    <section
      id="experience"
      className="onh-gutter-x bg-onh-bone pt-[clamp(44px,6vw,96px)] pb-[clamp(48px,7vw,110px)] text-onh-black"
    >
      <div
        className="onh-shell grid gap-0"
        style={{
          gridTemplateColumns: narrow
            ? "1fr"
            : "minmax(0,1.5fr) minmax(0,.78fr)",
        }}
      >
        <div className="min-w-0">
          {/* Oversized numerals sliding in from the right, stretched
              vertically and cropped by the frame — a graphic element, so it
              is hidden from assistive tech (the pillars below carry it). */}
          <div
            className="relative mt-[clamp(20px,3vw,52px)] h-[clamp(330px,40vw,660px)] overflow-hidden"
            style={{ borderTop: RULE, borderRight: RULE }}
            aria-hidden="true"
          >
            <div className="absolute inset-0 flex items-end justify-end gap-0 mr-[clamp(-150px,-9vw,-44px)]">
              {t.pillars.map((pillar, index) => (
                <Reveal
                  key={pillar.num}
                  from="translateX(46vw)"
                  transition={`opacity 1.1s var(--onh-ease) ${(index * 0.18).toFixed(2)}s, transform 1.25s var(--onh-ease) ${(index * 0.18).toFixed(2)}s`}
                  className="relative flex-none leading-[0]"
                >
                  <span
                    className="inline-block text-[clamp(200px,24vw,440px)] leading-[0.78] font-black tracking-[-0.07em]"
                    style={{
                      transform: "scaleY(1.72)",
                      transformOrigin: "bottom center",
                    }}
                  >
                    {pillar.num}
                  </span>
                </Reveal>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-0 grid grid-cols-3">
              <div style={{ borderLeft: RULE }} />
              <div style={{ borderLeft: RULE }} />
              <div style={{ borderLeft: RULE }} />
            </div>
          </div>

          <div className="grid grid-cols-3" style={{ borderTop: RULE }}>
            {t.pillars.map((pillar) => (
              <Reveal
                key={pillar.num}
                duration={0.8}
                from="translateY(20px)"
                className="min-w-0 px-[clamp(12px,1.6vw,26px)] pt-[clamp(18px,2.2vw,34px)] pb-[clamp(24px,3vw,44px)] text-center"
                style={{ borderLeft: RULE }}
              >
                <h3 className="mt-0 mb-[clamp(12px,1.6vw,22px)] text-[clamp(15px,1.5vw,23px)] leading-none font-extrabold tracking-[-0.01em]">
                  {pillar.title}
                </h3>
                <p
                  className="mx-auto my-0 max-w-[22ch] text-[clamp(11.5px,1vw,14px)] leading-[1.5] text-onh-ink-soft"
                  style={{ textWrap: "pretty" }}
                >
                  {pillar.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        <div
          className="flex min-w-0 flex-col pt-[clamp(24px,3vw,44px)] pl-[clamp(20px,2.6vw,44px)]"
          style={{ borderLeft: RULE, borderTop: RULE }}
        >
          <h2
            className="m-0 text-[clamp(30px,4vw,64px)] leading-[0.94] font-extrabold tracking-[-0.025em] uppercase"
            style={{ textWrap: "balance" }}
          >
            {t.expKicker}
          </h2>

          <div className="mt-[clamp(16px,2vw,26px)] flex items-center gap-[10px]">
            <span className="rounded-full border-[1.5px] border-onh-black px-[13px] pt-[5px] pb-[4px] text-[11px] font-extrabold tracking-[0.12em]">
              ONHOUSE
            </span>
            <span className="h-[20px] w-[20px] rounded-full bg-onh-black" />
          </div>

          <p
            className="mt-[clamp(22px,3vw,40px)] mb-0 max-w-[32ch] text-[clamp(14px,1.15vw,18px)] leading-[1.55] font-medium"
            style={{ textWrap: "pretty" }}
          >
            {t.expIntro1}
          </p>
          <p
            className="mt-[clamp(20px,2.4vw,34px)] mb-0 max-w-[36ch] text-justify text-[clamp(12.5px,1vw,15px)] leading-[1.62] text-onh-ink-soft"
            style={{ textWrap: "pretty" }}
          >
            {t.expIntro2}
          </p>
          <p
            className="mt-[clamp(14px,1.6vw,22px)] mb-0 max-w-[36ch] text-justify text-[clamp(12.5px,1vw,15px)] leading-[1.62] text-onh-ink-soft"
            style={{ textWrap: "pretty" }}
          >
            {t.expIntro3}
          </p>
        </div>
      </div>
    </section>
  );
}
