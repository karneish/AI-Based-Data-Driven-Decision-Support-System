"use client";

import { useState } from "react";
import { SlidersHorizontal, Zap } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ZoneLabel } from "@/components/layout/zone-label";
import { StudentForm } from "@/components/forms/student-form";
import { ReportSkeleton, ReportView } from "@/components/report/report-view";
import { VerdictStrip } from "@/components/report/verdict-strip";
import { Card, CardHeader, EmptyState, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/types";

export default function SimulatePage() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <PageHeader
        kicker="What-if analysis"
        title="Outcome Simulator"
        subtitle="Drag any indicator and watch the ensemble verdict recompute live — find the levers that move a student into the stable zone."
        icon={<SlidersHorizontal className="h-5 w-5" />}
      >
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition",
            loading
              ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25"
              : "bg-white/5 text-ink-soft ring-white/10"
          )}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75",
                !loading && "hidden"
              )}
            />
            <span
              className={cn(
                "relative inline-flex h-1.5 w-1.5 rounded-full",
                loading ? "bg-emerald-400" : "bg-ink-muted"
              )}
            />
          </span>
          {loading ? "Recomputing…" : "Live · updates on change"}
        </span>
      </PageHeader>

      {loading || result ? (
        <div className="mb-6">
          {loading ? (
            <div className="overflow-hidden rounded-3xl">
              <Skeleton className="h-44" />
            </div>
          ) : result ? (
            <VerdictStrip result={result} />
          ) : null}
        </div>
      ) : null}

      <div className="relative grid items-start gap-6 xl:grid-cols-[380px_1fr]">
        <div className="xl:sticky xl:top-24">
          <ZoneLabel index="01" title="Simulation controls" hint="Drag to change" />
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-teal-400 to-emerald-500" />
            <CardHeader
              title="What-if controls"
              subtitle="Adjust indicators — results follow instantly"
              icon={<Zap className="h-4 w-4" />}
            />
            <div className="p-5">
              <StudentForm
                mode="simulate"
                onResult={setResult}
                onLoading={setLoading}
                initial={{ name: "Simulation" }}
              />
            </div>
          </Card>
        </div>

        <div className="min-w-0">
          <ZoneLabel index="02" title="Live results" hint="Recomputes on every change" />
          {loading ? (
            <ReportSkeleton />
          ) : result ? (
            <ReportView result={result} />
          ) : (
            <Card>
              <EmptyState
                icon={<SlidersHorizontal className="h-6 w-6" />}
                title="Move a slider to simulate"
                body="Drag any control in Zone 01 and the live verdict appears instantly — try finding the combination that pushes a student into the stable zone."
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
