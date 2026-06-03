"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import { CommandPalette, CommandPaletteShortcut } from "@/components/CommandPalette";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { useMobileNav } from "./MobileNavStore";

export function Topbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const openNav = useMobileNav((s) => s.openNav);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(-2)
        .map((s) => s[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-line bg-white px-4 md:px-6">
      <button
        type="button"
        aria-label="Mở menu"
        onClick={openNav}
        className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:bg-surface md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden flex-1 items-center gap-3 md:flex">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-line bg-white px-3 text-left text-sm text-ink-subtle hover:border-brand/60"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1">Tìm trang, AI engine, hành động...</span>
          <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] text-ink-muted">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 md:flex-none md:gap-3">
        <div className="hidden md:block">
          <LocaleSwitcher />
        </div>
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-label="Tìm kiếm"
          className="grid h-9 w-9 place-items-center rounded-pill bg-surface hover:bg-slate-100 md:hidden"
        >
          <Search className="h-4 w-4 text-ink-muted" />
        </button>

        <button
          type="button"
          aria-label="Thông báo"
          className="relative grid h-9 w-9 place-items-center rounded-pill bg-surface hover:bg-slate-100"
        >
          <Bell className="h-4 w-4 text-ink-muted" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-pill bg-danger" />
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-pill p-1 hover:bg-surface"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="hidden text-right md:block">
              <div className="text-sm font-medium text-ink">
                {status === "loading" ? "..." : (user?.pharmacyName ?? "Khách")}
              </div>
              <div className="text-xs text-ink-muted">{user?.name ?? "Chưa đăng nhập"}</div>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-pill bg-gradient-to-br from-brand to-accent text-sm font-semibold text-white">
              {initials}
            </div>
            <ChevronDown
              className={cn(
                "hidden h-4 w-4 text-ink-subtle transition-transform md:block",
                menuOpen && "rotate-180",
              )}
            />
          </button>

          {menuOpen && user && (
            <div
              role="menu"
              className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white shadow-card"
            >
              <div className="border-b border-line px-4 py-3">
                <div className="text-sm font-semibold text-ink">{user.name}</div>
                <div className="text-xs text-ink-muted">{user.email}</div>
                <div className="mt-1 inline-flex rounded-pill bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand">
                  {user.role === "owner"
                    ? "Chủ nhà thuốc"
                    : user.role === "admin"
                      ? "Quản trị"
                      : "Dược sĩ"}
                </div>
              </div>
              <ul className="py-1 text-sm">
                <li>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-surface"
                  >
                    <User className="h-4 w-4 text-ink-muted" /> Tài khoản
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-surface"
                  >
                    <Settings className="h-4 w-4 text-ink-muted" /> Cài đặt
                  </button>
                </li>
              </ul>
              <div className="border-t border-line px-3 py-2">
                <div className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
                  Giao diện
                </div>
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-surface p-1 text-xs">
                  {(
                    [
                      { id: "light", label: "Sáng", icon: Sun },
                      { id: "dark", label: "Tối", icon: Moon },
                      { id: "system", label: "Auto", icon: Monitor },
                    ] as const
                  ).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTheme(id)}
                      aria-pressed={theme === id}
                      className={cn(
                        "flex items-center justify-center gap-1 rounded-md px-2 py-1.5 transition-colors",
                        theme === id
                          ? "bg-white text-brand shadow-soft"
                          : "text-ink-muted hover:text-ink",
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-line py-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CommandPaletteShortcut onOpen={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
