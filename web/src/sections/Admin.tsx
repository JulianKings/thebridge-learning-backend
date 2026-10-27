import { useProgress } from '../progress/ProgressContext'
import { formatPrice } from '../data/mock'
import { MOCK_PROVEEDORES } from '../ropa/mock'
import { SectionHeading } from './SectionHeading'

const CLIENTES = [
  { nombre: 'Ana Ortega', email: 'ana@correo.es', puntos: 340 },
  { nombre: 'Carlos Vidal', email: 'carlos@correo.es', puntos: 125 },
  { nombre: 'Marta Gil', email: 'marta@correo.es', puntos: 60 },
]

const COMPRAS = [
  { cliente: 'Ana Ortega', resumen: 'Abrigo · Otoño-Invierno (M × 1)', total: 189, puntos: 189 },
  { cliente: 'Carlos Vidal', resumen: 'Camisa · Primavera-Verano (L × 2)', total: 79.92, puntos: 79 },
  { cliente: 'Marta Gil', resumen: 'Gorra · Todo el año (M × 1)', total: 24.95, puntos: 24 },
]

const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .map((w) => w[0])
    .join('')

export function Admin() {
  return (
    <div className="px-4 py-16 sm:px-8">
      <SectionHeading level={7} title="Gestión de la tienda" />
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="font-display text-2xl">Últimas compras</p>
          <p className="mt-1 text-sm text-muted">Cada compra descuenta stock y suma puntos al cliente.</p>
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {COMPRAS.map((c) => (
              <li key={c.cliente} className="flex items-center gap-4 py-3 text-sm">
                <span className="min-w-0 flex-1">
                  {c.cliente}
                  <span className="block truncate text-xs text-muted">{c.resumen}</span>
                </span>
                <span className="text-xs text-ok">+{c.puntos} pts</span>
                <span className="w-20 text-right">{formatPrice(c.total)}</span>
              </li>
            ))}
          </ul>

          <p className="mt-10 font-display text-2xl">Proveedores</p>
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {MOCK_PROVEEDORES.map((p) => (
              <li key={p._id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  {p.nombreComercial}
                  <span className="block text-xs text-muted">{p.condicionesPago}</span>
                </span>
                <span className="text-xs text-muted">{p.descuentosVolumen}% por volumen</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-2xl">Clientes y puntos</p>
          <p className="mt-1 text-sm text-muted">Solo un administrador gestiona clientes y empleados.</p>
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {CLIENTES.map((c) => (
              <li key={c.email} className="flex items-center gap-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper-2 text-xs">{iniciales(c.nombre)}</span>
                <span className="min-w-0 flex-1 text-sm">
                  {c.nombre}
                  <span className="block truncate text-xs text-muted">{c.email}</span>
                </span>
                <span className="text-sm">{c.puntos} pts</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function Finale() {
  const { completed } = useProgress()
  return (
    <footer className="border-t border-line px-4 py-16 text-center sm:px-8">
      {completed >= 7 ? (
        <>
          <p className="eyebrow">7 de 7 niveles</p>
          <p className="mx-auto mt-4 max-w-3xl font-display text-5xl leading-tight sm:text-6xl">
            Esta tienda funciona con <em>vuestro</em> backend.
          </p>
          <a href="#tienda" className="mt-8 inline-block bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-paper hover:opacity-85">
            Entrar en la tienda
          </a>
        </>
      ) : (
        <p className="font-display text-2xl text-muted">Faltan {7 - completed} niveles para abrir la tienda al completo.</p>
      )}
      <p className="mt-10 font-display text-xl tracking-[0.35em]">HILO</p>
      <p className="mt-2 text-xs text-muted">Proyecto de aprendizaje · The Bridge</p>
    </footer>
  )
}
