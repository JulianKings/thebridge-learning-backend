import { useId, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useQuery } from '../api/hooks'
import { authApi, useSession } from '../auth/api'
import type { Genero, RegistroInput, Usuario } from '../auth/api'
import { useProgress } from '../progress/ProgressContext'
import { ErrorBox, toast, toastError } from '../shop/ui'
import { SectionHeading } from './SectionHeading'

const inputCls = 'w-full border-b border-line bg-transparent py-2.5 text-sm outline-none placeholder:text-muted focus:border-ink'
const buttonCls = 'w-full bg-ink py-3.5 text-xs uppercase tracking-[0.2em] text-paper hover:opacity-85 disabled:opacity-40'

const PREVIEW: Usuario & { rol: string } = {
  _id: 'preview',
  nombre: 'Carlos Vidal',
  email: 'carlos@correo.es',
  fechaNacimiento: '1998-04-12',
  genero: 'Hombre',
  cp: '28013',
  puntos: 120,
  rol: 'cliente',
}

function Field({ label, children }: { label: string; children: (id: string) => ReactNode }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="text-[11px] text-muted">
        {label}
      </label>
      {children(id)}
    </div>
  )
}

function useSubmit() {
  const [busy, setBusy] = useState(false)
  const run = async (e: FormEvent, fn: () => Promise<unknown>, ok: string) => {
    e.preventDefault()
    setBusy(true)
    try {
      await fn()
      toast(ok)
    } catch (err) {
      toastError(err)
    } finally {
      setBusy(false)
    }
  }
  return { busy, run }
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { busy, run } = useSubmit()
  return (
    <form onSubmit={(e) => run(e, () => authApi.login(email, password), 'Sesión iniciada')} className="space-y-5">
      <Field label="Email">{(id) => <input id={id} type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
      <Field label="Contraseña">
        {(id) => <input id={id} type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />}
      </Field>
      <button disabled={busy} className={buttonCls}>
        Entrar
      </button>
      <p className="font-mono text-[11px] text-muted">POST /auth/login · clientes y empleados</p>
    </form>
  )
}

function RegistroForm() {
  const [data, setData] = useState<RegistroInput>({ nombre: '', email: '', password: '', fechaNacimiento: '', genero: 'Mujer', cp: '' })
  const set = (patch: Partial<RegistroInput>) => setData((d) => ({ ...d, ...patch }))
  const { busy, run } = useSubmit()
  return (
    <form onSubmit={(e) => run(e, () => authApi.registro(data), 'Cuenta creada')} className="space-y-5">
      <Field label="Nombre">{(id) => <input id={id} className={inputCls} value={data.nombre} onChange={(e) => set({ nombre: e.target.value })} />}</Field>
      <Field label="Email">{(id) => <input id={id} type="email" className={inputCls} value={data.email} onChange={(e) => set({ email: e.target.value })} />}</Field>
      <Field label="Contraseña">
        {(id) => <input id={id} type="password" className={inputCls} value={data.password} onChange={(e) => set({ password: e.target.value })} />}
      </Field>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Nacimiento">
          {(id) => <input id={id} type="date" className={inputCls} value={data.fechaNacimiento} onChange={(e) => set({ fechaNacimiento: e.target.value })} />}
        </Field>
        <Field label="Género">
          {(id) => (
            <select id={id} className={inputCls} value={data.genero} onChange={(e) => set({ genero: e.target.value as Genero })}>
              <option className="bg-paper">Mujer</option>
              <option className="bg-paper">Hombre</option>
            </select>
          )}
        </Field>
        <Field label="Código postal">{(id) => <input id={id} className={inputCls} value={data.cp} onChange={(e) => set({ cp: e.target.value })} />}</Field>
      </div>
      <button disabled={busy} className={buttonCls}>
        Crear cuenta
      </button>
      <p className="font-mono text-[11px] text-muted">POST /auth/registro · siempre crea un cliente</p>
    </form>
  )
}

function Perfil({ usuario, rol, onLogout }: { usuario: Usuario; rol?: string; onLogout?: () => void }) {
  const iniciales = usuario.nombre
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
  const datos: [string, ReactNode][] = [
    ['Rol', rol ?? '—'],
    ...(usuario.cargo ? [['Cargo', usuario.cargo] as [string, ReactNode]] : []),
    ...(usuario.horario ? [['Horario', usuario.horario] as [string, ReactNode]] : []),
    ...(usuario.puntos !== undefined ? [['Puntos', usuario.puntos] as [string, ReactNode]] : []),
    ['Nacimiento', usuario.fechaNacimiento?.slice(0, 10) ?? '—'],
    ['Código postal', usuario.cp ?? '—'],
  ]
  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-paper-2 font-display text-xl uppercase">{iniciales}</div>
        <div>
          <p className="font-display text-2xl">Hola, {usuario.nombre.split(' ')[0]}</p>
          <p className="text-xs text-muted">{usuario.email}</p>
        </div>
      </div>
      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 text-sm">
        {datos.map(([k, v]) => (
          <div key={k}>
            <dt className="eyebrow">{k}</dt>
            <dd className="mt-1 capitalize">{v}</dd>
          </div>
        ))}
      </dl>
      {onLogout && (
        <button onClick={onLogout} className="mt-8 text-xs text-muted underline underline-offset-4">
          Cerrar sesión
        </button>
      )}
      <p className="mt-4 font-mono text-[11px] text-muted">GET /auth/perfil</p>
    </>
  )
}

function AuthForms() {
  const [tab, setTab] = useState<'login' | 'registro'>('login')
  return (
    <div className="max-w-xl">
      <div className="mb-8 flex gap-6">
        {(['login', 'registro'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-1 text-[11px] uppercase tracking-[0.18em] ${tab === t ? 'border-b border-ink' : 'text-muted hover:text-ink'}`}
          >
            {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        ))}
      </div>
      {tab === 'login' ? <LoginForm /> : <RegistroForm />}
    </div>
  )
}

function LiveAccount() {
  const { token, claims } = useSession()
  const { data, error } = useQuery(() => (token ? authApi.perfil() : Promise.resolve(null)), [token])

  if (token) {
    return (
      <div className="max-w-xl border border-line bg-panel p-6 sm:p-8">
        {error ? (
          <>
            <ErrorBox error={error} />
            <button onClick={authApi.logout} className="mt-6 text-xs text-muted underline underline-offset-4">
              Cerrar sesión
            </button>
          </>
        ) : data ? (
          <Perfil usuario={data} rol={claims?.rol} onLogout={authApi.logout} />
        ) : (
          <p className="text-sm text-muted">Cargando tu perfil…</p>
        )}
      </div>
    )
  }

  return <AuthForms />
}

export function Account() {
  const { isUnlocked } = useProgress()
  return (
    <div className="px-4 py-16 sm:px-8">
      <SectionHeading level={5} title="Mi cuenta" />
      {isUnlocked(5) ? (
        <LiveAccount />
      ) : (
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="max-w-md space-y-5">
            <p className="pb-1 text-[11px] uppercase tracking-[0.18em]">Iniciar sesión</p>
            <input className={inputCls} type="email" placeholder="Email" defaultValue="carlos@correo.es" aria-label="Email" />
            <input className={inputCls} type="password" placeholder="Contraseña" defaultValue="supersecreta" aria-label="Contraseña" />
            <span className={`${buttonCls} block text-center`}>Entrar</span>
          </div>
          <div className="border border-line bg-panel p-6 sm:p-8">
            <Perfil usuario={PREVIEW} rol={PREVIEW.rol} />
          </div>
        </div>
      )}
    </div>
  )
}
