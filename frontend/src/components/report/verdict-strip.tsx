"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn, formatNumber, riskTone } from "@/lib/utils";
import type { AnalysisResult } from "@/types";
import { Badge } from "@/components/ui";

export function VerdictStrip({ result }: { result: AnalysisResult }) {
  const tone = riskTone(result.risk_color)
  const border = {
    green: "border-emerald-500/30",
    amber: "border-amber-500/30",
    red: "border-rose-500/30",
  }[result.risk_color]
  const glow = {
    green: "bg-emerald-500/10",
    amber: "bg-amber-500/10",
    red: "bg-rose-500/10",
  }[result.risk_color]

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6",
        border,
        tone.gradient
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full blur-3xl",
          glow
        )}
      />
      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-wrap items-center gap-5">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1",
              tone.badge
            )}
          >
            {result.risk_color === "green" ? (
              <CheckCircle2 className="h-7 w-7" />
            ) : (
              <AlertTriangle className="h-7 w-7" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-ink-soft">
                Ensemble verdict
              </p>
              <Badge
                tone={
                  result.risk_color === "green"
                    ? "green"
                    : result.risk_color === "amber"
                      ? "amber"
                      : "red"
                }
              >
                {result.risk_category}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className={cn("tabular text-4xl font-bold tracking-tight", tone.text)}>
                {result.ensemble_probability.toFixed(1)}%
              </span>
              <span className="text-sm text-ink-soft">
                chance of reaching <span className="font-semibold text-ink">{result.predicted_class}</span>
              </span>
            </div>
            <div className="mt-4 h-2 max-w-xl overflow-hidden rounded-full bg-white/5">
              <div
                className={cn("h-full rounded-full", tone.bar)}
                style={{
                  width: `${Math.min(100, result.ensemble_probability)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 lg:min-w-[340px]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <p className="text-[10px] uppercase tracking-wide text-ink-muted">ASI</p>
            <p className={cn("tabular mt-1 text-xl font-bold", tone.text)}>
              {formatNumber(result.asi)}
            </p>
            <p className="mt-0.5 text-[10px] text-ink-muted">Academic index</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <p className="text-[10px] uppercase tracking-wide text-ink-muted">Confidence</p>
            <p className="tabular mt-1 text-xl font-bold text-ink">
              {result.confidence.toFixed(1)}%
            </p>
            <p className="mt-0.5 text-[10px] text-ink-muted">Cross-model</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <p className="text-[10px] uppercase tracking-wide text-ink-muted">Threshold</p>
            <p className="tabular mt-1 text-xl font-bold text-ink">
              {result.class_threshold.toFixed(1)}%
            </p>
            <p className="mt-0.5 text-[10px] text-ink-muted">Youden cutoff</p>
          </div>
        </div>
      </div>
    </div>
  )
}
