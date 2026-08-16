"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  LifeBuoy,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, Card, CardHeader, EmptyState, Skeleton } from "@/components/ui";
import { useClassRows } from "@/components/dashboards/use-class";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Intervention } from "@/types";

const STATUS_FLOW: Intervention["status"][] = ["open", "in_progress", "done"]

function statusTone(status: Intervention["status"]) {
  return status === "done" ? "green" : status === "in_progress" ? "amber" : "red"
}

const PRIORITY_TONE: Record<string, "red" | "amber" | "green"> = {
  High: "red",
  Medium: "amber",
  Low: "green",
}

export function InterventionsPage() {
  const { user } = useAuth()
  const { rows } = useClassRows()
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [studentId, setStudentId] = useState<number | null>(null)
  const [action, setAction] = useState("")
  const [notes, setNotes] = useState("")
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium")

  const role = user?.role ?? ""
  const canManage = role === "admin" || role === "advisor"
  const canDelete = role === "admin"

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await api.listInterventions()
      setInterventions(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load interventions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const stats = useMemo(
    () => ({
      open: interventions.filter((i) => i.status === "open").length,
      in_progress: interventions.filter((i) => i.status === "in_progress").length,
      done: interventions.filter((i) => i.status === "done").length,
    }),
    [interventions]
  )

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !action.trim()) return
    setCreating(true)
    setError(null)
    try {
      await api.createIntervention({
        student_id: studentId,
        action: action.trim(),
        notes: notes.trim() || undefined,
        priority,
      })
      setAction("")
      setNotes("")
      setPriority("Medium")
      setStudentId(null)
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create intervention")
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
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status")
    }
  }

  const remove = async (intervention: Intervention) => {
    if (!window.confirm(`Delete this intervention for ${intervention.student_name}?`)) return
    try {
      await api.deleteIntervention(intervention.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete intervention")
    }
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <PageHeader
        kicker="Support planning"
        title="Interventions"
        subtitle="Every planned support action, tracked through a simple open → in-progress → done workflow."
        icon={<LifeBuoy className="h-5 w-5" />}
      >
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/25 sm:inline-flex">
          <Sparkles className="h-3.5 w-3.5" /> {interventions.length} planned
        </span>
      </PageHeader>

      {error ? (
        <div className="mb-5 rounded-xl bg-rose-500/10 px-3.5 py-3 text-sm text-rose-300 ring-1 ring-rose-500/30">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid items-start gap-5 xl:grid-cols-3">
          <div className="space-y-3 xl:col-span-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-72" />
        </div>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-3">
          <div className="min-w-0 xl:col-span-2">
            <Card>
              <CardHeader
                title="All interventions"
                subtitle="Click a row to advance its status"
                icon={<ClipboardCheck className="h-4 w-4" />}
                action={
                  canManage ? (
                    <button
                      onClick={() => setShowForm((v) => !v)}
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-emerald-950 transition hover:bg-primary-hover"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      {showForm ? "Close" : "New intervention"}
                    </button>
                  ) : null
                }
              />
              {interventions.length === 0 ? (
                <EmptyState
                  icon={<LifeBuoy className="h-6 w-6" />}
                  title="No interventions yet"
                  body="Plan the first support action to start building the case list."
                />
              ) : (
                <div className="divide-y divide-line">
                  {interventions.map((i) => (
                    <div key={i.id} className="flex items-center gap-4 p-4">
                      <button
                        onClick={() => advanceStatus(i)}
                        disabled={i.status === "done"}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-ink-soft transition hover:bg-emerald-500/20 hover:text-emerald-300 disabled:cursor-default disabled:hover:bg-white/5 disabled:hover:text-ink-soft"
                        title={
                          i.status === "done"
                            ? "Completed"
                            : `Advance to next status`
                        }
                      >
                        {i.status === "done" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        ) : (
                          <ClipboardCheck className="h-4 w-4" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">{i.student_name}</p>
                        <p className="mt-0.5 truncate text-xs text-ink-soft">
                          {i.action}
                          {i.notes ? ` — ${i.notes}` : ""}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink-muted">
                          {new Date(i.created_at).toLocaleString()}
                          {i.created_by ? ` · by ${i.created_by}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Badge tone={PRIORITY_TONE[i.priority]}>{i.priority}</Badge>
                        <Badge tone={statusTone(i.status)}>
                          {i.status.replace("_", " ")}
                        </Badge>
                      </div>
                      {canDelete ? (
                        <button
                          onClick={() => remove(i)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted transition hover:bg-rose-500/20 hover:text-rose-300"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="min-w-0 space-y-5">
            <Card>
              <CardHeader
                title="Pipeline"
                subtitle="Current distribution"
                icon={<Sparkles className="h-4 w-4" />}
              />
              <div className="space-y-3 p-5">
                {(
                  [
                    ["Open", "open", "bg-rose-400"],
                    ["In progress", "in_progress", "bg-amber-400"],
                    ["Done", "done", "bg-emerald-400"],
                  ] as const
                ).map(([label, key, bar]) => {
                  const count = stats[key]
                  return (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-ink">{label}</span>
                        <span className="tabular font-semibold text-ink-soft">{count}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className={cn("h-full rounded-full", bar)}
                          style={{
                            width: `${(count / Math.max(interventions.length, 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {showForm && canManage ? (
              <Card>
                <CardHeader
                  title="New intervention"
                  subtitle="Saved to the shared database"
                  icon={<PlusCircle className="h-4 w-4" />}
                />
                <form onSubmit={submit} className="space-y-4 p-5">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink">Student</span>
                    <select
                      value={studentId ?? ""}
                      onChange={(e) => setStudentId(Number(e.target.value) || null)}
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
                      rows={3}
                      placeholder="Optional context…"
                      className="input-field resize-none"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-primary-hover disabled:opacity-60"
                  >
                    {creating ? "Saving…" : "Create intervention"}
                  </button>
                </form>
              </Card>
            ) : null}

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                {role} access
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                {canDelete
                  ? "Advisors plan and advance interventions; admins can also delete them."
                  : canManage
                    ? "You can create interventions and advance their status."
                    : "You have read-only access to this workspace."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
