# GearQuest · Backend (monorepo)

API y reglas de negocio de GearQuest (tienda de periféricos + gacha con monedas).

Organizado como **monorepo** con **npm workspaces**: un servicio por dominio en
`services/` y el código compartido en `packages/`.

> **Estado:** estructura y configuración listas. **Todavía no hay código de
> aplicación**: los módulos (`src/modules/*`) están vacíos a propósito y los
> esquemas Prisma solo contienen `datasource` + `generator` (sin modelos).
> Los scripts de `dev`, `build`, `typecheck` y las migraciones funcionarán
> cuando se agregue el código correspondiente.

## Stack previsto

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
│   │   ├── prisma/schema.prisma
│   │   ├── src/{config,db,modules/{auth,health,users}}/
│   │   ├── tests/
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── store-service/           # Catálogo, inventario, pedidos y descuentos (3002)
│   │   ├── prisma/schema.prisma
│   │   ├── src/{config,db,shared,modules/{catalog,discounts,health,inventory,orders}}/
│   │   ├── tests/
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── economy-service/         # Gacha, monedas, recompensas y transacciones (3003)
│   │   ├── prisma/schema.prisma
│   │   ├── src/{config,db,modules/{gacha,health,player-inventory,rewards,transactions,wallet}}/
│   │   ├── src/tests/
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── payments-service/        # Pagos y recargas simuladas             (3004)
│       ├── prisma/schema.prisma
│       ├── src/{config,db,shared,modules/{health,payments}}/
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
`src/modules/`.

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

## Próximos pasos (pendientes de autorización)

- Definir el modelo de datos de cada servicio (modelos en `schema.prisma`).
- Implementar los módulos (`config`, `db`, `modules/*`) y los endpoints.
- Crear los archivos de entrada (`src/index.ts`) y el bootstrap de Express.
- Contratos de API entre servicios y estrategia de autenticación.
