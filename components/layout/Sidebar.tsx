"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Bot,
  Brain,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LineChart,
  Package,
  Pill,
  ScanLine,
  ShoppingCart,
  Stethoscope,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileNav } from "./MobileNavStore";

const PRIMARY_NAV = [
  { href: "/pos", label: "POS bán hàng", icon: ShoppingCart },
  { href: "/inventory", label: "Tồn kho", icon: Package },
  { href: "/customers", label: "Khách hàng", icon: Users },
  { href: "/prescriptions", label: "Đơn thuốc", icon: FileText },
  { href: "/patient-care", label: "Chăm sóc bệnh nhân", icon: Stethoscope },
  { href: "/analytics", label: "Dashboard", icon: LayoutDashboard },
  { href: "/compliance", label: "Tuân thủ", icon: ClipboardList },
];

const ENGINES_NAV = [
  { href: "/engines/vietdrug", label: "VietDrug AI", icon: Pill, hue: "text-brand" },
  { href: "/engines/prescription-vision", label: "PrescriptionVision", icon: ScanLine, hue: "text-accent" },
  { href: "/engines/pharmagpt", label: "PharmaGPT-VN", icon: Bot, hue: "text-violet-500" },
  { href: "/engines/demand-forecast", label: "DemandForecast", icon: LineChart, hue: "text-emerald-500" },
];

export function Sidebar() {
  const pathname = usePathname();
  const open = useMobileNav((s) => s.open);
  const close = useMobileNav((s) => s.close);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (open) {
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open, close]);

  return (
    <>
      {open && (
        <button
          aria-label="Đóng menu"
          onClick={close}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col border-r border-line bg-white transition-transform duration-200 md:static md:translate-x-0",
          open ? "translate-x-0 shadow-card" : "-translate-x-full",
        )}
        aria-label="Điều hướng chính"
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-accent text-white">
              <Brain className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-ink">PharmLink AI</span>
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label="Đóng"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-subtle hover:bg-surface md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
          <NavSection label="Vận hành" items={PRIMARY_NAV} pathname={pathname} />
          <NavSection label="AI Engines" items={ENGINES_NAV} pathname={pathname} />
        </nav>
      </aside>
    </>
  );
}

interface NavSectionProps {
  label: string;
  items: { href: string; label: string; icon: LucideIcon; hue?: string }[];
  pathname: string;
}

function NavSection({ label, items, pathname }: NavSectionProps) {
  return (
    <div>
      <div className="px-2 pb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
        {label}
      </div>
      <div className="space-y-0.5">
        {items.map(({ href, label: itemLabel, icon: Icon, hue }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-brand-50 font-medium text-brand"
                  : "text-slate-700 hover:bg-surface hover:text-ink",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", !active && hue)} />
              <span className="truncate">{itemLabel}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
