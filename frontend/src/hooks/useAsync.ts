import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client'

interface AsyncState<T> {
  data: T | null
  error: ApiError | null
  loading: boolean
  reload: () => void
}

/** Runs an async loader, discarding results from superseded calls. */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [loading, setLoading] = useState(true)
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    loader()
      .then((result) => {
        if (active) setData(result)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(cause instanceof ApiError ? cause : new ApiError(0, 'Unknown', String(cause)))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  return { data, error, loading, reload }
}
