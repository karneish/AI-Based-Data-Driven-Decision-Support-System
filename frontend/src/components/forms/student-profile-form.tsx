"use client";

import { useState } from "react";
import { Save, UserRoundPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Student, StudentInput } from "@/types";
import { Button, Field, SelectField, Switch } from "@/components/ui";

const EDU_OPTIONS = [
  { value: 0, label: "No formal education" },
  { value: 1, label: "High school" },
  { value: 2, label: "Undergraduate" },
  { value: 3, label: "Postgraduate" },
]

export interface ProfileFormValues {
  name: string
  previous_gpa: number
  internal_score: number
  study_hours: number
  attendance: number
  assignment_rate: number
  parental_education: number
  internet_access: number
  extracurricular: number
}

export function toProfileForm(s: Student): ProfileFormValues {
  return {
    name: s.name,
    previous_gpa: s.previous_gpa,
    internal_score: s.internal_score,
    study_hours: s.study_hours,
    attendance: s.attendance,
    assignment_rate: s.assignment_rate,
    parental_education: s.parental_education,
    internet_access: s.internet_access,
    extracurricular: s.extracurricular,
  }
}

export function blankProfileForm(): ProfileFormValues {
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
  }
}

export function toStudentInput(values: ProfileFormValues): StudentInput {
  return {
    name: values.name,
    previous_gpa: values.previous_gpa,
    internal_score: values.internal_score,
    study_hours: values.study_hours,
    attendance: values.attendance,
    assignment_rate: values.assignment_rate,
    parental_education: values.parental_education,
    internet_access: values.internet_access,
    extracurricular: values.extracurricular,
  }
}

export function StudentProfileForm({
  initial,
  submitLabel = "Save profile",
  submitting,
  error,
  onSubmit,
  onCancel,
  compact,
}: {
  initial: ProfileFormValues
  submitLabel?: string
  submitting?: boolean
  error?: string | null
  onSubmit: (values: ProfileFormValues) => void
  onCancel?: () => void
  compact?: boolean
}) {
  const [values, setValues] = useState<ProfileFormValues>(initial)

  const set = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const valid = values.name.trim().length > 0

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) onSubmit(values)
      }}
      className="space-y-5"
      noValidate
    >
      <Field
        label="Full name"
        value={values.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="e.g. Riya Shah"
        icon={<UserRoundPlus className="h-4 w-4" />}
      />

      <div className={cn("grid gap-x-6 gap-y-5", compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3")}>
        <Field
          label="Previous GPA"
          hint="out of 10"
          type="number"
          min={0}
          max={10}
          step={0.1}
          value={values.previous_gpa}
          onChange={(e) => set("previous_gpa", Number(e.target.value))}
        />
        <Field
          label="Internal score"
          hint="%"
          type="number"
          min={0}
          max={100}
          step={1}
          value={values.internal_score}
          onChange={(e) => set("internal_score", Number(e.target.value))}
        />
        <Field
          label="Study hours"
          hint="weekly"
          type="number"
          min={0}
          max={20}
          step={0.5}
          value={values.study_hours}
          onChange={(e) => set("study_hours", Number(e.target.value))}
        />
        <Field
          label="Attendance"
          hint="%"
          type="number"
          min={0}
          max={100}
          step={1}
          value={values.attendance}
          onChange={(e) => set("attendance", Number(e.target.value))}
        />
        <Field
          label="Assignment rate"
          hint="%"
          type="number"
          min={0}
          max={100}
          step={1}
          value={values.assignment_rate}
          onChange={(e) => set("assignment_rate", Number(e.target.value))}
        />
        <SelectField
          label="Parental education level"
          options={EDU_OPTIONS}
          value={values.parental_education}
          onChange={(e) => set("parental_education", Number(e.target.value))}
        />
      </div>

      <div className="grid items-end gap-4 rounded-2xl border border-line bg-white/[0.02] p-4 sm:grid-cols-2">
        <Switch
          label="Internet access"
          description="Reliable home connectivity"
          checked={values.internet_access === 1}
          onChange={(v) => set("internet_access", v ? 1 : 0)}
        />
        <Switch
          label="Extracurricular"
          description="Participates in activities"
          checked={values.extracurricular === 1}
          onChange={(v) => set("extracurricular", v ? 1 : 0)}
        />
      </div>

      {error ? (
        <div className="rounded-xl bg-rose-500/10 px-3.5 py-3 text-sm text-rose-300 ring-1 ring-rose-500/30">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={submitting || !valid}>
          <Save className="h-3.5 w-3.5" /> {submitting ? "Saving…" : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
