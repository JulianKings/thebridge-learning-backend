import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '../../api/hooks'
import { proveedoresApi } from '../../ropa/api'
import type { Proveedor } from '../../ropa/types'
import { useAuth } from '../AuthContext'
import { ErrorBox } from '../ui'
import {
  ConfirmDelete, Empty, IconButton, NewButton, Pager, RecordDrawer, RowActions, SearchInput, Select, SectionHeader, SortHeader,
  TableSkeleton, Toolbar, useDebounced,
} from './kit'
import type { FieldDef } from './kit'

const DIVISAS = ['EUR', 'USD', 'GBP', 'KRW', 'CNY', 'JPY'] as const
const LIMIT = 8

const FIELDS: FieldDef[] = [
  { key: 'nombreComercial', label: 'Nombre comercial', required: true, wide: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'telefono', label: 'Teléfono', type: 'number', required: true, hint: '9 dígitos, empieza por 6, 7, 8 o 9' },
  { key: 'web', label: 'Web', required: true, hint: 'https://…' },
  { key: 'cp', label: 'Código postal', required: true },
  { key: 'tipoProducto', label: 'Tipos de producto', type: 'tags', required: true, wide: true, hint: 'Separados por comas' },
  { key: 'divisa', label: 'Divisa', type: 'select', options: DIVISAS, required: true },
  { key: 'descuentosVolumen', label: 'Descuento por volumen (%)', type: 'number', required: true },
  { key: 'condicionesPago', label: 'Condiciones de pago', required: true },
  { key: 'condicionesDevolucion', label: 'Condiciones de devolución', required: true },
]

export function Proveedores() {
  const { isAdmin } = useAuth()
  const [q, setQ] = useState('')
  const [divisa, setDivisa] = useState('')
  const [orden, setOrden] = useState('nombreComercial')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Proveedor | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Proveedor | null>(null)
  const qDebounced = useDebounced(q)
  const query = { q: qDebounced, divisa, orden, page, limit: LIMIT }
  const { data, error, loading } = useQuery(() => proveedoresApi.page(query), [JSON.stringify(query)])
  const setFilter = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v)
    setPage(1)
  }

  return (
    <>
      <SectionHeader
        eyebrow="Gestión · proveedores"
        title="Proveedores"
        endpoint="/proveedores"
        methods={[
          { method: 'GET', allowed: true },
          ...(['POST', 'PUT', 'PATCH', 'DELETE'] as const).map((m) => ({ method: m, allowed: isAdmin })),
        ]}
        action={isAdmin && <NewButton onClick={() => setEditing('new')}>Nuevo proveedor</NewButton>}
      />
      {!isAdmin && (
        <p className="mb-5 border-l-2 border-pop bg-pop-soft px-4 py-3 text-sm">Puedes consultar los proveedores; crearlos, editarlos o borrarlos es cosa de un administrador.</p>
      )}
      <Toolbar>
        <SearchInput value={q} onChange={setFilter(setQ)} placeholder="Nombre o email" />
        <Select label="Divisa" value={divisa} onChange={setFilter(setDivisa)} options={[{ value: '', label: 'Todas' }, ...DIVISAS.map((d) => ({ value: d, label: d }))]} />
      </Toolbar>

      {error ? (
        <ErrorBox error={error} />
      ) : !data ? (
        <TableSkeleton />
      ) : !data.items.length ? (
        <Empty>No hay proveedores que coincidan.</Empty>
      ) : (
        <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="eyebrow border-b border-line">
                <SortHeader label="Proveedor" field="nombreComercial" orden={orden} onOrden={setFilter(setOrden)} />
                <th className="py-3 font-normal">Productos</th>
                <SortHeader label="Divisa" field="divisa" orden={orden} onOrden={setFilter(setOrden)} />
                <SortHeader label="Volumen" field="descuentosVolumen" orden={orden} onOrden={setFilter(setOrden)} />
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((p, i) => (
                <motion.tr
                  key={p._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group border-b border-line transition-colors hover:bg-paper-2"
                >
                  <td className="py-3">
                    {p.nombreComercial}
                    <span className="block text-xs text-muted">
                      {p.email} · {p.condicionesPago}
                    </span>
                  </td>
                  <td>
                    <div className="flex max-w-64 flex-wrap gap-1">
                      {p.tipoProducto.slice(0, 3).map((t) => (
                        <span key={t} className="rounded-full bg-paper-2 px-2 py-0.5 text-[11px] text-muted">
                          {t}
                        </span>
                      ))}
                      {p.tipoProducto.length > 3 && <span className="text-[11px] text-muted">+{p.tipoProducto.length - 3}</span>}
                    </div>
                  </td>
                  <td className="font-mono text-xs">{p.divisa}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="relative h-1 w-16 overflow-hidden rounded-full bg-paper-2">
                        <span className="absolute inset-y-0 left-0 bg-pop" style={{ width: `${(p.descuentosVolumen / 90) * 100}%` }} />
                      </span>
                      <span className="text-xs">{p.descuentosVolumen}%</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <RowActions>
                      <a href={p.web} target="_blank" rel="noreferrer" className="rounded-full p-2 hover:bg-paper-2 hover:text-ink" aria-label={`Web de ${p.nombreComercial}`}>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      {isAdmin && (
                        <>
                          <IconButton onClick={() => setEditing(p)} label={`Editar ${p.nombreComercial}`}>
                            <Pencil className="h-4 w-4" />
                          </IconButton>
                          <IconButton onClick={() => setDeleting(p)} label={`Eliminar ${p.nombreComercial}`} danger>
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </>
                      )}
                    </RowActions>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <Pager page={page} total={data.total} limit={LIMIT} onPage={setPage} />
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <RecordDrawer
            key={editing === 'new' ? 'new' : editing._id}
            title={editing === 'new' ? 'Nuevo proveedor' : `Editar ${editing.nombreComercial}`}
            fields={FIELDS}
            record={editing === 'new' ? undefined : editing}
            endpoint={editing === 'new' ? '/proveedores' : `/proveedores/${editing._id}`}
            onSave={(body) => (editing === 'new' ? proveedoresApi.create(body as Omit<Proveedor, '_id'>) : proveedoresApi.update(editing._id, body))}
            onClose={() => setEditing(null)}
          />
        )}
        {deleting && (
          <ConfirmDelete
            title={deleting.nombreComercial}
            endpoint={`/proveedores/${deleting._id}`}
            warning="Las prendas de este proveedor seguirán apuntando a su id."
            onConfirm={() => proveedoresApi.remove(deleting._id)}
            onClose={() => setDeleting(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
