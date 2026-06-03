import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortDir } from "@/hooks/useSortable";

interface SortHeaderProps {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right";
}

export function SortHeader({ label, active, dir, onClick, align = "left" }: SortHeaderProps) {
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors",
        active ? "text-brand" : "text-ink-muted hover:text-ink",
        align === "right" && "ml-auto",
      )}
    >
      {label}
      <Icon className="h-3 w-3" />
    </button>
  );
}
