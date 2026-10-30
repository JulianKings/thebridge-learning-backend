import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { GRUPO_SLUG } from '../ropa/types'
import { useAuth } from './AuthContext'
import { useCart } from './CartContext'
import { navigate, shopHref, useShopQuery, useShopRoute } from './router'

const CATS = [
  { href: `c/${GRUPO_SLUG['Parte de arriba']}`, label: 'Arriba' },
  { href: `c/${GRUPO_SLUG['Parte de abajo']}`, label: 'Abajo' },
  { href: `c/${GRUPO_SLUG.Calzado}`, label: 'Calzado' },
  { href: 'c/todo?oferta=true', label: 'Ofertas', pop: true },
  { href: 'c/todo', label: 'Ver todo' },
]

const link = 'link-grow pb-0.5 text-[11px] uppercase tracking-[0.18em]'

export function ShopHeader() {
  const { usuario, isStaff } = useAuth()
  const { count, setOpen } = useCart()
  const route = useShopRoute()
  const query = useShopQuery()
  const [search, setSearch] = useState(false)
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(false)
  const [hidden, setHidden] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > 160 && y > prev && !menu && !search)
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!q.trim()) return
    navigate(`c/todo?q=${encodeURIComponent(q.trim())}`)
    setSearch(false)
  }

  const active = (href: string) => {
    const [path, qs] = href.split('?')
    return route.slice(0, 2).join('/') === path && (qs ? query.get('oferta') === 'true' : query.get('oferta') !== 'true')
  }

  return (
    <motion.header
      animate={{ y: hidden ? '-100%' : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md"
    >
      <div className="mx-auto grid h-16 max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-8">
        <nav className="flex items-center gap-6">
          <button onClick={() => setMenu(!menu)} className="md:hidden" aria-label="Menú">
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {CATS.map((c) => (
            <a
              key={c.href}
              href={shopHref(c.href)}
              aria-current={active(c.href) ? 'page' : undefined}
              className={`${link} hidden md:inline ${c.pop ? 'text-pop' : ''}`}
            >
              {c.label}
            </a>
          ))}
        </nav>

        <a href={shopHref()} className="group relative whitespace-nowrap font-display text-xl tracking-[0.15em] sm:text-3xl sm:tracking-[0.3em]">
          THEBRIDGE
          <span className="absolute -right-2 top-0 h-1.5 w-1.5 rounded-full bg-pop transition-transform duration-500 group-hover:scale-150 sm:-right-3" />
        </a>

        <div className="flex items-center justify-end gap-5">
          <AnimatePresence mode="wait" initial={false}>
            {search ? (
              <motion.form
                key="form"
                onSubmit={submit}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 overflow-hidden border-b border-ink"
              >
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Busca camisas, botas…"
                  className="w-28 bg-transparent py-1 text-sm outline-none sm:w-48"
                />
                <button type="button" onClick={() => setSearch(false)} aria-label="Cerrar búsqueda">
                  <X className="h-4 w-4" />
                </button>
              </motion.form>
            ) : (
              <motion.button key="btn" onClick={() => setSearch(true)} className={`${link} flex items-center gap-2`} aria-label="Buscar">
                <Search className="h-4 w-4" /> <span className="hidden lg:inline">Buscar</span>
              </motion.button>
            )}
          </AnimatePresence>
          {isStaff && (
            <a href={shopHref('gestion')} aria-current={route[0] === 'gestion' ? 'page' : undefined} className={`${link} hidden sm:inline`}>
              Gestión
            </a>
          )}
          <a href={shopHref(usuario ? 'cuenta' : 'login')} className={`${link} hidden sm:inline`}>
            {usuario ? usuario.nombre.split(' ')[0] : 'Entrar'}
          </a>
          <button onClick={() => setOpen(true)} className="relative flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]" aria-label={`Cesta, ${count} prendas`}>
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cesta</span>
            <motion.span
              key={count}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 14 }}
              className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${count ? 'bg-pop text-white' : 'bg-paper-2 text-muted'}`}
            >
              {count}
            </motion.span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line md:hidden"
            onClick={() => setMenu(false)}
          >
            <div className="flex flex-col gap-5 px-4 py-6">
              {CATS.map((c, i) => (
                <motion.a
                  key={c.href}
                  href={shopHref(c.href)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`font-display text-3xl ${c.pop ? 'text-pop' : ''}`}
                >
                  {c.label}
                </motion.a>
              ))}
              <a href={shopHref(usuario ? 'cuenta' : 'login')} className="text-[11px] uppercase tracking-[0.18em]">
                {usuario ? 'Mi cuenta' : 'Iniciar sesión'}
              </a>
              {isStaff && (
                <a href={shopHref('gestion')} className="text-[11px] uppercase tracking-[0.18em]">
                  Gestión
                </a>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
