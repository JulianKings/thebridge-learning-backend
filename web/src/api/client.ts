import { API_URL } from '../config'
import { ApiError } from './types'
import type { Category, Order, Product, Role, Session, Supply, User } from './types'

// Client for the students' API, used by the shop. The endpoints below are a
// draft for step 7: adjust paths and payloads to whatever the class builds.

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
}

export function decodeToken(t: string): Record<string, unknown> | null {
  try {
    const payload = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload), (c) => c.charCodeAt(0))))
  } catch {
    return null
  }
}

// Bumped after every write so `useQuery` refetches and screens stay in sync.
let version = 0
const listeners = new Set<() => void>()

export const apiVersion = {
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  get: () => version,
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
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
  if (method !== 'GET') {
    version++
    listeners.forEach((l) => l())
  }
  return data as T
}

export type ProductQuery = { category?: Category; search?: string; sort?: 'precio-asc' | 'precio-desc' | 'nuevo' }
export type ProductDetail = Product & { supplyDetails: Supply[] }

const query = (q: Record<string, string | undefined>) => {
  const qs = new URLSearchParams(Object.entries(q).filter((e): e is [string, string] => !!e[1])).toString()
  return qs ? `?${qs}` : ''
}

export const api = {
  listProducts: (q: ProductQuery = {}) => call<Product[]>('GET', `/api/products${query(q)}`),
  getProduct: (id: string) => call<ProductDetail>('GET', `/api/products/${id}`),
  createProduct: (data: Omit<Product, 'id'>) => call<Product>('POST', '/api/products', data),
  updateProduct: (id: string, data: Partial<Product>) => call<Product>('PUT', `/api/products/${id}`, data),
  deleteProduct: (id: string) => call<void>('DELETE', `/api/products/${id}`),

  listSupplies: () => call<Supply[]>('GET', '/api/supplies'),
  createSupply: (data: Omit<Supply, 'id'>) => call<Supply>('POST', '/api/supplies', data),
  updateSupply: (id: string, data: Partial<Supply>) => call<Supply>('PUT', `/api/supplies/${id}`, data),
  deleteSupply: (id: string) => call<void>('DELETE', `/api/supplies/${id}`),

  login: (email: string, password: string) => call<Session>('POST', '/api/auth/login', { email, password }),
  register: (name: string, email: string, password: string) => call<Session>('POST', '/api/auth/register', { name, email, password }),
  me: () => call<User>('GET', '/api/auth/me'),

  listUsers: () => call<User[]>('GET', '/api/users'),
  updateUserRole: (id: string, role: Role) => call<User>('PUT', `/api/users/${id}`, { role }),
  deleteUser: (id: string) => call<void>('DELETE', `/api/users/${id}`),

  createOrder: (items: { productId: string; size: string; qty: number }[], address: string) =>
    call<Order>('POST', '/api/orders', { items, address }),
  myOrders: () => call<Order[]>('GET', '/api/orders/mine'),
  listOrders: () => call<Order[]>('GET', '/api/orders'),
  updateOrderStatus: (id: string, status: Order['status']) => call<Order>('PUT', `/api/orders/${id}`, { status }),
}
