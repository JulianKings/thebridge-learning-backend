import type { Producto, Proveedor } from './types'

// Placeholder catalogue for the blurred previews, shaped like the real /ropa data.

const proveedor = (_id: string, nombreComercial: string, web: string): Proveedor => ({
  _id,
  nombreComercial,
  cp: '28013',
  email: `pedidos@${web}`,
  telefono: 910000000,
  web: `https://${web}`,
  tipoProducto: ['camiseta', 'sudadera'],
  divisa: 'EUR',
  condicionesPago: '30 días',
  condicionesDevolucion: '15 días',
  descuentosVolumen: 5,
})

export const MOCK_PROVEEDORES: Proveedor[] = [
  proveedor('6717a0000000000000000001', 'Textiles Navarra', 'textilesnavarra.es'),
  proveedor('6717a0000000000000000002', 'Hilaturas Ebro', 'hilaturasebro.es'),
  proveedor('6717a0000000000000000003', 'Calzados Elda', 'calzadoselda.es'),
]

const [navarra, ebro, elda] = MOCK_PROVEEDORES

const producto = (n: number, data: Omit<Producto, '_id' | 'foto' | 'disponible'> & { disponible?: boolean }): Producto => ({
  _id: `6718b00000000000000000${String(n).padStart(2, '0')}`,
  foto: '',
  disponible: true,
  ...data,
})

export const MOCK_ROPA: Producto[] = [
  producto(1, { tipo: 'abrigo', precio: 189, talla: [{ talla_tipo: 'S', talla_stock: 4 }, { talla_tipo: 'M', talla_stock: 6 }], temporada: 'Otoño-Invierno', descuento: 0, evento: 'Nueva colección', proveedor: navarra }),
  producto(2, { tipo: 'camisa', precio: 49.95, talla: [{ talla_tipo: 'M', talla_stock: 12 }, { talla_tipo: 'L', talla_stock: 8 }], temporada: 'Primavera-Verano', descuento: 20, evento: 'Rebajas', proveedor: ebro }),
  producto(3, { tipo: 'vestido', precio: 79.95, talla: [{ talla_tipo: 'XS', talla_stock: 2 }, { talla_tipo: 'S', talla_stock: 3 }], temporada: 'Primavera-Verano', descuento: 0, evento: 'Nueva colección', proveedor: ebro }),
  producto(4, { tipo: 'vaqueros', precio: 59.95, talla: [{ talla_tipo: 'M', talla_stock: 10 }], temporada: 'Todo el año', descuento: 15, evento: 'Black Friday', proveedor: navarra }),
  producto(5, { tipo: 'jersey', precio: 69.95, talla: [{ talla_tipo: 'L', talla_stock: 7 }], temporada: 'Otoño-Invierno', descuento: 0, evento: 'Nueva colección', proveedor: navarra }),
  producto(6, { tipo: 'zapatillas', precio: 89, talla: [{ talla_tipo: 'M', talla_stock: 0 }], temporada: 'Todo el año', descuento: 0, evento: 'Básicos', proveedor: elda, disponible: false }),
  producto(7, { tipo: 'camiseta', precio: 19.95, talla: [{ talla_tipo: 'S', talla_stock: 30 }, { talla_tipo: 'M', talla_stock: 25 }], temporada: 'Primavera-Verano', descuento: 30, evento: 'Rebajas', proveedor: ebro }),
  producto(8, { tipo: 'gorra', precio: 24.95, talla: [{ talla_tipo: 'M', talla_stock: 15 }], temporada: 'Todo el año', descuento: 0, evento: 'Básicos', proveedor: elda }),
]
