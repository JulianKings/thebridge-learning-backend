import { Check, KeyRound, Minus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSession } from '../auth/api'
import type { Claims } from '../auth/api'
import { levelById } from '../levels/levels'
import { useProgress } from '../progress/ProgressContext'
import { SectionHeading } from './SectionHeading'

const EXAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MThiMDAwMDAwMDAwMDAwMDAwMDAwMSIsInJvbCI6ImNsaWVudGUiLCJpYXQiOjE3OTIxNDEyMDAsImV4cCI6MTc5MjE0NDgwMH0.Qm9uZGFkX2hpbG9fc2VjcmV0b19ub19jb21wYXJ0aXI'
const EXAMPLE_CLAIMS: Claims = { id: '6718b0000000000000000001', rol: 'cliente', iat: 1792141200, exp: 1792144800 }

const ROLES = ['Cliente', 'Empleado', 'Administrador'] as const

const PERMISSIONS: { action: string; roles: [boolean, boolean, boolean] }[] = [
  { action: 'Ver el catálogo', roles: [true, true, true] },
  { action: 'Comprar y acumular puntos', roles: [true, false, false] },
  { action: 'Crear y editar prendas', roles: [false, true, true] },
  { action: 'Ver todas las compras', roles: [false, true, true] },
  { action: 'Modificar proveedores', roles: [false, false, true] },
  { action: 'Gestionar clientes y empleados', roles: [false, false, true] },
]

const columnOf = (claims: Claims | null) =>
  claims?.rol === 'cliente' ? 0 : claims?.rol === 'empleado' ? 1 : claims?.rol === 'administrador' ? 2 : null

function useSecondsLeft(exp: number | undefined) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  return exp === undefined ? null : Math.floor(exp - now / 1000)
}

const clock = (s: number) => {
  const h = Math.floor(s / 3600)
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export function Security() {
  const { isUnlocked, results } = useProgress()
  const session = useSession()
  const live = isUnlocked(5)
  const token = live ? session.token : EXAMPLE_TOKEN
  const claims = live ? session.claims : EXAMPLE_CLAIMS
  const left = useSecondsLeft(claims?.exp)
  const column = columnOf(claims)
  const [header, payload, signature] = token?.split('.') ?? []

  return (
    <div className="px-4 py-16 sm:px-8">
      <SectionHeading level={5} title="Sesión segura">
        <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
          <KeyRound className="h-4 w-4" /> JWT
        </span>
      </SectionHeading>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Tu token</p>
          {token ? (
            <>
              <p className="mt-3 break-all border border-line bg-panel p-4 font-mono text-xs leading-relaxed">
                <span className="text-bad">{header}</span>.<span className="text-accent">{payload}</span>.<span className="text-ok">{signature}</span>
              </p>
              <p className="mt-2 text-xs text-muted">
                <span className="text-bad">cabecera</span> · <span className="text-accent">datos</span> · <span className="text-ok">firma</span>
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <pre className="overflow-x-auto bg-paper-2 p-4 font-mono text-xs leading-relaxed">{JSON.stringify(claims, null, 2)}</pre>
                <div className="flex flex-col justify-center border border-line p-4 text-center">
                  <p className="eyebrow">Caduca en</p>
                  <p className="mt-1 font-mono text-2xl tabular-nums">
                    {left === null ? 'Nunca' : left > 0 ? clock(left) : <span className="text-bad">Caducado</span>}
                  </p>
                </div>
              </div>
              {left === null && <p className="mt-2 text-xs text-bad">Este token no caduca: conviene firmarlo con expiresIn.</p>}
            </>
          ) : (
            <p className="mt-3 border border-dashed border-line p-6 text-center text-sm text-muted">
              Inicia sesión en «Mi cuenta» para ver aquí tu token y lo que lleva dentro.
            </p>
          )}
        </div>

        <div>
          <p className="eyebrow">Permisos por rol</p>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] text-muted">
                <th className="py-2 text-left font-normal" />
                {ROLES.map((r, i) => (
                  <th key={r} className={`py-2 text-center font-normal ${column === i ? 'text-ink underline underline-offset-4' : ''}`}>
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.action} className="border-b border-line">
                  <td className="py-2.5">{p.action}</td>
                  {p.roles.map((ok, i) => (
                    <td key={i} className={`text-center ${column === i ? 'bg-paper-2' : ''}`}>
                      {ok ? <Check className="mx-auto h-4 w-4 text-ok" /> : <Minus className="mx-auto h-4 w-4 text-line" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {live && !isUnlocked(6) && <p className="mt-2 text-xs text-muted">Las rutas aún no están protegidas por rol: es parte del nivel 6.</p>}

          <p className="eyebrow mt-8">Comprobaciones de autenticación</p>
          <ul className="mt-3 space-y-1.5 text-xs">
            {levelById(5).checks.map((c) => {
              const status = live ? results[5]?.[c.id]?.status : 'pass'
              return (
                <li key={c.id} className="flex items-center gap-2">
                  {status === 'pass' ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-ok" />
                  ) : status === 'fail' ? (
                    <X className="h-3.5 w-3.5 shrink-0 text-bad" />
                  ) : (
                    <Minus className="h-3.5 w-3.5 shrink-0 text-line" />
                  )}
                  {c.label}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
