"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldUser,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, Card, CardHeader, EmptyState, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { UserRecord } from "@/types";

const ROLE_TONE: Record<string, "green" | "cyan" | "amber" | "teal"> = {
  student: "green",
  faculty: "cyan",
  advisor: "amber",
  admin: "teal",
}

export function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await api.listUsers()
      setUsers(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load user accounts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const counts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <PageHeader
        kicker="Access control"
        title="User accounts"
        subtitle="Every account registered on the platform, with its assigned role."
        icon={<Users className="h-5 w-5" />}
      >
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/25 sm:inline-flex">
          <Sparkles className="h-3.5 w-3.5" /> {users.length} accounts
        </span>
      </PageHeader>

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-56" />
        </div>
      ) : error ? (
        <Card>
          <EmptyState
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Could not load user accounts"
            body={error}
          />
        </Card>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <Card>
              <CardHeader
                title="All accounts"
                subtitle="Signups and seeded demo users"
                icon={<Users className="h-4 w-4" />}
              />
              {users.length === 0 ? (
                <EmptyState
                  icon={<UserRound className="h-6 w-6" />}
                  title="No accounts"
                  body="Users appear here once they sign up."
                />
              ) : (
                <div className="divide-y divide-line">
                  {users.map((u) => (
                    <div key={u.id} className="flex flex-wrap items-center gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/80 to-teal-500/80 text-sm font-bold text-emerald-950">
                        {u.name
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">{u.name}</p>
                        <p className="mt-0.5 text-xs text-ink-soft">@{u.username}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Badge tone={ROLE_TONE[u.role] ?? "green"}>{u.role}</Badge>
                        <span className="text-[11px] text-ink-muted">
                          joined {new Date(u.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="min-w-0">
            <Card>
              <CardHeader
                title="By role"
                subtitle="Distribution across roles"
                icon={<ShieldUser className="h-4 w-4" />}
              />
              <div className="space-y-3 p-5">
                {(["student", "faculty", "advisor", "admin"] as const).map((role) => (
                  <div key={role}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-ink capitalize">{role}</span>
                      <span className="tabular font-semibold text-ink-soft">
                        {counts[role] ?? 0}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          role === "student"
                            ? "bg-emerald-400"
                            : role === "faculty"
                              ? "bg-cyan-400"
                              : role === "advisor"
                                ? "bg-amber-400"
                                : "bg-teal-400"
                        )}
                        style={{
                          width: `${((counts[role] ?? 0) / Math.max(users.length, 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> Admin only
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                This view is restricted to admins. Passwords are hashed with
                PBKDF2 — plaintext is never stored.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
