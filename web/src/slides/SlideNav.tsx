import { Check, ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { LEVELS } from '../levels/levels'
import { useProgress } from '../progress/ProgressContext'
import { SLIDE_KEYS, goToSlide } from './slides'

export function SlideNav({ index }: { index: number }) {
  const { completed } = useProgress()
  const items = [{ id: 0, title: 'Inicio', short: 'Inicio' }, ...LEVELS.map((l) => ({ id: l.id, title: l.title, short: l.short }))]
  const current = items[index]

  return (
    <div className="flex h-13 shrink-0 items-center gap-2 border-b border-line px-2 sm:px-4">
      <button onClick={() => goToSlide(index - 1)} className="p-2 text-muted hover:text-ink" aria-label="Anterior">
        <ChevronLeft className="h-5 w-5" />
      </button>

      <ol className="hidden flex-1 items-center justify-center md:flex">
        {items.map((it) => {
          const active = it.id === index
          const done = it.id > 0 && completed >= it.id
          const locked = it.id > completed + 1
          return (
            <li key={it.id}>
              <a
                href={`#${SLIDE_KEYS[it.id]}`}
                aria-current={active ? 'step' : undefined}
                className={`flex items-center gap-1.5 border-b px-2.5 whitespace-nowrap py-1.5 text-[11px] uppercase tracking-[0.12em] transition-colors xl:px-3 ${
                  active ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {it.id > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center">
                    {done ? (
                      <Check className="h-3.5 w-3.5 text-accent" strokeWidth={3} />
                    ) : locked ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      <span className="text-[10px]">{it.id}</span>
                    )}
                  </span>
                )}
                <span className={active ? '' : 'hidden xl:inline'}>{it.short}</span>
              </a>
            </li>
          )
        })}
      </ol>

      <div className="flex flex-1 items-center justify-center gap-3 md:hidden">
        <span className="text-[11px] uppercase tracking-[0.16em]">
          {index > 0 && <span className="text-muted">Nivel {index} · </span>}
          {current.title}
        </span>
        <span className="flex gap-1">
          {items.map((it) => (
            <span key={it.id} className={`h-1 w-1 rounded-full ${it.id === index ? 'bg-ink' : 'bg-line'}`} />
          ))}
        </span>
      </div>

      <button onClick={() => goToSlide(index + 1)} className="p-2 text-muted hover:text-ink" aria-label="Siguiente">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
