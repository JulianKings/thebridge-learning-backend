import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LayoutDashboard, Lock, Receipt, Shield, Shirt, Terminal, Truck, UserCog, Users } from 'lucide-react'
import { useState, useSyncExternalStore } from 'react'
import { requestLog } from '../../api/client'
import { useAuth } from '../AuthContext'
import { shopHref } from '../router'
import { Compras } from './Compras'
import { MethodBadge } from './kit'
import { Personas } from './Personas'
import { Prendas } from './Prendas'
import { Proveedores } from './Proveedores'
import { Resumen } from './Resumen'

const SECTIONS = [
  { key: 'resumen', label: 'Resumen', endpoint: 'dashboard', icon: LayoutDashboard },
  { key: 'prendas', label: 'Prendas', endpoint: '/ropa', icon: Shirt },
  { key: 'compras', label: 'Compras', endpoint: '/compras', icon: Receipt },
  { key: 'proveedores', label: 'Proveedores', endpoint: '/proveedores', icon: Truck },
  { key: 'clientes', label: 'Clientes', endpoint: '/clientes', icon: Users, admin: true },
  { key: 'empleados', label: 'Empleados', endpoint: '/empleados', icon: UserCog, admin: true },
  { key: 'administradores', label: 'Administradores', endpoint: '/administradores', icon: Shield, admin: true },
] as const

type SectionKey = (typeof SECTIONS)[number]['key']

const statusColor = (s: number) => (s === 0 || s >= 500 ? 'text-rose-400' : s >= 400 ? 'text-amber-400' : 'text-emerald-400')

// Every call the site makes goes through api/client, which records it here.
function Console() {
  const log = useSyncExternalStore(requestLog.subscribe, requestLog.get)
  const [open, setOpen] = useState(false)
  const last = log[0]
  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(460px,calc(100vw-2rem))] font-mono text-[11px]">
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 12, height: 0 }}
            className="mb-2 max-h-72 overflow-y-auto bg-[#111] p-3 text-white/80 shadow-2xl"
          >
            {!log.length && <li className="text-white/40">Aún no hay llamadas.</li>}
            {log.map((e) => (
              <motion.li key={e.id} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 py-1">
                <MethodBadge method={e.method} />
                <span className="min-w-0 flex-1 truncate" title={e.path}>
                  {e.path}
                </span>
                <span className={statusColor(e.status)}>{e.status || 'ERR'}</span>
                <span className="w-12 text-right text-white/40">{e.ms} ms</span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="ml-auto flex items-center gap-3 bg-[#111] px-4 py-2.5 text-white shadow-xl transition-transform hover:-translate-y-0.5"
        aria-expanded={open}
      >
        <Terminal className="h-4 w-4 text-pop" />
        <span className="hidden sm:inline">API</span>
        {last ? (
          <motion.span key={last.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex min-w-0 items-center gap-2">
            <span className="text-white/60">{last.method}</span>
            <span className="max-w-40 truncate">{last.path}</span>
            <span className={statusColor(last.status)}>{last.status || 'ERR'}</span>
          </motion.span>
        ) : (
          <span className="text-white/40">sin llamadas</span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? '' : 'rotate-180'}`} />
      </button>
    </div>
  )
}

export function Gestion({ section, id }: { section?: string; id?: string }) {
  const { isAdmin, rol } = useAuth()
  const current: SectionKey = SECTIONS.some((s) => s.key === section) ? (section as SectionKey) : 'resumen'

  return (
    <div className="mx-auto grid max-w-[1500px] gap-8 px-4 pb-28 pt-8 sm:px-8 lg:grid-cols-[230px_1fr]">
      <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:self-start lg:px-0" aria-label="Secciones de gestión">
        <p className="eyebrow mb-3 hidden lg:block">Panel · {rol}</p>
        {SECTIONS.map((s) => {
          const active = current === s.key
          const locked = 'admin' in s && s.admin && !isAdmin
          const Icon = s.icon
          return (
            <a
              key={s.key}
              href={shopHref(`gestion/${s.key}`)}
              className={`relative flex shrink-0 items-center gap-3 px-3 py-2.5 text-sm transition-colors ${active ? 'text-paper' : 'text-muted hover:text-ink'}`}
            >
              {active && <motion.span layoutId="gestion-active" className="absolute inset-0 bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <Icon className={`relative h-4 w-4 ${active ? 'text-pop' : ''}`} />
              <span className="relative flex-1 whitespace-nowrap">
                {s.label}
                <span className={`hidden font-mono text-[10px] lg:block ${active ? 'text-paper/50' : 'text-muted/70'}`}>{s.endpoint}</span>
              </span>
              {locked && <Lock className="relative h-3.5 w-3.5" />}
            </a>
          )
        })}
      </nav>

      <motion.section key={current} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="min-w-0">
        {current === 'resumen' && <Resumen />}
        {current === 'prendas' && <Prendas editId={id} />}
        {current === 'compras' && <Compras />}
        {current === 'proveedores' && <Proveedores />}
        {(current === 'clientes' || current === 'empleados' || current === 'administradores') && <Personas key={current} coleccion={current} />}
      </motion.section>

      <Console />
    </div>
  )
}
