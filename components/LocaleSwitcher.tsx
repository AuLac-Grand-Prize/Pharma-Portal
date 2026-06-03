"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { LOCALES, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LABELS: Record<Locale, string> = { vi: "VI", en: "EN" };

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();
  return (
    <div
      role="group"
      aria-label="Chọn ngôn ngữ"
      className="flex items-center gap-1 rounded-pill border border-line bg-white p-0.5 text-xs"
    >
      {!compact && (
        <span className="px-1.5 text-ink-subtle">
          <Languages className="h-3 w-3" />
        </span>
      )}
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={cn(
            "rounded-pill px-2.5 py-1 font-medium transition-colors",
            locale === l ? "bg-brand text-white" : "text-ink-muted hover:text-ink",
          )}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
