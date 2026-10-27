import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useQuery } from '../api/hooks'
import { authApi, esPersonal, useSession } from '../auth/api'
import type { Usuario } from '../auth/api'

type AuthValue = {
  usuario: Usuario | null
  rol?: string
  ready: boolean
  isStaff: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthValue | null>(null)

// The shop shares the session of "Mi cuenta"; the profile is fetched once here for every page.
export function AuthProvider({ children }: { children: ReactNode }) {
  const { token, claims } = useSession()
  const { data, error, loading } = useQuery(() => (token ? authApi.perfil() : Promise.resolve(null)), [token])

  const value: AuthValue = {
    usuario: token && !error ? (data ?? null) : null,
    rol: claims?.rol,
    ready: !token || !loading || !!data || !!error,
    isStaff: esPersonal(claims?.rol),
    isAdmin: claims?.rol === 'administrador',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
