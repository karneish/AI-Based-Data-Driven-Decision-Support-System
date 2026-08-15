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
      badge: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
      gradient: "from-emerald-500/15 to-emerald-500/5 text-emerald-300",
      bar: "bg-emerald-400",
      text: "text-emerald-300",
      label: "Stable",
    }
  if (color === "amber")
    return {
      badge: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
      gradient: "from-amber-500/15 to-amber-500/5 text-amber-300",
      bar: "bg-amber-400",
      text: "text-amber-300",
      label: "Monitor",
    }
  return {
    badge: "bg-rose-500/10 text-rose-300 ring-rose-500/30",
    gradient: "from-rose-500/15 to-rose-500/5 text-rose-300",
    bar: "bg-rose-400",
    text: "text-rose-300",
    label: "Intervene",
  }
}

export function impactTone(
  impact: "High" | "Medium" | "Low"
): { badge: string; text: string; bar: string } {
  if (impact === "High")
    return {
      badge: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
      text: "text-emerald-300",
      bar: "bg-emerald-400",
    }
  if (impact === "Medium")
    return {
      badge: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
      text: "text-amber-300",
      bar: "bg-amber-400",
    }
  return {
    badge: "bg-white/5 text-slate-300 ring-white/10",
    text: "text-slate-300",
    bar: "bg-white/20",
  }
}
