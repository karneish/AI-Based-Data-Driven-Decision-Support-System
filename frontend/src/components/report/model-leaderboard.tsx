"use client";

import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModelProbability } from "@/types";

export function ModelLeaderboard({
  probs,
  threshold,
  selectedModel,
}: {
  probs: ModelProbability[]
  threshold: number
  selectedModel?: string
}) {
  if (probs.length === 0) return null

  const best = probs.reduce((a, b) =>
    b.probability > a.probability ? b : a
  )

  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
      {probs.map((m) => {
        const pass = m.probability >= threshold
        const isBest = m.model === best.model
        const isSelected = selectedModel === m.model
        return (
          <div
            key={m.model}
            className={cn(
              "relative overflow-hidden rounded-2xl border p-3.5 transition",
              isSelected
                ? "border-emerald-500/50 bg-emerald-500/[0.08]"
                : isBest
                  ? "border-emerald-500/25 bg-white/[0.04]"
                  : "border-line bg-white/[0.02]"
            )}
          >
            {isBest ? (
              <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
            ) : null}
            <div className="flex items-center justify-between gap-1">
              <span className="truncate text-[11px] font-semibold text-ink">
                {m.model}
              </span>
              {isBest ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-400/15 text-amber-300">
                  <Crown className="h-3 w-3" />
                </span>
              ) : null}
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-wide text-ink-muted">
                Prob
              </span>
              <span
                className={cn(
                  "tabular text-lg font-bold",
                  isBest
                    ? "text-emerald-300"
                    : pass
                      ? "text-ink"
                      : "text-rose-300"
                )}
              >
                {m.probability.toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className={cn(
                  "h-full rounded-full",
                  pass
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : "bg-gradient-to-r from-rose-500 to-rose-400"
                )}
                style={{ width: `${Math.min(100, m.probability)}%` }}
              />
            </div>
            <div className="mt-2.5">
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                  pass
                    ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30"
                    : "bg-rose-500/10 text-rose-300 ring-rose-500/30"
                )}
              >
                {pass ? "Above threshold" : "Below threshold"}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
