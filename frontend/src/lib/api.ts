import type {
  AnalysisResult,
  FeatureImportanceResponse,
  ModelComparisonData,
  StudentInput,
  User,
} from "@/types"

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://dss-mip.onrender.com")

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
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

  return res.json() as Promise<T>
}

export const api = {
  login: (username: string, password: string) =>
    request<User>("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

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
  if (user) window.localStorage.setItem("dss_mip_user", JSON.stringify(user))
  else window.localStorage.removeItem("dss_mip_user")
}
