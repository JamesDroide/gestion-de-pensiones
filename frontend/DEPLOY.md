# Deploy Frontend — Vercel

Esta guía asume que el repositorio ya está en GitHub, que el backend ya está deployado en Railway y que tienes cuenta en Vercel.

---

## Paso 1 — Importar el proyecto en Vercel

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión.
2. Clic en **Add New** → **Project**.
3. Seleccionar **Import Git Repository**.
4. Autorizar Vercel para acceder a tu cuenta de GitHub si es la primera vez.
5. Seleccionar este repositorio.

---

## Paso 2 — Configurar el proyecto

En la pantalla de configuración antes del primer deploy:

| Campo | Valor |
|-------|-------|
| Framework Preset | `Vite` |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

> Es importante cambiar el Root Directory a `frontend` porque el repositorio es un monorepo con backend y frontend en subcarpetas.

---

## Paso 3 — Variables de entorno en Vercel

En la misma pantalla de configuración, expandir la sección **Environment Variables** y agregar:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://tu-backend.railway.app` |
| `VITE_APP_NAME` | `Gestión de Pensionistas` |

Reemplaza `tu-backend.railway.app` con la URL real que Railway asignó al backend. La encontrarás en Railway → tu proyecto → pestaña **Settings** → **Domains**.

> Las variables que empiezan con `VITE_` son las únicas que Vite incluye en el bundle del frontend. No agregues aquí variables con secretos porque quedan expuestas en el navegador.

---

## Paso 4 — Deploy

Clic en **Deploy**. Vercel ejecuta `npm install` y luego `npm run build`. El proceso tarda 1-2 minutos.

El archivo `vercel.json` ya está configurado en el repositorio con la regla de rewrite necesaria para que React Router funcione correctamente:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Esto evita el error 404 al navegar directamente a una URL o al recargar la página.

---

## Paso 5 — Verificar el deploy

Visita la URL asignada por Vercel (formato `https://nombre.vercel.app`).

Debe aparecer la pantalla de login del sistema. Inicia sesión con:
- Email: `admin@pension.com`
- Contraseña: `admin123`

Si ves un error de red, verifica que `VITE_API_URL` apunte correctamente al backend en Railway y que el backend esté corriendo.

---

## Paso 6 — Actualizaciones futuras

Cada vez que hagas `git push` a la rama conectada (por defecto `main`), Vercel detecta el cambio y hace un nuevo deploy automáticamente.

Para cambiar la rama de producción: Vercel → tu proyecto → **Settings** → **Git** → **Production Branch**.

---

## Dominio personalizado (opcional)

Si tienes un dominio propio:

1. Vercel → tu proyecto → **Settings** → **Domains**.
2. Agregar tu dominio.
3. Seguir las instrucciones para configurar los DNS en tu proveedor de dominio.
4. Una vez activo, actualiza `ALLOWED_ORIGINS` en Railway para incluir el nuevo dominio.

---

## Troubleshooting

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| Build falla con error de TypeScript | Errores de tipo en el código | Ejecutar `npm run build` localmente y corregir errores |
| La pantalla carga pero no se conecta al backend | `VITE_API_URL` incorrecta | Verificar la variable en Vercel → Settings → Environment Variables |
| Error 404 al recargar o navegar directamente | `vercel.json` no está incluido en el commit | Verificar que `frontend/vercel.json` exista en el repositorio |
| Error CORS al llamar al backend | `ALLOWED_ORIGINS` en Railway no incluye la URL de Vercel | Actualizar `ALLOWED_ORIGINS` en Railway con la URL exacta de Vercel |
