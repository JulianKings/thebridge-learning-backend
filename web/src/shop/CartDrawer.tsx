import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, X } from 'lucide-react'
import { useQuery } from '../api/hooks'
import { api } from '../api/client'
import { Garment } from '../components/Garment'
import { formatPrice } from '../data/mock'
import { useAuth } from './AuthContext'
import { useCart } from './CartContext'
import { navigate } from './router'
import { btnPrimary } from './ui'

export function useCartLines() {
  const { items } = useCart()
  const { data: products, loading, error } = useQuery(() => api.listProducts(), [])
  const lines = items.flatMap((i) => {
    const p = products?.find((x) => x.id === i.productId)
    return p ? [{ ...i, product: p }] : []
  })
  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0)
  return { lines, total, loading, error }
}

export function CartDrawer() {
  const { open, setOpen, setQty, count } = useCart()
  const { user } = useAuth()
  const { lines, total } = useCartLines()

  const checkout = () => {
    setOpen(false)
    navigate(user ? 'checkout' : 'login/checkout')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-[min(440px,100vw)] flex-col bg-paper"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Cesta"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <p className="text-[11px] uppercase tracking-[0.2em]">Cesta ({count})</p>
              <button onClick={() => setOpen(false)} aria-label="Cerrar">
                <X className="h-5 w-5" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <p className="font-display text-3xl">Tu cesta está vacía</p>
                <p className="mt-2 text-sm text-muted">Descubre la nueva colección y encuentra tu próxima prenda favorita.</p>
              </div>
            ) : (
              <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                {lines.map((l) => (
                  <li key={`${l.productId}-${l.size}`} className="flex gap-4 py-5">
                    <Garment kind={l.product.kind} tone={l.product.tone} ink={l.product.ink} className="h-28 w-21 shrink-0" />
                    <div className="flex flex-1 flex-col">
                      <p className="text-[13px] uppercase tracking-wide">{l.product.name}</p>
                      <p className="mt-1 text-xs text-muted">Talla {l.size}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-line">
                          <button onClick={() => setQty(l.productId, l.size, l.qty - 1)} className="p-2" aria-label="Quitar uno">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm">{l.qty}</span>
                          <button onClick={() => setQty(l.productId, l.size, l.qty + 1)} className="p-2" aria-label="Añadir uno">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm">{formatPrice(l.product.price * l.qty)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {lines.length > 0 && (
              <div className="border-t border-line px-6 py-5">
                <div className="flex justify-between text-sm">
                  <span className="uppercase tracking-wide">Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="mt-1 text-xs text-muted">Envío gratuito a partir de 50 €</p>
                <button onClick={checkout} className={`${btnPrimary} mt-5 w-full`}>
                  Tramitar pedido
                </button>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
