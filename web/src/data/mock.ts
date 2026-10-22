// Placeholder data for the blurred previews. Once the students' API passes a
// level, the matching section will read from the API instead.

export type GarmentKind = 'coat' | 'shirt' | 'dress' | 'trousers' | 'knit' | 'skirt' | 'tee' | 'blazer' | 'shoe' | 'hat' | 'accessory'

export type Product = {
  id: string
  name: string
  price: number
  category: 'Mujer' | 'Hombre' | 'Unisex'
  sizes: string[]
  kind: GarmentKind
  tone: string
  ink: string
  stock: number
  supplies: string[]
  isNew?: boolean
}

export type Supply = {
  id: string
  name: string
  supplier: string
  stock: number
  unit: string
}

export type User = {
  id: string
  name: string
  email: string
  role: 'cliente' | 'trabajador' | 'encargado'
  since: string
}

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Abrigo de lana cruda', price: 189, category: 'Mujer', sizes: ['XS', 'S', 'M', 'L'], kind: 'coat', tone: '#d9cfc1', ink: '#6b5a45', stock: 14, supplies: ['s1', 's4'], isNew: true },
  { id: 'p2', name: 'Camisa de popelín', price: 49.95, category: 'Hombre', sizes: ['S', 'M', 'L', 'XL'], kind: 'shirt', tone: '#e6e8ea', ink: '#5c6670', stock: 32, supplies: ['s2', 's5'] },
  { id: 'p3', name: 'Vestido midi plisado', price: 79.95, category: 'Mujer', sizes: ['XS', 'S', 'M'], kind: 'dress', tone: '#2f2f2d', ink: '#8c8a84', stock: 8, supplies: ['s3'], isNew: true },
  { id: 'p4', name: 'Pantalón sastre', price: 59.95, category: 'Hombre', sizes: ['38', '40', '42', '44'], kind: 'trousers', tone: '#c9c4b8', ink: '#5f5a50', stock: 21, supplies: ['s1', 's5'] },
  { id: 'p5', name: 'Jersey de punto grueso', price: 69.95, category: 'Unisex', sizes: ['S', 'M', 'L'], kind: 'knit', tone: '#b6533b', ink: '#f1d9cf', stock: 17, supplies: ['s4'] },
  { id: 'p6', name: 'Falda satinada', price: 45.95, category: 'Mujer', sizes: ['XS', 'S', 'M', 'L'], kind: 'skirt', tone: '#e9dcc9', ink: '#9b8466', stock: 12, supplies: ['s3'] },
  { id: 'p7', name: 'Camiseta de algodón pima', price: 19.95, category: 'Unisex', sizes: ['S', 'M', 'L', 'XL'], kind: 'tee', tone: '#f4f2ee', ink: '#a29d94', stock: 64, supplies: ['s2'] },
  { id: 'p8', name: 'Blazer cruzado', price: 129, category: 'Hombre', sizes: ['46', '48', '50', '52'], kind: 'blazer', tone: '#1f2a36', ink: '#7d8a99', stock: 6, supplies: ['s1', 's5'], isNew: true },
]

export const SUPPLIES: Supply[] = [
  { id: 's1', name: 'Lana merino', supplier: 'Textiles Navarra', stock: 240, unit: 'm' },
  { id: 's2', name: 'Algodón orgánico', supplier: 'Hilaturas Ebro', stock: 610, unit: 'm' },
  { id: 's3', name: 'Satén de viscosa', supplier: 'Sedas del Sur', stock: 95, unit: 'm' },
  { id: 's4', name: 'Hilo de punto', supplier: 'Hilaturas Ebro', stock: 38, unit: 'kg' },
  { id: 's5', name: 'Botones de corozo', supplier: 'Mercería Llull', stock: 1200, unit: 'ud' },
]

export const USERS: User[] = [
  { id: 'u1', name: 'Lucía Martín', email: 'lucia@hilo.store', role: 'encargado', since: '2024' },
  { id: 'u2', name: 'Diego Romero', email: 'diego@hilo.store', role: 'trabajador', since: '2025' },
  { id: 'u3', name: 'Marta Gil', email: 'marta@hilo.store', role: 'trabajador', since: '2025' },
  { id: 'u4', name: 'Carlos Vidal', email: 'carlos@correo.es', role: 'cliente', since: '2025' },
  { id: 'u5', name: 'Ana Ortega', email: 'ana@correo.es', role: 'cliente', since: '2026' },
]

export const formatPrice = (n: number) =>
  n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
