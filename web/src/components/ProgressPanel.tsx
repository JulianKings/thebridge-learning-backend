import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Lock } from 'lucide-react'
import { useState } from 'react'
import { LevelBadge, ProgressRing } from '../fx/fx'
import { LEVELS } from '../levels/levels'
import { useProgress } from '../progress/ProgressContext'
import { goToSlide } from '../slides/slides'
import { CheckList } from './CheckList'

export function ProgressBar({ className = '' }: { className?: string }) {
  const { completed } = useProgress()
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-white/10 ${className}`}>
      <motion.div
        className="fx-gradient-bg h-full rounded-full"
        initial={false}
        animate={{ width: `${(completed / 7) * 100}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
    </div>
  )
}

export function ProgressPanel({ onNavigate }: { onNavigate?: () => void }) {
  const { completed, running, failedLevel, checks } = useProgress()
  const [open, setOpen] = useState<number | null>(null)
  const current = Math.min(completed + 1, 7)
  const expanded = open ?? running ?? failedLevel ?? current
  const totalChecks = LEVELS.reduce((n, l) => n + l.checks.length, 0)
  const passedChecks = Object.values(checks).reduce((n, c) => n + Object.values(c).filter((s) => s === 'pass').length, 0)

  return (
    <div className="flex h-full flex-col font-fx text-fx-text">
      <div className="flex items-center gap-5 px-5 pb-5 pt-6">
        <div className="relative">
          <ProgressRing value={completed / 7} size={112} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold leading-none">
              {completed}
              <span className="text-base text-fx-muted">/7</span>
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-widest text-fx-muted">niveles</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fx-muted">Progreso de la API</p>
          <p className="mt-1 text-xl font-bold leading-tight">
            {completed >= 7 ? <span className="fx-gradient-text">¡Completado!</span> : LEVELS[completed].title}
          </p>
          <p className="mt-1 text-xs text-fx-muted">
            {passedChecks}/{totalChecks} checks superados
          </p>
        </div>
      </div>

      <ol className="flex-1 space-y-2 overflow-y-auto px-3 pb-6">
        {LEVELS.map((l) => {
          const done = completed >= l.id
          const isCurrent = l.id === completed + 1
          const isOpen = expanded === l.id && (done || isCurrent)
          const state = done ? 'done' : isCurrent ? 'next' : 'locked'
          return (
            <li
              key={l.id}
              className={`overflow-hidden rounded-2xl transition-colors ${
                isCurrent ? 'bg-fx-card-2 ring-1 ring-fx-pink/50' : done ? 'bg-fx-card' : 'bg-fx-card/50'
              }`}
            >
              <button
                onClick={() => {
                  setOpen(isOpen ? -1 : l.id)
                  goToSlide(l.id)
                  onNavigate?.()
                }}
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                <LevelBadge level={l.id} state={state} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-semibold ${state === 'locked' ? 'text-fx-muted' : ''}`}>
                    <span className="text-fx-muted">{l.id}.</span> {l.title}
                  </span>
                  <span className="block truncate text-xs text-fx-muted">{l.tagline}</span>
                </span>
                {done ? (
                  <Check className="h-4 w-4 text-fx-green" strokeWidth={3} />
                ) : isCurrent ? (
                  <ChevronDown className={`h-4 w-4 text-fx-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-fx-muted/60" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                  >
                    <CheckList level={l} compact />
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
