import { Menu, Search, X } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from './AuthContext'
import { useCart } from './CartContext'
import { navigate, shopHref, useShopRoute } from './router'

const CATS = [
  { slug: 'mujer', label: 'Mujer' },
  { slug: 'hombre', label: 'Hombre' },
  { slug: 'unisex', label: 'Unisex' },
  { slug: 'todo', label: 'Ver todo' },
]

const link = 'text-[11px] uppercase tracking-[0.18em] hover:opacity-60'

export function ShopHeader() {
  const { user, isStaff } = useAuth()
  const { count, setOpen } = useCart()
  const route = useShopRoute()
  const [search, setSearch] = useState(false)
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!q.trim()) return
    navigate(`buscar/${encodeURIComponent(q.trim())}`)
    setSearch(false)
  }

  const active = (slug: string) => route[0] === 'c' && route[1] === slug

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-8">
        <nav className="flex items-center gap-6">
          <button onClick={() => setMenu(!menu)} className="md:hidden" aria-label="Menú">
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {CATS.map((c) => (
            <a key={c.slug} href={shopHref(`c/${c.slug}`)} className={`${link} hidden md:inline ${active(c.slug) ? 'underline underline-offset-4' : ''}`}>
              {c.label}
            </a>
          ))}
        </nav>

        <a href={shopHref()} className="font-display text-3xl tracking-[0.35em] sm:text-4xl">
          HILO
        </a>

        <div className="flex items-center justify-end gap-5">
          {search ? (
            <form onSubmit={submit} className="flex items-center gap-2 border-b border-ink">
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" className="w-28 bg-transparent py-1 text-sm outline-none sm:w-44" />
              <button type="button" onClick={() => setSearch(false)} aria-label="Cerrar búsqueda">
                <X className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearch(true)} className={`${link} flex items-center gap-2`} aria-label="Buscar">
              <Search className="h-4 w-4" /> <span className="hidden lg:inline">Buscar</span>
            </button>
          )}
          {isStaff && (
            <a href={shopHref('gestion')} className={`${link} hidden sm:inline`}>
              Gestión
            </a>
          )}
          <a href={shopHref(user ? 'cuenta' : 'login')} className={`${link} hidden sm:inline`}>
            {user ? user.name.split(' ')[0] : 'Iniciar sesión'}
          </a>
          <button onClick={() => setOpen(true)} className={link}>
            Cesta ({count})
          </button>
        </div>
      </div>

      {menu && (
        <nav className="flex flex-col gap-4 border-t border-line px-4 py-5 md:hidden" onClick={() => setMenu(false)}>
          {CATS.map((c) => (
            <a key={c.slug} href={shopHref(`c/${c.slug}`)} className={link}>
              {c.label}
            </a>
          ))}
          <a href={shopHref(user ? 'cuenta' : 'login')} className={link}>
            {user ? 'Mi cuenta' : 'Iniciar sesión'}
          </a>
          {isStaff && (
            <a href={shopHref('gestion')} className={link}>
              Gestión
            </a>
          )}
        </nav>
      )}
    </header>
  )
}
