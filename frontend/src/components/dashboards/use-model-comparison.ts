import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ModelComparisonData } from "@/types";

export function useModelComparison() {
  const [data, setData] = useState<ModelComparisonData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    api
      .modelComparison()
      .then((d) => {
        if (mounted) setData(d)
      })
      .catch((err) => {
        if (mounted)
          setError(
            err instanceof Error
              ? err.message
              : "The system overview could not be loaded."
          )
      })
    return () => {
      mounted = false
    }
  }, [])

  return { data, error }
}
