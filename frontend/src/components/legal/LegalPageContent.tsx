"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { legal, LEGAL_UPDATED, type LegalDocId } from "@/i18n/legal";

const TEXT = "text-[15px] leading-[1.7] text-[rgba(242,240,238,.68)]";

export function LegalPageContent({ doc }: { doc: LegalDocId }) {
  const { t, lang } = useLanguage();
  const { title, intro, sections } = legal[lang][doc];

  return (
    <div className="pt-[var(--onh-nav-h)]">
      <section className="onh-gutter-x pt-[clamp(44px,7vw,110px)] pb-[clamp(30px,4vw,60px)]">
        <div className="onh-shell">
          <div className="onh-kicker mb-[clamp(18px,2.5vw,30px)] text-[rgba(242,240,238,.85)]">
            {t.legal}
          </div>
          <h1
            className="m-0 text-[clamp(40px,8vw,140px)] leading-[0.84] font-black tracking-[-0.04em] uppercase [overflow-wrap:anywhere]"
            style={{ textWrap: "balance" }}
          >
            {title}
          </h1>
          <p
            className="mt-[clamp(24px,3vw,44px)] mb-0 max-w-[60ch] text-[clamp(15px,1.25vw,19px)] leading-[1.62] text-[rgba(242,240,238,.68)]"
            style={{ textWrap: "pretty" }}
          >
            {intro}
          </p>
        </div>
      </section>

      <section className="onh-gutter-x pb-[clamp(64px,9vw,150px)]">
        <div className="onh-shell flex max-w-[860px] flex-col gap-[clamp(30px,3.5vw,48px)]">
          {sections.map((section) => (
            <div
              key={section.heading}
              className="border-t border-[var(--onh-line)] pt-[18px]"
            >
              <h2 className="m-0 mb-[16px] text-[clamp(16px,1.4vw,20px)] font-extrabold tracking-[0.04em] uppercase">
                {section.heading}
              </h2>
              <div className="flex flex-col gap-[12px]">
                {section.body.map((block, i) =>
                  Array.isArray(block) ? (
                    <ul key={i} className={`m-0 flex list-disc flex-col gap-[8px] pl-[20px] ${TEXT}`}>
                      {block.map((item) => (
                        <li key={item} className="[overflow-wrap:anywhere]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p key={i} className={`m-0 [overflow-wrap:anywhere] ${TEXT}`}>
                      {block}
                    </p>
                  ),
                )}
              </div>
            </div>
          ))}

          <div className="onh-meta-label border-t border-[var(--onh-line)] pt-[18px]">
            {t.lastUpdated} {LEGAL_UPDATED[lang]}
          </div>
        </div>
      </section>
    </div>
  );
}
