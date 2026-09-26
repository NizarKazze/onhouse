"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useNarrow } from "@/lib/hooks";
import { ExperienceIntro } from "@/components/home/ExperienceIntro";
import { ExperienceMobile } from "@/components/home/ExperienceMobile";

const RULE = "1px solid rgba(10,10,10,.4)";

export function Experience() {
  const narrow = useNarrow();
  return narrow ? <ExperienceMobile /> : <ExperienceDesktop />;
}

function ExperienceDesktop() {
  const { t } = useLanguage();

  return (
    <section
      id="experience"
      className="onh-gutter-x bg-onh-bone pt-[clamp(44px,6vw,96px)] pb-[clamp(48px,7vw,110px)] text-onh-black"
    >
      <div
        className="onh-shell grid gap-0"
        style={{ gridTemplateColumns: "minmax(0,1.5fr) minmax(0,.78fr)" }}
      >
        <div className="min-w-0">

          <div
            className="grid grid-cols-3 divide-x"
            style={{ borderRight: RULE, "--tw-divide-opacity": 1 } as React.CSSProperties}
          >
            {t.pillars.map((pillar, index) => (
              <div key={pillar.num} className="min-w-0" style={{ borderColor: "rgba(10,10,10,.4)" }}>

                <div
                  className="relative mt-[clamp(20px,3vw,52px)] h-[clamp(330px,40vw,660px)] overflow-hidden"
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 flex items-end justify-center translate-x-[clamp(35px,5vw,80px)]">
                    <Reveal
                      from="translateX(40vw)"
                      transition={`opacity 1.1s var(--onh-ease) ${(index * 0.18).toFixed(2)}s, transform 1.25s var(--onh-ease) ${(index * 0.18).toFixed(2)}s`}
                      className="leading-[0]"
                    >
                      <span
                        className="inline-block text-[clamp(200px,24vw,440px)] leading-[0.78] font-black tracking-[-0.07em]"
                        style={{
                          transform: "scaleY(2.1) scaleX(1.1)",
                          transformOrigin: "bottom center",
                        }}
                      >
                        {pillar.num}
                      </span>
                    </Reveal>
                  </div>
                </div>

                {/* TEXTO */}
                <Reveal
                  duration={0.8}
                  from="translateY(20px)"
                  className="px-[clamp(12px,1.6vw,26px)] pt-[clamp(18px,2.2vw,34px)] pb-[clamp(24px,3vw,44px)] text-center"
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
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex min-w-0 flex-col pt-[clamp(24px,3vw,44px)] pl-[clamp(20px,2.6vw,44px)]"
        >
          <ExperienceIntro />
        </div>
      </div>
    </section>
  );
}