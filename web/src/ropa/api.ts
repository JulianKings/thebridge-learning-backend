import { call } from '../api/client'
import { normalizeProducto } from './types'
import type { Producto, ProductoInput, Proveedor } from './types'

export const ropaApi = {
  list: () => call<Producto[]>('GET', '/ropa').then((list) => list.map(normalizeProducto)),
  get: (id: string) => call<Producto>('GET', `/ropa/${id}`).then(normalizeProducto),
  create: (data: ProductoInput) => call<Producto>('POST', '/ropa', data),
  update: (id: string, data: ProductoInput) => call<Producto>('PUT', `/ropa/${id}`, data),
  remove: (id: string) => call<void>('DELETE', `/ropa/${id}`),
  proveedores: () => call<Proveedor[]>('GET', '/proveedores'),
}
