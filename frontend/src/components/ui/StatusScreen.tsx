"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";

type StatusScreenProps = {
  variant: "error" | "notFound";
  /** Supplied by an error boundary to retry the segment. */
  onRetry?: () => void;
};

/**
 * Full-height message screen for the error and not-found states, in the same
 * editorial language as the page headers.
 */
export function StatusScreen({ variant, onRetry }: StatusScreenProps) {
  const { t } = useLanguage();

  const title = variant === "error" ? t.errorTitle : t.notFoundTitle;
  const body = variant === "error" ? t.errorBody : t.notFoundBody;

  return (
    <section className="onh-gutter-x flex min-h-[70vh] items-center pt-[var(--onh-nav-h)] pb-[clamp(64px,9vw,150px)]">
      <div className="onh-shell w-full">
        <div className="onh-kicker mb-[clamp(18px,2.5vw,30px)] text-[rgba(242,240,238,.6)]">
          ONHOUSE
        </div>
        <h1
          className="m-0 max-w-[16ch] text-[clamp(44px,9vw,150px)] leading-[0.84] font-black tracking-[-0.03em] uppercase"
          style={{ textWrap: "balance" }}
        >
          {title}
        </h1>
        <p className="mt-[clamp(20px,2.5vw,34px)] mb-0 max-w-[40ch] text-[15px] leading-[1.6] text-[rgba(242,240,238,.65)]">
          {body}
        </p>
        <div className="mt-[clamp(26px,3.5vw,44px)] flex flex-wrap gap-[14px]">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="onh-btn-solid cursor-pointer border-none px-[28px] py-[17px] font-sans text-[12px]"
            >
              {t.retry}
            </button>
          )}
          <Link href="/" className="onh-btn-ghost px-[28px] py-[17px] text-[12px]">
            {t.backHome}
          </Link>
        </div>
      </div>
    </section>
  );
}
