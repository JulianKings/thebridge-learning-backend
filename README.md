# thebridge-learning-backend
Mockup project to help teach express and mongo

## Web (mockup)

La web vive en [`web/`](web/). Para arrancarla:

```bash
cd web
npm install
npm run dev
```

- El panel **Modo demo** (abajo a la izquierda) simula que la API supera cada nivel.
- `?nivel=N` abre la web directamente en el nivel N (0–7), útil para preparar la presentación.

### La tienda final (recompensa del nivel 7)

Al superar los 7 niveles se desbloquea la tienda completa en `#tienda` (o directamente: `?nivel=7#tienda`).

- El botón 📖 del borde izquierdo vuelve al progreso de la API; desde allí, el botón 🛍 vuelve a la tienda.
- La tienda habla con una **API simulada** en el navegador (`web/src/api/mockApi.ts`) con los mismos endpoints que construirán los alumnos: latencia, JWT, roles (401/403), validación (400) y datos guardados en `localStorage`.
- **Cuentas de demostración** (contraseña `hilo1234`): `carlos@correo.es` (cliente), `diego@hilo.store` (trabajador), `lucia@hilo.store` (encargada).
- La **consola API** (abajo a la izquierda) muestra cada petición en directo y permite tirar la API (503), subir la latencia o restaurar los datos iniciales.
