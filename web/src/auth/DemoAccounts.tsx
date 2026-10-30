import { motion } from 'framer-motion'
import { ArrowRight, Loader2, ShieldCheck, ShoppingBag, Wrench } from 'lucide-react'
import { useState } from 'react'
import { toast, toastError } from '../shop/ui'
import { authApi } from './api'
import type { Rol } from './api'
import { DEMO_ACCOUNTS } from './demo'

const ICONS: Record<Rol, typeof ShoppingBag> = { cliente: ShoppingBag, empleado: Wrench, administrador: ShieldCheck }

export function DemoAccounts({ onLogin }: { onLogin?: (rol: Rol) => void }) {
  const [busy, setBusy] = useState<Rol | null>(null)

  const login = async (rol: Rol, email: string, password: string) => {
    setBusy(rol)
    try {
      await authApi.login(email, password)
      toast(`Sesión iniciada como ${rol}`)
      onLogin?.(rol)
    } catch (err) {
      toastError(err)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {DEMO_ACCOUNTS.map((a, i) => {
        const Icon = ICONS[a.rol]
        return (
          <motion.button
            key={a.rol}
            type="button"
            disabled={!!busy}
            onClick={() => login(a.rol, a.email, a.password)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            className="shine group relative flex flex-col border border-line bg-panel p-5 text-left transition-colors hover:border-ink disabled:opacity-60"
          >
            <span className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-paper-2 transition-colors group-hover:bg-pop group-hover:text-white">
                {busy === a.rol ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
              </span>
              <ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </span>
            <span className="mt-4 text-[10px] uppercase tracking-[0.22em] text-pop">{a.rol}</span>
            <span className="mt-1 font-display text-xl">{a.nombre}</span>
            <span className="mt-0.5 truncate font-mono text-[10px] text-muted">{a.email}</span>
            <ul className="mt-3 space-y-1 text-xs text-muted">
              {a.puede.map((p) => (
                <li key={p}>· {p}</li>
              ))}
            </ul>
          </motion.button>
        )
      })}
    </div>
  )
}
