import { apiVersion, getToken } from '../api/client'
import { authApi, demoAuto } from './api'
import type { Rol } from './api'

// The API's seeded accounts (scripts/seed-usuarios.js). The site is a showcase, so they are public.
export const DEMO_ACCOUNTS: { rol: Rol; nombre: string; email: string; password: string; puede: string[] }[] = [
  {
    rol: 'cliente',
    nombre: 'Lucía Fernández',
    email: 'lucia.cliente@thebridge.tech',
    password: 'Cliente1234!',
    puede: ['Comprar y sumar puntos', 'Ver sus pedidos'],
  },
  {
    rol: 'empleado',
    nombre: 'Javier López',
    email: 'javier.empleado@thebridge.tech',
    password: 'Empleado1234!',
    puede: ['Gestionar prendas', 'Cambiar el estado de los pedidos'],
  },
  {
    rol: 'administrador',
    nombre: 'Admin TheBridge',
    email: 'admin@thebridge.tech',
    password: 'Admin1234!',
    puede: ['Todo lo anterior', 'Clientes, empleados, administradores y proveedores'],
  },
]

let pendiente: Promise<void> | null = null

// The showcase starts logged in as the admin, so every level (and the shop) is ready from the first visit.
// It logs back in when the 2-hour token expires, unless the visitor logged out on purpose.
function loginAdmin() {
  if (getToken() || !demoAuto()) return Promise.resolve()
  const admin = DEMO_ACCOUNTS.find((a) => a.rol === 'administrador')!
  pendiente ??= authApi
    .login(admin.email, admin.password)
    .then(() => undefined, () => undefined)
    .finally(() => (pendiente = null))
  return pendiente
}

export function arrancarDemo() {
  apiVersion.subscribe(() => {
    if (!getToken()) void loginAdmin()
  })
  return loginAdmin()
}
