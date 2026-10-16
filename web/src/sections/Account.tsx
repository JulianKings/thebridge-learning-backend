import { useState } from 'react'
import type { FormEvent } from 'react'
import { LockedSection } from '../components/LockedSection'
import { useProgress } from '../progress/ProgressContext'
import { useStore } from '../store/StoreContext'
import { SectionHeading } from './SectionHeading'

const ORDERS = [
  { id: '#10482', date: '02 oct 2026', total: '139,90 €', status: 'Entregado' },
  { id: '#10391', date: '14 sep 2026', total: '49,95 €', status: 'Entregado' },
]

const inputCls = 'w-full border-b border-line bg-transparent py-2.5 text-sm outline-none placeholder:text-muted focus:border-ink'

export function Account() {
  const { role, setRole } = useProgress()
  const { cart } = useStore()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const loggedIn = role !== 'invitado'

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setRole('cliente')
  }

  return (
    <LockedSection level={3} className="px-4 py-16 sm:px-8">
      <SectionHeading level={3} title="Mi cuenta" />
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="max-w-md">
          <div className="flex gap-6">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-1 text-[11px] uppercase tracking-[0.18em] ${tab === t ? 'border-b border-ink' : 'text-muted'}`}
              >
                {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="mt-8 space-y-5">
            {tab === 'register' && <input className={inputCls} placeholder="Nombre" defaultValue="Carlos Vidal" />}
            <input className={inputCls} type="email" placeholder="Email" defaultValue="carlos@correo.es" />
            <input className={inputCls} type="password" placeholder="Contraseña" defaultValue="supersecreta" />
            <button className="w-full bg-ink py-3.5 text-xs uppercase tracking-[0.2em] text-paper hover:opacity-85">
              {tab === 'login' ? 'Entrar' : 'Registrarme'}
            </button>
            <p className="font-mono text-[11px] text-muted">
              POST /api/auth/{tab === 'login' ? 'login' : 'register'}
            </p>
          </form>
        </div>

        <div className="border border-line bg-panel p-6 sm:p-8">
          {loggedIn ? (
            <>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-paper-2 font-display text-xl">CV</div>
                <div>
                  <p className="font-display text-2xl">Hola, Carlos</p>
                  <p className="text-xs text-muted">carlos@correo.es · <span className="uppercase tracking-wider text-ink">{role}</span></p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-3 border-y border-line py-4 text-center">
                {[
                  ['Pedidos', ORDERS.length],
                  ['En la cesta', cart.length],
                  ['Favoritos', 5],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="font-display text-2xl">{v}</p>
                    <p className="eyebrow mt-1">{k}</p>
                  </div>
                ))}
              </div>
              <p className="eyebrow mt-6">Últimos pedidos</p>
              <ul className="mt-2 divide-y divide-line text-sm">
                {ORDERS.map((o) => (
                  <li key={o.id} className="flex justify-between py-3">
                    <span>{o.id} <span className="text-muted">· {o.date}</span></span>
                    <span>{o.total}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => setRole('invitado')} className="mt-4 text-xs text-muted underline underline-offset-4">
                Cerrar sesión
              </button>
            </>
          ) : (
            <div className="flex h-full min-h-60 flex-col items-center justify-center text-center">
              <p className="font-display text-2xl">Bienvenido a HILO</p>
              <p className="mt-2 max-w-xs text-sm text-muted">Inicia sesión para ver tus pedidos y comprar en la tienda.</p>
            </div>
          )}
        </div>
      </div>
    </LockedSection>
  )
}
