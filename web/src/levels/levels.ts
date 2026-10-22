import { API_URL } from '../config'

export type ApiResponse = { status: number; body: unknown; ms: number }

export type CheckContext = {
  // Cached per run, so several checks can inspect the same response.
  get: (path: string) => Promise<ApiResponse>
  send: (method: string, path: string, body?: unknown) => Promise<ApiResponse>
  // Shared by the checks of one level, e.g. the id of a product created by an earlier check.
  state: Record<string, unknown>
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
  // Levels that write to the students' database are skipped by the background poll.
  writes?: boolean
  // Runs after the level's checks even when one fails, to remove test data.
  cleanup?: (ctx: CheckContext) => Promise<void>
}

export class CheckFailed extends Error {}

export async function request(path: string, method = 'GET', body?: unknown): Promise<ApiResponse> {
  const start = performance.now()
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    // The browser reports a CORS rejection exactly like a dead server.
    throw new CheckFailed('Sin respuesta. ¿Está el servidor encendido y con CORS activado?')
  }
  const ms = Math.round(performance.now() - start)
  const data = await res.json().catch(() => null)
  return { status: res.status, body: data, ms }
}

const isObjectId = (v: unknown): v is string => typeof v === 'string' && /^[a-f\d]{24}$/i.test(v)

const field = (body: unknown, key: string) => (body && typeof body === 'object' ? (body as Record<string, unknown>)[key] : undefined)

function expectStatus(res: ApiResponse, expected: number[], what: string) {
  if (expected.includes(res.status)) return
  const message = field(res.body, 'message')
  throw new CheckFailed(`${what}: esperábamos ${expected.join(' o ')} y ha devuelto ${res.status}${message ? ` (${message})` : ''}`)
}

// Marks the products created by the level 3 checks, so screens can hide them.
export const CHECK_EVENT = '__check__'
const MISSING_ID = '0'.repeat(24)

const testProducto = (proveedor: string) => ({
  tipo: 'sudadera',
  precio: 39.95,
  disponible: true,
  talla: [{ talla_tipo: 'M', talla_stock: 5 }],
  temporada: 'Otoño-Invierno',
  descuento: 10,
  evento: CHECK_EVENT,
  foto: 'https://example.com/check.jpg',
  proveedor,
})

type CrudState = { proveedor?: string; id?: string; created?: string[] }
const crud = (ctx: CheckContext) => ctx.state as CrudState
const track = (ctx: CheckContext, id: string) => (crud(ctx).created ??= []).push(id)

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    key: 'conexion',
    title: 'Primer endpoint',
    short: 'Express',
    tagline: 'Node, Express y MVC',
    goal: 'Crea un servidor Express con estructura MVC y un endpoint GET /status que responda { "status": "ok" }.',
    reward: 'La tienda abre sus puertas: portada y estado del servidor en vivo.',
    checks: [
      {
        id: 'reachable',
        label: 'El servidor responde',
        run: async (ctx) => {
          await ctx.get('/status')
        },
      },
      {
        id: 'ok',
        label: 'GET /status devuelve 200',
        run: async (ctx) => expectStatus(await ctx.get('/status'), [200], 'GET /status'),
      },
      {
        id: 'json',
        label: 'La respuesta es { "status": "ok" }',
        run: async (ctx) => {
          const { body } = await ctx.get('/status')
          if (field(body, 'status') !== 'ok') throw new CheckFailed(`Hemos recibido ${JSON.stringify(body)}`)
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
    goal: 'Conecta la API a MongoDB con Mongoose, crea el modelo de prenda y sirve el catálogo con GET /ropa.',
    reward: 'El escaparate se llena con las prendas de vuestra base de datos.',
    checks: [
      {
        id: 'db',
        label: 'GET /status indica "db": "conectada"',
        run: async (ctx) => {
          const { body } = await ctx.get('/status')
          if (field(body, 'db') !== 'conectada') {
            throw new CheckFailed(`Esperábamos "db": "conectada" y hemos recibido ${JSON.stringify(field(body, 'db') ?? null)}`)
          }
        },
      },
      {
        id: 'list',
        label: 'GET /ropa devuelve una lista',
        run: async (ctx) => {
          const res = await ctx.get('/ropa')
          expectStatus(res, [200], 'GET /ropa')
          if (!Array.isArray(res.body)) throw new CheckFailed('La respuesta debería ser un array de prendas')
        },
      },
      {
        id: 'mongo',
        label: 'Las prendas vienen de MongoDB',
        run: async (ctx) => {
          const list = (await ctx.get('/ropa')).body as unknown[]
          if (list.length === 0) throw new CheckFailed('La lista está vacía: inserta alguna prenda en la base de datos')
          if (!list.every((p) => isObjectId(field(p, '_id')))) throw new CheckFailed('Alguna prenda no tiene un _id de MongoDB')
          if (!list.every((p) => field(p, 'tipo') && typeof field(p, 'precio') === 'number')) {
            throw new CheckFailed('Cada prenda debería tener al menos tipo y precio')
          }
        },
      },
    ],
  },
  {
    id: 3,
    key: 'crud',
    title: 'CRUD',
    short: 'CRUD',
    tagline: 'API REST y validación',
    goal: 'Completa el CRUD de prendas en /ropa (GET, POST, PUT, DELETE), une cada prenda a su proveedor y valida los datos.',
    reward: 'Se activa el panel de trabajador para gestionar el catálogo.',
    writes: true,
    checks: [
      {
        id: 'create',
        label: 'POST /ropa crea una prenda (201)',
        run: async (ctx) => {
          const proveedores = await ctx.get('/proveedores')
          expectStatus(proveedores, [200], 'GET /proveedores')
          const proveedor = Array.isArray(proveedores.body) ? field(proveedores.body[0], '_id') : undefined
          if (!isObjectId(proveedor)) throw new CheckFailed('GET /proveedores no devuelve ningún proveedor con _id')
          const res = await ctx.send('POST', '/ropa', testProducto(proveedor))
          const id = field(res.body, '_id')
          if (res.status === 201 && isObjectId(id)) track(ctx, id)
          expectStatus(res, [201], 'POST /ropa')
          if (!isObjectId(id)) throw new CheckFailed('La respuesta no incluye el _id de la prenda creada')
          Object.assign(crud(ctx), { proveedor, id })
        },
      },
      {
        id: 'populate',
        label: 'GET /ropa/:id la devuelve con su proveedor',
        run: async (ctx) => {
          const res = await ctx.send('GET', `/ropa/${crud(ctx).id}`)
          expectStatus(res, [200], 'GET /ropa/:id')
          if (field(res.body, '_id') !== crud(ctx).id) throw new CheckFailed('Ha devuelto otra prenda')
          if (typeof field(field(res.body, 'proveedor'), 'nombreComercial') !== 'string') {
            throw new CheckFailed('El proveedor viene sin datos: usa populate para unir la prenda con su proveedor')
          }
        },
      },
      {
        id: 'update',
        label: 'PUT /ropa/:id la modifica',
        run: async (ctx) => {
          const { id, proveedor } = crud(ctx)
          expectStatus(await ctx.send('PUT', `/ropa/${id}`, { ...testProducto(proveedor!), precio: 49.95 }), [200], 'PUT /ropa/:id')
          const after = await ctx.send('GET', `/ropa/${id}`)
          if (field(after.body, 'precio') !== 49.95) throw new CheckFailed('El cambio de precio no se ha guardado')
        },
      },
      {
        id: 'delete',
        label: 'DELETE /ropa/:id la elimina',
        run: async (ctx) => {
          const { id } = crud(ctx)
          expectStatus(await ctx.send('DELETE', `/ropa/${id}`), [200, 204], 'DELETE /ropa/:id')
          expectStatus(await ctx.send('GET', `/ropa/${id}`), [404], 'GET de una prenda borrada')
          crud(ctx).created = crud(ctx).created?.filter((c) => c !== id)
        },
      },
      {
        id: 'validate',
        label: 'Rechaza datos inválidos (400)',
        run: async (ctx) => {
          const valid = testProducto(crud(ctx).proveedor!)
          const { temporada: _omit, ...withoutTemporada } = valid
          const cases: [string, unknown, number[]][] = [
            ['un tipo que no está en la lista', { ...valid, tipo: 'capa' }, [400]],
            ['un descuento del 95 %', { ...valid, descuento: 95 }, [400]],
            ['una prenda sin temporada', withoutTemporada, [400]],
            ['un proveedor que no existe', { ...valid, proveedor: MISSING_ID }, [400, 404]],
          ]
          for (const [what, body, expected] of cases) {
            const res = await ctx.send('POST', '/ropa', body)
            const id = field(res.body, '_id')
            if (isObjectId(id)) track(ctx, id)
            expectStatus(res, expected, `POST /ropa con ${what}`)
          }
        },
      },
      {
        id: 'ids',
        label: 'Ids inválidos o inexistentes (400 / 404)',
        run: async (ctx) => {
          expectStatus(await ctx.send('GET', '/ropa/no-es-un-id'), [400], 'GET /ropa con un id mal formado')
          expectStatus(await ctx.send('GET', `/ropa/${MISSING_ID}`), [404], 'GET /ropa con un id que no existe')
        },
      },
    ],
    cleanup: async (ctx) => {
      for (const id of crud(ctx).created ?? []) await ctx.send('DELETE', `/ropa/${id}`).catch(() => {})
    },
  },
  {
    id: 4,
    key: 'swagger',
    title: 'Documentación',
    short: 'Swagger',
    tagline: 'Swagger / OpenAPI',
    goal: 'Documenta la API con Swagger para que cualquiera pueda usarla.',
    reward: 'La tienda se pone de gala con el modo editorial.',
    checks: [],
  },
  {
    id: 5,
    key: 'auth',
    title: 'Autenticación',
    short: 'Auth',
    tagline: 'Login, JWT y rutas protegidas',
    goal: 'Registro e inicio de sesión con contraseñas cifradas, tokens JWT y rutas protegidas por rol.',
    reward: 'Los clientes entran en su cuenta y cada rol ve solo lo que le corresponde.',
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
