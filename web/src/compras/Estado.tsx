import { motion } from 'framer-motion'
import type { Estado } from './api'

export const ESTADO_STYLE: Record<Estado, { label: string; dot: string; chip: string }> = {
  pendiente: { label: 'Pendiente', dot: 'bg-white', chip: 'bg-amber-600 text-white' },
  enviado: { label: 'Enviado', dot: 'bg-white', chip: 'bg-sky-700 text-white' },
  entregado: { label: 'Entregado', dot: 'bg-white', chip: 'bg-emerald-700 text-white' },
  cancelado: { label: 'Cancelado', dot: 'bg-white', chip: 'bg-rose-700 text-white' },
}

export function EstadoBadge({ estado = 'pendiente' }: { estado?: Estado }) {
  const s = ESTADO_STYLE[estado]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${s.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${estado === 'pendiente' ? 'animate-pulse' : ''}`} />
      {s.label}
    </span>
  )
}

const PASOS: Estado[] = ['pendiente', 'enviado', 'entregado']

export function EstadoTracker({ estado = 'pendiente' }: { estado?: Estado }) {
  if (estado === 'cancelado') return <EstadoBadge estado="cancelado" />
  const actual = PASOS.indexOf(estado)
  return (
    <div className="flex items-center gap-2" aria-label={`Estado: ${estado}`}>
      {PASOS.map((paso, i) => (
        <div key={paso} className="flex items-center gap-2">
          <span className={`text-[10px] uppercase tracking-[0.14em] ${i <= actual ? 'text-ink' : 'text-muted/60'}`}>{ESTADO_STYLE[paso].label}</span>
          {i < PASOS.length - 1 && (
            <span className="relative h-px w-8 overflow-hidden bg-line">
              <motion.span
                className="absolute inset-0 origin-left bg-pop"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: i < actual ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.3 }}
              />
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
