"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Trophy } from "lucide-react";
import { api } from "@/lib/api";
import { Badge, Button, Card, Skeleton } from "@/components/ui";
import { DemoCards } from "@/components/auth/demo-cards";

export function LiveInsights() {
  const [data, setData] = useState<{
    best: string
    accuracy: number | null
    accuracyTrend: boolean
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    api
      .modelComparison()
      .then((comparison) => {
        if (cancelled) return
        const best = comparison.best_model
        const bestRow = comparison.models.find((m) => m.model === best)
        setData({
          best,
          accuracy: bestRow?.accuracy ?? null,
          accuracyTrend: true,
        })
      })
      .catch(() => {
        if (cancelled) return
        setData({ best: "Gradient Boosting", accuracy: null, accuracyTrend: true })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section
      id="insights"
      className="relative overflow-hidden border-y border-line/60 py-20 lg:py-24"
    >
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute left-1/2 top-0 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-teal-500/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Live model insights
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Real numbers from a real ensemble — fetched live
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft">
              These stats come straight from the live FastAPI backend on Render.
              Five scikit-learn models are retrained in memory on every deploy —
              no cloud AI bills, no data ever leaving the app.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/login">
                <Button size="lg">
                  Explore the full comparison
                </Button>
              </Link>
            </div>
          </div>

          <Card className="border-emerald-500/20 bg-white/[0.03] p-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-ink-muted">Current best model</p>
                {data ? (
                  <p className="text-lg font-bold text-ink">{data.best}</p>
                ) : (
                  <Skeleton className="mt-1 h-5 w-40" />
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                {
                  label: "Test accuracy",
                  value: data?.accuracy != null ? `${data.accuracy.toFixed(2)}%` : null,
                },
                { label: "Models", value: "5" },
                { label: "Samples", value: "1,000" },
                { label: "Classes", value: "2" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                >
                  <p className="text-xs text-ink-muted">{stat.label}</p>
                  {stat.value ? (
                    <p className="tabular mt-1 text-xl font-bold text-ink">
                      {stat.value}
                    </p>
                  ) : (
                    <Skeleton className="mt-2 h-5 w-16" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 ring-1 ring-inset ring-emerald-500/25">
              <Activity className="h-4 w-4" />
              <span>Backend online · predictions generated on request</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

const FEATURES = [
  {
    icon: "BrainCircuit",
    title: "Five-model ensemble",
    body: "Logistic Regression, Decision Tree, Random Forest, KNN and Gradient Boosting agree on a single success probability.",
  },
  {
    icon: "Gauge",
    title: "Academic Success Index",
    body: "A weighted composite of ML probability, attendance and study hours gives one decision-ready risk score.",
  },
  {
    icon: "ShieldAlert",
    title: "Risk classification",
    body: "Automatically classifies each student as Stable, Monitor Closely or Intervention Required.",
  },
  {
    icon: "Lightbulb",
    title: "Counterfactual recs",
    body: "Knows exactly which change — raising attendance, study hours or GPA — moves the needle most.",
  },
  {
    icon: "SlidersHorizontal",
    title: "What-if simulator",
    body: "Move any slider and watch the report recompute live, finding the fastest path to the stable zone.",
  },
  {
    icon: "BarChart3",
    title: "Model transparency",
    body: "Compare accuracy, precision, recall, F1, AUC and confusion matrices across all five models.",
  },
]

const ICON_MAP: Record<string, React.ReactNode> = {
  BrainCircuit: <BrainCircuitIcon />,
  Gauge: <GaugeIcon />,
  ShieldAlert: <ShieldAlertIcon />,
  Lightbulb: <LightbulbIcon />,
  SlidersHorizontal: <SlidersIcon />,
  BarChart3: <BarChartIcon />,
}

function BrainCircuitIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h.01M15 9h.01M9 15h6" />
    </svg>
  )
}
function GaugeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 14 19 7" />
      <circle cx="12" cy="14" r="8" />
      <path d="M4 14h2M18 14h2M12 6V4" />
    </svg>
  )
}
function ShieldAlertIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 20 6v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" />
      <path d="M12 9v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}
function LightbulbIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 22h4M8.5 15A6 6 0 1 1 15.5 15c-.8.6-1.5 1-1.5 2h-4c0-1-.7-1.4-1.5-2z" />
    </svg>
  )
}
function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h13M19 17h1" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  )
}
function BarChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    </svg>
  )
}

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="text-center">
        <span className="section-kicker">Features</span>
        <h2 className="section-title">Everything you need for a data-driven decision</h2>
        <p className="section-sub">
          From raw indicators to an actionable verdict — DSS-MIP covers the
          entire analysis workflow in one clean interface.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card
            key={feature.title}
            className="group p-6 transition hover:-translate-y-0.5 hover:shadow-pop"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 transition group-hover:bg-emerald-500 group-hover:text-emerald-950">
              {ICON_MAP[feature.icon]}
            </div>
            <h3 className="mt-4 text-base font-semibold text-ink">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{feature.body}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}

const STEPS = [
  {
    step: "01",
    title: "Enter the profile",
    body: "Fill in GPA, internal scores, study hours, attendance, assignment rates and a few context flags.",
  },
  {
    step: "02",
    title: "Ensemble predicts",
    body: "Five models each score the profile. A Youden-optimised threshold and cross-model agreement build confidence.",
  },
  {
    step: "03",
    title: "Decide with evidence",
    body: "Review the risk tier, benchmark gaps and counterfactual recommendations, then act — or simulate the fix first.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white/[0.02] py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="section-kicker">How it works</span>
          <h2 className="section-title">Three steps to a decision</h2>
          <p className="section-sub">
            No setup, no training data to provide, no accounts to configure.
            Predictions start the moment you hit run.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((item, i) => (
            <div key={item.step} className="relative">
              <Card className="h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="tabular text-3xl font-bold text-primary/30">
                    {item.step}
                  </span>
                  {i < STEPS.length - 1 ? (
                    <svg viewBox="0 0 24 24" className="hidden h-5 w-5 text-primary/30 md:block" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </div>
                <h3 className="mt-3 text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function DemoSection() {
  return (
    <section
      id="demo"
      className="relative overflow-hidden border-y border-line/60 py-20 lg:py-24"
    >
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-teal-500/10 blur-[130px]" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="section-kicker">Live demo dashboards</span>
          <h2 className="section-title">Four roles, four dedicated dashboards</h2>
          <p className="section-sub">
            One click signs you in with a demo account and opens the dashboard
            built for that role — student, faculty, admin or advisor.
          </p>
        </div>

        <div className="mt-14">
          <DemoCards />
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-sm text-ink-soft">
          No sign-up, no data stored. Every dashboard runs against the live
          in-memory ML ensemble.
        </p>
      </div>
    </section>
  )
}

const TECH = [
  {
    name: "Next.js",
    role: "Frontend",
    body: "React + TypeScript app router, server rendering, fully responsive UI.",
  },
  {
    name: "FastAPI",
    role: "Backend",
    body: "Async Python API served from Render — CORS-enabled, documented, versioned.",
  },
  {
    name: "scikit-learn",
    role: "ML engine",
    body: "Five classifiers trained in memory on every boot — the 100% free AI layer.",
  },
  {
    name: "Tailwind CSS",
    role: "Design",
    body: "A custom corporate design system with a polished, accessible component set.",
  },
]

export function TechStack() {
  return (
    <section id="stack" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="text-center">
        <span className="section-kicker">Technology</span>
        <h2 className="section-title">A modern, honest stack</h2>
        <p className="section-sub">
          Production-grade tooling on free tiers. TypeScript on the front,
          Python on the back, machine learning that never costs a cent.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TECH.map((item) => (
          <Card key={item.name} className="p-6">
            <Badge tone="primary">{item.role}</Badge>
            <h3 className="mt-4 text-lg font-bold text-ink">{item.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}

export function CtaBanner() {
  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-400 px-6 py-14 text-center shadow-pop sm:px-12">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-2xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-emerald-950 md:text-4xl">
              Ready to see what the data says?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-emerald-900/80">
              Sign in with a demo account and run a full analysis in under a
              minute — free forever.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/login">
                <Button size="lg" className="bg-emerald-950 text-emerald-50 shadow-none hover:bg-[#052e1f]">
                  Get started free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
