"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { StudentsPage } from "@/components/pages/students-page";

export default function StudentsRoute() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role === "student") router.replace("/dashboard")
  }, [user, router])

  if (!user) return null
  if (user.role === "student") return null
  return <StudentsPage />
}
