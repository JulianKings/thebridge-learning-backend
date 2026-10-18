import { API_URL } from '../config'

export type ApiResponse = { status: number; body: unknown; ms: number }

export type CheckContext = {
  // Responses are cached per run, so several checks can inspect the same call.
  get: (path: string) => Promise<ApiResponse>
}

export type CheckDef = {
  id: string
  label: string
  run: (ctx: CheckContext) => Promise<void>
}

export type LevelDef = {
  id: number
  key: string
  title: string
  short: string
  tagline: string
  goal: string
  reward: string
  // Empty until the class reaches that stage; a level without checks stays locked.
  checks: CheckDef[]
}

export class CheckFailed extends Error {}

export async function request(path: string): Promise<ApiResponse> {
  const start = performance.now()
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(8000) })
  } catch {
    // The browser reports a CORS rejection exactly like a dead server.
    throw new CheckFailed('Sin respuesta. ¿Está el servidor encendido y con CORS activado?')
  }
  const ms = Math.round(performance.now() - start)
  const body = await res.json().catch(() => null)
  return { status: res.status, body, ms }
}

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    key: 'conexion',
    title: 'Primer endpoint',
    short: 'Express',
    tagline: 'Node, Express y MVC',
    goal: 'Crea un servidor Express con estructura MVC y un endpoint GET /api/status que responda { "status": "ok" }.',
    reward: 'La tienda abre sus puertas: portada y estado del servidor en vivo.',
    checks: [
      {
        id: 'reachable',
        label: 'El servidor responde',
        run: async (ctx) => {
          await ctx.get('/api/status')
        },
      },
      {
        id: 'ok',
        label: 'GET /api/status devuelve 200',
        run: async (ctx) => {
          const { status } = await ctx.get('/api/status')
          if (status !== 200) throw new CheckFailed(`Ha devuelto ${status}`)
        },
      },
      {
        id: 'json',
        label: 'La respuesta es { "status": "ok" }',
        run: async (ctx) => {
          const { body } = await ctx.get('/api/status')
          if ((body as { status?: unknown } | null)?.status !== 'ok') {
            throw new CheckFailed(`Hemos recibido ${JSON.stringify(body)}`)
          }
        },
      },
    ],
  },
  {
    id: 2,
    key: 'catalogo',
    title: 'Base de datos',
    short: 'Mongoose',
    tagline: 'Mongoose + MongoDB',
    goal: 'Conecta la API a MongoDB con Mongoose y sirve el catálogo de prendas desde la base de datos.',
    reward: 'El escaparate se llena con las prendas de vuestra base de datos.',
    checks: [],
  },
  {
    id: 3,
    key: 'crud',
    title: 'CRUD',
    short: 'CRUD',
    tagline: 'API REST y validación',
    goal: 'Completa el CRUD de prendas siguiendo REST y valida los datos que llegan a la API.',
    reward: 'Se activa el panel de trabajador para gestionar el catálogo.',
    checks: [],
  },
  {
    id: 4,
    key: 'auth',
    title: 'Autenticación',
    short: 'Auth',
    tagline: 'Login, JWT y rutas protegidas',
    goal: 'Registro e inicio de sesión con contraseñas cifradas, tokens JWT y rutas protegidas por rol.',
    reward: 'Los clientes entran en su cuenta y cada rol ve solo lo que le corresponde.',
    checks: [],
  },
  {
    id: 5,
    key: 'swagger',
    title: 'Documentación',
    short: 'Swagger',
    tagline: 'Swagger / OpenAPI',
    goal: 'Documenta la API con Swagger para que cualquiera pueda usarla.',
    reward: 'La tienda se pone de gala con el modo editorial.',
    checks: [],
  },
  {
    id: 6,
    key: 'mejoras',
    title: 'Mejoras',
    short: 'Mejoras',
    tagline: 'Postman, CORS y pulido',
    goal: 'Prueba la API con Postman, configura CORS solo para esta web y pule las respuestas y los errores.',
    reward: 'Búsqueda, filtros y paginación en el catálogo.',
    checks: [],
  },
  {
    id: 7,
    key: 'completa',
    title: 'Tienda completa',
    short: 'Final',
    tagline: 'Todos los endpoints',
    goal: 'Añade los endpoints que faltan: materiales, pedidos y gestión de usuarios.',
    reward: 'La tienda al completo, funcionando con vuestra API.',
    checks: [],
  },
]

export const levelById = (id: number) => LEVELS.find((l) => l.id === id)!
