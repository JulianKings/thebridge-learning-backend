import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Garment } from '../components/Garment'
import { LockedSection } from '../components/LockedSection'
import { formatPrice } from '../data/mock'
import type { Product } from '../data/mock'
import { useProgress } from '../progress/ProgressContext'
import { useStore } from '../store/StoreContext'
import { SectionHeading } from './SectionHeading'

const blank = (): Product => ({
  id: `p${Date.now()}`,
  name: '',
  price: 39.95,
  category: 'Unisex',
  sizes: ['S', 'M', 'L'],
  kind: 'tee',
  tone: '#e4e0d8',
  ink: '#7a756c',
  stock: 10,
  supplies: [],
  isNew: true,
})

function ProductForm({ initial, onSave, onCancel }: { initial: Product; onSave: (p: Product) => void; onCancel: () => void }) {
  const [p, setP] = useState(initial)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (p.name.trim()) onSave(p)
  }
  const field = 'border-b border-line bg-transparent py-1.5 text-sm outline-none focus:border-ink'
  return (
    <form onSubmit={submit} className="grid gap-4 border border-ink bg-panel p-5 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-end">
      <label className="grid gap-1 text-[11px] text-muted">
        Nombre
        <input autoFocus className={field} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} placeholder="Sudadera de felpa" />
      </label>
      <label className="grid gap-1 text-[11px] text-muted">
        Precio (€)
        <input type="number" step="0.05" className={field} value={p.price} onChange={(e) => setP({ ...p, price: Number(e.target.value) })} />
      </label>
      <label className="grid gap-1 text-[11px] text-muted">
        Categoría
        <select className={field} value={p.category} onChange={(e) => setP({ ...p, category: e.target.value as Product['category'] })}>
          {['Mujer', 'Hombre', 'Unisex'].map((c) => (
            <option key={c} className="bg-paper">{c}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-[11px] text-muted">
        Stock
        <input type="number" className={field} value={p.stock} onChange={(e) => setP({ ...p, stock: Number(e.target.value) })} />
      </label>
      <div className="flex gap-2">
        <button className="bg-ink px-4 py-2 text-[11px] uppercase tracking-widest text-paper">Guardar</button>
        <button type="button" onClick={onCancel} className="px-3 py-2 text-[11px] uppercase tracking-widest text-muted">
          Cancelar
        </button>
      </div>
    </form>
  )
}

export function Backoffice() {
  const { role } = useProgress()
  const { products, saveProduct, deleteProduct } = useStore()
  const [editing, setEditing] = useState<Product | null>(null)
  const canEdit = role === 'trabajador' || role === 'encargado'

  const save = (p: Product) => {
    saveProduct(p)
    setEditing(null)
  }

  return (
    <LockedSection level={4} className="px-4 py-16 sm:px-8">
      <SectionHeading level={4} title="Panel de trabajador">
        <button
          disabled={!canEdit}
          onClick={() => setEditing(blank())}
          className="flex items-center gap-2 bg-ink px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-paper disabled:opacity-30"
        >
          <Plus className="h-4 w-4" /> Nueva prenda
        </button>
      </SectionHeading>

      {!canEdit && (
        <p className="mb-6 border-l-2 border-bad bg-bad-soft px-4 py-3 text-sm text-bad">
          Estás viendo la tienda como <strong>{role}</strong>. Solo los trabajadores pueden editar el catálogo.
        </p>
      )}

      {editing && !products.some((p) => p.id === editing.id) && (
        <div className="mb-4">
          <ProductForm initial={editing} onSave={save} onCancel={() => setEditing(null)} />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="eyebrow border-b border-line">
              <th className="py-3 font-normal">Prenda</th>
              <th className="py-3 font-normal">Categoría</th>
              <th className="py-3 font-normal">Precio</th>
              <th className="py-3 font-normal">Stock</th>
              <th className="py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) =>
              editing?.id === p.id ? (
                <tr key={p.id}>
                  <td colSpan={5} className="py-2">
                    <ProductForm initial={editing} onSave={save} onCancel={() => setEditing(null)} />
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className="border-b border-line">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Garment kind={p.kind} tone={p.tone} ink={p.ink} className="h-12 w-9 shrink-0" />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{p.category}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>
                    <span className={p.stock < 10 ? 'text-bad' : ''}>{p.stock} ud</span>
                  </td>
                  <td className="text-right">
                    <div className="inline-flex gap-1">
                      <button disabled={!canEdit} onClick={() => setEditing(p)} className="p-2 text-muted hover:text-ink disabled:opacity-30" aria-label={`Editar ${p.name}`}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button disabled={!canEdit} onClick={() => deleteProduct(p.id)} className="p-2 text-muted hover:text-bad disabled:opacity-30" aria-label={`Eliminar ${p.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </LockedSection>
  )
}
