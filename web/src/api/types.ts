export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    // One message per field, from the API's validation errors ("talla[0].talla_stock" is filed under "talla").
    public campos: Record<string, string> = {},
  ) {
    super(message)
  }
}

export function camposDe(errores: unknown): Record<string, string> {
  const campos: Record<string, string> = {}
  if (!Array.isArray(errores)) return campos
  for (const e of errores) {
    const campo = typeof e?.campo === 'string' ? e.campo.split(/[.[]/)[0] : ''
    if (campo && typeof e.mensaje === 'string' && !campos[campo]) campos[campo] = e.mensaje
  }
  return campos
}
