# Requisitos de Bases de Datos — GearQuest

> **Área:** Persistencia de datos
> **Estado:** Borrador para revisión
> **Versión:** 1.0 — 2026-10-18
> **Tecnología de referencia:** PostgreSQL (relacional, SQL) + Prisma ORM
> **Documento base:** `README.MD` (raíz) §5 y §6, `backend/README.md`

---

## 1. Propósito

Define **cómo se organiza, protege y mantiene la información** del proyecto: qué datos
guarda cada parte del sistema y con qué reglas. No requiere saber SQL para entenderlo.

## 2. Contexto en lenguaje sencillo

GearQuest usa **PostgreSQL**, un sistema de bases de datos **relacional**: los datos se
guardan en tablas con relaciones entre ellas (por ejemplo, un pedido *contiene* productos).
El equipo acordó explícitamente **no usar bases NoSQL**.

La información se reparte en **cuatro bases de datos, una por servicio**. Es como tener
cuatro archivadores separados: cada servicio cuida lo suyo y no mete las manos en el
archivador ajeno. Si algo se daña en un archivador, el resto del sistema sigue en pie.

Para trabajar con las tablas desde el código se usa **Prisma** (un ORM): permite definir el
modelo en un archivo legible y generar consultas seguras.

## 3. Alcance

| Base de datos | Servicio dueño | Contenido (temas) |
| --- | --- | --- |
| `gearquest_identity` | identity-service | Cuentas de usuario, credenciales y roles |
| `gearquest_store` | store-service | Productos, inventario, carritos, pedidos y descuentos |
| `gearquest_economy` | economy-service | Monederos, movimientos de monedas, tiradas y recompensas |
| `gearquest_payments` | payments-service | Recargas simuladas |

Infraestructura actual: un contenedor PostgreSQL local con Docker Compose; las bases se
crean automáticamente con `infra/docker/initdb/01-create-databases.sql`.

## 4. Requisitos funcionales

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-DB-01 | Una base de datos por servicio, con credenciales propias | Must | Ningún servicio accede a la base de otro; cada uno usa su `DATABASE_URL` |
| FR-DB-02 | El modelo de datos de cada servicio vive en su `prisma/schema.prisma` | Must | Cada servicio define sus tablas en su propio archivo de esquema |
| FR-DB-03 | Cambios de esquema mediante migraciones versionadas | Must | Todo cambio de tablas pasa por `prisma migrate`; el historial permite repetir el proceso en otra máquina |
| FR-DB-04 | Historial de movimientos de monedas **inmutable** | Must | Un vencimiento o consumo agrega un registro nuevo; nunca borra ni edita el original |
| FR-DB-05 | Restricciones de integridad en las tablas | Must | Correos únicos, claves foráneas activas y tipos adecuados (montos numéricos precisos, fechas con zona horaria) |
| FR-DB-06 | El cliente generado por Prisma (`src/generated/prisma/`) no se versiona | Must | Esa carpeta está en `.gitignore` y se regenera con `npm run prisma:generate` |
| FR-DB-07 | Script de creación de bases reproducible | Must | Un entorno nuevo crea las cuatro bases ejecutando solo `npm run db:up` |
| FR-DB-08 | Datos de prueba ficticios; nunca datos personales reales | Must | El repositorio no contiene nombres, correos ni teléfonos reales |

## 5. Requisitos no funcionales

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| NFR-DB-01 | Rendimiento en las consultas más frecuentes | Should | Listados del catálogo e historiales usan índices; sin consultas evidentes "totales" sobre tablas grandes |
| NFR-DB-02 | Copias de seguridad definidas antes de un despliegue real | Should | Existe un procedimiento documentado de respaldo y restauración |
| NFR-DB-03 | Mínima exposición de datos personales | Must | Solo se guarda lo necesario; no se registran datos de tarjetas (las recargas son simuladas) |
| NFR-DB-04 | Codificación y zona horaria homogéneas | Must | UTF-8 y UTC definidos en la configuración del contenedor |
| NFR-DB-05 | Consultas siempre parametrizadas (sin concatenar texto) | Must | Prisma se usa sin fugas de inyección SQL; revisado en la revisión de código |

## 6. Entidades propuestas (referencia, no definitiva)

> **Importante:** son propuestas de trabajo, no un modelo aprobado. Se confirmarán durante
> el diseño (decisión pendiente).

| Servicio | Entidades candidatas | Idea principal |
| --- | --- | --- |
| identity | `User` | Cuenta con correo, contraseña hasheada y rol |
| store | `Product`, `Inventory`, `Cart`, `Order`, `Discount` | Catálogo, stock, carrito, pedidos y niveles de descuento |
| economy | `Wallet`, `CoinTransaction`, `GachaRoll`, `Reward`, `PlayerItem` | Saldos, movimientos, tiradas e inventario del jugador |
| payments | `TopUp` | Recargas simuladas y su resultado |

## 7. Criterios de aceptación del área

- [ ] `npm run db:up` levanta PostgreSQL y crea las cuatro bases.
- [ ] Cada servicio arranca y consulta **solo** su base de datos.
- [ ] Las migraciones se aplican desde cero en una máquina limpia.
- [ ] Un vencimiento de monedas deja registro auditable sin borrar el movimiento original.

## 8. Decisiones pendientes

1. Modelo definitivo de tablas, columnas y relaciones de cada servicio.
2. Orden de consumo de monedas (ganadas primero, compradas primero o mezcla).
3. Retención y limpieza de datos antiguos (¿se archivan partidas o movimientos?).
4. Estrategia de respaldos en el entorno publicado.
5. Estrategia de datos de prueba (semillas) para desarrollo y demostraciones.

## 9. Referencias

- `README.MD` (raíz): §5 (tecnologías), §6 (arquitectura y monorepo).
- `backend/README.md`: sección "Base de datos" y comando `db:up`.
