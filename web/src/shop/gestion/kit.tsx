import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Lock, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { aFechaApi, deFechaApi } from '../../auth/api'
import { btnPrimary, field, toast, toastError } from '../ui'

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export const METHOD_STYLE: Record<Method, string> = {
  GET: 'bg-emerald-700 text-white',
  POST: 'bg-sky-700 text-white',
  PUT: 'bg-amber-600 text-white',
  PATCH: 'bg-violet-700 text-white',
  DELETE: 'bg-rose-700 text-white',
}

export function MethodBadge({ method, off }: { method: string; off?: boolean }) {
  return (
    <span
      className={`inline-block min-w-14 rounded px-1.5 py-0.5 text-center font-mono text-[10px] font-semibold ${
        off ? 'bg-paper-2 text-muted line-through' : (METHOD_STYLE[method as Method] ?? 'bg-ink text-paper')
      }`}
      title={off ? 'Tu rol no tiene permiso' : undefined}
    >
      {method}
    </span>
  )
}

export function SectionHeader({ eyebrow, title, endpoint, methods, action }: {
  eyebrow: string
  title: string
  endpoint: string
  methods: { method: Method; allowed: boolean }[]
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <motion.h1 key={title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 font-display text-5xl">
          {title}
        </motion.h1>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {methods.map((m) => (
            <MethodBadge key={m.method} method={m.method} off={!m.allowed} />
          ))}
          <span className="ml-1 font-mono text-xs text-muted">{endpoint}</span>
        </div>
      </div>
      {action}
    </div>
  )
}

export function NewButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="shine group flex items-center gap-2 bg-ink px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-paper">
      <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" /> {children}
    </button>
  )
}

export function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-center gap-3 border border-line bg-panel p-3">{children}</div>
}

export function SearchInput({ value, onChange, placeholder = 'Buscar…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="flex min-w-48 flex-1 items-center gap-2 px-2">
      <Search className="h-4 w-4 text-muted" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent py-1.5 text-sm outline-none" />
      {value && (
        <button onClick={() => onChange('')} aria-label="Borrar búsqueda">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </label>
  )
}

export function Select({ label, value, onChange, options }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="flex items-center gap-2 border-l border-line pl-3 text-xs text-muted">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="cursor-pointer bg-transparent py-1.5 text-sm text-ink outline-none">
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-paper">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

// Clicking a header cycles asc → desc → off; the value is the API's `orden` parameter.
export function SortHeader({ label, field: campo, orden, onOrden, className = '' }: {
  label: string
  field: string
  orden: string
  onOrden: (o: string) => void
  className?: string
}) {
  const dir = orden === campo ? 'asc' : orden === `-${campo}` ? 'desc' : null
  const next = dir === null ? campo : dir === 'asc' ? `-${campo}` : ''
  return (
    <th className={`py-3 font-normal ${className}`}>
      <button onClick={() => onOrden(next)} className={`inline-flex items-center gap-1 uppercase hover:text-ink ${dir ? 'text-ink' : ''}`}>
        {label}
        {dir === 'asc' && <ArrowUp className="h-3 w-3" />}
        {dir === 'desc' && <ArrowDown className="h-3 w-3" />}
      </button>
    </th>
  )
}

export function Pager({ page, total, limit, onPage }: { page: number; total: number; limit: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / limit))
  const from = total ? (page - 1) * limit + 1 : 0
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
      <span>
        {from}–{Math.min(page * limit, total)} de {total} · <span className="font-mono">page={page}&limit={limit}</span>
      </span>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="p-1.5 hover:text-ink disabled:opacity-30" aria-label="Página anterior">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
          .map((p, i, arr) => (
            <span key={p} className="flex items-center">
              {i > 0 && p - arr[i - 1] > 1 && <span className="px-1">…</span>}
              <button
                onClick={() => onPage(p)}
                className={`h-7 min-w-7 rounded-full px-2 ${p === page ? 'bg-ink text-paper' : 'hover:bg-paper-2 hover:text-ink'}`}
              >
                {p}
              </button>
            </span>
          ))}
        <button disabled={page >= pages} onClick={() => onPage(page + 1)} className="p-1.5 hover:text-ink disabled:opacity-30" aria-label="Página siguiente">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="shimmer h-12" />
      ))}
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="border border-dashed border-line py-16 text-center text-sm text-muted">{children}</p>
}

export function LockedPanel({ endpoint, rol }: { endpoint: string; rol?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="grid place-items-center border border-line bg-panel px-6 py-24 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-pop-soft text-pop">
        <Lock className="h-6 w-6" />
      </span>
      <p className="mt-5 font-mono text-xs text-pop">HTTP 403 · {endpoint}</p>
      <p className="mt-2 font-display text-3xl">Solo administradores</p>
      <p className="mt-2 max-w-md text-sm text-muted">
        La API comprueba el rol del token con <span className="font-mono">autorizar("administrador")</span>. Tu cuenta de {rol} no pasa ese filtro.
      </p>
    </motion.div>
  )
}

export function RowActions({ children }: { children: ReactNode }) {
  return <div className="inline-flex gap-1 text-muted opacity-60 transition-opacity group-hover:opacity-100">{children}</div>
}

export function IconButton({ onClick, label, danger, children }: { onClick: () => void; label: string; danger?: boolean; children: ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className={`rounded-full p-2 transition-colors hover:bg-paper-2 ${danger ? 'hover:text-bad' : 'hover:text-ink'}`}>
      {children}
    </button>
  )
}

export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return createPortal(
    <motion.div className="fixed inset-0 z-50 grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md bg-paper p-7 font-sans text-ink shadow-2xl"
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        {children}
      </motion.div>
    </motion.div>,
    document.body,
  )
}

export function ConfirmDelete({ title, endpoint, warning, onConfirm, onClose }: {
  title: string
  endpoint: string
  warning?: string
  onConfirm: () => Promise<unknown>
  onClose: () => void
}) {
  const [busy, setBusy] = useState(false)
  const run = async () => {
    setBusy(true)
    try {
      await onConfirm()
      toast('Eliminado')
      onClose()
    } catch (err) {
      toastError(err)
      setBusy(false)
    }
  }
  return (
    <Modal onClose={onClose}>
      <span className="grid h-12 w-12 place-items-center rounded-full bg-bad-soft text-bad">
        <Trash2 className="h-5 w-5" />
      </span>
      <p className="mt-5 font-display text-3xl">¿Eliminar {title}?</p>
      <p className="mt-2 text-sm text-muted">Esta acción no se puede deshacer.</p>
      {warning && <p className="mt-3 border-l-2 border-pop bg-pop-soft px-3 py-2 text-sm">{warning}</p>}
      <p className="mt-4 flex items-center gap-2 font-mono text-xs text-muted">
        <MethodBadge method="DELETE" /> {endpoint}
      </p>
      <div className="mt-7 flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-muted hover:text-ink">
          Cancelar
        </button>
        <button onClick={run} disabled={busy} className="bg-bad px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-white hover:opacity-90 disabled:opacity-50">
          {busy ? 'Eliminando…' : 'Eliminar'}
        </button>
      </div>
    </Modal>
  )
}

export type FieldDef = {
  key: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'checkbox' | 'tags'
  options?: readonly string[]
  required?: boolean
  wide?: boolean
  hint?: string
}

type Valores = Record<string, unknown>

// Form values use what the inputs need (YYYY-MM-DD, "a, b"); `toApi` converts back to the API's shapes.
function toForm(fields: FieldDef[], record?: Valores): Valores {
  return Object.fromEntries(
    fields.map((f) => {
      const v = record?.[f.key]
      if (f.type === 'date') return [f.key, deFechaApi(v as string)]
      if (f.type === 'tags') return [f.key, Array.isArray(v) ? v.join(', ') : '']
      if (f.type === 'checkbox') return [f.key, !!v]
      if (f.type === 'password') return [f.key, '']
      return [f.key, v ?? (f.type === 'select' ? (f.options?.[0] ?? '') : '')]
    }),
  )
}

function toApi(f: FieldDef, v: unknown) {
  if (f.type === 'date') return v ? aFechaApi(v as string) : undefined
  if (f.type === 'tags') return String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  if (f.type === 'number') return v === '' || v === undefined ? undefined : Number(v)
  if (f.type === 'checkbox') return !!v
  return v === '' ? undefined : v
}

// Creating sends every filled field (POST); editing sends only what changed (PATCH).
export function RecordDrawer({ title, fields, record, endpoint, onSave, onClose }: {
  title: string
  fields: FieldDef[]
  record?: Valores & { _id: string }
  endpoint: string
  onSave: (body: Valores) => Promise<unknown>
  onClose: () => void
}) {
  const initial = toForm(fields, record)
  const [values, setValues] = useState(initial)
  const [busy, setBusy] = useState(false)
  const baseId = useId()

  const body = Object.fromEntries(
    fields
      .filter((f) => !record || JSON.stringify(values[f.key]) !== JSON.stringify(initial[f.key]))
      .map((f) => [f.key, toApi(f, values[f.key])])
      .filter(([, v]) => v !== undefined),
  )

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (record && !Object.keys(body).length) return toast('No hay cambios que guardar')
    setBusy(true)
    try {
      await onSave(body)
      toast(record ? 'Cambios guardados' : 'Creado')
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
        className="absolute inset-y-0 right-0 flex w-[min(560px,100vw)] flex-col bg-paper font-sans text-ink"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="text-[11px] uppercase tracking-[0.2em]">{title}</p>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid flex-1 content-start gap-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
          {fields.map((f, i) => {
            const id = `${baseId}-${f.key}`
            const v = values[f.key]
            const set = (nv: unknown) => setValues((prev) => ({ ...prev, [f.key]: nv }))
            const label = `${f.label}${f.required && !record ? ' *' : ''}`
            return (
              <motion.div
                key={f.key}
                className={`text-[11px] text-muted ${f.wide ? 'sm:col-span-2' : ''}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
              >
                {f.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 pt-5 text-sm text-ink">
                    <input type="checkbox" checked={!!v} onChange={(e) => set(e.target.checked)} /> {f.label}
                  </label>
                ) : (
                  <>
                    <label htmlFor={id}>{label}</label>
                    {f.type === 'select' ? (
                      <select id={id} className={field} value={String(v)} onChange={(e) => set(e.target.value)}>
                        {f.options?.map((o) => (
                          <option key={o} value={o} className="bg-paper capitalize">
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={id}
                        type={f.type === 'tags' ? 'text' : (f.type ?? 'text')}
                        step={f.type === 'number' ? 'any' : undefined}
                        className={field}
                        value={String(v ?? '')}
                        placeholder={f.type === 'password' && record ? 'Déjala vacía para no cambiarla' : undefined}
                        onChange={(e) => set(e.target.value)}
                      />
                    )}
                  </>
                )}
                {f.hint && <p className="mt-1.5">{f.hint}</p>}
              </motion.div>
            )
          })}
        </div>
        <div className="drawer-footer border-t border-line px-6 py-4">
          <pre className="mb-4 max-h-28 overflow-auto bg-ink p-3 font-mono text-[10px] leading-relaxed text-paper/80">
            <span className="text-pop">{record ? 'PATCH' : 'POST'}</span> {endpoint}
            {'\n'}
            {JSON.stringify({ ...body, ...(body.password ? { password: '••••••' } : {}) }, null, 2)}
          </pre>
          <div className="flex justify-end">
            <button disabled={busy} className={btnPrimary}>
              {busy ? 'Guardando…' : record ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </div>
      </motion.form>
    </motion.div>,
    document.body,
  )
}
