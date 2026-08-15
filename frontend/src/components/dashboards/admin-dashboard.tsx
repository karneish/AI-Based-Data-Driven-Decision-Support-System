"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Cpu,
  Crosshair,
  Database,
  LayoutDashboard,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardHeader,
  EmptyState,
  Skeleton,
  StatCard,
} from "@/components/ui";
import {
  ModelLeaderboardHeader,
  ModelLeaderboardList,
} from "@/components/dashboards/model-leaderboard-list";
import { useModelComparison } from "@/components/dashboards/use-model-comparison";
import { formatNumber } from "@/lib/utils";
import type { User } from "@/types";

const ACTIONS = [
  {
    href: "/simulate",
    title: "Outcome simulator",
    body: "Drag indicators and watch the live verdict recompute.",
    icon: SlidersHorizontal,
  },
  {
    href: "/models",
    title: "Model insights",
    body: "Accuracy, precision, F1 and confusion matrices for all five.",
    icon: Trophy,
  },
]

export function AdminDashboard({ user }: { user: User }) {
  const { data, error } = useModelComparison()
  const best = data?.models.find((m) => m.model === data.best_model) ?? null
  const avgAccuracy = data
    ? data.models.reduce((sum, m) => sum + m.accuracy, 0) / data.models.length
    : 0

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <PageHeader
        kicker="Admin console"
        title={`Welcome, ${user.name}`}
        subtitle="Live system control — ensemble health, model performance and infrastructure at a glance."
        icon={<LayoutDashboard className="h-5 w-5" />}
      >
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/25 sm:inline-flex">
          <Sparkles className="h-3.5 w-3.5" /> Ensemble online · live
        </span>
      </PageHeader>

      {error ? (
        <Card>
          <EmptyState
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Could not load the overview"
            body={error}
          />
        </Card>
      ) : !data ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="ML models"
              value="5"
              sub="active in the ensemble"
              icon={<Cpu className="h-4 w-4" />}
              tone="primary"
            />
            <StatCard
              label="Best model"
              value={data.best_model}
              sub={`${best ? best.accuracy.toFixed(1) : "0.0"}% test accuracy`}
              icon={<Trophy className="h-4 w-4" />}
              tone="green"
            />
            <StatCard
              label="Ensemble accuracy"
              value={`${avgAccuracy.toFixed(1)}%`}
              sub="average across all five"
              icon={<Target className="h-4 w-4" />}
              tone="cyan"
            />
            <StatCard
              label="Best precision"
              value={best ? `${best.precision.toFixed(1)}%` : "0.0%"}
              sub="leader model"
              icon={<Crosshair className="h-4 w-4" />}
              tone="teal"
            />
            <StatCard
              label="Dataset"
              value={formatNumber(data.dataset_info.total_samples, 0)}
              sub="synthetic students in memory"
              icon={<Database className="h-4 w-4" />}
              tone="amber"
            />
          </div>

          <div className="mt-5 grid items-start gap-5 xl:grid-cols-3">
            <div className="min-w-0 xl:col-span-2">
              <Card>
                <CardHeader
                  title="Model leaderboard"
                  subtitle="All five models ranked by test accuracy"
                  icon={<TrendingUp className="h-4 w-4" />}
                  action={<ModelLeaderboardHeader bestModel={data.best_model} />}
                />
                <div className="p-5">
                  <ModelLeaderboardList
                    models={data.models}
                    bestModel={data.best_model}
                  />
                </div>
              </Card>
            </div>

            <div className="min-w-0 space-y-5">
              <Card>
                <CardHeader
                  title="Quick actions"
                  subtitle="Jump into any tool"
                  icon={<Zap className="h-4 w-4" />}
                />
                <div className="space-y-2.5 p-4">
                  {ACTIONS.map((action) => {
                    const Icon = action.icon
                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="group flex items-center gap-3 rounded-2xl border border-line bg-white/[0.02] p-4 transition hover:border-emerald-500/40 hover:bg-emerald-500/[0.05]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 transition group-hover:bg-emerald-500 group-hover:text-emerald-950">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink">
                            {action.title}
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-ink-soft">
                            {action.body}
                          </span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:text-emerald-300" />
                      </Link>
                    )
                  })}
                </div>
              </Card>

              <Card>
                <CardHeader
                  title="Dataset detail"
                  subtitle="Synthetic training corpus"
                  icon={<Database className="h-4 w-4" />}
                />
                <div className="space-y-2.5 p-5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-ink-soft">Total samples</span>
                    <span className="tabular font-semibold text-ink">
                      {formatNumber(data.dataset_info.total_samples, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-ink-soft">Train / test split</span>
                    <span className="tabular font-semibold text-ink">
                      {formatNumber(data.dataset_info.train_samples, 0)} /{" "}
                      {formatNumber(data.dataset_info.test_samples, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-ink-soft">Features</span>
                    <span className="tabular font-semibold text-ink">
                      {data.dataset_info.features}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-ink-soft">Classes</span>
                    <span className="text-right font-semibold text-ink">
                      {data.dataset_info.classes.join(" · ")}
                    </span>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader
                  title="System status"
                  subtitle="Everything green, nothing stored"
                  icon={<ShieldCheck className="h-4 w-4" />}
                />
                <div className="space-y-2.5 p-5">
                  <div className="flex items-center gap-2.5 text-sm text-ink-soft">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Ensemble — five models online
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-ink-soft">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Privacy — zero student data stored
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-ink-soft">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Engine — FastAPI · scikit-learn · in memory
                  </div>
                </div>
              </Card>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                <p className="text-sm font-semibold text-emerald-300">
                  {user.role} access granted
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Full system visibility — all dashboards and tools enabled.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
