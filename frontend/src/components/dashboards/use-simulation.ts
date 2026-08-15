import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AnalysisResult, StudentInput } from "@/types";

export function useSimulation(input: StudentInput) {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    api
      .simulate(input)
      .then((r) => {
        if (mounted) setResult(r)
      })
      .catch((err) => {
        if (mounted)
          setError(
            err instanceof Error
              ? err.message
              : "The simulation could not be completed."
          )
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { result, loading, error }
}
