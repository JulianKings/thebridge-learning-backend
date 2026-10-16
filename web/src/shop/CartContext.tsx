import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type CartItem = { productId: string; size: string; qty: number }

type CartValue = {
  items: CartItem[]
  count: number
  open: boolean
  setOpen: (open: boolean) => void
  add: (productId: string, size: string) => void
  setQty: (productId: string, size: string, qty: number) => void
  clear: () => void
}

const CART_KEY = 'hilo-cart'
const CartContext = createContext<CartValue | null>(null)

function load(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch {
      // Cart lasts until reload.
    }
  }, [items])

  const same = (i: CartItem, productId: string, size: string) => i.productId === productId && i.size === size

  const value: CartValue = {
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    open,
    setOpen,
    add: (productId, size) => {
      setItems((list) =>
        list.some((i) => same(i, productId, size))
          ? list.map((i) => (same(i, productId, size) ? { ...i, qty: i.qty + 1 } : i))
          : [...list, { productId, size, qty: 1 }],
      )
      setOpen(true)
    },
    setQty: (productId, size, qty) =>
      setItems((list) =>
        qty <= 0 ? list.filter((i) => !same(i, productId, size)) : list.map((i) => (same(i, productId, size) ? { ...i, qty } : i)),
      ),
    clear: () => setItems([]),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
