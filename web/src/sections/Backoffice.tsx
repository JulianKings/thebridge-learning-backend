import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Garment } from '../components/Garment'
import { PRODUCTS, formatPrice } from '../data/mock'
import { SectionHeading } from './SectionHeading'

export function Backoffice() {
  return (
    <div className="px-4 py-16 sm:px-8">
      <SectionHeading level={3} title="Panel de trabajador">
        <button className="flex items-center gap-2 bg-ink px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-paper">
          <Plus className="h-4 w-4" /> Nueva prenda
        </button>
      </SectionHeading>

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
            {PRODUCTS.map((p) => (
              <tr key={p.id} className="border-b border-line">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Garment kind={p.kind} tone={p.tone} ink={p.ink} className="h-12 w-9 shrink-0" />
                    <span>{p.name}</span>
                  </div>
                </td>
                <td className="text-muted">{p.category}</td>
                <td>{formatPrice(p.price)}</td>
                <td className={p.stock < 10 ? 'text-bad' : ''}>{p.stock} ud</td>
                <td className="text-right">
                  <div className="inline-flex gap-1 text-muted">
                    <button className="p-2 hover:text-ink" aria-label={`Editar ${p.name}`}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="p-2 hover:text-bad" aria-label={`Eliminar ${p.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
