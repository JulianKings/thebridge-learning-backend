import { useQuery } from '../../api/hooks'
import { authApi } from '../../auth/api'
import { comprasApi } from '../../compras/api'
import { formatPrice } from '../../data/mock'
import { ropaApi } from '../../ropa/api'
import { useAuth } from '../AuthContext'
import { navigate, shopHref } from '../router'
import { ErrorBox, btnGhost } from '../ui'
import { LineaNombre } from './Checkout'

const fecha = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

function MisCompras() {
  const { data, error, loading } = useQuery(() => comprasApi.mias(), [])
  const { data: productos } = useQuery(() => ropaApi.list(), [])

  if (error) return <ErrorBox error={error} className="mt-6" />
  if (loading && !data) return <p className="mt-6 text-sm text-muted">Cargando…</p>
  if (!data?.length) {
    return (
      <p className="mt-6 text-sm text-muted">
        Aún no has hecho ninguna compra.{' '}
        <a href={shopHref('c/todo')} className="underline underline-offset-4">
          Descubre la colección
        </a>
      </p>
    )
  }
  return (
    <ul className="mt-6 divide-y divide-line border-y border-line">
      {data.map((c) => (
        <li key={c._id} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-10">
          <div>
            <p className="text-sm">
              Compra <span className="font-mono text-xs">{c._id.slice(-6)}</span> <span className="text-muted">· {fecha(c.createdAt)}</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              {c.productos.map((l, i) => (
                <span key={i}>
                  {i > 0 && ', '}
                  <LineaNombre linea={l} productos={productos} /> ({l.talla} × {l.cantidad})
                </span>
              ))}
            </p>
          </div>
          <span className="text-xs text-muted">{c.puntos ? `+${c.puntos} puntos` : ''}</span>
          <span className="text-sm">{formatPrice(c.total)}</span>
        </li>
      ))}
    </ul>
  )
}

export function Account() {
  const { usuario, rol, isStaff } = useAuth()
  if (!usuario) return null

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="eyebrow">Mi cuenta · {rol}</p>
          <h1 className="mt-2 font-display text-5xl">Hola, {usuario.nombre.split(' ')[0]}</h1>
          <p className="mt-2 text-sm text-muted">
            {usuario.email}
            {usuario.cargo && ` · ${usuario.cargo}`}
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
              authApi.logout()
              navigate()
            }}
            className={btnGhost}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {rol === 'cliente' && (
        <>
          <div className="mt-10 flex items-baseline gap-3">
            <span className="font-display text-6xl">{usuario.puntos ?? 0}</span>
            <span className="eyebrow">puntos acumulados</span>
          </div>
          <h2 className="mt-12 font-display text-3xl">Mis compras</h2>
          <MisCompras />
        </>
      )}
    </div>
  )
}
