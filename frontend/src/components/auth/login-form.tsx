"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, KeyRound, UserRound } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";
import { Button, Card, Field } from "@/components/ui";
import { LogoMark } from "@/components/layout/logo";

const DEMO_ACCOUNTS = [
  { label: "Student", username: "student", password: "student123" },
  { label: "Faculty", username: "faculty", password: "faculty123" },
  { label: "Admin", username: "admin", password: "admin123" },
  { label: "Advisor", username: "advisor", password: "advisor123" },
]

export function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError("Please enter both username and password.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      await login(username, password)
      router.push("/dashboard")
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Sign-in failed. Please try again."
      )
      setLoading(false)
    }
  }

  const fillDemo = (u: string, p: string) => {
    setUsername(u)
    setPassword(p)
    setError(null)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute left-1/2 top-[-10rem] h-96 w-[42rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[130px]" />
      <div className="absolute bottom-[-12rem] left-[-8rem] h-96 w-96 rounded-full bg-teal-500/10 blur-[130px]" />
      <div className="absolute right-[-8rem] top-1/3 h-96 w-96 rounded-full bg-emerald-500/[0.07] blur-[130px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2.5 text-center">
          <LogoMark className="h-12 w-12" />
          <span className="text-xl font-bold tracking-tight text-ink">
            DSS<span className="text-primary">-MIP</span>
          </span>
          <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
            AI data-driven decision support for student performance.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <h1 className="text-lg font-bold tracking-tight text-ink">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Sign in to run analyses and what-if scenarios.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field
              label="Username"
              id="username"
              placeholder="e.g. student"
              autoComplete="username"
              icon={<UserRound className="h-4 w-4" />}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Field
              label="Password"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              icon={<KeyRound className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="flex h-6 w-6 items-center justify-center text-ink-muted transition hover:text-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            {error ? (
              <div className="rounded-xl bg-rose-500/10 px-3.5 py-3 text-sm text-rose-300 ring-1 ring-rose-500/30">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="mb-3 flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-ink-muted">
              <span className="h-px flex-1 bg-line" /> Demo accounts{" "}
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => fillDemo(acc.username, acc.password)}
                  className="rounded-xl border border-line bg-white/[0.04] px-3 py-2.5 text-left transition hover:border-emerald-500/40 hover:bg-white/[0.06]"
                >
                  <span className="block text-sm font-semibold text-ink">
                    {acc.label}
                  </span>
                  <span className="block text-[11px] text-ink-muted">
                    {acc.username}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </div>
  )
}
