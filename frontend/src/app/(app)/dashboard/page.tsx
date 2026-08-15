"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { AdminDashboard } from "@/components/dashboards/admin-dashboard";
import { AdvisorDashboard } from "@/components/dashboards/advisor-dashboard";
import { FacultyDashboard } from "@/components/dashboards/faculty-dashboard";
import { StudentDashboard } from "@/components/dashboards/student-dashboard";

export default function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null

  switch (user.role) {
    case "student":
      return <StudentDashboard user={user} />
    case "faculty":
      return <FacultyDashboard user={user} />
    case "advisor":
      return <AdvisorDashboard user={user} />
    case "admin":
    default:
      return <AdminDashboard user={user} />
  }
}
