"use client";

import { PlayIcon } from "@/components/radio/RadioControls";
import { useRadio } from "@/components/radio/RadioProvider";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";

/** The bone card with the big play button: the inverted block of the section. */
export function LivePlayer({ live }: { live: boolean }) {
  const { t } = useLanguage();
  const { state, status, toggle } = useRadio();
  const active = state === "playing" || state === "loading";

  const title =
    state === "loading"
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
        aria-label={active ? t.radioStop : t.radioListen}
        aria-pressed={active}
        className="flex size-[72px] flex-none cursor-pointer items-center justify-center border-none bg-onh-black p-0 text-onh-bone transition-[background,color,box-shadow] duration-300 hover:bg-onh-bone hover:text-onh-black hover:shadow-[inset_0_0_0_1.5px_var(--color-onh-black)]"
      >
        <PlayIcon state={state} className="size-[24px]" />
      </button>
      <div className="flex min-w-[180px] flex-1 flex-col gap-[6px]">
        <span className="text-[22px] leading-[1.05] font-extrabold tracking-[-0.01em] uppercase">
          {title}
        </span>
        <span
          role={state === "error" ? "alert" : undefined}
          className="text-[14px] leading-[1.45] text-[rgba(10,10,10,.62)]"
        >
          {status?.title ? `${t.radioNowPlaying} · ${status.title}` : subtitle}
        </span>
      </div>
    </Reveal>
  );
}
