import { ArrowRight, Check, Lock, Plug } from 'lucide-react'
import { LEVELS } from '../levels/levels'
import { useProgress } from '../progress/ProgressContext'

// Overview slide: explains the game, shows the watched API and every level.
export function Intro() {
  const { completed, isUnlocked } = useProgress()
  const online = isUnlocked(1)

  return (
    <div className="px-4 py-10 sm:px-8 sm:py-12">
      <p className="eyebrow">Proyecto de aprendizaje · Express + MongoDB</p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] sm:text-6xl">
        Construye la API.
        <br />
        <em className="text-muted">Desbloquea la tienda.</em>
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
        Esta web se alimenta de vuestra API. Cada vez que superéis un nivel, una parte de la tienda cobra vida con
        vuestros datos reales. Lo que aún está borroso es lo que os espera.
      </p>

      <div className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 border border-line bg-panel px-4 py-3">
          <Plug className="h-4 w-4 shrink-0 text-muted" />
          <span className="truncate font-mono text-xs">https://hilo-api.onrender.com</span>
        </div>
        <div
          className={`flex items-center justify-center gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.16em] ${
            online ? 'bg-ok-soft text-ok' : 'bg-paper-2 text-muted'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${online ? 'animate-pulse bg-ok' : 'bg-muted'}`} />
          {online ? `Conectada · nivel ${completed}` : 'Sin conexión'}
        </div>
      </div>

      <ol className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        {LEVELS.map((l) => {
          const done = completed >= l.id
          const next = completed + 1 === l.id
          return (
            <li key={l.id} className="bg-paper">
              <a href={`#${l.key}`} className="group flex h-full flex-col p-5 transition-colors hover:bg-paper-2">
                <span className="flex items-center justify-between">
                  <span className="font-display text-3xl text-muted">{String(l.id).padStart(2, '0')}</span>
                  {done ? (
                    <Check className="h-4 w-4 text-accent" strokeWidth={3} />
                  ) : next ? (
                    <span className="text-[10px] uppercase tracking-[0.18em] text-ink">Siguiente</span>
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-muted" />
                  )}
                </span>
                <span className={`mt-4 text-sm ${done || next ? 'text-ink' : 'text-muted'}`}>{l.title}</span>
                <span className="mt-1 flex-1 text-xs text-muted">{l.tagline}</span>
                <span className="mt-4 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted group-hover:text-ink">
                  {done ? 'Ver' : 'Vista previa'} <ArrowRight className="h-3 w-3" />
                </span>
              </a>
            </li>
          )
        })}
        <li className="hidden bg-paper xl:block" />
      </ol>
    </div>
  )
}
