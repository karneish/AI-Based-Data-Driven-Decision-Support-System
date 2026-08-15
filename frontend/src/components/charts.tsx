"use client";

import { cn } from "@/lib/utils";
import type { AnalysisResult, ModelMetrics } from "@/types";

const CHART_COLORS = [
  "rgb(var(--chart-forest))",
  "rgb(var(--chart-pine))",
  "rgb(var(--chart-teal))",
  "rgb(var(--chart-emerald))",
  "rgb(var(--chart-gold))",
];

export type MetricKey =
  | "accuracy"
  | "precision"
  | "recall"
  | "f1_score"
  | "auc"
  | "cv_score";

export function Gauge({
  value,
  size = 180,
  label,
  color = "#34d399",
}: {
  value: number
  size?: number
  label?: string
  color?: string
}) {
  const stroke = 14
  const radius = (size - stroke * 2) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const filled = (clamped / 100) * circumference

  const polar = (angleDeg: number, r: number) => {
    const rad = ((angleDeg - 180) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }
  const start = polar(0, radius)
  const end = polar(180, radius)

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 8}>
        <path
          d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`}
          fill="none"
          stroke="#232b27"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          className="tabular font-bold"
          fontSize={size * 0.2}
          fill="#edf4f0"
        >
          {Math.round(clamped)}
        </text>
        <text
          x={cx}
          y={cy + size * 0.11}
          textAnchor="middle"
          fontSize={11}
          fill="#7d9086"
        >
          {label ?? "out of 100"}
        </text>
      </svg>
    </div>
  )
}

export function RiskTierScale({
  value,
  thresholds,
}: {
  value: number
  thresholds: { stable: number; monitor: number }
}) {
  const marks = [
    { at: 0, label: "0" },
    { at: thresholds.monitor * 100, label: `Monitor ${Math.round(thresholds.monitor * 100)}` },
    { at: thresholds.stable * 100, label: `Stable ${Math.round(thresholds.stable * 100)}` },
    { at: 100, label: "100" },
  ]
  return (
    <div>
      <div
        className="relative h-3 w-full overflow-hidden rounded-full"
        style={{
          background: "linear-gradient(to right, #fb7185, #fbbf24 45%, #34d399 75%, #10b981)",
        }}
      >
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-ink shadow-lg transition-all duration-500"
          style={{ left: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-medium text-ink-soft">
        {marks.map((m) => (
          <span key={m.at}>{m.label}</span>
        ))}
      </div>
    </div>
  )
}

export function RadarPanel({ data }: { data: Record<string, number> }) {
  const rows = Object.entries(data).map(([subject, value]) => ({
    subject,
    value,
  }))
  const angle = 360 / rows.length
  return (
    <svg viewBox="0 0 340 260" className="w-full">
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <polygon
          key={r}
          points={rows
            .map((row, i) => {
              const rad = ((i * angle - 90) * Math.PI) / 180
              return `${170 + 105 * r * Math.cos(rad)},${130 + 105 * r * Math.sin(rad)}`
            })
            .join(" ")}
          fill="none"
          stroke="#232b27"
          strokeWidth={1}
        />
      ))}
      {rows.map((row, i) => {
        const rad = ((i * angle - 90) * Math.PI) / 180
        return (
          <g key={row.subject}>
            <line
              x1={170}
              y1={130}
              x2={170 + 105 * Math.cos(rad)}
              y2={130 + 105 * Math.sin(rad)}
              stroke="#232b27"
              strokeWidth={1}
            />
            <circle
              cx={170 + 105 * Math.cos(rad)}
              cy={130 + 105 * Math.sin(rad)}
              r={3}
              fill="#34d399"
            />
            <text
              x={170 + 125 * Math.cos(rad)}
              y={130 + 125 * Math.sin(rad) + 4}
              textAnchor="middle"
              fontSize={11}
              fill="#a6b7ad"
              fontWeight={500}
            >
              {row.subject}
            </text>
          </g>
        )
      })}
      <polygon
        points={rows
          .map((row, i) => {
            const rad = ((i * angle - 90) * Math.PI) / 180
            const r = (row.value / 100) * 105
            return `${170 + r * Math.cos(rad)},${130 + r * Math.sin(rad)}`
          })
          .join(" ")}
        fill="rgba(16,185,129,0.14)"
        stroke="#10b981"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function BenchmarkChart({ data }: { data: AnalysisResult["bar_data"] }) {
  const max = 100
  return (
    <div className="space-y-4">
      {data.map((d) => {
        const scorePct = (d.score / max) * 100
        const benchPct = (d.benchmark / max) * 100
        return (
          <div key={d.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-ink">{d.label}</span>
              <span className="tabular font-semibold text-ink-soft">
                {d.score.toFixed(1)} <span className="text-ink-muted">/ 100</span>
              </span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  d.score >= d.benchmark ? "bg-emerald-500" : "bg-amber-400"
                )}
                style={{ width: `${scorePct}%` }}
              />
              <div
                className="absolute top-[-3px] h-[16px] w-[2px] bg-ink/40"
                style={{ left: `${benchPct}%` }}
                title={`Benchmark ${d.benchmark}`}
              />
            </div>
          </div>
        )
      })}
      <div className="flex items-center gap-4 pt-1 text-[11px] text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> At / above benchmark
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Below benchmark
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded bg-ink/40" /> Benchmark
        </span>
      </div>
    </div>
  )
}

export function ModelBars({
  probs,
  threshold,
}: {
  probs: { model: string; probability: number }[]
  threshold: number
}) {
  return (
    <div className="space-y-3.5">
      {probs.map((p) => (
        <div key={p.model}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-ink">{p.model}</span>
            <span className="tabular font-semibold text-ink-soft">
              {p.probability.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                p.probability >= threshold ? "bg-primary" : "bg-rose-400"
              )}
              style={{ width: `${Math.min(100, p.probability)}%` }}
            />
            <div
              className="absolute top-[-3px] h-[16px] w-[2px] bg-ink/50"
              style={{ left: `${threshold}%` }}
              title={`Success threshold ${threshold.toFixed(1)}%`}
            />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 pt-1 text-[11px] text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" /> Passes threshold
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-400" /> Below threshold
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded bg-ink/50" /> Threshold {threshold.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}

export function FeatureList({
  items,
}: {
  items: { feature: string; importance: number }[]
}) {
  const max = Math.max(...items.map((i) => i.importance), 0.0001)
  return (
    <div className="space-y-3.5">
      {items.map((item, idx) => (
        <div key={item.feature}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-ink">{item.feature}</span>
            <span className="tabular font-semibold text-ink-soft">
              {(item.importance * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(item.importance / max) * 100}%`,
                background: CHART_COLORS[idx % CHART_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MetricsRadar({
  models,
  metric,
}: {
  models: ModelMetrics[]
  metric: MetricKey
}) {
  const n = models.length
  const angle = 360 / n
  const metricLabel = metric.replace(/_/g, " ").toUpperCase()
  return (
    <svg viewBox="0 0 340 260" className="w-full">
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <polygon
          key={r}
          points={models
            .map((m, i) => {
              const rad = ((i * angle - 90) * Math.PI) / 180
              return `${170 + 100 * r * Math.cos(rad)},${130 + 100 * r * Math.sin(rad)}`
            })
            .join(" ")}
          fill="none"
          stroke="#232b27"
          strokeWidth={1}
        />
      ))}
      {models.map((m, i) => {
        const rad = ((i * angle - 90) * Math.PI) / 180
        return (
          <g key={m.model}>
            <line
              x1={170}
              y1={130}
              x2={170 + 100 * Math.cos(rad)}
              y2={130 + 100 * Math.sin(rad)}
              stroke="#232b27"
              strokeWidth={1}
            />
            <text
              x={170 + 125 * Math.cos(rad)}
              y={130 + 125 * Math.sin(rad) + 4}
              textAnchor="middle"
              fontSize={10.5}
              fill="#a6b7ad"
              fontWeight={500}
            >
              {m.model.replace(" Gradient Boosting", " GB")}
            </text>
          </g>
        )
      })}
      <polygon
        points={models
          .map((m, i) => {
            const rad = ((i * angle - 90) * Math.PI) / 180
            const r = ((m[metric] / 100) * 100)
            return `${170 + r * Math.cos(rad)},${130 + r * Math.sin(rad)}`
          })
          .join(" ")}
        fill="rgba(16,185,129,0.14)"
        stroke="#10b981"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <text x={170} y={248} textAnchor="middle" fontSize={11} fill="#7d9086">
        {metricLabel}
      </text>
    </svg>
  )
}

export function MetricBars({ models }: { models: ModelMetrics[] }) {
  const metrics: { key: MetricKey; label: string }[] = [
    { key: "accuracy", label: "Accuracy" },
    { key: "precision", label: "Precision" },
    { key: "recall", label: "Recall" },
    { key: "f1_score", label: "F1 Score" },
    { key: "auc", label: "ROC AUC" },
    { key: "cv_score", label: "CV Score" },
  ]
  return (
    <div className="space-y-4">
      {metrics.map((metric) => {
        const best = Math.max(...models.map((m) => m[metric.key] as number))
        return (
          <div key={metric.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-ink">{metric.label}</span>
              <span className="tabular text-ink-muted">{best.toFixed(1)}% best</span>
            </div>
            <div className="space-y-1.5">
              {models.map((m) => {
                const v = m[metric.key] as number
                return (
                  <div key={m.model} className="flex items-center gap-2">
                    <span className="w-32 truncate text-[11px] text-ink-soft">
                      {m.model}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          v === best ? "bg-primary" : "bg-white/15"
                        )}
                        style={{ width: `${v}%` }}
                      />
                    </div>
                    <span className="tabular w-10 text-right text-[11px] font-semibold text-ink">
                      {v.toFixed(1)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
