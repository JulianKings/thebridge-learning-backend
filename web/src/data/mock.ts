export type GarmentKind = 'coat' | 'shirt' | 'dress' | 'trousers' | 'knit' | 'skirt' | 'tee' | 'blazer' | 'shoe' | 'hat' | 'accessory'

export const formatPrice = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
