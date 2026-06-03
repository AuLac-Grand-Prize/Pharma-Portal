"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastTone = "success" | "info" | "error";

interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (input: Omit<ToastItem, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: Omit<ToastItem, "id">) => {
      const id = crypto.randomUUID();
      setItems((prev) => [...prev, { ...input, id }]);
      window.setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title, description) => toast({ tone: "success", title, description }),
      error: (title, description) => toast({ tone: "error", title, description }),
      info: (title, description) => toast({ tone: "info", title, description }),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-live="polite"
        aria-label="Thông báo"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
      >
        {items.map((t) => (
          <ToastItemView key={t.id} item={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const TONE_STYLES: Record<ToastTone, { icon: typeof Info; cls: string }> = {
  success: { icon: CheckCircle2, cls: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  info: { icon: Info, cls: "border-brand-200 bg-brand-50 text-brand-700" },
  error: { icon: AlertCircle, cls: "border-red-200 bg-red-50 text-red-700" },
};

function ToastItemView({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const tone = TONE_STYLES[item.tone];
  const Icon = tone.icon;
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-card",
        tone.cls,
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <div className="mt-0.5 text-xs opacity-80">{item.description}</div>
        )}
      </div>
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="grid h-6 w-6 place-items-center rounded text-current/70 hover:bg-white/40"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
