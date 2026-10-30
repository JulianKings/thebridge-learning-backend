import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '../../api/hooks'
import { authApi } from '../../auth/api'
import type { Usuario } from '../../auth/api'
import { personasApi } from '../../compras/api'
import type { Coleccion } from '../../compras/api'
import { formatPrice } from '../../data/mock'
import { useAuth } from '../AuthContext'
import { ErrorBox } from '../ui'
import {
  ConfirmDelete, Empty, IconButton, LockedPanel, NewButton, Pager, RecordDrawer, RowActions, SearchInput, Select, SectionHeader,
  SortHeader, TableSkeleton, Toolbar, useDebounced,
} from './kit'
import type { FieldDef } from './kit'

const GENEROS = ['Mujer', 'Hombre'] as const
const CARGOS = ['reponedor', 'dependiente', 'encargado'] as const
const LIMIT = 8

const base: FieldDef[] = [
  { key: 'nombre', label: 'Nombre', required: true, wide: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'password', label: 'Contraseña', type: 'password', required: true },
  { key: 'fechaNacimiento', label: 'Nacimiento', type: 'date', required: true },
  { key: 'genero', label: 'Género', type: 'select', options: GENEROS, required: true },
]

type Config = {
  title: string
  singular: string
  fields: FieldDef[]
  sortable: { field: string; label: string }[]
  cells: (u: Usuario) => string[]
}

const CONFIG: Record<Coleccion, Config> = {
  clientes: {
    title: 'Clientes',
    singular: 'cliente',
    fields: [
      ...base,
      { key: 'cp', label: 'Código postal', required: true },
      { key: 'puntos', label: 'Puntos', type: 'number' },
      { key: 'afiliado', label: 'Código de afiliado' },
    ],
    sortable: [{ field: 'puntos', label: 'Puntos' }],
    cells: (u) => [`${u.puntos ?? 0} pts`],
  },
  empleados: {
    title: 'Empleados',
    singular: 'empleado',
    fields: [
      ...base,
      { key: 'cp', label: 'Código postal', required: true },
      { key: 'cargo', label: 'Cargo', type: 'select', options: CARGOS, required: true },
      { key: 'salario', label: 'Salario (€)', type: 'number', required: true },
      { key: 'horario', label: 'Horario', required: true, hint: 'Por ejemplo: L-V 9:00-17:00' },
      { key: 'altaSS', label: 'Alta en la Seguridad Social', type: 'date' },
      { key: 'bajaSS', label: 'Baja en la Seguridad Social', type: 'date' },
      { key: 'vacaciones', label: 'De vacaciones', type: 'checkbox' },
    ],
    sortable: [
      { field: 'cargo', label: 'Cargo' },
      { field: 'salario', label: 'Salario' },
    ],
    cells: (u) => [u.cargo ?? '—', u.salario !== undefined ? formatPrice(u.salario) : '—'],
  },
  administradores: {
    title: 'Administradores',
    singular: 'administrador',
    fields: base,
    sortable: [{ field: 'createdAt', label: 'Alta' }],
    cells: (u) => [u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-ES') : '—'],
  },
}

const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function Personas({ coleccion }: { coleccion: Coleccion }) {
  const { isAdmin, rol, usuario } = useAuth()
  const cfg = CONFIG[coleccion]
  const api = personasApi(coleccion)
  const [q, setQ] = useState('')
  const [genero, setGenero] = useState('')
  const [cargo, setCargo] = useState('')
  const [orden, setOrden] = useState('nombre')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Usuario | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Usuario | null>(null)
  const qDebounced = useDebounced(q)
  const query = { q: qDebounced, genero, cargo: coleccion === 'empleados' ? cargo : undefined, orden, page, limit: LIMIT }
  const { data, error, loading } = useQuery(() => (isAdmin ? api.page(query) : Promise.resolve(null)), [coleccion, isAdmin, JSON.stringify(query)])
  const setFilter = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v)
    setPage(1)
  }

  const header = (
    <SectionHeader
      eyebrow={`Gestión · ${coleccion}`}
      title={cfg.title}
      endpoint={`/${coleccion}`}
      methods={(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const).map((m) => ({ method: m, allowed: isAdmin }))}
      action={isAdmin && <NewButton onClick={() => setEditing('new')}>Nuevo {cfg.singular}</NewButton>}
    />
  )
  if (!isAdmin) {
    return (
      <>
        {header}
        <LockedPanel endpoint={`GET /${coleccion}`} rol={rol} />
      </>
    )
  }

  return (
    <>
      {header}
      <Toolbar>
        <SearchInput value={q} onChange={setFilter(setQ)} placeholder="Nombre o email" />
        <Select label="Género" value={genero} onChange={setFilter(setGenero)} options={[{ value: '', label: 'Todos' }, ...GENEROS.map((g) => ({ value: g, label: g }))]} />
        {coleccion === 'empleados' && (
          <Select label="Cargo" value={cargo} onChange={setFilter(setCargo)} options={[{ value: '', label: 'Todos' }, ...CARGOS.map((c) => ({ value: c, label: c }))]} />
        )}
      </Toolbar>

      {error ? (
        <ErrorBox error={error} />
      ) : !data ? (
        <TableSkeleton />
      ) : !data.items.length ? (
        <Empty>No hay {coleccion} que coincidan.</Empty>
      ) : (
        <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="eyebrow border-b border-line">
                <SortHeader label="Nombre" field="nombre" orden={orden} onOrden={setFilter(setOrden)} />
                <SortHeader label="Email" field="email" orden={orden} onOrden={setFilter(setOrden)} />
                {cfg.sortable.map((s) => (
                  <SortHeader key={s.field} label={s.label} field={s.field} orden={orden} onOrden={setFilter(setOrden)} />
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((u, i) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group border-b border-line transition-colors hover:bg-paper-2"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-medium text-paper transition-colors group-hover:bg-pop">
                        {iniciales(u.nombre)}
                      </span>
                      <span>
                        {u.nombre}
                        {u._id === usuario?._id && <span className="ml-2 rounded-full bg-pop-soft px-2 py-0.5 text-[10px] text-pop">tú</span>}
                        {u.vacaciones && <span className="ml-2 rounded-full bg-paper-2 px-2 py-0.5 text-[10px] text-muted">vacaciones</span>}
                      </span>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  {cfg.cells(u).map((c, j) => (
                    <td key={j} className="capitalize">
                      {c}
                    </td>
                  ))}
                  <td className="text-right">
                    <RowActions>
                      <IconButton onClick={() => setEditing(u)} label={`Editar ${u.nombre}`}>
                        <Pencil className="h-4 w-4" />
                      </IconButton>
                      <IconButton onClick={() => setDeleting(u)} label={`Eliminar ${u.nombre}`} danger>
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
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
            title={editing === 'new' ? `Nuevo ${cfg.singular}` : `Editar ${editing.nombre}`}
            fields={cfg.fields}
            record={editing === 'new' ? undefined : editing}
            endpoint={editing === 'new' ? `/${coleccion}` : `/${coleccion}/${editing._id}`}
            onSave={(body) => (editing === 'new' ? api.create(body) : api.update(editing._id, body))}
            onClose={() => setEditing(null)}
          />
        )}
        {deleting && (
          <ConfirmDelete
            title={deleting.nombre}
            endpoint={`/${coleccion}/${deleting._id}`}
            warning={deleting._id === usuario?._id ? 'Es tu propia cuenta: se cerrará tu sesión.' : undefined}
            onConfirm={async () => {
              await api.remove(deleting._id)
              if (deleting._id === usuario?._id) authApi.logout()
            }}
            onClose={() => setDeleting(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
