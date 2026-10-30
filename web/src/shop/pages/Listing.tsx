import { AnimatePresence, motion, useInView } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { toQuery } from '../../api/client'
import { useQuery } from '../../api/hooks'
import { formatPrice } from '../../data/mock'
import { CHECK_EVENT } from '../../levels/levels'
import { ropaApi } from '../../ropa/api'
import type { FiltrosRopa, OrdenRopa, RopaQuery } from '../../ropa/api'
import { GRUPOS, GRUPO_SLUG, grupoPorSlug, nombreTipo } from '../../ropa/types'
import type { TallaTipo, Tipo } from '../../ropa/types'
import { setShopQuery, shopHref, useShopQuery } from '../router'
import { ErrorBox, GridSkeleton, ProductCard } from '../ui'

const PAGE_SIZE = 12

const ORDENES: { value: OrdenRopa | ''; label: string }[] = [
  { value: '', label: 'Destacados' },
  { value: '-createdAt', label: 'Novedades' },
  { value: 'precio', label: 'Precio ascendente' },
  { value: '-precio', label: 'Precio descendente' },
  { value: '-descuento', label: 'Mayor descuento' },
]

const LISTAS = ['tipo', 'talla', 'temporada', 'proveedor'] as const
type Lista = (typeof LISTAS)[number]

function useFiltros() {
  const params = useShopQuery()
  const list = (k: Lista) => params.get(k)?.split(',').filter(Boolean) ?? []
  const num = (k: string) => (params.get(k) ? Number(params.get(k)) : undefined)

  const update = (mut: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params)
    mut(next)
    setShopQuery(next)
  }
  const setValue = (k: string, v?: string | number) => update((p) => (v === undefined || v === '' ? p.delete(k) : p.set(k, String(v))))
  const toggle = (k: Lista, v: string) =>
    update((p) => {
      const current = list(k)
      const next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v]
      if (next.length) p.set(k, next.join(','))
      else p.delete(k)
    })

  return { params, list, num, update, setValue, toggle }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-line py-5">
      <p className="eyebrow mb-3">{title}</p>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs capitalize transition-all duration-300 ${
        active ? 'border-ink bg-ink text-paper' : 'border-line hover:-translate-y-0.5 hover:border-ink'
      }`}
    >
      {children}
    </button>
  )
}

// Keeps the dragged values locally and only commits them to the URL (and the API) once the user pauses.
function PriceRange({ bounds, lo, hi, onCommit }: { bounds: FiltrosRopa['precio']; lo?: number; hi?: number; onCommit: (lo?: number, hi?: number) => void }) {
  const min = Math.floor(bounds.min)
  const max = Math.ceil(bounds.max)
  const [value, setValue] = useState<[number, number]>([lo ?? min, hi ?? max])
  useEffect(() => setValue([lo ?? min, hi ?? max]), [lo, hi, min, max])
  useEffect(() => {
    const [a, b] = value
    if (a === (lo ?? min) && b === (hi ?? max)) return
    const t = setTimeout(() => onCommit(a > min ? a : undefined, b < max ? b : undefined), 350)
    return () => clearTimeout(t)
  }, [value])

  const pct = (n: number) => ((n - min) / Math.max(max - min, 1)) * 100
  return (
    <div>
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
        <div className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-pop" style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }} />
        {[0, 1].map((i) => (
          <input
            key={i}
            type="range"
            min={min}
            max={max}
            value={value[i]}
            onChange={(e) => {
              const n = Number(e.target.value)
              setValue(([a, b]) => (i === 0 ? [Math.min(n, b), b] : [a, Math.max(n, a)]))
            }}
            className="range-dual absolute inset-0 w-full"
            aria-label={i === 0 ? 'Precio mínimo' : 'Precio máximo'}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>{formatPrice(value[0])}</span>
        <span>{formatPrice(value[1])}</span>
      </div>
    </div>
  )
}

function SearchBox({ value, onCommit }: { value: string; onCommit: (q: string) => void }) {
  const [q, setQ] = useState(value)
  useEffect(() => setQ(value), [value])
  useEffect(() => {
    if (q === value) return
    const t = setTimeout(() => onCommit(q.trim()), 350)
    return () => clearTimeout(t)
  }, [q])
  return (
    <label className="flex items-center gap-2 border-b border-line py-2 focus-within:border-ink">
      <Search className="h-4 w-4 text-muted" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar en la colección" className="w-full bg-transparent text-sm outline-none" />
      {q && (
        <button onClick={() => setQ('')} aria-label="Borrar búsqueda">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </label>
  )
}

function Filters({ slug, filtros }: { slug?: string; filtros?: FiltrosRopa }) {
  const f = useFiltros()
  const grupoSlug = grupoPorSlug(slug) ? slug : undefined
  const tipos = filtros?.grupos.filter((g) => !grupoSlug || g.slug === grupoSlug).flatMap((g) => g.tipos) ?? []
  const sinTipo = new URLSearchParams(f.params)
  sinTipo.delete('tipo')
  const qs = sinTipo.toString() ? `?${sinTipo}` : ''

  return (
    <div>
      <SearchBox value={f.params.get('q') ?? ''} onCommit={(q) => f.setValue('q', q)} />

      <Section title="Categoría">
        <ul className="space-y-1.5 text-sm">
          {[undefined, ...GRUPOS].map((g) => {
            const s = g ? GRUPO_SLUG[g] : 'todo'
            const active = (grupoSlug ?? 'todo') === s
            return (
              <li key={s}>
                <a href={shopHref(`c/${s}${qs}`)} className={`group flex items-center gap-2 ${active ? 'font-medium' : 'text-muted hover:text-ink'}`}>
                  <span className={`h-1.5 rounded-full bg-pop transition-all duration-300 ${active ? 'w-4' : 'w-0 group-hover:w-2'}`} />
                  {g ?? 'Todo'}
                </a>
              </li>
            )
          })}
        </ul>
      </Section>

      {tipos.length > 1 && (
        <Section title="Tipo">
          <div className="flex flex-wrap gap-1.5">
            {tipos.map((t) => (
              <Chip key={t} active={f.list('tipo').includes(t)} onClick={() => f.toggle('tipo', t)}>
                {nombreTipo(t)}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {!!filtros?.tallas.length && (
        <Section title="Talla con stock">
          <div className="grid grid-cols-4 gap-1.5">
            {filtros.tallas.map((t) => (
              <button
                key={t}
                onClick={() => f.toggle('talla', t)}
                className={`border py-2 text-xs transition-colors ${f.list('talla').includes(t) ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </Section>
      )}

      {filtros && filtros.precio.max > filtros.precio.min && (
        <Section title="Precio">
          <PriceRange
            bounds={filtros.precio}
            lo={f.num('precioMin')}
            hi={f.num('precioMax')}
            onCommit={(lo, hi) =>
              f.update((p) => {
                if (lo === undefined) p.delete('precioMin')
                else p.set('precioMin', String(lo))
                if (hi === undefined) p.delete('precioMax')
                else p.set('precioMax', String(hi))
              })
            }
          />
        </Section>
      )}

      <Section title="Promociones">
        <button onClick={() => f.setValue('oferta', f.params.get('oferta') === 'true' ? undefined : 'true')} className="flex items-center gap-3 text-sm">
          <span className={`relative h-5 w-9 rounded-full transition-colors ${f.params.get('oferta') === 'true' ? 'bg-pop' : 'bg-line'}`}>
            <motion.span layout className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow ${f.params.get('oferta') === 'true' ? 'right-0.5' : 'left-0.5'}`} />
          </span>
          Solo prendas en oferta
        </button>
      </Section>

      {!!filtros?.temporadas.length && (
        <Section title="Temporada">
          <div className="flex flex-wrap gap-1.5">
            {filtros.temporadas.map((t) => (
              <Chip key={t} active={f.list('temporada').includes(t)} onClick={() => f.toggle('temporada', t)}>
                {t}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {!!filtros?.proveedores.length && (
        <Section title="Proveedor">
          <ul className="max-h-56 space-y-2 overflow-y-auto pr-2 text-sm">
            {filtros.proveedores.map((p) => (
              <li key={p._id}>
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input type="checkbox" checked={f.list('proveedor').includes(p._id)} onChange={() => f.toggle('proveedor', p._id)} className="accent-[var(--pop)]" />
                  {p.nombreComercial}
                </label>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

function ActiveChips({ filtros }: { filtros?: FiltrosRopa }) {
  const f = useFiltros()
  const chips: { label: string; remove: () => void }[] = []
  const q = f.params.get('q')
  if (q) chips.push({ label: `«${q}»`, remove: () => f.setValue('q') })
  for (const k of LISTAS) {
    for (const v of f.list(k)) {
      const label = k === 'proveedor' ? (filtros?.proveedores.find((p) => p._id === v)?.nombreComercial ?? v) : k === 'tipo' ? nombreTipo(v as Tipo) : v
      chips.push({ label, remove: () => f.toggle(k, v) })
    }
  }
  const lo = f.num('precioMin')
  const hi = f.num('precioMax')
  if (lo !== undefined || hi !== undefined) {
    chips.push({
      label: `${lo !== undefined ? formatPrice(lo) : '0'} – ${hi !== undefined ? formatPrice(hi) : '∞'}`,
      remove: () =>
        f.update((p) => {
          p.delete('precioMin')
          p.delete('precioMax')
        }),
    })
  }
  if (f.params.get('oferta') === 'true') chips.push({ label: 'En oferta', remove: () => f.setValue('oferta') })
  if (!chips.length) return null

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      <AnimatePresence initial={false}>
        {chips.map((c) => (
          <motion.button
            key={c.label}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={c.remove}
            className="flex items-center gap-1.5 rounded-full bg-pop-soft px-3 py-1.5 text-xs capitalize text-ink hover:bg-pop hover:text-white"
          >
            {c.label} <X className="h-3 w-3" />
          </motion.button>
        ))}
      </AnimatePresence>
      <button onClick={() => setShopQuery(new URLSearchParams(f.params.get('orden') ? { orden: f.params.get('orden')! } : {}))} className="link-grow ml-2 text-xs text-muted">
        Limpiar todo
      </button>
    </div>
  )
}

export function Listing({ slug, search }: { slug?: string; search?: string }) {
  const f = useFiltros()
  const [sheet, setSheet] = useState(false)
  const [paging, setPaging] = useState({ key: '', pages: 1 })
  const grupo = grupoPorSlug(slug)
  const { data: filtros } = useQuery(() => ropaApi.filtros(), [])

  const query: RopaQuery = {
    grupo: grupo ? GRUPO_SLUG[grupo] : undefined,
    q: f.params.get('q') ?? search,
    tipo: f.list('tipo') as Tipo[],
    talla: f.list('talla') as TallaTipo[],
    temporada: f.list('temporada'),
    proveedor: f.list('proveedor'),
    precioMin: f.num('precioMin'),
    precioMax: f.num('precioMax'),
    oferta: f.params.get('oferta') === 'true' || undefined,
    orden: (f.params.get('orden') as OrdenRopa) || undefined,
  }
  const key = toQuery(query)
  const pages = paging.key === key ? paging.pages : 1
  const setPages = (fn: (p: number) => number) => setPaging({ key, pages: fn(pages) })

  // Pages are fetched cumulatively (limit grows), so the grid never reorders while loading more.
  const { data, loading, error } = useQuery(() => ropaApi.page({ ...query, page: 1, limit: PAGE_SIZE * pages }), [key, pages])
  const prendas = (data?.items ?? []).filter((p) => p.evento !== CHECK_EVENT)
  const hasMore = !!data && data.items.length < data.total

  const sentinel = useRef<HTMLDivElement>(null)
  const nearEnd = useInView(sentinel, { margin: '400px' })
  useEffect(() => {
    if (nearEnd && hasMore && !loading) setPages((p) => p + 1)
  }, [nearEnd, hasMore, loading])

  const activeCount = LISTAS.reduce((n, k) => n + f.list(k).length, 0) + (query.precioMin !== undefined || query.precioMax !== undefined ? 1 : 0) + (query.oferta ? 1 : 0)
  const title = query.q ? `«${query.q}»` : query.oferta ? 'Ofertas' : (grupo ?? 'Toda la colección')

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-12 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="eyebrow">{query.q ? 'Resultados de búsqueda' : 'La colección'}</p>
          <motion.h1 key={title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-5xl sm:text-6xl">
            {title}
          </motion.h1>
          <p className="mt-3 max-w-full truncate font-mono text-[11px] text-muted" title={`GET /ropa${key}`}>
            GET /ropa{key || ''}
          </p>
        </div>
        <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.18em]">
          <span className="text-muted">{data ? `${data.total} prendas` : ''}</span>
          <button onClick={() => setSheet(true)} className="flex items-center gap-2 lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filtros {activeCount > 0 && <span className="rounded-full bg-pop px-1.5 text-white">{activeCount}</span>}
          </button>
          <select
            value={query.orden ?? ''}
            onChange={(e) => f.setValue('orden', e.target.value)}
            className="cursor-pointer bg-transparent uppercase outline-none"
            aria-label="Ordenar"
          >
            {ORDENES.map((o) => (
              <option key={o.value} value={o.value} className="bg-paper">
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2">
            <Filters slug={slug} filtros={filtros} />
          </div>
        </aside>

        <div>
          <ActiveChips filtros={filtros} />
          {error ? (
            <ErrorBox error={error} />
          ) : loading && !data ? (
            <GridSkeleton n={6} className="grid-cols-2 md:grid-cols-3" />
          ) : prendas.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-4xl">Nada por aquí…</p>
              <p className="mt-2 text-sm text-muted">Ninguna prenda cumple todos los filtros. Prueba a quitar alguno.</p>
              <button onClick={() => setShopQuery(new URLSearchParams())} className="mt-6 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-paper">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <motion.div layout className={`grid grid-cols-2 gap-x-4 gap-y-12 transition-opacity md:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
              {prendas.map((p, i) => (
                <ProductCard key={p._id} p={p} proveedores={filtros?.proveedores} index={i} />
              ))}
            </motion.div>
          )}
          <div ref={sentinel} className="py-10 text-center">
            {hasMore && (
              <button onClick={() => setPages((p) => p + 1)} disabled={loading} className="link-grow text-[11px] uppercase tracking-[0.2em] text-muted">
                {loading ? 'Cargando…' : `Ver más (${data!.total - data!.items.length})`}
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {sheet && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setSheet(false)} />
            <motion.div
              className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl bg-paper"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.2em]">Filtros</p>
                <button onClick={() => setSheet(false)} aria-label="Cerrar filtros">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5">
                <Filters slug={slug} filtros={filtros} />
              </div>
              <div className="drawer-footer border-t border-line px-5 py-4">
                <button onClick={() => setSheet(false)} className="w-full bg-ink py-3.5 text-[11px] uppercase tracking-[0.2em] text-paper">
                  Ver {data?.total ?? ''} prendas
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
