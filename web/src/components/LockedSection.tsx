import { AnimatePresence, motion } from 'framer-motion'
import { Lock, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { levelById } from '../levels/levels'
import { useProgress } from '../progress/ProgressContext'
import { CheckList } from './CheckList'

type Props = {
  level: number
  className?: string
  children: ReactNode
}

// Wraps a part of the store. Until `level` is passed, the content is a
// blurred preview with mock data and a card explaining what to build.
export function LockedSection({ level, className = '', children }: Props) {
  const { isUnlocked, completed, running, failedLevel } = useProgress()
  const def = levelById(level)
  const unlocked = isUnlocked(level)
  const isNext = completed + 1 === level

  return (
    <section
      aria-label={def.title}
      className={`relative ${unlocked ? '' : 'h-full min-h-[560px] overflow-hidden'} ${className}`}
    >
      <motion.div
        initial={false}
        animate={{
          filter: unlocked ? 'blur(0px) grayscale(0)' : 'blur(9px) grayscale(0.6)',
          opacity: unlocked ? 1 : 0.55,
          scale: unlocked ? 1 : 0.985,
        }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className={unlocked ? '' : 'pointer-events-none select-none'}
        inert={!unlocked}
        aria-hidden={!unlocked}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {!unlocked && (
          <motion.div
            key="lock"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.5 } }}
            className="absolute inset-0 z-10 flex items-center justify-center px-4 py-10"
          >
            <div
              className={`w-full max-w-md border bg-panel/95 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8 ${
                isNext ? 'border-ink' : 'border-line'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow">Nivel {def.id} de 7</span>
                {isNext ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-ink">
                    <Sparkles className="h-3.5 w-3.5" /> Siguiente objetivo
                  </span>
                ) : (
                  <Lock className="h-4 w-4 text-muted" />
                )}
              </div>
              <h3 className="mt-3 font-display text-3xl leading-tight">{def.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{def.goal}</p>

              <div className="my-5 h-px bg-line" />
              <CheckList level={def} />

              <div className="mt-5 text-xs text-muted">
                {running === level ? (
                  <span className="text-ink">Comprobando tu API…</span>
                ) : failedLevel === level ? (
                  <span className="text-bad">Casi. Revisa el punto marcado en rojo y vuelve a intentarlo.</span>
                ) : isNext ? (
                  <>Al completarlo: {def.reward}</>
                ) : (
                  <>Completa el nivel {level - 1} para empezar este.</>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
