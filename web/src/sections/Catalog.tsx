import { useState } from 'react'
import { Garment } from '../components/Garment'
import { PRODUCTS, formatPrice } from '../data/mock'
import type { Product } from '../data/mock'
import { SectionHeading } from './SectionHeading'

const FILTERS = ['Todo', 'Mujer', 'Hombre', 'Unisex'] as const

export function ProductTile({ p }: { p: Product }) {
  return (
    <article className="group">
      <div className="relative">
        <Garment kind={p.kind} tone={p.tone} ink={p.ink} className="aspect-[3/4] transition-transform duration-700 group-hover:scale-[1.015]" />
        {p.isNew && <span className="absolute left-3 top-3 bg-paper px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-ink">Nuevo</span>}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3 text-[13px]">
        <h3 className="uppercase tracking-wide">{p.name}</h3>
        <span className="shrink-0 text-muted">{formatPrice(p.price)}</span>
      </div>
      <p className="mt-0.5 text-xs text-muted">{p.category}</p>
    </article>
  )
}

export function Catalog() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Todo')
  const visible = filter === 'Todo' ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter)

  return (
    <div className="px-4 py-16 sm:px-8">
      <SectionHeading level={2} title="La colección">
        <div className="flex gap-5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] uppercase tracking-[0.18em] ${filter === f ? 'border-b border-ink text-ink' : 'text-muted hover:text-ink'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </SectionHeading>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
        {visible.map((p) => (
          <ProductTile key={p.id} p={p} />
        ))}
      </div>
    </div>
  )
}
