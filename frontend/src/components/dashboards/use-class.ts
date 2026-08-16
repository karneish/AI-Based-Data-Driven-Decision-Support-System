import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AnalysisResult, Student, StudentInput } from "@/types";

export function studentToInput(s: Student): StudentInput {
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

export interface ClassRow {
  student: Student
  analysis: AnalysisResult | null
  loading: boolean
  error: string | null
}

export function useClassRows() {
  const [rows, setRows] = useState<ClassRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await api.listStudents()
      const results = await Promise.all(
        list.map(async (student) => {
          try {
            const analysis = await api.analyze(studentToInput(student))
            return { student, analysis, loading: false, error: null }
          } catch (err) {
            return {
              student,
              analysis: null,
              loading: false,
              error: err instanceof Error ? err.message : "Analysis failed",
            }
          }
        })
      )
      setRows(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load students")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { rows, loading, error, refresh }
}

export interface ClassStats {
  total: number
  stable: number
  monitor: number
  intervene: number
  avgAsi: number
}

export function computeClassStats(rows: ClassRow[]): ClassStats {
  const stats: ClassStats = { total: 0, stable: 0, monitor: 0, intervene: 0, avgAsi: 0 }
  const values = rows.filter((r) => r.analysis)
  stats.total = values.length
  let sum = 0
  for (const row of values) {
    const a = row.analysis!
    sum += a.asi
    if (a.risk_color === "green") stats.stable += 1
    else if (a.risk_color === "amber") stats.monitor += 1
    else stats.intervene += 1
  }
  stats.avgAsi = values.length ? sum / values.length : 0
  return stats
}
