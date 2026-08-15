"use client";

import {
  Activity,
  AlertTriangle,
  Award,
  BrainCircuit,
  CheckCircle2,
  FileDown,
  Gauge as GaugeIcon,
  Lightbulb,
  ShieldAlert,
  Target,
  TrendingUp,
} from "lucide-react";
import { cn, formatNumber, impactTone, riskTone } from "@/lib/utils";
import type { AnalysisResult } from "@/types";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ProgressBar,
  Skeleton,
  StatCard,
} from "@/components/ui";
import {
  BenchmarkChart,
  FeatureList,
  Gauge,
  ModelBars,
  RadarPanel,
  RiskTierScale,
} from "@/components/charts";

export function ReportSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-24" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  )
}

export function ReportView({ result }: { result: AnalysisResult }) {
  const tone = riskTone(result.risk_color)
  const thresholdPct = result.class_threshold
  const riskBorder = {
    green: "border-t-emerald-500",
    amber: "border-t-amber-500",
    red: "border-t-rose-500",
  }[result.risk_color]

  const kpis: Array<{
    label: string
    value: React.ReactNode
    sub?: string
    icon?: React.ReactNode
    tone: "primary" | "green" | "amber" | "red" | "cyan" | "teal"
  }> = [
    {
      label: "Success probability",
      value: `${result.ensemble_probability.toFixed(1)}%`,
      sub: `${result.predicted_class}`,
      icon: <TrendingUp className="h-4 w-4" />,
      tone: "green" as const,
    },
    {
      label: "ASI index",
      value: formatNumber(result.asi),
      sub: "Academic Success Index",
      icon: <GaugeIcon className="h-4 w-4" />,
      tone: "teal" as const,
    },
    {
      label: "Risk status",
      value: result.risk_category,
      sub: `Threshold ${(thresholdPct).toFixed(0)}%`,
      icon: <ShieldAlert className="h-4 w-4" />,
      tone: result.risk_color === "green" ? "green" : result.risk_color === "amber" ? "amber" : "red",
    },
    {
      label: "Model confidence",
      value: `${result.confidence.toFixed(1)}%`,
      sub: "Cross-model agreement",
      icon: <BrainCircuit className="h-4 w-4" />,
      tone: "cyan" as const,
    },
    {
      label: "Selected model",
      value: result.selected_model,
      sub: "Per-formula probability",
      icon: <Activity className="h-4 w-4" />,
      tone: "primary" as const,
    },
    {
      label: "ML probability",
      value: `${result.ml_probability.toFixed(1)}%`,
      sub: `Threshold ${thresholdPct.toFixed(1)}%`,
      icon: <Target className="h-4 w-4" />,
      tone: "amber" as const,
    },
  ]

  return (
    <div className="animate-fade-up space-y-5" id="report">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold tracking-tight text-ink">
            {result.predicted_class}
          </h2>
          <Badge tone={result.risk_color === "green" ? "green" : result.risk_color === "amber" ? "amber" : "red"}>
            {result.risk_category}
          </Badge>
          <Badge tone="primary">{result.selected_model}</Badge>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.print()}
          className="no-print"
        >
          <FileDown className="h-3.5 w-3.5" /> Export / Print
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <Card className={cn("border-t-4", riskBorder)}>
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tone.badge)}>
            {result.risk_color === "green" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">
              {result.risk_color === "green"
                ? "Student is on a stable trajectory"
                : result.risk_color === "amber"
                  ? "Student needs closer monitoring"
                  : "Immediate intervention recommended"}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              The composite ASI of{" "}
              <span className={cn("font-semibold", tone.text)}>
                {formatNumber(result.asi)}
              </span>{" "}
              combines ensemble probability ({result.asi_weights.ml_probability
                ? `${(result.asi_weights.ml_probability * 100).toFixed(0)}%`
                : "50%"}
              ), attendance (
              {result.asi_weights.attendance
                ? `${(result.asi_weights.attendance * 100).toFixed(0)}%`
                : "30%"}
              ) and study hours (
              {result.asi_weights.study_hours
                ? `${(result.asi_weights.study_hours * 100).toFixed(0)}%`
                : "20%"}
              ).
            </p>
            <div className="mt-3">
              <RiskTierScale value={result.asi} thresholds={result.risk_thresholds} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Academic Success Index"
            subtitle="Composite score across probability, attendance & study hours"
            icon={<GaugeIcon className="h-4 w-4" />}
            action={
              <Badge tone={result.risk_color === "green" ? "green" : result.risk_color === "amber" ? "amber" : "red"}>
                {result.risk_category}
              </Badge>
            }
          />
          <div className="flex justify-center py-4">
            <Gauge
              value={result.asi}
              color={result.risk_color === "green" ? "#34d399" : result.risk_color === "amber" ? "#fbbf24" : "#f87171"}
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Performance profile"
            subtitle="Normalised scores across key dimensions"
            icon={<Award className="h-4 w-4" />}
          />
          <div className="px-4 pb-4">
            <RadarPanel data={result.radar_data} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Benchmark comparison"
            subtitle="Current performance vs. recommended minimums"
            icon={<Target className="h-4 w-4" />}
          />
          <div className="p-5">
            <BenchmarkChart data={result.bar_data} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Model agreement"
            subtitle={`Every model's success probability vs. ${thresholdPct.toFixed(1)}% threshold`}
            icon={<BrainCircuit className="h-4 w-4" />}
          />
          <div className="p-5">
            <ModelBars probs={result.all_model_probs} threshold={thresholdPct} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Counterfactual recommendations"
          subtitle="Actions predicted to raise the success probability the most"
          icon={<Lightbulb className="h-4 w-4" />}
        />
        <div className="divide-y divide-line">
          {result.recommendations.map((rec, i) => {
            const impact = impactTone(rec.impact)
            return (
              <div key={rec.action} className="flex gap-4 p-5">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                    impact.badge
                  )}
                >
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink">{rec.action}</span>
                    <Badge tone={rec.impact === "High" ? "green" : rec.impact === "Medium" ? "amber" : "neutral"}>
                      {rec.impact} impact
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{rec.detail}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar
                      value={rec.probability_gain}
                      max={Math.max(25, ...result.recommendations.map((r) => r.probability_gain))}
                      tone={rec.impact === "High" ? "green" : rec.impact === "Medium" ? "amber" : "primary"}
                      className="flex-1"
                    />
                    <span className={cn("tabular text-sm font-bold", impact.text)}>
                      +{rec.probability_gain.toFixed(1)} pts
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Model feature importance"
          subtitle="What the models weigh most heavily (Random Forest)"
          icon={<Activity className="h-4 w-4" />}
        />
        <div className="p-5">
          <FeatureList items={result.feature_importance} />
        </div>
      </Card>

      <p className="px-1 text-center text-xs text-ink-muted">
        Generated on-device predictions with an ensemble of five scikit-learn
        models. No student data is stored — everything runs in memory.
      </p>
    </div>
  )
}
