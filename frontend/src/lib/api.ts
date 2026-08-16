import type {
  AnalysisResult,
  AnalyzeStudentResponse,
  FeatureImportanceResponse,
  Intervention,
  ModelComparisonData,
  ReportRecord,
  Student,
  StudentInput,
  User,
  UserRecord,
} from "@/types"

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://dss-mip.onrender.com")

const TOKEN_KEY = "dss_mip_token"

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return
  if (token) window.localStorage.setItem(TOKEN_KEY, token)
  else window.localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  const token = getToken()
  if (token) headers["Authorization"] = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers,
      ...init,
    })
  } catch {
    throw new ApiError(
      0,
      "Unable to reach the analysis engine. Please check your connection and try again."
    )
  }

  if (!res.ok) {
    let detail = `Request failed with status ${res.status}.`
    try {
      const body = await res.json()
      if (body?.detail) {
        detail =
          typeof body.detail === "string"
            ? body.detail
            : JSON.stringify(body.detail)
      }
    } catch {
      /* keep default message */
    }
    throw new ApiError(res.status, detail)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  login: (username: string, password: string) =>
    request<User>("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  signup: (name: string, username: string, password: string) =>
    request<User>("/api/signup", {
      method: "POST",
      body: JSON.stringify({ name, username, password }),
    }),

  listUsers: () => request<UserRecord[]>("/api/users"),

  analyze: (input: StudentInput) =>
    request<AnalysisResult>("/api/analyze", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  simulate: (input: StudentInput) =>
    request<AnalysisResult>("/api/simulate", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  modelComparison: () => request<ModelComparisonData>("/api/model-comparison"),

  featureImportance: () =>
    request<FeatureImportanceResponse>("/api/feature-importance"),

  listStudents: () => request<Student[]>("/api/students"),

  createStudent: (data: Omit<Student, "id" | "user_id" | "created_at" | "updated_at">) =>
    request<Student>("/api/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateStudent: (id: number, data: Partial<Student>) =>
    request<Student>(`/api/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteStudent: (id: number) =>
    request<void>(`/api/students/${id}`, { method: "DELETE" }),

  analyzeStudent: (id: number) =>
    request<AnalyzeStudentResponse>(`/api/students/${id}/analyze`, {
      method: "POST",
    }),

  listReports: (studentId?: number) =>
    request<ReportRecord[]>(
      studentId ? `/api/reports?student_id=${studentId}` : "/api/reports"
    ),

  listInterventions: (studentId?: number) =>
    request<Intervention[]>(
      studentId ? `/api/interventions?student_id=${studentId}` : "/api/interventions"
    ),

  createIntervention: (data: {
    student_id: number
    action: string
    notes?: string
    priority?: string
  }) =>
    request<Intervention>("/api/interventions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateIntervention: (id: number, data: Partial<Intervention>) =>
    request<Intervention>(`/api/interventions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteIntervention: (id: number) =>
    request<void>(`/api/interventions/${id}`, { method: "DELETE" }),
}

export function readStoredUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem("dss_mip_user")
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function writeStoredUser(user: User | null): void {
  if (typeof window === "undefined") return
  if (user) {
    window.localStorage.setItem("dss_mip_user", JSON.stringify(user))
    setToken(user.token)
  } else {
    window.localStorage.removeItem("dss_mip_user")
    setToken(null)
  }
}
