import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { leftIcon, rightSlot, className, ...rest },
  ref,
) {
  return (
    <div
      className={cn(
        "flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-100",
        className,
      )}
    >
      {leftIcon && <span className="text-ink-subtle">{leftIcon}</span>}
      <input
        ref={ref}
        className="h-full flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-subtle"
        {...rest}
      />
      {rightSlot}
    </div>
  );
});
