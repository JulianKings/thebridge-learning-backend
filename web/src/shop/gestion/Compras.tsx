import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Trash2, X } from 'lucide-react'
import { Fragment, useState } from 'react'
import { useQuery } from '../../api/hooks'
import type { Usuario } from '../../auth/api'
import { ESTADOS, comprasApi } from '../../compras/api'
import type { Compra, Estado } from '../../compras/api'
import { ESTADO_STYLE, EstadoBadge } from '../../compras/Estado'
import { formatPrice } from '../../data/mock'
import { ropaApi } from '../../ropa/api'
import { useAuth } from '../AuthContext'
import { LineaNombre } from '../pages/Checkout'
import { ErrorBox, toast, toastError } from '../ui'
import { ConfirmDelete, Empty, IconButton, Pager, RowActions, SectionHeader, SortHeader, TableSkeleton, Toolbar } from './kit'

const LIMIT = 10

const clienteDe = (c: Compra) => (typeof c.cliente === 'object' && c.cliente ? (c.cliente as Usuario) : null)

function EstadoSelect({ compra }: { compra: Compra }) {
  const [busy, setBusy] = useState(false)
  const estado = compra.estado ?? 'pendiente'
  if (estado === 'cancelado') return <EstadoBadge estado="cancelado" />
  const change = async (nuevo: Estado) => {
    if (nuevo === estado) return
    setBusy(true)
    try {
      await comprasApi.cambiarEstado(compra._id, nuevo)
      toast(nuevo === 'cancelado' ? 'Compra cancelada: stock y puntos devueltos' : `Compra marcada como ${nuevo}`)
    } catch (err) {
      toastError(err)
    } finally {
      setBusy(false)
    }
  }
  return (
    <label className={`relative inline-flex items-center ${busy ? 'opacity-50' : ''}`}>
      <EstadoBadge estado={estado} />
      <select
        value={estado}
        disabled={busy}
        onChange={(e) => change(e.target.value as Estado)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Cambiar estado"
      >
        {ESTADOS.map((e) => (
          <option key={e} value={e}>
            {ESTADO_STYLE[e].label}
          </option>
        ))}
      </select>
      <ChevronDown className="ml-1 h-3 w-3 text-muted" />
    </label>
  )
}

export function Compras() {
  const { isAdmin } = useAuth()
  const [estados, setEstados] = useState<Estado[]>([])
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [cliente, setCliente] = useState<Usuario | null>(null)
  const [orden, setOrden] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Compra | null>(null)
  const query = { estado: estados, desde, hasta, cliente: cliente?._id, orden: orden || undefined, page, limit: LIMIT }
  const { data, error, loading } = useQuery(() => comprasApi.page(query), [JSON.stringify(query)])
  const { data: productos } = useQuery(() => ropaApi.list(), [])
  const reset = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v)
    setPage(1)
  }

  return (
    <>
      <SectionHeader
        eyebrow="Gestión · compras"
        title="Compras"
        endpoint="/compras"
        methods={[
          { method: 'GET', allowed: true },
          { method: 'PATCH', allowed: true },
          { method: 'DELETE', allowed: isAdmin },
        ]}
      />
      <Toolbar>
        <div className="flex flex-wrap gap-1.5 px-1">
          {ESTADOS.map((e) => {
            const on = estados.includes(e)
            return (
              <button
                key={e}
                onClick={() => reset(setEstados)(on ? estados.filter((x) => x !== e) : [...estados, e])}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${on ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${ESTADO_STYLE[e].chip.split(' ')[0]}`} />
                {ESTADO_STYLE[e].label}
              </button>
            )
          })}
        </div>
        <label className="flex items-center gap-2 border-l border-line pl-3 text-xs text-muted">
          Desde
          <input type="date" value={desde} onChange={(e) => reset(setDesde)(e.target.value)} className="bg-transparent py-1 text-sm text-ink outline-none" />
        </label>
        <label className="flex items-center gap-2 border-l border-line pl-3 text-xs text-muted">
          Hasta
          <input type="date" value={hasta} onChange={(e) => reset(setHasta)(e.target.value)} className="bg-transparent py-1 text-sm text-ink outline-none" />
        </label>
        {cliente && (
          <button onClick={() => reset(setCliente)(null)} className="flex items-center gap-1.5 rounded-full bg-pop-soft px-3 py-1.5 text-xs">
            {cliente.nombre} <X className="h-3 w-3" />
          </button>
        )}
      </Toolbar>

      {error ? (
        <ErrorBox error={error} />
      ) : !data ? (
        <TableSkeleton />
      ) : !data.items.length ? (
        <Empty>No hay compras que coincidan.</Empty>
      ) : (
        <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="eyebrow border-b border-line">
                <th className="w-8" />
                <th className="py-3 font-normal">Cliente</th>
                <SortHeader label="Fecha" field="createdAt" orden={orden} onOrden={reset(setOrden)} />
                <th className="py-3 font-normal">Estado</th>
                <SortHeader label="Puntos" field="puntos" orden={orden} onOrden={reset(setOrden)} />
                <SortHeader label="Total" field="total" orden={orden} onOrden={reset(setOrden)} className="text-right" />
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((c, i) => {
                const cl = clienteDe(c)
                const expanded = open === c._id
                return (
                  <Fragment key={c._id}>
                    <motion.tr
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`group border-b border-line transition-colors hover:bg-paper-2 ${c.estado === 'cancelado' ? 'text-muted' : ''}`}
                    >
                      <td>
                        <button onClick={() => setOpen(expanded ? null : c._id)} className="p-2" aria-label="Ver prendas" aria-expanded={expanded}>
                          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                      <td className="py-3">
                        {cl ? (
                          <button onClick={() => reset(setCliente)(cl)} className="link-grow text-left" title="Filtrar por este cliente">
                            {cl.nombre}
                          </button>
                        ) : (
                          <span className="text-muted">Cliente eliminado</span>
                        )}
                        <span className="block font-mono text-[10px] text-muted">#{c._id.slice(-6)}</span>
                      </td>
                      <td className="text-xs text-muted">{c.createdAt ? new Date(c.createdAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</td>
                      <td>
                        <EstadoSelect compra={c} />
                      </td>
                      <td className={`text-xs ${c.estado === 'cancelado' ? 'line-through' : 'text-pop'}`}>+{c.puntos ?? 0}</td>
                      <td className="text-right font-medium">{formatPrice(c.total)}</td>
                      <td className="text-right">
                        {isAdmin && (
                          <RowActions>
                            <IconButton onClick={() => setDeleting(c)} label="Eliminar compra" danger>
                              <Trash2 className="h-4 w-4" />
                            </IconButton>
                          </RowActions>
                        )}
                      </td>
                    </motion.tr>
                    <AnimatePresence initial={false}>
                      {expanded && (
                        <tr className="border-b border-line bg-paper-2/50">
                          <td colSpan={7} className="p-0">
                            <motion.ul initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden px-12 text-xs">
                              {c.productos.map((l, j) => (
                                <li key={j} className="flex justify-between border-b border-line/60 py-2.5 last:border-0">
                                  <span>
                                    <LineaNombre linea={l} productos={productos} /> · talla {l.talla} × {l.cantidad}
                                  </span>
                                  <span className="text-muted">{l.precio !== undefined ? formatPrice(l.precio * l.cantidad) : ''}</span>
                                </li>
                              ))}
                            </motion.ul>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                )
              })}
            </tbody>
          </table>
          <Pager page={page} total={data.total} limit={LIMIT} onPage={setPage} />
        </div>
      )}

      <AnimatePresence>
        {deleting && (
          <ConfirmDelete
            title={`la compra #${deleting._id.slice(-6)}`}
            endpoint={`/compras/${deleting._id}`}
            warning={deleting.estado !== 'cancelado' ? 'La API devolverá el stock y restará los puntos al cliente.' : undefined}
            onConfirm={() => comprasApi.remove(deleting._id)}
            onClose={() => setDeleting(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
