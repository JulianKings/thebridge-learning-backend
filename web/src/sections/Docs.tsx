import { ChevronRight, ExternalLink, Lock } from 'lucide-react'
import { useState } from 'react'
import { call } from '../api/client'
import { useQuery } from '../api/hooks'
import { API_URL } from '../config'
import { useProgress } from '../progress/ProgressContext'
import { ErrorBox } from '../shop/ui'
import { SectionHeading } from './SectionHeading'

type Endpoint = {
  m: string
  path: string
  desc: string
  auth: boolean
  params: string[]
  body?: string
  responses: [string, string][]
}
type Group = { name: string; endpoints: Endpoint[] }

type Operation = {
  summary?: string
  description?: string
  tags?: string[]
  security?: unknown[]
  parameters?: { name?: string; in?: string; required?: boolean }[]
  requestBody?: { content?: Record<string, { schema?: { $ref?: string; type?: string } }> }
  responses?: Record<string, { description?: string }>
}
type OpenApi = { openapi?: string; info?: { title?: string; version?: string }; security?: unknown[]; paths?: Record<string, Record<string, Operation>> }

const METHODS = ['get', 'post', 'put', 'patch', 'delete']

const PREVIEW: Group[] = [
  {
    name: 'Estado',
    endpoints: [{ m: 'GET', path: '/status', desc: 'Estado de la API y de la base de datos', auth: false, params: [], responses: [['200', 'API en marcha']] }],
  },
  {
    name: 'Ropa',
    endpoints: [
      { m: 'GET', path: '/ropa', desc: 'Lista el catálogo', auth: false, params: [], responses: [['200', 'Lista de prendas']] },
      { m: 'POST', path: '/ropa', desc: 'Crea una prenda', auth: false, params: [], body: 'Producto', responses: [['201', 'Prenda creada'], ['400', 'Datos no válidos']] },
      { m: 'GET', path: '/ropa/{id}', desc: 'Una prenda', auth: false, params: ['id (path, obligatorio)'], responses: [['200', 'La prenda'], ['404', 'No existe']] },
      { m: 'DELETE', path: '/ropa/{id}', desc: 'Elimina una prenda', auth: false, params: ['id (path, obligatorio)'], responses: [['204', 'Eliminada']] },
    ],
  },
  {
    name: 'Auth',
    endpoints: [{ m: 'GET', path: '/auth/perfil', desc: 'Tu perfil', auth: true, params: [], responses: [['200', 'Perfil'], ['401', 'Sin token']] }],
  },
]

function groupsFrom(spec: OpenApi): Group[] {
  const groups = new Map<string, Endpoint[]>()
  for (const [path, ops] of Object.entries(spec.paths ?? {})) {
    for (const m of METHODS) {
      const op = ops?.[m]
      if (!op) continue
      const tag = op.tags?.[0] ?? 'General'
      const body = Object.values(op.requestBody?.content ?? {})[0]?.schema
      groups.set(tag, [
        ...(groups.get(tag) ?? []),
        {
          m: m.toUpperCase(),
          path,
          desc: op.summary ?? op.description ?? '',
          auth: (op.security ?? spec.security ?? []).length > 0,
          params: (op.parameters ?? []).map((p) => `${p.name} (${p.in}${p.required ? ', obligatorio' : ''})`),
          body: body?.$ref?.split('/').pop() ?? body?.type,
          responses: Object.entries(op.responses ?? {}).map(([code, r]) => [code, r?.description ?? ''] as [string, string]),
        },
      ])
    }
  }
  return [...groups].map(([name, endpoints]) => ({ name, endpoints }))
}

const METHOD_CLS: Record<string, string> = {
  GET: 'bg-[#e3ecf5] text-[#2d5c8a]',
  POST: 'bg-ok-soft text-ok',
  PUT: 'bg-[#f6ecd9] text-[#8a6420]',
  PATCH: 'bg-[#efe6f6] text-[#6b3f8a]',
  DELETE: 'bg-bad-soft text-bad',
}

function EndpointRow({ e, open, onToggle }: { e: Endpoint; open: boolean; onToggle: () => void }) {
  return (
    <li>
      <button onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3 text-left" aria-expanded={open}>
        <span className={`w-16 shrink-0 py-1 text-center font-mono text-[10px] font-medium ${METHOD_CLS[e.m] ?? 'bg-paper-2'}`}>{e.m}</span>
        <span className="font-mono text-xs">{e.path}</span>
        <span className="hidden flex-1 truncate text-xs text-muted sm:block">{e.desc}</span>
        {e.auth && <Lock className="h-3.5 w-3.5 shrink-0 text-muted" aria-label="Requiere token" />}
        <ChevronRight className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="space-y-3 border-t border-line bg-paper-2 px-4 py-3 text-xs">
          {e.desc && <p className="sm:hidden">{e.desc}</p>}
          {e.params.length > 0 && (
            <p>
              <span className="eyebrow mr-2">Parámetros</span>
              <span className="font-mono">{e.params.join(' · ')}</span>
            </p>
          )}
          {e.body && (
            <p>
              <span className="eyebrow mr-2">Cuerpo</span>
              <span className="font-mono">{e.body}</span>
            </p>
          )}
          <div>
            <p className="eyebrow">Respuestas</p>
            {e.responses.length ? (
              <ul className="mt-1.5 space-y-1">
                {e.responses.map(([code, desc]) => (
                  <li key={code} className="flex gap-3">
                    <span className={`w-10 font-mono ${code.startsWith('2') ? 'text-ok' : 'text-bad'}`}>{code}</span>
                    <span className="text-muted">{desc}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-muted">Sin respuestas documentadas.</p>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

export function Docs() {
  const { isUnlocked, editorial, setEditorial } = useProgress()
  const live = isUnlocked(4)
  const { data: spec, error } = useQuery(() => (live ? call<OpenApi>('GET', '/api-docs.json') : Promise.resolve(null)), [live])
  const [open, setOpen] = useState<string | null>(null)
  const groups = live ? (spec ? groupsFrom(spec) : []) : PREVIEW

  return (
    <div className="px-4 py-16 sm:px-8">
      <SectionHeading level={4} title="Documentación de la API">
        {live ? (
          <a href={`${API_URL}/api-docs`} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-mono text-xs underline underline-offset-4">
            {spec?.info?.title ?? 'Swagger UI'} {spec?.info?.version && `v${spec.info.version}`} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="font-mono text-xs text-muted">OpenAPI 3 · /api-docs</span>
        )}
      </SectionHeading>

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          {error && <ErrorBox error={error} />}
          {groups.map((g) => (
            <div key={g.name}>
              <p className="font-display text-xl">{g.name}</p>
              <ul className="mt-3 divide-y divide-line border border-line bg-panel">
                {g.endpoints.map((e) => {
                  const key = `${e.m} ${e.path}`
                  return <EndpointRow key={key} e={e} open={open === key} onToggle={() => setOpen(open === key ? null : key)} />
                })}
              </ul>
            </div>
          ))}
        </div>

        <aside className="self-start border border-accent p-6 sm:p-8">
          <p className="eyebrow">Recompensa del nivel 4</p>
          <p className="mt-3 font-display text-3xl leading-tight">Modo editorial</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Una API bien documentada merece una tienda a su altura. Paleta nocturna, detalles dorados y un nuevo titular animado.
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
