// Must match the enum in the API's Producto model exactly.
export const TIPOS = [
  'camiseta', 'camisa', 'polo', 'sudadera', 'jersey', 'chaqueta', 'abrigo', 'chaleco',
  'pantalon', 'vaqueros', 'pantalon_corto', 'bermudas', 'leggings', 'falda', 'vestido',
  'mono', 'traje', 'blazer', 'ropa_interior', 'calcetines', 'pijama', 'bañador', 'bikini',
  'ropa_deportiva', 'chandal', 'mallas_deportivas', 'zapatillas', 'zapatos', 'botas',
  'sandalias', 'chanclas', 'gorra', 'sombrero', 'bufanda', 'guantes', 'cinturon',
  'corbata', 'pajarita',
] as const

export const TALLAS = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const

export const MAX_DESCUENTO = 90

export type Tipo = (typeof TIPOS)[number]

const ACENTOS: Partial<Record<Tipo, string>> = { pantalon: 'pantalón', pantalon_corto: 'pantalón corto', chandal: 'chándal', cinturon: 'cinturón' }

export const nombreTipo = (tipo: Tipo) => ACENTOS[tipo] ?? tipo.replace(/_/g, ' ')
export type TallaTipo = (typeof TALLAS)[number]

export type Talla = { talla_tipo: TallaTipo; talla_stock: number }

export type Proveedor = {
  _id: string
  nombreComercial: string
  cp: string
  email: string
  telefono: number
  web: string
  tipoProducto: string[]
  divisa: string
  condicionesPago: string
  condicionesDevolucion: string
  descuentosVolumen: number
}

export type Producto = {
  _id: string
  tipo: Tipo
  precio: number
  disponible: boolean
  talla: Talla[]
  temporada: string
  descuento: number
  evento?: string
  foto?: string
  // An id from GET /ropa, the full supplier when the API populates it.
  proveedor: string | Proveedor
  createdAt?: string
}

export type ProductoInput = Omit<Producto, '_id' | 'proveedor' | 'createdAt'> & { proveedor: string }

export const titulo = (p: Pick<Producto, 'tipo' | 'temporada'>) => {
  const nombre = nombreTipo(p.tipo)
  const tipo = `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)}`
  return p.temporada ? `${tipo} · ${p.temporada}` : tipo
}

export const precioFinal = (p: Pick<Producto, 'precio' | 'descuento'>) => Math.round(p.precio * (100 - p.descuento)) / 100

export const stockTotal = (p: Pick<Producto, 'talla'>) => p.talla.reduce((n, t) => n + t.talla_stock, 0)

export const GRUPOS = ['Parte de arriba', 'Parte de abajo', 'Vestidos y conjuntos', 'Calzado', 'Accesorios', 'Más'] as const
export type Grupo = (typeof GRUPOS)[number]

const GRUPO_DE: Partial<Record<Tipo, Grupo>> = {
  camiseta: 'Parte de arriba', camisa: 'Parte de arriba', polo: 'Parte de arriba', sudadera: 'Parte de arriba', jersey: 'Parte de arriba',
  chaqueta: 'Parte de arriba', abrigo: 'Parte de arriba', chaleco: 'Parte de arriba', blazer: 'Parte de arriba',
  pantalon: 'Parte de abajo', vaqueros: 'Parte de abajo', pantalon_corto: 'Parte de abajo', bermudas: 'Parte de abajo', leggings: 'Parte de abajo', falda: 'Parte de abajo',
  vestido: 'Vestidos y conjuntos', mono: 'Vestidos y conjuntos', traje: 'Vestidos y conjuntos',
  zapatillas: 'Calzado', zapatos: 'Calzado', botas: 'Calzado', sandalias: 'Calzado', chanclas: 'Calzado',
  gorra: 'Accesorios', sombrero: 'Accesorios', bufanda: 'Accesorios', guantes: 'Accesorios', cinturon: 'Accesorios', corbata: 'Accesorios', pajarita: 'Accesorios',
}

export const grupoDe = (tipo: Tipo): Grupo => GRUPO_DE[tipo] ?? 'Más'

export const GRUPO_SLUG: Record<Grupo, string> = {
  'Parte de arriba': 'arriba',
  'Parte de abajo': 'abajo',
  'Vestidos y conjuntos': 'vestidos',
  Calzado: 'calzado',
  Accesorios: 'accesorios',
  Más: 'mas',
}

export const grupoPorSlug = (slug?: string) => GRUPOS.find((g) => GRUPO_SLUG[g] === slug)

// `proveedor` comes back as an ObjectId unless the API populates it, so fall back to the list.
export const nombreProveedor = (p: Pick<Producto, 'proveedor'>, proveedores: Pick<Proveedor, '_id' | 'nombreComercial'>[] = []) =>
  typeof p.proveedor === 'object' && p.proveedor
    ? p.proveedor.nombreComercial
    : (proveedores.find((pr) => pr._id === p.proveedor)?.nombreComercial ?? null)

// Level 2 only requires tipo and precio, so documents inserted by hand may lack the rest.
export function normalizeProducto(raw: Partial<Producto> & Pick<Producto, '_id'>): Producto {
  return {
    ...raw,
    tipo: raw.tipo ?? ('' as Tipo),
    precio: Number(raw.precio) || 0,
    disponible: raw.disponible ?? true,
    talla: Array.isArray(raw.talla) ? raw.talla.map((t) => ({ ...t, talla_stock: Number(t?.talla_stock) || 0 })) : [],
    temporada: raw.temporada ?? '',
    descuento: Number(raw.descuento) || 0,
    proveedor: raw.proveedor ?? '',
  }
}
