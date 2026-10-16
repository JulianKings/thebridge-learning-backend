import { motion } from 'framer-motion'
import { Check, ChevronDown, Lock } from 'lucide-react'
import { useState } from 'react'
import { LEVELS } from '../levels/levels'
import { useProgress } from '../progress/ProgressContext'
import { goToSlide } from '../slides/slides'
import { CheckList } from './CheckList'

export function ProgressBar({ className = '' }: { className?: string }) {
  const { completed } = useProgress()
  return (
    <div className={`flex gap-1 ${className}`}>
      {LEVELS.map((l) => (
        <div key={l.id} className="h-1 flex-1 overflow-hidden bg-line">
          <motion.div
            className="h-full bg-accent"
            initial={false}
            animate={{ width: completed >= l.id ? '100%' : '0%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      ))}
    </div>
  )
}

export function ProgressPanel({ onNavigate }: { onNavigate?: () => void }) {
  const { completed, running, failedLevel } = useProgress()
  const [open, setOpen] = useState<number | null>(null)
  const current = Math.min(completed + 1, 7)
  const expanded = open ?? running ?? failedLevel ?? current

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-6">
        <p className="eyebrow">Progreso de la API</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-5xl">{completed}</span>
          <span className="text-sm text-muted">/ 7 niveles</span>
        </div>
        <ProgressBar className="mt-4" />
      </div>

      <ol className="mt-6 flex-1 overflow-y-auto border-t border-line">
        {LEVELS.map((l) => {
          const done = completed >= l.id
          const isCurrent = l.id === completed + 1
          const isOpen = expanded === l.id
          return (
            <li key={l.id} className="border-b border-line">
              <button
                onClick={() => {
                  setOpen(isOpen ? -1 : l.id)
                  goToSlide(l.id)
                  onNavigate?.()
                }}
                className="flex w-full items-center gap-3 px-6 py-3.5 text-left"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                    done
                      ? 'border-accent bg-accent text-paper'
                      : isCurrent
                        ? 'border-ink text-ink'
                        : 'border-line text-muted'
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : l.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm ${done || isCurrent ? 'text-ink' : 'text-muted'}`}>{l.title}</span>
                  <span className="block truncate text-xs text-muted">{l.tagline}</span>
                </span>
                {!done && !isCurrent ? (
                  <Lock className="h-3.5 w-3.5 text-muted" />
                ) : (
                  <ChevronDown className={`h-4 w-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
              </button>
              {isOpen && (done || isCurrent) && (
                <div className="px-6 pb-4 pl-15">
                  <CheckList level={l} compact />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
