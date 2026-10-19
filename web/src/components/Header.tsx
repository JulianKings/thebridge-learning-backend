import { RotateCw } from 'lucide-react'
import { API_URL } from '../config'
import { useProgress } from '../progress/ProgressContext'
import { ProgressBar } from './ProgressPanel'

export function Header({ onOpenProgress }: { onOpenProgress: () => void }) {
  const { completed, statusResponse, checkedAt, running, runChecks } = useProgress()
  const online = statusResponse !== null

  return (
    <header className="sticky top-0 z-30 border-b border-fx-line bg-fx-bg/70 font-fx text-fx-text backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <a href="#inicio" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fx-card-2 text-lg font-bold ring-1 ring-white/10">
            <span className="fx-gradient-text">A</span>
          </span>
          <span className="whitespace-nowrap text-xl font-bold tracking-wide">API TheBridge</span>
          <span className="hidden rounded-full border border-fx-line bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-fx-muted sm:inline">
            Backend Quest
          </span>
        </a>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-fx-line bg-white/5 py-1.5 pl-3 pr-1.5 text-sm md:flex">
            <span className={`h-2 w-2 shrink-0 rounded-full ${online ? 'animate-pulse bg-fx-green' : 'bg-fx-red'}`} />
            <span className="max-w-56 truncate font-mono text-xs text-fx-muted" title={API_URL}>
              {API_URL.replace(/^https?:\/\//, '')}
            </span>
            {checkedAt && <span className="text-xs text-fx-muted">· {checkedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>}
            <button
              onClick={runChecks}
              disabled={running}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-60"
              aria-label="Volver a comprobar la API"
              title="Volver a comprobar"
            >
              <RotateCw className={`h-3.5 w-3.5 ${running ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <button
            onClick={onOpenProgress}
            className="flex items-center gap-2 rounded-full border border-fx-line bg-white/5 px-3 py-1.5 text-xs font-semibold lg:hidden"
            aria-label="Ver progreso"
          >
            {completed}/7
            <ProgressBar className="w-10" />
          </button>
        </div>
      </div>
    </header>
  )
}
