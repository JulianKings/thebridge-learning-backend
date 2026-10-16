import { Check, Lock } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '../../api/hooks'
import { api } from '../../api/mockApi'
import { Garment } from '../../components/Garment'
import { formatPrice } from '../../data/mock'
import { useAuth } from '../AuthContext'
import { useCart } from '../CartContext'
import { useCartLines } from '../CartDrawer'
import { navigate, shopHref } from '../router'
import { ErrorBox, btnPrimary, field, toastError } from '../ui'

export function Checkout() {
  const { user } = useAuth()
  const { items, clear } = useCart()
  const { lines, total, loading, error } = useCartLines()
  const [address, setAddress] = useState('Calle Mayor 12')
  const [city, setCity] = useState('Madrid')
  const [busy, setBusy] = useState(false)

  if (!user) return null
  if (error) return <ErrorBox error={error} className="m-8" />
  if (loading && items.length && !lines.length) return <div className="py-32 text-center text-sm text-muted">Cargando…</div>
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

  const shipping = total >= 50 ? 0 : 4.95

  const pay = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const order = await api.createOrder(items, `${address}, ${city}`)
      clear()
      navigate(`pedido/${order.id}`)
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
        <p className="eyebrow mt-10">1 · Envío</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <input className={field} value={user.name} readOnly aria-label="Nombre" />
          <input className={field} value={user.email} readOnly aria-label="Email" />
          <input className={`${field} sm:col-span-2`} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Dirección" aria-label="Dirección" />
          <input className={field} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad" aria-label="Ciudad" />
          <input className={field} defaultValue="28013" placeholder="Código postal" aria-label="Código postal" />
        </div>

        <p className="eyebrow mt-12">2 · Pago</p>
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
              <Garment kind={l.product.kind} tone={l.product.tone} ink={l.product.ink} className="h-16 w-12 shrink-0" />
              <span className="flex-1">
                {l.product.name}
                <span className="block text-xs text-muted">
                  Talla {l.size} · {l.qty} ud
                </span>
              </span>
              <span>{formatPrice(l.product.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Envío</dt>
            <dd>{shipping ? formatPrice(shipping) : 'Gratis'}</dd>
          </div>
          <div className="flex justify-between pt-2 text-base">
            <dt>Total</dt>
            <dd>{formatPrice(total + shipping)}</dd>
          </div>
        </dl>
        <button disabled={busy} className={`${btnPrimary} mt-6 w-full`}>
          {busy ? 'Procesando…' : 'Pagar ahora'}
        </button>
        <p className="mt-3 text-center font-mono text-[11px] text-muted">POST /api/orders</p>
      </aside>
    </form>
  )
}

export function OrderDone({ id }: { id: string }) {
  const { data, error } = useQuery(() => api.myOrders(), [])
  const order = data?.find((o) => o.id === id)

  if (error) return <ErrorBox error={error} className="m-8" />

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper">
        <Check className="h-6 w-6" />
      </span>
      <h1 className="mt-6 font-display text-5xl">¡Gracias por tu compra!</h1>
      <p className="mt-3 text-sm text-muted">
        Tu pedido <span className="text-ink">#{id.slice(1)}</span> está confirmado. Te avisaremos cuando salga del almacén.
      </p>
      {order && (
        <ul className="mt-10 divide-y divide-line border-y border-line text-left text-sm">
          {order.items.map((i) => (
            <li key={`${i.productId}-${i.size}`} className="flex justify-between py-3">
              <span>
                {i.name} <span className="text-muted">· {i.size} × {i.qty}</span>
              </span>
              <span>{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
          <li className="flex justify-between py-3">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </li>
        </ul>
      )}
      <div className="mt-10 flex justify-center gap-3">
        <a href={shopHref('cuenta')} className={btnPrimary}>
          Ver mis pedidos
        </a>
      </div>
    </div>
  )
}
