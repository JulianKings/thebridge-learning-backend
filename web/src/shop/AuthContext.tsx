import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api, getToken, setToken } from '../api/mockApi'
import type { User } from '../api/types'

type AuthValue = {
  user: User | null
  ready: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<User>
  logout: () => void
  isStaff: boolean
  isManager: boolean
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(!getToken())

  // Restore the session from a saved token, like a real app on reload.
  useEffect(() => {
    if (!getToken()) return
    api
      .me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setReady(true))
  }, [])

  const start = ({ token, user }: { token: string; user: User }) => {
    setToken(token)
    setUser(user)
    return user
  }

  const value: AuthValue = {
    user,
    ready,
    login: (email, password) => api.login(email, password).then(start),
    register: (name, email, password) => api.register(name, email, password).then(start),
    logout: () => {
      setToken(null)
      setUser(null)
    },
    isStaff: user?.role === 'trabajador' || user?.role === 'encargado',
    isManager: user?.role === 'encargado',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
