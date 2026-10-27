import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '../api/hooks'
import { useProgress } from '../progress/ProgressContext'
import { ropaApi } from '../ropa/api'
import type { RopaQuery } from '../ropa/api'
import { MOCK_PROVEEDORES, MOCK_ROPA } from '../ropa/mock'
import { ProductoTile } from '../ropa/ProductoTile'
import { nombreTipo } from '../ropa/types'
import type { Producto, Tipo } from '../ropa/types'
import { ErrorBox } from '../shop/ui'
import { SectionHeading } from './SectionHeading'

const PAGE_SIZE = 4

// The preview answers the same query the real API would, from the mock catalogue.
function mockQuery({ tipo, page = 1, limit = PAGE_SIZE }: RopaQuery): Promise<Producto[]> {
  const list = MOCK_ROPA.filter((p) => !tipo || p.tipo === tipo)
  return Promise.resolve(list.slice((page - 1) * limit, page * limit))
}

export function Explore() {
  const { isUnlocked } = useProgress()
  const live = isUnlocked(6)
  const [tipo, setTipo] = useState<Tipo | undefined>()
  const [page, setPage] = useState(1)
  const q: RopaQuery = { tipo, page, limit: PAGE_SIZE }

  const { data: todas } = useQuery(() => (live ? ropaApi.list() : Promise.resolve(MOCK_ROPA)), [live])
  const { data: proveedores } = useQuery(() => (live ? ropaApi.proveedores() : Promise.resolve(MOCK_PROVEEDORES)), [live])
  const { data, error, loading } = useQuery(() => (live ? ropaApi.list(q) : mockQuery(q)), [live, tipo, page])

  const tipos = [...new Set((todas ?? []).map((p) => p.tipo))].sort()
  const pagina = data ?? []
  const query = new URLSearchParams({ ...(tipo && { tipo }), page: String(page), limit: String(PAGE_SIZE) })

  const elegir = (t: Tipo | undefined) => {
    setTipo(t)
    setPage(1)
  }

  return (
    <div className="px-4 py-16 sm:px-8">
      <SectionHeading level={6} title="Filtrar y paginar" />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => elegir(undefined)}
          className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] ${!tipo ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'}`}
        >
          Todo
        </button>
        {tipos.map((t) => (
          <button
            key={t}
            onClick={() => elegir(t)}
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] ${tipo === t ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'}`}
          >
            {nombreTipo(t)}
          </button>
        ))}
      </div>
      <p className="mt-3 font-mono text-[11px] text-muted">GET /ropa?{query.toString()}</p>

      {error ? (
        <ErrorBox error={error} className="mt-8" />
      ) : (
        <div className={`mt-8 grid grid-cols-2 gap-x-4 gap-y-10 transition-opacity md:grid-cols-4 ${loading ? 'opacity-50' : ''}`}>
          {pagina.map((p) => (
            <ProductoTile key={p._id} p={p} proveedores={proveedores} />
          ))}
        </div>
      )}
      {!loading && !error && pagina.length === 0 && <p className="py-16 text-center font-display text-2xl text-muted">No hay prendas en esta página.</p>}

      <div className="mt-10 flex items-center justify-center gap-4 text-sm">
        <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-2 disabled:opacity-30" aria-label="Página anterior">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[11px] uppercase tracking-[0.2em]">Página {page}</span>
        <button onClick={() => setPage(page + 1)} disabled={pagina.length < PAGE_SIZE} className="p-2 disabled:opacity-30" aria-label="Página siguiente">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
