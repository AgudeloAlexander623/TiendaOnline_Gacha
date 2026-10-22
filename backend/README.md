# GearQuest · Backend (monorepo)

API y reglas de negocio de GearQuest (tienda de periféricos con monedas virtuales,
ruleta y partida de aventura).

Organizado como **monorepo** con **npm workspaces**: un servicio por dominio en
`services/` y el código compartido en `packages/`.

> **Estado:** los 4 servicios **están implementados y arrancan**. Hay **138 ficheros
> TypeScript** en `services/*/src`, **26 modelos Prisma** repartidos en 4 esquemas, 4
> migraciones aplicadas, *seeds* idempotentes y **57 endpoints de negocio** (+ 8 de
> salud). Ver el estado real, requisito por requisito, en
> [`documentation/Trazabilidad.md`](../documentation/Trazabilidad.md).

## Stack

- **Node.js + Express + TypeScript** (módulos ESM / `NodeNext`)
- **PostgreSQL + Prisma ORM**
- **Zod** (validación), **Pino** (logs), **Helmet / CORS / express-rate-limit** (seguridad base)
- **Vitest + Supertest** (pruebas), **ESLint + Prettier** (calidad), **tsx** (desarrollo)
- **Docker Compose** para PostgreSQL local

## Requisitos

- Node.js `>= 20.19` (los workspaces de npm requieren npm `>= 7`; se usa npm).
- Docker (opcional, para la base de datos local).

## Estructura

```text
backend/
├── services/
│   ├── identity-service/        # Autenticación y usuarios           (puerto 3001)
│   │   ├── prisma/{schema.prisma,migrations/,seed.ts}
│   │   ├── src/{config,db,modules/{auth,health,users}}/
│   │   ├── tests/
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── store-service/           # Catálogo, inventario, pedidos y descuentos (3002)
│   │   ├── prisma/{schema.prisma,migrations/,seed.ts}
│   │   ├── src/{config,db,shared,modules/{catalog,discounts,health,inventory,orders}}/
│   │   ├── tests/
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── economy-service/         # Monedas, ruleta, recompensas y transacciones (3003)
│   │   ├── prisma/{schema.prisma,migrations/,seed.ts}
│   │   ├── src/{config,db,modules/{gacha,health,player-inventory,rewards,transactions,wallet}}/
│   │   ├── tests/
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── payments-service/        # Paquetes, pagos y recargas simuladas (3004)
│       ├── prisma/{schema.prisma,migrations/,seed.ts}
│       ├── src/{config,db,shared,modules/{health,packages,payments,recharges}}/
│       ├── tests/
│       ├── .env.example
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── common/                  # Código y utilidades compartidas (@gearquest/common)
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── infra/
│   └── docker/
│       ├── docker-compose.yml   # PostgreSQL local
│       └── initdb/01-create-databases.sql
├── documentation_Backend/       # Documentación del backend
├── .editorconfig
├── .env.example                 # Referencia de variables comunes y puertos
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── eslint.config.mjs
├── package.json                 # Raíz del workspace (workspaces + tooling)
├── tsconfig.base.json           # Opciones TypeScript compartidas
├── tsconfig.json                # Config raíz para editores
└── vitest.config.ts
```

Cada servicio es un paquete independiente con su propio `package.json`,
`tsconfig.json`, `prisma/` y variables de entorno. Los módulos se agrupan en
`src/modules/`, y cada módulo sigue el patrón
`*.router.ts` → `*.service.ts` → `*.schemas.ts` → `*.repository.ts`.

## Puesta en marcha

1. Instalar dependencias de todo el workspace (desde `backend/`):

   ```bash
   npm install
   ```

2. Levantar PostgreSQL local (crea una base por servicio):

   ```bash
   npm run db:up
   ```

3. Crear el `.env` de cada servicio a partir de su ejemplo:

   ```bash
   cp services/identity-service/.env.example services/identity-service/.env
   # ...repetir para store, economy y payments
   ```

## Comandos (desde `backend/`)

| Comando                            | Descripción                                             |
| ---------------------------------- | ------------------------------------------------------- |
| `npm run dev:identity`             | Servicio de identidad en modo desarrollo (watch)       |
| `npm run dev:store`                | Servicio de tienda en modo desarrollo                    |
| `npm run dev:economy`              | Servicio de economía en modo desarrollo                  |
| `npm run dev:payments`             | Servicio de pagos en modo desarrollo                     |
| `npm run build`                    | Compila todos los workspaces (`tsc`)                    |
| `npm run typecheck`                | Verifica tipos en todos los workspaces                  |
| `npm test`                         | Ejecuta las pruebas (Vitest, todos los servicios)       |
| `npm run lint` / `lint:fix`        | ESLint sobre todo el backend                            |
| `npm run format` / `format:check`  | Prettier (escribe / verifica)                           |
| `npm run prisma:generate`          | `prisma generate` en todos los servicios                |
| `npm run prisma:migrate`           | `prisma migrate dev` en todos los servicios             |
| `npm run prisma:deploy`            | `prisma migrate deploy` en todos los servicios          |
| `npm run db:up` / `db:down`        | Levanta / detiene PostgreSQL (Docker Compose)           |
| `npm run db:logs`                  | Logs de PostgreSQL                                      |

Comandos por servicio (ejemplos):

```bash
npm run dev -w @gearquest/identity-service
npm run prisma:studio -w @gearquest/store-service
npm run build -w @gearquest/common
```

## Base de datos

Estrategia por defecto: **un contenedor PostgreSQL con una base de datos por
servicio** para aislar los datos. Las bases se crean con
`infra/docker/initdb/01-create-databases.sql`:

| Servicio         | Base de datos         |
| ---------------- | --------------------- |
| identity-service | `gearquest_identity`  |
| store-service    | `gearquest_store`     |
| economy-service  | `gearquest_economy`   |
| payments-service | `gearquest_payments`  |

Cada servicio apunta a su base mediante `DATABASE_URL` en su `.env`
(ver `services/<servicio>/.env.example`). El cliente Prisma se genera en
`src/generated/prisma/` y **no** se versiona.

> **Nota:** las cuatro bases usan el mismo rol de PostgreSQL (`postgres:postgres`); solo
> difieren en el nombre de la base. El aislamiento es **lógico** (una base por servicio),
> no de credenciales. Ver `FR-DB-01` en
> [`documentation/Trazabilidad.md`](../documentation/Trazabilidad.md) §5.

## Qué falta (pendiente real)

Lo que **no** está hecho, con el requisito que lo respalda:

| # | Pendiente | Requisitos |
| --- | --- | --- |
| 1 | **Los servicios aún no se llaman entre sí** (0 llamadas internas): cerrar los 3 `TODO(economia)` y los 2 comentarios de integración | `FR-BE-13`, `FR-BE-21`, `FR-BE-17` |
| 2 | **Canje del mercader**: no existe la operación interna de canje por monedas | `FR-BE-22`, `FR-GA-10` |
| 3 | **Compensación**: si `store` pide un débito y luego falla el checkout, hay que revertirlo | `FR-BE-23` |
| 4 | **Idempotencia persistida**: la clave existe en el contrato, pero no se guarda en base de datos | `FR-DB-09`, `FR-BE-19` |
| 5 | **Token interno service-to-service**: no hay llamada interna que autenticar todavía | `FR-SEC-11` |
| 6 | **Módulo de notificaciones**: no existe el servicio que recibe y guarda los avisos | `FR-NO-01`…`FR-NO-10` |
| 7 | **Dockerfiles de las aplicaciones**: solo hay imagen de PostgreSQL | `NFR-BE-08`, `FR-INF-08` |
| 8 | **Comando global de arranque**: hoy cada servicio se levanta por separado | `FR-INF-07` |

> El contrato que cierra los puntos 1–6 está definido en
> [`documentation/Contrato-entre-servicios.md`](../documentation/Contrato-entre-servicios.md)
> (6 operaciones internas). La priorización completa está en
> [`documentation/Trazabilidad.md`](../documentation/Trazabilidad.md) §12.
