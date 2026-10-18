import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../AuthContext'
import { navigate } from '../router'
import { btnGhost, btnPrimary, field, toast, toastError } from '../ui'

export function Login({ next }: { next?: string }) {
  const { login, register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [reg, setReg] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)

  const done = (name: string) => {
    toast(`Hola, ${name.split(' ')[0]}`)
    navigate(next ?? 'cuenta')
  }

  const run = async (fn: () => Promise<{ name: string }>) => {
    setBusy(true)
    try {
      done((await fn()).name)
    } catch (e) {
      toastError(e)
    } finally {
      setBusy(false)
    }
  }

  const onLogin = (e: FormEvent) => {
    e.preventDefault()
    run(() => login(email, password))
  }

  const onRegister = (e: FormEvent) => {
    e.preventDefault()
    run(() => register(reg.name, reg.email, reg.password))
  }

  return (
    <div className="mx-auto grid max-w-[1100px] gap-16 px-4 py-16 sm:px-8 md:grid-cols-2">
      <form onSubmit={onLogin}>
        <h1 className="font-display text-4xl">Iniciar sesión</h1>
        <div className="mt-8 space-y-5">
          <input className={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={field} type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button disabled={busy} className={`${btnPrimary} mt-8 w-full`}>
          Entrar
        </button>
      </form>

      <form onSubmit={onRegister}>
        <h2 className="font-display text-4xl">Crear cuenta</h2>
        <p className="mt-2 text-sm text-muted">Guarda tus pedidos y compra más rápido.</p>
        <div className="mt-8 space-y-5">
          <input className={field} placeholder="Nombre" value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} required />
          <input className={field} type="email" placeholder="Email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} required />
          <input className={field} type="password" placeholder="Contraseña (mín. 6)" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} required />
        </div>
        <button disabled={busy} className={`${btnGhost} mt-8 w-full`}>
          Registrarme
        </button>
      </form>
    </div>
  )
}
