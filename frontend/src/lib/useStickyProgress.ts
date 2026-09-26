"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Scroll progress through a tall track with a sticky stage inside it.
 * Scroll position within the track maps to a fractional item index (`dp`,
 * 0 → count-1) while the stage is pinned; callers transform each item by its
 * distance from that index. Used by the event deck and the mobile Experience
 * carousel.
 */
export function useStickyProgress(count: number) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const frame = useRef(0);
  const [dp, setDp] = useState(0);

  const geometry = useCallback(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return null;
    const usable = track.offsetHeight - stage.offsetHeight;
    if (usable <= 0) return null;
    const top = Number.parseFloat(getComputedStyle(stage).top) || 0;
    return { track, usable, top };
  }, []);

  const tick = useCallback(() => {
    const geom = geometry();
    if (!geom) return;
    const raw =
      (geom.top - geom.track.getBoundingClientRect().top) / geom.usable;
    const next = Math.max(0, Math.min(1, raw)) * (count - 1);
    setDp((current) => (Math.abs(next - current) > 0.002 ? next : current));
  }, [geometry, count]);

  useEffect(() => {
    if (count < 2) return;

    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        tick();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", tick);
    const settle = window.setTimeout(tick, 120);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", tick);
      window.clearTimeout(settle);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [tick, count]);

  /** Scroll so that card `index` becomes the active one. */
  const goTo = useCallback(
    (index: number) => {
      const geom = geometry();
      if (!geom) return;
      const absoluteTop =
        geom.track.getBoundingClientRect().top + window.scrollY;
      const y = absoluteTop - geom.top + (index / (count - 1)) * geom.usable;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    },
    [geometry, count],
  );

  return { trackRef, stageRef, dp, goTo };
}
