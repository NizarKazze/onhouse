import Image from "next/image";
import { getSlot } from "@/lib/images";

type ImageSlotProps = {
  /** Slot id from the design, e.g. "onh-hero". */
  id: string;
  /** Load eagerly — use for above-the-fold imagery only. */
  priority?: boolean;
  /** Overrides the registry alt when context makes a better one available. */
  alt?: string;
  sizes?: string;
};

/**
 * Reproduces the design's `<image-slot>`.
 *
 * A filled slot stores a cover fit plus a view (`s` zoom, `x`/`y` pan in % of
 * the frame). The design applies that as `width/height/left/top` on an
 * absolutely positioned image; `translate(x%, y%) scale(s)` over an
 * `object-fit: cover` image is the same framing and survives a responsive
 * resize identically, because both terms are relative to the frame.
 *
 * An unfilled slot keeps the layout and shows its art-direction note, so the
 * composition holds until the photograph is dropped in.
 */
export function ImageSlot({ id, priority, alt, sizes }: ImageSlotProps) {
  const slot = getSlot(id);

  if (!slot?.src) {
    return (
      <div
        className="absolute inset-0 flex items-end bg-onh-panel"
        aria-hidden="true"
      >
        {/* Fine diagonal hatch — reads as an intentional empty plate rather
            than a broken image. */}
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(242,240,238,.05) 0px, rgba(242,240,238,.05) 1px, transparent 1px, transparent 9px)",
          }}
        />
        <span
          className="relative m-[clamp(12px,1.6vw,22px)] max-w-[28ch] text-[9.5px] leading-[1.5] font-semibold tracking-[0.2em] text-[rgba(242,240,238,0.32)] uppercase"
          style={{ textWrap: "pretty" }}
        >
          {slot?.caption ?? id}
        </span>
      </div>
    );
  }

  const view = slot.view ?? { s: 1, x: 0, y: 0 };
  const transform =
    view.s === 1 && view.x === 0 && view.y === 0
      ? undefined
      : `translate(${view.x}%, ${view.y}%) scale(${view.s})`;

  return (
    <Image
      src={slot.src}
      alt={alt ?? slot.alt}
      fill
      priority={priority}
      sizes={sizes ?? "100vw"}
      className="object-cover"
      style={transform ? { transform } : undefined}
    />
  );
}
