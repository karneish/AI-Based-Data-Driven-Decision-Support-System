"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Pencil,
  PlusCircle,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import { StudentRow, StudentRowSkeleton } from "@/components/dashboards/shared";
import { useClassRows } from "@/components/dashboards/use-class";
import {
  StudentProfileForm,
  blankProfileForm,
} from "@/components/forms/student-profile-form";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Student } from "@/types";

export function StudentsPage() {
  const { user } = useAuth()
  const { rows, loading, error, refresh } = useClassRows()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const canManage = user?.role === "faculty" || user?.role === "admin"

  const createStudent = useCallback(
    async (values: ReturnType<typeof blankProfileForm>) => {
      setSubmitting(true)
      setFormError(null)
      try {
        await api.createStudent({
          name: values.name.trim(),
          previous_gpa: values.previous_gpa,
          internal_score: values.internal_score,
          study_hours: values.study_hours,
          attendance: values.attendance,
          assignment_rate: values.assignment_rate,
          parental_education: values.parental_education,
          internet_access: values.internet_access,
          extracurricular: values.extracurricular,
        })
        setShowForm(false)
        await refresh()
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Could not create student")
      } finally {
        setSubmitting(false)
      }
    },
    [refresh]
  )

  const deleteStudent = useCallback(
    async (student: Student) => {
      if (!window.confirm(`Delete ${student.name}? This removes their reports and interventions.`)) return
      setDeletingId(student.id)
      try {
        await api.deleteStudent(student.id)
        await refresh()
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Could not delete student")
      } finally {
        setDeletingId(null)
      }
    },
    [refresh]
  )

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <PageHeader
        kicker="Student management"
        title="Roster"
        subtitle="Every student profile on the platform with a live ensemble verdict. Click any row for the full record."
        icon={<Users className="h-5 w-5" />}
      >
        {canManage ? (
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
            {showForm ? "Cancel" : "Add student"}
          </Button>
        ) : null}
      </PageHeader>

      {error ? (
        <Card>
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="Could not load the roster"
            body={error}
          />
        </Card>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-3">
          <div className={cn("min-w-0", showForm ? "xl:col-span-2" : "xl:col-span-3")}>
            <Card>
              <CardHeader
                title="All students"
                subtitle={`${rows.length} profile${rows.length === 1 ? "" : "s"} in the roster`}
                icon={<ShieldAlert className="h-4 w-4" />}
              />
              <div className="space-y-2.5 p-4">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <StudentRowSkeleton key={i} />)
                  : rows.map((row) => (
                      <div key={row.student.id} className="group/row relative">
                        <StudentRow
                          student={row.student}
                          analysis={row.analysis}
                          loading={row.loading}
                          error={row.error}
                        />
                        {canManage ? (
                          <div className="absolute right-14 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1 opacity-0 transition group-hover/row:opacity-100 max-sm:opacity-100">
                            <Link
                              href={`/students/${row.student.id}?edit=1`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-ink-soft transition hover:bg-emerald-500/20 hover:text-emerald-300"
                              title="Edit profile"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              onClick={() => deleteStudent(row.student)}
                              disabled={deletingId === row.student.id}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-ink-soft transition hover:bg-rose-500/20 hover:text-rose-300 disabled:opacity-50"
                              title="Delete student"
                            >
                              {deletingId === row.student.id ? (
                                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                {!loading && rows.length === 0 ? (
                  <EmptyState
                    icon={<Users className="h-6 w-6" />}
                    title="Roster is empty"
                    body={
                      canManage
                        ? "Add the first student profile to start analyzing outcomes."
                        : "No students have been added yet."
                    }
                  />
                ) : null}
              </div>
            </Card>
          </div>

          {showForm ? (
            <div className="min-w-0">
              <Card>
                <CardHeader
                  title="New student"
                  subtitle="Create a profile in the roster"
                  icon={<PlusCircle className="h-4 w-4" />}
                />
                <div className="p-5">
                  <StudentProfileForm
                    initial={blankProfileForm()}
                    submitLabel="Create student"
                    submitting={submitting}
                    error={formError}
                    onSubmit={createStudent}
                    onCancel={() => setShowForm(false)}
                  />
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-line bg-white/[0.02] px-4 py-3 text-xs text-ink-soft">
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
        Verdicts are computed live by the ensemble — open a student to save an analysis report and review history.
      </div>
    </div>
  )
}
