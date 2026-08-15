"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenCheck,
  ClipboardList,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Target,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import { VerdictConsole } from "@/components/report/verdict-console";
import { useSimulation } from "@/components/dashboards/use-simulation";
import { defaultInput } from "@/components/forms/student-form";
import { impactTone, cn } from "@/lib/utils";
import type { AnalysisResult, User } from "@/types";

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className="tabular font-semibold text-ink">{value}</span>
    </div>
  )
}

function StepsCard({ result }: { result: AnalysisResult }) {
  return (
    <Card>
      <CardHeader
        title="Your next best steps"
        subtitle="Actions predicted to raise your success probability"
        icon={<Lightbulb className="h-4 w-4" />}
      />
      <div className="divide-y divide-line">
        {result.recommendations.slice(0, 3).map((rec, i) => {
          const impact = impactTone(rec.impact)
          return (
            <div key={rec.action} className="flex gap-4 p-5">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                  impact.badge
                )}
              >
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">
                    {rec.action}
                  </span>
                  <Badge
                    tone={
                      rec.impact === "High"
                        ? "green"
                        : rec.impact === "Medium"
                          ? "amber"
                          : "neutral"
                    }
                  >
                    {rec.impact} impact
                  </Badge>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {rec.detail}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={cn("h-full rounded-full", impact.bar)}
                      style={{
                        width: `${Math.min(
                          100,
                          (rec.probability_gain /
                            Math.max(
                              25,
                              ...result.recommendations.map(
                                (r) => r.probability_gain
                              )
                            )) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className={cn("tabular text-sm font-bold", impact.text)}>
                    +{rec.probability_gain.toFixed(1)} pts
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export function StudentDashboard({ user }: { user: User }) {
  const { result, loading, error } = useSimulation(defaultInput())

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <PageHeader
        kicker="My dashboard"
        title={`Hi, ${user.name.split(" ")[0]}`}
        subtitle="Your predicted outcome at a glance — what the ensemble sees for your current profile and the steps that would help the most."
        icon={<GraduationCap className="h-5 w-5" />}
      >
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/25 sm:inline-flex">
          <Sparkles className="h-3.5 w-3.5" /> Student · personal
        </span>
      </PageHeader>

      {loading ? (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-3xl">
            <Skeleton className="h-64" />
          </div>
          <div className="grid gap-5 xl:grid-cols-3">
            <Skeleton className="h-96 xl:col-span-2" />
            <Skeleton className="h-96" />
          </div>
        </div>
      ) : error ? (
        <Card>
          <EmptyState
            icon={<BookOpenCheck className="h-6 w-6" />}
            title="Could not load your outcome"
            body={error}
          />
        </Card>
      ) : result ? (
        <>
          <VerdictConsole result={result} />

          <div className="mt-5 grid items-start gap-5 xl:grid-cols-3">
            <div className="min-w-0 xl:col-span-2">
              <StepsCard result={result} />
            </div>

            <div className="min-w-0 space-y-5">
              <Card>
                <CardHeader
                  title="Your profile"
                  subtitle="Indicators used for this prediction"
                  icon={<ClipboardList className="h-4 w-4" />}
                />
                <div className="space-y-3 p-5">
                  <ProfileRow
                    label="Previous GPA"
                    value="7.5 / 10"
                  />
                  <ProfileRow label="Internal score" value="70%" />
                  <ProfileRow label="Study hours" value="12 hrs / week" />
                  <ProfileRow label="Attendance" value="85%" />
                  <ProfileRow label="Assignment rate" value="80%" />
                  <ProfileRow
                    label="Parental education"
                    value="Undergraduate"
                  />
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-ink-soft">Internet access</span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Yes
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-ink-soft">Extracurricular</span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Yes
                    </span>
                  </div>
                </div>
              </Card>

              <Link
                href="/simulate"
                className="group flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4 transition hover:border-emerald-500/40 hover:bg-emerald-500/[0.09]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-emerald-950">
                  <Target className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">
                    Explore your what-ifs
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-soft">
                    Change your indicators in the live simulator
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-emerald-300 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
