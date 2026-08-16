"use client";

import Link from "next/link";
import {
  Activity,
  BookOpen,
  Database,
  Layers,
  PlusCircle,
  Presentation,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
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
import { StudentRow, StudentRowSkeleton, RiskTiles } from "@/components/dashboards/shared";
import { computeClassStats, useClassRows } from "@/components/dashboards/use-class";
import { useModelComparison } from "@/components/dashboards/use-model-comparison";
import { formatNumber } from "@/lib/utils";
import type { User } from "@/types";

export function FacultyDashboard({ user }: { user: User }) {
  const { data, error: cmpError } = useModelComparison()
  const { rows, loading, error } = useClassRows()

  const best = data?.models.find((m) => m.model === data.best_model) ?? null
  const avgAccuracy = data
    ? data.models.reduce((sum, m) => sum + m.accuracy, 0) / data.models.length
    : 0

  const stats = computeClassStats(rows)

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <PageHeader
        kicker="Faculty view"
        title={`Class overview, ${user.name.split(" ")[0]}`}
        subtitle="Track how academic indicators shape outcomes across your class — live risk distribution, roster and model performance."
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
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="Class size"
              value={formatNumber(stats.total || rows.length, 0)}
              sub="students in roster"
              icon={<Users className="h-4 w-4" />}
              tone="primary"
            />
            <StatCard
              label="Average ASI"
              value={stats.avgAsi ? stats.avgAsi.toFixed(1) : "—"}
              sub="composite across class"
              icon={<Target className="h-4 w-4" />}
              tone="green"
            />
            <StatCard
              label="Best model"
              value={data ? data.best_model : "…"}
              sub={`${best ? best.accuracy.toFixed(1) : "0.0"}% test accuracy`}
              icon={<Trophy className="h-4 w-4" />}
              tone="cyan"
            />
            <StatCard
              label="Ensemble accuracy"
              value={`${avgAccuracy ? avgAccuracy.toFixed(1) : "0.0"}%`}
              sub="average across all five"
              icon={<Activity className="h-4 w-4" />}
              tone="teal"
            />
            <StatCard
              label="Features"
              value={data ? data.dataset_info.features : "8"}
              sub="academic indicators"
              icon={<Layers className="h-4 w-4" />}
              tone="amber"
            />
          </div>

          <div className="mt-5 grid items-start gap-5 xl:grid-cols-3">
            <div className="min-w-0 xl:col-span-2">
              <Card>
                <CardHeader
                  title="Class risk distribution"
                  subtitle="Live ensemble verdicts across the roster"
                  icon={<ShieldAlert className="h-4 w-4" />}
                  action={
                    <Link href="/students" className="group flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:text-emerald-300">
                      <PlusCircle className="h-3.5 w-3.5" /> Manage roster
                    </Link>
                  }
                />
                <div className="p-5">
                  <RiskTiles
                    students={rows.filter((r) => r.analysis).map((r) => r.analysis!)}
                    total={rows.length}
                  />
                </div>
              </Card>

              <Card className="mt-5">
                <CardHeader
                  title="Student roster"
                  subtitle="Click a student for profile, analysis and history"
                  icon={<Users className="h-4 w-4" />}
                />
                <div className="space-y-2.5 p-4">
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => <StudentRowSkeleton key={i} />)
                    : rows.map((row) => (
                        <StudentRow
                          key={row.student.id}
                          student={row.student}
                          analysis={row.analysis}
                          loading={row.loading}
                          error={row.error}
                        />
                      ))}
                  {!loading && rows.length === 0 ? (
                    <p className="px-2 py-6 text-center text-sm text-ink-soft">
                      No students in the roster yet.
                    </p>
                  ) : null}
                </div>
              </Card>
            </div>

            <div className="min-w-0 space-y-5">
              <Card>
                <CardHeader
                  title="What drives success"
                  subtitle="Feature importance — Random Forest"
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <div className="p-5">
                  <ImportanceList />
                </div>
              </Card>

              <Card>
                <CardHeader
                  title="Interpreting the class"
                  subtitle="How to read the risk distribution"
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

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                <p className="text-sm font-semibold text-emerald-300">
                  {user.role} access granted
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Class-level analytics, roster management and per-student
                  analysis enabled.
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
                  action={
                    data ? <ModelLeaderboardHeader bestModel={data.best_model} /> : null
                  }
                />
                <div className="p-5">
                  {data ? (
                    <ModelLeaderboardList models={data.models} bestModel={data.best_model} />
                  ) : cmpError ? (
                    <p className="text-sm text-rose-300">{cmpError}</p>
                  ) : (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12" />
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="min-w-0">
              <Card>
                <CardHeader
                  title="Dataset"
                  subtitle="Synthetic training corpus"
                  icon={<Database className="h-4 w-4" />}
                />
                <div className="space-y-2.5 p-5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-ink-soft">Total samples</span>
                    <span className="tabular font-semibold text-ink">
                      {data ? formatNumber(data.dataset_info.total_samples, 0) : "1,000"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-ink-soft">Train / test</span>
                    <span className="tabular font-semibold text-ink">
                      {data
                        ? `${data.dataset_info.train_samples} / ${data.dataset_info.test_samples}`
                        : "800 / 200"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-ink-soft">Classes</span>
                    <Badge tone="neutral">{data ? data.dataset_info.classes.join(" · ") : "…"}</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ImportanceList() {
  const items = [
    { feature: "Attendance", importance: 0.31 },
    { feature: "Previous GPA", importance: 0.24 },
    { feature: "Study Hours", importance: 0.18 },
    { feature: "Internal Score", importance: 0.13 },
    { feature: "Assignment Rate", importance: 0.09 },
    { feature: "Parental Education", importance: 0.05 },
  ]
  const max = items[0].importance
  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.feature} className="flex items-center gap-2.5 text-sm">
          <span className="w-32 shrink-0 text-ink-soft">{item.feature}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
              style={{ width: `${(item.importance / max) * 100}%` }}
            />
          </div>
          <span className="tabular w-12 text-right text-xs font-semibold text-ink">
            {item.importance.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  )
}
