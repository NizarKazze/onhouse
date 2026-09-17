"use client";

import { ImageSlot } from "@/components/ui/ImageSlot";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useNarrow } from "@/lib/hooks";

export function IbizaAfterDark() {
  const { t } = useLanguage();
  const narrow = useNarrow();

  return (
    <section className="onh-gutter-x bg-onh-bone py-[clamp(64px,9vw,150px)] text-onh-black">
      <div className="onh-shell">
        <div
          className="grid items-end gap-[clamp(30px,5vw,80px)]"
          style={{ gridTemplateColumns: narrow ? "1fr" : "1fr 1fr" }}
        >
          <div>
            <div className="onh-kicker mb-[clamp(20px,3vw,34px)] text-onh-black">
              019 / IBIZA
            </div>
            <Reveal
              as="h2"
              duration={1}
              className="m-0 text-[clamp(44px,7.4vw,132px)] leading-[0.85] font-black tracking-[-0.035em] uppercase"
            >
              IBIZA
              <br />
              AFTER
              <br />
              DARK
            </Reveal>
          </div>

          <div>
            <p
              className="m-0 max-w-[46ch] text-[clamp(15px,1.25vw,19px)] leading-[1.62] text-onh-ink"
              style={{ textWrap: "pretty" }}
            >
              {t.ibizaBody}
            </p>
            <div className="mt-[clamp(26px,3vw,44px)] grid grid-cols-2 gap-[12px]">
              <div className="relative overflow-hidden grayscale contrast-[1.1] [aspect-ratio:1/1]">
                <ImageSlot
                  id="onh-ibiza-1"
                  sizes="(max-width: 900px) 50vw, 25vw"
                />
              </div>
              <div className="relative overflow-hidden grayscale contrast-[1.1] [aspect-ratio:1/1]">
                <ImageSlot
                  id="onh-ibiza-2"
                  sizes="(max-width: 900px) 50vw, 25vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
