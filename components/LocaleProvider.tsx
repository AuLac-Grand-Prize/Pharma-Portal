"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_LOCALE, getMessages, isLocale, type Locale, type Messages } from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = "pharmalink.locale";

function lookup(messages: Messages, path: string): string {
  const segments = path.split(".");
  let cursor: unknown = messages;
  for (const seg of segments) {
    if (cursor && typeof cursor === "object" && seg in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[seg];
    } else {
      return path;
    }
  }
  return typeof cursor === "string" ? cursor : path;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) setLocaleState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const messages = getMessages(locale);
  const value: LocaleContextValue = {
    locale,
    messages,
    setLocale: (next) => {
      window.localStorage.setItem(STORAGE_KEY, next);
      setLocaleState(next);
    },
    t: (path) => lookup(messages, path),
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}
