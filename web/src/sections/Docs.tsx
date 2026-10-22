import { ChevronRight, Lock } from 'lucide-react'
import { useState } from 'react'
import { useProgress } from '../progress/ProgressContext'
import { SectionHeading } from './SectionHeading'

type Endpoint = { m: 'GET' | 'POST' | 'PUT' | 'DELETE'; path: string; desc: string; auth?: boolean; example: string }

const GROUPS: { name: string; endpoints: Endpoint[] }[] = [
  {
    name: 'Estado',
    endpoints: [{ m: 'GET', path: '/status', desc: 'Estado de la API y de la base de datos', example: '{ "status": "ok", "db": "conectada" }' }],
  },
  {
    name: 'Ropa',
    endpoints: [
      { m: 'GET', path: '/ropa', desc: 'Lista el catálogo', example: '[{ "_id": "6718…", "tipo": "sudadera", "precio": 39.95 }]' },
      { m: 'GET', path: '/ropa/{id}', desc: 'Una prenda con su proveedor', example: '{ "_id": "6718…", "proveedor": { "nombreComercial": "Textiles Navarra" } }' },
      { m: 'POST', path: '/ropa', desc: 'Crea una prenda', auth: true, example: '201 Created' },
      { m: 'PUT', path: '/ropa/{id}', desc: 'Edita una prenda', auth: true, example: '{ "_id": "6718…", "precio": 49.95 }' },
      { m: 'DELETE', path: '/ropa/{id}', desc: 'Elimina una prenda', auth: true, example: '204 No Content' },
    ],
  },
  {
    name: 'Proveedores',
    endpoints: [{ m: 'GET', path: '/proveedores', desc: 'Lista los proveedores', example: '[{ "_id": "6717…", "nombreComercial": "Textiles Navarra" }]' }],
  },
]

const METHOD_CLS: Record<Endpoint['m'], string> = {
  GET: 'bg-[#e3ecf5] text-[#2d5c8a]',
  POST: 'bg-ok-soft text-ok',
  PUT: 'bg-[#f6ecd9] text-[#8a6420]',
  DELETE: 'bg-bad-soft text-bad',
}

export function Docs() {
  const { editorial, setEditorial } = useProgress()
  const [open, setOpen] = useState<string | null>('GET /ropa')

  return (
    <div className="px-4 py-16 sm:px-8">
      <SectionHeading level={4} title="Documentación de la API">
        <span className="font-mono text-xs text-muted">OpenAPI 3.0 · /api-docs</span>
      </SectionHeading>

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          {GROUPS.map((g) => (
            <div key={g.name}>
              <p className="font-display text-xl">{g.name}</p>
              <ul className="mt-3 divide-y divide-line border border-line bg-panel">
                {g.endpoints.map((e) => {
                  const key = `${e.m} ${e.path}`
                  const isOpen = open === key
                  return (
                    <li key={key}>
                      <button onClick={() => setOpen(isOpen ? null : key)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                        <span className={`w-16 py-1 text-center font-mono text-[10px] font-medium ${METHOD_CLS[e.m]}`}>{e.m}</span>
                        <span className="font-mono text-xs">{e.path}</span>
                        <span className="hidden flex-1 truncate text-xs text-muted sm:block">{e.desc}</span>
                        {e.auth && <Lock className="h-3.5 w-3.5 text-muted" />}
                        <ChevronRight className={`h-4 w-4 text-muted transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="border-t border-line bg-paper-2 px-4 py-3">
                          <p className="eyebrow">Respuesta de ejemplo</p>
                          <pre className="mt-2 overflow-x-auto font-mono text-xs">{e.example}</pre>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <aside className="self-start border border-accent p-6 sm:p-8">
          <p className="eyebrow">Recompensa del nivel 4</p>
          <p className="mt-3 font-display text-3xl leading-tight">Modo editorial</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Una API bien documentada merece una tienda a su altura. Paleta nocturna, detalles dorados y un nuevo
            titular animado.
          </p>
          <button
            onClick={() => setEditorial(!editorial)}
            className="mt-6 flex w-full items-center justify-between border border-line px-4 py-3 text-sm"
            role="switch"
            aria-checked={editorial}
          >
            {editorial ? 'Activado' : 'Desactivado'}
            <span className={`relative h-5 w-9 rounded-full transition-colors ${editorial ? 'bg-accent' : 'bg-line'}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper transition-all ${editorial ? 'left-[18px]' : 'left-0.5'}`} />
            </span>
          </button>
        </aside>
      </div>
    </div>
  )
}
