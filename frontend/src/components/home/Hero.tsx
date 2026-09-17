"use client";

import { SectionLink } from "@/components/layout/SectionLink";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { useLanguage } from "@/i18n/LanguageProvider";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative h-screen min-h-[620px] overflow-hidden bg-onh-void">
      <div className="absolute inset-0 animate-[onh-zoom_26s_ease-in-out_infinite_alternate] grayscale contrast-[1.18] brightness-[0.62]">
        <ImageSlot id="onh-hero" priority sizes="100vw" />
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,10,.72) 0%, rgba(10,10,10,.25) 42%, rgba(10,10,10,.94) 100%)",
        }}
      />

      <div className="onh-gutter-x pointer-events-none absolute inset-0 flex flex-col justify-end pb-[clamp(40px,6vw,78px)]">
        <div className="onh-shell w-full">
          <div className="mb-[clamp(18px,3vw,30px)] flex items-center gap-[12px]">
            <span className="h-[7px] w-[7px] animate-[onh-blink_2.4s_ease-in-out_infinite] rounded-full bg-onh-bone" />
            <span className="text-[10.5px] font-semibold tracking-[0.32em] text-[rgba(242,240,238,.7)]">
              IBIZA · {t.heroKicker}
            </span>
          </div>

          <h1
            className="m-0 max-w-[16ch] text-[clamp(52px,11.5vw,196px)] leading-[0.86] font-black tracking-[-0.02em] uppercase"
            style={{ textWrap: "balance" }}
          >
            {t.heroLine1}{" "}
            <span className="text-[rgba(242,240,238,.5)]">{t.heroLine2}</span>
          </h1>

          <div className="pointer-events-auto mt-[clamp(24px,3.5vw,44px)] flex flex-wrap items-center gap-[clamp(14px,2vw,26px)]">
            <SectionLink
              href="/#next"
              className="onh-btn-solid px-[28px] py-[17px] text-[12px]"
            >
              {t.ctaNext}
            </SectionLink>
            <SectionLink
              href="/#about"
              className="onh-btn-ghost px-[28px] py-[17px] text-[12px]"
            >
              {t.ctaDiscover}
            </SectionLink>
          </div>
        </div>
      </div>

      <div
        className="absolute right-[var(--onh-gutter)] bottom-[clamp(40px,6vw,78px)] flex items-center gap-[14px] text-[10px] font-medium tracking-[0.34em] text-[rgba(242,240,238,.45)]"
        style={{ writingMode: "vertical-rl" }}
        aria-hidden="true"
      >
        <span>{t.scroll}</span>
        <span className="animate-[onh-drop_2.2s_ease-in-out_infinite]">↓</span>
      </div>
    </section>
  );
}
