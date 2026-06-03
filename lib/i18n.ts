import vi from "@/messages/vi.json";
import en from "@/messages/en.json";

export const LOCALES = ["vi", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "vi";

export type Messages = typeof vi;

const dictionaries: Record<Locale, Messages> = { vi, en };

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value !== null && value !== undefined && (LOCALES as readonly string[]).includes(value);
}
