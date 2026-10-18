import { SectionHeading } from './SectionHeading'

const ORDERS = [
  { id: '#10482', date: '02 oct 2026', total: '139,90 €' },
  { id: '#10391', date: '14 sep 2026', total: '49,95 €' },
]

const inputCls = 'w-full border-b border-line bg-transparent py-2.5 text-sm outline-none placeholder:text-muted focus:border-ink'

export function Account() {
  return (
    <div className="px-4 py-16 sm:px-8">
      <SectionHeading level={4} title="Mi cuenta" />
      <div className="grid gap-10 lg:grid-cols-2">
        <form onSubmit={(e) => e.preventDefault()} className="max-w-md space-y-5">
          <p className="pb-1 text-[11px] uppercase tracking-[0.18em]">Iniciar sesión</p>
          <input className={inputCls} type="email" placeholder="Email" defaultValue="carlos@correo.es" />
          <input className={inputCls} type="password" placeholder="Contraseña" defaultValue="supersecreta" />
          <button className="w-full bg-ink py-3.5 text-xs uppercase tracking-[0.2em] text-paper hover:opacity-85">Entrar</button>
          <p className="font-mono text-[11px] text-muted">POST /api/auth/login</p>
        </form>

        <div className="border border-line bg-panel p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-paper-2 font-display text-xl">CV</div>
            <div>
              <p className="font-display text-2xl">Hola, Carlos</p>
              <p className="text-xs text-muted">carlos@correo.es · cliente</p>
            </div>
          </div>
          <p className="eyebrow mt-8">Últimos pedidos</p>
          <ul className="mt-2 divide-y divide-line text-sm">
            {ORDERS.map((o) => (
              <li key={o.id} className="flex justify-between py-3">
                <span>
                  {o.id} <span className="text-muted">· {o.date}</span>
                </span>
                <span>{o.total}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
