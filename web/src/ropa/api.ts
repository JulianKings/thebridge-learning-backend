import { call, callPage, toQuery } from '../api/client'
import { normalizeProducto } from './types'
import type { Producto, ProductoInput, Proveedor, TallaTipo, Tipo } from './types'

export type OrdenRopa = 'precio' | '-precio' | 'descuento' | '-descuento' | 'createdAt' | '-createdAt'

export type RopaQuery = {
  q?: string
  tipo?: Tipo | Tipo[]
  grupo?: string
  talla?: TallaTipo[]
  temporada?: string[]
  proveedor?: string[]
  precioMin?: number
  precioMax?: number
  oferta?: boolean
  disponible?: boolean
  orden?: OrdenRopa
  page?: number
  limit?: number
}

export type FiltrosRopa = {
  grupos: { slug: string; tipos: Tipo[] }[]
  tallas: TallaTipo[]
  temporadas: string[]
  proveedores: Pick<Proveedor, '_id' | 'nombreComercial'>[]
  precio: { min: number; max: number }
}

export type ProveedorQuery = { q?: string; divisa?: string; orden?: string; page?: number; limit?: number }
export type ProveedorInput = Omit<Proveedor, '_id'>

export const ropaApi = {
  list: (q: RopaQuery = {}) => call<Producto[]>('GET', `/ropa${toQuery(q)}`).then((list) => list.map(normalizeProducto)),
  page: (q: RopaQuery = {}) =>
    callPage<Producto>(`/ropa${toQuery(q)}`).then(({ items, total }) => ({ items: items.map(normalizeProducto), total })),
  filtros: () => call<FiltrosRopa>('GET', '/ropa/filtros'),
  get: (id: string) => call<Producto>('GET', `/ropa/${id}`).then(normalizeProducto),
  create: (data: ProductoInput) => call<Producto>('POST', '/ropa', data),
  update: (id: string, data: ProductoInput) => call<Producto>('PUT', `/ropa/${id}`, data),
  remove: (id: string) => call<void>('DELETE', `/ropa/${id}`),
  proveedores: (q: ProveedorQuery = {}) => call<Proveedor[]>('GET', `/proveedores${toQuery(q)}`),
}

export const proveedoresApi = {
  page: (q: ProveedorQuery = {}) => callPage<Proveedor>(`/proveedores${toQuery(q)}`),
  create: (data: ProveedorInput) => call<Proveedor>('POST', '/proveedores', data),
  update: (id: string, data: Partial<ProveedorInput>) => call<Proveedor>('PATCH', `/proveedores/${id}`, data),
  remove: (id: string) => call<void>('DELETE', `/proveedores/${id}`),
}
