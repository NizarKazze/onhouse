"use client";

import { useEffect } from "react";
import { scrollToHash } from "@/lib/hooks";

/**
 * Applies the header offset to a hash the page was *navigated to*, e.g.
 * arriving at `/#contact` from /events. Native hash scrolling would put the
 * section under the fixed header.
 */
export function HashScroll() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    // One frame after paint, so the section has its final height.
    const id = window.setTimeout(() => scrollToHash(hash), 80);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}
