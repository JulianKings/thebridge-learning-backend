import { motion } from 'framer-motion'
import { Lock, RotateCw, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { useProgress } from '../progress/ProgressContext'
import { LEVEL_URLS } from './fx'

export function BrowserFrame({ level, children }: { level: number; children: ReactNode }) {
  const { completed, editorial } = useProgress()
  const unlocked = completed >= level
  const next = completed + 1 === level

  return (
    <motion.div
      initial={false}
      animate={{
        boxShadow: unlocked
          ? '0 0 0 1px #8b5cf688, 0 30px 80px -20px #ec489955, 0 0 80px -30px #8b5cf6'
          : next
            ? '0 0 0 1px #ec489966, 0 30px 80px -30px #00000099'
            : '0 0 0 1px #ffffff17, 0 30px 80px -30px #00000099',
      }}
      transition={{ duration: 1 }}
      className="flex h-full flex-col overflow-hidden rounded-2xl bg-fx-card"
    >
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-fx-line px-4">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <RotateCw className="hidden h-3.5 w-3.5 text-fx-muted sm:block" />
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-fx-bg/70 px-3 py-1.5 font-mono text-xs text-fx-muted">
          <Lock className="h-3 w-3 shrink-0" />
          <span className="truncate">
            https://<span className="text-fx-text">{LEVEL_URLS[level]}</span>
          </span>
        </div>
        <span
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-fx text-[11px] font-semibold uppercase tracking-wider ${
            unlocked ? 'bg-fx-green/15 text-fx-green' : next ? 'bg-fx-pink/15 text-fx-pink' : 'bg-white/5 text-fx-muted'
          }`}
        >
          {unlocked ? (
            <>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fx-green" /> En vivo
            </>
          ) : next ? (
            <>
              <Sparkles className="h-3 w-3" /> Siguiente
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" /> Bloqueado
            </>
          )}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-paper text-ink">
        {editorial && (
          <div className="overflow-hidden border-b border-line bg-accent py-1.5 text-[10px] uppercase tracking-[0.3em] text-[#141414]">
            <div className="marquee flex w-max gap-12 whitespace-nowrap">
              {Array.from({ length: 2 }, (_, k) => (
                <div key={k} className="flex gap-12">
                  {['Edición editorial', 'Envío gratuito desde 50 €', 'Nueva colección Otoño–Invierno', 'Documentado con Swagger', 'Hecho a mano en Madrid'].map((t) => (
                    <span key={t}>{t} ✦</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        {children}
      </div>
    </motion.div>
  )
}
