"use client";

import { contactDetails } from "@/i18n/copy";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useNarrow } from "@/lib/hooks";

const VALUE =
  "text-[clamp(15px,1.5vw,21px)] font-semibold tracking-[-0.01em]";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[var(--onh-line)] pt-[16px]">
      <div className="onh-meta-label mb-[10px]">{label}</div>
      {children}
    </div>
  );
}

export function Contact() {
  const { t } = useLanguage();
  const narrow = useNarrow();

  return (
    <section id="contact" className="onh-gutter-x py-[clamp(64px,9vw,150px)]">
      <div className="onh-shell">
        <div className="onh-kicker mb-[clamp(30px,4vw,58px)] border-b border-[var(--onh-line)] pb-[18px] text-[rgba(242,240,238,.6)]">
          {t.contactKicker}
        </div>

        <div
          className="grid gap-[clamp(30px,4vw,64px)]"
          style={{ gridTemplateColumns: narrow ? "1fr" : "1.1fr .9fr" }}
        >
          <div>
            <h2
              className="m-0 text-[clamp(38px,6vw,104px)] leading-[0.86] font-black tracking-[-0.03em] uppercase"
              style={{ textWrap: "balance" }}
            >
              {t.contactTitle}
            </h2>
            <p className="mt-[clamp(20px,2.5vw,34px)] mb-0 max-w-[40ch] text-[15px] leading-[1.6] text-[rgba(242,240,238,.65)]">
              {t.contactBody}
            </p>
          </div>

          <div className="flex flex-col gap-[26px]">
            <DetailRow label={t.bookings}>
              <a
                href={`mailto:${contactDetails.bookingsEmail}`}
                className={`onh-link ${VALUE}`}
              >
                {contactDetails.bookingsEmail}
              </a>
            </DetailRow>

            <DetailRow label={t.general}>
              <a
                href={`mailto:${contactDetails.generalEmail}`}
                className={`onh-link ${VALUE}`}
              >
                {contactDetails.generalEmail}
              </a>
            </DetailRow>

            <DetailRow label={t.phone}>
              <a href={contactDetails.phoneHref} className={`onh-link ${VALUE}`}>
                {contactDetails.phone}
              </a>
            </DetailRow>

            <DetailRow label="INSTAGRAM">
              <a
                href={contactDetails.instagramHref}
                target="_blank"
                rel="noopener"
                className={`onh-link ${VALUE}`}
              >
                {contactDetails.instagram}
              </a>
            </DetailRow>

            <DetailRow label={t.founder}>
              <div className={VALUE}>{contactDetails.founder}</div>
            </DetailRow>
          </div>
        </div>
      </div>
    </section>
  );
}
