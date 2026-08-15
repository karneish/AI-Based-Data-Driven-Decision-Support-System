"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { Logo } from "@/components/layout/logo";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/simulate",
    label: "Simulator",
    icon: SlidersHorizontal,
  },
  {
    href: "/models",
    label: "Model Insights",
    icon: BarChart3,
  },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const handleLogout = useCallback(() => {
    logout()
    router.push("/")
  }, [logout, router])

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const navLinks = (onNavigate?: () => void) =>
    NAV_ITEMS.map((item) => {
      const active =
        pathname === item.href || pathname.startsWith(`${item.href}/`)
      const Icon = item.icon
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
            active
              ? "bg-primary-soft text-primary"
              : "text-ink-soft hover:bg-primary-soft/60 hover:text-primary"
          )}
        >
          <Icon className="h-4 w-4" />
          {item.label}
        </Link>
      )
    })

  const userMenu = (mobile = false) => (
    <div className={cn("flex items-center gap-3", mobile && "w-full")}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-700 text-xs font-bold text-white">
        {initials}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
        <p className="text-xs capitalize text-ink-muted">{user.role}</p>
      </div>
      <button
        onClick={handleLogout}
        title="Sign out"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted transition hover:bg-rose-50 hover:text-rose-600"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" aria-label="DSS-MIP dashboard">
            <Logo />
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">{navLinks()}</nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 lg:flex">
              <ShieldCheck className="h-3 w-3" />
              Free AI engine · no data stored
            </span>
            <div className="hidden md:block">{userMenu()}</div>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft md:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="border-t border-line bg-surface px-4 pb-4 pt-2 md:hidden">
            <nav className="flex flex-col gap-1">{navLinks(() => setOpen(false))}</nav>
            <div className="mt-3 border-t border-line pt-3">{userMenu(true)}</div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>

      <footer className="no-print mx-auto flex w-full max-w-7xl flex-col items-center gap-1 px-4 pb-6 text-center text-xs text-ink-muted sm:px-6 lg:px-8">
        <p className="flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" /> DSS-MIP · Decision Support System for
          Machine Intelligence in Performance
        </p>
        <p>Built with Next.js, TypeScript, FastAPI and scikit-learn</p>
      </footer>
    </div>
  )
}
