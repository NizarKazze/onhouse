"use client";

import { useCallback, useSyncExternalStore } from "react";

/** The design's single breakpoint: `matchMedia('(max-width: 900px)')`. */
export const NARROW_QUERY = "(max-width: 900px)";

/**
 * Media query as an external store, so the server snapshot is always `false`
 * and the client re-renders once with the real value after hydration.
 */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * True below 900px. The design branches layout on this rather than on CSS
 * breakpoints, because the same value also feeds the scroll maths.
 */
export function useNarrow(): boolean {
  return useMediaQuery(NARROW_QUERY);
}

export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** True once the page has scrolled past 40px — drives the header background. */
export function useScrolled(threshold = 40): boolean {
  return useSyncExternalStore(
    subscribeToScroll,
    () => (window.scrollY || 0) > threshold,
    () => false,
  );
}

/** Height of the fixed header, used to offset in-page anchor scrolling. */
export function getNavHeight(): number {
  const header = document.querySelector("header");
  return header ? header.getBoundingClientRect().height : 72;
}

/** Smooth-scroll to an element, clearing the fixed header. */
export function scrollToHash(hash: string) {
  const el = document.querySelector(hash);
  if (!el) {
    window.scrollTo(0, 0);
    return;
  }
  const y = el.getBoundingClientRect().top + window.scrollY - getNavHeight() + 1;
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}
