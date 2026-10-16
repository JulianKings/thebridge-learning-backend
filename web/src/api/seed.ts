import type { Order, Product, Supply, User } from './types'

// Starting data for the simulated API. "Restaurar datos" brings it back.

export const SEED_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Abrigo de lana cruda', description: 'Abrigo largo de corte recto en lana merino sin teñir. Solapa amplia y forro de viscosa.', price: 189, category: 'Mujer', sizes: ['XS', 'S', 'M', 'L'], kind: 'coat', tone: '#d9cfc1', ink: '#6b5a45', stock: 14, supplies: ['s1', 's4'], isNew: true },
  { id: 'p2', name: 'Camisa de popelín', description: 'Camisa clásica de algodón orgánico con cuello italiano y botones de corozo.', price: 49.95, category: 'Hombre', sizes: ['S', 'M', 'L', 'XL'], kind: 'shirt', tone: '#e6e8ea', ink: '#5c6670', stock: 32, supplies: ['s2', 's5'] },
  { id: 'p3', name: 'Vestido midi plisado', description: 'Vestido de satén con falda plisada que se mueve contigo. Escote redondo.', price: 79.95, category: 'Mujer', sizes: ['XS', 'S', 'M'], kind: 'dress', tone: '#2f2f2d', ink: '#8c8a84', stock: 8, supplies: ['s3'], isNew: true },
  { id: 'p4', name: 'Pantalón sastre', description: 'Pantalón de pinzas en lana fría. Caída recta y bajo con vuelta.', price: 59.95, category: 'Hombre', sizes: ['38', '40', '42', '44'], kind: 'trousers', tone: '#c9c4b8', ink: '#5f5a50', stock: 21, supplies: ['s1', 's5'] },
  { id: 'p5', name: 'Jersey de punto grueso', description: 'Punto inglés tejido a mano con hilo de lana. Cuello redondo y puños canalé.', price: 69.95, category: 'Unisex', sizes: ['S', 'M', 'L'], kind: 'knit', tone: '#b6533b', ink: '#f1d9cf', stock: 17, supplies: ['s4'] },
  { id: 'p6', name: 'Falda satinada', description: 'Falda midi al bies con cintura elástica oculta. Brillo suave.', price: 45.95, category: 'Mujer', sizes: ['XS', 'S', 'M', 'L'], kind: 'skirt', tone: '#e9dcc9', ink: '#9b8466', stock: 12, supplies: ['s3'] },
  { id: 'p7', name: 'Camiseta de algodón pima', description: 'Camiseta básica de algodón pima de 180 g. Costuras reforzadas.', price: 19.95, category: 'Unisex', sizes: ['S', 'M', 'L', 'XL'], kind: 'tee', tone: '#f4f2ee', ink: '#a29d94', stock: 64, supplies: ['s2'] },
  { id: 'p8', name: 'Blazer cruzado', description: 'Americana cruzada de seis botones en lana. Hombro estructurado.', price: 129, category: 'Hombre', sizes: ['46', '48', '50', '52'], kind: 'blazer', tone: '#1f2a36', ink: '#7d8a99', stock: 6, supplies: ['s1', 's5'], isNew: true },
  { id: 'p9', name: 'Abrigo cocoon', description: 'Volumen redondeado y bolsillos ocultos. Paño de lana doble cara.', price: 219, category: 'Mujer', sizes: ['S', 'M', 'L'], kind: 'coat', tone: '#5a4636', ink: '#c9b29a', stock: 5, supplies: ['s1'], isNew: true },
  { id: 'p10', name: 'Camisa de lino', description: 'Lino lavado a la piedra, cuello mao y caída relajada.', price: 55.95, category: 'Unisex', sizes: ['S', 'M', 'L', 'XL'], kind: 'shirt', tone: '#dfe3d6', ink: '#6c7560', stock: 26, supplies: ['s2', 's5'] },
  { id: 'p11', name: 'Vestido camisero', description: 'Vestido largo de popelín con botonadura completa y cinturón.', price: 69.95, category: 'Mujer', sizes: ['XS', 'S', 'M', 'L'], kind: 'dress', tone: '#c7d3de', ink: '#4f6375', stock: 15, supplies: ['s2', 's5'] },
  { id: 'p12', name: 'Pantalón ancho de pana', description: 'Pana de canutillo fino con pinzas y pierna amplia.', price: 64.95, category: 'Mujer', sizes: ['34', '36', '38', '40'], kind: 'trousers', tone: '#8a6a45', ink: '#e8d5bb', stock: 18, supplies: ['s2'] },
  { id: 'p13', name: 'Cárdigan de mohair', description: 'Cárdigan ligero y esponjoso con botones nacarados.', price: 79.95, category: 'Mujer', sizes: ['S', 'M', 'L'], kind: 'knit', tone: '#e8d9de', ink: '#94737d', stock: 9, supplies: ['s4', 's5'] },
  { id: 'p14', name: 'Camiseta oversize', description: 'Algodón grueso con hombro caído y cuello canalé.', price: 25.95, category: 'Hombre', sizes: ['S', 'M', 'L', 'XL'], kind: 'tee', tone: '#2b2b2b', ink: '#8d8d8d', stock: 40, supplies: ['s2'] },
  { id: 'p15', name: 'Falda de lana a cuadros', description: 'Falda midi evasé en lana cardada con estampado príncipe de Gales.', price: 59.95, category: 'Mujer', sizes: ['XS', 'S', 'M'], kind: 'skirt', tone: '#9a9285', ink: '#3e3a33', stock: 11, supplies: ['s1'] },
  { id: 'p16', name: 'Blazer de lino', description: 'Americana sin forro en lino natural, ideal para entretiempo.', price: 115, category: 'Hombre', sizes: ['46', '48', '50', '52'], kind: 'blazer', tone: '#e2d8c3', ink: '#7c6f55', stock: 10, supplies: ['s2', 's5'] },
]

export const SEED_SUPPLIES: Supply[] = [
  { id: 's1', name: 'Lana merino', supplier: 'Textiles Navarra', stock: 240, unit: 'm' },
  { id: 's2', name: 'Algodón orgánico', supplier: 'Hilaturas Ebro', stock: 610, unit: 'm' },
  { id: 's3', name: 'Satén de viscosa', supplier: 'Sedas del Sur', stock: 95, unit: 'm' },
  { id: 's4', name: 'Hilo de punto', supplier: 'Hilaturas Ebro', stock: 38, unit: 'kg' },
  { id: 's5', name: 'Botones de corozo', supplier: 'Mercería Llull', stock: 1200, unit: 'ud' },
]

// Every seeded account uses the password "hilo1234".
export const SEED_USERS: (User & { password: string })[] = [
  { id: 'u1', name: 'Lucía Martín', email: 'lucia@hilo.store', role: 'encargado', since: '2024', password: 'hilo1234' },
  { id: 'u2', name: 'Diego Romero', email: 'diego@hilo.store', role: 'trabajador', since: '2025', password: 'hilo1234' },
  { id: 'u3', name: 'Marta Gil', email: 'marta@hilo.store', role: 'trabajador', since: '2025', password: 'hilo1234' },
  { id: 'u4', name: 'Carlos Vidal', email: 'carlos@correo.es', role: 'cliente', since: '2025', password: 'hilo1234' },
  { id: 'u5', name: 'Ana Ortega', email: 'ana@correo.es', role: 'cliente', since: '2026', password: 'hilo1234' },
]

export const SEED_ORDERS: Order[] = [
  {
    id: 'o10391',
    userId: 'u4',
    customer: 'Carlos Vidal',
    items: [{ productId: 'p2', name: 'Camisa de popelín', size: 'M', qty: 1, price: 49.95 }],
    total: 49.95,
    address: 'Calle Mayor 12, Madrid',
    status: 'Entregado',
    createdAt: '2026-09-14T10:20:00Z',
  },
  {
    id: 'o10482',
    userId: 'u4',
    customer: 'Carlos Vidal',
    items: [
      { productId: 'p5', name: 'Jersey de punto grueso', size: 'L', qty: 1, price: 69.95 },
      { productId: 'p4', name: 'Pantalón sastre', size: '42', qty: 1, price: 59.95 },
    ],
    total: 129.9,
    address: 'Calle Mayor 12, Madrid',
    status: 'Enviado',
    createdAt: '2026-10-02T17:45:00Z',
  },
]
