"use client";

import type { ReactNode } from "react";

export function PageHeader({
  kicker,
  title,
  subtitle,
  icon,
  children,
}: {
  kicker?: string
  title: string
  subtitle?: string
  icon?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-4">
        {icon ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-emerald-950 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.7)]">
            {icon}
          </div>
        ) : null}
        <div>
          {kicker ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              {kicker}
            </p>
          ) : null}
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {children ? (
        <div className="flex items-center gap-2">{children}</div>
      ) : null}
    </div>
  )
}
