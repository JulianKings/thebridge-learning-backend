import { API_URL } from '../config'
import { ApiError } from './types'

// Shared by every screen that talks to the students' API: base URL, JWT session and error handling.

const TOKEN_KEY = 'thebridge-api-token'

let token: string | null = (() => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
})()

export const getToken = () => token

export function setToken(t: string | null) {
  token = t
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // The session then lasts until reload.
  }
  notify()
}

export function decodeToken(t: string): Record<string, unknown> | null {
  try {
    const payload = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload), (c) => c.charCodeAt(0))))
  } catch {
    return null
  }
}

// Bumped after every write and on login/logout, so `useQuery` refetches and screens stay in sync.
let version = 0
const listeners = new Set<() => void>()

function notify() {
  version++
  listeners.forEach((l) => l())
}

export const apiVersion = {
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  get: () => version,
}

export type LogEntry = { id: number; method: string; path: string; status: number; ms: number; at: number }

let log: LogEntry[] = []
let logId = 0
const logListeners = new Set<() => void>()

export const requestLog = {
  subscribe(fn: () => void) {
    logListeners.add(fn)
    return () => logListeners.delete(fn)
  },
  get: () => log,
}

function record(entry: Omit<LogEntry, 'id' | 'at'>) {
  log = [{ ...entry, id: ++logId, at: Date.now() }, ...log].slice(0, 40)
  logListeners.forEach((l) => l())
}

async function send<T>(method: string, path: string, body?: unknown): Promise<{ data: T; res: Response }> {
  const start = performance.now()
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    record({ method, path, status: 0, ms: Math.round(performance.now() - start) })
    throw new ApiError(0, 'No se puede conectar con la API.')
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  record({ method, path, status: res.status, ms: Math.round(performance.now() - start) })
  if (!res.ok) throw new ApiError(res.status, data?.message ?? data?.error ?? `Error ${res.status}`)
  if (method !== 'GET') notify()
  return { data: data as T, res }
}

export const call = <T>(method: string, path: string, body?: unknown) => send<T>(method, path, body).then((r) => r.data)

export type Page<T> = { items: T[]; total: number }

// An API without X-Total-Count still works: the total is then just the page length.
export async function callPage<T>(path: string): Promise<Page<T>> {
  const { data, res } = await send<T[]>('GET', path)
  const items = Array.isArray(data) ? data : []
  const total = Number(res.headers.get('X-Total-Count'))
  return { items, total: Number.isFinite(total) && res.headers.has('X-Total-Count') ? total : items.length }
}

export function toQuery(q: object = {}) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) continue
    params.set(k, Array.isArray(v) ? v.join(',') : String(v))
  }
  return params.size ? `?${params}` : ''
}
