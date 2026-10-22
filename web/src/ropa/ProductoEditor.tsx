import { motion } from 'framer-motion'
import { Plus, Trash2, X } from 'lucide-react'
import { useId, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { btnPrimary, field, toast, toastError } from '../shop/ui'
import { ropaApi } from './api'
import { ProductoImage } from './ProductoImage'
import { MAX_DESCUENTO, TALLAS, TIPOS } from './types'
import type { Producto, ProductoInput, Proveedor, TallaTipo, Tipo } from './types'

const TEMPORADAS = ['Primavera-Verano', 'Otoño-Invierno', 'Todo el año']

const blank = (proveedor = ''): ProductoInput => ({
  tipo: 'camiseta',
  precio: 19.95,
  disponible: true,
  talla: [{ talla_tipo: 'M', talla_stock: 10 }],
  temporada: 'Todo el año',
  descuento: 0,
  evento: '',
  foto: '',
  proveedor,
})

// Only the schema fields: the API's own extras (__v, timestamps…) must not go back on PUT.
const toInput = (p: Producto): ProductoInput => ({
  tipo: p.tipo,
  precio: p.precio,
  disponible: p.disponible,
  talla: p.talla.map(({ talla_tipo, talla_stock }) => ({ talla_tipo, talla_stock })),
  temporada: p.temporada,
  descuento: p.descuento,
  evento: p.evento ?? '',
  foto: p.foto ?? '',
  proveedor: typeof p.proveedor === 'object' && p.proveedor ? p.proveedor._id : p.proveedor,
})

function Field({ label, hint, className = '', children }: { label: string; hint?: string; className?: string; children: (id: string) => ReactNode }) {
  const id = useId()
  return (
    <div className={`text-[11px] text-muted ${className}`}>
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {hint && <p className="mt-2">{hint}</p>}
    </div>
  )
}

type Props = { producto: Producto | null; proveedores: Proveedor[]; onClose: () => void }

// Rendered into <body>: the slide's animated ancestors would otherwise trap a `fixed` drawer.
// Validation is left to the students' API, so its 400 messages are what users see.
export function ProductoEditor({ producto, proveedores, onClose }: Props) {
  const [p, setP] = useState<ProductoInput>(() => (producto ? toInput(producto) : blank(proveedores[0]?._id)))
  const [busy, setBusy] = useState(false)
  const set = (patch: Partial<ProductoInput>) => setP((prev) => ({ ...prev, ...patch }))
  const setTalla = (i: number, patch: Partial<ProductoInput['talla'][number]>) =>
    set({ talla: p.talla.map((t, j) => (j === i ? { ...t, ...patch } : t)) })
  const nextTalla = TALLAS.find((t) => !p.talla.some((x) => x.talla_tipo === t))

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      if (producto) await ropaApi.update(producto._id, p)
      else await ropaApi.create(p)
      toast(producto ? 'Prenda actualizada' : 'Prenda creada')
      onClose()
    } catch (err) {
      toastError(err)
    } finally {
      setBusy(false)
    }
  }

  return createPortal(
    <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.form
        onSubmit={save}
        className="absolute inset-y-0 right-0 flex w-[min(580px,100vw)] flex-col bg-paper font-sans text-ink"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="text-[11px] uppercase tracking-[0.2em]">{producto ? 'Editar prenda' : 'Nueva prenda'}</p>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex gap-5">
            <ProductoImage tipo={p.tipo} foto={p.foto} seed={producto?._id ?? 'nuevo'} className="h-40 w-30 shrink-0" />
            <Field label="Foto (URL, opcional)" hint="Sin foto, o si la URL no carga, se muestra un dibujo del tipo de prenda." className="flex-1">
              {(id) => <input id={id} className={field} value={p.foto} onChange={(e) => set({ foto: e.target.value })} placeholder="https://…" />}
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipo">
              {(id) => (
                <select id={id} className={field} value={p.tipo} onChange={(e) => set({ tipo: e.target.value as Tipo })}>
                  {TIPOS.map((t) => (
                    <option key={t} value={t} className="bg-paper">{t}</option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Temporada">
              {(id) => (
                <>
                  <input id={id} className={field} list={`${id}-opciones`} value={p.temporada} onChange={(e) => set({ temporada: e.target.value })} />
                  <datalist id={`${id}-opciones`}>
                    {TEMPORADAS.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Precio (€)">
              {(id) => <input id={id} type="number" step="0.01" className={field} value={p.precio} onChange={(e) => set({ precio: Number(e.target.value) })} />}
            </Field>
            <Field label={`Descuento (máx. ${MAX_DESCUENTO} %)`}>
              {(id) => <input id={id} type="number" className={field} value={p.descuento} onChange={(e) => set({ descuento: Number(e.target.value) })} />}
            </Field>
            <label className="flex items-end gap-2 pb-2.5 text-sm">
              <input type="checkbox" checked={p.disponible} onChange={(e) => set({ disponible: e.target.checked })} /> Disponible
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Evento (opcional)">
              {(id) => <input id={id} className={field} value={p.evento} onChange={(e) => set({ evento: e.target.value })} placeholder="Rebajas, Black Friday…" />}
            </Field>
            <Field label="Proveedor">
              {(id) => (
                <select id={id} className={field} value={p.proveedor} onChange={(e) => set({ proveedor: e.target.value })}>
                  {!p.proveedor && <option value="">{proveedores.length ? 'Elige un proveedor' : 'Sin proveedores'}</option>}
                  {proveedores.map((pr) => (
                    <option key={pr._id} value={pr._id} className="bg-paper">{pr.nombreComercial}</option>
                  ))}
                </select>
              )}
            </Field>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="eyebrow">Tallas y stock</p>
              {nextTalla && (
                <button
                  type="button"
                  onClick={() => set({ talla: [...p.talla, { talla_tipo: nextTalla, talla_stock: 0 }] })}
                  className="flex items-center gap-1 text-xs underline underline-offset-4"
                >
                  <Plus className="h-3.5 w-3.5" /> Añadir talla
                </button>
              )}
            </div>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {p.talla.map((t, i) => (
                <li key={i} className="flex items-center gap-4 py-2">
                  <select
                    className="bg-transparent text-sm outline-none"
                    value={t.talla_tipo}
                    onChange={(e) => setTalla(i, { talla_tipo: e.target.value as TallaTipo })}
                    aria-label="Talla"
                  >
                    {TALLAS.map((s) => (
                      <option key={s} value={s} className="bg-paper">{s}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="w-24 border-b border-line bg-transparent py-1 text-right text-sm outline-none focus:border-ink"
                    value={t.talla_stock}
                    onChange={(e) => setTalla(i, { talla_stock: Number(e.target.value) })}
                    aria-label={`Stock de la talla ${t.talla_tipo}`}
                  />
                  <span className="flex-1 text-xs text-muted">ud</span>
                  <button type="button" onClick={() => set({ talla: p.talla.filter((_, j) => j !== i) })} className="p-1 text-muted hover:text-bad" aria-label={`Quitar talla ${t.talla_tipo}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line px-6 py-4">
          <span className="font-mono text-[11px] text-muted">{producto ? `PUT /ropa/${producto._id}` : 'POST /ropa'}</span>
          <button disabled={busy} className={btnPrimary}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </motion.form>
    </motion.div>,
    document.body,
  )
}
