"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { StudentForm } from "@/components/forms/student-form";
import { ReportSkeleton, ReportView } from "@/components/report/report-view";
import { Card, CardHeader, EmptyState } from "@/components/ui";
import type { AnalysisResult } from "@/types";

export default function SimulatePage() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <div className="xl:sticky xl:top-24 xl:self-start">
        <Card>
          <CardHeader
            title="What-if simulator"
            subtitle="Adjust any indicator — the report recomputes automatically"
            icon={<SlidersHorizontal className="h-4 w-4" />}
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
        {loading ? (
          <ReportSkeleton />
        ) : result ? (
          <ReportView result={result} />
        ) : (
          <Card>
            <EmptyState
              icon={<SlidersHorizontal className="h-6 w-6" />}
              title="Move a slider to simulate"
              body="The report updates live as you change study hours, attendance, GPA or any other indicator — try finding the combination that pushes a student into the stable zone."
            />
          </Card>
        )}
      </div>
    </div>
  )
}
