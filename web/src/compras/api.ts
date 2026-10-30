import { call, callPage, toQuery } from '../api/client'
import type { Usuario } from '../auth/api'
import type { Producto, TallaTipo } from '../ropa/types'

export type LineaCompra = { producto: string | Producto; talla: TallaTipo; cantidad: number; precio?: number }

export const ESTADOS = ['pendiente', 'enviado', 'entregado', 'cancelado'] as const
export type Estado = (typeof ESTADOS)[number]

export type Compra = {
  _id: string
  cliente: string | Usuario | null
  productos: LineaCompra[]
  total: number
  puntos?: number
  estado?: Estado
  createdAt?: string
}

export type NuevaLinea = { producto: string; talla: TallaTipo; cantidad: number }

export type CompraQuery = {
  cliente?: string
  estado?: Estado[]
  desde?: string
  hasta?: string
  totalMin?: number
  totalMax?: number
  orden?: string
  page?: number
  limit?: number
}

export const comprasApi = {
  crear: (productos: NuevaLinea[]) => call<Compra>('POST', '/compras', { productos }),
  mias: (q: CompraQuery = {}) => call<Compra[]>('GET', `/compras/mias${toQuery(q)}`),
  todas: (q: CompraQuery = {}) => call<Compra[]>('GET', `/compras${toQuery(q)}`),
  page: (q: CompraQuery = {}) => callPage<Compra>(`/compras${toQuery(q)}`),
  cambiarEstado: (id: string, estado: Estado) => call<Compra>('PATCH', `/compras/${id}`, { estado }),
  remove: (id: string) => call<void>('DELETE', `/compras/${id}`),
}

export type Coleccion = 'clientes' | 'empleados' | 'administradores'

export type PersonaQuery = {
  q?: string
  genero?: string
  cargo?: string
  puntosMin?: number
  orden?: string
  page?: number
  limit?: number
}

// Administrador only: the three user collections share the same CRUD shape.
export const personasApi = (coleccion: Coleccion) => ({
  page: (q: PersonaQuery = {}) => callPage<Usuario>(`/${coleccion}${toQuery(q)}`),
  create: (data: object) => call<Usuario>('POST', `/${coleccion}`, data),
  update: (id: string, data: object) => call<Usuario>('PATCH', `/${coleccion}/${id}`, data),
  remove: (id: string) => call<void>('DELETE', `/${coleccion}/${id}`),
})

export const nombreProducto = (linea: LineaCompra) =>
  typeof linea.producto === 'object' && linea.producto ? `${linea.producto.tipo} · ${linea.producto.temporada}` : 'Prenda'
