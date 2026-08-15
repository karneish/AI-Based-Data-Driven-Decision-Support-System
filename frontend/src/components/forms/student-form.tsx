"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  RotateCcw,
  Sparkles,
  UserRound,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AnalysisResult, StudentInput } from "@/types";
import { Button, Field, RangeField, SelectField, Switch } from "@/components/ui";

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
  mode,
  onResult,
  onLoading,
  initial,
  className,
}: {
  mode: "analyze" | "simulate"
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
    (name: string): StudentInput => ({
      ...input,
      name: name || input.name || "Student",
    }),
    [input]
  )

  const run = useCallback(
    async (name: string) => {
      if (!name.trim()) {
        setError("Please enter the student's name.")
        return
      }
      setError(null)
      setLoadingSafe(true)
      try {
        const result =
          mode === "simulate"
            ? await api.simulate(buildInput(name))
            : await api.analyze(buildInput(name))
        onResult(result)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "The analysis could not be completed. Please try again."
        )
      } finally {
        setLoadingSafe(false)
      }
    },
    [mode, buildInput, onResult, setLoadingSafe]
  )

  useEffect(() => {
    if (mode !== "simulate") return
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      void run("Simulation")
    }, 450)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, run])

  const applyPreset = (preset: Preset) => {
    setInput((prev) => ({ ...defaultInput(), ...preset.values, name: prev.name }))
    setError(null)
  }

  const reset = () => {
    setInput(defaultInput(initial))
    setError(null)
  }

  const values = useMemo(() => PRESETS, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void run(mode === "simulate" ? "Simulation" : input.name)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-5", className)}
      noValidate
    >
      <div>
        <span className="mb-2 block text-sm font-medium text-ink">Quick presets</span>
        <div className="grid grid-cols-3 gap-2">
          {values.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="rounded-xl border border-line bg-white px-2 py-2 text-left transition hover:border-primary/50"
            >
              <span className="flex items-center gap-1 text-xs font-semibold text-ink">
                <Sparkles className="h-3 w-3 text-primary" />
                {preset.name}
              </span>
              <span className="mt-0.5 block text-[10px] leading-tight text-ink-muted">
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {mode === "analyze" ? (
        <Field
          label="Student name"
          id="student-name"
          placeholder="e.g. Arjun Sharma"
          icon={<UserRound className="h-4 w-4" />}
          value={input.name}
          onChange={(e) => set("name", e.target.value)}
          autoComplete="off"
        />
      ) : null}

      <div className="space-y-4">
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
          label="Weekly study hours"
          hint="hours"
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
          label="Assignment submission"
          hint="%"
          value={input.assignment_rate}
          min={0}
          max={100}
          step={1}
          display={`${input.assignment_rate}%`}
          onChange={(v) => set("assignment_rate", v)}
        />
      </div>

      <SelectField
        label="Parental education level"
        options={EDU_OPTIONS}
        value={input.parental_education}
        onChange={(e) => set("parental_education", Number(e.target.value))}
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
        <div className="rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-600 ring-1 ring-rose-200">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-2 pt-1">
        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="flex-1"
          disabled={mode === "simulate"}
        >
          {mode === "analyze" ? (
            <>
              <Play className="h-4 w-4" /> Run analysis
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Auto-simulating…
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={reset}
          aria-label="Reset form"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
