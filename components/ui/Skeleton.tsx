import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-slate-200/70 via-slate-100 to-slate-200/70 [background-size:200%_100%]",
        className,
      )}
      {...rest}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ width: `${Math.max(40, 100 - i * 12)}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-4 rounded-pill" />
      </div>
      <Skeleton className="mt-3 h-7 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl border border-line bg-white shadow-soft">
      <div className="border-b border-line p-5">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid items-center gap-4 p-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: cols }).map((__, c) => (
              <Skeleton key={c} className="h-3" style={{ width: c === 1 ? "85%" : "60%" }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
