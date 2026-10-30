"use client";

import { useCallback } from "react";
import { useRadio } from "@/components/radio/RadioProvider";
import { useBarAnimation } from "@/lib/useBarAnimation";

const BARS = Array.from({ length: 72 }, (_, i) => i);
/** Phones show only the first 40 bars, so each stays readable. */
const MOBILE_BARS = 40;

/** Decorative equaliser. It idles low and opens up while the stream plays. */
export function RadioWave() {
  const { state } = useRadio();
  const loud = state === "playing";

  const level = useCallback(
    (n: number, t: number) => {
      const v = Math.abs(
        Math.sin(t * 1.6 + n * 0.22) * 0.55 + Math.sin(t * 2.7 - n * 0.13) * 0.35,
      );
      return loud ? 0.12 + v * 0.95 : 0.08 + v * 0.5;
    },
    [loud],
  );
  const barRef = useBarAnimation(level);

  return (
    <div
      aria-hidden="true"
      className="flex h-[clamp(80px,10vw,140px)] items-center gap-[clamp(2px,.4vw,5px)]"
    >
      {BARS.map((i) => (
        <span
          key={i}
          ref={barRef(i)}
          // Initial frame as a transform: Tailwind's scale-y-* sets the CSS
          // `scale` property, which would multiply with the animated transform.
          style={{ transform: "scaleY(.2)" }}
          className={`block h-full flex-1 bg-onh-bone ${i >= MOBILE_BARS ? "max-[900px]:hidden" : ""}`}
        />
      ))}
    </div>
  );
}
