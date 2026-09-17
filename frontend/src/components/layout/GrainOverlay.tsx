const GRAIN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3"/></filter><rect width="140" height="140" filter="url(#n)"/></svg>',
  );

/**
 * Fixed film-grain plate over the whole site.
 *
 * The design places it inside the home block, but with `position: fixed` and
 * `inset: 0` it is plainly meant as a global texture (the exported markup also
 * carries stray `left`/`top` offsets from the editor canvas, which would push
 * it off-screen — dropped here).
 */
export function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9000] opacity-[0.055] mix-blend-overlay"
      style={{ backgroundImage: `url("${GRAIN}")` }}
    />
  );
}
