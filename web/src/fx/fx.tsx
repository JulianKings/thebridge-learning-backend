import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import { BookOpen, Database, KeyRound, PencilRuler, Plug, SlidersHorizontal, Store } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

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
  1: 'thebridge.store',
  2: 'thebridge.store/coleccion',
  3: 'thebridge.store/panel',
  4: 'thebridge.store/api-docs',
  5: 'thebridge.store/cuenta',
  6: 'thebridge.store/buscar',
  7: 'thebridge.store/gestion',
}

export function Aurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-fx-bg">
      <div className="fx-blob absolute -left-[10%] -top-[20%] h-[60vh] w-[60vh] rounded-full bg-fx-violet/30 blur-[120px]" />
      <div className="fx-blob absolute -right-[10%] top-[10%] h-[55vh] w-[55vh] rounded-full bg-fx-pink/25 blur-[120px] [animation-delay:-7s]" />
      <div className="fx-blob absolute bottom-[-25%] left-[30%] h-[50vh] w-[50vh] rounded-full bg-fx-amber/15 blur-[120px] [animation-delay:-14s]" />
      <div className="fx-grid absolute inset-0" />
      {STARS.map((s, i) => (
        <span
          key={i}
          className="fx-twinkle absolute h-0.5 w-0.5 rounded-full bg-white"
          style={{ left: `${s[0]}%`, top: `${s[1]}%`, animationDelay: `${s[2]}s` }}
        />
      ))}
      <Spotlight />
    </div>
  )
}

// Fixed pseudo-random positions, so the sky doesn't reshuffle on every render.
const STARS = Array.from({ length: 36 }, (_, i) => [(i * 37) % 100, (i * 61) % 100, (i % 7) * 0.6])

// A soft light that follows the pointer. Updated through CSS variables, so React doesn't re-render.
function Spotlight() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let frame = 0
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        ref.current?.style.setProperty('--x', `${e.clientX}px`)
        ref.current?.style.setProperty('--y', `${e.clientY}px`)
      })
    }
    window.addEventListener('pointermove', move)
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(frame)
    }
  }, [])
  return (
    <div
      ref={ref}
      className="absolute inset-0 transition-opacity duration-500 [background:radial-gradient(600px_circle_at_var(--x,50%)_var(--y,-20%),#8b5cf61f,transparent_60%)]"
    />
  )
}

export function Tilt({ children, className = '', max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const rx = useSpring(0, { stiffness: 200, damping: 18 })
  const ry = useSpring(0, { stiffness: 200, damping: 18 })
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, #ffffff22, transparent 55%)`
  return (
    <motion.div
      className={`group/tilt relative perspective-[900px] ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        ry.set((px - 0.5) * max * 2)
        rx.set((0.5 - py) * max * 2)
        gx.set(px * 100)
        gy.set(py * 100)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
    >
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }} className="relative h-full">
        {children}
        <motion.span style={{ background: glare }} className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100" />
      </motion.div>
    </motion.div>
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
