import { ArrowLeft, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '../../api/hooks'
import { api } from '../../api/mockApi'
import { Garment } from '../../components/Garment'
import { formatPrice } from '../../data/mock'
import { useAuth } from '../AuthContext'
import { useCart } from '../CartContext'
import { shopHref } from '../router'
import { ErrorBox, ProductCard, btnPrimary } from '../ui'

export function ProductPage({ id }: { id: string }) {
  const { data: p, loading, error } = useQuery(() => api.getProduct(id), [id])
  const { data: all } = useQuery(() => api.listProducts(), [])
  const { add } = useCart()
  const { isStaff } = useAuth()
  const [size, setSize] = useState<string | null>(null)
  const [warn, setWarn] = useState(false)

  if (error) return <ErrorBox error={error} className="m-8" />
  if (loading && !p) return <div className="grid min-h-[70vh] place-items-center text-sm text-muted">Cargando…</div>
  if (!p) return null

  const related = all?.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4) ?? []
  const soldOut = p.stock === 0

  const addToCart = () => {
    if (!size) return setWarn(true)
    add(p.id, size)
  }

  return (
    <>
      <section className="mx-auto grid max-w-[1500px] gap-10 px-4 py-8 sm:px-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-2 sm:grid-cols-2">
          <Garment kind={p.kind} tone={p.tone} ink={p.ink} className="aspect-[3/4] sm:col-span-2" />
          <Garment kind={p.kind} tone={p.ink} ink={p.tone} className="hidden aspect-square sm:block" />
          <div className="hidden aspect-square items-center justify-center bg-paper-2 p-8 text-center sm:flex">
            <p className="font-display text-2xl italic leading-snug text-muted">{p.description}</p>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <a href={shopHref(`c/${p.category.toLowerCase()}`)} className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> {p.category}
          </a>
          <h1 className="mt-6 font-display text-4xl leading-tight sm:text-5xl">{p.name}</h1>
          <p className="mt-3 text-lg">{formatPrice(p.price)}</p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">{p.description}</p>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Talla</p>
              {warn && !size && <p className="text-xs text-bad">Elige una talla</p>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  disabled={soldOut}
                  onClick={() => setSize(s)}
                  className={`min-w-12 border px-3 py-2.5 text-sm transition-colors disabled:opacity-30 ${size === s ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button onClick={addToCart} disabled={soldOut} className={`${btnPrimary} mt-8 w-full`}>
            {soldOut ? 'Agotado' : 'Añadir a la cesta'}
          </button>
          <p className={`mt-3 text-xs ${p.stock < 8 ? 'text-bad' : 'text-muted'}`}>
            {soldOut ? 'Sin stock por ahora.' : p.stock < 8 ? `Solo quedan ${p.stock} unidades.` : 'En stock · Envío en 24/48 h'}
          </p>

          <div className="mt-10 border-t border-line pt-6">
            <p className="eyebrow">Composición y materiales</p>
            {p.supplyDetails.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {p.supplyDetails.map((s) => (
                  <li key={s.id} className="flex justify-between">
                    <span>{s.name}</span>
                    <span className="text-muted">{s.supplier}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">Sin materiales vinculados.</p>
            )}
          </div>

          {isStaff && (
            <a href={shopHref(`gestion/prendas/${p.id}`)} className="mt-8 inline-flex items-center gap-2 text-xs underline underline-offset-4">
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
              <ProductCard key={r.id} p={r} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
