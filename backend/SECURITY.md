# Auditoría de Seguridad — Backend

> Fecha: 2026-04-11 | Fase 4

## Hallazgos y Correcciones

### 1. SECRET_KEY insegura en producción — CORREGIDO

**Severidad:** Crítica  
**Archivo:** `src/core/config.py`

**Problema:** `SECRET_KEY` tenía el valor por defecto `"change-this-in-production"`. Si el entorno de producción no definía la variable, el sistema arrancaba con una clave conocida públicamente, permitiendo falsificar tokens JWT.

**Corrección aplicada:** Se agregó el método `_validate_production_security()` en la clase `Settings` que aborta el proceso (`sys.exit(1)`) si `ENVIRONMENT=production` y `SECRET_KEY` sigue siendo el valor por defecto.

---

### 2. CORS sin protección en producción — CORREGIDO

**Severidad:** Alta  
**Archivo:** `src/core/config.py`

**Problema:** No había validación explícita que impidiera configurar `ALLOWED_ORIGINS=["*"]` en producción.

**Corrección aplicada:** La misma función `_validate_production_security()` detecta si `ALLOWED_ORIGINS` contiene `"*"` o cadenas vacías y aborta el inicio del servidor.

---

### 3. Documentación interactiva expuesta en producción — CORREGIDO

**Severidad:** Media  
**Archivo:** `src/main.py`

**Problema:** `/docs` y `/redoc` estaban habilitados incondicionalmente, exponiendo toda la especificación OpenAPI en producción.

**Corrección aplicada:** `docs_url` y `redoc_url` ahora son `None` cuando `ENVIRONMENT=production`.

---

### 4. Imports lazy de HTTPException en routers — CORREGIDO

**Severidad:** Baja (calidad de código)  
**Archivos:** `src/api/routers/civilians_router.py`, `src/api/routers/police_router.py`

**Problema:** Los endpoints `DELETE` importaban `HTTPException` y `status` dentro del bloque `if not success`, lo que es un anti-patrón (imports ocultos, dificultan el análisis estático).

**Corrección aplicada:** Los imports se movieron al encabezado del módulo.

---

## Verificaciones sin hallazgos críticos

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| Inyección SQL | Seguro | Todos los repositorios usan `sqlalchemy.select()` con parámetros vinculados (`where(Model.field == value)`). No hay concatenación de strings. |
| Autorización `close-day` | Seguro | `POST /consumption/close-day` usa `require_admin`. |
| Autorización `PATCH /settings/pricing` | Seguro | Usa `require_admin`. |
| Autorización `DELETE /civilians` y `DELETE /police` | Seguro | Usan `require_admin`. |
| Hash de contraseñas | Seguro | `hashing.py` usa `passlib` con `bcrypt`. |
| Exposición de `password_hash` | Seguro | Ningún DTO de respuesta (`CivilianResponseDTO`, `PoliceResponseDTO`, `TokenResponse`) incluye `password_hash`. `TokenResponse` devuelve solo `access_token`, `token_type`, `role` y `name`. |
| `PATCH /civilians` y `PATCH /police` sin admin | Intencional | Por diseño el cajero puede actualizar datos básicos (nombre, teléfono); solo el admin puede dar de baja. Confirmado en decisiones de arquitectura. |

## Configuración recomendada para producción (Railway)

```
ENVIRONMENT=production
SECRET_KEY=<valor aleatorio de 64+ caracteres — usar openssl rand -hex 32>
ALLOWED_ORIGINS=https://tu-dominio.vercel.app
DATABASE_URL=<URL provista por Railway PostgreSQL>
```
