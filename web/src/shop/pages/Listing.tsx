import { useState } from 'react'
import { useQuery } from '../../api/hooks'
import { api } from '../../api/client'
import type { ProductQuery } from '../../api/client'
import type { Category } from '../../api/types'
import { ErrorBox, GridSkeleton, ProductCard } from '../ui'

const CATEGORY: Record<string, Category | undefined> = { mujer: 'Mujer', hombre: 'Hombre', unisex: 'Unisex' }

export function Listing({ slug, search }: { slug?: string; search?: string }) {
  const [sort, setSort] = useState<ProductQuery['sort']>()
  const category = slug ? CATEGORY[slug] : undefined
  const { data, loading, error } = useQuery(() => api.listProducts({ category, search, sort }), [category, search, sort])

  const title = search ? `«${search}»` : (category ?? 'Toda la colección')

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-12 sm:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="eyebrow">{search ? 'Resultados de búsqueda' : 'Colección Otoño — Invierno'}</p>
          <h1 className="mt-2 font-display text-5xl">{title}</h1>
        </div>
        <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.18em]">
          <span className="text-muted">{data ? `${data.length} prendas` : ''}</span>
          <select
            value={sort ?? ''}
            onChange={(e) => setSort((e.target.value || undefined) as ProductQuery['sort'])}
            className="cursor-pointer bg-transparent uppercase outline-none"
            aria-label="Ordenar"
          >
            <option value="" className="bg-paper">Destacados</option>
            <option value="nuevo" className="bg-paper">Novedades</option>
            <option value="precio-asc" className="bg-paper">Precio ascendente</option>
            <option value="precio-desc" className="bg-paper">Precio descendente</option>
          </select>
        </div>
      </div>

      {error ? (
        <ErrorBox error={error} />
      ) : loading && !data ? (
        <GridSkeleton />
      ) : data?.length === 0 ? (
        <p className="py-20 text-center font-display text-3xl text-muted">No hay prendas que coincidan.</p>
      ) : (
        <div className={`grid grid-cols-2 gap-x-4 gap-y-12 transition-opacity md:grid-cols-3 xl:grid-cols-4 ${loading ? 'opacity-50' : ''}`}>
          {data?.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </section>
  )
}
