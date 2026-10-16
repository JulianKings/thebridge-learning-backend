import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Gift } from 'lucide-react'
import { useEffect } from 'react'
import { LEVEL_ICONS } from '../fx/fx'
import { levelById } from '../levels/levels'
import { useProgress } from '../progress/ProgressContext'
import { goToSlide } from '../slides/slides'

const MESSAGES: Record<number, string> = {
  1: '¡Tu servidor está vivo!',
  2: '¡Tus datos ya están en el escaparate!',
  3: '¡Ya sabes quién entra en tu tienda!',
  4: '¡Tu equipo ya puede gestionar el catálogo!',
  5: '¡Tu API es segura!',
  6: '¡Documentación impecable!',
  7: '¡Tienda terminada!',
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#22d3ee', '#34d399', '#ffffff']

export function Celebration() {
  const { celebrate, dismissCelebration } = useProgress()
  const def = celebrate ? levelById(celebrate) : null

  useEffect(() => {
    if (!celebrate) return
    const big = celebrate === 7
    confetti({ particleCount: big ? 220 : 140, spread: big ? 120 : 90, startVelocity: 45, origin: { y: 0.6 }, colors: COLORS })
    const t1 = setTimeout(() => confetti({ particleCount: 90, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors: COLORS }), 250)
    const t2 = setTimeout(() => confetti({ particleCount: 90, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors: COLORS }), 450)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [celebrate])

  const close = () => {
    // Passing the last level opens the finished shop.
    if (def?.id === 7) location.hash = 'tienda'
    else if (def) goToSlide(def.id)
    dismissCelebration()
  }

  const Icon = def ? LEVEL_ICONS[def.id] : null

  return (
    <AnimatePresence>
      {def && Icon && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-fx-bg/80 p-4 font-fx backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 18, stiffness: 200 }}
            className="fx-gradient-bg fx-glow relative w-full max-w-lg rounded-[28px] p-px"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-[27px] bg-fx-card px-8 pb-10 pt-12 text-center text-fx-text sm:px-12">
              {/* Rotating light rays behind the badge. */}
              <motion.div
                aria-hidden="true"
                className="absolute left-1/2 top-[-140px] h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-40"
                style={{ background: 'conic-gradient(from 0deg, #8b5cf6, transparent 15%, #ec4899 30%, transparent 45%, #f59e0b 60%, transparent 75%, #22d3ee 90%, #8b5cf6)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              />
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-72 bg-linear-to-b from-transparent to-fx-card" />

              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.15, damping: 10, stiffness: 160 }}
                className="fx-gradient-bg relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-[0_16px_60px_-10px_#ec4899]"
              >
                <Icon className="h-11 w-11" />
                <span className="absolute -bottom-3 rounded-full bg-fx-bg px-3 py-0.5 text-xs font-bold ring-2 ring-fx-pink">NIVEL {def.id}</span>
              </motion.div>

              <p className="relative mt-8 text-xs font-bold uppercase tracking-[0.3em] text-fx-muted">{def.title} · superado</p>
              <h2 className="fx-gradient-text relative mt-3 text-4xl font-bold leading-tight sm:text-5xl">{MESSAGES[def.id]}</h2>

              <div className="relative mx-auto mt-6 max-w-xs">
                <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-fx-muted">
                  <span>Progreso</span>
                  <span className="text-fx-text">{def.id}/7</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="fx-gradient-bg h-full rounded-full"
                    initial={{ width: `${((def.id - 1) / 7) * 100}%` }}
                    animate={{ width: `${(def.id / 7) * 100}%` }}
                    transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              <p className="relative mx-auto mt-6 flex max-w-sm items-start gap-2 rounded-2xl bg-fx-bg/60 p-4 text-left text-sm leading-relaxed text-fx-muted">
                <Gift className="mt-0.5 h-4 w-4 shrink-0 text-fx-amber" /> {def.reward}
              </p>

              <button
                onClick={close}
                autoFocus
                className="fx-gradient-bg relative mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-[0_10px_30px_-8px_#ec4899] transition hover:scale-105"
              >
                {def.id === 7 ? 'Entrar en la tienda' : 'Ver lo desbloqueado'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
