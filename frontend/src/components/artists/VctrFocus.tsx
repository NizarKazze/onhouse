"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useNarrow, useReducedMotion } from "@/lib/hooks";

/**
 * Collage geometry, verbatim from the design.
 * `f` is the parallax factor: negative drifts against the scroll direction.
 * `arNarrow` / `marginTopNarrow` apply once the collage becomes a 2-up grid.
 */
const VCTR_IMAGES = [
  {
    slot: "onh-vctr-1",
    left: "40%",
    top: "0%",
    width: "23%",
    ar: "3/4",
    arNarrow: "3/4",
    marginTopNarrow: "0",
    f: -1,
  },
  {
    slot: "onh-vctr-2",
    left: "60%",
    top: "17%",
    width: "30%",
    ar: "4/5",
    arNarrow: "4/5",
    marginTopNarrow: "clamp(26px,8vw,48px)",
    f: 0.78,
  },
  {
    slot: "onh-vctr-3",
    left: "45%",
    top: "58%",
    width: "18%",
    ar: "1/1",
    arNarrow: "1/1",
    marginTopNarrow: "-12px",
    f: -0.55,
  },
  {
    slot: "onh-vctr-4",
    left: "71%",
    top: "66%",
    width: "23%",
    ar: "4/5",
    arNarrow: "3/4",
    marginTopNarrow: "clamp(14px,4vw,28px)",
    f: 1.15,
  },
] as const;

/**
 * Scroll progress of the section through the viewport, from -1 (below) to
 * 1 (above), measured centre-to-centre as the design does.
 */
function useSectionProgress(ref: React.RefObject<HTMLElement | null>) {
  const frame = useRef(0);
  const [progress, setProgress] = useState(0);

  const tick = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const span = (vh + rect.height) / 2;
    const next = Math.max(
      -1,
      Math.min(1, (vh / 2 - (rect.top + rect.height / 2)) / span),
    );
    setProgress((current) =>
      Math.abs(next - current) > 0.004 ? next : current,
    );
  }, [ref]);

  useEffect(() => {
    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        tick();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", tick);
    const settle = window.setTimeout(tick, 140);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", tick);
      window.clearTimeout(settle);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [tick]);

  return progress;
}

export function VctrFocus() {
  const { t } = useLanguage();
  const narrow = useNarrow();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const progress = useSectionProgress(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="vctr"
      className="onh-gutter-x overflow-hidden pt-[clamp(30px,4vw,60px)] pb-[clamp(56px,8vw,130px)]"
    >
      <div className="onh-shell">
        <div className="mb-[clamp(26px,4vw,56px)] flex flex-wrap items-baseline justify-between gap-[24px] border-t border-[var(--onh-line)] pt-[18px]">
          <div className="onh-kicker text-[rgba(242,240,238,.6)]">
            {t.vctrKicker}
          </div>
          <div className="text-[10.5px] font-semibold tracking-[0.24em] text-[rgba(242,240,238,.42)]">
            {t.vctrGenre}
          </div>
        </div>

        <div
          className="relative gap-[clamp(10px,3vw,14px)]"
          style={{
            display: narrow ? "grid" : "block",
            gridTemplateColumns: "1fr 1fr",
            height: narrow ? "auto" : "clamp(580px,60vw,860px)",
          }}
        >
          {VCTR_IMAGES.map((image, index) => {
            const drift = reduced
              ? 0
              : progress * image.f * (narrow ? 26 : 62);

            return (
              <div
                key={image.slot}
                className="overflow-hidden border border-[rgba(242,240,238,.12)] bg-onh-panel will-change-transform"
                style={{
                  position: narrow ? "relative" : "absolute",
                  left: narrow ? "auto" : image.left,
                  top: narrow ? "auto" : image.top,
                  width: narrow ? "auto" : image.width,
                  aspectRatio: narrow ? image.arNarrow : image.ar,
                  marginTop: narrow ? image.marginTopNarrow : "0",
                  zIndex: index === 1 ? 3 : 2,
                  transform: `translate3d(0,${drift.toFixed(2)}px,0)`,
                }}
              >
                <div className="absolute inset-0 grayscale contrast-[1.15] brightness-[0.76]">
                  <ImageSlot
                    id={image.slot}
                    sizes="(max-width: 900px) 50vw, 30vw"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-[rgba(10,10,10,.28)]" />
              </div>
            );
          })}

          <Reveal
            className="col-span-full z-[6] flex flex-col justify-center"
            style={{
              position: narrow ? "static" : "absolute",
              left: 0,
              top: narrow ? "auto" : 0,
              bottom: narrow ? "auto" : 0,
              width: narrow ? "auto" : "min(38%,540px)",
              marginTop: narrow ? "clamp(28px,6vw,40px)" : "0",
            }}
          >
            <div className="onh-kicker mb-[clamp(12px,1.6vw,20px)] text-[rgba(242,240,238,.85)]">
              {t.vctrResident}
            </div>
            <h2 className="m-0 text-[clamp(64px,11.5vw,200px)] leading-[0.82] font-black tracking-[-0.04em]">
              VCTR
            </h2>
            <p
              className="mt-[clamp(18px,2.4vw,32px)] mb-0 max-w-[34ch] text-[clamp(14px,1.15vw,18px)] leading-[1.62] text-[rgba(242,240,238,.68)]"
              style={{ textWrap: "pretty" }}
            >
              {t.vctrBody}
            </p>
            <a
              href="#vctr"
              className="onh-btn-solid mt-[clamp(22px,2.8vw,38px)] self-start px-[30px] py-[17px] text-[12px]"
            >
              {t.vctrCta}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
