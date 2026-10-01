import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { authApi, type AuthUser } from '../api/authApi'

export type AuthState =
  | { kind: 'loading' }
  | { kind: 'signed-out' }
  | { kind: 'signed-in'; user: AuthUser }
  | { kind: 'error'; message: string }

export function useAuth() {
  const [state, setState] = useState<AuthState>({ kind: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    authApi.currentUser().then(
      (user) => {
        if (active) setState({ kind: 'signed-in', user })
      },
      (cause: unknown) => {
        if (!active) return
        if (cause instanceof ApiError && cause.status === 401) {
          setState({ kind: 'signed-out' })
          return
        }
        setState({
          kind: 'error',
          message: cause instanceof Error ? cause.message : 'Could not verify your session.',
        })
      },
    )
    return () => {
      active = false
    }
  }, [attempt])

  const retry = useCallback(() => {
    setState({ kind: 'loading' })
    setAttempt((current) => current + 1)
  }, [])

  const signOut = useCallback(async () => {
    await authApi.signOut()
    setState({ kind: 'signed-out' })
  }, [])

  return { state, retry, signOut }
}
