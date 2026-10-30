"use client";

import { LivePlayer } from "@/components/radio/LivePlayer";
import { useRadioWithStatus } from "@/components/radio/RadioProvider";
import { RadioWave } from "@/components/radio/RadioWave";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageProvider";
import { radio } from "@/lib/radio";

const RULE = "border-[var(--onh-line)]";

function LiveBadge({ live }: { live: boolean }) {
  const { t } = useLanguage();
  return (
    <span
      className={`onh-kicker inline-flex items-center gap-[10px] border px-[14px] py-[9px] ${
        live
          ? "border-onh-bone bg-onh-bone text-onh-black"
          : "border-[rgba(242,240,238,.28)] text-[rgba(242,240,238,.6)]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`block size-[8px] rounded-full ${
          live ? "animate-onh-blink bg-onh-black" : "bg-[rgba(242,240,238,.35)]"
        }`}
      />
      {live ? t.radioLive : t.radioOffline}
    </span>
  );
}

function InfoCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-[10px] border-b ${RULE} py-[18px] pr-[16px]`}>
      <dt className="onh-meta-label">{label}</dt>
      <dd className="m-0 text-[clamp(16px,1.5vw,21px)] font-bold tracking-[-0.01em] uppercase">
        {children}
      </dd>
    </div>
  );
}

function EpisodeList() {
  const { t } = useLanguage();

  if (radio.episodes.length === 0) {
    return (
      <p className={`m-0 border-b ${RULE} py-[22px] text-[15px] leading-[1.6] text-[rgba(242,240,238,.6)]`}>
        {t.radioArchiveEmpty}
      </p>
    );
  }

  return (
    <ul className="m-0 list-none p-0">
      {radio.episodes.map((episode) => (
        <li
          key={episode.number}
          className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[clamp(14px,2vw,24px)] border-b ${RULE} py-[18px]`}
        >
          <span className="onh-kicker text-[rgba(242,240,238,.6)]">EP.{episode.number}</span>
          <div className="flex min-w-0 flex-col gap-[4px]">
            <span className="truncate text-[clamp(16px,1.4vw,20px)] font-bold tracking-[-0.01em] uppercase">
              {episode.title}
            </span>
            <span className="onh-meta-label">{episode.date}</span>
          </div>
          <a
            href={episode.href}
            target="_blank"
            rel="noopener"
            aria-label={`${t.radioListenEpisode} ${episode.title}`}
            className="flex size-[48px] items-center justify-center border border-[rgba(242,240,238,.35)] text-[18px] transition-colors duration-300 hover:border-onh-bone hover:bg-onh-bone hover:text-onh-black"
          >
            ↗
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Radio() {
  const { t, lang } = useLanguage();
  const { status, volume, setVolume } = useRadioWithStatus();

  // Until the first status read, assume live: the stream is up almost always,
  // and "off air" flashing on load would be the wrong first impression.
  const live = status?.live ?? true;

  return (
    <section id="radio" className="onh-gutter-x overflow-hidden py-[clamp(80px,11vw,150px)]">
      <div className="onh-shell flex flex-col gap-[clamp(36px,5vw,64px)]">
        <Reveal className="onh-rule-head items-center text-[rgba(242,240,238,.6)]">
          <span className="onh-kicker">{t.radioKicker}</span>
          <LiveBadge live={live} />
        </Reveal>

        <Reveal
          as="h2"
          duration={1}
          className="m-0 text-[clamp(64px,15vw,250px)] leading-[0.82] font-black tracking-[-0.04em] uppercase"
        >
          ONHOUSE
          <br />
          <span className="text-[rgba(242,240,238,.42)]">ON AIR</span>
        </Reveal>

        <RadioWave />

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-[clamp(28px,4vw,64px)]">
          <div className="flex flex-col gap-[28px]">
            <Reveal
              as="p"
              className="m-0 max-w-[44ch] text-[clamp(17px,1.5vw,22px)] leading-[1.5] font-medium text-[rgba(242,240,238,.82)]"
              style={{ textWrap: "pretty" }}
            >
              {t.radioBody}
            </Reveal>

            <Reveal>
              <dl className={`m-0 grid grid-cols-2 border-t ${RULE}`}>
                <InfoCell label={t.radioStationLabel}>{radio.name}</InfoCell>
                <InfoCell label={t.radioScheduleLabel}>{radio.show?.[lang] ?? t.radioTbc}</InfoCell>
                <InfoCell label={t.radioListeners}>
                  {status?.live && status.listeners !== null ? status.listeners : "—"}
                </InfoCell>
                <div className={`flex flex-col gap-[14px] border-b ${RULE} py-[18px] pr-[16px]`}>
                  <dt className="onh-meta-label">
                    <label htmlFor="onh-radio-volume">{t.radioVolume}</label>
                  </dt>
                  <dd className="m-0">
                    <input
                      id="onh-radio-volume"
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={(event) => setVolume(Number(event.target.value))}
                      className="w-full cursor-pointer accent-[var(--color-onh-bone)]"
                    />
                  </dd>
                </div>
              </dl>
            </Reveal>

            <LivePlayer live={live} />

            <a
              href={radio.siteHref}
              target="_blank"
              rel="noopener"
              className="onh-link onh-kicker self-start"
            >
              PUREIBIZARADIO.COM ↗
            </a>
          </div>

          <div className="flex flex-col">
            <Reveal className="flex items-baseline justify-between gap-[16px] border-b border-onh-bone pb-[14px]">
              <h3 className="m-0 text-[clamp(26px,2.4vw,34px)] font-extrabold tracking-[-0.02em] uppercase">
                {t.radioArchive}
              </h3>
              <span className="onh-meta-label">{t.radioArchiveSub}</span>
            </Reveal>
            <EpisodeList />
          </div>
        </div>
      </div>
    </section>
  );
}
