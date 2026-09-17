"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { copy, type Dictionary } from "@/i18n/copy";
import type { Locale } from "@/types";

const STORAGE_KEY = "onhouse.lang";

/**
 * The chosen language is held in a tiny external store rather than component
 * state. The server always snapshots "en"; the client reads the stored choice
 * on its first snapshot, so there is no hydration mismatch and no
 * setState-in-effect.
 */
let current: Locale | null = null;
const listeners = new Set<() => void>();

function readLang(): Locale {
  if (current) return current;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "es") current = stored;
  } catch {
    // Private mode / blocked storage — fall through to the default.
  }
  current ??= "en";
  return current;
}

function writeLang(next: Locale) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // The choice simply will not persist.
  }
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

type LanguageValue = {
  lang: Locale;
  /** Dictionary for the active language. */
  t: Dictionary;
  toggleLang: () => void;
  /** Label on the toggle: shows the language you would switch *to*. */
  langLabel: string;
};

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readLang, () => "en" as Locale);

  // Keep the document language in step for assistive tech and hyphenation.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = useCallback(() => {
    writeLang(readLang() === "en" ? "es" : "en");
  }, []);

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      t: copy[lang],
      toggleLang,
      langLabel: lang === "en" ? "ES" : "EN",
    }),
    [lang, toggleLang],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useLanguage must be used inside a LanguageProvider");
  }
  return value;
}
