"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, KeyRound, UserRound } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";
import { Button, Field } from "@/components/ui";
import { LogoMark } from "@/components/layout/logo";

const DEMO_ACCOUNTS = [
  { label: "Advisor", username: "admin", password: "admin123" },
  { label: "Student", username: "karneish", password: "pass123" },
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
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0b1030] p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-violet-600/25 blur-[130px]" />
        <div className="relative flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <span className="text-lg font-bold tracking-tight">
            DSS<span className="text-indigo-400">-MIP</span>
          </span>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Data-driven decisions for{" "}
            <span className="text-gradient">every student.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Predict success probability with an ensemble of five machine
            learning models, classify risk in real time and explore
            counterfactual recommendations — completely free, no database
            required.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            {[
              "Ensemble of 5 scikit-learn models trained in-memory",
              "Academic Success Index (ASI) risk classification",
              "What-if simulator with instant counterfactuals",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-[10px] text-emerald-300">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-slate-500">
          FastAPI · scikit-learn · Next.js · TypeScript
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <LogoMark />
            <span className="text-lg font-bold tracking-tight text-ink">
              DSS<span className="text-primary">-MIP</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Sign in to run student analyses and scenarios.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <Field
              label="Username"
              id="username"
              placeholder="e.g. karneish"
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
              <div className="rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-600 ring-1 ring-rose-200">
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

          <div className="mt-8">
            <div className="mb-3 flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-ink-muted">
              <span className="h-px flex-1 bg-line" /> Try a demo account{" "}
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => fillDemo(acc.username, acc.password)}
                  className="rounded-xl border border-line bg-white px-3 py-2.5 text-left transition hover:border-primary/40 hover:shadow-sm"
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
        </div>
      </div>
    </div>
  )
}
