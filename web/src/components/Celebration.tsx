import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
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

export function Celebration() {
  const { celebrate, dismissCelebration } = useProgress()
  const def = celebrate ? levelById(celebrate) : null

  useEffect(() => {
    if (!celebrate) return
    const big = celebrate === 7
    const colors = ['#141414', '#c8a96a', '#d9cfc1', '#b6533b', '#ffffff']
    confetti({ particleCount: big ? 220 : 120, spread: big ? 120 : 80, origin: { y: 0.6 }, colors })
    if (big) {
      setTimeout(() => confetti({ particleCount: 120, angle: 60, spread: 70, origin: { x: 0 }, colors }), 300)
      setTimeout(() => confetti({ particleCount: 120, angle: 120, spread: 70, origin: { x: 1 }, colors }), 500)
    }
  }, [celebrate])

  const close = () => {
    if (def) goToSlide(def.id)
    dismissCelebration()
  }

  return (
    <AnimatePresence>
      {def && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 30, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            className="w-full max-w-lg bg-panel p-8 text-center sm:p-12"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow">Nivel {def.id} completado · {def.title}</p>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">{MESSAGES[def.id]}</h2>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted">{def.reward}</p>
            <button
              onClick={close}
              autoFocus
              className="mt-8 bg-ink px-8 py-3 text-xs uppercase tracking-[0.2em] text-paper hover:opacity-85"
            >
              {def.id === 7 ? 'Ver la tienda' : 'Ver lo desbloqueado'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
