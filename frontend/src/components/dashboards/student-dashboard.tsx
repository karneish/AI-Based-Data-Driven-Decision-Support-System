"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenCheck,
  ClipboardList,
  Clock3,
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
import { api } from "@/lib/api";
import { impactTone, cn } from "@/lib/utils";
import type { AnalysisResult, ReportRecord, Student, User } from "@/types";

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className="tabular font-semibold text-ink">{value}</span>
    </div>
  )
}

export function StudentDashboard({ user }: { user: User }) {
  const [student, setStudent] = useState<Student | null>(null)
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [latest, setLatest] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const students = await api.listStudents()
      const mine = students[0] ?? null
      setStudent(mine)
      const history = await api.listReports()
      setReports(history)
      if (history.length > 0) {
        setLatest(history[0].result)
      } else if (mine) {
        const res = await api.analyzeStudent(mine.id)
        setLatest(res.result)
        setReports((prev) => [res.report, ...prev])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your dashboard")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const runFresh = async () => {
    if (!student || analyzing) return
    setAnalyzing(true)
    try {
      const res = await api.analyzeStudent(student.id)
      setLatest(res.result)
      setReports((prev) => [res.report, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-64" />
        <div className="grid gap-5 xl:grid-cols-3">
          <Skeleton className="h-96 xl:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error && !latest) {
    return (
      <Card>
        <EmptyState
          icon={<BookOpenCheck className="h-6 w-6" />}
          title="Could not load your dashboard"
          body={error}
        />
      </Card>
    )
  }

  const nextSteps = latest?.recommendations.slice(0, 3) ?? []

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

      {latest ? <VerdictConsole result={latest} /> : null}

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          {latest && nextSteps.length > 0 ? (
            <Card>
              <CardHeader
                title="Your next best steps"
                subtitle="Actions predicted to raise your success probability"
                icon={<Lightbulb className="h-4 w-4" />}
              />
              <div className="divide-y divide-line">
                {nextSteps.map((rec, i) => {
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
                                      ...(latest.recommendations.map(
                                        (r) => r.probability_gain
                                      ) ?? [25])
                                    )) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                          <span
                            className={cn("tabular text-sm font-bold", impact.text)}
                          >
                            +{rec.probability_gain.toFixed(1)} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          ) : null}

          <Card className="mt-5">
            <CardHeader
              title="My report history"
              subtitle={
                reports.length
                  ? `${reports.length} analysis report${reports.length > 1 ? "s" : ""} saved to your account`
                  : "No reports saved yet"
              }
              icon={<Clock3 className="h-4 w-4" />}
              action={
                <button
                  onClick={runFresh}
                  disabled={analyzing}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-emerald-950 transition hover:bg-primary-hover disabled:opacity-60"
                >
                  {analyzing ? "Analyzing…" : "Run fresh analysis"}
                </button>
              }
            />
            {reports.length === 0 ? (
              <div className="p-6 text-sm text-ink-soft">
                Run your first analysis to build history here.
              </div>
            ) : (
              <div className="divide-y divide-line">
                {reports.slice(0, 6).map((report) => {
                  const r = report.result
                  return (
                    <div key={report.id} className="flex flex-wrap items-center gap-4 p-4">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                          r.risk_color === "green"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : r.risk_color === "amber"
                              ? "bg-amber-500/10 text-amber-300"
                              : "bg-rose-500/10 text-rose-300"
                        )}
                      >
                        {r.asi.toFixed(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">
                          ASI {r.asi.toFixed(1)} · {r.predicted_class}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {new Date(report.created_at).toLocaleString()}
                        </p>
                      </div>
                      <RiskBadgeInline color={r.risk_color} category={r.risk_category} />
                      <Link
                        href="/reports"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition hover:bg-white/5 hover:text-emerald-300"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader
              title="My profile"
              subtitle="Indicators used for this prediction"
              icon={<ClipboardList className="h-4 w-4" />}
            />
            {student ? (
              <div className="space-y-3 p-5">
                <ProfileRow label="Previous GPA" value={`${student.previous_gpa.toFixed(1)} / 10`} />
                <ProfileRow label="Internal score" value={`${Math.round(student.internal_score)}%`} />
                <ProfileRow label="Study hours" value={`${student.study_hours} hrs / week`} />
                <ProfileRow label="Attendance" value={`${Math.round(student.attendance)}%`} />
                <ProfileRow label="Assignment rate" value={`${Math.round(student.assignment_rate)}%`} />
                <ProfileRow
                  label="Parental education"
                  value={
                    student.parental_education === 0
                      ? "None"
                      : student.parental_education === 1
                        ? "High school"
                        : student.parental_education === 2
                          ? "Undergraduate"
                          : "Postgraduate"
                  }
                />
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink-soft">Internet access</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                    <span className={cn("h-1.5 w-1.5 rounded-full", student.internet_access ? "bg-emerald-400" : "bg-rose-400")} />
                    {student.internet_access ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink-soft">Extracurricular</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                    <span className={cn("h-1.5 w-1.5 rounded-full", student.extracurricular ? "bg-emerald-400" : "bg-rose-400")} />
                    {student.extracurricular ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-sm text-ink-soft">No profile record linked yet.</div>
            )}
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
    </div>
  )
}

function RiskBadgeInline({ color, category }: { color: string; category: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        color === "green"
          ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30"
          : color === "amber"
            ? "bg-amber-500/10 text-amber-300 ring-amber-500/30"
            : "bg-rose-500/10 text-rose-300 ring-rose-500/30"
      )}
    >
      {category}
    </span>
  )
}
