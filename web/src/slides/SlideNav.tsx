import { motion } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight, Home, Lock } from 'lucide-react'
import { LEVELS } from '../levels/levels'
import { useProgress } from '../progress/ProgressContext'
import { SLIDE_KEYS, goToSlide } from './slides'

const arrow =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fx-card text-fx-text ring-1 ring-fx-line transition hover:bg-fx-card-2 hover:ring-fx-pink/60'

// Level track: nodes joined by a line that fills with the gradient as the
// students pass levels.
export function SlideNav({ index }: { index: number }) {
  const { completed } = useProgress()
  const items = [{ id: 0, title: 'Inicio', short: 'Inicio' }, ...LEVELS.map((l) => ({ id: l.id, title: l.title, short: l.short }))]
  const current = items[index]

  return (
    <div className="flex shrink-0 items-center gap-3 px-3 pb-2 pt-4 font-fx sm:px-5">
      <button onClick={() => goToSlide(index - 1)} className={arrow} aria-label="Anterior">
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 px-4 md:block">
        <div className="absolute left-8 right-8 top-[18px] h-1 rounded-full bg-white/10">
          <motion.div
            className="fx-gradient-bg h-full rounded-full shadow-[0_0_16px_#ec4899aa]"
            initial={false}
            animate={{ width: `${(completed / 7) * 100}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <ol className="relative flex justify-between">
          {items.map((it) => {
            const active = it.id === index
            const done = it.id > 0 && completed >= it.id
            const next = it.id === completed + 1
            return (
              <li key={it.id} className="flex w-16 flex-col items-center">
                <a
                  href={`#${SLIDE_KEYS[it.id]}`}
                  aria-current={active ? 'step' : undefined}
                  aria-label={it.title}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-transform hover:scale-110 ${
                    done || it.id === 0
                      ? 'bg-[#221c47] text-[#c4b5fd] ring-1 ring-fx-violet/50'
                      : next
                        ? 'fx-pulse bg-fx-card-2 text-fx-text ring-2 ring-fx-pink'
                        : 'bg-fx-card text-fx-muted ring-1 ring-fx-line'
                  } ${active ? 'scale-115 shadow-[0_0_0_3px_#0a0918,0_0_0_5px_#f5f3ffcc]' : ''}`}
                >
                  {it.id === 0 ? (
                    <Home className="h-4 w-4" />
                  ) : done ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : next ? (
                    it.id
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                </a>
                <span
                  className={`mt-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider ${
                    active ? 'text-fx-text' : 'hidden text-fx-muted xl:block'
                  }`}
                >
                  {it.short}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="flex flex-1 flex-col items-center gap-1.5 md:hidden">
        <span className="text-xs font-semibold uppercase tracking-wider text-fx-text">
          {index > 0 && <span className="text-fx-muted">Nivel {index} · </span>}
          {current.title}
        </span>
        <span className="flex gap-1">
          {items.map((it) => (
            <span key={it.id} className={`h-1.5 rounded-full transition-all ${it.id === index ? 'fx-gradient-bg w-5' : 'w-1.5 bg-white/20'}`} />
          ))}
        </span>
      </div>

      <button onClick={() => goToSlide(index + 1)} className={arrow} aria-label="Siguiente">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
