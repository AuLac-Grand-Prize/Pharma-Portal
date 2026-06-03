import { cn } from "@/lib/utils";
import type { InteractionAlert } from "@/types/domain";

const map: Record<InteractionAlert["severity"], { label: string; cls: string }> = {
  low: { label: "Nhẹ", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  moderate: { label: "Trung bình", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  high: { label: "Nặng", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  contraindicated: { label: "Chống chỉ định", cls: "bg-red-50 text-red-700 border-red-200" },
};

interface SeverityPillProps {
  severity: InteractionAlert["severity"];
  className?: string;
}

export function SeverityPill({ severity, className }: SeverityPillProps) {
  const item = map[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border px-2.5 py-0.5 text-xs font-medium",
        item.cls,
        className,
      )}
    >
      {item.label}
    </span>
  );
}
