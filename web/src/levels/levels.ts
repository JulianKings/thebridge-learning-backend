import { decodeToken } from '../api/client'
import { API_URL } from '../config'

export type ApiResponse = { status: number; body: unknown; ms: number }

export type CheckContext = {
  // Cached per run, so several checks can inspect the same response.
  get: (path: string) => Promise<ApiResponse>
  send: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<ApiResponse>
  // Shared by the checks of one level, e.g. the id of a product created by an earlier check.
  state: Record<string, unknown>
  // Whoever is logged in on "Mi cuenta": staff-only checks run with this session, never with stored credentials.
  session: Session | null
}

export type Session = { token: string; rol?: string }

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
// Can't be verified right now but isn't the students' fault (e.g. a route protected in level 6); doesn't block the level.
export class CheckSkipped extends Error {}
// Needs someone logged in with a given role on "Mi cuenta"; blocks the level until then.
export class NeedsLogin extends Error {}

// A body sent as-is, to test how the API copes with malformed JSON.
export class RawBody {
  constructor(public text: string) {}
}

export async function request(path: string, method = 'GET', body?: unknown, headers: Record<string, string> = {}): Promise<ApiResponse> {
  const start = performance.now()
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { ...(body !== undefined && { 'Content-Type': 'application/json' }), ...headers },
      body: body instanceof RawBody ? body.text : body !== undefined ? JSON.stringify(body) : undefined,
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

type CrudState = { proveedor?: string; id?: string; created?: string[]; protegido?: boolean }
const crud = (ctx: CheckContext) => ctx.state as CrudState
const track = (ctx: CheckContext, id: string) => (crud(ctx).created ??= []).push(id)

type Spec = {
  openapi?: unknown
  info?: { title?: unknown }
  paths?: Record<string, Record<string, unknown>>
  components?: {
    schemas?: Record<string, SchemaNode>
    securitySchemes?: Record<string, { type?: unknown; scheme?: unknown }>
  }
}

type SchemaNode = { required?: unknown; allOf?: unknown; $ref?: unknown }

const resolveRef = (spec: Spec, ref: unknown) =>
  typeof ref === 'string' && ref.startsWith('#/components/schemas/') ? spec.components?.schemas?.[ref.split('/').pop()!] : undefined

// Required fields of a schema, following $ref and allOf (e.g. Producto = allOf[_id, $ref ProductoInput, timestamps]).
function requiredFields(spec: Spec, schema: SchemaNode | undefined, seen = new Set<unknown>()): string[] {
  if (!schema || seen.has(schema)) return []
  seen.add(schema)
  const own = Array.isArray(schema.required) ? schema.required.filter((f): f is string => typeof f === 'string') : []
  const parts = Array.isArray(schema.allOf) ? (schema.allOf as SchemaNode[]) : []
  return [...own, ...requiredFields(spec, resolveRef(spec, schema.$ref), seen), ...parts.flatMap((p) => requiredFields(spec, p, seen))]
}

const requestSchema = (spec: Spec, method: string, path: string) => {
  const op = Object.entries(spec.paths ?? {}).find(([p]) => routeShape(p) === routeShape(path))?.[1]?.[method]
  const content = field(field(op, 'requestBody'), 'content')
  return field(field(content, 'application/json'), 'schema') as SchemaNode | undefined
}

async function getSpec(ctx: CheckContext): Promise<Spec> {
  const res = await ctx.get('/api-docs.json')
  expectStatus(res, [200], 'GET /api-docs.json')
  if (!res.body || typeof res.body !== 'object') throw new CheckFailed('/api-docs.json no devuelve un documento JSON')
  return res.body as Spec
}

// Path parameters may be named {id}, {_id}…; only the shape of the route matters.
const routeShape = (path: string) => path.replace(/\{[^}]+\}/g, '{}').replace(/\/$/, '')

function expectDocumented(spec: Spec, routes: [string, string][]) {
  const documented = new Set(
    Object.entries(spec.paths ?? {}).flatMap(([path, ops]) => Object.keys(ops ?? {}).map((m) => `${m.toUpperCase()} ${routeShape(path)}`)),
  )
  const missing = routes.filter(([m, p]) => !documented.has(`${m} ${routeShape(p)}`)).map(([m, p]) => `${m} ${p}`)
  if (missing.length) throw new CheckFailed(`Faltan por documentar: ${missing.join(', ')}`)
}

// Each browser registers one test cliente and reuses it, so the checks don't pile up users.
type TestCliente = { nombre: string; email: string; password: string }
const TEST_CLIENTE_KEY = 'hilo-check-cliente'

function storedCliente(): TestCliente | null {
  try {
    return JSON.parse(localStorage.getItem(TEST_CLIENTE_KEY) ?? 'null')
  } catch {
    return null
  }
}

function storeCliente(c: TestCliente) {
  try {
    localStorage.setItem(TEST_CLIENTE_KEY, JSON.stringify(c))
  } catch {
    // Without storage a new test cliente is registered on every run.
  }
}

const randomId = () => Math.random().toString(36).slice(2, 10)
const newCliente = (): TestCliente => ({ nombre: 'Cliente de prueba', email: `check.${randomId()}@thebridge.test`, password: `Check-${randomId()}` })
const registroBody = (c: TestCliente) => ({ ...c, fechaNacimiento: '01/01/2000', genero: 'Mujer', cp: '28013' })
const includesPassword = (body: unknown) => JSON.stringify(body ?? null).includes('"password"')
const bearer = (token: string) => ({ Authorization: `Bearer ${token}` })

type AuthState = { cliente?: TestCliente; token?: string }
const auth = (ctx: CheckContext) => ctx.state as AuthState

const STAFF = ['trabajador', 'administrador']
const staffToken = (ctx: CheckContext) => (ctx.session && STAFF.includes(ctx.session.rol ?? '') ? ctx.session.token : null)
const asStaff = (ctx: CheckContext) => {
  const token = staffToken(ctx)
  return token ? bearer(token) : {}
}

function requireStaff(ctx: CheckContext, why: string) {
  const token = staffToken(ctx)
  if (!token) throw new NeedsLogin(`Inicia sesión como empleado o administrador en «Mi cuenta» ${why}`)
  return bearer(token)
}

async function primerProveedor(ctx: CheckContext) {
  const res = await ctx.get('/proveedores')
  expectStatus(res, [200], 'GET /proveedores')
  const id = Array.isArray(res.body) ? field(res.body[0], '_id') : undefined
  if (!isObjectId(id)) throw new CheckFailed('GET /proveedores no devuelve ningún proveedor con _id')
  return id
}

async function loginTestCliente(ctx: CheckContext) {
  const cliente = storedCliente()
  if (!cliente) throw new CheckFailed('No encontramos el cliente de prueba del nivel 5: vuelve a comprobar ese nivel')
  const res = await ctx.send('POST', '/auth/login', { email: cliente.email, password: cliente.password })
  expectStatus(res, [200], 'Login del cliente de prueba')
  const token = field(res.body, 'token')
  if (typeof token !== 'string') throw new CheckFailed('El login no devuelve "token"')
  return token
}

async function puntosDe(ctx: CheckContext, token: string) {
  const res = await ctx.send('GET', '/auth/perfil', undefined, bearer(token))
  expectStatus(res, [200], 'GET /auth/perfil')
  return Number(field(res.body, 'puntos') ?? 0)
}

const listOf = (res: ApiResponse) => (Array.isArray(res.body) ? res.body : null)

function expectNoPasswords(res: ApiResponse, what: string) {
  if (!Array.isArray(res.body)) throw new CheckFailed(`${what} debería devolver una lista`)
  if (includesPassword(res.body)) throw new CheckFailed(`${what} incluye contraseñas: quítalas de la respuesta`)
}

async function borrarCreadas(ctx: CheckContext) {
  for (const id of crud(ctx).created ?? []) await ctx.send('DELETE', `/ropa/${id}`, undefined, asStaff(ctx)).catch(() => {})
}

type TiendaState = CrudState & { compra?: string; puntos?: number; cliente?: string }
const tienda = (ctx: CheckContext) => ctx.state as TiendaState

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
          const proveedor = await primerProveedor(ctx)
          const res = await ctx.send('POST', '/ropa', testProducto(proveedor), asStaff(ctx))
          // Once level 6 protects writes, anonymous visitors can't run the CRUD; that's progress, not a regression.
          if ([401, 403].includes(res.status) && !staffToken(ctx)) {
            crud(ctx).protegido = true
            throw new CheckSkipped('Ruta protegida: inicia sesión como empleado en «Mi cuenta» para comprobar el CRUD completo')
          }
          const id = field(res.body, '_id')
          if (res.status === 201 && isObjectId(id)) track(ctx, id)
          expectStatus(res, [201], 'POST /ropa')
          if (!isObjectId(id)) throw new CheckFailed('La respuesta no incluye el _id de la prenda creada')
          Object.assign(crud(ctx), { proveedor, id })
        },
      },
      {
        id: 'read',
        label: 'GET /ropa/:id devuelve la prenda creada',
        run: async (ctx) => {
          if (crud(ctx).protegido) throw new CheckSkipped('Pendiente: inicia sesión como empleado para comprobarlo')
          const { id, proveedor } = crud(ctx)
          const res = await ctx.send('GET', `/ropa/${id}`)
          expectStatus(res, [200], 'GET /ropa/:id')
          if (field(res.body, '_id') !== id) throw new CheckFailed('Ha devuelto otra prenda')
          // The join may come back as the ObjectId or populated with the supplier's data.
          const ref = field(res.body, 'proveedor')
          const refId = ref && typeof ref === 'object' ? field(ref, '_id') : ref
          if (refId !== proveedor) throw new CheckFailed('La prenda no guarda el proveedor con el que se creó')
        },
      },
      {
        id: 'update',
        label: 'PUT /ropa/:id la modifica',
        run: async (ctx) => {
          if (crud(ctx).protegido) throw new CheckSkipped('Pendiente: inicia sesión como empleado para comprobarlo')
          const { id, proveedor } = crud(ctx)
          expectStatus(await ctx.send('PUT', `/ropa/${id}`, { ...testProducto(proveedor!), precio: 49.95 }, asStaff(ctx)), [200], 'PUT /ropa/:id')
          const after = await ctx.send('GET', `/ropa/${id}`)
          if (field(after.body, 'precio') !== 49.95) throw new CheckFailed('El cambio de precio no se ha guardado')
        },
      },
      {
        id: 'delete',
        label: 'DELETE /ropa/:id la elimina',
        run: async (ctx) => {
          if (crud(ctx).protegido) throw new CheckSkipped('Pendiente: inicia sesión como empleado para comprobarlo')
          const { id } = crud(ctx)
          expectStatus(await ctx.send('DELETE', `/ropa/${id}`, undefined, asStaff(ctx)), [200, 204], 'DELETE /ropa/:id')
          expectStatus(await ctx.send('GET', `/ropa/${id}`), [404], 'GET de una prenda borrada')
          crud(ctx).created = crud(ctx).created?.filter((c) => c !== id)
        },
      },
      {
        id: 'validate',
        label: 'Rechaza datos inválidos (400)',
        run: async (ctx) => {
          if (crud(ctx).protegido) throw new CheckSkipped('Pendiente: inicia sesión como empleado para comprobarlo')
          const valid = testProducto(crud(ctx).proveedor!)
          const { temporada: _omit, ...withoutTemporada } = valid
          const cases: [string, unknown, number[]][] = [
            ['un tipo que no está en la lista', { ...valid, tipo: 'capa' }, [400]],
            ['un descuento del 95 %', { ...valid, descuento: 95 }, [400]],
            ['una prenda sin temporada', withoutTemporada, [400]],
            ['un proveedor que no existe', { ...valid, proveedor: MISSING_ID }, [400, 404]],
          ]
          for (const [what, body, expected] of cases) {
            const res = await ctx.send('POST', '/ropa', body, asStaff(ctx))
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
    cleanup: borrarCreadas,
  },
  {
    id: 4,
    key: 'swagger',
    title: 'Documentación',
    short: 'Swagger',
    tagline: 'Swagger / OpenAPI',
    goal: 'Documenta la API con Swagger: interfaz en /api-docs y especificación OpenAPI en /api-docs.json.',
    reward: 'La tienda se pone de gala con el modo editorial y muestra vuestra documentación en vivo.',
    checks: [
      {
        id: 'ui',
        label: 'GET /api-docs muestra Swagger UI',
        run: async (ctx) => expectStatus(await ctx.get('/api-docs'), [200], 'GET /api-docs'),
      },
      {
        id: 'spec',
        label: 'GET /api-docs.json es un documento OpenAPI 3',
        run: async (ctx) => {
          const spec = await getSpec(ctx)
          if (typeof spec.openapi !== 'string' || !spec.openapi.startsWith('3.')) throw new CheckFailed('Falta "openapi": "3.x" en la especificación')
          if (typeof spec.info?.title !== 'string') throw new CheckFailed('Falta info.title en la especificación')
          if (!spec.paths || typeof spec.paths !== 'object') throw new CheckFailed('La especificación no tiene "paths"')
        },
      },
      {
        id: 'paths',
        label: 'Documenta /status y el CRUD de /ropa',
        run: async (ctx) =>
          expectDocumented(await getSpec(ctx), [
            ['GET', '/status'],
            ['GET', '/ropa'],
            ['POST', '/ropa'],
            ['GET', '/ropa/{id}'],
            ['PUT', '/ropa/{id}'],
            ['DELETE', '/ropa/{id}'],
          ]),
      },
      {
        id: 'schema',
        label: 'Define el esquema Producto con sus campos obligatorios',
        run: async (ctx) => {
          const spec = await getSpec(ctx)
          const producto = Object.entries(spec.components?.schemas ?? {}).find(([name]) => name.toLowerCase() === 'producto')?.[1]
          if (!producto) throw new CheckFailed('No hay ningún esquema "Producto" en components.schemas')
          // Either the Producto schema or the body that POST /ropa expects may carry the required list.
          const required = new Set([...requiredFields(spec, producto), ...requiredFields(spec, requestSchema(spec, 'post', '/ropa'))])
          const missing = ['tipo', 'precio', 'temporada', 'proveedor'].filter((f) => !required.has(f))
          if (missing.length) throw new CheckFailed(`El esquema Producto no marca como obligatorios: ${missing.join(', ')}`)
        },
      },
    ],
  },
  {
    id: 5,
    key: 'auth',
    title: 'Autenticación',
    short: 'Auth',
    tagline: 'Registro, login y JWT',
    goal: 'Registro de clientes e inicio de sesión de clientes y empleados con contraseñas cifradas y tokens JWT.',
    reward: 'Los clientes se registran e inician sesión, y ves tu propio token.',
    writes: true,
    checks: [
      {
        id: 'registro',
        label: 'POST /auth/registro crea un cliente',
        run: async (ctx) => {
          const stored = storedCliente()
          const cliente = stored ?? newCliente()
          const res = await ctx.send('POST', '/auth/registro', registroBody(cliente))
          auth(ctx).cliente = cliente
          // Registered on a previous run: the API now rejects the repeated email, as it should.
          if (stored && [400, 409].includes(res.status)) return
          expectStatus(res, [201], 'POST /auth/registro')
          if (includesPassword(res.body)) throw new CheckFailed('La respuesta incluye la contraseña: no la devuelvas nunca')
          storeCliente(cliente)
        },
      },
      {
        id: 'duplicado',
        label: 'Un email ya registrado se rechaza (400 / 409)',
        run: async (ctx) =>
          expectStatus(await ctx.send('POST', '/auth/registro', registroBody(auth(ctx).cliente!)), [400, 409], 'Registro con un email repetido'),
      },
      {
        id: 'login',
        label: 'POST /auth/login devuelve un token JWT con el rol',
        run: async (ctx) => {
          const { email, password } = auth(ctx).cliente!
          const res = await ctx.send('POST', '/auth/login', { email, password })
          expectStatus(res, [200], 'POST /auth/login')
          const token = field(res.body, 'token')
          const claims = typeof token === 'string' ? decodeToken(token) : null
          if (typeof token !== 'string' || !claims) throw new CheckFailed('La respuesta debería incluir "token" con un JWT válido')
          if (claims.rol !== 'cliente') throw new CheckFailed(`El token debería llevar rol: "cliente" y lleva ${JSON.stringify(claims.rol ?? null)}`)
          if (!field(res.body, 'usuario')) throw new CheckFailed('La respuesta debería incluir "usuario"')
          if (includesPassword(res.body)) throw new CheckFailed('La respuesta incluye la contraseña: no la devuelvas nunca')
          auth(ctx).token = token
        },
      },
      {
        id: 'wrong',
        label: 'Una contraseña incorrecta devuelve 401',
        run: async (ctx) => {
          const { email } = auth(ctx).cliente!
          expectStatus(await ctx.send('POST', '/auth/login', { email, password: 'contraseña-incorrecta' }), [401], 'Login con contraseña incorrecta')
        },
      },
      {
        id: 'perfil',
        label: 'GET /auth/perfil con el token devuelve tu perfil',
        run: async (ctx) => {
          const res = await ctx.send('GET', '/auth/perfil', undefined, bearer(auth(ctx).token!))
          expectStatus(res, [200], 'GET /auth/perfil')
          if (field(res.body, 'email') !== auth(ctx).cliente!.email) throw new CheckFailed('El perfil devuelto no es el del usuario del token')
          if (includesPassword(res.body)) throw new CheckFailed('El perfil incluye la contraseña: no la devuelvas nunca')
        },
      },
      {
        id: 'protegido',
        label: 'Sin token o con un token falso, 401',
        run: async (ctx) => {
          expectStatus(await ctx.send('GET', '/auth/perfil'), [401], 'GET /auth/perfil sin token')
          const token = auth(ctx).token!
          const forged = token.slice(0, -2) + (token.endsWith('AA') ? 'BB' : 'AA')
          expectStatus(await ctx.send('GET', '/auth/perfil', undefined, bearer(forged)), [401], 'GET /auth/perfil con la firma manipulada')
        },
      },
      {
        id: 'docs',
        label: 'Swagger documenta el login y la autenticación Bearer',
        run: async (ctx) => {
          const spec = await getSpec(ctx)
          expectDocumented(spec, [
            ['POST', '/auth/registro'],
            ['POST', '/auth/login'],
            ['GET', '/auth/perfil'],
          ])
          const schemes = Object.values(spec.components?.securitySchemes ?? {})
          if (!schemes.some((sc) => sc.type === 'http' && String(sc.scheme).toLowerCase() === 'bearer')) {
            throw new CheckFailed('Añade en components.securitySchemes un esquema { type: "http", scheme: "bearer" }')
          }
        },
      },
    ],
  },
  {
    id: 6,
    key: 'mejoras',
    title: 'Mejoras',
    short: 'Mejoras',
    tagline: 'Rutas protegidas, CORS y consultas',
    goal: 'Protege las rutas por rol, limita CORS a esta web, filtra y pagina el catálogo y responde siempre los errores en JSON.',
    reward: 'Filtros por tipo y paginación en el catálogo, servidos por vuestra API.',
    writes: true,
    checks: [
      {
        id: 'json-404',
        label: 'Una ruta que no existe devuelve 404 en JSON',
        run: async (ctx) => {
          const res = await ctx.send('GET', '/ruta-que-no-existe')
          expectStatus(res, [404], 'GET /ruta-que-no-existe')
          if (typeof field(res.body, 'message') !== 'string') throw new CheckFailed('Devuelve 404, pero no un JSON con "message"')
        },
      },
      {
        id: 'json-400',
        label: 'Un JSON mal formado devuelve 400 en JSON',
        run: async (ctx) => {
          const res = await ctx.send('POST', '/ropa', new RawBody('{"tipo": '))
          expectStatus(res, [400], 'POST /ropa con un JSON roto')
          if (typeof field(res.body, 'message') !== 'string') throw new CheckFailed('Devuelve 400, pero no un JSON con "message"')
        },
      },
      {
        id: 'filtro',
        label: 'GET /ropa?tipo= filtra por tipo',
        run: async (ctx) => {
          const todas = listOf(await ctx.get('/ropa')) ?? []
          const tipo = field(todas[0], 'tipo')
          if (typeof tipo !== 'string') throw new CheckFailed('Necesitamos alguna prenda en el catálogo para probar el filtro')
          const res = await ctx.get(`/ropa?tipo=${encodeURIComponent(tipo)}`)
          expectStatus(res, [200], 'GET /ropa?tipo=')
          const filtradas = listOf(res)
          if (!filtradas?.length) throw new CheckFailed(`GET /ropa?tipo=${tipo} debería devolver al menos una prenda`)
          if (filtradas.some((p) => field(p, 'tipo') !== tipo)) throw new CheckFailed(`GET /ropa?tipo=${tipo} devuelve prendas de otros tipos`)
        },
      },
      {
        id: 'paginacion',
        label: 'GET /ropa?page=&limit= pagina los resultados',
        run: async (ctx) => {
          if ((listOf(await ctx.get('/ropa')) ?? []).length < 2) throw new CheckFailed('Necesitamos al menos 2 prendas para comprobar la paginación')
          const [p1, p2] = await Promise.all([ctx.get('/ropa?page=1&limit=1'), ctx.get('/ropa?page=2&limit=1')])
          const [a, b] = [listOf(p1), listOf(p2)]
          if (a?.length !== 1 || b?.length !== 1) throw new CheckFailed('Con limit=1 cada página debería traer exactamente 1 prenda')
          if (field(a[0], '_id') === field(b[0], '_id')) throw new CheckFailed('La página 2 devuelve la misma prenda que la página 1')
        },
      },
      {
        id: 'sin-token',
        label: 'Escribir en /ropa sin token devuelve 401',
        run: async (ctx) => {
          const res = await ctx.send('POST', '/ropa', testProducto(await primerProveedor(ctx)))
          const id = field(res.body, '_id')
          if (isObjectId(id)) track(ctx, id)
          expectStatus(res, [401], 'POST /ropa sin token')
        },
      },
      {
        id: 'cliente-403',
        label: 'Un cliente no puede crear prendas (403)',
        run: async (ctx) => {
          const res = await ctx.send('POST', '/ropa', testProducto(await primerProveedor(ctx)), bearer(await loginTestCliente(ctx)))
          const id = field(res.body, '_id')
          if (isObjectId(id)) track(ctx, id)
          expectStatus(res, [403], 'POST /ropa con el token de un cliente')
        },
      },
      {
        id: 'proveedores',
        label: 'Solo un administrador modifica proveedores (401 / 403)',
        run: async (ctx) => {
          expectStatus(await ctx.send('POST', '/proveedores', {}), [401], 'POST /proveedores sin token')
          expectStatus(await ctx.send('POST', '/proveedores', {}, bearer(await loginTestCliente(ctx))), [403], 'POST /proveedores con el token de un cliente')
        },
      },
      {
        id: 'empleado',
        label: 'Un empleado con sesión sí puede crear y borrar prendas',
        run: async (ctx) => {
          const staff = requireStaff(ctx, 'para comprobar que el personal sí puede escribir')
          const res = await ctx.send('POST', '/ropa', testProducto(await primerProveedor(ctx)), staff)
          const id = field(res.body, '_id')
          if (isObjectId(id)) track(ctx, id)
          expectStatus(res, [201], 'POST /ropa con sesión de empleado')
          expectStatus(await ctx.send('DELETE', `/ropa/${id}`, undefined, staff), [200, 204], 'DELETE /ropa/:id con sesión de empleado')
          crud(ctx).created = crud(ctx).created?.filter((c) => c !== id)
        },
      },
      {
        id: 'cors',
        label: 'CORS limitado a esta web',
        run: async () => {
          // Browsers refuse credentialed requests to "*", so this only succeeds when CORS names this site.
          const ok = await fetch(`${API_URL}/status`, { credentials: 'include', signal: AbortSignal.timeout(8000) }).then(
            (r) => r.ok,
            () => false,
          )
          if (!ok) throw new CheckFailed(`CORS sigue abierto a cualquier origen: usa cors({ origin: '${location.origin}', credentials: true })`)
        },
      },
    ],
    cleanup: borrarCreadas,
  },
  {
    id: 7,
    key: 'completa',
    title: 'Tienda completa',
    short: 'Final',
    tagline: 'Compras, puntos y administración',
    goal: 'Guarda las compras de los clientes, descuenta el stock, suma puntos y deja la gestión de clientes y empleados al administrador.',
    reward: 'La tienda al completo, funcionando con vuestra API.',
    writes: true,
    checks: [
      {
        id: 'compra-401',
        label: 'POST /compras sin token devuelve 401',
        run: async (ctx) => expectStatus(await ctx.send('POST', '/compras', { productos: [] }), [401], 'POST /compras sin token'),
      },
      {
        id: 'compra',
        label: 'Un cliente compra una prenda (201)',
        run: async (ctx) => {
          const staff = requireStaff(ctx, 'para crear la prenda de prueba que vamos a comprar')
          const prenda = await ctx.send('POST', '/ropa', testProducto(await primerProveedor(ctx)), staff)
          const id = field(prenda.body, '_id')
          if (isObjectId(id)) track(ctx, id)
          expectStatus(prenda, [201], 'Crear la prenda de prueba')
          const cliente = await loginTestCliente(ctx)
          const puntos = await puntosDe(ctx, cliente)
          const res = await ctx.send('POST', '/compras', { productos: [{ producto: id, talla: 'M', cantidad: 2 }] }, bearer(cliente))
          expectStatus(res, [201], 'POST /compras')
          const compra = field(res.body, '_id')
          if (!isObjectId(compra)) throw new CheckFailed('La respuesta no incluye el _id de la compra')
          if (!(Number(field(res.body, 'total')) > 0)) throw new CheckFailed('La compra debería incluir su "total"')
          Object.assign(tienda(ctx), { id, compra, puntos, cliente })
        },
      },
      {
        id: 'stock',
        label: 'La compra descuenta el stock de esa talla',
        run: async (ctx) => {
          const res = await ctx.send('GET', `/ropa/${tienda(ctx).id}`)
          const talla = (field(res.body, 'talla') as unknown[] | undefined)?.find((t) => field(t, 'talla_tipo') === 'M')
          const stock = field(talla, 'talla_stock')
          if (stock !== 3) throw new CheckFailed(`Había 5 en la talla M y se compraron 2: esperábamos 3 y hay ${JSON.stringify(stock ?? null)}`)
        },
      },
      {
        id: 'puntos',
        label: 'La compra suma puntos al cliente',
        run: async (ctx) => {
          const { puntos, cliente } = tienda(ctx)
          const ahora = await puntosDe(ctx, cliente!)
          if (!(ahora > puntos!)) throw new CheckFailed(`Los puntos del cliente no han aumentado (tenía ${puntos}, tiene ${ahora})`)
          tienda(ctx).puntos = ahora
        },
      },
      {
        id: 'historial',
        label: 'GET /compras/mias incluye la compra',
        run: async (ctx) => {
          const res = await ctx.send('GET', '/compras/mias', undefined, bearer(tienda(ctx).cliente!))
          expectStatus(res, [200], 'GET /compras/mias')
          if (!listOf(res)?.some((c) => field(c, '_id') === tienda(ctx).compra)) throw new CheckFailed('La compra que acabamos de hacer no aparece en GET /compras/mias')
        },
      },
      {
        id: 'sin-stock',
        label: 'Comprar más de lo que hay se rechaza y no suma puntos',
        run: async (ctx) => {
          const { id, cliente, puntos } = tienda(ctx)
          const res = await ctx.send('POST', '/compras', { productos: [{ producto: id, talla: 'M', cantidad: 99 }] }, bearer(cliente!))
          expectStatus(res, [400, 409], 'POST /compras con más unidades que stock')
          const ahora = await puntosDe(ctx, cliente!)
          if (ahora !== puntos) throw new CheckFailed(`Una compra rechazada ha cambiado los puntos (de ${puntos} a ${ahora})`)
        },
      },
      {
        id: 'compras-privadas',
        label: 'GET /compras es solo para el personal (401 / 403)',
        run: async (ctx) => {
          expectStatus(await ctx.send('GET', '/compras'), [401], 'GET /compras sin token')
          expectStatus(await ctx.send('GET', '/compras', undefined, bearer(tienda(ctx).cliente!)), [403], 'GET /compras con el token de un cliente')
        },
      },
      {
        id: 'usuarios-privados',
        label: 'Clientes y empleados solo los gestiona un administrador',
        run: async (ctx) => {
          const cliente = bearer(tienda(ctx).cliente!)
          expectStatus(await ctx.send('GET', '/clientes'), [401], 'GET /clientes sin token')
          expectStatus(await ctx.send('GET', '/clientes', undefined, cliente), [403], 'GET /clientes con el token de un cliente')
          expectStatus(await ctx.send('POST', '/empleados', {}, cliente), [403], 'POST /empleados con el token de un cliente')
        },
      },
      {
        id: 'admin',
        label: 'Un administrador ve clientes y empleados sin contraseñas',
        run: async (ctx) => {
          if (ctx.session?.rol !== 'administrador') throw new NeedsLogin('Inicia sesión como administrador en «Mi cuenta» para comprobar la gestión de usuarios')
          const admin = bearer(ctx.session.token)
          for (const ruta of ['/clientes', '/empleados']) {
            const res = await ctx.send('GET', ruta, undefined, admin)
            expectStatus(res, [200], `GET ${ruta} como administrador`)
            expectNoPasswords(res, `GET ${ruta}`)
          }
        },
      },
      {
        id: 'docs',
        label: 'Swagger documenta compras y gestión de usuarios',
        run: async (ctx) =>
          expectDocumented(await getSpec(ctx), [
            ['POST', '/compras'],
            ['GET', '/compras/mias'],
            ['GET', '/compras'],
            ['GET', '/clientes'],
            ['GET', '/empleados'],
            ['POST', '/empleados'],
          ]),
      },
    ],
    cleanup: borrarCreadas,
  },
]

export const levelById = (id: number) => LEVELS.find((l) => l.id === id)!
