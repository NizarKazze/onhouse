"use client";

import { useEffect, useRef } from "react";

/**
 * Animates the vertical scale of a row of bars with requestAnimationFrame.
 * `level(index, time)` returns 0–1. It writes straight to the DOM so React
 * does not re-render every frame; with reduced motion it paints one still
 * frame.
 */
export function useBarAnimation(level: (index: number, time: number) => number) {
  const barsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const levelRef = useRef(level);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const frame = (now: number) => {
      const t = reduce ? 0 : now / 1000;
      barsRef.current.forEach((bar, i) => {
        if (bar) bar.style.transform = `scaleY(${Math.min(1, levelRef.current(i, t)).toFixed(3)})`;
      });
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (index: number) => (el: HTMLSpanElement | null) => {
    barsRef.current[index] = el;
  };
}
