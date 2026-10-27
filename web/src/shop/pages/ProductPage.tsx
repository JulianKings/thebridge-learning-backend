import { ArrowLeft, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '../../api/hooks'
import { formatPrice } from '../../data/mock'
import { CHECK_EVENT } from '../../levels/levels'
import { ropaApi } from '../../ropa/api'
import { ProductoImage } from '../../ropa/ProductoImage'
import { GRUPO_SLUG, grupoDe, nombreProveedor, precioFinal, stockTotal, titulo } from '../../ropa/types'
import type { TallaTipo } from '../../ropa/types'
import { useAuth } from '../AuthContext'
import { useCart } from '../CartContext'
import { shopHref } from '../router'
import { ErrorBox, ProductCard, btnPrimary } from '../ui'

export function ProductPage({ id }: { id: string }) {
  const { data: p, loading, error } = useQuery(() => ropaApi.get(id), [id])
  const { data: all } = useQuery(() => ropaApi.list(), [])
  const { data: proveedores } = useQuery(() => ropaApi.proveedores(), [])
  const { add } = useCart()
  const { isStaff } = useAuth()
  const [talla, setTalla] = useState<TallaTipo | null>(null)
  const [warn, setWarn] = useState(false)

  if (error) return <ErrorBox error={error} className="m-8" />
  if (loading && !p) return <div className="grid min-h-[70vh] place-items-center text-sm text-muted">Cargando…</div>
  if (!p) return null

  const grupo = grupoDe(p.tipo)
  const related = all?.filter((x) => grupoDe(x.tipo) === grupo && x._id !== p._id && x.evento !== CHECK_EVENT).slice(0, 4) ?? []
  const agotado = !p.disponible || stockTotal(p) === 0
  const stockElegida = p.talla.find((t) => t.talla_tipo === talla)?.talla_stock
  const proveedor = nombreProveedor(p, proveedores)

  const addToCart = () => {
    if (!talla) return setWarn(true)
    add(p._id, talla)
  }

  return (
    <>
      <section className="mx-auto grid max-w-[1500px] gap-10 px-4 py-8 sm:px-8 lg:grid-cols-[1.4fr_1fr]">
        <ProductoImage tipo={p.tipo} foto={p.foto} seed={p._id} className="aspect-[3/4] w-full" />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <a href={shopHref(`c/${GRUPO_SLUG[grupo]}`)} className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> {grupo}
          </a>
          {p.evento && <p className="mt-6 inline-block bg-ink px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-paper">{p.evento}</p>}
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">{titulo(p)}</h1>
          <p className="mt-3 text-lg">
            {formatPrice(precioFinal(p))}
            {p.descuento > 0 && (
              <>
                <span className="ml-3 text-sm text-muted line-through">{formatPrice(p.precio)}</span>
                <span className="ml-2 text-sm text-bad">-{p.descuento}%</span>
              </>
            )}
          </p>
          {proveedor && <p className="mt-2 text-sm text-muted">{proveedor}</p>}

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Talla</p>
              {warn && !talla && <p className="text-xs text-bad">Elige una talla</p>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.talla.map((t) => (
                <button
                  key={t.talla_tipo}
                  disabled={agotado || t.talla_stock === 0}
                  onClick={() => setTalla(t.talla_tipo)}
                  className={`min-w-12 border px-3 py-2.5 text-sm transition-colors disabled:opacity-30 ${talla === t.talla_tipo ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'}`}
                >
                  {t.talla_tipo}
                </button>
              ))}
            </div>
          </div>

          <button onClick={addToCart} disabled={agotado} className={`${btnPrimary} mt-8 w-full`}>
            {agotado ? 'Agotado' : 'Añadir a la cesta'}
          </button>
          <p className={`mt-3 text-xs ${stockElegida !== undefined && stockElegida < 5 ? 'text-bad' : 'text-muted'}`}>
            {agotado
              ? 'Sin stock por ahora.'
              : stockElegida !== undefined
                ? stockElegida < 5
                  ? `Solo quedan ${stockElegida} en la talla ${talla}.`
                  : `En stock en la talla ${talla}.`
                : 'Cada compra suma puntos a tu cuenta.'}
          </p>

          {isStaff && (
            <a href={shopHref(`gestion/prendas/${p._id}`)} className="mt-8 inline-flex items-center gap-2 text-xs underline underline-offset-4">
              <Pencil className="h-3.5 w-3.5" /> Editar en gestión
            </a>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1500px] px-4 py-16 sm:px-8">
          <h2 className="mb-8 font-display text-3xl">También te puede gustar</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r._id} p={r} proveedores={proveedores} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
