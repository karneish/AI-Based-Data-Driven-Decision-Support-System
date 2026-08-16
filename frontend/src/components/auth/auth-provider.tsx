"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, readStoredUser, writeStoredUser } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null
  initializing: boolean
  login: (username: string, password: string) => Promise<User>
  signup: (name: string, username: string, password: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    setUser(readStoredUser())
    setInitializing(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.login(username.trim(), password)
    writeStoredUser(res)
    setUser(res)
    return res
  }, [])

  const signup = useCallback(
    async (name: string, username: string, password: string) => {
      const res = await api.signup(name.trim(), username.trim(), password)
      writeStoredUser(res)
      setUser(res)
      return res
    },
    []
  )

  const logout = useCallback(() => {
    writeStoredUser(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, initializing, login, signup, logout }),
    [user, initializing, login, signup, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
