"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { UsersPage } from "@/components/pages/users-page";

export default function UsersRoute() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard")
  }, [user, router])

  if (!user) return null
  if (user.role !== "admin") return null
  return <UsersPage />
}
