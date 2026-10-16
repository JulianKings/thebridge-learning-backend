// Each level is one milestone of the students' API. For now every check is
// simulated by the demo panel; later each check gets a `run(api)` function
// that probes the real API.

export type CheckDef = {
  id: string
  label: string
}

export type LevelDef = {
  id: number
  key: string
  title: string
  short: string
  tagline: string
  goal: string
  reward: string
  checks: CheckDef[]
}

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    key: 'conexion',
    title: 'Conexión',
    short: 'Conexión',
    tagline: 'Express + MongoDB en marcha',
    goal: 'Levanta un servidor Express desplegado y conéctalo a MongoDB.',
    reward: 'La tienda abre sus puertas: portada y estado del servidor en vivo.',
    checks: [
      { id: 'reachable', label: 'El servidor responde en la URL de despliegue' },
      { id: 'cors', label: 'CORS permite peticiones desde esta web' },
      { id: 'health', label: 'GET /health devuelve { status: "ok" }' },
      { id: 'mongo', label: 'MongoDB aparece como conectada' },
    ],
  },
  {
    id: 2,
    key: 'catalogo',
    title: 'Catálogo',
    short: 'Catálogo',
    tagline: 'Primer endpoint GET con datos',
    goal: 'Crea el modelo de prenda y un GET /api/products que devuelva el catálogo.',
    reward: 'El escaparate se llena con las prendas de tu base de datos.',
    checks: [
      { id: 'get', label: 'GET /api/products responde 200' },
      { id: 'array', label: 'La respuesta es un array con prendas' },
      { id: 'shape', label: 'Cada prenda tiene nombre, precio, categoría y tallas' },
      { id: 'detail', label: 'GET /api/products/:id devuelve una prenda' },
    ],
  },
  {
    id: 3,
    key: 'auth',
    title: 'Autenticación',
    short: 'Auth',
    tagline: 'Registro e inicio de sesión',
    goal: 'Permite registrarse e iniciar sesión, guardando las contraseñas cifradas.',
    reward: 'Los clientes pueden crear su cuenta y entrar en su perfil.',
    checks: [
      { id: 'register', label: 'POST /api/auth/register crea un usuario' },
      { id: 'login', label: 'POST /api/auth/login acepta credenciales válidas' },
      { id: 'wrong', label: 'Una contraseña incorrecta se rechaza (401)' },
      { id: 'hash', label: 'La contraseña nunca se devuelve en la respuesta' },
    ],
  },
  {
    id: 4,
    key: 'crud',
    title: 'CRUD',
    short: 'CRUD',
    tagline: 'Crear, editar y borrar prendas',
    goal: 'Completa el CRUD de prendas para que los trabajadores gestionen el catálogo.',
    reward: 'Se activa el panel de trabajador para gestionar el catálogo.',
    checks: [
      { id: 'create', label: 'POST /api/products crea una prenda' },
      { id: 'update', label: 'PUT /api/products/:id la modifica' },
      { id: 'delete', label: 'DELETE /api/products/:id la elimina' },
      { id: 'validate', label: 'Datos inválidos devuelven 400' },
    ],
  },
  {
    id: 5,
    key: 'jwt',
    title: 'Seguridad JWT',
    short: 'JWT',
    tagline: 'Rutas protegidas con tokens',
    goal: 'Protege las rutas con JWT y aplica permisos según el rol del usuario.',
    reward: 'La tienda es segura: cada rol ve solo lo que le corresponde.',
    checks: [
      { id: 'token', label: 'El login devuelve un JWT válido' },
      { id: 'notoken', label: 'Sin token, las rutas protegidas devuelven 401' },
      { id: 'tampered', label: 'Un token manipulado se rechaza' },
      { id: 'roles', label: 'Un cliente no puede editar prendas (403)' },
    ],
  },
  {
    id: 6,
    key: 'swagger',
    title: 'Documentación',
    short: 'Swagger',
    tagline: 'Swagger / OpenAPI',
    goal: 'Documenta la API con Swagger para que cualquiera pueda usarla.',
    reward: 'Recompensa: la web se pone de gala con el modo editorial.',
    checks: [
      { id: 'docs', label: '/api-docs sirve la documentación' },
      { id: 'spec', label: 'La especificación OpenAPI es válida' },
      { id: 'coverage', label: 'Documenta todos los endpoints de los niveles 2–5' },
      { id: 'auth', label: 'Describe la autenticación Bearer' },
    ],
  },
  {
    id: 7,
    key: 'completa',
    title: 'Tienda completa',
    short: 'Final',
    tagline: 'Todos los endpoints',
    goal: 'Añade materiales, vincúlalos a prendas y crea la gestión de usuarios para encargados.',
    reward: 'La tienda al completo: materiales, equipo y clientes.',
    checks: [
      { id: 'supplies', label: 'CRUD de materiales en /api/supplies' },
      { id: 'bind', label: 'Los materiales se vinculan a prendas' },
      { id: 'users', label: 'Los encargados gestionan clientes y trabajadores' },
      { id: 'tiers', label: 'Un trabajador no puede gestionar usuarios (403)' },
    ],
  },
]

export const levelById = (id: number) => LEVELS.find((l) => l.id === id)!
