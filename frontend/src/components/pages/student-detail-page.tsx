"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  LifeBuoy,
  PlayCircle,
  Pencil,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import { VerdictConsole } from "@/components/report/verdict-console";
import {
  StudentProfileForm,
  toProfileForm,
} from "@/components/forms/student-profile-form";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  AnalysisResult,
  Intervention,
  ReportRecord,
  Student,
} from "@/types";

const STATUS_FLOW: Intervention["status"][] = ["open", "in_progress", "done"]

export function StudentDetailPage() {
  const { user } = useAuth()
  const params = useParams<{ id: string }>()
  const search = useSearchParams()
  const editMode = search.get("edit") === "1"

  const id = Number(params.id)
  const [student, setStudent] = useState<Student | null>(null)
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(editMode)
  const [formError, setFormError] = useState<string | null>(null)
  const [actionText, setActionText] = useState("")
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium")
  const [actionNotes, setActionNotes] = useState("")

  const role = user?.role ?? ""
  const canManage = role === "faculty" || role === "admin"
  const canIntervene = role === "advisor" || role === "admin"

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [students, history, list] = await Promise.all([
        api.listStudents(),
        api.listReports(id),
        canIntervene ? api.listInterventions(id) : Promise.resolve([]),
      ])
      const found = students.find((s) => s.id === id) ?? null
      setStudent(found)
      setReports(history)
      setInterventions(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the student record")
    } finally {
      setLoading(false)
    }
  }, [id, canIntervene])

  useEffect(() => {
    void load()
  }, [load])

  const latest = useMemo<AnalysisResult | null>(
    () => (reports.length > 0 ? reports[0].result : null),
    [reports]
  )

  const analyze = async () => {
    if (!student || analyzing) return
    setAnalyzing(true)
    try {
      const res = await api.analyzeStudent(student.id)
      setReports((prev) => [res.report, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setAnalyzing(false)
    }
  }

  const saveProfile = async (values: ReturnType<typeof toProfileForm>) => {
    if (!student) return
    setSaving(true)
    setFormError(null)
    try {
      const updated = await api.updateStudent(student.id, values)
      setStudent(updated)
      setEditOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save profile")
    } finally {
      setSaving(false)
    }
  }

  const createIntervention = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!student || !actionText.trim()) return
    try {
      await api.createIntervention({
        student_id: student.id,
        action: actionText.trim(),
        notes: actionNotes.trim() || undefined,
        priority,
      })
      setActionText("")
      setActionNotes("")
      setPriority("Medium")
      const list = await api.listInterventions(student.id)
      setInterventions(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create intervention")
    }
  }

  const advanceStatus = async (intervention: Intervention) => {
    const idx = STATUS_FLOW.indexOf(intervention.status)
    const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)]
    if (next === intervention.status) return
    try {
      await api.updateIntervention(intervention.id, { status: next })
      const list = await api.listInterventions(intervention.student_id)
      setInterventions(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status")
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
        <div className="grid gap-5 xl:grid-cols-3">
          <Skeleton className="h-96 xl:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <Card>
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="Student not found"
          body="This profile may have been deleted or you may not have access to it."
          action={
            <Link href="/students">
              <Button variant="secondary">
                <ArrowLeft className="h-4 w-4" /> Back to roster
              </Button>
            </Link>
          }
        />
      </Card>
    )
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <PageHeader
        kicker="Student record"
        title={student.name}
        subtitle="Academic indicators, live ensemble verdict and saved analysis history."
        icon={<ClipboardList className="h-5 w-5" />}
      >
        <Link href="/students">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-3.5 w-3.5" /> Roster
          </Button>
        </Link>
        {canManage ? (
          <Button size="sm" onClick={() => setEditOpen((v) => !v)}>
            {editOpen ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            {editOpen ? "Close editor" : "Edit profile"}
          </Button>
        ) : null}
        <Button size="sm" variant="secondary" onClick={analyze} disabled={analyzing}>
          <PlayCircle className="h-3.5 w-3.5" />
          {analyzing ? "Analyzing…" : "Analyze"}
        </Button>
      </PageHeader>

      {error ? (
        <div className="mb-5 rounded-xl bg-rose-500/10 px-3.5 py-3 text-sm text-rose-300 ring-1 ring-rose-500/30">
          {error}
        </div>
      ) : null}

      {editOpen && canManage ? (
        <Card className="mb-5">
          <CardHeader
            title={`Editing ${student.name}`}
            subtitle="Changes are saved to the database"
            icon={<Pencil className="h-4 w-4" />}
          />
          <div className="p-5">
            <StudentProfileForm
              key={student.id}
              initial={toProfileForm(student)}
              submitLabel="Save changes"
              submitting={saving}
              error={formError}
              onSubmit={saveProfile}
              onCancel={() => setEditOpen(false)}
              compact
            />
          </div>
        </Card>
      ) : null}

      {latest ? <VerdictConsole result={latest} /> : null}

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <Card>
            <CardHeader
              title="Report history"
              subtitle={`${reports.length} saved analysis report${reports.length === 1 ? "" : "s"}`}
              icon={<BookOpen className="h-4 w-4" />}
              action={
                <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  {reports.length > 0
                    ? `Latest: ${new Date(reports[0].created_at).toLocaleString()}`
                    : "No reports yet"}
                </span>
              }
            />
            {reports.length === 0 ? (
              <div className="p-6 text-sm text-ink-soft">
                Click <span className="font-semibold text-ink">Analyze</span> to
                run the ensemble and save the first report.
              </div>
            ) : (
              <div className="divide-y divide-line">
                {reports.map((report) => {
                  const r = report.result
                  return (
                    <div key={report.id} className="flex flex-wrap items-center gap-4 p-4">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                          r.risk_color === "green"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : r.risk_color === "amber"
                              ? "bg-amber-500/10 text-amber-300"
                              : "bg-rose-500/10 text-rose-300"
                        )}
                      >
                        {r.asi.toFixed(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">
                          ASI {r.asi.toFixed(1)} · {r.predicted_class}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {new Date(report.created_at).toLocaleString()}
                          {report.created_by ? ` · by ${report.created_by}` : ""}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                          r.risk_color === "green"
                            ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30"
                            : r.risk_color === "amber"
                              ? "bg-amber-500/10 text-amber-300 ring-amber-500/30"
                              : "bg-rose-500/10 text-rose-300 ring-rose-500/30"
                        )}
                      >
                        {r.risk_category}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {canIntervene ? (
            <Card className="mt-5">
              <CardHeader
                title="Interventions"
                subtitle={`${interventions.length} planned for this student`}
                icon={<LifeBuoy className="h-4 w-4" />}
              />
              <form onSubmit={createIntervention} className="grid gap-3 border-b border-line p-4 sm:grid-cols-[1fr_auto_auto]">
                <input
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="e.g. Weekly study-habits coaching session"
                  className="input-field"
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as "High" | "Medium" | "Low")}
                  className="input-field"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <Button type="submit" size="sm">
                  Plan
                </Button>
              </form>
              {interventions.length === 0 ? (
                <p className="p-5 text-sm text-ink-soft">
                  No interventions planned yet. Click a row below once created to
                  advance its status.
                </p>
              ) : (
                <div className="divide-y divide-line">
                  {interventions.map((i) => {
                    const next =
                      STATUS_FLOW[Math.min(STATUS_FLOW.indexOf(i.status) + 1, STATUS_FLOW.length - 1)]
                    return (
                      <button
                        key={i.id}
                        onClick={() => advanceStatus(i)}
                        disabled={i.status === "done"}
                        className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-white/[0.03] disabled:cursor-default disabled:hover:bg-transparent"
                      >
                        <span
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            i.status === "done"
                              ? "bg-emerald-400"
                              : i.status === "in_progress"
                                ? "bg-amber-400"
                                : "bg-rose-400"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink">{i.action}</p>
                          {i.notes ? (
                            <p className="mt-0.5 text-xs text-ink-soft">{i.notes}</p>
                          ) : null}
                        </div>
                        <Badge tone={i.priority === "High" ? "red" : i.priority === "Medium" ? "amber" : "green"}>
                          {i.priority}
                        </Badge>
                        <Badge
                          tone={
                            i.status === "done"
                              ? "green"
                              : i.status === "in_progress"
                                ? "amber"
                                : "red"
                          }
                        >
                          {i.status.replace("_", " ")}
                        </Badge>
                        {i.status !== "done" ? (
                          <span className="text-[11px] text-ink-muted">next: {next.replace("_", " ")}</span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              )}
            </Card>
          ) : null}
        </div>

        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader
              title="Profile"
              subtitle="Indicators used for predictions"
              icon={<ClipboardList className="h-4 w-4" />}
              action={
                canManage ? (
                  <button
                    onClick={() => setEditOpen((v) => !v)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition hover:bg-white/5 hover:text-emerald-300"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                ) : null
              }
            />
            <div className="space-y-3 p-5 text-sm">
              {[
                ["Previous GPA", `${student.previous_gpa.toFixed(1)} / 10`],
                ["Internal score", `${Math.round(student.internal_score)}%`],
                ["Study hours", `${student.study_hours} hrs / week`],
                ["Attendance", `${Math.round(student.attendance)}%`],
                ["Assignment rate", `${Math.round(student.assignment_rate)}%`],
                [
                  "Parental education",
                  student.parental_education === 0
                    ? "None"
                    : student.parental_education === 1
                      ? "High school"
                      : student.parental_education === 2
                        ? "Undergraduate"
                        : "Postgraduate",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-ink-soft">{label}</span>
                  <span className="tabular font-semibold text-ink">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-soft">Internet access</span>
                <span className="font-semibold text-ink">
                  {student.internet_access ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-soft">Extracurricular</span>
                <span className="font-semibold text-ink">
                  {student.extracurricular ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-xs text-ink-soft">
            <ShieldAlert className="h-4 w-4 shrink-0 text-emerald-300" />
            Analyses here are persisted as reports and count toward platform history.
          </div>
        </div>
      </div>
    </div>
  )
}
