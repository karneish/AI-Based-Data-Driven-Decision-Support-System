"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
import { Spinner } from "@/components/ui";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!initializing && !user) router.replace("/login")
  }, [initializing, user, router])

  if (initializing || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-ink-soft">
          <Spinner className="h-6 w-6 text-primary" />
          <p className="text-sm">Checking access…</p>
        </div>
      </div>
    )
  }

  return <AppShell>{children}</AppShell>
}
