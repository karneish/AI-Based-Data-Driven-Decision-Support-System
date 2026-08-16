"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { ReportsPage } from "@/components/pages/reports-page";

export default function ReportsRoute() {
  const { user } = useAuth()
  if (!user) return null
  return <ReportsPage />
}
