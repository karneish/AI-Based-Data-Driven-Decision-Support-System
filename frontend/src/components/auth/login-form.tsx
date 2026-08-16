"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  UserRound,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";
import { Button, Card, Field } from "@/components/ui";
import { DemoCards } from "@/components/auth/demo-cards";
import { LogoMark } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup"

export function LoginForm() {
  const { login, signup } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("signin")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError("Please enter both username and password.")
      return
    }
    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your full name.")
        return
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.")
        return
      }
    }
    setLoading(true)
    setError(null)
    try {
      if (mode === "signup") {
        await signup(name.trim(), username.trim(), password)
      } else {
        await login(username.trim(), password)
      }
      router.push("/dashboard")
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again."
      )
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute left-1/2 top-[-10rem] h-96 w-[42rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[130px]" />
      <div className="absolute bottom-[-12rem] left-[-8rem] h-96 w-96 rounded-full bg-teal-500/10 blur-[130px]" />
      <div className="absolute right-[-8rem] top-1/3 h-96 w-96 rounded-full bg-emerald-500/[0.07] blur-[130px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,26rem)_1fr]">
          <div className="mx-auto w-full max-w-md">
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
              <div className="flex items-center gap-1 rounded-xl border border-line bg-white/[0.03] p-1">
                {(["signin", "signup"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={cn(
                      "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition",
                      mode === m
                        ? "bg-primary text-emerald-950"
                        : "text-ink-soft hover:text-ink"
                    )}
                  >
                    {m === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              {mode === "signin" ? (
                <p className="mt-5 text-sm text-ink-soft">
                  Sign in to run analyses and what-if scenarios.
                </p>
              ) : (
                <p className="mt-5 text-sm text-ink-soft">
                  Create a free student account — no email verification needed.
                </p>
              )}

              <form onSubmit={submit} className="mt-6 space-y-4">
                {mode === "signup" ? (
                  <Field
                    label="Full name"
                    id="name"
                    placeholder="e.g. Ananya Sharma"
                    autoComplete="name"
                    icon={<UserRound className="h-4 w-4" />}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : null}
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
                  placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
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
                  {loading
                    ? "Please wait…"
                    : mode === "signup"
                      ? "Create account"
                      : "Sign in"}
                </Button>
              </form>
            </Card>

            <Link
              href="/"
              className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
          </div>

          <div className="mx-auto w-full max-w-3xl lg:pt-6">
            <span className="section-kicker">Demo dashboards</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-3xl">
              One click into your role
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
              Each demo card signs you in instantly and opens the dashboard
              dedicated to that role — no typing, no sign-up, no data stored.
            </p>
            <div className="mt-6">
              <DemoCards gridClass="sm:grid-cols-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
