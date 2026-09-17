"use client";

import { Fragment } from "react";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";

export function ClubCulture() {
  const { t } = useLanguage();

  const tags = [
    t.tagCommunity,
    t.tagRespect,
    t.tagFreedom,
    t.tagRhythm,
    t.tagConnection,
  ];

  return (
    <section className="relative min-h-[clamp(420px,70vh,780px)] overflow-hidden bg-onh-void">
      <div className="absolute inset-0 grayscale contrast-[1.2] brightness-[0.5]">
        <ImageSlot id="onh-culture" sizes="100vw" />
      </div>

      <div className="onh-shell onh-gutter-x pointer-events-none relative py-[clamp(70px,11vw,180px)]">
        <div className="onh-kicker mb-[clamp(22px,3vw,40px)] text-[rgba(242,240,238,.85)]">
          CLUB CULTURE
        </div>

        <Reveal
          as="blockquote"
          duration={1}
          className="m-0 max-w-[22ch] text-[clamp(30px,5.6vw,92px)] leading-[0.98] font-extrabold tracking-[-0.025em] uppercase"
          style={{ textWrap: "balance" }}
        >
          {t.cultureQuote}
        </Reveal>

        <div className="mt-[clamp(30px,4vw,60px)] flex flex-wrap gap-[clamp(14px,2vw,26px)]">
          {tags.map((tag, index) => (
            <Fragment key={tag}>
              {index > 0 && (
                <span className="text-[11px] text-[rgba(242,240,238,.4)]">/</span>
              )}
              <span className="text-[11px] font-semibold tracking-[0.24em] text-[rgba(242,240,238,.62)]">
                {tag}
              </span>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
