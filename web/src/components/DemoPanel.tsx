import { FlaskConical, Minus, Play, RotateCcw, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useProgress } from '../progress/ProgressContext'
import { goToSlide } from '../slides/slides'

// Teacher-demo controls: simulates the students' API passing each level.
// Will be hidden (or dev-only) once real checks are wired in.
export function DemoPanel() {
  const { completed, running, simulateNext, jumpTo } = useProgress()
  // Starts minimized on phones, where it would cover half the slide.
  const [open, setOpen] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  const done = completed >= 7

  // Show the level being tested so its checklist and unlock are visible.
  const simulate = (fail: boolean) => {
    goToSlide(completed + 1)
    simulateNext({ fail })
  }
  const jump = (n: number) => {
    jumpTo(n)
    goToSlide(n)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full fx-gradient-bg px-4 py-2.5 font-fx text-xs font-bold uppercase tracking-widest text-white shadow-lg"
      >
        <FlaskConical className="h-4 w-4" /> Demo
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 w-[calc(100vw-2rem)] max-w-xs rounded-2xl bg-fx-card/95 p-4 font-fx text-white shadow-2xl ring-1 ring-fx-line backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/70">
          <FlaskConical className="h-3.5 w-3.5" /> Modo demo
        </span>
        <button onClick={() => setOpen(false)} aria-label="Minimizar" className="text-white/60 hover:text-white">
          <Minus className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-white/60">
        Simula que la API de los alumnos supera cada nivel.
      </p>

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <button
          disabled={done || running !== null}
          onClick={() => simulate(false)}
          className="flex items-center justify-center gap-2 rounded-full fx-gradient-bg px-3 py-2 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-40"
        >
          <Play className="h-3.5 w-3.5" />
          {done ? 'Todo completado' : running ? 'Comprobando…' : `Superar nivel ${completed + 1}`}
        </button>
        <button
          disabled={done || running !== null}
          onClick={() => simulate(true)}
          title="Simular un intento fallido"
          className="flex items-center justify-center rounded-full border border-white/20 px-3 py-2 text-fx-red hover:border-fx-red disabled:opacity-40"
        >
          <TriangleAlert className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-1">
        {Array.from({ length: 8 }, (_, n) => (
          <button
            key={n}
            onClick={() => jump(n)}
            className={`h-7 flex-1 rounded-md text-[11px] font-semibold ${
              completed === n ? 'fx-gradient-bg text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {n}
          </button>
        ))}
        <button onClick={() => jump(0)} aria-label="Reiniciar" className="ml-1 h-7 px-2 text-white/60 hover:text-white">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
