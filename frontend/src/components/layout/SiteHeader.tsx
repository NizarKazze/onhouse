"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SectionLink } from "@/components/layout/SectionLink";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useNarrow, useScrolled } from "@/lib/hooks";

export function SiteHeader() {
  const { t, toggleLang, langLabel } = useLanguage();
  const scrolled = useScrolled();
  const narrow = useNarrow();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // The design closes the menu when the layout stops being narrow, and a route
  // change should never leave it hanging open. Both are adjustments *during*
  // render rather than effects, so the menu never paints in a stale state.
  const [lastNarrow, setLastNarrow] = useState(narrow);
  if (lastNarrow !== narrow) {
    setLastNarrow(narrow);
    setMenuOpen(false);
  }

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  const links = [
    { href: "/events", label: t.navEvents },
    { href: "/artists", label: t.navArtists },
    { href: "/#experience", label: t.navExperience },
    { href: "/#about", label: t.navAbout },
    { href: "/#contact", label: t.navContact },
  ];

  return (
    <header
      className="fixed inset-x-0 top-0 z-[8000] backdrop-blur-[14px]"
      style={{
        background: scrolled ? "rgba(10,10,10,.9)" : "transparent",
        borderBottom: `1px solid ${scrolled ? "rgba(242,240,238,.14)" : "transparent"}`,
        transition: "background .5s ease, border-color .5s ease",
      }}
    >
      <div className="onh-shell onh-gutter-x flex h-[var(--onh-nav-h)] items-center gap-[clamp(16px,4vw,48px)] max-[480px]:gap-[3vw]">
        <SectionLink
          href="/"
          className="onh-link flex-none text-[clamp(15px,1.5vw,20px)] leading-none font-black tracking-[0.34em] max-[480px]:text-[clamp(12px,3.9vw,16px)] max-[480px]:tracking-[0.2em]"
        >
          ONHOUSE
        </SectionLink>

        {!narrow && (
          <nav className="ml-auto flex items-center gap-[clamp(14px,2vw,30px)]">
            {links.map((link) => (
              <SectionLink
                key={link.href}
                href={link.href}
                className="onh-link text-[11.5px] font-medium tracking-[0.2em]"
              >
                {link.label}
              </SectionLink>
            ))}
          </nav>
        )}

        <div
          className={`flex flex-none items-center gap-[14px] max-[480px]:gap-[2.4vw] ${narrow ? "ml-auto" : ""}`}
        >
          <button
            type="button"
            onClick={toggleLang}
            aria-label={`Switch language to ${langLabel === "ES" ? "Spanish" : "English"}`}
            className="cursor-pointer border border-[rgba(242,240,238,.28)] bg-transparent px-[10px] py-[7px] font-sans text-[10.5px] font-semibold tracking-[0.18em] text-onh-bone max-[480px]:px-[2.2vw] max-[480px]:text-[clamp(9px,2.7vw,10.5px)] transition-colors duration-300 hover:border-onh-bone hover:bg-[rgba(242,240,238,.08)]"
          >
            {langLabel}
          </button>

          <SectionLink
            href="/#contact"
            className="onh-btn-solid px-[18px] py-[12px] text-[11px] tracking-[0.2em] max-[480px]:px-[3vw] max-[480px]:py-[10px] max-[480px]:text-[clamp(9px,2.7vw,11px)] max-[480px]:tracking-[0.12em]"
          >
            {t.tickets}
          </SectionLink>

          {narrow && (
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="onh-mobile-menu"
              className="grid cursor-pointer justify-items-end border-none bg-transparent py-[8px] font-sans text-[11px] font-semibold tracking-[0.18em] text-onh-bone max-[480px]:text-[clamp(9.5px,2.8vw,11px)] max-[480px]:tracking-[0.12em]"
            >
              {/* Both labels share one cell, so the button is always as wide
                  as the longer one and toggling never shifts the row. */}
              <span
                className={`[grid-area:1/1] ${menuOpen ? "invisible" : ""}`}
              >
                {t.menu}
              </span>
              <span
                className={`[grid-area:1/1] ${menuOpen ? "" : "invisible"}`}
              >
                {t.close}
              </span>
            </button>
          )}
        </div>
      </div>

      {narrow && menuOpen && (
        <div
          id="onh-mobile-menu"
          className="onh-gutter-x border-t border-[rgba(242,240,238,.12)] bg-onh-black pt-[18px] pb-[26px]"
        >
          <div className="flex flex-col gap-[14px]">
            {links.map((link) => (
              <SectionLink
                key={link.href}
                href={link.href}
                onNavigate={() => setMenuOpen(false)}
                className="onh-link text-[26px] font-extrabold tracking-[0.02em]"
              >
                {link.label}
              </SectionLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
