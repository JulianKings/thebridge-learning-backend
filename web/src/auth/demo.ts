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
