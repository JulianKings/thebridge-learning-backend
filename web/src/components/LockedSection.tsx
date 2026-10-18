import { AnimatePresence, motion } from 'framer-motion'
import { Gift, Lock, RotateCw, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { LevelBadge } from '../fx/fx'
import { levelById } from '../levels/levels'
import { useProgress } from '../progress/ProgressContext'
import { CheckList } from './CheckList'

// Until `level` passes, its part of the store is a blurred preview with mock
// data under a card explaining what to build.
export function LockedSection({ level, children }: { level: number; children: ReactNode }) {
  const { isUnlocked, completed, running, failedLevel, results, runChecks } = useProgress()
  const def = levelById(level)
  const unlocked = isUnlocked(level)
  const isNext = completed + 1 === level
  const passed = Object.values(results[level] ?? {}).filter((r) => r.status === 'pass').length
  const pending = def.checks.length === 0

  return (
    <section
      aria-label={def.title}
      className={`relative ${unlocked ? '' : 'h-full min-h-[600px] overflow-hidden'}`}
    >
      <motion.div
        initial={false}
        animate={{
          filter: unlocked ? 'blur(0px) grayscale(0)' : 'blur(8px) grayscale(0.5)',
          opacity: unlocked ? 1 : 0.5,
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
            exit={{ opacity: 0, scale: 1.08, filter: 'blur(6px)', transition: { duration: 0.6 } }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-linear-to-b from-fx-bg/10 via-fx-bg/40 to-fx-bg/10 px-4 py-10"
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`relative w-full max-w-md rounded-3xl p-px font-fx ${isNext ? 'fx-gradient-bg fx-glow' : 'bg-fx-line'}`}
            >
              <div className="rounded-[23px] bg-fx-card/95 p-6 text-fx-text backdrop-blur-xl sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <LevelBadge level={level} state={isNext ? 'next' : 'locked'} size="lg" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fx-muted">Nivel {def.id} de 7</p>
                      <h3 className={`text-3xl font-bold leading-tight ${isNext ? 'fx-gradient-text' : ''}`}>{def.title}</h3>
                    </div>
                  </div>
                  {isNext ? (
                    <span className="flex items-center gap-1 rounded-full bg-fx-pink/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-fx-pink">
                      <Sparkles className="h-3 w-3" /> Ahora
                    </span>
                  ) : (
                    <Lock className="h-5 w-5 text-fx-muted" />
                  )}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-fx-muted">{def.goal}</p>

                <div className="mt-5 rounded-2xl bg-fx-bg/60 p-4">
                  {pending ? (
                    <p className="text-sm text-fx-muted">Los checks de este nivel se publicarán cuando empecéis esta etapa.</p>
                  ) : (
                    <>
                      <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-fx-muted">
                        <span>Checklist</span>
                        <span className={passed ? 'text-fx-green' : ''}>
                          {passed}/{def.checks.length}
                        </span>
                      </div>
                      <CheckList level={def} />
                    </>
                  )}
                </div>

                <div className="mt-5 flex items-start gap-2 text-xs">
                  {failedLevel === level ? (
                    <span className="text-fx-red">¡Casi! Revisa el punto en rojo y vuelve a intentarlo.</span>
                  ) : isNext ? (
                    <>
                      <Gift className="mt-px h-4 w-4 shrink-0 text-fx-amber" />
                      <span className="text-fx-muted">
                        <span className="font-semibold text-fx-amber">Recompensa:</span> {def.reward}
                      </span>
                    </>
                  ) : (
                    <span className="text-fx-muted">Completa el nivel {level - 1} para empezar este.</span>
                  )}
                </div>

                {isNext && !pending && (
                  <button
                    onClick={runChecks}
                    disabled={running}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-fx-line bg-white/5 py-2.5 text-sm font-semibold transition hover:border-fx-pink/60 disabled:opacity-60"
                  >
                    <RotateCw className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
                    {running ? 'Comprobando tu API…' : 'Comprobar ahora'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
