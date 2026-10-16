import { AnimatePresence, motion } from 'framer-motion'
import { useSyncExternalStore } from 'react'
import { Garment } from '../components/Garment'
import { formatPrice } from '../data/mock'
import { ApiError } from '../api/types'
import type { Product } from '../api/types'
import { shopHref } from './router'

// ---- Toasts ----------------------------------------------------------------

type Toast = { id: number; text: string; kind: 'ok' | 'error' }
let toasts: Toast[] = []
const toastListeners = new Set<() => void>()
let toastId = 0

export function toast(text: string, kind: Toast['kind'] = 'ok') {
  const t = { id: ++toastId, text, kind }
  toasts = [...toasts, t]
  toastListeners.forEach((l) => l())
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id)
    toastListeners.forEach((l) => l())
  }, 3500)
}

export const toastError = (e: unknown) =>
  toast(e instanceof ApiError ? `${e.status} · ${e.message}` : 'Algo ha fallado.', 'error')

export function Toaster() {
  const list = useSyncExternalStore(
    (fn) => {
      toastListeners.add(fn)
      return () => toastListeners.delete(fn)
    },
    () => toasts,
  )
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`max-w-sm px-4 py-3 text-sm shadow-lg ${t.kind === 'error' ? 'bg-bad text-white' : 'bg-ink text-paper'}`}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ---- States ----------------------------------------------------------------

export function ErrorBox({ error, className = '' }: { error: ApiError; className?: string }) {
  return (
    <div className={`border border-bad bg-bad-soft px-6 py-8 text-center ${className}`}>
      <p className="font-mono text-xs text-bad">HTTP {error.status}</p>
      <p className="mt-2 font-display text-2xl">No hemos podido cargar esto</p>
      <p className="mt-1 text-sm text-muted">{error.message}</p>
    </div>
  )
}

export function GridSkeleton({ n = 8 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: n }, (_, i) => (
        <div key={i}>
          <div className="aspect-[3/4] animate-pulse bg-paper-2" />
          <div className="mt-3 h-3 w-2/3 animate-pulse bg-paper-2" />
        </div>
      ))}
    </div>
  )
}

// ---- Product card ----------------------------------------------------------

export function ProductCard({ p }: { p: Product }) {
  return (
    <a href={shopHref(`p/${p.id}`)} className="group block">
      <div className="relative overflow-hidden">
        <Garment kind={p.kind} tone={p.tone} ink={p.ink} className="aspect-[3/4] transition-transform duration-700 group-hover:scale-[1.03]" />
        {p.isNew && <span className="absolute left-3 top-3 bg-paper px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-ink">Nuevo</span>}
        {p.stock === 0 ? (
          <span className="absolute inset-x-0 bottom-0 bg-paper/90 py-2 text-center text-[10px] uppercase tracking-[0.2em] text-ink">Agotado</span>
        ) : p.stock < 8 ? (
          <span className="absolute inset-x-0 bottom-0 bg-paper/90 py-2 text-center text-[10px] uppercase tracking-[0.2em] text-bad">Últimas unidades</span>
        ) : null}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3 text-[13px]">
        <h3 className="uppercase tracking-wide">{p.name}</h3>
        <span className="shrink-0">{formatPrice(p.price)}</span>
      </div>
      <p className="mt-0.5 text-xs text-muted">{p.category}</p>
    </a>
  )
}

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 bg-ink px-6 py-3.5 text-[11px] uppercase tracking-[0.2em] text-paper transition-opacity hover:opacity-85 disabled:opacity-40'
export const btnGhost =
  'inline-flex items-center justify-center gap-2 border border-ink px-6 py-3.5 text-[11px] uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-40'
export const field =
  'w-full border-b border-line bg-transparent py-2.5 text-sm outline-none placeholder:text-muted focus:border-ink'
