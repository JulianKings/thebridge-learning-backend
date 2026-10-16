import { motion } from 'framer-motion'
import { Check, LoaderCircle, X } from 'lucide-react'
import type { LevelDef } from '../levels/levels'
import { useProgress } from '../progress/ProgressContext'
import type { CheckStatus } from '../progress/ProgressContext'

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === 'pass')
    return (
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex h-5 w-5 items-center justify-center rounded-full bg-fx-green text-fx-bg">
        <Check className="h-3 w-3" strokeWidth={3.5} />
      </motion.span>
    )
  if (status === 'fail')
    return (
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex h-5 w-5 items-center justify-center rounded-full bg-fx-red text-fx-bg">
        <X className="h-3 w-3" strokeWidth={3.5} />
      </motion.span>
    )
  if (status === 'running') return <LoaderCircle className="h-5 w-5 animate-spin text-fx-pink" />
  return <span className="h-5 w-5 rounded-full border-2 border-fx-line" />
}

// Lives in the dark FX chrome (lock cards and the progress panel).
export function CheckList({ level, compact = false }: { level: LevelDef; compact?: boolean }) {
  const { checks } = useProgress()
  return (
    <ul className={compact ? 'space-y-2' : 'space-y-2.5'}>
      {level.checks.map((c) => {
        const status = checks[level.id]?.[c.id] ?? 'idle'
        return (
          <li key={c.id} className="flex items-start gap-3">
            <span className="flex shrink-0 items-center justify-center">
              <StatusIcon status={status} />
            </span>
            <span
              className={`pt-px text-[13px] leading-snug ${
                status === 'pass' ? 'text-fx-text' : status === 'fail' ? 'text-fx-red' : status === 'running' ? 'text-fx-text' : 'text-fx-muted'
              }`}
            >
              {c.label}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
