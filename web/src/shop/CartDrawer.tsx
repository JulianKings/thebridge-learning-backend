import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, X } from 'lucide-react'
import { useQuery } from '../api/hooks'
import { formatPrice } from '../data/mock'
import { ropaApi } from '../ropa/api'
import { ProductoImage } from '../ropa/ProductoImage'
import { precioFinal, titulo } from '../ropa/types'
import { useAuth } from './AuthContext'
import { useCart } from './CartContext'
import { navigate } from './router'
import { btnPrimary } from './ui'

export function useCartLines() {
  const { items } = useCart()
  const { data: productos, loading, error } = useQuery(() => ropaApi.list(), [])
  const lines = items.flatMap((i) => {
    const producto = productos?.find((p) => p._id === i.productId)
    if (!producto) return []
    const stock = producto.talla.find((t) => t.talla_tipo === i.size)?.talla_stock ?? 0
    return [{ ...i, producto, stock, precio: precioFinal(producto) }]
  })
  const total = Math.round(lines.reduce((s, l) => s + l.precio * l.qty, 0) * 100) / 100
  return { lines, total, loading, error }
}

export function CartDrawer() {
  const { open, setOpen, setQty, count } = useCart()
  const { usuario } = useAuth()
  const { lines, total } = useCartLines()

  const checkout = () => {
    setOpen(false)
    navigate(usuario ? 'checkout' : 'login/checkout')
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
                  <motion.li layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} key={`${l.productId}-${l.size}`} className="flex gap-4 py-5">
                    <ProductoImage tipo={l.producto.tipo} foto={l.producto.foto} seed={l.producto._id} className="h-28 w-21 shrink-0" />
                    <div className="flex flex-1 flex-col">
                      <p className="text-[13px] uppercase tracking-wide">{titulo(l.producto)}</p>
                      <p className="mt-1 text-xs text-muted">Talla {l.size}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-line">
                          <button onClick={() => setQty(l.productId, l.size, l.qty - 1)} className="p-2" aria-label="Quitar uno">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm">{l.qty}</span>
                          <button
                            onClick={() => setQty(l.productId, l.size, l.qty + 1)}
                            disabled={l.qty >= l.stock}
                            className="p-2 disabled:opacity-30"
                            aria-label="Añadir uno"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm">{formatPrice(l.precio * l.qty)}</span>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}

            {lines.length > 0 && (
              <div className="drawer-footer border-t border-line px-6 py-5">
                <div className="flex justify-between text-sm">
                  <span className="uppercase tracking-wide">Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="mt-2 flex items-center justify-between text-xs text-muted">
                  Con este pedido ganas
                  <motion.span key={Math.floor(total)} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="font-medium text-pop">
                    +{Math.floor(total)} puntos
                  </motion.span>
                </p>
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
