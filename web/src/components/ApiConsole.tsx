import { Database, Minus, RotateCcw, Terminal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useApiState } from '../api/hooks'
import { apiStore } from '../api/mockApi'

const METHOD_CLS: Record<string, string> = {
  GET: 'text-[#7fb2e5]',
  POST: 'text-[#7fbf8f]',
  PUT: 'text-[#e5c07b]',
  DELETE: 'text-[#e38b7d]',
}

function Switch({ label, on, onChange }: { label: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between py-1 text-xs text-white/80">
      {label}
      <span className={`relative h-4 w-7 rounded-full transition-colors ${on ? 'bg-[#e38b7d]' : 'bg-white/20'}`}>
        <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${on ? 'left-3.5' : 'left-0.5'}`} />
      </span>
    </button>
  )
}

// Demo-only console shown in the shop: live request log plus switches to
// break the simulated API in front of the class.
export function ApiConsole() {
  const { log, slow, down } = useApiState()
  const [open, setOpen] = useState(true)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 bg-[#141414] px-4 py-2.5 text-xs uppercase tracking-widest text-white shadow-lg"
      >
        <Terminal className="h-4 w-4" /> API
        {down && <span className="h-2 w-2 rounded-full bg-[#e38b7d]" />}
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 w-[calc(100vw-2rem)] max-w-xs bg-[#141414] text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/70">
          <Terminal className="h-3.5 w-3.5" /> Consola API · simulada
        </span>
        <button onClick={() => setOpen(false)} aria-label="Minimizar" className="text-white/60 hover:text-white">
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b border-white/10 px-4 py-2">
        <Switch label="API caída (503)" on={down} onChange={apiStore.setDown} />
        <Switch label="Latencia alta (~1,5 s)" on={slow} onChange={apiStore.setSlow} />
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => confirm('¿Restaurar los datos iniciales de la API?') && apiStore.resetData()}
            className="flex flex-1 items-center justify-center gap-1.5 border border-white/20 py-1.5 text-[11px] text-white/80 hover:border-white/50"
          >
            <Database className="h-3.5 w-3.5" /> Restaurar datos
          </button>
          <button onClick={apiStore.clearLog} className="flex items-center gap-1.5 border border-white/20 px-3 py-1.5 text-[11px] text-white/80 hover:border-white/50" aria-label="Limpiar registro">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <ul className="h-32 overflow-y-auto px-4 py-2 font-mono text-[11px]">
        {log.length === 0 && (
          <li className="flex items-center gap-2 py-1 text-white/40">
            <RotateCcw className="h-3 w-3" /> Esperando peticiones…
          </li>
        )}
        {log.map((l) => (
          <li key={l.id} className="flex items-center gap-2 py-0.5">
            <span className={`w-8 shrink-0 ${l.status >= 400 ? 'text-[#e38b7d]' : 'text-[#7fbf8f]'}`}>{l.status}</span>
            <span className={`w-12 shrink-0 ${METHOD_CLS[l.method] ?? ''}`}>{l.method}</span>
            <span className="min-w-0 flex-1 truncate text-white/80" title={l.path}>{l.path}</span>
            <span className="shrink-0 text-white/40">{l.ms} ms</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
