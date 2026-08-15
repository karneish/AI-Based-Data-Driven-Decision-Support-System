"use client";

import {
  Activity,
  BookOpen,
  Cpu,
  Database,
  Layers,
  Presentation,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Badge,
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
import { RiskRing } from "@/components/dashboards/risk-ring";
import { useModelComparison } from "@/components/dashboards/use-model-comparison";
import { useSimulation } from "@/components/dashboards/use-simulation";
import { defaultInput, PRESETS } from "@/components/forms/student-form";
import { FeatureList } from "@/components/charts";
import { cn, formatNumber } from "@/lib/utils";
import type { User } from "@/types";

const RISK_TILES = [
  { profile: PRESETS[2], tag: "At-risk profile" },
  { profile: PRESETS[0], tag: "Balanced profile" },
  { profile: PRESETS[1], tag: "High-achiever profile" },
]

export function FacultyDashboard({ user }: { user: User }) {
  const { data, error } = useModelComparison()
  const atRisk = useSimulation(defaultInput(PRESETS[2].values))
  const balanced = useSimulation(defaultInput(PRESETS[0].values))
  const highAchiever = useSimulation(defaultInput(PRESETS[1].values))
  const drivers = useSimulation(defaultInput(PRESETS[0].values))

  const scenarios = [
    { ...RISK_TILES[0], sim: atRisk },
    { ...RISK_TILES[1], sim: balanced },
    { ...RISK_TILES[2], sim: highAchiever },
  ]

  const best = data?.models.find((m) => m.model === data.best_model) ?? null
  const avgAccuracy = data
    ? data.models.reduce((sum, m) => sum + m.accuracy, 0) / data.models.length
    : 0

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <PageHeader
        kicker="Faculty view"
        title={`Class overview, ${user.name.split(" ")[0]}`}
        subtitle="Track how academic indicators shape outcomes across risk profiles — distribution, drivers and model performance in one place."
        icon={<Presentation className="h-5 w-5" />}
      >
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/25 sm:inline-flex">
          <Sparkles className="h-3.5 w-3.5" /> Ensemble · live
        </span>
      </PageHeader>

      {error ? (
        <Card>
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="Could not load the class overview"
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
              label="Class size"
              value={formatNumber(data.dataset_info.total_samples, 0)}
              sub="synthetic students"
              icon={<Database className="h-4 w-4" />}
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
              label="Features"
              value={data.dataset_info.features}
              sub="academic indicators"
              icon={<Layers className="h-4 w-4" />}
              tone="teal"
            />
            <StatCard
              label="Risk zones"
              value="3"
              sub="stable · monitor · intervene"
              icon={<ShieldAlert className="h-4 w-4" />}
              tone="amber"
            />
          </div>

          <div className="mt-5 grid items-start gap-5 xl:grid-cols-3">
            <div className="min-w-0 xl:col-span-2">
              <Card>
                <CardHeader
                  title="Outcome distribution"
                  subtitle="Three reference profiles scored by the ensemble"
                  icon={<Activity className="h-4 w-4" />}
                />
                <div className="grid gap-3 p-5 sm:grid-cols-3">
                  {scenarios.map(({ profile, tag, sim }) => {
                    const tone = sim.result
                      ? sim.result.risk_color
                      : "green"
                    return (
                      <div
                        key={profile.name}
                        className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white/[0.02] p-4 text-center"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                          <Cpu className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            {profile.name}
                          </p>
                          <p className="text-[10px] uppercase tracking-wide text-ink-muted">
                            {tag}
                          </p>
                        </div>
                        {sim.loading ? (
                          <div className="flex h-16 w-16 items-center justify-center">
                            <Skeleton className="h-16 w-16 rounded-full" />
                          </div>
                        ) : sim.error ? (
                          <p className="px-2 text-xs text-rose-300">{sim.error}</p>
                        ) : sim.result ? (
                          <>
                            <RiskRing
                              value={sim.result.ensemble_probability}
                              color={tone as "green" | "amber" | "red"}
                            />
                            <Badge
                              tone={
                                sim.result.risk_color === "green"
                                  ? "green"
                                  : sim.result.risk_color === "amber"
                                    ? "amber"
                                    : "red"
                              }
                            >
                              {sim.result.risk_category}
                            </Badge>
                            <p className="text-xs text-ink-soft">
                              {sim.result.predicted_class}
                            </p>
                          </>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>

            <div className="min-w-0">
              <Card>
                <CardHeader
                  title="What drives success"
                  subtitle="Feature importance — Random Forest"
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <div className="p-5">
                  {drivers.loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-5" />
                      ))}
                    </div>
                  ) : drivers.error ? (
                    <p className="text-sm text-rose-300">{drivers.error}</p>
                  ) : drivers.result ? (
                    <FeatureList items={drivers.result.feature_importance} />
                  ) : null}
                </div>
              </Card>

              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                <p className="text-sm font-semibold text-emerald-300">
                  {user.role} access granted
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Class-level analytics and outcome distribution enabled.
                </p>
              </div>
            </div>
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

            <div className="min-w-0">
              <Card className={cn("h-full")}>
                <CardHeader
                  title="Interpreting the class"
                  subtitle="How to read the distribution"
                  icon={<BookOpen className="h-4 w-4" />}
                />
                <div className="space-y-3 p-5 text-sm text-ink-soft">
                  <p>
                    <span className="font-semibold text-emerald-300">Stable</span>{" "}
                    — likely to complete with strong outcomes; keep them engaged.
                  </p>
                  <p>
                    <span className="font-semibold text-amber-300">Monitor</span>{" "}
                    — track attendance and assignment submission weekly.
                  </p>
                  <p>
                    <span className="font-semibold text-rose-300">Intervene</span>{" "}
                    — schedule one-on-one coaching; raise study hours and
                    internal score first.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
