"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  GraduationCap,
  Presentation,
  ShieldCheck,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const ROLES = [
  {
    role: "student",
    title: "Student",
    username: "student",
    password: "student123",
    tagline: "Personal outcome dashboard",
    description:
      "Your predicted success probability, risk tier and the exact steps that raise your score.",
    features: ["ASI score gauge", "Risk classification", "Next best steps"],
    icon: GraduationCap,
    accent: "emerald",
  },
  {
    role: "faculty",
    title: "Faculty",
    username: "faculty",
    password: "faculty123",
    tagline: "Class-wide analytics",
    description:
      "How academic indicators shape outcomes across risk profiles, plus the model leaderboard.",
    features: ["Outcome distribution", "Risk zones", "Model leaderboard"],
    icon: Presentation,
    accent: "cyan",
  },
  {
    role: "admin",
    title: "Admin",
    username: "admin",
    password: "admin123",
    tagline: "System control console",
    description:
      "Live system health, dataset stats, model metrics and quick access to every tool.",
    features: ["Ensemble health", "Dataset stats", "Model insights"],
    icon: ShieldCheck,
    accent: "amber",
  },
  {
    role: "advisor",
    title: "Advisor",
    username: "advisor",
    password: "advisor123",
    tagline: "Intervention planner",
    description:
      "Plan per-student interventions with ranked actions that move outcomes the most.",
    features: ["Active cases", "Priority actions", "What-if plans"],
    icon: Compass,
    accent: "teal",
  },
] as const

type Accent = (typeof ROLES)[number]["accent"]

const ACCENTS: Record<Accent, { box: string; border: string }> = {
  emerald: {
    box: "bg-emerald-500/10 text-emerald-300",
    border: "hover:border-emerald-500/40",
  },
  cyan: {
    box: "bg-cyan-500/10 text-cyan-300",
    border: "hover:border-cyan-500/40",
  },
  amber: {
    box: "bg-amber-500/10 text-amber-300",
    border: "hover:border-amber-500/40",
  },
  teal: {
    box: "bg-teal-500/10 text-teal-300",
    border: "hover:border-teal-500/40",
  },
}

export function DemoCards({
  className,
  gridClass = "sm:grid-cols-2 xl:grid-cols-4",
}: {
  className?: string
  gridClass?: string
}) {
  const { login } = useAuth()
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const enter = async (username: string, password: string, role: string) => {
    setPending(role)
    setError(null)
    try {
      await login(username, password)
      router.push("/dashboard")
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Sign-in failed. Please try again."
      )
      setPending(null)
    }
  }

  return (
    <div className={className}>
      <div className={cn("grid gap-4", gridClass)}>
        {ROLES.map((item) => {
          const Icon = item.icon
          const accent = ACCENTS[item.accent]
          const busy = pending === item.role
          return (
            <div
              key={item.role}
              className={cn(
                "card flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-pop",
                accent.border
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    accent.box
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <Badge
                  tone={
                    item.accent === "emerald"
                      ? "green"
                      : item.accent === "amber"
                        ? "amber"
                        : item.accent === "cyan"
                          ? "cyan"
                          : "teal"
                  }
                >
                  {item.title}
                </Badge>
              </div>

              <h3 className="mt-4 text-base font-bold text-ink">{item.title}</h3>
              <p className="text-xs font-semibold text-primary">{item.tagline}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                {item.description}
              </p>

              <ul className="mt-4 space-y-1.5">
                {item.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-1.5 text-xs text-ink-soft"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-5 w-full"
                loading={busy}
                onClick={() =>
                  enter(item.username, item.password, item.role)
                }
              >
                {busy ? "Opening…" : "Enter dashboard"}
                {busy ? null : <ArrowRight className="h-4 w-4" />}
              </Button>
              <p className="mt-2 text-center text-[10px] text-ink-muted">
                {item.username} · {item.password}
              </p>
            </div>
          )
        })}
      </div>

      {error ? (
        <div className="mt-4 rounded-xl bg-rose-500/10 px-3.5 py-3 text-sm text-rose-300 ring-1 ring-rose-500/30">
          {error}
        </div>
      ) : null}
    </div>
  )
}
