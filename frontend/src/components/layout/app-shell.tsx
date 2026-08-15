"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
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
    description: "Run a full analysis",
    icon: LayoutDashboard,
  },
  {
    href: "/simulate",
    label: "Simulator",
    description: "What-if scenarios",
    icon: SlidersHorizontal,
  },
  {
    href: "/models",
    label: "Model Insights",
    description: "Compare five models",
    icon: BarChart3,
  },
]

function UserChip({
  user,
  onLogout,
}: {
  user: { name: string; role: string }
  onLogout: () => void
}) {
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <div className="border-t border-line p-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 text-xs font-bold text-white">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
          <p className="text-xs capitalize text-ink-muted">{user.role}</p>
        </div>
        <button
          onClick={onLogout}
          title="Sign out"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex-1 space-y-1 p-3">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
              active
                ? "bg-primary-soft text-primary"
                : "text-ink-soft hover:bg-slate-100 hover:text-ink"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition",
                active
                  ? "bg-white text-primary shadow-sm"
                  : "bg-slate-100 text-ink-soft group-hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="block text-[11px] text-ink-muted">
                {item.description}
              </span>
            </span>
            {active ? <ChevronRight className="ml-auto h-4 w-4" /> : null}
          </Link>
        )
      })}
    </nav>
  )
}

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

  const title = NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label ?? "Dashboard"

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-line px-4">
          <Logo />
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <NavLinks />
          <UserChip user={user} onLogout={handleLogout} />
        </div>
      </aside>

      <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden" style={{ display: open ? undefined : "none" }} onClick={() => setOpen(false)} />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-surface transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <Logo />
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <NavLinks onNavigate={() => setOpen(false)} />
          <UserChip user={user} onLogout={handleLogout} />
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur-md lg:px-8">
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <h1 className="text-base font-bold tracking-tight text-ink lg:text-lg">
          {title}
        </h1>
        <div className="ml-auto flex items-center gap-2 text-ink-muted">
          <span className="hidden items-center gap-1.5 text-xs sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Free AI engine · no data stored
          </span>
          <span className="hidden h-4 w-px bg-line-strong md:block" />
          <span className="hidden items-center gap-1.5 text-xs md:flex">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="tabular font-semibold text-emerald-600">Online</span>
          </span>
        </div>
      </header>

      <main className="p-4 lg:p-8">{children}</main>

      <footer className="no-print flex flex-col items-center gap-1 border-t border-line px-4 py-6 text-center text-xs text-ink-muted lg:pl-8">
        <p className="flex items-center gap-1.5">
          <Settings2 className="h-3 w-3" /> DSS-MIP · Decision Support System for
          Machine Intelligence in Performance
        </p>
        <p>Built with Next.js, TypeScript, FastAPI and scikit-learn</p>
      </footer>
    </div>
  )
}
