"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { InterventionsPage } from "@/components/pages/interventions-page";

export default function InterventionsRoute() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "advisor")
      router.replace("/dashboard")
  }, [user, router])

  if (!user) return null
  if (user.role !== "admin" && user.role !== "advisor") return null
  return <InterventionsPage />
}
