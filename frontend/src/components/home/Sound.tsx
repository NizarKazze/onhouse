"use client";

import { ImageSlot } from "@/components/ui/ImageSlot";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";

export function Sound() {
  const { t } = useLanguage();

  return (
    <section className="onh-gutter-x overflow-hidden py-[clamp(70px,10vw,170px)]">
      <div className="onh-shell">
        <Reveal className="onh-kicker mb-[clamp(30px,5vw,64px)] border-b border-[var(--onh-line)] pb-[18px] text-[rgba(242,240,238,.6)]">
          {t.soundKicker}
        </Reveal>

        <Reveal
          duration={1}
          className="text-[clamp(58px,16.5vw,290px)] leading-[0.86] font-black tracking-[-0.03em] whitespace-nowrap uppercase"
        >
          HOUSE
        </Reveal>

        <Reveal
          duration={1}
          delay={0.08}
          className="text-left text-[clamp(34px,9.1vw,160px)] leading-[1.12] font-black tracking-normal whitespace-nowrap text-[rgba(242,240,238,.42)] uppercase"
        >
          DEEP HOUSE
        </Reveal>

        <Reveal
          duration={1}
          delay={0.16}
          className="text-[clamp(34px,9.1vw,160px)] leading-[0.92] font-black tracking-[-0.02em] whitespace-nowrap text-[rgba(242,240,238,.42)] uppercase"
        >
          TECH HOUSE
        </Reveal>

        <Reveal
          delay={0.18}
          className="relative mt-[clamp(34px,5vw,72px)] mr-0 ml-auto aspect-[3/2] w-full max-w-[min(100%,560px)] overflow-hidden grayscale contrast-[1.1]"
        >
          <ImageSlot id="onh-sound" sizes="(max-width: 900px) 100vw, 560px" />
        </Reveal>

        <Reveal
          as="p"
          delay={0.2}
          className="mt-[clamp(20px,2.4vw,34px)] mr-0 mb-0 ml-auto w-full max-w-[min(100%,560px)] text-[clamp(15px,1.25vw,19px)] leading-[1.62] text-[rgba(242,240,238,.72)]"
          style={{ textWrap: "pretty" }}
        >
          {t.soundBody}
        </Reveal>
      </div>
    </section>
  );
}
