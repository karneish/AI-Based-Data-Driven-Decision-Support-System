"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge, Card, EmptyState, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { AnalysisResult, Student } from "@/types";

export function RiskBadge({ color, category }: { color: string; category: string }) {
  const tone =
    color === "green" ? "green" : color === "amber" ? "amber" : "red"
  return <Badge tone={tone}>{category}</Badge>
}

export function StudentRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  )
}

export function StudentRow({
  student,
  analysis,
  loading,
  error,
}: {
  student: Student
  analysis: AnalysisResult | null
  loading: boolean
  error?: string | null
}) {
  return (
    <Link
      href={`/students/${student.id}`}
      className="group flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white/[0.02] p-4 transition hover:border-emerald-500/40 hover:bg-white/[0.04]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/80 to-teal-500/80 text-sm font-bold text-emerald-950">
        {student.name
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{student.name}</p>
        <p className="mt-0.5 text-xs text-ink-soft">
          GPA {student.previous_gpa.toFixed(1)} · {Math.round(student.attendance)}%
          attendance · {Math.round(student.study_hours)} hrs/week
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
      ) : error ? (
        <span className="text-xs text-rose-300">{error}</span>
      ) : analysis ? (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "tabular rounded-lg px-2.5 py-1 text-sm font-bold",
              analysis.risk_color === "green"
                ? "bg-emerald-500/10 text-emerald-300"
                : analysis.risk_color === "amber"
                  ? "bg-amber-500/10 text-amber-300"
                  : "bg-rose-500/10 text-rose-300"
            )}
          >
            ASI {analysis.asi.toFixed(1)}
          </div>
          <RiskBadge color={analysis.risk_color} category={analysis.risk_category} />
          <ArrowUpRight className="h-4 w-4 text-ink-muted transition group-hover:text-emerald-300" />
        </div>
      ) : null}
    </Link>
  )
}

export function RiskTiles({ students, total }: { students: AnalysisResult[]; total: number }) {
  const stable = students.filter((a) => a.risk_color === "green").length
  const monitor = students.filter((a) => a.risk_color === "amber").length
  const intervene = students.filter((a) => a.risk_color === "red").length

  const tiles = [
    { label: "Stable", count: stable, cls: "text-emerald-300", bar: "bg-emerald-400" },
    { label: "Monitor", count: monitor, cls: "text-amber-300", bar: "bg-amber-400" },
    { label: "Intervene", count: intervene, cls: "text-rose-300", bar: "bg-rose-400" },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-2xl border border-line bg-white/[0.02] p-4 text-center">
          <p className={cn("tabular text-2xl font-bold", t.cls)}>{t.count}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{t.label}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className={cn("h-full rounded-full", t.bar)}
              style={{ width: `${total ? (t.count / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ErrorCard({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <Card>
      <EmptyState
        icon={<ArrowUpRight className="h-6 w-6" />}
        title={title}
        body={body}
      />
    </Card>
  )
}
