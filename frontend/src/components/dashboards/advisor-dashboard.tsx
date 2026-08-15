"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Compass,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Badge,
  Card,
  CardHeader,
  Skeleton,
} from "@/components/ui";
import { RiskRing } from "@/components/dashboards/risk-ring";
import { useSimulation } from "@/components/dashboards/use-simulation";
import { defaultInput, PRESETS } from "@/components/forms/student-form";
import { impactTone, cn } from "@/lib/utils";
import type { User } from "@/types";

const CASES = [
  { name: "At Risk", profile: PRESETS[2], tag: "Needs urgent attention" },
  { name: "Balanced", profile: PRESETS[0], tag: "Steady trajectory" },
  { name: "High Achiever", profile: PRESETS[1], tag: "Consistently excellent" },
]

const INTERVENTIONS = [
  {
    lever: "Attendance",
    action: "Bring attendance above 80%",
    detail: "Missed classes are the strongest single predictor of slippage.",
  },
  {
    lever: "Study hours",
    action: "Build to 12+ weekly hours",
    detail: "Consistent study beats cramming — schedule fixed blocks.",
  },
  {
    lever: "Assignment rate",
    action: "Submit 80%+ of assignments",
    detail: "Steady submission protects the internal score.",
  },
  {
    lever: "Internal score",
    action: "Target 70+ on internal exams",
    detail: "A low internal score drags the composite ASI down hard.",
  },
]

export function AdvisorDashboard({ user }: { user: User }) {
  const atRisk = useSimulation(defaultInput(PRESETS[2].values))
  const balanced = useSimulation(defaultInput(PRESETS[0].values))
  const highAchiever = useSimulation(defaultInput(PRESETS[1].values))

  const cases = [
    { ...CASES[0], sim: atRisk },
    { ...CASES[1], sim: balanced },
    { ...CASES[2], sim: highAchiever },
  ]

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <PageHeader
        kicker="Advisor cockpit"
        title={`Case planner, ${user.name.split(" ")[0]}`}
        subtitle="Plan interventions per student profile — the ensemble scores each case and ranks the actions that move outcomes the most."
        icon={<Compass className="h-5 w-5" />}
      >
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/25 sm:inline-flex">
          <Sparkles className="h-3.5 w-3.5" /> Ensemble · live
        </span>
      </PageHeader>

      <div className="grid items-start gap-5 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <Card>
            <CardHeader
              title="Active cases"
              subtitle="Three reference profiles scored by the ensemble"
              icon={<GraduationCap className="h-4 w-4" />}
            />
            <div className="space-y-3 p-5">
              {cases.map(({ name, tag, sim }) => {
                const tone = sim.result
                  ? sim.result.risk_color
                  : "green"
                const topRec = sim.result?.recommendations[0]
                return (
                  <div
                    key={name}
                    className={cn(
                      "rounded-2xl border p-4",
                      sim.result?.risk_color === "green"
                        ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                        : sim.result?.risk_color === "amber"
                          ? "border-amber-500/25 bg-amber-500/[0.04]"
                          : "border-line bg-white/[0.02]"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      {sim.loading ? (
                        <Skeleton className="h-16 w-16 rounded-full" />
                      ) : sim.error ? (
                        <p className="text-sm text-rose-300">{sim.error}</p>
                      ) : sim.result ? (
                        <>
                          <RiskRing
                            value={sim.result.ensemble_probability}
                            color={tone as "green" | "amber" | "red"}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-bold text-ink">{name}</p>
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
                            </div>
                            <p className="mt-0.5 text-xs text-ink-muted">{tag}</p>
                            {topRec ? (
                              <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-line bg-white/[0.02] px-3 py-2">
                                <span
                                  className={cn(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                                    impactTone(topRec.impact).badge
                                  )}
                                >
                                  <Target className="h-3.5 w-3.5" />
                                </span>
                                <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">
                                  {topRec.action}
                                </span>
                                <span
                                  className={cn(
                                    "tabular shrink-0 text-xs font-bold",
                                    impactTone(topRec.impact).text
                                  )}
                                >
                                  +{topRec.probability_gain.toFixed(1)} pts
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader
              title="Priority interventions"
              subtitle="What moves outcomes the most"
              icon={<Lightbulb className="h-4 w-4" />}
            />
            <div className="space-y-3 p-5">
              {INTERVENTIONS.map((item) => (
                <div
                  key={item.lever}
                  className="rounded-xl border border-line bg-white/[0.02] p-3"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                    {item.lever}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {item.action}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Link
            href="/simulate"
            className="group flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4 transition hover:border-emerald-500/40 hover:bg-emerald-500/[0.09]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-emerald-950">
              <TrendingUp className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">
                Custom scenario
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-ink-soft">
                Build a specific case in the live simulator
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-emerald-300 transition group-hover:translate-x-0.5" />
          </Link>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
            <p className="text-sm font-semibold text-emerald-300">
              {user.role} access granted
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">
              Case planning and intervention guidance enabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
