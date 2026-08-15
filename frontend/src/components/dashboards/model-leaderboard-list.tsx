"use client";

import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModelMetrics } from "@/types";

export function ModelLeaderboardList({
  models,
  bestModel,
}: {
  models: ModelMetrics[]
  bestModel: string
}) {
  const sorted = [...models].sort((a, b) => b.accuracy - a.accuracy)

  return (
    <div className="space-y-2.5">
      {sorted.map((m, i) => {
        const isBest = m.model === bestModel
        return (
          <div
            key={m.model}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 transition",
              isBest
                ? "border-emerald-500/30 bg-emerald-500/[0.05]"
                : "border-line bg-white/[0.02]"
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                isBest
                  ? "bg-emerald-500 text-emerald-950"
                  : "bg-white/5 text-ink-soft"
              )}
            >
              {i + 1}
            </span>
            <span className="w-40 truncate text-sm font-semibold text-ink">
              {m.model}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className={cn(
                  "h-full rounded-full",
                  isBest
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : "bg-white/20"
                )}
                style={{ width: `${m.accuracy}%` }}
              />
            </div>
            <span className="tabular w-14 text-right text-sm font-bold text-ink">
              {m.accuracy.toFixed(1)}%
            </span>
            <span className="tabular hidden w-24 text-right text-xs text-ink-muted sm:block">
              P {m.precision.toFixed(1)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function ModelLeaderboardHeader({ bestModel }: { bestModel: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold">
      <Crown className="h-3.5 w-3.5 text-amber-300" /> Best: {bestModel}
    </span>
  )
}
