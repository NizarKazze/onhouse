"use client";

import { useState } from "react";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { TicketLink } from "@/components/ui/TicketLink";
import { MetaCell } from "@/components/ui/MetaCell";
import { useLanguage } from "@/i18n/LanguageProvider";
import { scrollToHash } from "@/lib/hooks";
import type { Event } from "@/types";

/** Two full rows at three-up; divides evenly into the two- and one-up grids. */
const PAGE_SIZE = 6;
const GRID_ID = "events-grid";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Upcoming events after the headline one, as a paginated card grid.
 * Paging is client state only — no navigation, no refetch.
 */
export function EventGrid({ events }: { events: Event[] }) {
  const { t } = useLanguage();
  const [page, setPage] = useState(0);

  const pageCount = Math.ceil(events.length / PAGE_SIZE);
  // Clamp in case the list shrinks underneath the current page.
  const current = Math.min(page, Math.max(0, pageCount - 1));
  const visible = events.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  if (events.length === 0) return null;

  const goTo = (next: number) => {
    setPage(next);
    scrollToHash(`#${GRID_ID}`);
  };

  return (
    <div id={GRID_ID}>
      <div className="grid grid-cols-1 gap-[clamp(14px,1.6vw,24px)] min-[600px]:grid-cols-2 min-[901px]:grid-cols-3">
        {visible.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {pageCount > 1 && (
        <nav
          aria-label={t.pagination}
          className="mt-[clamp(28px,3.5vw,48px)] flex flex-wrap items-center justify-between gap-[18px] border-t border-[var(--onh-line)] pt-[clamp(18px,2vw,26px)]"
        >
          <span className="text-[11px] font-semibold tracking-[0.24em] text-onh-bone">
            {pad(current + 1)}{" "}
            <span className="text-[rgba(242,240,238,.42)]">/ {pad(pageCount)}</span>
          </span>

          <div className="flex flex-wrap items-center gap-[10px]">
            <PageButton
              label={t.prevPage}
              disabled={current === 0}
              onClick={() => goTo(current - 1)}
            />
            {Array.from({ length: pageCount }, (_, index) => (
              <PageButton
                key={index}
                label={pad(index + 1)}
                current={index === current}
                onClick={() => goTo(index)}
              />
            ))}
            <PageButton
              label={t.nextPage}
              disabled={current === pageCount - 1}
              onClick={() => goTo(current + 1)}
            />
          </div>
        </nav>
      )}
    </div>
  );
}

function PageButton({
  label,
  onClick,
  current = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  current?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || current}
      aria-current={current ? "page" : undefined}
      // The solid variant gets a transparent border so both variants share a box.
      className={`${
        current
          ? "onh-btn-solid border border-transparent disabled:opacity-100 disabled:hover:bg-onh-bone disabled:hover:text-onh-black disabled:hover:shadow-none"
          : "onh-btn-ghost disabled:opacity-35 disabled:hover:bg-transparent"
      } min-w-[48px] cursor-pointer px-[16px] py-[12px] text-center font-sans text-[11px] disabled:cursor-default`}
    >
      {label}
    </button>
  );
}

function EventCard({ event }: { event: Event }) {
  const { t, lang } = useLanguage();

  return (
    <article className="flex flex-col border border-[var(--onh-line)] bg-onh-black transition-colors duration-300 hover:border-[rgba(242,240,238,.4)]">
      <div className="relative overflow-hidden bg-onh-panel [aspect-ratio:16/9]">
        <div className="absolute inset-0 grayscale contrast-[1.12] brightness-[0.8]">
          <ImageSlot
            src={event.image}
            caption={`${event.title} poster`}
            alt={`${event.title} poster`}
            sizes="(max-width: 599px) 100vw, (max-width: 900px) 50vw, 33vw"
          />
        </div>
        <div className="pointer-events-none absolute top-[20px] left-0 bg-onh-bone px-[12px] py-[8px] text-[10px] font-bold tracking-[0.24em] text-onh-black">
          {event.tag[lang]}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-[clamp(14px,1.6vw,20px)] p-[clamp(18px,2vw,28px)]">
        <div className="flex items-baseline justify-between gap-[16px]">
          <span className="text-[11px] font-semibold tracking-[0.24em] text-[rgba(242,240,238,.6)]">
            {event.num}
          </span>
          <span className="text-[10.5px] font-semibold tracking-[0.24em] text-[rgba(242,240,238,.45)]">
            {event.city}
          </span>
        </div>

        <div className="font-display text-[clamp(38px,3.6vw,60px)] leading-[0.84] tracking-[0.01em]">
          {event.title}
        </div>

        <p
          className="m-0 line-clamp-3 text-[14px] leading-[1.6] text-[rgba(242,240,238,.65)]"
          style={{ textWrap: "pretty" }}
        >
          {event.description[lang]}
        </p>

        <div className="mt-auto grid grid-cols-2 gap-px bg-[var(--onh-line)]">
          <MetaCell label={t.date} value={event.date} compact />
          <MetaCell label={t.venue} value={event.venue} compact />
        </div>

        <div>
          <TicketLink
            href={event.ticketUrl}
            className="onh-btn-solid px-[24px] py-[14px] text-[11px]"
          >
            {t.tickets}
          </TicketLink>
        </div>
      </div>
    </article>
  );
}
