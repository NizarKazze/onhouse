"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "@/lib/hooks";

/**
 * Shared reveal controller.
 *
 * The design runs two mechanisms over its `[data-reveal]` nodes and reveals on
 * whichever fires first:
 *
 * 1. An IntersectionObserver (`rootMargin: '0px 0px -12% 0px'`,
 *    `threshold: 0.08`).
 * 2. A scroll "sweep" that reveals anything whose top edge is above 94% of the
 *    viewport height.
 *
 * The sweep is not redundant: blocks that start translated sideways (the
 * Experience numerals begin at `translateX(46vw)`) never intersect the
 * viewport, so the observer alone would leave them hidden forever. The sweep
 * only looks at the vertical axis, so it still catches them.
 *
 * One observer and one scroll listener are shared across every instance.
 */
const pending = new Map<Element, () => void>();
let observer: IntersectionObserver | null = null;
let listening = false;
let frame = 0;

function release(node: Element) {
  const reveal = pending.get(node);
  if (!reveal) return;
  pending.delete(node);
  observer?.unobserve(node);
  reveal();
}

function sweep() {
  const limit = window.innerHeight * 0.94;
  for (const node of [...pending.keys()]) {
    if (node.getBoundingClientRect().top < limit) release(node);
  }
}

function onScroll() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    sweep();
  });
}

function register(node: Element, reveal: () => void) {
  pending.set(node, reveal);

  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) release(entry.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
  );
  observer.observe(node);

  if (!listening) {
    listening = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  // Deferred so the first pass never reveals synchronously inside an effect.
  queueMicrotask(sweep);
}

function unregister(node: Element) {
  pending.delete(node);
  observer?.unobserve(node);
}

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Stagger, in seconds — matches the design's per-element delays. */
  delay?: number;
  /** Duration, in seconds. The design uses .8s–1.25s depending on the block. */
  duration?: number;
  /** Starting offset. The design slides up 20–28px, or in from the side. */
  from?: string;
  /**
   * Full `transition` override, for the blocks where the design times opacity
   * and transform differently.
   */
  transition?: string;
  as?: "div" | "section" | "h2" | "p" | "blockquote";
};

export function Reveal({
  children,
  className,
  style,
  delay = 0,
  duration = 0.9,
  from = "translateY(28px)",
  transition,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const reduced = useReducedMotion();

  // With reduced motion the content is simply present — no observer, no
  // transition, nothing to wait for.
  const shown = revealed || reduced;

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;

    if (!("IntersectionObserver" in window)) {
      queueMicrotask(() => setRevealed(true));
      return;
    }

    register(node, () => setRevealed(true));
    return () => unregister(node);
  }, [reduced]);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : from,
        transition:
          transition ??
          `opacity ${duration}s var(--onh-ease) ${delay}s, transform ${duration}s var(--onh-ease) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
