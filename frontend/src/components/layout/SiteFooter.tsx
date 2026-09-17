"use client";

import { SectionLink } from "@/components/layout/SectionLink";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { contactDetails } from "@/i18n/copy";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useNarrow } from "@/lib/hooks";

export function SiteFooter() {
  const { t } = useLanguage();
  const narrow = useNarrow();

  const navLinks = [
    { href: "/events", label: t.navEvents },
    { href: "/artists", label: t.navArtists },
    { href: "/#experience", label: t.navExperience },
    { href: "/#about", label: t.navAbout },
    { href: "/#contact", label: t.navContact },
  ];

  const linkClass = "onh-link text-[13px] font-medium tracking-[0.14em]";
  const columnLabel = "onh-meta-label mb-[6px]";

  return (
    <footer className="relative overflow-hidden border-t border-[var(--onh-line)] bg-onh-void">
      <div className="absolute inset-0 grayscale contrast-[1.2] brightness-[0.42]">
        <ImageSlot id="onh-footer" sizes="100vw" />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,10,.72) 0%, rgba(10,10,10,.55) 55%, rgba(10,10,10,.9) 100%)",
        }}
      />

      <div className="onh-shell onh-gutter-x pointer-events-none relative pt-[clamp(56px,9vw,140px)] pb-[clamp(26px,3vw,44px)]">
        <div className="text-center">
          <div className="text-[clamp(42px,10.5vw,180px)] leading-[0.86] font-black tracking-[0.05em]">
            ONHOUSE
          </div>
          <div className="mt-[clamp(16px,2.4vw,34px)] text-[clamp(12px,1.3vw,19px)] font-bold tracking-[0.22em] text-[rgba(242,240,238,.82)] uppercase">
            {t.footerStatement}
          </div>
        </div>

        <div
          className="pointer-events-auto mt-[clamp(48px,7vw,110px)] grid gap-[clamp(28px,4vw,72px)] border-t border-[rgba(242,240,238,.22)] pt-[clamp(26px,3vw,44px)]"
          style={{
            gridTemplateColumns: narrow ? "1fr 1fr" : "repeat(3,minmax(0,1fr))",
          }}
        >
          <div className="flex flex-col gap-[12px]">
            <div className={columnLabel}>{t.navigate}</div>
            {navLinks.map((link) => (
              <SectionLink key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </SectionLink>
            ))}
          </div>

          <div className="flex flex-col gap-[12px]">
            <div className={columnLabel}>{t.reach}</div>
            <a
              href={contactDetails.siteHref}
              target="_blank"
              rel="noopener"
              className={linkClass}
            >
              {contactDetails.site}
            </a>
            <a
              href={contactDetails.instagramHref}
              target="_blank"
              rel="noopener"
              className={linkClass}
            >
              {contactDetails.instagram}
            </a>
            <a href={`mailto:${contactDetails.generalEmail}`} className={linkClass}>
              {contactDetails.generalEmail}
            </a>
            <a href={contactDetails.phoneHref} className={linkClass}>
              {contactDetails.phone}
            </a>
          </div>

          <div className="flex flex-col gap-[12px]">
            <div className={columnLabel}>{t.legal}</div>
            <a href="#privacy" className={linkClass}>
              {t.privacy}
            </a>
            <a href="#cookies" className={linkClass}>
              {t.cookies}
            </a>
          </div>
        </div>

        <div className="pointer-events-auto mt-[clamp(34px,4vw,60px)] flex flex-wrap justify-between gap-[16px] border-t border-[rgba(242,240,238,.18)] pt-[20px] text-[10.5px] font-medium tracking-[0.2em] text-[rgba(242,240,238,.45)]">
          <span>© 2026 ONHOUSE — IBIZA</span>
          <span>{t.rights}</span>
        </div>
      </div>
    </footer>
  );
}
