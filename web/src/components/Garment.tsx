import type { GarmentKind } from '../data/mock'

// Minimal line-art garments so the mockup needs no stock photography.
const PATHS: Record<GarmentKind, string> = {
  coat: 'M70 30 L100 22 L130 30 L160 52 L150 150 L138 148 L136 230 L64 230 L62 148 L50 150 L40 52 Z M100 22 L92 120 L100 230 M100 22 L108 120',
  shirt: 'M72 40 L100 32 L128 40 L162 66 L148 96 L134 86 L134 200 L66 200 L66 86 L52 96 L38 66 Z M88 36 L100 52 L112 36 M100 52 L100 200',
  dress: 'M84 30 L116 30 L122 70 L112 92 L160 226 L40 226 L88 92 L78 70 Z M88 92 L112 92',
  trousers: 'M66 30 L134 30 L142 226 L108 226 L100 92 L92 226 L58 226 Z M66 44 L134 44',
  knit: 'M68 44 L100 36 L132 44 L166 74 L160 170 L142 172 L138 102 L138 206 L62 206 L62 102 L58 172 L40 170 L34 74 Z M86 40 Q100 56 114 40 M62 196 L138 196',
  skirt: 'M70 50 L130 50 L164 210 L36 210 Z M70 62 L130 62 M84 62 L72 210 M100 62 L100 210 M116 62 L128 210',
  tee: 'M74 46 L100 40 L126 46 L160 70 L146 96 L132 88 L132 200 L68 200 L68 88 L54 96 L40 70 Z M86 44 Q100 58 114 44',
  blazer: 'M70 32 L100 26 L130 32 L162 56 L152 150 L140 148 L138 222 L62 222 L60 148 L48 150 L38 56 Z M100 26 L84 72 L100 150 L116 72 L100 26 M108 140 L108 140',
}

export function Garment({ kind, tone, ink, className = '' }: { kind: GarmentKind; tone: string; ink: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: tone }}>
      <svg viewBox="0 0 200 260" className="absolute inset-0 h-full w-full p-[12%]" aria-hidden="true">
        <path d={PATHS[kind]} fill="none" stroke={ink} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  )
}
