# Arquitectura del Backend — Gestión de Pensiones

> Patrón: Clean Architecture | 2026-04-11

---

## Capas de la Arquitectura

```
src/
├── domain/           ← Núcleo del negocio — sin dependencias externas
├── application/      ← Casos de uso — orquesta el dominio
├── infrastructure/   ← Base de datos, servicios externos, config
└── api/              ← Adaptadores HTTP (FastAPI routers)
```

### Regla de dependencias
```
api → application → domain
infrastructure → domain
```
Ninguna capa del dominio importa de capas externas.

---

## Modelo de Datos

### Tabla: civiles

| Campo            | Tipo                                        | Notas                      |
|------------------|---------------------------------------------|----------------------------|
| id               | UUID, PK                                    |                            |
| nombre           | VARCHAR(200), NOT NULL                      |                            |
| dni_codigo       | VARCHAR(50), UNIQUE, NOT NULL               | DNI o código alternativo   |
| telefono         | VARCHAR(20), nullable                       |                            |
| modalidad_cobro  | ENUM(diario/semanal/quincenal/mensual)      | Define ciclo de cobro      |
| notas            | TEXT, nullable                              |                            |
| activo           | BOOLEAN, default=true                       |                            |
| created_at       | TIMESTAMPTZ, default=now()                  |                            |

### Tabla: policias

| Campo        | Tipo                    | Notas                       |
|--------------|-------------------------|-----------------------------|
| id           | UUID, PK                |                             |
| nombre       | VARCHAR(200), NOT NULL  |                             |
| placa_codigo | VARCHAR(50), UNIQUE, NOT NULL | Número de placa       |
| grado        | VARCHAR(100), nullable  |                             |
| telefono     | VARCHAR(20), nullable   |                             |
| notas        | TEXT, nullable          |                             |
| activo       | BOOLEAN, default=true   |                             |
| created_at   | TIMESTAMPTZ, default=now() |                          |

### Tabla: consumos_civiles

| Campo            | Tipo                          | Notas                                           |
|------------------|-------------------------------|-------------------------------------------------|
| id               | UUID, PK                      |                                                 |
| civil_id         | UUID, FK → civiles, NOT NULL  |                                                 |
| fecha            | DATE, NOT NULL                |                                                 |
| desayuno         | BOOLEAN, default=false        |                                                 |
| almuerzo         | BOOLEAN, default=false        |                                                 |
| cena             | BOOLEAN, default=false        |                                                 |
| extras_total     | DECIMAL(10,2), default=0      | Suma de extras del día                          |
| precio_unitario  | DECIMAL(10,2), nullable       | NULL hasta cierre — precio escalonado aplicado  |
| precio_total     | DECIMAL(10,2), nullable       | NULL hasta cierre                               |
| cerrado          | BOOLEAN, default=false        | true = día cerrado, precios fijados             |
| created_at       | TIMESTAMPTZ, default=now()    |                                                 |

### Tabla: consumos_policias

| Campo                         | Tipo                            | Notas                                     |
|-------------------------------|---------------------------------|-------------------------------------------|
| id                            | UUID, PK                        |                                           |
| policia_id                    | UUID, FK → policias, NOT NULL   |                                           |
| fecha                         | DATE, NOT NULL                  |                                           |
| desayuno                      | BOOLEAN, default=false          |                                           |
| almuerzo                      | BOOLEAN, default=false          |                                           |
| cena                          | BOOLEAN, default=false          |                                           |
| tickets_desayuno              | INTEGER, default=0              | Tickets canjeados para desayuno           |
| tickets_almuerzo              | INTEGER, default=0              | Tickets canjeados para almuerzo           |
| valor_ticket_desayuno_snapshot| DECIMAL(10,2), NOT NULL         | Valor al momento del registro — inmutable |
| valor_ticket_almuerzo_snapshot| DECIMAL(10,2), NOT NULL         | Valor al momento del registro — inmutable |
| efectivo_adicional            | DECIMAL(10,2), default=0        | Efectivo pagado además de tickets         |
| extras_total                  | DECIMAL(10,2), default=0        |                                           |
| total_tickets_valor           | DECIMAL(10,2), default=0        | tickets * snapshot                        |
| diferencial_efectivo          | DECIMAL(10,2), default=0        | Si consumo > tickets                      |
| total                         | DECIMAL(10,2), NOT NULL         |                                           |
| created_at                    | TIMESTAMPTZ, default=now()      |                                           |

### Tabla: extras_consumo

| Campo                  | Tipo                              | Notas                          |
|------------------------|-----------------------------------|--------------------------------|
| id                     | UUID, PK                          |                                |
| consumo_civil_id       | UUID, FK nullable                 | XOR con consumo_policia_id     |
| consumo_policia_id     | UUID, FK nullable                 |                                |
| plato_nombre           | VARCHAR(200), NOT NULL            | Nombre snapshot al registrar   |
| precio_unitario_snapshot| DECIMAL(10,2), NOT NULL          | Precio inmutable al registrar  |
| cantidad               | INTEGER, NOT NULL, default=1      |                                |
| subtotal               | DECIMAL(10,2), NOT NULL           |                                |
| created_at             | TIMESTAMPTZ, default=now()        |                                |

### Tabla: pagos

| Campo       | Tipo                            | Notas                          |
|-------------|-------------------------------- |--------------------------------|
| id          | UUID, PK                        |                                |
| civil_id    | UUID, FK nullable               | XOR con policia_id             |
| policia_id  | UUID, FK nullable               |                                |
| monto       | DECIMAL(10,2), NOT NULL         |                                |
| tipo_pago   | ENUM(efectivo/tickets)          |                                |
| descripcion | TEXT, nullable                  |                                |
| created_at  | TIMESTAMPTZ, default=now()      |                                |

### Tabla: configuracion_precios

| Campo                     | Tipo                    | Notas                            |
|---------------------------|-------------------------|----------------------------------|
| id                        | INTEGER, PK             | Solo existe 1 fila activa        |
| precio_menu_normal        | DECIMAL(10,2), NOT NULL |                                  |
| precio_pension_1_comida   | DECIMAL(10,2), NOT NULL | Escalado civil: 1 comida al día  |
| precio_pension_2_comidas  | DECIMAL(10,2), NOT NULL | Escalado civil: 2 comidas al día |
| precio_pension_3_comidas  | DECIMAL(10,2), NOT NULL | Escalado civil: 3 comidas al día |
| valor_ticket_desayuno     | DECIMAL(10,2), NOT NULL |                                  |
| valor_ticket_almuerzo     | DECIMAL(10,2), NOT NULL |                                  |
| equivalencia_cena_tickets | INTEGER, NOT NULL       | Cuántos tickets equivale la cena |
| updated_at                | TIMESTAMPTZ             |                                  |
| updated_by                | UUID, FK → usuarios     |                                  |

### Tabla: menu_items

| Campo          | Tipo                            | Notas                         |
|----------------|---------------------------------|-------------------------------|
| id             | UUID, PK                        |                               |
| nombre         | VARCHAR(200), NOT NULL          |                               |
| precio         | DECIMAL(10,2), NOT NULL         |                               |
| tipo           | ENUM(menu_dia/carta_extra)      |                               |
| activo         | BOOLEAN, default=true           |                               |
| precio_editable| BOOLEAN, default=false          | Si permite cambio en el momento |
| created_at     | TIMESTAMPTZ, default=now()      |                               |

### Tabla: usuarios

| Campo         | Tipo                            | Notas                      |
|---------------|---------------------------------|----------------------------|
| id            | UUID, PK                        |                            |
| nombre        | VARCHAR(200), NOT NULL          |                            |
| email         | VARCHAR(200), UNIQUE, NOT NULL  |                            |
| password_hash | VARCHAR(255), NOT NULL          |                            |
| rol           | ENUM(administrador/cajero)      |                            |
| activo        | BOOLEAN, default=true           |                            |
| created_at    | TIMESTAMPTZ, default=now()      |                            |

---

## Reglas de Negocio Críticas

1. **Separación absoluta civil/policia** — nunca compartir tablas ni lógica
2. **Snapshots de precio** — precio siempre guardado en la fila, nunca FK a config
3. **Cierre de día civil** — precio escalonado se calcula AL CERRAR, no al registrar
4. **Tickets policía** — el sistema registra canje, NO gestiona saldo físico
5. **Deuda sin bloqueo** — consumo siempre permitido independiente de deuda
6. **configuracion_precios** — tiene 1 sola fila (id=1), no histórico

---

## Endpoints Planificados (Fase 1+)

```
POST   /auth/login
POST   /auth/refresh

GET    /civiles
POST   /civiles
GET    /civiles/{id}
PATCH  /civiles/{id}

GET    /policias
POST   /policias
GET    /policias/{id}
PATCH  /policias/{id}

GET    /consumos/civiles
POST   /consumos/civiles
POST   /consumos/civiles/{id}/cerrar
GET    /consumos/civiles/{civil_id}/hoy

GET    /consumos/policias
POST   /consumos/policias
GET    /consumos/policias/{policia_id}/hoy

GET    /pagos
POST   /pagos

GET    /menu
POST   /menu
PATCH  /menu/{id}

GET    /configuracion/precios
PUT    /configuracion/precios

GET    /reportes/civiles
GET    /reportes/policias
GET    /reportes/resumen-dia
```
