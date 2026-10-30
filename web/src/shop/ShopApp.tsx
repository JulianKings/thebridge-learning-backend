import { MotionConfig, motion } from 'framer-motion'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './AuthContext'
import { CartDrawer } from './CartDrawer'
import { CartProvider } from './CartContext'
import { Account } from './pages/Account'
import { Checkout, OrderDone } from './pages/Checkout'
import { Home } from './pages/Home'
import { Listing } from './pages/Listing'
import { Login } from './pages/Login'
import { Gestion } from './gestion/Gestion'
import { ScrollProgress } from './motion'
import { ProductPage } from './pages/ProductPage'
import { shopHref, useShopRoute } from './router'
import { ShopHeader } from './ShopHeader'
import { Toaster } from './ui'

// Pages that need a session wait for it to be restored, then fall back to login.
function RequireUser({ next, staff, children }: { next: string; staff?: boolean; children: ReactNode }) {
  const { usuario, rol, ready, isStaff } = useAuth()
  if (!ready) return <div className="grid min-h-[60vh] place-items-center text-sm text-muted">Cargando…</div>
  if (!usuario) return <Login next={next} />
  if (staff && !isStaff)
    return (
      <div className="py-32 text-center">
        <p className="font-mono text-xs text-bad">HTTP 403</p>
        <p className="mt-2 font-display text-4xl">Zona solo para el equipo</p>
        <p className="mt-2 text-sm text-muted">Tu cuenta de {rol} no tiene acceso a la gestión.</p>
      </div>
    )
  return <>{children}</>
}

function Routes() {
  const [page, a, b] = useShopRoute()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page, a, b])

  switch (page) {
    case undefined:
      return <Home />
    case 'c':
      return <Listing slug={a} />
    case 'buscar':
      return <Listing search={a} />
    case 'p':
      return <ProductPage key={a} id={a} />
    case 'login':
      return <Login next={a} />
    case 'cuenta':
      return (
        <RequireUser next="cuenta">
          <Account />
        </RequireUser>
      )
    case 'checkout':
      return (
        <RequireUser next="checkout">
          <Checkout />
        </RequireUser>
      )
    case 'pedido':
      return (
        <RequireUser next={`pedido/${a}`}>
          <OrderDone id={a} />
        </RequireUser>
      )
    case 'gestion':
      return (
        <RequireUser next="gestion" staff>
          <Gestion section={a} id={b} />
        </RequireUser>
      )
    default:
      return (
        <div className="py-32 text-center">
          <p className="font-display text-5xl">Página no encontrada</p>
          <a href={shopHref()} className="mt-6 inline-block text-xs uppercase tracking-[0.2em] underline underline-offset-4">
            Volver al inicio
          </a>
        </div>
      )
  }
}

function ShopFooter() {
  return (
    <footer className="mt-20 overflow-hidden border-t border-line bg-ink px-4 pt-14 text-paper sm:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-10 text-sm sm:grid-cols-4">
        <div>
          <p className="font-display text-2xl tracking-[0.3em]">THEBRIDGE</p>
          <p className="mt-3 text-xs leading-relaxed text-paper/60">Ropa esencial hecha para durar. Proyecto de aprendizaje de The Bridge.</p>
        </div>
        {[
          ['Tienda', 'Parte de arriba', 'Parte de abajo', 'Calzado'],
          ['Ayuda', 'Envíos', 'Devoluciones', 'Contacto'],
          ['Backend', 'Express · MongoDB', 'JWT · Swagger', 'Compras y puntos'],
        ].map(([title, ...items]) => (
          <div key={title}>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-pop">{title}</p>
            <ul className="mt-3 space-y-1.5 text-paper/60">
              {items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-14 select-none text-center font-display text-[22vw] leading-[0.75] tracking-tight text-paper/10" aria-hidden="true">
        THEBRIDGE
      </p>
    </footer>
  )
}

export function ShopApp() {
  const [page, a] = useShopRoute()
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <CartProvider>
          <ScrollProgress />
          <ShopHeader />
          <motion.main
            key={`${page}/${page === 'gestion' ? '' : (a ?? '')}`}
            className="min-h-[70vh]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes />
          </motion.main>
          {page !== 'gestion' && <ShopFooter />}
          <CartDrawer />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </MotionConfig>
  )
}
