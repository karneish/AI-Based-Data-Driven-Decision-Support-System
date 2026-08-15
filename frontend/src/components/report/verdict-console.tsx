"use client";

import { Trophy } from "lucide-react";
import { cn, formatNumber, riskTone } from "@/lib/utils";
import type { AnalysisResult } from "@/types";
import { Badge } from "@/components/ui";

const RADIUS = 68
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const RING_COLORS: Record<string, string> = {
  green: "#34d399",
  amber: "#fbbf24",
  red: "#f87171",
}

const GLOW: Record<string, string> = {
  green: "bg-emerald-500/10",
  amber: "bg-amber-500/10",
  red: "bg-rose-500/10",
}

const BORDER: Record<string, string> = {
  green: "border-emerald-500/30",
  amber: "border-amber-500/30",
  red: "border-rose-500/30",
}

export function VerdictConsole({ result }: { result: AnalysisResult }) {
  const tone = riskTone(result.risk_color)
  const color = RING_COLORS[result.risk_color]
  const pct = Math.min(100, Math.max(0, result.ensemble_probability))
  const offset = CIRCUMFERENCE * (1 - pct / 100)
  const bestModel = result.all_model_probs.reduce((a, b) =>
    b.probability > a.probability ? b : a
  ).model

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 md:p-8",
        BORDER[result.risk_color],
        tone.gradient
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full blur-3xl",
          GLOW[result.risk_color]
        )}
      />
      <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-center">
        <div className="relative h-44 w-44 shrink-0">
          <svg width="176" height="176" viewBox="0 0 176 176" className="h-44 w-44 -rotate-90">
            <circle
              cx="88"
              cy="88"
              r={RADIUS}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="88"
              cy="88"
              r={RADIUS}
              stroke={color}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              style={{
                transition: "stroke-dashoffset 600ms cubic-bezier(0.22,1,0.36,1)",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("tabular text-4xl font-bold tracking-tight", tone.text)}>
              {pct.toFixed(1)}%
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
              Success prob
            </span>
          </div>
        </div>

        <div className="w-full min-w-0 flex-1 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
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
            <Badge tone="primary">{bestModel}</Badge>
          </div>

          <div>
            <p className="text-2xl font-bold tracking-tight text-ink">
              {pct.toFixed(1)}% chance of reaching{" "}
              <span className={tone.text}>{result.predicted_class}</span>
            </p>
            <div className="mt-4 h-2 max-w-xl overflow-hidden rounded-full bg-white/10">
              <div
                className={cn("h-full rounded-full", tone.bar)}
                style={{
                  width: `${pct}%`,
                  transition: "width 600ms cubic-bezier(0.22,1,0.36,1)",
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
              <p className="text-[10px] uppercase tracking-wide text-ink-muted">ASI</p>
              <p className={cn("tabular mt-1 text-lg font-bold", tone.text)}>
                {formatNumber(result.asi)}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-ink-muted">Academic index</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
              <p className="text-[10px] uppercase tracking-wide text-ink-muted">Confidence</p>
              <p className="tabular mt-1 text-lg font-bold text-ink">
                {result.confidence.toFixed(1)}%
              </p>
              <p className="mt-0.5 truncate text-[10px] text-ink-muted">Cross-model</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
              <p className="text-[10px] uppercase tracking-wide text-ink-muted">Threshold</p>
              <p className="tabular mt-1 text-lg font-bold text-ink">
                {result.class_threshold.toFixed(1)}%
              </p>
              <p className="mt-0.5 truncate text-[10px] text-ink-muted">Youden cutoff</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
              <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-ink-muted">
                <Trophy className="h-3 w-3 text-amber-300" /> Best model
              </p>
              <p className="mt-1 truncate text-lg font-bold text-ink">{bestModel}</p>
              <p className="mt-0.5 truncate text-[10px] text-ink-muted">Ensemble leader</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
