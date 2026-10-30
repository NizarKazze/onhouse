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
   * The ONHOUSE show slot, e.g. { en: "EVERY FRIDAY · 22:00", es: "CADA VIERNES · 22:00" }.
   * Null until the slot is confirmed; the section simply leaves the line out.
   */
  show: null as { en: string; es: string } | null,
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
