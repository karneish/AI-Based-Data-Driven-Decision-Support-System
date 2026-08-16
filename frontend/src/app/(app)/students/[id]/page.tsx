"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { StudentDetailPage } from "@/components/pages/student-detail-page";

export default function StudentDetailRoute() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role === "student") router.replace("/dashboard")
  }, [user, router])

  if (!user) return null
  if (user.role === "student") return null

  return (
    <Suspense fallback={null}>
      <StudentDetailPage />
    </Suspense>
  )
}
