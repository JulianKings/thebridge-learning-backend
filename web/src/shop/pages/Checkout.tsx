import { Check, Lock } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '../../api/hooks'
import { comprasApi } from '../../compras/api'
import type { LineaCompra } from '../../compras/api'
import { formatPrice } from '../../data/mock'
import { ropaApi } from '../../ropa/api'
import { ProductoImage } from '../../ropa/ProductoImage'
import { titulo } from '../../ropa/types'
import type { Producto, TallaTipo } from '../../ropa/types'
import { useAuth } from '../AuthContext'
import { useCart } from '../CartContext'
import { useCartLines } from '../CartDrawer'
import { navigate, shopHref } from '../router'
import { ErrorBox, btnPrimary, toastError } from '../ui'

export function Checkout() {
  const { usuario, rol } = useAuth()
  const { clear } = useCart()
  const { lines, total, loading, error } = useCartLines()
  const [busy, setBusy] = useState(false)

  if (!usuario) return null
  if (rol !== 'cliente') {
    return (
      <div className="py-32 text-center">
        <p className="font-display text-4xl">Las compras las hacen los clientes</p>
        <p className="mt-2 text-sm text-muted">Has iniciado sesión como {rol}. Entra con una cuenta de cliente para comprar.</p>
      </div>
    )
  }
  if (error) return <ErrorBox error={error} className="m-8" />
  if (loading && !lines.length) return <div className="py-32 text-center text-sm text-muted">Cargando…</div>
  if (!lines.length) {
    return (
      <div className="py-32 text-center">
        <p className="font-display text-4xl">Tu cesta está vacía</p>
        <a href={shopHref('c/todo')} className="mt-6 inline-block text-xs uppercase tracking-[0.2em] underline underline-offset-4">
          Volver a la tienda
        </a>
      </div>
    )
  }

  const pay = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const compra = await comprasApi.crear(lines.map((l) => ({ producto: l.productId, talla: l.size as TallaTipo, cantidad: l.qty })))
      clear()
      navigate(`pedido/${compra._id}`)
    } catch (err) {
      toastError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={pay} className="mx-auto grid max-w-[1200px] gap-12 px-4 py-12 sm:px-8 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <h1 className="font-display text-5xl">Finalizar compra</h1>
        <p className="eyebrow mt-10">Comprador</p>
        <p className="mt-3 text-sm">
          {usuario.nombre} <span className="text-muted">· {usuario.email}</span>
        </p>
        <p className="mt-1 text-sm text-muted">Tienes {usuario.puntos ?? 0} puntos. Esta compra sumará más.</p>

        <p className="eyebrow mt-12">Pago</p>
        <div className="mt-4 flex items-center justify-between border border-line bg-panel px-5 py-4">
          <span className="font-mono text-sm">•••• •••• •••• 4242</span>
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Lock className="h-3.5 w-3.5" /> Pago simulado
          </span>
        </div>
      </div>

      <aside className="self-start border border-line bg-panel p-6 lg:sticky lg:top-24">
        <p className="eyebrow">Resumen</p>
        <ul className="mt-4 divide-y divide-line">
          {lines.map((l) => (
            <li key={`${l.productId}-${l.size}`} className="flex gap-3 py-3 text-sm">
              <ProductoImage tipo={l.producto.tipo} foto={l.producto.foto} seed={l.producto._id} className="h-16 w-12 shrink-0" />
              <span className="flex-1">
                {titulo(l.producto)}
                <span className="block text-xs text-muted">
                  Talla {l.size} · {l.qty} ud
                </span>
              </span>
              <span>{formatPrice(l.precio * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-line pt-4 text-base">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <button disabled={busy} className={`${btnPrimary} mt-6 w-full`}>
          {busy ? 'Procesando…' : 'Pagar ahora'}
        </button>
        <p className="mt-3 text-center font-mono text-[11px] text-muted">POST /compras</p>
      </aside>
    </form>
  )
}

export function LineaNombre({ linea, productos }: { linea: LineaCompra; productos?: Producto[] }) {
  const producto = typeof linea.producto === 'object' ? linea.producto : productos?.find((p) => p._id === linea.producto)
  return <>{producto ? titulo(producto) : 'Prenda retirada'}</>
}

export function OrderDone({ id }: { id: string }) {
  const { usuario } = useAuth()
  const { data, error } = useQuery(() => comprasApi.mias(), [])
  const { data: productos } = useQuery(() => ropaApi.list(), [])
  const compra = data?.find((c) => c._id === id)

  if (error) return <ErrorBox error={error} className="m-8" />

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper">
        <Check className="h-6 w-6" />
      </span>
      <h1 className="mt-6 font-display text-5xl">¡Gracias por tu compra!</h1>
      <p className="mt-3 text-sm text-muted">
        {compra?.puntos ? `Has ganado ${compra.puntos} puntos. ` : ''}
        Ahora tienes <span className="text-ink">{usuario?.puntos ?? 0} puntos</span>.
      </p>
      {compra && (
        <ul className="mt-10 divide-y divide-line border-y border-line text-left text-sm">
          {compra.productos.map((l, i) => (
            <li key={i} className="flex justify-between py-3">
              <span>
                <LineaNombre linea={l} productos={productos} /> <span className="text-muted">· {l.talla} × {l.cantidad}</span>
              </span>
              {l.precio !== undefined && <span>{formatPrice(l.precio * l.cantidad)}</span>}
            </li>
          ))}
          <li className="flex justify-between py-3">
            <span>Total</span>
            <span>{formatPrice(compra.total)}</span>
          </li>
        </ul>
      )}
      <div className="mt-10 flex justify-center gap-3">
        <a href={shopHref('cuenta')} className={btnPrimary}>
          Ver mis compras
        </a>
      </div>
    </div>
  )
}
