import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TableScrollProps {
  children: ReactNode;
  className?: string;
}

export function TableScroll({ children, className }: TableScrollProps) {
  return (
    <div
      className={cn(
        "-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0 [scrollbar-width:thin]",
        className,
      )}
    >
      <div className="min-w-[720px]">{children}</div>
    </div>
  );
}
