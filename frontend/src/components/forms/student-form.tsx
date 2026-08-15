"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AnalysisResult, StudentInput } from "@/types";
import { Button, RangeField, SelectField, Switch } from "@/components/ui";

export interface Preset {
  name: string
  description: string
  values: Partial<StudentInput>
}

export const PRESETS: Preset[] = [
  {
    name: "Balanced",
    description: "Steady across the board",
    values: {
      previous_gpa: 7.5,
      internal_score: 70,
      study_hours: 12,
      attendance: 85,
      assignment_rate: 80,
      parental_education: 2,
      internet_access: 1,
      extracurricular: 1,
    },
  },
  {
    name: "High Achiever",
    description: "Consistently excellent",
    values: {
      previous_gpa: 9.2,
      internal_score: 90,
      study_hours: 16,
      attendance: 96,
      assignment_rate: 95,
      parental_education: 3,
      internet_access: 1,
      extracurricular: 1,
    },
  },
  {
    name: "At Risk",
    description: "Needs urgent attention",
    values: {
      previous_gpa: 4.8,
      internal_score: 42,
      study_hours: 5,
      attendance: 55,
      assignment_rate: 38,
      parental_education: 1,
      internet_access: 0,
      extracurricular: 0,
    },
  },
]

export function defaultInput(overrides: Partial<StudentInput> = {}): StudentInput {
  return {
    name: "",
    previous_gpa: 7.5,
    internal_score: 70,
    study_hours: 12,
    attendance: 85,
    assignment_rate: 80,
    parental_education: 2,
    internet_access: 1,
    extracurricular: 1,
    ...overrides,
  }
}

const EDU_OPTIONS = [
  { value: 0, label: "No formal education" },
  { value: 1, label: "High school" },
  { value: 2, label: "Undergraduate" },
  { value: 3, label: "Postgraduate" },
]

export function StudentForm({
  onResult,
  onLoading,
  initial,
  className,
}: {
  onResult: (r: AnalysisResult) => void
  onLoading?: (loading: boolean) => void
  initial?: Partial<StudentInput>
  className?: string
}) {
  const [input, setInput] = useState<StudentInput>(() =>
    defaultInput(initial)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstRender = useRef(true)

  const set = <K extends keyof StudentInput>(key: K, value: StudentInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }))

  const setLoadingSafe = useCallback(
    (v: boolean) => {
      setLoading(v)
      onLoading?.(v)
    },
    [onLoading]
  )

  const buildInput = useCallback(
    (): StudentInput => ({ ...input, name: "Simulation" }),
    [input]
  )

  const run = useCallback(async () => {
    setError(null)
    setLoadingSafe(true)
    try {
      const result = await api.simulate(buildInput())
      onResult(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The simulation could not be completed. Please try again."
      )
    } finally {
      setLoadingSafe(false)
    }
  }, [buildInput, onResult, setLoadingSafe])

  useEffect(() => {
    const delay = firstRender.current ? 300 : 450
    firstRender.current = false
    const timer = setTimeout(() => {
      void run()
    }, delay)
    return () => clearTimeout(timer)
  }, [run])

  const applyPreset = (preset: Preset) => {
    setInput({ ...defaultInput(), ...preset.values })
    setError(null)
  }

  const reset = () => {
    setInput(defaultInput(initial))
    setError(null)
  }

  const activePresetName = PRESETS.find((p) =>
    (Object.keys(p.values) as (keyof StudentInput)[]).every(
      (key) => input[key] === p.values[key]
    )
  )?.name

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={cn("space-y-6", className)}
      noValidate
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Presets
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => applyPreset(preset)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              activePresetName === preset.name
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                : "border-line bg-white/[0.03] text-ink-soft hover:border-emerald-500/40 hover:bg-white/[0.06]"
            )}
          >
            <Sparkles className="h-3 w-3" />
            {preset.name}
          </button>
        ))}
      </div>

      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <RangeField
          label="Previous GPA"
          hint="out of 10"
          value={input.previous_gpa}
          min={0}
          max={10}
          step={0.1}
          display={input.previous_gpa.toFixed(1)}
          onChange={(v) => set("previous_gpa", v)}
        />
        <RangeField
          label="Internal score"
          hint="%"
          value={input.internal_score}
          min={0}
          max={100}
          step={1}
          display={`${input.internal_score}%`}
          onChange={(v) => set("internal_score", v)}
          tone="emerald"
        />
        <RangeField
          label="Study hours"
          hint="weekly"
          value={input.study_hours}
          min={0}
          max={20}
          step={0.5}
          display={`${input.study_hours} hrs`}
          onChange={(v) => set("study_hours", v)}
          tone="amber"
        />
        <RangeField
          label="Attendance"
          hint="%"
          value={input.attendance}
          min={0}
          max={100}
          step={1}
          display={`${input.attendance}%`}
          onChange={(v) => set("attendance", v)}
        />
        <RangeField
          label="Assignment rate"
          hint="%"
          value={input.assignment_rate}
          min={0}
          max={100}
          step={1}
          display={`${input.assignment_rate}%`}
          onChange={(v) => set("assignment_rate", v)}
        />
      </div>

      <div className="grid items-end gap-4 rounded-2xl border border-line bg-white/[0.02] p-4 sm:grid-cols-2 xl:grid-cols-[1fr_auto_auto]">
        <SelectField
          label="Parental education level"
          options={EDU_OPTIONS}
          value={input.parental_education}
          onChange={(e) => set("parental_education", Number(e.target.value))}
        />
        <Switch
          label="Internet access"
          description="Reliable home connectivity"
          checked={input.internet_access === 1}
          onChange={(v) => set("internet_access", v ? 1 : 0)}
        />
        <Switch
          label="Extracurricular"
          description="Participates in activities"
          checked={input.extracurricular === 1}
          onChange={(v) => set("extracurricular", v ? 1 : 0)}
        />
      </div>

      {error ? (
        <div className="rounded-xl bg-rose-500/10 px-3.5 py-3 text-sm text-rose-300 ring-1 ring-rose-500/30">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="flex items-center gap-1.5 text-[11px] text-ink-muted">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          Runs on-device in memory — no student data is stored
        </p>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition",
              loading
                ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25"
                : "bg-white/5 text-ink-soft ring-white/10"
            )}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75",
                  !loading && "hidden"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-1.5 w-1.5 rounded-full",
                  loading ? "bg-emerald-400" : "bg-ink-muted"
                )}
              />
            </span>
            {loading ? "Recomputing…" : "Live"}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={reset}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>
    </form>
  )
}
