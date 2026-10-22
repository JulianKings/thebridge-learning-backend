import { motion } from 'framer-motion'
import { BookOpen, Database, KeyRound, PencilRuler, Plug, SlidersHorizontal, Store } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useId } from 'react'

export const LEVEL_ICONS: Record<number, LucideIcon> = {
  1: Plug,
  2: Database,
  3: PencilRuler,
  4: BookOpen,
  5: KeyRound,
  6: SlidersHorizontal,
  7: Store,
}

export const LEVEL_URLS: Record<number, string> = {
  1: 'hilo.store',
  2: 'hilo.store/coleccion',
  3: 'hilo.store/panel',
  4: 'hilo.store/api-docs',
  5: 'hilo.store/cuenta',
  6: 'hilo.store/buscar',
  7: 'hilo.store/gestion',
}

export function Aurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-fx-bg">
      <div className="fx-blob absolute -left-[10%] -top-[20%] h-[60vh] w-[60vh] rounded-full bg-fx-violet/30 blur-[120px]" />
      <div className="fx-blob absolute -right-[10%] top-[10%] h-[55vh] w-[55vh] rounded-full bg-fx-pink/25 blur-[120px] [animation-delay:-7s]" />
      <div className="fx-blob absolute bottom-[-25%] left-[30%] h-[50vh] w-[50vh] rounded-full bg-fx-amber/15 blur-[120px] [animation-delay:-14s]" />
      <div className="fx-grid absolute inset-0" />
    </div>
  )
}

export function ProgressRing({ value, size = 128, stroke = 10 }: { value: number; size?: number; stroke?: number }) {
  const id = useId()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 drop-shadow-[0_0_18px_#ec489966]">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="55%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ffffff14" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={false}
        animate={{ strokeDashoffset: c * (1 - value) }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

export function LevelBadge({ level, state, size = 'md' }: { level: number; state: 'done' | 'next' | 'locked'; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = LEVEL_ICONS[level]
  const dims = { sm: 'h-8 w-8 rounded-lg', md: 'h-11 w-11 rounded-xl', lg: 'h-16 w-16 rounded-2xl' }[size]
  const icon = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' }[size]
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center ${dims} ${
        state === 'done'
          ? 'bg-fx-violet/15 text-[#c4b5fd] ring-1 ring-fx-violet/45 shadow-[0_0_18px_-6px_#8b5cf6]'
          : state === 'next'
            ? 'fx-pulse bg-fx-card-2 text-fx-text ring-1 ring-fx-pink'
            : 'bg-fx-card text-fx-muted/60 ring-1 ring-fx-line'
      }`}
    >
      <Icon className={icon} strokeWidth={2} />
    </span>
  )
}
