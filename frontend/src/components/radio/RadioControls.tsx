"use client";

import { useRadio, type RadioState } from "@/components/radio/RadioProvider";
import { useLanguage } from "@/i18n/LanguageProvider";

/** Square bone play/stop button. Stop rather than pause: it is a live stream. */
export function RadioPlayButton({ size = "lg" }: { size?: "lg" | "sm" }) {
  const { t } = useLanguage();
  const { state, toggle } = useRadio();
  const active = state === "playing" || state === "loading";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={active ? t.radioStop : t.radioListen}
      aria-pressed={active}
      className={`flex flex-none cursor-pointer items-center justify-center border-none bg-onh-bone p-0 text-onh-black transition-[background,color,box-shadow] duration-300 hover:bg-onh-black hover:text-onh-bone hover:shadow-[inset_0_0_0_1px_var(--color-onh-bone)] ${
        size === "lg" ? "size-[clamp(64px,7vw,96px)]" : "size-[40px]"
      }`}
    >
      <PlayIcon state={state} className={size === "lg" ? "size-[34%]" : "size-[14px]"} />
    </button>
  );
}

export function PlayIcon({ state, className }: { state: RadioState; className: string }) {
  if (state === "loading") {
    return (
      <span aria-hidden="true" className={`${className} flex items-center justify-between`}>
        {[0, 0.2, 0.4].map((delay) => (
          <span
            key={delay}
            className="block size-[22%] animate-onh-blink rounded-full bg-current"
            style={{ animationDelay: `${delay}s`, animationDuration: "1s" }}
          />
        ))}
      </span>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      {state === "playing" ? (
        <rect x="4" y="4" width="16" height="16" />
      ) : (
        <path d="M5 2.5v19L21.5 12z" />
      )}
    </svg>
  );
}

/** Live dot + label, or the off-air label when the encoder is down. */
export function RadioLiveBadge({ live }: { live: boolean }) {
  const { t } = useLanguage();
  return (
    <span className="onh-kicker inline-flex items-center gap-[10px]">
      <span
        aria-hidden="true"
        className={`block size-[7px] rounded-full ${
          live ? "animate-onh-blink bg-onh-bone" : "bg-[rgba(242,240,238,.3)]"
        }`}
      />
      {live ? t.radioLive : t.radioOffline}
    </span>
  );
}
