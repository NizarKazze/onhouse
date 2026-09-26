"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";

const bodyClass =
  "max-w-[44ch] text-[clamp(14px,1.15vw,18px)] leading-[1.62] text-onh-ink text-justify";

/** The corner arrow that sits beside the "Who we are" mark. */
export function AboutArrow({ color = "#0A0A0A" }: { color?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      aria-hidden="true"
      style={{
        width: "clamp(38px,4vw,62px)",
        height: "clamp(38px,4vw,62px)",
      }}
    >
      <path d="M4 4 L54 54" />
      <path d="M54 30 L54 54 L30 54" />
    </svg>
  );
}

/** The two body paragraphs, revealed together. */
export function AboutBody({ className }: { className?: string }) {
  const { t } = useLanguage();

  return (
    <Reveal delay={0.1} from="translateY(24px)" className={className}>
      <p className={`m-0 ${bodyClass}`} style={{ textWrap: "pretty" }}>
        {t.aboutBody1}
      </p>
      <p
        className={`mt-[clamp(16px,2vw,26px)] mb-0 ${bodyClass}`}
        style={{ textWrap: "pretty" }}
      >
        {t.aboutBody2}
      </p>
    </Reveal>
  );
}
