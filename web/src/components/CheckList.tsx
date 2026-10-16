import { Check, Circle, LoaderCircle, X } from 'lucide-react'
import type { LevelDef } from '../levels/levels'
import { useProgress } from '../progress/ProgressContext'
import type { CheckStatus } from '../progress/ProgressContext'

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === 'pass') return <Check className="h-3.5 w-3.5 text-ok" strokeWidth={2.5} />
  if (status === 'fail') return <X className="h-3.5 w-3.5 text-bad" strokeWidth={2.5} />
  if (status === 'running') return <LoaderCircle className="h-3.5 w-3.5 animate-spin text-ink" />
  return <Circle className="h-3 w-3 text-line" strokeWidth={2} />
}

export function CheckList({ level, compact = false }: { level: LevelDef; compact?: boolean }) {
  const { checks } = useProgress()
  return (
    <ul className={compact ? 'space-y-1.5' : 'space-y-2'}>
      {level.checks.map((c) => {
        const status = checks[level.id]?.[c.id] ?? 'idle'
        return (
          <li key={c.id} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
              <StatusIcon status={status} />
            </span>
            <span
              className={`text-[13px] leading-snug ${
                status === 'pass' ? 'text-ink' : status === 'fail' ? 'text-bad' : 'text-muted'
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
