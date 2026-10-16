import { useEffect, useState, useSyncExternalStore } from 'react'
import { apiStore } from './mockApi'
import type { ApiError } from './types'

export function useApiState() {
  return useSyncExternalStore(apiStore.subscribe, apiStore.get)
}

// Fetches on mount, when deps change, and after any write to the API so every
// screen stays in sync with the "server". Keeps old data while reloading,
// drops it on error so outages are visible.
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const { version } = useApiState()
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
