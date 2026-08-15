"use client";

import { cn } from "@/lib/utils";

const RING_COLORS: Record<string, string> = {
  green: "#34d399",
  amber: "#fbbf24",
  red: "#f87171",
}

export function RiskRing({
  value,
  color,
  size = 64,
  className,
}: {
  value: number
  color: "green" | "amber" | "red"
  size?: number
  className?: string
}) {
  const stroke = size >= 64 ? 7 : 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, value))
  const offset = c * (1 - pct / 100)

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={RING_COLORS[color]}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 600ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "tabular font-bold",
            size >= 64 ? "text-[13px]" : "text-xs"
          )}
        >
          {pct.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}
