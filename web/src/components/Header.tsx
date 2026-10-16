import { ShoppingBag, User as UserIcon } from 'lucide-react'
import { useProgress } from '../progress/ProgressContext'
import type { Role } from '../progress/ProgressContext'
import { useStore } from '../store/StoreContext'
import { ProgressBar } from './ProgressPanel'

const ROLE_LABEL: Record<Role, string> = {
  invitado: 'Invitado',
  cliente: 'Cliente',
  trabajador: 'Trabajador',
  encargado: 'Encargado',
}

const NAV = [
  { href: '#catalogo', label: 'Colección' },
  { href: '#auth', label: 'Cuenta' },
  { href: '#crud', label: 'Panel' },
  { href: '#swagger', label: 'API' },
]

export function Header({ onOpenProgress }: { onOpenProgress: () => void }) {
  const { completed, role, setRole } = useProgress()
  const { cart } = useStore()

  const availableRoles: Role[] = [
    'invitado',
    ...(completed >= 3 ? (['cliente'] as Role[]) : []),
    ...(completed >= 4 ? (['trabajador'] as Role[]) : []),
    ...(completed >= 7 ? (['encargado'] as Role[]) : []),
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-fx-line bg-fx-bg/70 font-fx text-fx-text backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <a href="#inicio" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fx-card-2 text-lg font-bold ring-1 ring-white/10">
            <span className="fx-gradient-text">H</span>
          </span>
          <span className="text-xl font-bold tracking-[0.2em]">HILO</span>
          <span className="hidden rounded-full border border-fx-line bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-fx-muted sm:inline">
            Backend Quest
          </span>
        </a>

        <nav className="mx-auto hidden gap-1 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="rounded-full px-3.5 py-1.5 text-sm text-fx-muted transition hover:bg-white/5 hover:text-fx-text">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <label className="hidden items-center gap-2 rounded-full border border-fx-line bg-white/5 py-1.5 pl-3 pr-2 text-sm sm:flex">
            <UserIcon className="h-4 w-4 text-fx-muted" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={availableRoles.length < 2}
              className="cursor-pointer bg-transparent text-fx-text outline-none disabled:cursor-default disabled:text-fx-muted"
              aria-label="Ver la tienda como"
            >
              {availableRoles.map((r) => (
                <option key={r} value={r} className="bg-fx-card">
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </label>
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-fx-line bg-white/5">
            <ShoppingBag className="h-4 w-4" />
            {cart.length > 0 && (
              <span className="fx-gradient-bg absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
                {cart.length}
              </span>
            )}
          </span>
          <button
            onClick={onOpenProgress}
            className="flex items-center gap-2 rounded-full border border-fx-line bg-white/5 px-3 py-1.5 text-xs font-semibold lg:hidden"
            aria-label="Ver progreso"
          >
            {completed}/7
            <ProgressBar className="w-10" />
          </button>
        </div>
      </div>
    </header>
  )
}
