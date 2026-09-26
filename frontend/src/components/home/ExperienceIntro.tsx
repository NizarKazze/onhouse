"use client";

import { useLanguage } from "@/i18n/LanguageProvider";

/**
 * Heading, badge and the three intro paragraphs — shared by both layouts.
 * Desktop caps the measure to fit its narrow column; `fullWidth` lets the
 * copy run the whole width of the section instead.
 */
export function ExperienceIntro({
  fullWidth = false,
}: {
  fullWidth?: boolean;
}) {
  const { t } = useLanguage();
  const measure = (cap: string) => (fullWidth ? "" : cap);

  return (
    <>
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
        className={`mt-[clamp(22px,3vw,40px)] mb-0 ${measure("max-w-[32ch]")} text-[clamp(14px,1.15vw,18px)] leading-[1.55] font-medium`}
        style={{ textWrap: "pretty" }}
      >
        {t.expIntro1}
      </p>
      <p
        className={`mt-[clamp(20px,2.4vw,34px)] mb-0 ${measure("max-w-[36ch]")} text-justify text-[clamp(12.5px,1vw,15px)] leading-[1.62] text-onh-ink-soft`}
        style={{ textWrap: "pretty" }}
      >
        {t.expIntro2}
      </p>
      <p
        className={`mt-[clamp(14px,1.6vw,22px)] mb-0 ${measure("max-w-[36ch]")} text-justify text-[clamp(12.5px,1vw,15px)] leading-[1.62] text-onh-ink-soft`}
        style={{ textWrap: "pretty" }}
      >
        {t.expIntro3}
      </p>
    </>
  );
}
