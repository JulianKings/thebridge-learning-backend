import { useState } from 'react'
import { useQuery } from '../../api/hooks'
import { api, decodeToken, getToken } from '../../api/client'
import { formatPrice } from '../../data/mock'
import { useAuth } from '../AuthContext'
import { navigate, shopHref } from '../router'
import { ErrorBox, btnGhost } from '../ui'

export function Account() {
  const { user, logout, isStaff } = useAuth()
  const { data: orders, error, loading } = useQuery(() => api.myOrders(), [user?.id])
  const [showToken, setShowToken] = useState(false)

  if (!user) return null

  const token = getToken() ?? ''
  const claims = decodeToken(token)

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="eyebrow">Mi cuenta · {user.role}</p>
          <h1 className="mt-2 font-display text-5xl">Hola, {user.name.split(' ')[0]}</h1>
          <p className="mt-2 text-sm text-muted">
            {user.email} · cliente desde {user.since}
          </p>
        </div>
        <div className="flex gap-3">
          {isStaff && (
            <a href={shopHref('gestion')} className={btnGhost}>
              Ir a gestión
            </a>
          )}
          <button
            onClick={() => {
              logout()
              navigate()
            }}
            className={btnGhost}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <h2 className="mt-12 font-display text-3xl">Mis pedidos</h2>
      {error ? (
        <ErrorBox error={error} className="mt-6" />
      ) : loading && !orders ? (
        <p className="mt-6 text-sm text-muted">Cargando…</p>
      ) : orders?.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          Aún no has hecho ningún pedido.{' '}
          <a href={shopHref('c/todo')} className="underline underline-offset-4">
            Descubre la colección
          </a>
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {orders?.map((o) => (
            <li key={o.id} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-10">
              <div>
                <p className="text-sm">
                  Pedido #{o.id.slice(1)} <span className="text-muted">· {new Date(o.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </p>
                <p className="mt-1 text-xs text-muted">{o.items.map((i) => `${i.name} (${i.size})`).join(', ')}</p>
              </div>
              <span className="text-[11px] uppercase tracking-[0.18em]">{o.status}</span>
              <span className="text-sm">{formatPrice(o.total)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-14">
        <button onClick={() => setShowToken(!showToken)} className="text-xs text-muted underline underline-offset-4">
          {showToken ? 'Ocultar' : 'Ver'} mi token JWT
        </button>
        {showToken && (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <p className="break-all border border-line bg-panel p-4 font-mono text-[11px] leading-relaxed">{token}</p>
            <pre className="overflow-x-auto bg-paper-2 p-4 font-mono text-[11px]">{JSON.stringify(claims, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
