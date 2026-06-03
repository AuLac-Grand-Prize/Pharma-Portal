"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

type Tone = "danger" | "warn" | "info";

const TONE_STYLES: Record<Tone, { iconBg: string; icon: string }> = {
  danger: { iconBg: "bg-red-50", icon: "text-red-600" },
  warn: { iconBg: "bg-amber-50", icon: "text-amber-600" },
  info: { iconBg: "bg-brand-50", icon: "text-brand" },
};

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  tone?: Tone;
  icon?: LucideIcon;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  destructive?: boolean;
  children?: ReactNode;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  tone = "warn",
  icon: Icon = AlertTriangle,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  onConfirm,
  onCancel,
  destructive = false,
  children,
}: AlertDialogProps) {
  const styles = TONE_STYLES[tone];
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-card focus:outline-none data-[state=open]:animate-in data-[state=open]:zoom-in-95">
          <div className="flex items-start gap-4">
            <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-pill", styles.iconBg)}>
              <Icon className={cn("h-5 w-5", styles.icon)} />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-base font-semibold text-ink">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-ink-muted">
                  {description}
                </Dialog.Description>
              )}
              {children && <div className="mt-3">{children}</div>}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                onCancel?.();
                onOpenChange(false);
              }}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={destructive ? "danger" : "primary"}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
