import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Garment } from '../components/Garment'
import { LockedSection } from '../components/LockedSection'
import type { User } from '../data/mock'
import { useProgress } from '../progress/ProgressContext'
import { useStore } from '../store/StoreContext'
import { SectionHeading } from './SectionHeading'

function Supplies() {
  const { role } = useProgress()
  const { products, supplies, toggleSupply } = useStore()
  const [selected, setSelected] = useState(products[0]?.id)
  const product = products.find((p) => p.id === selected) ?? products[0]
  const canEdit = role === 'trabajador' || role === 'encargado'

  return (
    <div>
      <p className="font-display text-2xl">Materiales</p>
      <p className="mt-1 text-sm text-muted">Elige una prenda y vincula los materiales con los que se fabrica.</p>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`shrink-0 border-2 ${p.id === product?.id ? 'border-ink' : 'border-transparent'}`}
            aria-label={p.name}
          >
            <Garment kind={p.kind} tone={p.tone} ink={p.ink} className="h-16 w-12" />
          </button>
        ))}
      </div>
      {product && (
        <>
          <p className="mt-3 text-sm uppercase tracking-wide">{product.name}</p>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {supplies.map((s) => {
              const bound = product.supplies.includes(s.id)
              return (
                <li key={s.id} className="flex items-center gap-4 py-3">
                  <input
                    type="checkbox"
                    checked={bound}
                    disabled={!canEdit}
                    onChange={() => toggleSupply(product.id, s.id)}
                    className="h-4 w-4 accent-[var(--ink)]"
                    aria-label={`Vincular ${s.name}`}
                  />
                  <span className="flex-1 text-sm">
                    {s.name}
                    <span className="block text-xs text-muted">{s.supplier}</span>
                  </span>
                  <span className={`font-mono text-xs ${s.stock < 50 ? 'text-bad' : 'text-muted'}`}>
                    {s.stock} {s.unit}
                  </span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

function Team() {
  const { role } = useProgress()
  const { users, setUserRole, deleteUser } = useStore()
  const isManager = role === 'encargado'

  return (
    <div>
      <p className="font-display text-2xl">Equipo y clientes</p>
      <p className="mt-1 text-sm text-muted">
        {isManager ? 'Como encargado puedes cambiar roles y dar de baja usuarios.' : 'Solo los encargados pueden gestionar usuarios.'}
      </p>
      <ul className="mt-5 divide-y divide-line border-y border-line">
        {users.map((u) => (
          <li key={u.id} className="flex items-center gap-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper-2 text-xs">
              {u.name.split(' ').map((w) => w[0]).join('')}
            </span>
            <span className="min-w-0 flex-1 text-sm">
              {u.name}
              <span className="block truncate text-xs text-muted">{u.email}</span>
            </span>
            <select
              value={u.role}
              disabled={!isManager}
              onChange={(e) => setUserRole(u.id, e.target.value as User['role'])}
              className="bg-transparent text-xs uppercase tracking-wider outline-none disabled:text-muted"
              aria-label={`Rol de ${u.name}`}
            >
              {['cliente', 'trabajador', 'encargado'].map((r) => (
                <option key={r} value={r} className="bg-paper">{r}</option>
              ))}
            </select>
            <button
              disabled={!isManager || u.role === 'encargado'}
              onClick={() => deleteUser(u.id)}
              className="p-1.5 text-muted hover:text-bad disabled:opacity-30"
              aria-label={`Eliminar ${u.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Admin() {
  return (
    <LockedSection level={7} className="px-4 py-16 sm:px-8">
      <SectionHeading level={7} title="Gestión de la tienda" />
      <div className="grid gap-12 lg:grid-cols-2">
        <Supplies />
        <Team />
      </div>
    </LockedSection>
  )
}

export function Finale() {
  const { completed } = useProgress()
  return (
    <footer className="border-t border-line px-4 py-16 text-center sm:px-8">
      {completed >= 7 ? (
        <>
          <p className="eyebrow">7 de 7 niveles</p>
          <p className="mx-auto mt-4 max-w-3xl font-display text-5xl leading-tight sm:text-6xl">
            Esta tienda funciona con <em>vuestro</em> backend.
          </p>
        </>
      ) : (
        <p className="font-display text-2xl text-muted">Faltan {7 - completed} niveles para abrir la tienda al completo.</p>
      )}
      <p className="mt-10 font-display text-xl tracking-[0.35em]">HILO</p>
      <p className="mt-2 text-xs text-muted">Proyecto de aprendizaje · The Bridge</p>
    </footer>
  )
}
