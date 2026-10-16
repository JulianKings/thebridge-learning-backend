import type { GarmentKind } from '../data/mock'

export type Role = 'cliente' | 'trabajador' | 'encargado'
export type Category = 'Mujer' | 'Hombre' | 'Unisex'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: Category
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
  role: Role
  since: string
}

export type OrderItem = { productId: string; name: string; size: string; qty: number; price: number }

export type Order = {
  id: string
  userId: string
  customer: string
  items: OrderItem[]
  total: number
  address: string
  status: 'Pagado' | 'Enviado' | 'Entregado'
  createdAt: string
}

export type Session = { token: string; user: User }

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}
