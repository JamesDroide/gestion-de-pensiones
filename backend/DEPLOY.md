# Deploy Backend — Railway

Esta guía asume que el repositorio ya está en GitHub y que tienes cuenta en Railway.

---

## Paso 1 — Crear el proyecto en Railway

1. Ir a [railway.app](https://railway.app) e iniciar sesión.
2. Clic en **New Project**.
3. Seleccionar **Deploy from GitHub repo**.
4. Autorizar Railway para acceder a tu cuenta de GitHub si es la primera vez.
5. Seleccionar este repositorio.

Railway crea el proyecto pero aún no configura nada. Continúa con los pasos siguientes.

---

## Paso 2 — Agregar PostgreSQL

1. Dentro del proyecto en Railway, clic en **Add Plugin** (o **+ New**).
2. Seleccionar **PostgreSQL**.
3. Railway crea la base de datos y asigna automáticamente la variable `DATABASE_URL` al servicio del backend.

No necesitas configurar `DATABASE_URL` manualmente. Railway la inyecta.

---

## Paso 3 — Configurar el Root Directory

Railway necesita saber que el código del backend está en la subcarpeta `backend`, no en la raíz del repositorio.

1. Ir al servicio del backend en Railway → **Settings** → pestaña **Source**.
2. En **Root Directory**, escribir: `backend`
3. Guardar.

---

## Paso 4 — Configurar variables de entorno

En Railway → Settings → pestaña **Variables**, agregar las siguientes variables:

| Variable | Valor | Notas |
|----------|-------|-------|
| `ENVIRONMENT` | `production` | Activa validaciones de seguridad |
| `SECRET_KEY` | (ver abajo) | Clave para firmar JWT — no compartir |
| `ALLOWED_ORIGINS` | `https://tu-proyecto.vercel.app` | URL exacta del frontend en Vercel |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` | 8 horas de sesión |
| `DATABASE_URL` | (automático del plugin) | No tocar si ya lo asignó Railway |

Para generar un `SECRET_KEY` seguro, ejecuta en tu terminal:

```bash
openssl rand -hex 32
```

Copia el resultado y pégalo en Railway. Nunca uses el valor por defecto `change-this-in-production`.

> Si `SECRET_KEY` tiene el valor por defecto o `ALLOWED_ORIGINS` contiene `*`, el servidor rechaza el arranque en producción. Esto es un mecanismo de seguridad deliberado.

---

## Paso 5 — Primer deploy

Railway detecta el `Dockerfile` automáticamente. El `railway.json` ya define el comando de inicio:

```
alembic upgrade head && uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

Esto significa que en cada deploy:
1. Se ejecutan las migraciones de base de datos.
2. Se inicia el servidor.

El primer deploy puede tardar 2-3 minutos mientras se construye la imagen Docker.

---

## Paso 6 — Crear el usuario administrador

Una sola vez, después del primer deploy exitoso, hay que ejecutar el seed que crea el usuario admin y los precios por defecto.

Desde Railway CLI (si lo tienes instalado):

```bash
railway run python -m src.infrastructure.database.seed
```

O desde la interfaz web de Railway:
1. Ir al servicio → pestaña **Deploy**.
2. En la sección de comandos o terminal interactiva, ejecutar:
   ```
   python -m src.infrastructure.database.seed
   ```

El seed crea:
- Usuario administrador: `admin@pension.com` / `admin123`
- Configuración de precios por defecto

**Cambia la contraseña del administrador inmediatamente** desde la sección de Configuración del sistema.

---

## Paso 7 — Verificar el deploy

Visita la URL asignada por Railway (formato `https://nombre.railway.app`) seguida de `/health`:

```
https://tu-backend.railway.app/health
```

Debe responder:

```json
{"status": "ok", "app": "Sistema de Gestión de Pensionistas"}
```

---

## Paso 8 — Actualizaciones futuras

Cada vez que hagas `git push` a la rama conectada en Railway, el sistema detecta el cambio y hace un nuevo deploy automáticamente. Las migraciones se ejecutan solas al inicio.

---

## Troubleshooting

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| Deploy falla con "SECRET_KEY tiene el valor por defecto" | La variable no está configurada | Agregar `SECRET_KEY` en Railway Variables |
| Deploy falla con "ALLOWED_ORIGINS contiene valores inseguros" | Se usó `*` en producción | Poner la URL exacta del frontend |
| Error de conexión a base de datos | `DATABASE_URL` incorrecta o BD no creada | Verificar que el plugin PostgreSQL esté vinculado |
| La URL `/health` no responde | El build falló | Revisar los logs en Railway → Deploy Logs |
| El seed falla con "email ya existe" | Ya se ejecutó antes | No es un error, se puede ignorar |
