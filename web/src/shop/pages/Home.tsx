import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useQuery } from '../../api/hooks'
import { Garment } from '../../components/Garment'
import { formatPrice } from '../../data/mock'
import { CHECK_EVENT } from '../../levels/levels'
import { proveedoresApi, ropaApi } from '../../ropa/api'
import { GRUPO_SLUG, nombreTipo } from '../../ropa/types'
import { CountUp, Magnetic, Marquee, Parallax, Reveal, RotatingBadge, SplitWords } from '../motion'
import { shopHref } from '../router'
import { ErrorBox, GridSkeleton, ProductCard } from '../ui'

const CATEGORY_TILES = [
  { slug: GRUPO_SLUG['Parte de arriba'], label: 'Parte de arriba', kind: 'knit', tone: '#b6533b', ink: '#f1d9cf' },
  { slug: GRUPO_SLUG['Parte de abajo'], label: 'Parte de abajo', kind: 'trousers', tone: '#d8cbbb', ink: '#6f5d48' },
  { slug: GRUPO_SLUG.Calzado, label: 'Calzado', kind: 'shoe', tone: '#2a2f36', ink: '#8b96a3' },
] as const

const sinChecks = <T extends { evento?: string }>(list: T[] = []) => list.filter((p) => p.evento !== CHECK_EVENT)

function Hero() {
  return (
    <section className="relative grid min-h-[calc(100dvh-4rem)] md:grid-cols-2">
      <Parallax className="grain min-h-[60vh]" offset={60}>
        <Garment kind="coat" tone="#d9cfc1" ink="#6b5a45" className="h-full" />
      </Parallax>
      <Parallax className="grain hidden md:block" offset={110}>
        <Garment kind="dress" tone="#2f2f2d" ink="#8c8a84" className="h-full" />
      </Parallax>

      <motion.div
        className="absolute right-6 top-6 z-10 h-28 w-28 text-ink sm:right-10 sm:top-10 sm:h-36 sm:w-36 md:text-paper"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 120, damping: 14 }}
      >
        <RotatingBadge text="1 punto por cada euro · 1 punto por cada euro · " className="h-full w-full">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-pop text-xs font-semibold text-white sm:h-16 sm:w-16 sm:text-sm">+1 pt</span>
        </RotatingBadge>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-4 pb-14 text-center md:pb-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-paper/85 px-3 py-1 text-[11px] uppercase tracking-[0.3em]"
        >
          Otoño — Invierno 2026
        </motion.p>
        <h1 className="mt-4 font-display text-6xl leading-[0.9] text-ink drop-shadow-[0_1px_20px_var(--paper)] sm:text-8xl lg:text-9xl">
          <SplitWords text="Lo esencial," delay={0.3} />
          <br />
          <em>
            <SplitWords text="bien hecho." delay={0.5} />
          </em>
        </h1>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }} className="mt-8">
          <Magnetic>
            <a
              href={shopHref('c/todo')}
              className="shine group inline-flex items-center gap-3 bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-paper"
            >
              Descubrir la colección <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  )
}

function Novedades() {
  const { data, loading, error } = useQuery(() => ropaApi.page({ orden: '-createdAt', disponible: true, limit: 9 }), [])
  const { data: filtros } = useQuery(() => ropaApi.filtros(), [])
  const novedades = sinChecks(data?.items).slice(0, 8)
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-24 sm:px-8">
      <Reveal className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Recién llegado · <span className="font-mono normal-case tracking-normal">GET /ropa?orden=-createdAt</span></p>
          <h2 className="mt-2 font-display text-5xl sm:text-6xl">Novedades</h2>
        </div>
        <a href={shopHref('c/todo?orden=-createdAt')} className="link-grow whitespace-nowrap text-[11px] uppercase tracking-[0.2em]">
          Ver todo
        </a>
      </Reveal>
      {error ? (
        <ErrorBox error={error} />
      ) : loading && !data ? (
        <GridSkeleton n={4} className="grid-cols-2 md:grid-cols-4" />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4">
          {novedades.map((p, i) => (
            <ProductCard key={p._id} p={p} proveedores={filtros?.proveedores} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}

function Categorias() {
  const { data: filtros } = useQuery(() => ropaApi.filtros(), [])
  const tipos = (slug: string) => filtros?.grupos.find((g) => g.slug === slug)?.tipos ?? []
  return (
    <section className="grid gap-px bg-line md:grid-cols-3">
      {CATEGORY_TILES.map((c, i) => (
        <Reveal key={c.slug} delay={i * 0.1}>
          <a href={shopHref(`c/${c.slug}`)} className="group relative block overflow-hidden bg-paper">
            <Garment
              kind={c.kind}
              tone={c.tone}
              ink={c.ink}
              className="aspect-[4/5] transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
            />
            <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4">
              <div className="bg-paper px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.25em]">{c.label}</p>
                <p className="mt-1 max-h-0 overflow-hidden text-xs capitalize text-muted transition-all duration-500 group-hover:max-h-10">
                  {tipos(c.slug).slice(0, 4).map(nombreTipo).join(' · ')}
                </p>
              </div>
              <span className="grid h-12 w-12 shrink-0 translate-y-3 place-items-center rounded-full bg-pop text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </div>
          </a>
        </Reveal>
      ))}
    </section>
  )
}

function Ofertas() {
  const { data } = useQuery(() => ropaApi.page({ oferta: true, disponible: true, orden: '-descuento', limit: 12 }), [])
  const ofertas = sinChecks(data?.items)
  if (!ofertas.length) return null
  return (
    <section className="overflow-hidden bg-pop-soft py-24">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Hasta -{Math.max(...ofertas.map((p) => p.descuento))}% · <span className="font-mono normal-case tracking-normal">?oferta=true&orden=-descuento</span></p>
            <h2 className="mt-2 font-display text-5xl sm:text-7xl">
              Precios que <em className="text-pop">se mueven</em>
            </h2>
          </div>
          <a href={shopHref('c/todo?oferta=true')} className="link-grow whitespace-nowrap text-[11px] uppercase tracking-[0.2em]">
            Todas las ofertas ({data?.total})
          </a>
        </Reveal>
      </div>
      <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 [scrollbar-width:thin] sm:px-8">
        {ofertas.map((p, i) => (
          <div key={p._id} className="w-[62vw] shrink-0 snap-start sm:w-[34vw] lg:w-[22vw]">
            <ProductCard p={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  )
}

function ApiStats() {
  const { data: ropa } = useQuery(() => ropaApi.page({ limit: 1 }), [])
  const { data: ofertas } = useQuery(() => ropaApi.page({ oferta: true, limit: 1 }), [])
  const { data: proveedores } = useQuery(() => proveedoresApi.page({ limit: 1 }), [])
  const { data: filtros } = useQuery(() => ropaApi.filtros(), [])
  const stats = [
    { value: ropa?.total, label: 'prendas en catálogo', endpoint: 'GET /ropa' },
    { value: ofertas?.total, label: 'en oferta ahora', endpoint: 'GET /ropa?oferta=true' },
    { value: proveedores?.total, label: 'proveedores', endpoint: 'GET /proveedores' },
    { value: filtros?.tallas.length, label: 'tallas con stock', endpoint: 'GET /ropa/filtros' },
  ]
  return (
    <section className="bg-ink px-4 py-24 text-paper sm:px-8">
      <div className="mx-auto max-w-[1500px]">
        <Reveal>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-pop">Con datos en directo</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
            Cada número de esta tienda sale de <em>vuestra API</em>.
          </h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-2 gap-px bg-paper/15 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="bg-ink p-6 sm:p-8">
              <p className="font-display text-6xl sm:text-7xl">{s.value === undefined ? '—' : <CountUp value={s.value} />}</p>
              <p className="mt-2 text-sm text-paper/70">{s.label}</p>
              <p className="mt-4 font-mono text-[11px] text-pop">{s.endpoint}</p>
            </Reveal>
          ))}
        </div>
        {filtros && filtros.precio.max > 0 && (
          <Reveal className="mt-10 text-sm text-paper/60">
            Precios desde {formatPrice(filtros.precio.min)} hasta {formatPrice(filtros.precio.max)}, ya con el descuento aplicado.
          </Reveal>
        )}
      </div>
    </section>
  )
}

export function Home() {
  return (
    <>
      <Hero />
      <Marquee
        className="border-y border-ink bg-ink py-3 text-[11px] uppercase tracking-[0.3em] text-paper"
        items={['Stock en tiempo real', '1 punto por cada euro', 'Express + MongoDB', 'Autenticación con JWT', 'Documentado con Swagger']}
      />
      <Novedades />
      <Categorias />
      <Ofertas />
      <ApiStats />
      <section className="px-4 py-28 text-center sm:px-8">
        <Reveal>
          <p className="eyebrow">Nuestra forma de hacer</p>
          <p className="mx-auto mt-6 max-w-5xl font-display text-4xl leading-tight sm:text-6xl">
            Tejidos nobles, pocas piezas y <em className="text-pop">ninguna prisa</em>. Ropa pensada para{' '}
            <span className="text-outline">quedarse</span>.
          </p>
        </Reveal>
      </section>
    </>
  )
}
