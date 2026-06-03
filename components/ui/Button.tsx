import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-pill font-medium shadow-soft transition-colors disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white hover:bg-brand-dark",
        secondary: "border border-brand bg-white text-brand hover:bg-brand-50",
        ghost: "bg-transparent text-ink hover:bg-surface",
        danger: "bg-danger text-white hover:bg-red-600",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, ...rest },
  ref,
) {
  return (
    <button ref={ref} className={cn(buttonStyles({ variant, size }), className)} {...rest} />
  );
});
