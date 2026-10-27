import { call } from '../api/client'
import { normalizeProducto } from './types'
import type { Producto, ProductoInput, Proveedor, Tipo } from './types'

export type RopaQuery = { tipo?: Tipo; page?: number; limit?: number }

const query = (q: RopaQuery) => {
  const params = new URLSearchParams(Object.entries(q).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
  return params.size ? `?${params}` : ''
}

export const ropaApi = {
  list: (q: RopaQuery = {}) => call<Producto[]>('GET', `/ropa${query(q)}`).then((list) => list.map(normalizeProducto)),
  get: (id: string) => call<Producto>('GET', `/ropa/${id}`).then(normalizeProducto),
  create: (data: ProductoInput) => call<Producto>('POST', '/ropa', data),
  update: (id: string, data: ProductoInput) => call<Producto>('PUT', `/ropa/${id}`, data),
  remove: (id: string) => call<void>('DELETE', `/ropa/${id}`),
  proveedores: () => call<Proveedor[]>('GET', '/proveedores'),
}
