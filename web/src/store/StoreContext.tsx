import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { PRODUCTS, SUPPLIES, USERS } from '../data/mock'
import type { Product, Supply, User } from '../data/mock'

// In-memory store for the mockup. Later these become calls to the students' API.
type StoreValue = {
  products: Product[]
  supplies: Supply[]
  users: User[]
  cart: string[]
  addToCart: (id: string) => void
  saveProduct: (p: Product) => void
  deleteProduct: (id: string) => void
  toggleSupply: (productId: string, supplyId: string) => void
  setUserRole: (id: string, role: User['role']) => void
  deleteUser: (id: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState(PRODUCTS)
  const [supplies] = useState(SUPPLIES)
  const [users, setUsers] = useState(USERS)
  const [cart, setCart] = useState<string[]>([])

  const value: StoreValue = {
    products,
    supplies,
    users,
    cart,
    addToCart: (id) => setCart((c) => [...c, id]),
    saveProduct: (p) =>
      setProducts((list) => (list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [p, ...list])),
    deleteProduct: (id) => setProducts((list) => list.filter((x) => x.id !== id)),
    toggleSupply: (productId, supplyId) =>
      setProducts((list) =>
        list.map((p) =>
          p.id !== productId
            ? p
            : {
                ...p,
                supplies: p.supplies.includes(supplyId)
                  ? p.supplies.filter((s) => s !== supplyId)
                  : [...p.supplies, supplyId],
              },
        ),
      ),
    setUserRole: (id, role) => setUsers((list) => list.map((u) => (u.id === id ? { ...u, role } : u))),
    deleteUser: (id) => setUsers((list) => list.filter((u) => u.id !== id)),
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
