"use client";

import { useState } from "react";
import { ClipboardList, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ZoneLabel } from "@/components/layout/zone-label";
import { StudentForm } from "@/components/forms/student-form";
import { ReportSkeleton, ReportView } from "@/components/report/report-view";
import { Card, CardHeader, EmptyState } from "@/components/ui";
import type { AnalysisResult } from "@/types";

export default function AnalyzePage() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <PageHeader
        kicker="Decision support"
        title="Student Analysis"
        subtitle="Enter the student's academic indicators and get a complete ensemble dashboard — every model scored, risk classified and counterfactual recommendations ranked."
        icon={<ClipboardList className="h-5 w-5" />}
      >
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/25 sm:inline-flex">
          <Sparkles className="h-3.5 w-3.5" /> 5-model ensemble · live
        </span>
      </PageHeader>

      <div className="relative grid items-start gap-6 xl:grid-cols-[380px_1fr]">
        <div className="xl:sticky xl:top-24">
          <ZoneLabel index="01" title="Student input" hint="Analyze a profile" />
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader
              title="Student profile"
              subtitle="Eight indicators drive the prediction"
              icon={<ClipboardList className="h-4 w-4" />}
            />
            <div className="p-5">
              <StudentForm
                mode="analyze"
                onResult={setResult}
                onLoading={setLoading}
              />
            </div>
          </Card>
        </div>

        <div className="min-w-0">
          <ZoneLabel index="02" title="Decision report" hint="Ensemble analysis dashboard" />
          {loading ? (
            <ReportSkeleton />
          ) : result ? (
            <ReportView result={result} />
          ) : (
            <Card>
              <EmptyState
                icon={<ClipboardList className="h-6 w-6" />}
                title="No analysis yet"
                body="Fill in the student profile in Zone 01 and run the analysis to see the ensemble dashboard — all five models scored, risk classified and counterfactual recommendations ranked."
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
