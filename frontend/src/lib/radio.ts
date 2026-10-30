/**
 * Pure Ibiza Radio, where ONHOUSE has its show.
 *
 * The station broadcasts from a public Icecast server (the same one its own
 * site plays). Icecast sends `Access-Control-Allow-Origin: *`, so the browser
 * plays the stream and reads its status directly; nothing goes through our
 * backend. The status JSON tells us whether the encoder is live and how many
 * people are listening. The station does not currently fill in the track
 * title (`StreamTitle` is empty), but we read it so it shows up as soon as
 * they start sending it.
 */
export const radio = {
  name: "Pure Ibiza Radio",
  siteHref: "https://www.pureibizaradio.com",
  streamUrl: "https://pureibizaradio.streaming-pro.com:8028/stream.mp3",
  statusUrl: "https://pureibizaradio.streaming-pro.com:8028/status-json.xsl",
  /** Matches the source in the status JSON when the server has several mounts. */
  mount: "/stream.mp3",
  /**
   * The ONHOUSE show slot, in Ibiza time. The stream carries Pure's whole
   * programme, so the player only switches on inside this window. Keep
   * `label` in step with the numbers.
   */
  schedule: {
    timeZone: "Europe/Madrid",
    /** 0 = Sunday … 5 = Friday. */
    weekday: 5,
    start: "18:00",
    end: "19:00",
    label: { en: "FRIDAYS · 18:00–19:00", es: "VIERNES · 18:00–19:00" },
  },
  /**
   * Past shows, newest first, each linking to wherever it is uploaded
   * (SoundCloud, Mixcloud…). Empty until the first show airs.
   */
  episodes: [] as RadioEpisode[],
} as const;

export type RadioEpisode = {
  /** "001", "002"… */
  number: string;
  title: string;
  /** As it should read, e.g. "07/11/2026". */
  date: string;
  href: string;
};

export type RadioStatus = {
  live: boolean;
  listeners: number | null;
  /** "Artist - Title" when the station sends it, otherwise null. */
  title: string | null;
};

type IcecastSource = {
  listenurl?: string;
  listeners?: number;
  title?: string;
};

/** Reads the Icecast status. Never throws: a failed read is reported as offline. */
export async function fetchRadioStatus(signal?: AbortSignal): Promise<RadioStatus> {
  try {
    const res = await fetch(radio.statusUrl, { cache: "no-store", signal });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { icestats?: { source?: IcecastSource | IcecastSource[] } };

    // Icecast returns an object for one mount and an array for several.
    const raw = data.icestats?.source;
    const sources = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const source =
      sources.find((s) => s.listenurl?.endsWith(radio.mount)) ?? sources[0];

    if (!source) return { live: false, listeners: null, title: null };
    return {
      live: true,
      listeners: typeof source.listeners === "number" ? source.listeners : null,
      title: source.title?.trim() || null,
    };
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    return { live: false, listeners: null, title: null };
  }
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MINUTES_PER_WEEK = 7 * 24 * 60;

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Minutes since Sunday 00:00 in the show's time zone. */
function weekMinute(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: radio.schedule.timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return WEEKDAYS.indexOf(get("weekday")) * 1440 + Number(get("hour")) * 60 + Number(get("minute"));
}

const showStart = () => radio.schedule.weekday * 1440 + toMinutes(radio.schedule.start);
const showEnd = () => radio.schedule.weekday * 1440 + toMinutes(radio.schedule.end);

/** True while the ONHOUSE show is on (start inclusive, end exclusive). */
export function isOnAir(now: Date): boolean {
  const minute = weekMinute(now);
  return minute >= showStart() && minute < showEnd();
}

/** When the next show starts (or the current one started, while on air). */
export function nextShowStart(now: Date): Date {
  const minute = weekMinute(now);
  const ahead = isOnAir(now)
    ? showStart() - minute
    : (showStart() - minute + MINUTES_PER_WEEK) % MINUTES_PER_WEEK;
  // Whole minutes from now, then one correction pass in case a daylight
  // saving change falls in between and moves the wall clock by an hour.
  const base = new Date(Math.floor(now.getTime() / 60_000) * 60_000);
  let next = new Date(base.getTime() + ahead * 60_000);
  const drift = showStart() - weekMinute(next);
  if (drift !== 0 && Math.abs(drift) <= 120) next = new Date(next.getTime() + drift * 60_000);
  return next;
}

/** "FRI 6 NOV · 18:00" / "VIE 6 NOV · 18:00", in Ibiza time. */
export function formatShowDate(date: Date, locale: string): string {
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone: radio.schedule.timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value.replace(".", "") ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")} · ${get("hour")}:${get("minute")}`.toUpperCase();
}
