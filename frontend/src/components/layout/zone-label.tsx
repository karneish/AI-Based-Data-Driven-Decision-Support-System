"use client";

export function ZoneLabel({
  index,
  title,
  hint,
}: {
  index: string
  title: string
  hint?: string
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-[11px] font-bold text-emerald-300 ring-1 ring-inset ring-emerald-500/25">
        {index}
      </span>
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink">
        {title}
      </h2>
      {hint ? (
        <span className="hidden text-xs text-ink-muted sm:inline">{hint}</span>
      ) : null}
      <div className="h-px min-w-4 flex-1 bg-line" />
    </div>
  )
}
