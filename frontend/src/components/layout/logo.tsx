import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-emerald-950 shadow-[0_6px_20px_-6px_rgba(16,185,129,0.6)]",
        className
      )}
    >
      <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
        <path
          d="M7 11.5 11 21l4-9.5 3 6 3-6L25 11.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="21.5" r="1.7" fill="currentColor" />
        <circle cx="25" cy="11.5" r="1.7" fill="currentColor" />
      </svg>
    </span>
  )
}

export function Logo({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact ? (
        <span className="text-[15px] font-bold tracking-tight text-ink">
          DSS<span className="text-primary">-MIP</span>
        </span>
      ) : null}
    </span>
  )
}
