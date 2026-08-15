"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { StudentForm } from "@/components/forms/student-form";
import { ReportSkeleton, ReportView } from "@/components/report/report-view";
import { Card, CardHeader, EmptyState } from "@/components/ui";
import type { AnalysisResult } from "@/types";

export default function DashboardPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <div className="xl:sticky xl:top-24 xl:self-start">
        <Card>
          <CardHeader
            title="Student analysis"
            subtitle="Enter academic indicators to generate a full AI report"
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
        {loading ? (
          <ReportSkeleton />
        ) : result ? (
          <ReportView result={result} />
        ) : (
          <Card>
            <EmptyState
              icon={<ClipboardList className="h-6 w-6" />}
              title="No analysis yet"
              body="Fill in the student profile on the left and run the analysis to see a complete decision report with risk classification, model agreement and counterfactual recommendations."
            />
          </Card>
        )}
      </div>
    </div>
  )
}
