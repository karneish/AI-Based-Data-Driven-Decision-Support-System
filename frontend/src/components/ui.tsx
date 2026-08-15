"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />
}

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-emerald-950 hover:bg-primary-hover shadow-[0_8px_20px_-8px_rgba(16,185,129,0.55)] focus-visible:ring-primary/40",
  secondary:
    "bg-surface text-ink border border-line-strong hover:border-primary/60 hover:text-primary focus-visible:ring-primary/30",
  ghost: "text-ink-soft hover:bg-white/[0.06] hover:text-ink",
  danger: "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30 hover:bg-rose-500/20",
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-sm gap-2",
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  )
}

export function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("card", className)} {...rest}>
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-line px-5 py-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
            {icon}
          </div>
        ) : null}
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  )
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  tone?:
    | "neutral"
    | "primary"
    | "green"
    | "amber"
    | "red"
    | "cyan"
    | "teal"
}

const badgeTones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-white/5 text-slate-300 ring-white/10",
  primary: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
  green: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
  amber: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
  red: "bg-rose-500/10 text-rose-300 ring-rose-500/30",
  cyan: "bg-cyan-500/10 text-cyan-300 ring-cyan-500/30",
  teal: "bg-teal-500/10 text-teal-300 ring-teal-500/30",
}

export function Badge({
  tone = "neutral",
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        badgeTones[tone],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  )
}

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  icon?: React.ReactNode
  suffix?: React.ReactNode
}

export function Field({
  label,
  hint,
  icon,
  suffix,
  id,
  className,
  ...rest
}: FieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-")
  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-ink">
        {label}
        {hint ? (
          <span className="text-xs font-normal text-ink-muted">{hint}</span>
        ) : null}
      </span>
      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
            {icon}
          </span>
        ) : null}
        <input
          id={inputId}
          className={cn(
            "input-field",
            icon ? "pl-9" : "",
            suffix ? "pr-16" : "",
            className
          )}
          {...rest}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-soft">
            {suffix}
          </span>
        ) : null}
      </span>
    </label>
  )
}

export function RangeField({
  label,
  hint,
  value,
  display,
  min,
  max,
  step = 1,
  onChange,
  tone = "primary",
}: {
  label: string
  hint?: string
  value: number
  display: string
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  tone?: "primary" | "emerald" | "amber"
}) {
  const pct = ((value - min) / (max - min)) * 100
  const accent =
    tone === "primary"
      ? "accent-[#10b981]"
      : tone === "emerald"
        ? "accent-[#34d399]"
        : "accent-[#fbbf24]"
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-ink">
          {label}
          {hint ? (
            <span className="ml-1.5 text-xs font-normal text-ink-muted">{hint}</span>
          ) : null}
        </span>
        <span className="tabular rounded-md bg-white/5 px-2 py-0.5 text-xs font-semibold text-ink-soft">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10",
          accent
        )}
        style={{
          background: `linear-gradient(to right, ${
            tone === "primary" ? "#10b981" : tone === "emerald" ? "#34d399" : "#fbbf24"
          } ${pct}%, rgba(255,255,255,0.12) ${pct}%)`,
        }}
      />
    </div>
  )
}

export interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: { value: string | number; label: string }[]
}

export function SelectField({ label, options, id, ...rest }: SelectFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-")
  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <select
        id={inputId}
        className="input-field cursor-pointer appearance-none"
        {...rest}
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Switch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-white/[0.04] px-3.5 py-3 text-left transition hover:border-line-strong"
    >
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-ink-soft">{description}</span>
        ) : null}
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-white/15"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </span>
    </button>
  )
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "primary",
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon?: React.ReactNode
  tone?: "primary" | "green" | "amber" | "red" | "cyan" | "teal"
}) {
  const tones: Record<string, string> = {
    primary: "bg-emerald-500/15 text-emerald-300",
    green: "bg-emerald-500/15 text-emerald-300",
    amber: "bg-amber-500/15 text-amber-300",
    red: "bg-rose-500/15 text-rose-300",
    cyan: "bg-cyan-500/15 text-cyan-300",
    teal: "bg-teal-500/15 text-teal-300",
  }
  const accents: Record<string, string> = {
    primary: "bg-gradient-to-r from-emerald-500 to-teal-400",
    green: "bg-gradient-to-r from-emerald-400 to-emerald-500/40",
    amber: "bg-gradient-to-r from-amber-400 to-amber-400/40",
    red: "bg-gradient-to-r from-rose-400 to-rose-400/40",
    cyan: "bg-gradient-to-r from-cyan-400 to-cyan-400/40",
    teal: "bg-gradient-to-r from-teal-400 to-teal-400/40",
  }
  return (
    <Card className="relative overflow-hidden p-4">
      <span className={cn("absolute inset-x-0 top-0 h-0.5", accents[tone])} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {label}
        </span>
        {icon ? (
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tones[tone])}>
            {icon}
          </span>
        ) : null}
      </div>
      <div className="tabular mt-2 text-2xl font-bold text-ink">{value}</div>
      {sub ? <div className="mt-1 text-xs text-ink-soft">{sub}</div> : null}
    </Card>
  )
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      {icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-white/5", className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

export function ProgressBar({
  value,
  max = 100,
  tone = "primary",
  className,
}: {
  value: number
  max?: number
  tone?: "primary" | "green" | "amber" | "red"
  className?: string
}) {
  const colors: Record<string, string> = {
    primary: "bg-emerald-500",
    green: "bg-emerald-400",
    amber: "bg-amber-400",
    red: "bg-rose-400",
  }
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/5", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", colors[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
