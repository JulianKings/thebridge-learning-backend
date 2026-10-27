import { useEffect } from 'react'
import { LoginForm, RegistroForm } from '../../sections/Account'
import { useAuth } from '../AuthContext'
import { navigate } from '../router'

export function Login({ next }: { next?: string }) {
  const { usuario } = useAuth()

  useEffect(() => {
    if (usuario) navigate(next ?? 'cuenta')
  }, [usuario, next])

  return (
    <div className="mx-auto grid max-w-[1100px] gap-16 px-4 py-16 sm:px-8 md:grid-cols-2">
      <div>
        <h1 className="mb-8 font-display text-4xl">Iniciar sesión</h1>
        <LoginForm />
      </div>
      <div>
        <h2 className="font-display text-4xl">Crear cuenta</h2>
        <p className="mb-8 mt-2 text-sm text-muted">Guarda tus compras y acumula puntos con cada pedido.</p>
        <RegistroForm />
      </div>
    </div>
  )
}
