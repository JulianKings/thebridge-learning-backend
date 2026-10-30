import { AnimatePresence, motion } from 'framer-motion'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useQuery } from '../../api/hooks'
import { formatPrice } from '../../data/mock'
import { CHECK_EVENT } from '../../levels/levels'
import { ropaApi } from '../../ropa/api'
import type { OrdenRopa } from '../../ropa/api'
import { ProductoEditor } from '../../ropa/ProductoEditor'
import { ProductoImage } from '../../ropa/ProductoImage'
import { GRUPOS, GRUPO_SLUG, nombreProveedor, precioFinal, stockTotal, titulo } from '../../ropa/types'
import type { Producto } from '../../ropa/types'
import { shopHref } from '../router'
import { ErrorBox } from '../ui'
import {
  ConfirmDelete, Empty, IconButton, NewButton, Pager, RowActions, SearchInput, Select, SectionHeader, SortHeader, TableSkeleton,
  Toolbar, useDebounced,
} from './kit'

const LIMIT = 10
const STOCK_BAJO = 5

export function Prendas({ editId }: { editId?: string }) {
  const [q, setQ] = useState('')
  const [grupo, setGrupo] = useState('')
  const [estado, setEstado] = useState('')
  const [orden, setOrden] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Producto | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Producto | null>(null)
  const qDebounced = useDebounced(q)
  const query = {
    q: qDebounced,
    grupo: grupo || undefined,
    oferta: estado === 'oferta' || undefined,
    disponible: estado === 'disponible' ? true : estado === 'retirada' ? false : undefined,
    orden: (orden || undefined) as OrdenRopa | undefined,
    page,
    limit: LIMIT,
  }
  const { data, error, loading } = useQuery(() => ropaApi.page(query), [JSON.stringify(query)])
  const { data: proveedores = [] } = useQuery(() => ropaApi.proveedores(), [])
  const reset = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v)
    setPage(1)
  }

  useEffect(() => {
    if (editId) ropaApi.get(editId).then(setEditing, () => undefined)
  }, [editId])

  const prendas = (data?.items ?? []).filter((p) => p.evento !== CHECK_EVENT)

  return (
    <>
      <SectionHeader
        eyebrow="Gestión · ropa"
        title="Prendas"
        endpoint="/ropa"
        methods={(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const).map((m) => ({ method: m, allowed: true }))}
        action={<NewButton onClick={() => setEditing('new')}>Nueva prenda</NewButton>}
      />
      <Toolbar>
        <SearchInput value={q} onChange={reset(setQ)} placeholder="Tipo, temporada o evento" />
        <Select
          label="Grupo"
          value={grupo}
          onChange={reset(setGrupo)}
          options={[{ value: '', label: 'Todos' }, ...GRUPOS.map((g) => ({ value: GRUPO_SLUG[g], label: g }))]}
        />
        <Select
          label="Estado"
          value={estado}
          onChange={reset(setEstado)}
          options={[
            { value: '', label: 'Todas' },
            { value: 'disponible', label: 'Disponibles' },
            { value: 'retirada', label: 'No disponibles' },
            { value: 'oferta', label: 'En oferta' },
          ]}
        />
      </Toolbar>

      {error ? (
        <ErrorBox error={error} />
      ) : !data ? (
        <TableSkeleton />
      ) : !prendas.length ? (
        <Empty>No hay prendas que coincidan.</Empty>
      ) : (
        <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="eyebrow border-b border-line">
                <SortHeader label="Prenda" field="tipo" orden={orden} onOrden={reset(setOrden)} />
                <th className="py-3 font-normal">Proveedor</th>
                <SortHeader label="Precio" field="precio" orden={orden} onOrden={reset(setOrden)} />
                <th className="py-3 font-normal">Stock</th>
                <SortHeader label="Alta" field="createdAt" orden={orden} onOrden={reset(setOrden)} />
                <th />
              </tr>
            </thead>
            <tbody>
              {prendas.map((p, i) => {
                const stock = stockTotal(p)
                return (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group border-b border-line transition-colors hover:bg-paper-2"
                  >
                    <td className="py-2.5">
                      <div className="flex items-center gap-3">
                        <ProductoImage tipo={p.tipo} foto={p.foto} seed={p._id} className="h-14 w-10 shrink-0 transition-transform duration-500 group-hover:scale-110" />
                        <span>
                          {titulo(p)}
                          <span className="block text-xs text-muted">
                            {p.evento ?? ''}
                            {!p.disponible && <span className="text-bad"> · No disponible</span>}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="text-muted">{nombreProveedor(p, proveedores) ?? '—'}</td>
                    <td>
                      {formatPrice(precioFinal(p))}
                      {p.descuento > 0 && <span className="ml-1.5 rounded-full bg-pop px-1.5 py-0.5 text-[10px] text-white">-{p.descuento}%</span>}
                    </td>
                    <td>
                      <span className={stock < STOCK_BAJO ? 'font-medium text-bad' : ''}>{stock} ud</span>
                      <div className="mt-1 flex gap-0.5" aria-hidden="true">
                        {p.talla.map((t) => (
                          <span
                            key={t.talla_tipo}
                            title={`${t.talla_tipo}: ${t.talla_stock}`}
                            className={`h-1.5 w-3 rounded-sm ${t.talla_stock === 0 ? 'bg-bad/40' : t.talla_stock < STOCK_BAJO ? 'bg-pop' : 'bg-ink/70'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="text-xs text-muted">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-ES') : '—'}</td>
                    <td className="text-right">
                      <RowActions>
                        <a href={shopHref(`p/${p._id}`)} className="rounded-full p-2 hover:bg-paper-2 hover:text-ink" aria-label="Ver en la tienda">
                          <Eye className="h-4 w-4" />
                        </a>
                        <IconButton onClick={() => setEditing(p)} label={`Editar ${titulo(p)}`}>
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        <IconButton onClick={() => setDeleting(p)} label={`Eliminar ${titulo(p)}`} danger>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </RowActions>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
          <Pager page={page} total={data.total} limit={LIMIT} onPage={setPage} />
        </div>
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
        {deleting && (
          <ConfirmDelete
            title={titulo(deleting)}
            endpoint={`/ropa/${deleting._id}`}
            onConfirm={() => ropaApi.remove(deleting._id)}
            onClose={() => setDeleting(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
