"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fetchRadioStatus, radio, type RadioStatus } from "@/lib/radio";

export type RadioState = "idle" | "loading" | "playing" | "error";

type RadioContextValue = {
  state: RadioState;
  status: RadioStatus | null;
  volume: number;
  toggle: () => void;
  setVolume: (volume: number) => void;
  /** Mount-scoped interest in the station status; polling runs only while someone watches. */
  watchStatus: () => () => void;
};

const RadioContext = createContext<RadioContextValue | null>(null);

const STATUS_POLL_MS = 30_000;

/**
 * Owns the one `<audio>` element for the site. It sits in the site chrome, so
 * the stream keeps playing across route changes instead of restarting on
 * every page.
 */
export function RadioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<RadioState>("idle");
  const [volume, setVolumeState] = useState(0.8);
  const [status, setStatus] = useState<RadioStatus | null>(null);
  const [watchers, setWatchers] = useState(0);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state === "playing" || state === "loading") {
      // Drop the source rather than just pausing: a paused live stream keeps
      // downloading, and resuming it would play stale audio.
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setState("idle");
      return;
    }

    setState("loading");
    audio.volume = volume;
    audio.src = radio.streamUrl;
    audio.play().catch(() => setState("error"));
  }, [state, volume]);

  const setVolume = useCallback((next: number) => {
    setVolumeState(next);
    if (audioRef.current) audioRef.current.volume = next;
  }, []);

  const watchStatus = useCallback(() => {
    setWatchers((n) => n + 1);
    return () => setWatchers((n) => n - 1);
  }, []);

  const polling = watchers > 0 || state === "playing";
  useEffect(() => {
    if (!polling) return;
    const controller = new AbortController();
    const load = () =>
      fetchRadioStatus(controller.signal).then(setStatus, () => {});
    load();
    const id = window.setInterval(load, STATUS_POLL_MS);
    return () => {
      controller.abort();
      window.clearInterval(id);
    };
  }, [polling]);

  const value = useMemo(
    () => ({ state, status, volume, toggle, setVolume, watchStatus }),
    [state, status, volume, toggle, setVolume, watchStatus],
  );

  return (
    <RadioContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="none"
        onPlaying={() => setState("playing")}
        onWaiting={() => setState((s) => (s === "playing" ? "loading" : s))}
        onError={() => {
          // Clearing the src on stop fires an error too; only a live attempt counts.
          if (audioRef.current?.getAttribute("src")) setState("error");
        }}
      />
    </RadioContext.Provider>
  );
}

export function useRadio(): RadioContextValue {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error("useRadio must be used inside <RadioProvider>");
  return ctx;
}

/** The radio context, plus status polling for as long as the caller is mounted. */
export function useRadioWithStatus(): RadioContextValue {
  const ctx = useRadio();
  const { watchStatus } = ctx;
  useEffect(() => watchStatus(), [watchStatus]);
  return ctx;
}
