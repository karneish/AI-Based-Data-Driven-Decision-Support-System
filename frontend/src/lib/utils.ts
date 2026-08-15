export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ")
}

export function formatPct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function formatNumber(value: number, digits = 1): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function riskTone(color: "green" | "amber" | "red") {
  if (color === "green")
    return {
      badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      gradient: "from-emerald-500/15 to-emerald-500/5 text-emerald-700",
      bar: "bg-emerald-500",
      text: "text-emerald-600",
      label: "Stable",
    }
  if (color === "amber")
    return {
      badge: "bg-amber-50 text-amber-700 ring-amber-200",
      gradient: "from-amber-500/15 to-amber-500/5 text-amber-700",
      bar: "bg-amber-500",
      text: "text-amber-600",
      label: "Monitor",
    }
  return {
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    gradient: "from-rose-500/15 to-rose-500/5 text-rose-700",
    bar: "bg-rose-500",
    text: "text-rose-600",
    label: "Intervene",
  }
}

export function impactTone(
  impact: "High" | "Medium" | "Low"
): { badge: string; text: string; bar: string } {
  if (impact === "High")
    return {
      badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      text: "text-emerald-600",
      bar: "bg-emerald-500",
    }
  if (impact === "Medium")
    return {
      badge: "bg-amber-50 text-amber-700 ring-amber-200",
      text: "text-amber-600",
      bar: "bg-amber-500",
    }
  return {
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    text: "text-slate-500",
    bar: "bg-slate-400",
  }
}
