import { SEED_ORDERS, SEED_PRODUCTS, SEED_SUPPLIES, SEED_USERS } from './seed'
import { ApiError } from './types'
import type { Category, Order, Product, Role, Session, Supply, User } from './types'

// A fake backend that lives in the browser. It mimics what the students'
// Express API will do (latency, JWT, roles, validation, status codes) so the
// shop can be demoed before their API exists. Swap `api` for real fetch calls
// later; the shop only depends on the method signatures.

type StoredUser = User & { password: string }
type Db = { products: Product[]; supplies: Supply[]; users: StoredUser[]; orders: Order[] }

const DB_KEY = 'hilo-api-db-v1'
const TOKEN_KEY = 'hilo-api-token'
const SECRET = 'hilo-secreto-de-clase'
const STAFF: Role[] = ['trabajador', 'encargado']

const seedDb = (): Db =>
  structuredClone({ products: SEED_PRODUCTS, supplies: SEED_SUPPLIES, users: SEED_USERS, orders: SEED_ORDERS })

function loadDb(): Db {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // Fall back to the seed.
  }
  return seedDb()
}

let db = loadDb()

function persist() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    // In-memory only.
  }
}

// ---- Observable state: request log, demo switches, data version ----------

export type LogEntry = { id: number; method: string; path: string; status: number; ms: number }
export type ApiState = { log: LogEntry[]; slow: boolean; down: boolean; version: number }

let state: ApiState = { log: [], slow: false, down: false, version: 0 }
const listeners = new Set<() => void>()
let logId = 0

function setState(patch: Partial<ApiState>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export const apiStore = {
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  get: () => state,
  setSlow: (slow: boolean) => setState({ slow }),
  setDown: (down: boolean) => setState({ down, version: state.version + 1 }),
  clearLog: () => setState({ log: [] }),
  resetData() {
    db = seedDb()
    persist()
    setState({ version: state.version + 1 })
  },
}

// ---- JWT-like tokens -------------------------------------------------------

const b64 = (s: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
const unb64 = (s: string) =>
  new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)))

function hash(s: string) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h.toString(36)
}

function sign(user: User) {
  const header = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = b64(JSON.stringify({ sub: user.id, name: user.name, role: user.role, exp: Date.now() + 3600_000 }))
  return `${header}.${payload}.${b64(hash(`${header}.${payload}${SECRET}`))}`
}

export function decodeToken(token: string): { sub: string; name: string; role: Role; exp: number } | null {
  try {
    return JSON.parse(unb64(token.split('.')[1]))
  } catch {
    return null
  }
}

function verify(token: string): StoredUser | null {
  const [header, payload, sig] = token.split('.')
  if (!header || !payload || sig !== b64(hash(`${header}.${payload}${SECRET}`))) return null
  const claims = decodeToken(token)
  if (!claims || claims.exp < Date.now()) return null
  return db.users.find((u) => u.id === claims.sub) ?? null
}

let token: string | null = (() => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
})()

export function getToken() {
  return token
}

export function setToken(t: string | null) {
  token = t
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Session lasts until reload.
  }
}

// ---- Request pipeline ------------------------------------------------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const publicUser = ({ password: _pw, ...u }: StoredUser): User => u
const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`

type Opts = { roles?: Role[]; auth?: boolean; mutates?: boolean; status?: number }

async function handle<T>(method: string, path: string, run: (user: StoredUser | null) => T, opts: Opts = {}): Promise<T> {
  const start = performance.now()
  await sleep(state.slow ? 1200 + Math.random() * 800 : 120 + Math.random() * 200)
  let status = opts.status ?? (method === 'POST' ? 201 : method === 'DELETE' ? 204 : 200)
  try {
    if (state.down) throw new ApiError(503, 'La API no responde. Inténtalo más tarde.')
    const user = token ? verify(token) : null
    if ((opts.auth || opts.roles) && !user) throw new ApiError(401, 'Necesitas iniciar sesión.')
    if (opts.roles && user && !opts.roles.includes(user.role)) throw new ApiError(403, 'No tienes permiso para hacer esto.')
    const result = run(user)
    if (opts.mutates) {
      persist()
      setState({ version: state.version + 1 })
    }
    return structuredClone(result)
  } catch (e) {
    const err = e instanceof ApiError ? e : new ApiError(500, 'Error interno del servidor.')
    status = err.status
    throw err
  } finally {
    const entry = { id: ++logId, method, path, status, ms: Math.round(performance.now() - start) }
    setState({ log: [entry, ...state.log].slice(0, 40) })
  }
}

function validateProduct(p: Partial<Product>) {
  if (p.name !== undefined && !p.name.trim()) throw new ApiError(400, 'El nombre es obligatorio.')
  if (p.price !== undefined && !(p.price > 0)) throw new ApiError(400, 'El precio debe ser mayor que 0.')
  if (p.stock !== undefined && (!Number.isInteger(p.stock) || p.stock < 0)) throw new ApiError(400, 'El stock debe ser un entero positivo.')
  if (p.sizes !== undefined && p.sizes.length === 0) throw new ApiError(400, 'Indica al menos una talla.')
}

function findOr404<T extends { id: string }>(list: T[], id: string, what: string) {
  const item = list.find((x) => x.id === id)
  if (!item) throw new ApiError(404, `${what} no encontrado.`)
  return item
}

export type ProductQuery = { category?: Category; search?: string; sort?: 'precio-asc' | 'precio-desc' | 'nuevo' }
export type ProductDetail = Product & { supplyDetails: Supply[] }

// ---- Endpoints -------------------------------------------------------------

export const api = {
  health: () => handle('GET', '/health', () => ({ status: 'ok', db: 'connected' })),

  listProducts(q: ProductQuery = {}) {
    const qs = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][]).toString()
    return handle('GET', `/api/products${qs ? `?${qs}` : ''}`, () => {
      let list = db.products
      if (q.category) list = list.filter((p) => p.category === q.category)
      if (q.search) {
        const s = q.search.toLowerCase()
        list = list.filter((p) => p.name.toLowerCase().includes(s))
      }
      if (q.sort === 'precio-asc') list = [...list].sort((a, b) => a.price - b.price)
      if (q.sort === 'precio-desc') list = [...list].sort((a, b) => b.price - a.price)
      if (q.sort === 'nuevo') list = [...list].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew))
      return list
    })
  },

  getProduct: (id: string) =>
    handle('GET', `/api/products/${id}`, (): ProductDetail => {
      const p = findOr404(db.products, id, 'Producto')
      return { ...p, supplyDetails: db.supplies.filter((s) => p.supplies.includes(s.id)) }
    }),

  createProduct: (data: Omit<Product, 'id'>) =>
    handle(
      'POST',
      '/api/products',
      () => {
        validateProduct({ ...data, name: data.name ?? '' })
        const p = { ...data, id: newId('p') }
        db.products.unshift(p)
        return p
      },
      { roles: STAFF, mutates: true },
    ),

  updateProduct: (id: string, data: Partial<Product>) =>
    handle(
      'PUT',
      `/api/products/${id}`,
      () => {
        const p = findOr404(db.products, id, 'Producto')
        validateProduct(data)
        Object.assign(p, data, { id })
        return p
      },
      { roles: STAFF, mutates: true },
    ),

  deleteProduct: (id: string) =>
    handle(
      'DELETE',
      `/api/products/${id}`,
      () => {
        findOr404(db.products, id, 'Producto')
        db.products = db.products.filter((p) => p.id !== id)
      },
      { roles: STAFF, mutates: true },
    ),

  listSupplies: () => handle('GET', '/api/supplies', () => db.supplies, { roles: STAFF }),

  createSupply: (data: Omit<Supply, 'id'>) =>
    handle(
      'POST',
      '/api/supplies',
      () => {
        if (!data.name.trim()) throw new ApiError(400, 'El nombre es obligatorio.')
        const s = { ...data, id: newId('s') }
        db.supplies.push(s)
        return s
      },
      { roles: STAFF, mutates: true },
    ),

  updateSupply: (id: string, data: Partial<Supply>) =>
    handle(
      'PUT',
      `/api/supplies/${id}`,
      () => {
        const s = findOr404(db.supplies, id, 'Material')
        if (data.stock !== undefined && data.stock < 0) throw new ApiError(400, 'El stock no puede ser negativo.')
        Object.assign(s, data, { id })
        return s
      },
      { roles: STAFF, mutates: true },
    ),

  deleteSupply: (id: string) =>
    handle(
      'DELETE',
      `/api/supplies/${id}`,
      () => {
        findOr404(db.supplies, id, 'Material')
        db.supplies = db.supplies.filter((s) => s.id !== id)
        db.products.forEach((p) => (p.supplies = p.supplies.filter((s) => s !== id)))
      },
      { roles: STAFF, mutates: true },
    ),

  login: (email: string, password: string) =>
    handle(
      'POST',
      '/api/auth/login',
      (): Session => {
        const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
        if (!u || u.password !== password) throw new ApiError(401, 'Email o contraseña incorrectos.')
        return { token: sign(u), user: publicUser(u) }
      },
      { status: 200 },
    ),

  register: (name: string, email: string, password: string) =>
    handle(
      'POST',
      '/api/auth/register',
      (): Session => {
        if (!name.trim() || !email.includes('@')) throw new ApiError(400, 'Nombre y email válidos son obligatorios.')
        if (password.length < 6) throw new ApiError(400, 'La contraseña debe tener al menos 6 caracteres.')
        if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new ApiError(409, 'Ese email ya está registrado.')
        const u: StoredUser = { id: newId('u'), name: name.trim(), email: email.trim(), role: 'cliente', since: String(new Date().getFullYear()), password }
        db.users.push(u)
        return { token: sign(u), user: publicUser(u) }
      },
      { mutates: true },
    ),

  me: () => handle('GET', '/api/auth/me', (u) => publicUser(u!), { auth: true }),

  listUsers: () => handle('GET', '/api/users', () => db.users.map(publicUser), { roles: ['encargado'] }),

  updateUserRole: (id: string, role: Role) =>
    handle(
      'PUT',
      `/api/users/${id}`,
      (me) => {
        const u = findOr404(db.users, id, 'Usuario')
        if (u.id === me!.id) throw new ApiError(400, 'No puedes cambiar tu propio rol.')
        u.role = role
        return publicUser(u)
      },
      { roles: ['encargado'], mutates: true },
    ),

  deleteUser: (id: string) =>
    handle(
      'DELETE',
      `/api/users/${id}`,
      (me) => {
        findOr404(db.users, id, 'Usuario')
        if (id === me!.id) throw new ApiError(400, 'No puedes eliminar tu propia cuenta.')
        db.users = db.users.filter((u) => u.id !== id)
      },
      { roles: ['encargado'], mutates: true },
    ),

  createOrder: (items: { productId: string; size: string; qty: number }[], address: string) =>
    handle(
      'POST',
      '/api/orders',
      (me): Order => {
        if (!items.length) throw new ApiError(400, 'La cesta está vacía.')
        if (!address.trim()) throw new ApiError(400, 'La dirección es obligatoria.')
        const lines = items.map((i) => {
          const p = findOr404(db.products, i.productId, 'Producto')
          if (p.stock < i.qty) throw new ApiError(409, `No queda stock suficiente de «${p.name}».`)
          return { p, i }
        })
        lines.forEach(({ p, i }) => (p.stock -= i.qty))
        const order: Order = {
          id: `o${10500 + db.orders.length}`,
          userId: me!.id,
          customer: me!.name,
          items: lines.map(({ p, i }) => ({ productId: p.id, name: p.name, size: i.size, qty: i.qty, price: p.price })),
          total: Math.round(lines.reduce((s, { p, i }) => s + p.price * i.qty, 0) * 100) / 100,
          address: address.trim(),
          status: 'Pagado',
          createdAt: new Date().toISOString(),
        }
        db.orders.unshift(order)
        return order
      },
      { auth: true, mutates: true },
    ),

  myOrders: () => handle('GET', '/api/orders/mine', (me) => db.orders.filter((o) => o.userId === me!.id), { auth: true }),

  listOrders: () => handle('GET', '/api/orders', () => db.orders, { roles: STAFF }),

  updateOrderStatus: (id: string, status: Order['status']) =>
    handle(
      'PUT',
      `/api/orders/${id}`,
      () => {
        const o = findOr404(db.orders, id, 'Pedido')
        o.status = status
        return o
      },
      { roles: STAFF, mutates: true },
    ),
}
