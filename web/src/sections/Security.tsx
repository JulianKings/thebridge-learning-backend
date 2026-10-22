import { Check, Minus, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SectionHeading } from './SectionHeading'

const TOKEN = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJzdWIiOiJ1MiIsIm5hbWUiOiJEaWVnbyBSb21lcm8iLCJyb2xlIjoidHJhYmFqYWRvciJ9',
  'Qm9uZGFkX2hpbG9fc2VjcmV0b19ub19jb21wYXJ0aXI',
]

const PERMISSIONS: { action: string; roles: [boolean, boolean, boolean] }[] = [
  { action: 'Ver catálogo', roles: [true, true, true] },
  { action: 'Comprar', roles: [true, true, true] },
  { action: 'Crear / editar prendas', roles: [false, true, true] },
  { action: 'Gestionar materiales', roles: [false, true, true] },
  { action: 'Gestionar trabajadores', roles: [false, false, true] },
  { action: 'Gestionar clientes', roles: [false, false, true] },
]

const LOG = [
  { m: 'GET', path: '/api/products', who: 'anónimo', code: 200 },
  { m: 'PUT', path: '/api/products/p3', who: 'sin token', code: 401 },
  { m: 'DELETE', path: '/api/products/p3', who: 'cliente', code: 403 },
  { m: 'PUT', path: '/api/products/p3', who: 'token manipulado', code: 401 },
  { m: 'PUT', path: '/api/products/p3', who: 'trabajador', code: 200 },
]

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : seconds)), 1000)
    return () => clearInterval(t)
  }, [seconds])
  return `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`
}

export function Security() {
  const expires = useCountdown(3540)

  return (
    <div className="px-4 py-16 sm:px-8">
      <SectionHeading level={5} title="Sesión segura">
        <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ok">
          <ShieldCheck className="h-4 w-4" /> Rutas protegidas
        </span>
      </SectionHeading>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Tu token</p>
          <p className="mt-3 break-all border border-line bg-panel p-4 font-mono text-xs leading-relaxed">
            <span className="text-bad">{TOKEN[0]}</span>.<span className="text-accent">{TOKEN[1]}</span>.
            <span className="text-ok">{TOKEN[2]}</span>
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <pre className="overflow-x-auto bg-paper-2 p-4 font-mono text-xs leading-relaxed">
{`{
  "sub": "u2",
  "name": "Diego Romero",
  "role": "trabajador",
  "iat": 1792141200,
  "exp": 1792144800
}`}
            </pre>
            <div className="flex flex-col justify-center border border-line p-4 text-center">
              <p className="eyebrow">Caduca en</p>
              <p className="mt-1 font-mono text-2xl tabular-nums">{expires}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="eyebrow">Permisos por rol</p>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] text-muted">
                <th className="py-2 text-left font-normal" />
                {['Cliente', 'Trabajador', 'Encargado'].map((r) => (
                  <th key={r} className="py-2 text-center font-normal">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.action} className="border-b border-line">
                  <td className="py-2.5">{p.action}</td>
                  {p.roles.map((ok, i) => (
                    <td key={i} className="text-center">
                      {ok ? <Check className="mx-auto h-4 w-4 text-ok" /> : <Minus className="mx-auto h-4 w-4 text-line" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <p className="eyebrow mt-8">Últimas peticiones</p>
          <ul className="mt-3 space-y-1.5 font-mono text-[11px]">
            {LOG.map((l, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className={`w-10 text-center ${l.code < 300 ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'}`}>{l.code}</span>
                <span className="w-14 text-muted">{l.m}</span>
                <span className="flex-1 truncate">{l.path}</span>
                <span className="text-muted">{l.who}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
