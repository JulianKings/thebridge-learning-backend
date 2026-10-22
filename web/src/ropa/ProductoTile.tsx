import { formatPrice } from '../data/mock'
import { ProductoImage } from './ProductoImage'
import { nombreProveedor, precioFinal, stockTotal, titulo } from './types'
import type { Producto, Proveedor } from './types'

export function ProductoTile({ p, proveedores }: { p: Producto; proveedores?: Proveedor[] }) {
  const agotado = !p.disponible || stockTotal(p) === 0
  const proveedor = nombreProveedor(p, proveedores)

  return (
    <article className="group">
      <div className="relative overflow-hidden">
        <ProductoImage
          tipo={p.tipo}
          foto={p.foto}
          seed={p._id}
          className="block aspect-[3/4] w-full transition-transform duration-700 group-hover:scale-[1.02]"
        />
        {p.evento && (
          <span className="absolute left-3 top-3 bg-paper px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-ink">{p.evento}</span>
        )}
        {p.descuento > 0 && (
          <span className="absolute right-3 top-3 bg-bad px-2 py-1 text-[10px] font-medium tracking-wider text-white">-{p.descuento}%</span>
        )}
        {agotado ? (
          <span className="absolute inset-x-0 bottom-0 bg-paper/90 py-2 text-center text-[10px] uppercase tracking-[0.2em] text-ink">Agotado</span>
        ) : (
          <div className="absolute inset-x-0 bottom-0 flex translate-y-2 flex-wrap gap-2 bg-paper/95 px-3 py-2.5 text-[11px] text-muted opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
            {p.talla.filter((t) => t.talla_stock > 0).map((t) => (
              <span key={t.talla_tipo}>{t.talla_tipo}</span>
            ))}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3 text-[13px]">
        <h3 className="uppercase tracking-wide">{titulo(p)}</h3>
        <span className="shrink-0 text-right">
          {formatPrice(precioFinal(p))}
          {p.descuento > 0 && <span className="block text-xs text-muted line-through">{formatPrice(p.precio)}</span>}
        </span>
      </div>
      {proveedor && <p className="mt-0.5 text-xs text-muted">{proveedor}</p>}
    </article>
  )
}
