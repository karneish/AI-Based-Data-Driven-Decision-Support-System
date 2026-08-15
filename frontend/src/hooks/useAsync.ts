import { useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string
}

export function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
  errorMessage = 'Something went wrong. Please try again.',
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: '' })

  useEffect(() => {
    let active = true
    setState(s => ({ ...s, loading: true, error: '' }))
    fn()
      .then(data => active && setState({ data, loading: false, error: '' }))
      .catch(() => active && setState({ data: null, loading: false, error: errorMessage }))
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
