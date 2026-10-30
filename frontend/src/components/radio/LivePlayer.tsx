"use client";

import { PlayIcon } from "@/components/radio/RadioControls";
import { useRadio } from "@/components/radio/RadioProvider";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatShowDate } from "@/lib/radio";

/**
 * The bone card with the big play button: the inverted block of the section.
 * Outside the show slot the button is disabled and the card points at the
 * next show instead.
 */
export function LivePlayer({ live }: { live: boolean }) {
  const { t, lang } = useLanguage();
  const { state, status, onAir, nextShow, toggle } = useRadio();
  const active = state === "playing" || state === "loading";

  const title = !onAir
    ? t.radioNextShow
    : state === "loading"
      ? t.radioConnecting
      : state === "playing"
        ? t.radioListening
        : t.radioListenCta;
  const subtitle =
    state === "error" ? t.radioError : live ? t.radioLiveFrom : t.radioOffAirBody;

  return (
    <Reveal className="flex flex-wrap items-center gap-[20px] bg-onh-bone p-[clamp(20px,2.4vw,30px)] text-onh-black">
      <button
        type="button"
        onClick={toggle}
        disabled={!onAir}
        aria-label={active ? t.radioStop : t.radioListen}
        aria-pressed={active}
        className="flex size-[72px] flex-none cursor-pointer items-center justify-center border-none bg-onh-black p-0 text-onh-bone transition-[background,color,box-shadow] duration-300 enabled:hover:bg-onh-bone enabled:hover:text-onh-black enabled:hover:shadow-[inset_0_0_0_1.5px_var(--color-onh-black)] disabled:cursor-not-allowed disabled:bg-[rgba(10,10,10,.18)] disabled:text-[rgba(10,10,10,.4)]"
      >
        <PlayIcon state={state} className="size-[24px]" />
      </button>
      <div className="flex min-w-[180px] flex-1 flex-col gap-[6px]">
        <span className="text-[22px] leading-[1.05] font-extrabold tracking-[-0.01em] uppercase">
          {title}
        </span>
        {!onAir && nextShow && (
          <span className="text-[15px] font-bold tracking-[0.04em]">
            {formatShowDate(nextShow, lang)}
          </span>
        )}
        <span
          role={state === "error" ? "alert" : undefined}
          className="text-[14px] leading-[1.45] text-[rgba(10,10,10,.62)]"
        >
          {onAir && status?.title ? `${t.radioNowPlaying} · ${status.title}` : subtitle}
        </span>
      </div>
    </Reveal>
  );
}
