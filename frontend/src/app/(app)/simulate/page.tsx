"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ZoneLabel } from "@/components/layout/zone-label";
import { StudentForm } from "@/components/forms/student-form";
import { ReportSkeleton, ReportView } from "@/components/report/report-view";
import { VerdictConsole } from "@/components/report/verdict-console";
import { Card, EmptyState, Skeleton } from "@/components/ui";
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
      />

      <div className="space-y-6">
        <section>
          <ZoneLabel index="01" title="Live verdict" hint="Recomputes on every change" />
          {loading ? (
            <div className="overflow-hidden rounded-3xl">
              <Skeleton className="h-64" />
            </div>
          ) : result ? (
            <VerdictConsole result={result} />
          ) : (
            <Card>
              <EmptyState
                icon={<SlidersHorizontal className="h-6 w-6" />}
                title="Warming up the ensemble"
                body="The first verdict is being generated right now — tweak any control below to explore different outcomes."
              />
            </Card>
          )}
        </section>

        <section>
          <ZoneLabel index="02" title="Control deck" hint="Eight indicators, five models" />
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-teal-400 to-emerald-500" />
            <div className="p-5 sm:p-6">
              <StudentForm
                onResult={setResult}
                onLoading={setLoading}
                initial={{ name: "Simulation" }}
              />
            </div>
          </Card>
        </section>

        <section>
          <ZoneLabel index="03" title="Ensemble report" hint="Full model breakdown" />
          {loading ? (
            <ReportSkeleton />
          ) : result ? (
            <ReportView result={result} />
          ) : null}
        </section>
      </div>
    </div>
  )
}
