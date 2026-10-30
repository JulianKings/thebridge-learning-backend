import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { formatPrice } from '../data/mock'
import { ProductoImage } from '../ropa/ProductoImage'
import { nombreProveedor, precioFinal, stockTotal, titulo } from '../ropa/types'
import type { Producto, Proveedor, TallaTipo } from '../ropa/types'
import { useCart } from './CartContext'
import { shopHref } from './router'

export function ProductCard({ p, proveedores, index = 0 }: { p: Producto; proveedores?: Pick<Proveedor, '_id' | 'nombreComercial'>[]; index?: number }) {
  const { add } = useCart()
  const [added, setAdded] = useState<TallaTipo | null>(null)
  const agotado = !p.disponible || stockTotal(p) === 0
  const proveedor = nombreProveedor(p, proveedores)
  const href = shopHref(`p/${p._id}`)

  const quickAdd = (talla: TallaTipo) => {
    add(p._id, talla)
    setAdded(talla)
    setTimeout(() => setAdded(null), 1200)
  }

  return (
    <motion.article
      className="group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative overflow-hidden bg-paper-2">
        <a href={href} className="block" tabIndex={-1} aria-hidden="true">
          <ProductoImage
            tipo={p.tipo}
            foto={p.foto}
            seed={p._id}
            className="block aspect-[3/4] w-full transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
          <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </a>
        {p.evento && (
          <span className="absolute left-3 top-3 bg-paper px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-ink">{p.evento}</span>
        )}
        {p.descuento > 0 && (
          <span className="absolute right-3 top-3 bg-pop px-2 py-1 text-[10px] font-semibold tracking-wider text-white">-{p.descuento}%</span>
        )}
        {agotado ? (
          <span className="absolute inset-x-0 bottom-0 bg-paper/90 py-2 text-center text-[10px] uppercase tracking-[0.2em] text-ink">Agotado</span>
        ) : (
          <div className="absolute inset-x-2 bottom-2 translate-y-[calc(100%+0.5rem)] bg-paper/95 px-3 py-2.5 backdrop-blur transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-within:translate-y-0 group-hover:translate-y-0 [@media(hover:none)]:hidden">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Añadir rápido</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {p.talla.map((t) => (
                <button
                  key={t.talla_tipo}
                  disabled={t.talla_stock === 0}
                  onClick={() => quickAdd(t.talla_tipo)}
                  className="relative min-w-9 border border-line px-2 py-1 text-[11px] transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:line-through disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
                  aria-label={`Añadir talla ${t.talla_tipo} a la cesta`}
                >
                  {added === t.talla_tipo ? <Check className="mx-auto h-3 w-3" /> : t.talla_tipo}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <a href={href} className="mt-3 flex items-start justify-between gap-3 text-[13px]">
        <h3 className="link-grow uppercase tracking-wide">{titulo(p)}</h3>
        <span className="shrink-0 text-right">
          <span className={p.descuento > 0 ? 'text-pop' : ''}>{formatPrice(precioFinal(p))}</span>
          {p.descuento > 0 && <span className="block text-xs text-muted line-through">{formatPrice(p.precio)}</span>}
        </span>
      </a>
      {proveedor && <p className="mt-0.5 text-xs text-muted">{proveedor}</p>}
    </motion.article>
  )
}
