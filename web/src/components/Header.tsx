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
  { href: '#auth', label: 'Mi cuenta' },
  { href: '#crud', label: 'Panel' },
  { href: '#swagger', label: 'API' },
]

export function Header({ onOpenProgress }: { onOpenProgress: () => void }) {
  const { completed, role, setRole, editorial } = useProgress()
  const { cart } = useStore()

  const availableRoles: Role[] = [
    'invitado',
    ...(completed >= 3 ? (['cliente'] as Role[]) : []),
    ...(completed >= 4 ? (['trabajador'] as Role[]) : []),
    ...(completed >= 7 ? (['encargado'] as Role[]) : []),
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      {editorial && (
        <div className="overflow-hidden border-b border-line bg-accent py-1.5 text-[10px] uppercase tracking-[0.3em] text-[#141414]">
          <div className="marquee flex w-max gap-12 whitespace-nowrap">
            {Array.from({ length: 2 }, (_, k) => (
              <div key={k} className="flex gap-12">
                {['Edición editorial', 'Envío gratuito desde 50 €', 'Nueva colección Otoño–Invierno', 'Documentado con Swagger', 'Hecho a mano en Madrid'].map((t) => (
                  <span key={t}>{t} ✦</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mx-auto grid h-16 max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-8">
        <nav className="hidden gap-6 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-[11px] uppercase tracking-[0.18em] text-muted hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>
        <a href="#inicio" className="col-start-2 font-display text-2xl tracking-[0.3em] sm:text-4xl sm:tracking-[0.35em]">
          HILO
        </a>
        <div className="col-start-3 flex items-center justify-end gap-3 sm:gap-5">
          <label className="hidden items-center gap-2 sm:flex text-[11px] uppercase tracking-[0.14em] text-muted">
            <UserIcon className="h-4 w-4" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={availableRoles.length < 2}
              className="hidden cursor-pointer bg-transparent uppercase text-ink outline-none disabled:cursor-default disabled:text-muted sm:block"
              aria-label="Ver la tienda como"
            >
              {availableRoles.map((r) => (
                <option key={r} value={r} className="bg-paper text-ink">
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </label>
          <span className="relative">
            <ShoppingBag className="h-5 w-5" />
            {cart.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] text-paper">
                {cart.length}
              </span>
            )}
          </span>
          <button
            onClick={onOpenProgress}
            className="flex items-center gap-2 border border-line px-2.5 py-1.5 text-[11px] lg:hidden"
            aria-label="Ver progreso"
          >
            <span className="font-medium">{completed}/7</span>
            <ProgressBar className="w-10" />
          </button>
        </div>
      </div>
    </header>
  )
}
