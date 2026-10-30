import { useSyncExternalStore } from 'react'
import { apiVersion, call, decodeToken, getToken, setToken } from '../api/client'

export type Genero = 'Hombre' | 'Mujer'

// Clientes and Empleados are separate collections; GET /auth/perfil returns whichever the token belongs to.
export type Usuario = {
  _id: string
  nombre: string
  email: string
  fechaNacimiento?: string
  genero?: Genero
  cp?: string
  puntos?: number
  afiliado?: string
  cargo?: 'reponedor' | 'dependiente' | 'encargado'
  horario?: string
}

export type RegistroInput = Pick<Usuario, 'nombre' | 'email' | 'cp'> & { password: string; fechaNacimiento: string; genero: Genero }

export type Rol = 'cliente' | 'empleado' | 'trabajador' | 'administrador'
export const esPersonal = (rol?: string) => rol === 'empleado' || rol === 'trabajador' || rol === 'administrador'

// <input type="date"> gives YYYY-MM-DD; the API stores DD/MM/YYYY.
export const aFechaApi = (iso: string) => iso.split('-').reverse().join('/')

export type Claims = { rol?: string; cargo?: string; exp?: number; iat?: number; [k: string]: unknown }

// The user may come back as "usuario" or under its role's name ("cliente", "empleado", "administrador").
type LoginResponse = { token: string; usuario?: Usuario; cliente?: Usuario; empleado?: Usuario; administrador?: Usuario }

export const authApi = {
  async login(email: string, password: string) {
    const res = await call<LoginResponse>('POST', '/auth/login', { email, password })
    setToken(res.token)
    return res.usuario ?? res.cliente ?? res.empleado ?? res.administrador
  },
  // Registration may or may not log the new cliente in; if it doesn't, log in with the same credentials.
  async registro(data: RegistroInput) {
    const res = await call<Partial<LoginResponse> | null>('POST', '/auth/registro', data)
    if (res?.token) setToken(res.token)
    else await authApi.login(data.email, data.password)
  },
  perfil: () => call<Usuario>('GET', '/auth/perfil'),
  logout: () => setToken(null),
}

export function useSession() {
  const token = useSyncExternalStore(apiVersion.subscribe, getToken)
  const claims = token ? (decodeToken(token) as Claims | null) : null
  return { token, claims }
}
