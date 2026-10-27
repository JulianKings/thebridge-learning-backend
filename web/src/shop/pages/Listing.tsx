import { useState } from 'react'
import { useQuery } from '../../api/hooks'
import { CHECK_EVENT } from '../../levels/levels'
import { ropaApi } from '../../ropa/api'
import { grupoDe, grupoPorSlug, precioFinal, titulo } from '../../ropa/types'
import { ErrorBox, GridSkeleton, ProductCard } from '../ui'

type Orden = 'precio-asc' | 'precio-desc' | 'eventos' | undefined

export function Listing({ slug, search }: { slug?: string; search?: string }) {
  const [orden, setOrden] = useState<Orden>()
  const grupo = grupoPorSlug(slug)
  const { data, loading, error } = useQuery(() => ropaApi.list(), [])
  const { data: proveedores } = useQuery(() => ropaApi.proveedores(), [])

  const prendas = (data ?? [])
    .filter((p) => p.evento !== CHECK_EVENT)
    .filter((p) => !grupo || grupoDe(p.tipo) === grupo)
    .filter((p) => !search || titulo(p).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      orden === 'precio-asc'
        ? precioFinal(a) - precioFinal(b)
        : orden === 'precio-desc'
          ? precioFinal(b) - precioFinal(a)
          : orden === 'eventos'
            ? Number(!!b.evento) - Number(!!a.evento)
            : 0,
    )

  const title = search ? `«${search}»` : (grupo ?? 'Toda la colección')

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-12 sm:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="eyebrow">{search ? 'Resultados de búsqueda' : 'La colección'}</p>
          <h1 className="mt-2 font-display text-5xl">{title}</h1>
        </div>
        <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.18em]">
          <span className="text-muted">{data ? `${prendas.length} prendas` : ''}</span>
          <select
            value={orden ?? ''}
            onChange={(e) => setOrden((e.target.value || undefined) as Orden)}
            className="cursor-pointer bg-transparent uppercase outline-none"
            aria-label="Ordenar"
          >
            <option value="" className="bg-paper">Destacados</option>
            <option value="eventos" className="bg-paper">Promociones</option>
            <option value="precio-asc" className="bg-paper">Precio ascendente</option>
            <option value="precio-desc" className="bg-paper">Precio descendente</option>
          </select>
        </div>
      </div>

      {error ? (
        <ErrorBox error={error} />
      ) : loading && !data ? (
        <GridSkeleton />
      ) : prendas.length === 0 ? (
        <p className="py-20 text-center font-display text-3xl text-muted">No hay prendas que coincidan.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
          {prendas.map((p) => (
            <ProductCard key={p._id} p={p} proveedores={proveedores} />
          ))}
        </div>
      )}
    </section>
  )
}
