"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  FileText,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import { ReportView } from "@/components/report/report-view";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ReportRecord } from "@/types";

export function ReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await api.listReports()
      setReports(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load reports")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const staff = user?.role === "faculty" || user?.role === "admin" || user?.role === "advisor"

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <PageHeader
        kicker="Saved analyses"
        title="Reports"
        subtitle={
          staff
            ? "Every analysis saved to the database, across the whole platform."
            : "Every analysis saved to your account."
        }
        icon={<FileText className="h-5 w-5" />}
      >
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/25 sm:inline-flex">
          <Sparkles className="h-3.5 w-3.5" /> {reports.length} saved
        </span>
      </PageHeader>

      {loading ? (
        <div className="grid items-start gap-5 xl:grid-cols-3">
          <div className="space-y-5 xl:col-span-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      ) : error ? (
        <Card>
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="Could not load reports"
            body={error}
          />
        </Card>
      ) : reports.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="No reports yet"
            body="Run an analysis from the simulator, or analyze a student from the roster, to save your first report."
          />
        </Card>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-3">
          <div className="min-w-0 space-y-3 xl:col-span-2">
            {reports.map((report) => {
              const r = report.result
              const expanded = expandedId === report.id
              return (
                <Card key={report.id} className="overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expanded ? null : report.id)}
                    className="flex w-full flex-wrap items-center gap-4 p-4 text-left transition hover:bg-white/[0.03]"
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
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
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-ink">
                          {staff ? report.student_name : report.student_name}
                        </p>
                        <span className="text-xs text-ink-muted">
                          {new Date(report.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        ASI {r.asi.toFixed(1)} · {r.predicted_class} ·{" "}
                        {r.ensemble_probability.toFixed(1)}% ensemble
                        {report.created_by ? ` · by ${report.created_by}` : ""}
                      </p>
                    </div>
                    <Badge
                      tone={
                        r.risk_color === "green"
                          ? "green"
                          : r.risk_color === "amber"
                            ? "amber"
                            : "red"
                      }
                    >
                      {r.risk_category}
                    </Badge>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-ink-muted transition-transform",
                        expanded && "rotate-180"
                      )}
                    />
                  </button>
                  {expanded ? (
                    <div className="border-t border-line bg-black/10">
                      <ReportView result={r} />
                    </div>
                  ) : null}
                </Card>
              )
            })}
          </div>

          <div className="min-w-0">
            <Card>
              <CardHeader
                title="Summary"
                subtitle="Distribution across saved reports"
                icon={<Users className="h-4 w-4" />}
              />
              <div className="space-y-3 p-5">
                {(["green", "amber", "red"] as const).map((color) => {
                  const count = reports.filter((x) => x.result.risk_color === color).length
                  const label =
                    color === "green"
                      ? "Stable"
                      : color === "amber"
                        ? "Monitor"
                        : "Intervene"
                  return (
                    <div key={color}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-ink">{label}</span>
                        <span className="tabular font-semibold text-ink-soft">{count}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            color === "green"
                              ? "bg-emerald-400"
                              : color === "amber"
                                ? "bg-amber-400"
                                : "bg-rose-400"
                          )}
                          style={{ width: `${(count / reports.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                <p className="pt-1 text-xs text-ink-soft">
                  Click any report to expand its full verdict.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
