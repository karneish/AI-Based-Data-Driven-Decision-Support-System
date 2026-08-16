"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  LifeBuoy,
  PlusCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, Card, CardHeader, EmptyState } from "@/components/ui";
import { StudentRow, StudentRowSkeleton } from "@/components/dashboards/shared";
import { useClassRows } from "@/components/dashboards/use-class";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Intervention, User } from "@/types";

const PRIORITY_TONE: Record<string, "red" | "amber" | "green"> = {
  High: "red",
  Medium: "amber",
  Low: "green",
}

const STATUS_FLOW: Intervention["status"][] = ["open", "in_progress", "done"]

function statusTone(status: Intervention["status"]) {
  return status === "done" ? "green" : status === "in_progress" ? "amber" : "red"
}

export function AdvisorDashboard({ user }: { user: User }) {
  const { rows, loading } = useClassRows()
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
  const [action, setAction] = useState("")
  const [notes, setNotes] = useState("")
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium")
  const [creating, setCreating] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const list = await api.listInterventions()
      setInterventions(list)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load interventions")
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const cases = useMemo(
    () =>
      rows.map((row) => {
        const studentInterventions = interventions
          .filter((i) => i.student_id === row.student.id)
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
        return { ...row, interventions: studentInterventions }
      }),
    [rows, interventions]
  )

  const openCount = interventions.filter(
    (i) => i.status === "open" || i.status === "in_progress"
  ).length

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !action.trim()) {
      setActionError("Pick a student and enter an action.")
      return
    }
    setCreating(true)
    setActionError(null)
    try {
      await api.createIntervention({
        student_id: selectedStudent,
        action: action.trim(),
        notes: notes.trim() || undefined,
        priority,
      })
      setAction("")
      setNotes("")
      setPriority("Medium")
      setSelectedStudent(null)
      await refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not create intervention")
    } finally {
      setCreating(false)
    }
  }

  const advanceStatus = async (intervention: Intervention) => {
    const idx = STATUS_FLOW.indexOf(intervention.status)
    const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)]
    if (next === intervention.status) return
    try {
      await api.updateIntervention(intervention.id, { status: next })
      await refresh()
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not update status")
    }
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <PageHeader
        kicker="Advisor workspace"
        title={`Student support, ${user.name.split(" ")[0]}`}
        subtitle="Track predicted cases and plan targeted support — every intervention you schedule is saved to the shared database."
        icon={<LifeBuoy className="h-5 w-5" />}
      >
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/25 sm:inline-flex">
          <Sparkles className="h-3.5 w-3.5" /> {openCount} active
        </span>
      </PageHeader>

      {loadError ? (
        <Card>
          <EmptyState
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Could not load interventions"
            body={loadError}
          />
        </Card>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-3">
          <div className="min-w-0 xl:col-span-2">
            <Card>
              <CardHeader
                title="Student cases"
                subtitle="Live risk verdicts with any planned support"
                icon={<ClipboardCheck className="h-4 w-4" />}
              />
              <div className="space-y-2.5 p-4">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <StudentRowSkeleton key={i} />)
                  : cases.map((c) => (
                      <div key={c.student.id} className="space-y-2">
                        <StudentRow
                          student={c.student}
                          analysis={c.analysis}
                          loading={c.loading}
                          error={c.error}
                        />
                        {c.interventions.length > 0 ? (
                          <div className="ml-12 space-y-1.5">
                            {c.interventions.slice(0, 2).map((i) => (
                              <div key={i.id} className="flex flex-wrap items-center gap-2 text-xs">
                                <Badge tone={statusTone(i.status)}>{i.status.replace("_", " ")}</Badge>
                                <span className="text-ink-soft">{i.action}</span>
                                <Badge tone={PRIORITY_TONE[i.priority]}>{i.priority}</Badge>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                {!loading && cases.length === 0 ? (
                  <p className="px-2 py-6 text-center text-sm text-ink-soft">
                    No students in the roster yet.
                  </p>
                ) : null}
              </div>
            </Card>

            <Card className="mt-5">
              <CardHeader
                title="Active interventions"
                subtitle="Click a row to advance its status"
                icon={<LifeBuoy className="h-4 w-4" />}
              />
              {interventions.length === 0 ? (
                <p className="p-5 text-sm text-ink-soft">
                  Nothing planned yet — create the first intervention from the panel on the right.
                </p>
              ) : (
                <div className="divide-y divide-line">
                  {interventions.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => advanceStatus(i)}
                      className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-white/[0.03]"
                      title={`Advance to next status (now: ${i.status.replace("_", " ")}). Delete requires an admin.`}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                          i.status === "done"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : i.status === "in_progress"
                              ? "bg-amber-500/10 text-amber-300"
                              : "bg-rose-500/10 text-rose-300"
                        )}
                      >
                        {i.status === "done" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <ClipboardCheck className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">{i.student_name}</p>
                        <p className="mt-0.5 truncate text-xs text-ink-soft">{i.action}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Badge tone={PRIORITY_TONE[i.priority]}>{i.priority}</Badge>
                        <Badge tone={statusTone(i.status)}>
                          {i.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="min-w-0 space-y-5">
            <Card>
              <CardHeader
                title="Schedule support"
                subtitle="Persisted to the shared database"
                icon={<PlusCircle className="h-4 w-4" />}
              />
              <form onSubmit={submit} className="space-y-4 p-5">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink">Student</span>
                  <select
                    value={selectedStudent ?? ""}
                    onChange={(e) => setSelectedStudent(Number(e.target.value) || null)}
                    className="input-field"
                  >
                    <option value="">Select a student…</option>
                    {rows.map((r) => (
                      <option key={r.student.id} value={r.student.id}>
                        {r.student.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink">Action</span>
                  <input
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="e.g. Weekly attendance check-in"
                    className="input-field"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink">Priority</span>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as "High" | "Medium" | "Low")}
                    className="input-field"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink">Notes</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional context for the advisor team…"
                    rows={3}
                    className="input-field resize-none"
                  />
                </label>
                {actionError ? (
                  <p className="text-sm text-rose-300">{actionError}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-primary-hover disabled:opacity-60"
                >
                  {creating ? "Saving…" : "Create intervention"}
                </button>
              </form>
            </Card>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
              <p className="text-sm font-semibold text-emerald-300">
                {user.role} access granted
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                Intervention planning and case tracking enabled. Deleting
                interventions requires an admin.
              </p>
            </div>

            <Link
              href="/interventions"
              className="group flex items-center gap-3 rounded-2xl border border-line bg-white/[0.02] p-4 transition hover:border-emerald-500/40 hover:bg-emerald-500/[0.05]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 transition group-hover:bg-emerald-500 group-hover:text-emerald-950">
                <BookOpenCheck className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">
                  Open interventions workspace
                </span>
                <span className="mt-0.5 block text-xs text-ink-soft">
                  Full list with status workflow
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:text-emerald-300" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
