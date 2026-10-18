import { useEffect, useState, useSyncExternalStore } from 'react'
import { apiVersion } from './client'
import type { ApiError } from './types'

// Refetches whenever deps change or the API is written to. Old data stays on
// screen while reloading but is dropped on error, so failures are visible.
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const version = useSyncExternalStore(apiVersion.subscribe, apiVersion.get)
  const [state, setState] = useState<{ data?: T; error?: ApiError; loading: boolean }>({ loading: true })

  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true }))
    fn().then(
      (data) => alive && setState({ data, loading: false }),
      (error: ApiError) => alive && setState({ error, loading: false }),
    )
    return () => {
      alive = false
    }
  }, [version, ...deps])

  return state
}
