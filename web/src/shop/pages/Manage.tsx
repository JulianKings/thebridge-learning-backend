import { useId, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useQuery } from '../../api/hooks'
import { aFechaApi } from '../../auth/api'
import type { Genero, Usuario } from '../../auth/api'
import { comprasApi, usuariosApi } from '../../compras/api'
import type { EmpleadoInput } from '../../compras/api'
import { formatPrice } from '../../data/mock'
import { ropaApi } from '../../ropa/api'
import { PrendasPanel } from '../../sections/Backoffice'
import { useAuth } from '../AuthContext'
import { shopHref } from '../router'
import { ErrorBox, btnPrimary, field, toast, toastError } from '../ui'
import { LineaNombre } from './Checkout'

const nombreCliente = (c: string | Usuario) => (typeof c === 'object' && c ? c.nombre : `Cliente ${String(c).slice(-6)}`)

function Loading() {
  return <p className="text-sm text-muted">Cargando…</p>
}

function ComprasTab() {
  const { data, error } = useQuery(() => comprasApi.todas(), [])
  const { data: productos } = useQuery(() => ropaApi.list(), [])
  if (error) return <ErrorBox error={error} />
  if (!data) return <Loading />
  if (!data.length) return <p className="text-sm text-muted">Todavía no hay compras.</p>
  return (
    <ul className="divide-y divide-line border-y border-line">
      {data.map((c) => (
        <li key={c._id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8">
          <div>
            <p className="text-sm">{nombreCliente(c.cliente)}</p>
            <p className="text-xs text-muted">
              {c.productos.map((l, i) => (
                <span key={i}>
                  {i > 0 && ', '}
                  <LineaNombre linea={l} productos={productos} /> ×{l.cantidad}
                </span>
              ))}
            </p>
          </div>
          <span className="text-xs text-muted">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-ES') : ''}</span>
          <span className="text-sm">{formatPrice(c.total)}</span>
        </li>
      ))}
    </ul>
  )
}

function ProveedoresTab() {
  const { data, error } = useQuery(() => ropaApi.proveedores(), [])
  if (error) return <ErrorBox error={error} />
  if (!data) return <Loading />
  return (
    <ul className="divide-y divide-line border-y border-line">
      {data.map((p) => (
        <li key={p._id} className="grid gap-2 py-4 text-sm sm:grid-cols-[2fr_2fr_1fr_1fr]">
          <span>
            {p.nombreComercial}
            <span className="block text-xs text-muted">{p.email}</span>
          </span>
          <span className="text-xs text-muted">{p.condicionesPago}</span>
          <span className="text-xs">{p.divisa}</span>
          <span className="text-xs text-muted">{p.descuentosVolumen}% por volumen</span>
        </li>
      ))}
    </ul>
  )
}

function ClientesTab() {
  const { data, error } = useQuery(() => usuariosApi.clientes(), [])
  if (error) return <ErrorBox error={error} />
  if (!data) return <Loading />
  return (
    <ul className="divide-y divide-line border-y border-line">
      {data.map((c) => (
        <li key={c._id} className="flex items-center gap-4 py-4 text-sm">
          <span className="min-w-0 flex-1">
            {c.nombre}
            <span className="block truncate text-xs text-muted">{c.email}</span>
          </span>
          <span className="text-xs text-muted">CP {c.cp}</span>
          <span className="w-24 text-right">{c.puntos ?? 0} puntos</span>
        </li>
      ))}
    </ul>
  )
}

function Field({ label, children }: { label: string; children: (id: string) => ReactNode }) {
  const id = useId()
  return (
    <div className="text-[11px] text-muted">
      <label htmlFor={id}>{label}</label>
      {children(id)}
    </div>
  )
}

const CARGOS = ['reponedor', 'dependiente', 'encargado'] as const
const nuevoEmpleado = (): EmpleadoInput => ({
  nombre: '',
  email: '',
  password: '',
  fechaNacimiento: '',
  genero: 'Mujer',
  cp: '',
  cargo: 'dependiente',
  salario: 1300,
  horario: 'L-V 9:00-17:00',
})

function EmpleadoForm() {
  const [e, setE] = useState<EmpleadoInput>(nuevoEmpleado)
  const [busy, setBusy] = useState(false)
  const set = (patch: Partial<EmpleadoInput>) => setE((prev) => ({ ...prev, ...patch }))

  const save = async (ev: FormEvent) => {
    ev.preventDefault()
    setBusy(true)
    try {
      await usuariosApi.crearEmpleado({ ...e, fechaNacimiento: aFechaApi(e.fechaNacimiento ?? '') })
      toast('Empleado creado')
      setE(nuevoEmpleado())
    } catch (err) {
      toastError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="mb-8 grid gap-4 border border-line bg-panel p-5 sm:grid-cols-3">
      <p className="eyebrow sm:col-span-3">Nuevo empleado · POST /empleados</p>
      <Field label="Nombre">{(id) => <input id={id} className={field} value={e.nombre} onChange={(x) => set({ nombre: x.target.value })} />}</Field>
      <Field label="Email">{(id) => <input id={id} type="email" className={field} value={e.email} onChange={(x) => set({ email: x.target.value })} />}</Field>
      <Field label="Contraseña">{(id) => <input id={id} type="password" className={field} value={e.password} onChange={(x) => set({ password: x.target.value })} />}</Field>
      <Field label="Nacimiento">
        {(id) => <input id={id} type="date" className={field} value={e.fechaNacimiento} onChange={(x) => set({ fechaNacimiento: x.target.value })} />}
      </Field>
      <Field label="Género">
        {(id) => (
          <select id={id} className={field} value={e.genero} onChange={(x) => set({ genero: x.target.value as Genero })}>
            <option className="bg-paper">Mujer</option>
            <option className="bg-paper">Hombre</option>
          </select>
        )}
      </Field>
      <Field label="Código postal">{(id) => <input id={id} className={field} value={e.cp} onChange={(x) => set({ cp: x.target.value })} />}</Field>
      <Field label="Cargo">
        {(id) => (
          <select id={id} className={field} value={e.cargo} onChange={(x) => set({ cargo: x.target.value as EmpleadoInput['cargo'] })}>
            {CARGOS.map((c) => (
              <option key={c} className="bg-paper">{c}</option>
            ))}
          </select>
        )}
      </Field>
      <Field label="Salario (€)">
        {(id) => <input id={id} type="number" className={field} value={e.salario} onChange={(x) => set({ salario: Number(x.target.value) })} />}
      </Field>
      <Field label="Horario">{(id) => <input id={id} className={field} value={e.horario} onChange={(x) => set({ horario: x.target.value })} />}</Field>
      <div className="sm:col-span-3">
        <button disabled={busy} className={btnPrimary}>
          {busy ? 'Creando…' : 'Crear empleado'}
        </button>
      </div>
    </form>
  )
}

function EmpleadosTab() {
  const { data, error } = useQuery(() => usuariosApi.empleados(), [])
  if (error) return <ErrorBox error={error} />
  return (
    <>
      <EmpleadoForm />
      {!data ? (
        <Loading />
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {data.map((e) => (
            <li key={e._id} className="flex items-center gap-4 py-4 text-sm">
              <span className="min-w-0 flex-1">
                {e.nombre}
                <span className="block truncate text-xs text-muted">{e.email}</span>
              </span>
              <span className="text-xs text-muted">{e.horario}</span>
              <span className="w-28 text-right text-[11px] uppercase tracking-[0.15em]">{e.cargo}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export function Manage({ tab = 'prendas', id }: { tab?: string; id?: string }) {
  const { isAdmin } = useAuth()
  const tabs = [
    { key: 'prendas', label: 'Prendas' },
    { key: 'compras', label: 'Compras' },
    { key: 'proveedores', label: 'Proveedores' },
    { key: 'clientes', label: isAdmin ? 'Clientes' : 'Clientes 🔒' },
    { key: 'empleados', label: isAdmin ? 'Empleados' : 'Empleados 🔒' },
  ]

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-12 sm:px-8">
      <p className="eyebrow">Panel interno</p>
      <h1 className="mt-2 font-display text-5xl">Gestión de la tienda</h1>
      <nav className="mt-8 flex gap-6 overflow-x-auto border-b border-line">
        {tabs.map((t) => (
          <a
            key={t.key}
            href={shopHref(`gestion/${t.key}`)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-[11px] uppercase tracking-[0.2em] ${tab === t.key ? 'border-ink' : 'border-transparent text-muted hover:text-ink'}`}
          >
            {t.label}
          </a>
        ))}
      </nav>
      <div className="mt-8">
        {tab === 'prendas' && <PrendasPanel editId={id} />}
        {tab === 'compras' && <ComprasTab />}
        {tab === 'proveedores' && <ProveedoresTab />}
        {tab === 'clientes' && <ClientesTab />}
        {tab === 'empleados' && <EmpleadosTab />}
      </div>
    </div>
  )
}
