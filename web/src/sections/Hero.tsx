import { ArrowRight } from 'lucide-react'
import { Garment } from '../components/Garment'
import { LockedSection } from '../components/LockedSection'
import { PRODUCTS } from '../data/mock'

const STATUS = [
  { k: 'Servidor', v: 'Express 5 · online' },
  { k: 'Base de datos', v: 'MongoDB Atlas · conectada' },
  { k: 'Latencia', v: '42 ms' },
  { k: 'Último despliegue', v: 'hace 3 min' },
]

export function Hero() {
  const [a, b] = [PRODUCTS[0], PRODUCTS[2]]
  return (
    <LockedSection level={1}>
      <div className="grid gap-8 px-4 py-12 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:py-16">
        <div className="order-2 lg:order-1">
          <p className="eyebrow">Otoño — Invierno 2026</p>
          <h2 className="mt-4 font-display text-6xl leading-[0.95] sm:text-7xl lg:text-6xl xl:text-7xl">
            Lo esencial,
            <br />
            <em>bien hecho.</em>
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
            Tejidos nobles, cortes limpios y prendas pensadas para durar. Una colección que se construye pieza a pieza.
          </p>
          <a
            href="#catalogo"
            className="mt-8 inline-flex items-center gap-3 border-b border-ink pb-1 text-xs uppercase tracking-[0.2em]"
          >
            Ver colección <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="order-1 grid grid-cols-[1.3fr_1fr] items-end gap-3 lg:order-2">
          <Garment kind={a.kind} tone={a.tone} ink={a.ink} className="aspect-[3/4]" />
          <Garment kind={b.kind} tone={b.tone} ink={b.ink} className="aspect-[3/4.4]" />
        </div>
      </div>

      <dl className="grid grid-cols-2 border-y border-line font-mono text-[11px] sm:grid-cols-4">
        {STATUS.map((s, i) => (
          <div key={s.k} className={`px-4 py-4 sm:px-8 ${i > 0 ? 'sm:border-l' : ''} ${i % 2 ? 'border-l' : ''} border-line`}>
            <dt className="text-muted">{s.k}</dt>
            <dd className="mt-1 flex items-center gap-2">
              {i < 2 && <span className="h-1.5 w-1.5 rounded-full bg-ok" />}
              {s.v}
            </dd>
          </div>
        ))}
      </dl>
    </LockedSection>
  )
}
