import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: ReactNode;
  delta?: string;
  tone?: "up" | "down" | "neutral";
  icon?: ReactNode;
  className?: string;
}

export function Stat({ label, value, delta, tone = "neutral", icon, className }: StatProps) {
  return (
    <div className={cn("rounded-2xl border border-line bg-white p-5 shadow-soft", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-muted">{label}</span>
        {icon && <span className="text-brand">{icon}</span>}
      </div>
      <div className="mt-2 text-2xl font-bold text-ink">{value}</div>
      {delta && (
        <div
          className={cn(
            "mt-1 text-xs font-medium",
            tone === "up" && "text-emerald-600",
            tone === "down" && "text-red-600",
            tone === "neutral" && "text-ink-muted",
          )}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
