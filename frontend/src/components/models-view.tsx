"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Award,
  BarChart3,
  CircleAlert,
  Database,
  RefreshCw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ModelComparisonData, ModelMetrics } from "@/types";
import { Badge, Button, Card, CardHeader, Skeleton } from "@/components/ui";
import { FeatureList, MetricBars, MetricsRadar } from "@/components/charts";
import type { MetricKey } from "@/components/charts";

const METRIC_COLUMNS: { key: MetricKey; label: string }[] = [
  { key: "accuracy", label: "Accuracy" },
  { key: "precision", label: "Precision" },
  { key: "recall", label: "Recall" },
  { key: "f1_score", label: "F1 Score" },
  { key: "auc", label: "ROC AUC" },
  { key: "cv_score", label: "CV Score" },
]

function ConfusionMatrix({ matrix, labels }: { matrix: number[][]; labels: string[] }) {
  const max = Math.max(...matrix.flat(), 1)
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">Confusion matrix</span>
        <span className="text-xs text-ink-muted">Test set · actual vs predicted</span>
      </div>
      <div className="space-y-1.5">
        {matrix.map((row, r) => (
          <div key={r} className="flex items-center gap-1.5">
            <span className="w-32 truncate pr-1 text-right text-[11px] font-medium text-ink-soft">
              {labels[r]}
            </span>
            <div className="flex flex-1 gap-1.5">
              {row.map((cell, c) => (
                <div
                  key={c}
                  className="relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-lg"
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "rgb(var(--primary))",
                      opacity: 0.12 + (cell / max) * 0.55,
                    }}
                  />
                  <span className="tabular relative text-sm font-bold text-ink">
                    {cell}
                  </span>
                </div>
              ))}
            </div>
            <span className="w-40 truncate pl-1 text-[11px] font-medium text-ink-soft">
              {labels[r]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ModelsView() {
  const [data, setData] = useState<ModelComparisonData | null>(null)
  const [importance, setImportance] = useState<{ feature: string; importance: number }[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<ModelMetrics | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [comparison, fi] = await Promise.all([
        api.modelComparison(),
        api.featureImportance(),
      ])
      setData(comparison)
      setImportance(fi.feature_importance)
      setSelected(
        comparison.models.find((m) => m.model === comparison.best_model) ??
          comparison.models[0] ??
          null
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load model insights. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-28" />
        <Skeleton className="h-80" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-4 p-12 text-center">
          <CircleAlert className="h-8 w-8 text-rose-500" />
          <p className="max-w-md text-sm text-ink-soft">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </Button>
        </div>
      </Card>
    )
  }

  const stats = [
    {
      label: "Dataset samples",
      value: data.dataset_info.total_samples.toLocaleString(),
      icon: <Database className="h-4 w-4" />,
    },
    {
      label: "Training / test split",
      value: `${data.dataset_info.train_samples} / ${data.dataset_info.test_samples}`,
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "Features",
      value: data.dataset_info.features,
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      label: "Classes",
      value: data.dataset_info.classes.length,
      icon: <Award className="h-4 w-4" />,
    },
  ]

  return (
    <div className="animate-fade-up space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                {s.label}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                {s.icon}
              </span>
            </div>
            <div className="tabular mt-2 text-xl font-bold text-ink">{s.value}</div>
          </Card>
        ))}
      </div>

      <Card className="border-t-4 border-t-primary">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-emerald-950 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)]">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">
              Best model:{" "}
              <span className="text-primary">{data.best_model}</span>
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {data.models
                .find((m) => m.model === data.best_model)
                ?.accuracy.toFixed(2)}{" "}
              % test accuracy · five models trained in memory on 1000 rows —
              no database, no API keys, 100% free.
            </p>
          </div>
          <Badge tone="green" className="shrink-0">
            <Sparkles className="h-3 w-3" /> Free AI engine
          </Badge>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader
            title="Model comparison"
            subtitle="Select a row to inspect its confusion matrix"
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-semibold">Model</th>
                  {METRIC_COLUMNS.map((col) => (
                    <th key={col.key} className="px-3 py-3 text-right font-semibold">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.models.map((m) => {
                  const isBest = m.model === data.best_model
                  const active = selected?.model === m.model
                  return (
                    <tr
                      key={m.model}
                      onClick={() => setSelected(m)}
                      className={cn(
                        "cursor-pointer border-b border-line transition last:border-0",
                        active ? "bg-emerald-500/10" : "hover:bg-white/[0.03]"
                      )}
                    >
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-2 font-semibold text-ink">
                          {isBest ? <Trophy className="h-3.5 w-3.5 text-amber-500" /> : null}
                          {m.model}
                        </span>
                      </td>
                      {METRIC_COLUMNS.map((col) => {
                        const value = m[col.key] as number
                        return (
                          <td
                            key={col.key}
                            className={cn(
                              "tabular px-3 py-3 text-right",
                              isBest && col.key === "accuracy"
                                ? "font-bold text-primary"
                                : "text-ink-soft"
                            )}
                          >
                            {value.toFixed(2)}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader
            title={selected ? selected.model : "Model detail"}
            subtitle="Confusion matrix on the held-out test set"
            icon={<Award className="h-4 w-4" />}
          />
          <div className="p-5">
            {selected ? (
              <ConfusionMatrix
                matrix={selected.confusion_matrix}
                labels={data.dataset_info.classes}
              />
            ) : null}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Metric breakdown"
            subtitle="Every model, every evaluation metric"
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <div className="p-5">
            <MetricBars models={data.models} />
          </div>
        </Card>
        <Card>
          <CardHeader
            title="Radar overview"
            subtitle="Accuracy profile across the six metrics"
            icon={<Sparkles className="h-4 w-4" />}
          />
          <div className="grid grid-cols-2 gap-2 p-4">
            {METRIC_COLUMNS.map((col) => (
              <div key={col.key}>
                <MetricsRadar models={data.models} metric={col.key} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Feature importance"
          subtitle="Which indicators drive the predictions the most"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <div className="p-5">
          <FeatureList items={importance ?? []} />
        </div>
      </Card>
    </div>
  )
}
