"use client";

import { ImageSlot } from "@/components/ui/ImageSlot";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useNarrow } from "@/lib/hooks";
import { AboutArrow, AboutBody } from "@/components/home/AboutParts";
import { AboutMobile } from "@/components/home/AboutMobile";

export function About() {
  const narrow = useNarrow();
  return narrow ? <AboutMobile /> : <AboutDesktop />;
}

function AboutDesktop() {
  const { t } = useLanguage();

  return (
    <section id="about" className="bg-onh-bone text-onh-black">
      <div
        className="onh-shell grid"
        style={{ gridTemplateColumns: "minmax(0,.82fr) minmax(0,1.18fr)" }}
      >
        <div className="relative min-h-[clamp(340px,50vw,720px)]">
          <div className="absolute inset-0 grayscale contrast-[1.1]">
            <ImageSlot id="onh-about" sizes="(max-width: 900px) 100vw, 40vw" />
          </div>
        </div>

        <div
          className="grid content-center gap-[clamp(20px,3vw,52px)] px-[clamp(20px,4vw,72px)] pt-[clamp(44px,6vw,104px)] pb-[clamp(40px,5vw,88px)]"
          style={{ gridTemplateColumns: "minmax(0,.62fr) minmax(0,1fr)" }}
        >
          <div className="onh-kicker col-span-full text-onh-black">
            {t.aboutKicker}
          </div>

          <Reveal
            as="h2"
            from="translateY(24px)"
            className="col-span-full mt-[clamp(16px,2vw,30px)] mb-0 text-[clamp(36px,5vw,84px)] leading-[0.88] font-black tracking-[-0.025em] uppercase"
            style={{ textWrap: "balance" }}
          >
            {t.aboutTitle}
          </Reveal>

          <div className="flex flex-col gap-[clamp(14px,1.8vw,26px)] pt-[clamp(18px,2.4vw,38px)]">
            <AboutArrow />
            <div className="text-[11px] font-bold tracking-[0.16em] uppercase">
              {t.aboutMark}
            </div>
            <div
              className="border-t border-[rgba(10,10,10,.3)] pt-[clamp(8px,1.2vw,16px)] text-[clamp(16px,1.6vw,23px)] font-extrabold tracking-[-0.01em] uppercase"
              style={{ textWrap: "balance" }}
            >
              {t.aboutQuote}
            </div>
          </div>

          <AboutBody className="border-t border-[rgba(10,10,10,.3)] pt-[clamp(18px,2.4vw,38px)]" />
        </div>
      </div>
    </section>
  );
}
