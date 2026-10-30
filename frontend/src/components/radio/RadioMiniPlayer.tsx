"use client";

import { RadioLiveBadge, RadioPlayButton } from "@/components/radio/RadioControls";
import { useRadio } from "@/components/radio/RadioProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { radio } from "@/lib/radio";

/**
 * Small bar pinned bottom-left while the stream is on, so it can be stopped
 * from any page once the radio section is out of view.
 */
export function RadioMiniPlayer() {
  const { t } = useLanguage();
  const { state, status } = useRadio();
  if (state !== "playing" && state !== "loading") return null;

  return (
    <div
      role="region"
      aria-label={radio.name}
      className="fixed bottom-[clamp(14px,2vw,24px)] left-[var(--onh-gutter)] z-[7000] flex max-w-[calc(100vw-2*var(--onh-gutter))] items-center gap-[14px] border border-[rgba(242,240,238,.22)] bg-[rgba(10,10,10,.9)] py-[8px] pr-[18px] pl-[8px] backdrop-blur-[14px]"
    >
      <RadioPlayButton size="sm" />
      <div className="min-w-0">
        <div className="truncate text-[12px] font-bold tracking-[0.12em] uppercase">
          {radio.name}
        </div>
        <div className="mt-[4px] text-[rgba(242,240,238,.6)] [&_.onh-kicker]:text-[9.5px]">
          {state === "loading" ? (
            <span className="onh-kicker">{t.radioConnecting}</span>
          ) : (
            <RadioLiveBadge live={status?.live ?? true} />
          )}
        </div>
      </div>
    </div>
  );
}
