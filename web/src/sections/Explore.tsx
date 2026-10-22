import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useState } from 'react'
import { MOCK_ROPA } from '../ropa/mock'
import { ProductoTile } from '../ropa/ProductoTile'
import { titulo } from '../ropa/types'
import { SectionHeading } from './SectionHeading'

const PAGE_SIZE = 4
const TEMPORADAS = [...new Set(MOCK_ROPA.map((p) => p.temporada))]

export function Explore() {
  const [search, setSearch] = useState('')
  const [temporada, setTemporada] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  const results = MOCK_ROPA.filter(
    (p) => (!temporada || p.temporada === temporada) && titulo(p).toLowerCase().includes(search.toLowerCase()),
  )
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const current = Math.min(page, pages - 1)
  const visible = results.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)
  const query = new URLSearchParams({
    ...(search && { search }),
    ...(temporada && { temporada }),
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
          {TEMPORADAS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setTemporada(temporada === c ? null : c)
                setPage(0)
              }}
              className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] ${temporada === c ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 font-mono text-[11px] text-muted">GET /ropa?{query.toString()}</p>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
        {visible.map((p) => (
          <ProductoTile key={p._id} p={p} />
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
