import { ArrowRight } from 'lucide-react'
import { Garment } from '../components/Garment'
import { API_URL } from '../config'
import { PRODUCTS } from '../data/mock'
import { useProgress } from '../progress/ProgressContext'

export function Hero() {
  const { statusResponse, checkedAt } = useProgress()
  const [a, b] = [PRODUCTS[0], PRODUCTS[2]]
  const message = (statusResponse?.body as { message?: string } | null)?.message

  const status = [
    { k: 'Servidor', v: statusResponse ? 'Express · online' : 'Sin respuesta', ok: !!statusResponse },
    { k: 'Respuesta', v: message ?? '—', ok: !!message },
    { k: 'Latencia', v: statusResponse ? `${statusResponse.ms} ms` : '—' },
    { k: 'Última comprobación', v: checkedAt ? checkedAt.toLocaleTimeString('es-ES') : '—' },
  ]

  return (
    <>
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
          <a href="#catalogo" className="mt-8 inline-flex items-center gap-3 border-b border-ink pb-1 text-xs uppercase tracking-[0.2em]">
            Ver colección <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="order-1 grid grid-cols-[1.3fr_1fr] items-end gap-3 lg:order-2">
          <Garment kind={a.kind} tone={a.tone} ink={a.ink} className="aspect-[3/4]" />
          <Garment kind={b.kind} tone={b.tone} ink={b.ink} className="aspect-[3/4.4]" />
        </div>
      </div>

      <dl className="grid grid-cols-2 border-y border-line font-mono text-[11px] sm:grid-cols-4">
        {status.map((s, i) => (
          <div key={s.k} className={`border-line px-4 py-4 sm:px-8 ${i > 0 ? 'sm:border-l' : ''} ${i % 2 ? 'border-l' : ''}`}>
            <dt className="text-muted">{s.k}</dt>
            <dd className="mt-1 flex items-center gap-2 truncate">
              {s.ok !== undefined && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.ok ? 'bg-ok' : 'bg-bad'}`} />}
              {s.v}
            </dd>
          </div>
        ))}
      </dl>
      <p className="px-4 py-3 font-mono text-[11px] text-muted sm:px-8">{API_URL}/status</p>
    </>
  )
}
