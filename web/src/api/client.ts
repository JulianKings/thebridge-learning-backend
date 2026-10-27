import { API_URL } from '../config'
import { ApiError } from './types'

// Shared by every screen that talks to the students' API: base URL, JWT session and error handling.

const TOKEN_KEY = 'hilo-api-token'

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

export async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
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
    throw new ApiError(0, 'No se puede conectar con la API.')
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, data?.message ?? `Error ${res.status}`)
  if (method !== 'GET') notify()
  return data as T
}
