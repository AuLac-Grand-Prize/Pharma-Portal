"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LineChart,
  LogOut,
  Package,
  Pill,
  ScanLine,
  Search,
  ShoppingCart,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  group: "Trang" | "AI Engines" | "Hành động";
  icon: LucideIcon;
  keywords?: string[];
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const items = useMemo<CommandItem[]>(() => {
    const go = (href: string) => {
      router.push(href);
      onOpenChange(false);
    };
    return [
      { id: "pos", group: "Trang", label: "POS bán hàng", icon: ShoppingCart, run: () => go("/pos") },
      { id: "inventory", group: "Trang", label: "Tồn kho", icon: Package, run: () => go("/inventory") },
      { id: "customers", group: "Trang", label: "Khách hàng", icon: Users, run: () => go("/customers"), keywords: ["benh nhan"] },
      { id: "rx", group: "Trang", label: "Đơn thuốc", icon: FileText, run: () => go("/prescriptions") },
      { id: "patient-care", group: "Trang", label: "Chăm sóc bệnh nhân", icon: Stethoscope, run: () => go("/patient-care") },
      { id: "analytics", group: "Trang", label: "Dashboard", icon: LayoutDashboard, run: () => go("/analytics") },
      { id: "compliance", group: "Trang", label: "Tuân thủ", icon: ClipboardList, run: () => go("/compliance") },
      { id: "vietdrug", group: "AI Engines", label: "VietDrug AI", icon: Pill, keywords: ["tuong tac", "interaction"], run: () => go("/engines/vietdrug") },
      { id: "rxv", group: "AI Engines", label: "PrescriptionVision", icon: ScanLine, keywords: ["ocr", "scan"], run: () => go("/engines/prescription-vision") },
      { id: "gpt", group: "AI Engines", label: "PharmaGPT-VN", icon: Bot, keywords: ["chat", "ai"], run: () => go("/engines/pharmagpt") },
      { id: "df", group: "AI Engines", label: "DemandForecast", icon: LineChart, keywords: ["du bao", "forecast"], run: () => go("/engines/demand-forecast") },
      { id: "logout", group: "Hành động", label: "Đăng xuất", icon: LogOut, run: () => signOut({ callbackUrl: "/login" }) },
    ];
  }, [router, onOpenChange]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const hay = [it.label, it.group, ...(it.keywords ?? [])].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  useEffect(() => setActive(0), [query, open]);
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    }
  }

  // Group filtered items by group label, preserving order
  const grouped: Record<string, CommandItem[]> = {};
  filtered.forEach((it) => {
    grouped[it.group] = grouped[it.group] ? [...grouped[it.group]!, it] : [it];
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-[15%] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-white shadow-card focus:outline-none data-[state=open]:animate-in data-[state=open]:zoom-in-95">
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <div className="flex items-center gap-2 border-b border-line px-4">
            <Search className="h-4 w-4 text-ink-subtle" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKey}
              placeholder="Tìm trang, AI engine, hành động..."
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-subtle"
            />
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] text-ink-muted">ESC</kbd>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-ink-muted">
                Không có kết quả nào khớp.
              </div>
            )}
            {Object.entries(grouped).map(([group, list]) => (
              <div key={group} className="mb-2">
                <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  {group}
                </div>
                <ul>
                  {list.map((it) => {
                    const idx = filtered.indexOf(it);
                    const isActive = idx === active;
                    return (
                      <li key={it.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setActive(idx)}
                          onClick={it.run}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            isActive ? "bg-brand-50 text-brand" : "text-ink hover:bg-surface",
                          )}
                        >
                          <it.icon className="h-4 w-4" />
                          <span className="flex-1">{it.label}</span>
                          {isActive && <ArrowRight className="h-3.5 w-3.5" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function CommandPaletteShortcut({
  onOpen,
}: {
  onOpen: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpen();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onOpen]);
  return null;
}
