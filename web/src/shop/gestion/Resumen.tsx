import { motion } from 'framer-motion'
import { AlertTriangle, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '../../api/hooks'
import { ESTADOS, comprasApi, personasApi } from '../../compras/api'
import type { Compra } from '../../compras/api'
import { ESTADO_STYLE, EstadoBadge } from '../../compras/Estado'
import { formatPrice } from '../../data/mock'
import { CHECK_EVENT } from '../../levels/levels'
import { ropaApi } from '../../ropa/api'
import { ProductoImage } from '../../ropa/ProductoImage'
import { stockTotal, titulo } from '../../ropa/types'
import type { Producto } from '../../ropa/types'
import { useAuth } from '../AuthContext'
import { CountUp } from '../motion'
import { shopHref } from '../router'
import { ErrorBox } from '../ui'

const DIAS = 14
const dia = (d: Date) => d.toISOString().slice(0, 10)
const euros = (n: number) => formatPrice(n)

function Kpi({ label, value, format, sub, endpoint, delay }: {
  label: string
  value?: number
  format?: (n: number) => string
  sub?: string
  endpoint: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="shine border border-line bg-panel p-5"
    >
      <p className="eyebrow">{label}</p>
      <p className="mt-3 font-display text-4xl sm:text-5xl">{value === undefined ? '—' : <CountUp value={value} format={format} />}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
      <p className="mt-4 font-mono text-[10px] text-muted">{endpoint}</p>
    </motion.div>
  )
}

function VentasChart({ compras }: { compras: Compra[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const hoy = new Date()
  const serie = Array.from({ length: DIAS }, (_, i) => {
    const d = new Date(hoy)
    d.setDate(hoy.getDate() - (DIAS - 1 - i))
    const key = dia(d)
    const delDia = compras.filter((c) => c.createdAt && dia(new Date(c.createdAt)) === key)
    return { key, label: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), total: delDia.reduce((s, c) => s + c.total, 0), pedidos: delDia.length }
  })
  const max = Math.max(...serie.map((s) => s.total), 1)

  return (
    <div className="border border-line bg-panel p-5">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-2xl">Ventas de los últimos {DIAS} días</p>
        <p className="text-xs text-muted">sin compras canceladas</p>
      </div>
      <div className="relative mt-6 h-48">
        <div className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
        <span className="absolute -top-2.5 right-0 bg-panel pl-2 text-[10px] text-muted">{euros(max)}</span>
        <div className="absolute inset-0 flex items-end gap-0.5 border-b border-line" role="img" aria-label={`Ventas por día de los últimos ${DIAS} días`}>
          {serie.map((s, i) => (
            <div
              key={s.key}
              className="relative flex h-full flex-1 items-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <motion.div
                className={`w-full rounded-t-[4px] transition-colors ${hover === i ? 'bg-pop' : 'bg-ink'}`}
                initial={{ height: 0 }}
                animate={{ height: `${(s.total / max) * 100}%` }}
                transition={{ delay: 0.2 + i * 0.03, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{ minHeight: s.total ? 3 : 0 }}
              />
              {hover === i && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap bg-ink px-3 py-2 text-xs text-paper shadow-lg">
                  <p className="text-paper/70">{s.label}</p>
                  <p className="font-medium">{euros(s.total)}</p>
                  <p className="text-paper/70">
                    {s.pedidos} pedido{s.pedidos === 1 ? '' : 's'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted">
        <span>{serie[0].label}</span>
        <span>{serie[Math.floor(DIAS / 2)].label}</span>
        <span>Hoy</span>
      </div>
      <table className="sr-only">
        <caption>Ventas por día</caption>
        <tbody>
          {serie.map((s) => (
            <tr key={s.key}>
              <th>{s.label}</th>
              <td>{euros(s.total)}</td>
              <td>{s.pedidos} pedidos</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EstadosBar({ compras }: { compras: Compra[] }) {
  const counts = ESTADOS.map((e) => ({ e, n: compras.filter((c) => (c.estado ?? 'pendiente') === e).length }))
  const total = Math.max(compras.length, 1)
  return (
    <div className="border border-line bg-panel p-5">
      <p className="font-display text-2xl">Pedidos por estado</p>
      <div className="mt-5 flex h-3 gap-0.5 overflow-hidden rounded-full">
        {counts
          .filter((c) => c.n)
          .map((c, i) => (
            <motion.div
              key={c.e}
              className={ESTADO_STYLE[c.e].chip.split(' ')[0]}
              initial={{ width: 0 }}
              animate={{ width: `${(c.n / total) * 100}%` }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
              title={`${ESTADO_STYLE[c.e].label}: ${c.n}`}
            />
          ))}
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-3 text-sm">
        {counts.map((c) => (
          <li key={c.e} className="flex items-center justify-between gap-2">
            <EstadoBadge estado={c.e} />
            <span className="font-medium">{c.n}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MasVendidas({ compras, prendas }: { compras: Compra[]; prendas: Producto[] }) {
  const unidades = new Map<string, number>()
  for (const c of compras) {
    for (const l of c.productos) {
      const id = typeof l.producto === 'object' ? l.producto._id : l.producto
      unidades.set(id, (unidades.get(id) ?? 0) + l.cantidad)
    }
  }
  const top = [...unidades.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, n]) => ({ p: prendas.find((x) => x._id === id), n, id }))
  const max = Math.max(...top.map((t) => t.n), 1)

  return (
    <div className="border border-line bg-panel p-5">
      <p className="font-display text-2xl">Más vendidas</p>
      {!top.length ? (
        <p className="mt-4 text-sm text-muted">Aún no hay ventas.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {top.map(({ p, n, id }, i) => (
            <li key={id} className="flex items-center gap-3 text-sm">
              {p ? <ProductoImage tipo={p.tipo} foto={p.foto} seed={p._id} className="h-10 w-8 shrink-0" /> : <span className="h-10 w-8 shrink-0 bg-paper-2" />}
              <div className="min-w-0 flex-1">
                <p className="truncate">{p ? titulo(p) : 'Prenda eliminada'}</p>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-paper-2">
                  <motion.div className="h-full rounded-full bg-ink" initial={{ width: 0 }} animate={{ width: `${(n / max) * 100}%` }} transition={{ delay: 0.3 + i * 0.08, duration: 0.7 }} />
                </div>
              </div>
              <span className="w-12 text-right text-xs text-muted">{n} ud</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function StockBajo({ prendas }: { prendas: Producto[] }) {
  const bajas = prendas.filter((p) => p.disponible && stockTotal(p) < 5).slice(0, 6)
  return (
    <div className="border border-line bg-panel p-5">
      <p className="flex items-center gap-2 font-display text-2xl">
        Stock bajo {bajas.length > 0 && <AlertTriangle className="h-5 w-5 text-pop" />}
      </p>
      {!bajas.length ? (
        <p className="mt-4 text-sm text-muted">Todo el catálogo disponible tiene stock suficiente.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line text-sm">
          {bajas.map((p) => (
            <li key={p._id}>
              <a href={shopHref(`gestion/prendas/${p._id}`)} className="group flex items-center justify-between py-2.5">
                <span className="truncate">{titulo(p)}</span>
                <span className="flex items-center gap-2 text-xs text-bad">
                  {stockTotal(p)} ud <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Resumen() {
  const { isAdmin, usuario, rol } = useAuth()
  const { data: compras, error } = useQuery(() => comprasApi.todas(), [])
  const { data: prendasRaw } = useQuery(() => ropaApi.list(), [])
  const { data: clientes } = useQuery(() => (isAdmin ? personasApi('clientes').page({ limit: 1 }) : Promise.resolve(null)), [isAdmin])
  const prendas = (prendasRaw ?? []).filter((p) => p.evento !== CHECK_EVENT)
  const validas = (compras ?? []).filter((c) => c.estado !== 'cancelado')
  const ingresos = validas.reduce((s, c) => s + c.total, 0)
  const puntos = validas.reduce((s, c) => s + (c.puntos ?? 0), 0)
  const pendientes = validas.filter((c) => (c.estado ?? 'pendiente') === 'pendiente').length

  return (
    <>
      <div className="mb-8">
        <p className="eyebrow">Gestión · {rol}</p>
        <h1 className="mt-1 font-display text-5xl">
          Hola, <em className="text-pop">{usuario?.nombre.split(' ')[0]}</em>
        </h1>
        <p className="mt-2 text-sm text-muted">Así va la tienda ahora mismo, con datos de la API.</p>
      </div>
      {error && <ErrorBox error={error} className="mb-6" />}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Ingresos" value={compras ? ingresos : undefined} format={euros} sub={`${validas.length} pedidos`} endpoint="GET /compras" delay={0} />
        <Kpi label="Pendientes" value={compras ? pendientes : undefined} sub="por enviar" endpoint="?estado=pendiente" delay={0.06} />
        <Kpi label="Puntos emitidos" value={compras ? puntos : undefined} sub="1 por euro" endpoint="Compra.puntos" delay={0.12} />
        {isAdmin ? (
          <Kpi label="Clientes" value={clientes?.total} sub="registrados" endpoint="X-Total-Count de /clientes" delay={0.18} />
        ) : (
          <Kpi label="Prendas" value={prendasRaw ? prendas.length : undefined} sub="en catálogo" endpoint="GET /ropa" delay={0.18} />
        )}
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[2fr_1fr]">
        <VentasChart compras={validas} />
        <EstadosBar compras={compras ?? []} />
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <MasVendidas compras={validas} prendas={prendas} />
        <StockBajo prendas={prendas} />
        <div className="border border-line bg-panel p-5">
          <p className="font-display text-2xl">Últimos pedidos</p>
          <ul className="mt-4 divide-y divide-line text-sm">
            {(compras ?? []).slice(0, 5).map((c) => (
              <li key={c._id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate">{typeof c.cliente === 'object' && c.cliente ? c.cliente.nombre : 'Cliente eliminado'}</span>
                  <span className="text-xs text-muted">{formatPrice(c.total)}</span>
                </span>
                <EstadoBadge estado={c.estado} />
              </li>
            ))}
          </ul>
          <a href={shopHref('gestion/compras')} className="link-grow mt-4 inline-block text-[11px] uppercase tracking-[0.18em]">
            Ver todas
          </a>
        </div>
      </div>
    </>
  )
}
