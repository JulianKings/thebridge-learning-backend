import { motion } from 'framer-motion'
import { ArrowRight, Gamepad2, Lock, Trophy } from 'lucide-react'
import { LevelBadge } from '../fx/fx'
import { LEVELS } from '../levels/levels'
import { useProgress } from '../progress/ProgressContext'

const API_URL = 'https://hilo-api.onrender.com'

// Overview slide: explains the game, shows the watched API and every level.
export function Intro() {
  const { completed, checks, isUnlocked } = useProgress()
  const online = isUnlocked(1)
  const totalChecks = LEVELS.reduce((n, l) => n + l.checks.length, 0)
  const passedChecks = Object.values(checks).reduce((n, c) => n + Object.values(c).filter((s) => s === 'pass').length, 0)
  const next = LEVELS[completed]

  const stats = [
    { label: 'Niveles', value: `${completed}/7` },
    { label: 'Checks', value: `${passedChecks}/${totalChecks}` },
    { label: 'Siguiente', value: next ? next.title : '¡Ninguno!' },
  ]

  return (
    <div className="px-4 py-8 font-fx text-fx-text sm:px-8 sm:py-10">
      <div className="grid gap-10 xl:grid-cols-[1.2fr_1fr] xl:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-fx-line bg-white/5 px-3 py-1 text-xs text-fx-muted">
            <Gamepad2 className="h-3.5 w-3.5 text-fx-pink" /> Proyecto de aprendizaje · Express + MongoDB
          </span>
          <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl 2xl:text-7xl">
            Construye la API.
            <br />
            <span className="fx-gradient-text">Desbloquea la tienda.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-fx-muted">
            Esta web se alimenta de vuestra API. Cada nivel que superéis enciende una parte de la tienda con vuestros
            datos reales. Lo que aún está borroso es lo que os espera.
          </p>
          <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-fx-line bg-fx-card/70 px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-fx-muted">{s.label}</p>
                <p className="mt-1 truncate text-lg font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-fx-line bg-linear-to-b from-fx-card to-fx-bg font-mono text-[13px] shadow-[0_30px_80px_-30px_#8b5cf6aa]">
          <div className="flex items-center gap-1.5 border-b border-fx-line px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-xs text-fx-muted">terminal — estado de la API</span>
          </div>
          <div className="space-y-2 p-5 leading-relaxed">
            <p>
              <span className="text-fx-pink">$</span> curl {API_URL}/health
            </p>
            {online ? (
              <>
                <p className="text-fx-green">HTTP/1.1 200 OK</p>
                <p className="text-fx-muted">
                  {'{ '}
                  <span className="text-fx-cyan">"status"</span>: <span className="text-fx-amber">"ok"</span>,{' '}
                  <span className="text-fx-cyan">"db"</span>: <span className="text-fx-amber">"connected"</span>
                  {' }'}
                </p>
              </>
            ) : (
              <p className="text-fx-red">curl: (7) Failed to connect · la API aún no responde</p>
            )}
            <p className="flex items-center gap-2 pt-2">
              <span className="text-fx-pink">$</span>
              <span className={`h-2 w-2 rounded-full ${online ? 'animate-pulse bg-fx-green' : 'bg-fx-red'}`} />
              <span className={online ? 'text-fx-green' : 'text-fx-red'}>{online ? `conectada · nivel ${completed}` : 'sin conexión'}</span>
              <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-fx-text/70" />
            </p>
          </div>
        </div>
      </div>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {LEVELS.map((l, i) => {
          const done = completed >= l.id
          const isNext = completed + 1 === l.id
          const state = done ? 'done' : isNext ? 'next' : 'locked'
          return (
            <motion.li key={l.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
              <a
                href={`#${l.key}`}
                className={`group relative flex h-full flex-col rounded-2xl p-px transition-transform hover:-translate-y-1 ${
                  isNext ? 'fx-gradient-bg fx-glow' : done ? 'bg-linear-to-br from-fx-violet/60 to-fx-pink/40' : 'bg-fx-line'
                }`}
              >
                <span className={`flex h-full flex-col rounded-[15px] p-5 ${done || isNext ? 'bg-fx-card' : 'bg-fx-card/70'}`}>
                  <span className="flex items-center justify-between">
                    <LevelBadge level={l.id} state={state} />
                    <span className={`text-4xl font-bold ${done ? 'fx-gradient-text' : 'text-white/10'}`}>{String(l.id).padStart(2, '0')}</span>
                  </span>
                  <span className={`mt-4 text-lg font-bold ${state === 'locked' ? 'text-fx-muted' : ''}`}>{l.title}</span>
                  <span className="mt-1 flex-1 text-sm text-fx-muted">{l.tagline}</span>
                  <span
                    className={`mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${
                      done ? 'text-fx-green' : isNext ? 'text-fx-pink' : 'text-fx-muted'
                    }`}
                  >
                    {done ? '✓ Superado' : isNext ? 'Tu siguiente reto' : 'Vista previa'}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </a>
            </motion.li>
          )
        })}

        <motion.li initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <a
            href={completed >= 7 ? '#tienda' : '#completa'}
            className={`relative flex h-full flex-col overflow-hidden rounded-2xl p-5 ${
              completed >= 7 ? 'fx-gradient-bg fx-glow text-white' : 'border border-dashed border-fx-line bg-fx-card/40'
            }`}
          >
            <Trophy className={`h-8 w-8 ${completed >= 7 ? 'text-white' : 'text-fx-amber'}`} />
            <span className="mt-4 text-lg font-bold">Recompensa final</span>
            <span className={`mt-1 flex-1 text-sm ${completed >= 7 ? 'text-white/85' : 'text-fx-muted'}`}>
              La tienda completa, funcionando con vuestra API.
            </span>
            <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
              {completed >= 7 ? (
                <>
                  Entrar en la tienda <ArrowRight className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" /> Supera los 7 niveles
                </>
              )}
            </span>
          </a>
        </motion.li>
      </ol>
    </div>
  )
}
