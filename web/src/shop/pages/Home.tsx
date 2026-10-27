import { ArrowRight } from 'lucide-react'
import { useQuery } from '../../api/hooks'
import { Garment } from '../../components/Garment'
import { CHECK_EVENT } from '../../levels/levels'
import { ropaApi } from '../../ropa/api'
import { GRUPO_SLUG, stockTotal } from '../../ropa/types'
import { shopHref } from '../router'
import { ErrorBox, GridSkeleton, ProductCard } from '../ui'

const CATEGORY_TILES = [
  { slug: GRUPO_SLUG['Parte de arriba'], label: 'Parte de arriba', kind: 'knit', tone: '#b6533b', ink: '#f1d9cf' },
  { slug: GRUPO_SLUG['Parte de abajo'], label: 'Parte de abajo', kind: 'trousers', tone: '#d8cbbb', ink: '#6f5d48' },
  { slug: GRUPO_SLUG.Calzado, label: 'Calzado', kind: 'shoe', tone: '#2a2f36', ink: '#8b96a3' },
] as const

export function Home() {
  const { data, loading, error } = useQuery(() => ropaApi.list(), [])
  const { data: proveedores } = useQuery(() => ropaApi.proveedores(), [])
  // Products with an event (Rebajas, Black Friday…) first, and only ones that can be bought.
  const news = (data ?? [])
    .filter((p) => p.evento !== CHECK_EVENT && p.disponible && stockTotal(p) > 0)
    .sort((a, b) => Number(!!b.evento) - Number(!!a.evento))
    .slice(0, 4)

  return (
    <>
      <section className="relative grid min-h-[calc(100dvh-4rem)] md:grid-cols-2">
        <Garment kind="coat" tone="#d9cfc1" ink="#6b5a45" className="min-h-[60vh]" />
        <Garment kind="dress" tone="#2f2f2d" ink="#8c8a84" className="hidden md:block" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-14 text-center md:pb-20">
          <p className="bg-paper/85 px-3 py-1 text-[11px] uppercase tracking-[0.3em]">Otoño — Invierno 2026</p>
          <h1 className="mt-4 font-display text-6xl leading-[0.9] text-ink drop-shadow-[0_1px_20px_var(--paper)] sm:text-8xl lg:text-9xl">
            Lo esencial,
            <br />
            <em>bien hecho.</em>
          </h1>
          <a href={shopHref('c/todo')} className="mt-8 inline-flex items-center gap-3 bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-paper">
            Descubrir la colección <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-20 sm:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-4xl sm:text-5xl">Novedades</h2>
          <a href={shopHref('c/todo')} className="text-[11px] uppercase tracking-[0.2em] underline underline-offset-4">
            Ver todo
          </a>
        </div>
        {error ? <ErrorBox error={error} /> : loading && !data ? <GridSkeleton n={4} /> : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {news.map((p) => (
              <ProductCard key={p._id} p={p} proveedores={proveedores} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-px bg-line md:grid-cols-3">
        {CATEGORY_TILES.map((c) => (
          <a key={c.slug} href={shopHref(`c/${c.slug}`)} className="group relative block bg-paper">
            <Garment kind={c.kind} tone={c.tone} ink={c.ink} className="aspect-[4/5] transition-opacity group-hover:opacity-90" />
            <span className="absolute bottom-6 left-6 bg-paper px-4 py-2 text-[11px] uppercase tracking-[0.25em]">{c.label}</span>
          </a>
        ))}
      </section>

      <section className="px-4 py-28 text-center sm:px-8">
        <p className="eyebrow">Nuestra forma de hacer</p>
        <p className="mx-auto mt-6 max-w-4xl font-display text-4xl leading-tight sm:text-6xl">
          Tejidos nobles, pocas piezas y <em>ninguna prisa</em>. Ropa pensada para quedarse.
        </p>
      </section>
    </>
  )
}
