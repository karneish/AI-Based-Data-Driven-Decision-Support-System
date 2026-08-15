"use client";

import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui";

function Sparkline() {
  const points = [
    [8, 92], [42, 74], [76, 80], [110, 62], [144, 66],
    [178, 48], [212, 54], [246, 40], [280, 34], [314, 26],
  ]
  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ")
  return (
    <svg viewBox="0 0 322 100" className="w-full">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      {[25, 50, 75].map((y) => (
        <line key={y} x1="0" x2="322" y1={y} y2={y} stroke="#eef0f7" strokeWidth="1" />
      ))}
      <path d={`${path} L 322 100 L 0 100 Z`} fill="url(#spark)" opacity="0.12" />
      <path
        d={path}
        fill="none"
        stroke="url(#spark)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === points.length - 1 ? 4 : 2.5}
          fill="#fff"
          stroke={i === points.length - 1 ? "#4f46e5" : "#4f46e5"}
          strokeWidth="2"
        />
      ))}
    </svg>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      <div className="absolute -top-40 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/20 via-violet-500/15 to-cyan-500/20 blur-[130px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            100% free AI engine · no database · no API keys
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
            Predict student success with{" "}
            <span className="text-gradient">an ensemble of five</span> machine
            learning models
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            DSS-MIP turns academic indicators into clear, explainable decisions.
            Get a success probability, a real-time risk classification, model
            agreement scores and counterfactual recommendations — in seconds.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/login">
              <Button size="lg">
                <PlayCircle className="h-4 w-4" /> Run your first analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="secondary" size="lg">
                See how it works
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { value: "5", label: "ML models" },
              { value: "8", label: "Indicators" },
              { value: "4", label: "Actionable recs" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-line bg-surface px-4 py-3"
              >
                <p className="tabular text-2xl font-bold text-ink">{stat.value}</p>
                <p className="text-xs text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-up lg:ml-auto lg:w-[520px]">
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-violet-500/10 to-cyan-500/20 blur-2xl" />
            <div className="relative rounded-2xl border border-line bg-surface shadow-card">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Arjun Sharma · Class of 2026
                  </p>
                  <p className="text-xs text-ink-muted">Analysis report · just now</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <CheckCircle2 className="h-3 w-3" /> Strong Performer
                </span>
              </div>

              <div className="grid grid-cols-3 gap-px border-b border-line bg-line/70">
                {[
                  { label: "Success prob", value: "86.4%", tone: "text-emerald-600" },
                  { label: "ASI index", value: "82.0", tone: "text-ink" },
                  { label: "Confidence", value: "91.3%", tone: "text-ink" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-surface px-4 py-3">
                    <p className="text-[11px] text-ink-muted">{kpi.label}</p>
                    <p className={`tabular mt-0.5 text-lg font-bold ${kpi.tone}`}>
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-ink">Success probability</span>
                    <span className="tabular font-semibold text-primary">
                      86.4% · trend improving
                    </span>
                  </div>
                  <Sparkline />
                </div>
                <div className="space-y-2.5">
                  {[
                    { model: "Gradient Boosting", value: 91.2, best: true },
                    { model: "Random Forest", value: 88.6, best: false },
                    { model: "Logistic Regression", value: 84.1, best: false },
                    { model: "Ensemble average", value: 86.4, best: false },
                  ].map((row) => (
                    <div key={row.model} className="flex items-center gap-2 text-xs">
                      <span className="w-32 text-ink-soft">{row.model}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${row.best ? "bg-primary" : "bg-slate-300"}`}
                          style={{ width: `${row.value}%` }}
                        />
                      </div>
                      <span className="tabular w-10 text-right font-semibold text-ink">
                        {row.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-card sm:flex">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-ink">
                5 models · trained in memory
              </span>
            </div>
            <div className="absolute -top-5 -right-4 hidden items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-card sm:flex">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-semibold text-ink">
                No data stored
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
