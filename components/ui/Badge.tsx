import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "success" | "warn" | "danger";

const toneClass: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-brand-50 text-brand-700",
  success: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
