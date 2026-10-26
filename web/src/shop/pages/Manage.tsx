import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '../../api/hooks'
import { api } from '../../api/client'
import type { Order, Product, Role, Supply } from '../../api/types'
import { Garment } from '../../components/Garment'
import type { GarmentKind } from '../../data/mock'
import { formatPrice } from '../../data/mock'
import { useAuth } from '../AuthContext'
import { navigate, shopHref } from '../router'
import { ErrorBox, btnPrimary, field, toast, toastError } from '../ui'

const KINDS: { kind: GarmentKind; label: string }[] = [
  { kind: 'coat', label: 'Abrigo' },
  { kind: 'blazer', label: 'Americana' },
  { kind: 'shirt', label: 'Camisa' },
  { kind: 'tee', label: 'Camiseta' },
  { kind: 'knit', label: 'Punto' },
  { kind: 'dress', label: 'Vestido' },
  { kind: 'skirt', label: 'Falda' },
  { kind: 'trousers', label: 'Pantalón' },
]

const blankProduct = (): Omit<Product, 'id'> => ({
  name: '',
  description: '',
  price: 39.95,
  category: 'Unisex',
  sizes: ['S', 'M', 'L'],
  kind: 'tee',
  tone: '#e4e0d8',
  ink: '#6f6a60',
  stock: 10,
  supplies: [],
  isNew: true,
})

async function attempt(fn: () => Promise<unknown>, ok: string) {
  try {
    await fn()
    toast(ok)
    return true
  } catch (e) {
    toastError(e)
    return false
  }
}

function ProductEditor({ initial, onClose }: { initial: Product | null; onClose: () => void }) {
  const [p, setP] = useState<Omit<Product, 'id'>>(() => (initial ? { ...initial } : blankProduct()))
  const [sizes, setSizes] = useState(p.sizes.join(', '))
  const [busy, setBusy] = useState(false)
  const { data: supplies } = useQuery(() => api.listSupplies(), [])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const data = { ...p, sizes: sizes.split(',').map((s) => s.trim()).filter(Boolean) }
    const ok = await attempt(
      () => (initial ? api.updateProduct(initial.id, data) : api.createProduct(data)),
      initial ? 'Prenda actualizada' : 'Prenda creada',
    )
    setBusy(false)
    if (ok) onClose()
  }

  const toggleSupply = (id: string) =>
    setP({ ...p, supplies: p.supplies.includes(id) ? p.supplies.filter((s) => s !== id) : [...p.supplies, id] })

  return (
    <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <motion.form
        onSubmit={save}
        className="absolute inset-y-0 right-0 flex w-[min(560px,100vw)] flex-col bg-paper"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="text-[11px] uppercase tracking-[0.2em]">{initial ? 'Editar prenda' : 'Nueva prenda'}</p>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex gap-5">
            <Garment kind={p.kind} tone={p.tone} ink={p.ink} className="h-40 w-30 shrink-0" />
            <div className="grid flex-1 content-start gap-3">
              <p className="eyebrow">Ilustración</p>
              <select className={field} value={p.kind} onChange={(e) => setP({ ...p, kind: e.target.value as GarmentKind })} aria-label="Tipo de prenda">
                {KINDS.map((k) => (
                  <option key={k.kind} value={k.kind} className="bg-paper">{k.label}</option>
                ))}
              </select>
              <div className="flex gap-4 text-xs text-muted">
                <label className="flex items-center gap-2">
                  Fondo <input type="color" value={p.tone} onChange={(e) => setP({ ...p, tone: e.target.value })} />
                </label>
                <label className="flex items-center gap-2">
                  Trazo <input type="color" value={p.ink} onChange={(e) => setP({ ...p, ink: e.target.value })} />
                </label>
              </div>
            </div>
          </div>

          <label className="block text-[11px] text-muted">
            Nombre
            <input className={field} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} placeholder="Sudadera de felpa" />
          </label>
          <label className="block text-[11px] text-muted">
            Descripción
            <textarea className={`${field} resize-none`} rows={2} value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} />
          </label>
          <div className="grid grid-cols-3 gap-4">
            <label className="text-[11px] text-muted">
              Precio (€)
              <input type="number" step="0.01" className={field} value={p.price} onChange={(e) => setP({ ...p, price: Number(e.target.value) })} />
            </label>
            <label className="text-[11px] text-muted">
              Stock
              <input type="number" className={field} value={p.stock} onChange={(e) => setP({ ...p, stock: Number(e.target.value) })} />
            </label>
            <label className="text-[11px] text-muted">
              Categoría
              <select className={field} value={p.category} onChange={(e) => setP({ ...p, category: e.target.value as Product['category'] })}>
                {['Mujer', 'Hombre', 'Unisex'].map((c) => (
                  <option key={c} className="bg-paper">{c}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-[11px] text-muted">
            Tallas (separadas por comas)
            <input className={field} value={sizes} onChange={(e) => setSizes(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!p.isNew} onChange={(e) => setP({ ...p, isNew: e.target.checked })} /> Marcar como novedad
          </label>

          <div>
            <p className="eyebrow">Materiales vinculados</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {supplies?.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleSupply(s.id)}
                  className={`border px-3 py-1.5 text-xs ${p.supplies.includes(s.id) ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="drawer-footer flex items-center justify-between gap-4 border-t border-line px-6 py-4">
          <span className="font-mono text-[11px] text-muted">{initial ? `PUT /api/products/${initial.id}` : 'POST /api/products'}</span>
          <button disabled={busy} className={btnPrimary}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  )
}

function ProductsTab({ editId }: { editId?: string }) {
  const { data, error, loading } = useQuery(() => api.listProducts(), [])
  const [creating, setCreating] = useState(false)
  const editing = editId ? data?.find((p) => p.id === editId) : undefined

  const close = () => {
    setCreating(false)
    if (editId) navigate('gestion/prendas')
  }

  const remove = (p: Product) => {
    if (confirm(`¿Eliminar «${p.name}»?`)) attempt(() => api.deleteProduct(p.id), 'Prenda eliminada')
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted">{data ? `${data.length} prendas en el catálogo` : ''}</p>
        <button onClick={() => setCreating(true)} className={btnPrimary}>
          <Plus className="h-4 w-4" /> Nueva prenda
        </button>
      </div>
      {error ? (
        <ErrorBox error={error} />
      ) : loading && !data ? (
        <p className="text-sm text-muted">Cargando…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="eyebrow border-b border-line">
                <th className="py-3 font-normal">Prenda</th>
                <th className="py-3 font-normal">Categoría</th>
                <th className="py-3 font-normal">Precio</th>
                <th className="py-3 font-normal">Stock</th>
                <th className="py-3 font-normal">Materiales</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data?.map((p) => (
                <tr key={p.id} className="border-b border-line">
                  <td className="py-3">
                    <a href={shopHref(`p/${p.id}`)} className="flex items-center gap-3 hover:underline">
                      <Garment kind={p.kind} tone={p.tone} ink={p.ink} className="h-12 w-9 shrink-0" />
                      {p.name}
                      {p.isNew && <span className="text-[10px] uppercase tracking-widest text-muted">Nuevo</span>}
                    </a>
                  </td>
                  <td className="text-muted">{p.category}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td className={p.stock < 8 ? 'text-bad' : ''}>{p.stock} ud</td>
                  <td className="text-xs text-muted">{p.supplies.length}</td>
                  <td className="text-right">
                    <a href={shopHref(`gestion/prendas/${p.id}`)} className="inline-block p-2 text-muted hover:text-ink" aria-label={`Editar ${p.name}`}>
                      <Pencil className="h-4 w-4" />
                    </a>
                    <button onClick={() => remove(p)} className="p-2 text-muted hover:text-bad" aria-label={`Eliminar ${p.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AnimatePresence>
        {(creating || editing) && <ProductEditor key={editing?.id ?? 'new'} initial={editing ?? null} onClose={close} />}
      </AnimatePresence>
    </>
  )
}

function SuppliesTab() {
  const { data, error } = useQuery(() => api.listSupplies(), [])
  const { data: products } = useQuery(() => api.listProducts(), [])
  const [draft, setDraft] = useState<Omit<Supply, 'id'>>({ name: '', supplier: '', stock: 0, unit: 'm' })

  const create = async (e: FormEvent) => {
    e.preventDefault()
    if (await attempt(() => api.createSupply(draft), 'Material añadido')) setDraft({ name: '', supplier: '', stock: 0, unit: 'm' })
  }

  if (error) return <ErrorBox error={error} />

  return (
    <>
      <form onSubmit={create} className="mb-8 grid items-end gap-4 border border-line bg-panel p-5 sm:grid-cols-[2fr_2fr_1fr_1fr_auto]">
        <input className={field} placeholder="Material" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <input className={field} placeholder="Proveedor" value={draft.supplier} onChange={(e) => setDraft({ ...draft, supplier: e.target.value })} />
        <input className={field} type="number" placeholder="Stock" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })} />
        <select className={field} value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })}>
          {['m', 'kg', 'ud'].map((u) => (
            <option key={u} className="bg-paper">{u}</option>
          ))}
        </select>
        <button className={btnPrimary}>
          <Plus className="h-4 w-4" /> Añadir
        </button>
      </form>
      <ul className="divide-y divide-line border-y border-line">
        {data?.map((s) => {
          const usedIn = products?.filter((p) => p.supplies.includes(s.id)) ?? []
          return (
            <li key={s.id} className="grid items-center gap-3 py-4 sm:grid-cols-[2fr_2fr_auto_auto]">
              <div>
                <p className="text-sm">{s.name}</p>
                <p className="text-xs text-muted">{s.supplier}</p>
              </div>
              <p className="text-xs text-muted">
                {usedIn.length ? `En ${usedIn.length} prendas: ${usedIn.slice(0, 3).map((p) => p.name).join(', ')}${usedIn.length > 3 ? '…' : ''}` : 'Sin vincular'}
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  key={s.stock}
                  type="number"
                  defaultValue={s.stock}
                  onBlur={(e) => Number(e.target.value) !== s.stock && attempt(() => api.updateSupply(s.id, { stock: Number(e.target.value) }), 'Stock actualizado')}
                  className={`w-20 border-b border-line bg-transparent py-1 text-right outline-none focus:border-ink ${s.stock < 50 ? 'text-bad' : ''}`}
                  aria-label={`Stock de ${s.name}`}
                />
                <span className="text-muted">{s.unit}</span>
              </label>
              <button
                onClick={() => confirm(`¿Eliminar «${s.name}»?`) && attempt(() => api.deleteSupply(s.id), 'Material eliminado')}
                className="justify-self-end p-2 text-muted hover:text-bad"
                aria-label={`Eliminar ${s.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}

const STATUSES: Order['status'][] = ['Pagado', 'Enviado', 'Entregado']

function OrdersTab() {
  const { data, error } = useQuery(() => api.listOrders(), [])
  if (error) return <ErrorBox error={error} />
  return (
    <ul className="divide-y divide-line border-y border-line">
      {data?.map((o) => (
        <li key={o.id} className="grid items-center gap-2 py-4 sm:grid-cols-[1fr_auto_auto] sm:gap-8">
          <div>
            <p className="text-sm">
              #{o.id.slice(1)} · {o.customer}
            </p>
            <p className="text-xs text-muted">
              {o.items.map((i) => `${i.name} ×${i.qty}`).join(', ')} · {o.address}
            </p>
          </div>
          <span className="text-sm">{formatPrice(o.total)}</span>
          <select
            value={o.status}
            onChange={(e) => attempt(() => api.updateOrderStatus(o.id, e.target.value as Order['status']), 'Pedido actualizado')}
            className="bg-transparent text-[11px] uppercase tracking-[0.15em] outline-none"
            aria-label={`Estado del pedido ${o.id}`}
          >
            {STATUSES.map((s) => (
              <option key={s} className="bg-paper">{s}</option>
            ))}
          </select>
        </li>
      ))}
    </ul>
  )
}

function UsersTab() {
  const { user: me } = useAuth()
  const { data, error } = useQuery(() => api.listUsers(), [])
  if (error) return <ErrorBox error={error} />
  return (
    <ul className="divide-y divide-line border-y border-line">
      {data?.map((u) => (
        <li key={u.id} className="flex items-center gap-4 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-2 text-xs">
            {u.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
          </span>
          <span className="min-w-0 flex-1 text-sm">
            {u.name} {u.id === me?.id && <span className="text-xs text-muted">(tú)</span>}
            <span className="block truncate text-xs text-muted">{u.email}</span>
          </span>
          <select
            value={u.role}
            onChange={(e) => attempt(() => api.updateUserRole(u.id, e.target.value as Role), 'Rol actualizado')}
            className="bg-transparent text-[11px] uppercase tracking-[0.15em] outline-none"
            aria-label={`Rol de ${u.name}`}
          >
            {['cliente', 'trabajador', 'encargado'].map((r) => (
              <option key={r} value={r} className="bg-paper">{r}</option>
            ))}
          </select>
          <button
            onClick={() => confirm(`¿Dar de baja a ${u.name}?`) && attempt(() => api.deleteUser(u.id), 'Usuario eliminado')}
            className="p-2 text-muted hover:text-bad"
            aria-label={`Eliminar ${u.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}

export function Manage({ tab = 'prendas', id }: { tab?: string; id?: string }) {
  const { isManager } = useAuth()
  const tabs = [
    { key: 'prendas', label: 'Prendas' },
    { key: 'materiales', label: 'Materiales' },
    { key: 'pedidos', label: 'Pedidos' },
    { key: 'usuarios', label: isManager ? 'Usuarios' : 'Usuarios 🔒' },
  ]

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-12 sm:px-8">
      <p className="eyebrow">Panel interno</p>
      <h1 className="mt-2 font-display text-5xl">Gestión de la tienda</h1>
      <nav className="mt-8 flex gap-6 overflow-x-auto border-b border-line">
        {tabs.map((t) => (
          <a
            key={t.key}
            href={shopHref(`gestion/${t.key}`)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-[11px] uppercase tracking-[0.2em] ${tab === t.key ? 'border-ink' : 'border-transparent text-muted hover:text-ink'}`}
          >
            {t.label}
          </a>
        ))}
      </nav>
      <div className="mt-8">
        {tab === 'prendas' && <ProductsTab editId={id} />}
        {tab === 'materiales' && <SuppliesTab />}
        {tab === 'pedidos' && <OrdersTab />}
        {tab === 'usuarios' && <UsersTab />}
      </div>
    </div>
  )
}
