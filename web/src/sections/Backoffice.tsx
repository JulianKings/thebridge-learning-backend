import { AnimatePresence } from 'framer-motion'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '../api/hooks'
import { formatPrice } from '../data/mock'
import { CHECK_EVENT } from '../levels/levels'
import { useProgress } from '../progress/ProgressContext'
import { ropaApi } from '../ropa/api'
import { MOCK_PROVEEDORES, MOCK_ROPA } from '../ropa/mock'
import { ProductoEditor } from '../ropa/ProductoEditor'
import { ProductoImage } from '../ropa/ProductoImage'
import { precioFinal, stockTotal, titulo } from '../ropa/types'
import type { Producto, Proveedor } from '../ropa/types'
import { ErrorBox, toast, toastError } from '../shop/ui'
import { SectionHeading } from './SectionHeading'

const proveedorDe = (p: Producto, proveedores: Proveedor[]) =>
  typeof p.proveedor === 'object' && p.proveedor
    ? p.proveedor.nombreComercial
    : (proveedores.find((pr) => pr._id === p.proveedor)?.nombreComercial ?? '—')

function Table({ ropa, proveedores, onEdit, onDelete }: {
  ropa: Producto[]
  proveedores: Proveedor[]
  onEdit?: (p: Producto) => void
  onDelete?: (p: Producto) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="eyebrow border-b border-line">
            <th className="py-3 font-normal">Prenda</th>
            <th className="py-3 font-normal">Proveedor</th>
            <th className="py-3 font-normal">Precio</th>
            <th className="py-3 font-normal">Stock</th>
            <th className="py-3 font-normal">Estado</th>
            <th className="py-3" />
          </tr>
        </thead>
        <tbody>
          {ropa.map((p) => (
            <tr key={p._id} className="border-b border-line">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <ProductoImage tipo={p.tipo} foto={p.foto} seed={p._id} className="h-12 w-9 shrink-0" />
                  <span>
                    {titulo(p)}
                    {p.evento && <span className="block text-xs text-muted">{p.evento}</span>}
                  </span>
                </div>
              </td>
              <td className="text-muted">{proveedorDe(p, proveedores)}</td>
              <td>
                {formatPrice(precioFinal(p))}
                {p.descuento > 0 && <span className="ml-1.5 text-xs text-bad">-{p.descuento}%</span>}
              </td>
              <td className={stockTotal(p) < 5 ? 'text-bad' : ''}>
                {stockTotal(p)} ud
                <span className="block text-xs text-muted">{p.talla.map((t) => t.talla_tipo).join(' · ')}</span>
              </td>
              <td className="text-xs uppercase tracking-wider">{p.disponible ? 'Disponible' : <span className="text-bad">No disponible</span>}</td>
              <td className="text-right">
                <div className="inline-flex gap-1 text-muted">
                  <button onClick={() => onEdit?.(p)} className="p-2 hover:text-ink" aria-label={`Editar ${titulo(p)}`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete?.(p)} className="p-2 hover:text-bad" aria-label={`Eliminar ${titulo(p)}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LivePanel() {
  const { data, error, loading } = useQuery(() => ropaApi.list(), [])
  const { data: proveedores = [], error: proveedoresError } = useQuery(() => ropaApi.proveedores(), [])
  const [editing, setEditing] = useState<Producto | 'new' | null>(null)
  const ropa = (data ?? []).filter((p) => p.evento !== CHECK_EVENT)

  const remove = async (p: Producto) => {
    if (!confirm(`¿Eliminar «${titulo(p)}»?`)) return
    try {
      await ropaApi.remove(p._id)
      toast('Prenda eliminada')
    } catch (err) {
      toastError(err)
    }
  }

  return (
    <>
      <SectionHeading level={3} title="Panel de trabajador">
        <button onClick={() => setEditing('new')} className="flex items-center gap-2 bg-ink px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-paper hover:opacity-85">
          <Plus className="h-4 w-4" /> Nueva prenda
        </button>
      </SectionHeading>
      {proveedoresError && (
        <p className="mb-6 border-l-2 border-bad bg-bad-soft px-4 py-3 text-sm text-bad">
          No se han podido cargar los proveedores ({proveedoresError.status}): no podrás asignar proveedor a las prendas.
        </p>
      )}
      {error ? (
        <ErrorBox error={error} />
      ) : loading && !data ? (
        <p className="py-16 text-center text-sm text-muted">Cargando prendas…</p>
      ) : (
        <Table ropa={ropa} proveedores={proveedores} onEdit={setEditing} onDelete={remove} />
      )}
      <AnimatePresence>
        {editing && (
          <ProductoEditor
            key={editing === 'new' ? 'new' : editing._id}
            producto={editing === 'new' ? null : editing}
            proveedores={proveedores}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export function Backoffice() {
  const { isUnlocked } = useProgress()
  return (
    <div className="px-4 py-16 sm:px-8">
      {isUnlocked(3) ? (
        <LivePanel />
      ) : (
        <>
          <SectionHeading level={3} title="Panel de trabajador">
            <span className="flex items-center gap-2 bg-ink px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-paper">
              <Plus className="h-4 w-4" /> Nueva prenda
            </span>
          </SectionHeading>
          <Table ropa={MOCK_ROPA} proveedores={MOCK_PROVEEDORES} />
        </>
      )}
    </div>
  )
}
