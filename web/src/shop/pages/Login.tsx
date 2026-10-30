import { useEffect } from 'react'
import { DemoAccounts } from '../../auth/DemoAccounts'
import { LoginForm, RegistroForm } from '../../sections/Account'
import { useAuth } from '../AuthContext'
import { Reveal } from '../motion'
import { navigate } from '../router'

export function Login({ next }: { next?: string }) {
  const { usuario, rol } = useAuth()

  useEffect(() => {
    if (usuario) navigate(next ?? (rol === 'cliente' ? 'cuenta' : 'gestion'))
  }, [usuario, rol, next])

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-8">
      <Reveal>
        <p className="eyebrow">Escaparate de la API · cuentas de demostración</p>
        <h1 className="mt-2 font-display text-5xl sm:text-6xl">
          Entra con <em className="text-pop">un clic</em>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Cada cuenta tiene un rol distinto en el JWT y la API le deja hacer cosas distintas. Prueba las tres y compara lo que ves.
        </p>
      </Reveal>
      <div className="mt-10">
        <DemoAccounts />
      </div>

      <div className="mt-20 grid gap-16 border-t border-line pt-14 md:grid-cols-2">
        <div>
          <h2 className="mb-8 font-display text-3xl">Iniciar sesión</h2>
          <LoginForm />
        </div>
        <div>
          <h2 className="font-display text-3xl">Crear cuenta</h2>
          <p className="mb-8 mt-2 text-sm text-muted">Guarda tus compras y acumula puntos con cada pedido.</p>
          <RegistroForm />
        </div>
      </div>
    </div>
  )
}
