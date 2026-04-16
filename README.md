# Sistema de Gestión de Pensionistas

Sistema web para gestionar pensionistas de un restaurante. Reemplaza los registros físicos en cuadernos. Permite registrar consumos diarios, hacer cobros y llevar el control de deudas de dos tipos de clientes: civiles y policías.

---

## Funcionalidades del MVP

- **Autenticación** con JWT. Dos roles: Administrador y Cajero.
- **Gestión de civiles**: registrar, editar y desactivar pensionistas civiles.
- **Gestión de policías**: registrar, editar y desactivar pensionistas policiales con número de placa.
- **Consumo diario civiles**: registrar desayuno/almuerzo/cena y extras por día. El precio escalonado se calcula al cerrar el día.
- **Consumo diario policías**: registrar comidas con canje de tickets. El sistema registra el canje presentado, no gestiona saldo físico.
- **Cobros**: registrar pagos en efectivo o en tickets. Las deudas no bloquean nuevos consumos.
- **Configuración de precios**: administrador puede actualizar precios de menú, pensión y tickets.
- **Reportes básicos**: resumen de deuda por cliente.
- **Health check**: endpoint `/health` para monitoreo del servidor.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Backend | Python | 3.12 |
| Backend | FastAPI | >=0.115.0 |
| Backend | SQLAlchemy | >=2.0.0 |
| Backend | Alembic | >=1.13.0 |
| Backend | PostgreSQL | 15+ |
| Backend | pydantic-settings | >=2.5.0 |
| Backend | python-jose (JWT) | >=3.3.0 |
| Backend | passlib (bcrypt) | >=1.7.4 |
| Frontend | Node.js | >=20 |
| Frontend | Vite | 8.x |
| Frontend | React | 19.x |
| Frontend | TypeScript | 6.x |
| Frontend | Tailwind CSS | 4.x |
| Frontend | React Query | @tanstack/react-query 5.x |
| Frontend | React Router | react-router-dom 7.x |
| Frontend | Axios | 1.x |
| Deploy Backend | Railway | — |
| Deploy Frontend | Vercel | — |

---

## Arquitectura

### Backend — Clean Architecture

Las dependencias fluyen hacia adentro. El dominio no conoce nada externo.

```
backend/src/
├── domain/           ← Núcleo del negocio. Entidades puras, sin frameworks.
│   └── entities/     ← civilian, police, consumption, payment, menu_item...
├── application/      ← Casos de uso. Orquesta el dominio.
│   └── use_cases/    ← registro, consumo, cierre de día, cobros...
├── infrastructure/   ← Adaptadores externos. SQLAlchemy, auth, config.
│   ├── database/     ← Modelos ORM, repositorios concretos, seed, migraciones
│   └── auth/         ← Utilidades JWT y hash de contraseñas
└── api/              ← Adaptadores HTTP. Routers FastAPI, DTOs de entrada/salida.
    └── routers/      ← auth, civilians, police, consumption, settings

Regla de dependencias:
  api  →  application  →  domain
  infrastructure  →  domain
```

### Frontend — Feature-based

```
frontend/src/
├── app/              ← Configuración global: router, QueryClient, providers
├── features/         ← Un directorio por módulo de negocio
│   ├── auth/         ← Login, contexto de sesión, ProtectedRoute
│   ├── civilians/    ← Listado, detalle y formulario de civiles
│   ├── police/       ← Listado, detalle y formulario de policías
│   ├── consumption/  ← Registro de consumo diario (civiles y policías)
│   ├── payments/     ← Cobros y registro de pagos
│   └── settings/     ← Configuración de precios
└── shared/           ← Componentes, hooks y utilidades reutilizables
```

---

## Requisitos Previos

Para desarrollo local necesitas:

- Python 3.12 o superior
- Node.js 20 o superior (incluye npm)
- PostgreSQL 15 o superior corriendo localmente
- Git

---

## Setup Local — Backend

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd "Gestion de pensiones"

# 2. Ir al directorio del backend
cd backend

# 3. Crear entorno virtual e instalar dependencias
python -m venv .venv
source .venv/bin/activate        # Linux/macOS
.venv\Scripts\activate           # Windows

pip install -e ".[dev]"

# 4. Crear el archivo de variables de entorno
# Copiar el ejemplo y editarlo con tus datos locales
cp .env.example .env
# Edita .env con tu cadena de conexión a PostgreSQL local

# 5. Crear la base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE pension_db;"

# 6. Ejecutar migraciones
alembic upgrade head

# 7. Cargar datos iniciales (admin + precios por defecto)
python -m src.infrastructure.database.seed

# 8. Arrancar el servidor
uvicorn src.main:app --reload --port 8000
```

La API estará disponible en `http://localhost:8000`.
La documentación interactiva (solo en desarrollo) en `http://localhost:8000/docs`.

---

## Setup Local — Frontend

```bash
# 1. Ir al directorio del frontend (desde la raíz del proyecto)
cd frontend

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno
cp .env.example .env.local
# Edita .env.local con la URL del backend local

# 4. Arrancar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`.

---

## Variables de Entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://postgres:password@localhost:5432/pension_db` |
| `SECRET_KEY` | Clave secreta para firmar JWT. Generar con `openssl rand -hex 32` | `3f8a1b...` |
| `ALGORITHM` | Algoritmo JWT (no cambiar) | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Minutos de validez del token | `480` |
| `ENVIRONMENT` | Entorno de ejecución | `development` o `production` |
| `DEBUG` | Activa logs detallados | `True` o `False` |
| `ALLOWED_ORIGINS` | Orígenes CORS permitidos, separados por coma | `http://localhost:5173,https://tu-app.vercel.app` |

> En producción, si `SECRET_KEY` tiene el valor por defecto o `ALLOWED_ORIGINS` contiene `*`, el servidor aborta el arranque por seguridad.

### Frontend (`frontend/.env.local`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del backend | `http://localhost:8000` |
| `VITE_APP_NAME` | Nombre que aparece en la UI | `Gestión de Pensionistas` |

---

## Deploy en Railway (Backend)

Ver guía detallada en [`backend/DEPLOY.md`](./backend/DEPLOY.md).

Pasos resumidos:
1. Crear proyecto en Railway desde este repositorio de GitHub.
2. Agregar plugin PostgreSQL (asigna `DATABASE_URL` automáticamente).
3. Configurar variables de entorno: `ENVIRONMENT`, `SECRET_KEY`, `ALLOWED_ORIGINS`, `ACCESS_TOKEN_EXPIRE_MINUTES`.
4. Establecer Root Directory en `backend`.
5. Railway detecta el `Dockerfile` automáticamente y despliega.
6. Ejecutar el seed para crear el usuario administrador.

---

## Deploy en Vercel (Frontend)

Ver guía detallada en [`frontend/DEPLOY.md`](./frontend/DEPLOY.md).

Pasos resumidos:
1. Importar proyecto en Vercel desde GitHub.
2. Framework Preset: Vite. Root Directory: `frontend`.
3. Configurar variables de entorno: `VITE_API_URL` con la URL de Railway.
4. Vercel despliega automáticamente. El `vercel.json` ya incluye el rewrite para React Router.

---

## Credenciales por Defecto

> ADVERTENCIA DE SEGURIDAD: Cambia estas credenciales inmediatamente después del primer deploy.

El seed crea un usuario administrador con:

| Campo | Valor |
|-------|-------|
| Email | `admin@pension.com` |
| Contraseña | `admin123` |

Para cambiar la contraseña, usa la sección de Configuración dentro del sistema una vez que inicies sesión.

---

## Roles del Sistema

| Acción | Administrador | Cajero |
|--------|:---:|:---:|
| Iniciar sesión | Si | Si |
| Ver listado de civiles y policías | Si | Si |
| Registrar/editar civil o policía | Si | No |
| Desactivar civil o policía | Si | No |
| Registrar consumo diario | Si | Si |
| Cerrar día de consumo (civil) | Si | Si |
| Registrar cobros | Si | Si |
| Ver configuración de precios | Si | Si |
| Editar precios y configuración | Si | No |
| Gestionar usuarios del sistema | Si | No |

---

## Reglas de Negocio Clave

1. **Civiles y policías son mundos separados.** Tienen tablas, formularios y reportes completamente distintos. Nunca se mezclan.

2. **El precio del civil se calcula al cerrar el día, no al registrar.** Si un civil desayuna y almuerza, el sistema aplica el precio de "2 comidas" recién cuando el cajero cierra ese día. Mientras el día está abierto, el precio es provisional.

3. **Los precios históricos nunca cambian.** Cuando un consumo queda registrado y cerrado, el precio queda guardado dentro del registro. Si luego se cambia la tarifa en configuración, los registros anteriores no se ven afectados.

4. **Los tickets de policías son físicos.** El sistema solo registra cuántos tickets presentó el policía en la caja. No lleva un saldo digital de tickets: eso se maneja físicamente.

5. **La deuda no bloquea el consumo.** Si un cliente debe dinero, igual puede seguir comiendo. El sistema muestra la advertencia de deuda pero no impide registrar nuevos consumos. El cobro es responsabilidad del cajero.

6. **Hay una sola configuración de precios activa.** No existe historial de cambios de precios en la tabla de configuración. El administrador actualiza los precios y esos son los precios vigentes desde ese momento en adelante.

---

## Estructura del Proyecto

```
Gestion de pensiones/
├── backend/
│   ├── src/
│   │   ├── main.py                    ← Punto de entrada FastAPI
│   │   ├── core/config.py             ← Variables de entorno (pydantic-settings)
│   │   ├── domain/entities/           ← Entidades del negocio (puras)
│   │   ├── application/use_cases/     ← Lógica de negocio
│   │   ├── infrastructure/
│   │   │   ├── database/              ← Modelos ORM, repos concretos, seed
│   │   │   └── auth/                  ← JWT y bcrypt
│   │   └── api/routers/               ← Endpoints HTTP
│   ├── tests/                         ← Pytest (20 tests)
│   ├── Dockerfile
│   ├── railway.json
│   ├── alembic.ini
│   ├── pyproject.toml
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   └── DEPLOY.md
├── frontend/
│   ├── src/
│   │   ├── app/                       ← Router, providers, configuración global
│   │   ├── features/                  ← Módulos de negocio (auth, civilians, etc.)
│   │   └── shared/                    ← Componentes y hooks reutilizables
│   ├── vercel.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── package.json
│   └── DEPLOY.md
└── README.md
```

---

## Cómo Contribuir

1. Crea una rama desde `develop`: `git checkout -b feature/nombre-del-feature`
2. Trabaja en tu rama. Ejecuta los tests antes de hacer push: `pytest` (backend) y `npm run build` (frontend).
3. Abre un Pull Request hacia `develop` con una descripción clara de los cambios.
4. El PR debe pasar los tests y el build sin errores antes de hacer merge.
5. Los merges a `main` representan versiones deployables.
