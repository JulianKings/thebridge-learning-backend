import { useState } from 'react'
import { useQuery } from '../api/hooks'
import { CHECK_EVENT } from '../levels/levels'
import { useProgress } from '../progress/ProgressContext'
import { ropaApi } from '../ropa/api'
import { MOCK_PROVEEDORES, MOCK_ROPA } from '../ropa/mock'
import { ProductoTile } from '../ropa/ProductoTile'
import { GRUPOS, grupoDe } from '../ropa/types'
import type { Grupo } from '../ropa/types'
import { ErrorBox } from '../shop/ui'
import { SectionHeading } from './SectionHeading'

const chip = (active: boolean) =>
  `text-[11px] uppercase tracking-[0.18em] ${active ? 'border-b border-ink text-ink' : 'text-muted hover:text-ink'}`

export function Catalog() {
  const { isUnlocked } = useProgress()
  const live = isUnlocked(2)
  const { data, error, loading } = useQuery(() => (live ? ropaApi.list() : Promise.resolve(MOCK_ROPA)), [live])
  const { data: proveedores } = useQuery(() => (live ? ropaApi.proveedores() : Promise.resolve(MOCK_PROVEEDORES)), [live])
  const [grupoElegido, setGrupo] = useState<Grupo | null>(null)
  const [temporadaElegida, setTemporada] = useState<string | null>(null)

  const ropa = (data ?? []).filter((p) => p.evento !== CHECK_EVENT)
  const grupos = GRUPOS.filter((g) => ropa.some((p) => grupoDe(p.tipo) === g))
  const temporadas = [...new Set(ropa.map((p) => p.temporada).filter(Boolean))].sort()
  // A filter whose products were deleted in the meantime falls back to "Todo".
  const grupo = grupoElegido && grupos.includes(grupoElegido) ? grupoElegido : null
  const temporada = temporadaElegida && temporadas.includes(temporadaElegida) ? temporadaElegida : null
  const visible = ropa.filter((p) => (!grupo || grupoDe(p.tipo) === grupo) && (!temporada || p.temporada === temporada))

  return (
    <div className="px-4 py-16 sm:px-8">
      <SectionHeading level={2} title="La colección">
        <span className="font-mono text-[11px] text-muted">{live ? `GET /ropa · ${ropa.length} prendas` : 'GET /ropa'}</span>
      </SectionHeading>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-5">
          <button onClick={() => setGrupo(null)} className={chip(!grupo)}>
            Todo
          </button>
          {grupos.map((g) => (
            <button key={g} onClick={() => setGrupo(g)} className={chip(grupo === g)}>
              {g}
            </button>
          ))}
        </div>
        {temporadas.length > 1 && (
          <select
            value={temporada ?? ''}
            onChange={(e) => setTemporada(e.target.value || null)}
            className="cursor-pointer bg-transparent text-[11px] uppercase tracking-[0.18em] outline-none"
            aria-label="Temporada"
          >
            <option value="" className="bg-paper">Todas las temporadas</option>
            {temporadas.map((t) => (
              <option key={t} value={t} className="bg-paper">{t}</option>
            ))}
          </select>
        )}
      </div>

      {error ? (
        <ErrorBox error={error} />
      ) : loading && !data ? (
        <p className="py-16 text-center text-sm text-muted">Cargando el catálogo…</p>
      ) : visible.length === 0 ? (
        <p className="py-16 text-center font-display text-2xl text-muted">No hay prendas que mostrar.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <ProductoTile key={p._id} p={p} proveedores={proveedores} />
          ))}
        </div>
      )}
    </div>
  )
}
