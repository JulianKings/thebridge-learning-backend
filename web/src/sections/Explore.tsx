import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useState } from 'react'
import { PRODUCTS } from '../data/mock'
import { ProductTile } from './Catalog'
import { SectionHeading } from './SectionHeading'

const PAGE_SIZE = 4
const CATEGORIES = ['Mujer', 'Hombre', 'Unisex'] as const

export function Explore() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  const results = PRODUCTS.filter(
    (p) => (!category || p.category === category) && p.name.toLowerCase().includes(search.toLowerCase()),
  )
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const current = Math.min(page, pages - 1)
  const visible = results.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)
  const query = new URLSearchParams({
    ...(search && { search }),
    ...(category && { category }),
    page: String(current + 1),
    limit: String(PAGE_SIZE),
  })

  return (
    <div className="px-4 py-16 sm:px-8">
      <SectionHeading level={6} title="Buscar y filtrar" />

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex min-w-60 flex-1 items-center gap-3 border-b border-ink py-2">
          <Search className="h-4 w-4 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            placeholder="Buscar prendas"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(category === c ? null : c)
                setPage(0)
              }}
              className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] ${category === c ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 font-mono text-[11px] text-muted">GET /api/products?{query.toString()}</p>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
        {visible.map((p) => (
          <ProductTile key={p.id} p={p} />
        ))}
      </div>
      {results.length === 0 && <p className="py-16 text-center font-display text-2xl text-muted">No hay prendas que coincidan.</p>}

      <div className="mt-10 flex items-center justify-center gap-4 text-sm">
        <button onClick={() => setPage(current - 1)} disabled={current === 0} className="p-2 disabled:opacity-30" aria-label="Página anterior">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[11px] uppercase tracking-[0.2em]">
          Página {current + 1} de {pages}
        </span>
        <button onClick={() => setPage(current + 1)} disabled={current >= pages - 1} className="p-2 disabled:opacity-30" aria-label="Página siguiente">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
