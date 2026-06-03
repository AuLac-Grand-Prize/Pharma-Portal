"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClass = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

export function Modal({ open, onOpenChange, title, description, children, footer, size = "md" }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-card focus:outline-none data-[state=open]:animate-in data-[state=open]:zoom-in-95",
            sizeClass[size],
          )}
        >
          <header className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-ink">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-0.5 text-sm text-ink-muted">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Đóng"
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-subtle hover:bg-surface"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </header>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
          {footer && (
            <footer className="flex items-center justify-end gap-2 border-t border-line bg-surface px-6 py-3">
              {footer}
            </footer>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
