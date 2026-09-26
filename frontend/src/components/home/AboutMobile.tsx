"use client";

import { ImageSlot } from "@/components/ui/ImageSlot";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";
import { AboutArrow, AboutBody } from "@/components/home/AboutParts";

/**
 * Narrow-screen "Who we are". The heading leads, the photograph follows with
 * the arrow + mark pinned to its bottom-right corner, and the quote and body
 * read on underneath — a deliberate vertical order rather than the desktop
 * grid collapsed to one column.
 */
export function AboutMobile() {
  const { t } = useLanguage();

  return (
    <section
      id="about"
      className="onh-gutter-x bg-onh-bone pt-[clamp(52px,14vw,88px)] pb-[clamp(52px,14vw,88px)] text-onh-black"
    >
      <div className="onh-kicker">{t.aboutKicker}</div>

      <Reveal
        as="h2"
        from="translateY(24px)"
        className="mt-[18px] mb-0 text-[clamp(34px,10.5vw,64px)] leading-[0.88] font-black tracking-[-0.025em] uppercase"
        style={{ textWrap: "balance" }}
      >
        {t.aboutTitle}
      </Reveal>

      <Reveal
        delay={0.05}
        from="translateY(24px)"
        className="relative mt-[clamp(28px,8vw,44px)] overflow-hidden bg-onh-panel [aspect-ratio:4/5]"
      >
        <div className="absolute inset-0 grayscale contrast-[1.1]">
          <ImageSlot id="onh-about" sizes="100vw" />
        </div>
        {/* Darkens only the corner the mark sits in, so it stays legible on
            any photograph without dimming the whole plate. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 70% at 100% 100%, rgba(10,10,10,.62) 0%, rgba(10,10,10,0) 60%)",
          }}
        />
        <div className="absolute right-[clamp(14px,4vw,22px)] bottom-[clamp(14px,4vw,22px)] flex items-end gap-[12px] text-onh-bone">
          <span className="pb-[2px] text-[11px] font-bold tracking-[0.16em] uppercase">
            {t.aboutMark}
          </span>
          <AboutArrow color="#F2F0EE" />
        </div>
      </Reveal>

      <div
        className="mt-[clamp(28px,8vw,40px)] border-t border-[rgba(10,10,10,.3)] pt-[16px] text-[clamp(18px,5.2vw,23px)] font-extrabold tracking-[-0.01em] uppercase"
        style={{ textWrap: "balance" }}
      >
        {t.aboutQuote}
      </div>

      <AboutBody className="mt-[clamp(22px,6vw,32px)]" />
    </section>
  );
}
