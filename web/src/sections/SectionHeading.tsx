import type { ReactNode } from 'react'
import { levelById } from '../levels/levels'

export function SectionHeading({ level, title, children }: { level: number; title: string; children?: ReactNode }) {
  const def = levelById(level)
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        <p className="eyebrow">
          Nivel {level} · {def.title}
        </p>
        <h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">{title}</h2>
      </div>
      {children}
    </div>
  )
}
