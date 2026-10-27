import { call } from '../api/client'
import type { Usuario } from '../auth/api'
import type { Producto, TallaTipo } from '../ropa/types'

export type LineaCompra = { producto: string | Producto; talla: TallaTipo; cantidad: number; precio?: number }

export type Compra = {
  _id: string
  cliente: string | Usuario
  productos: LineaCompra[]
  total: number
  puntos?: number
  createdAt?: string
}

export type NuevaLinea = { producto: string; talla: TallaTipo; cantidad: number }

export type EmpleadoInput = Omit<Usuario, '_id' | 'puntos' | 'afiliado'> & { password: string; salario: number; vacaciones?: boolean }

export const comprasApi = {
  crear: (productos: NuevaLinea[]) => call<Compra>('POST', '/compras', { productos }),
  mias: () => call<Compra[]>('GET', '/compras/mias'),
  todas: () => call<Compra[]>('GET', '/compras'),
}

// Administrador only.
export const usuariosApi = {
  clientes: () => call<Usuario[]>('GET', '/clientes'),
  empleados: () => call<Usuario[]>('GET', '/empleados'),
  crearEmpleado: (data: EmpleadoInput) => call<Usuario>('POST', '/empleados', data),
}

export const nombreProducto = (linea: LineaCompra) =>
  typeof linea.producto === 'object' && linea.producto ? `${linea.producto.tipo} · ${linea.producto.temporada}` : 'Prenda'
