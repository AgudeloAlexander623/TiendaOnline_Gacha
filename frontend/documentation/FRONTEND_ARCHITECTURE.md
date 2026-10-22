# Arquitectura del frontend — GearQuest

**Estado:** estructura **implementada** (base del proyecto). **Sin lógica de negocio ni
llamadas HTTP todavía.**
**Última revisión:** 2026-10-22
**Tecnologías:** React 18 + TypeScript 5 + Vite 5 + Tailwind CSS 3 + React Router 6

> **Nota:** este documento describe **cómo está organizado** el frontend y **qué reglas
> debe seguir** quien añada código. No es un esquema propuesto: la estructura ya existe.

---

## 1. Objetivo

Definir la estructura de carpetas y los principios del frontend de GearQuest, siguiendo
buenas prácticas y separando responsabilidades. La estructura está creada; lo que falta
es llenarla de lógica.

---

## 2. Principios

- **Separación de responsabilidades:** UI, estado, rutas, datos y utilidades en carpetas
  separadas.
- **Feature-first:** el código de negocio se agrupa por funcionalidad (`src/features/*`).
- **Minimalismo:** solo lo necesario; nada de sobre-ingeniería.
- **Consistente:** se sigue el estilo ya existente en el repositorio (ESLint + Prettier).
- **Escalable:** la estructura admite crecer sin reordenar todo.
- **Testeable:** los límites entre capas permiten probar por partes.

---

## 3. Estructura de carpetas (estado real)

```text
frontend/
├── documentation/           # Documentación del frontend (este documento y el índice)
│   └── personal/             # Registro individual por desarrollador
├── public/                  # Archivos estáticos
├── src/
│   ├── app/                  # Configuración de app
│   │   ├── providers/        # Context / Providers
│   │   └── router/           # Rutas de la aplicación (createBrowserRouter)
│   ├── assets/               # Imágenes, íconos, fuentes
│   ├── components/           # Componentes reutilizables
│   │   ├── ui/               # Componentes UI atómicos/genéricos
│   │   └── shared/           # Componentes compartidos entre features
│   ├── config/               # Configuración (env, constantes, endpoints) — vacío
│   ├── features/             # Features por dominio — solo `.gitkeep` (vacías)
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── catalog/
│   │   ├── discounts/
│   │   ├── game-integration/
│   │   ├── notifications/    # ← añadida en v1.1 (FR-FE-11)
│   │   ├── orders/
│   │   ├── profile/
│   │   └── admin/            # ← añadida en v1.1 (FR-FE-12)
│   ├── hooks/                # Custom hooks reutilizables
│   ├── layouts/              # MainLayout, AuthLayout
│   ├── lib/                  # Utilidades, helpers, validaciones, cliente HTTP — vacío
│   ├── pages/                # 9 páginas (top-level)
│   ├── services/             # Cliente API por servicio — vacío (FR-FE-10)
│   ├── store/                # Estado global — vacío
│   ├── types/                # Tipos TypeScript compartidos
│   └── utils/                # Funciones puras
├── .env.example              # Variables de entorno (VITE_API_BASE_URL)
├── .prettierrc.json          # Configuración de Prettier (respeta el estilo existente)
├── .prettierignore
├── eslint.config.js          # ESLint 10 (flat config)
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts            # Configuración de Vite + proxy inverso por prefijo
└── ReadmeFrontEnd.md
```

> **Lo que hay y lo que no:**
>
> - ✅ **9 páginas** implementadas en `src/pages/` y enrutadas.
> - ⬜ `src/features/*`, `src/services/`, `src/lib/`, `src/config/` y `src/store/` están
>   **vacías**: ahí va el código que aún no se ha escrito.
> - ⬜ **0 llamadas HTTP.** No hay cliente de API ni gestión de sesión todavía.

---

## 4. Dominios (mapeados con el SRS)

| Dominio              | Carpeta                     | Requisitos                           | Estado             |
| -------------------- | --------------------------- | ------------------------------------ | ------------------ |
| **auth**             | `features/auth`             | `FR-FE-01`, `FR-FE-02`, `FR-FE-03`   | ⬜ vacía           |
| **catalog**          | `features/catalog`          | `FR-FE-04`, `FR-FE-05`               | ⬜ vacía           |
| **cart**             | `features/cart`             | `FR-FE-06`                           | ⬜ vacía           |
| **orders**           | `features/orders`           | `FR-FE-08`                           | ⬜ vacía           |
| **wallet**           | `features/wallet`           | `FR-FE-09`                           | ⬜ vacía           |
| **discounts**        | `features/discounts`        | `FR-FE-04`                           | ⬜ vacía           |
| **game-integration** | `features/game-integration` | `FR-FE-07` (aventura y ruleta)       | ⬜ vacía           |
| **notifications**    | `features/notifications`    | `FR-FE-11` (bandeja de avisos)       | ⬜ añadida en v1.1 |
| **admin**            | `features/admin`            | `FR-FE-12` (panel de administración) | ⬜ añadida en v1.1 |
| **profile**          | `features/profile`          | `FR-FE-03`                           | ⬜ vacía           |

> Los dominios **`notifications`** y **`admin`** se añadieron en la v1.1 de la
> documentación: el SRS del frontend los pedía (`FR-FE-11`, `FR-FE-12`) pero la estructura
> de carpetas no los contemplaba. Sus requisitos son **nuevos** y siguen **sin
> implementar**.

---

## 5. Comunicación con el backend

**Regla:** el frontend **no** escribe URLs a mano en las pantallas. Todo pasa por
`src/services/`, que usa una **única URL base**.

### 5.1 El proxy inverso de Vite (entorno de desarrollo)

`vite.config.ts` define un proxy **por prefijo de ruta**, de modo que el navegador solo
conoce `/api/v1` y nunca los puertos:

| Prefijo                                                                                                               | Servicio           | Puerto |
| --------------------------------------------------------------------------------------------------------------------- | ------------------ | -----: |
| `/api/v1/auth`, `/api/v1/users`                                                                                       | `identity-service` |   3001 |
| `/api/v1/carts`, `/api/v1/categories`, `/api/v1/discounts`, `/api/v1/inventory`, `/api/v1/orders`, `/api/v1/products` | `store-service`    |   3002 |
| `/api/v1/gacha`, `/api/v1/items`, `/api/v1/rewards`, `/api/v1/transactions`, `/api/v1/wallet`                         | `economy-service`  |   3003 |
| `/api/v1/packages`, `/api/v1/payments`, `/api/v1/recharges`                                                           | `payments-service` |   3004 |

### 5.2 Variables de entorno

`.env.example` documenta la configuración:

```bash
# Ruta base única de la API. El proxy de Vite reparte cada prefijo a su servicio.
VITE_API_BASE_URL=/api/v1
```

> **Por qué `/api/v1` y no `http://localhost:3000`:** el puerto 3000 no lo escucha ningún
> servicio, así que la configuración anterior **no funcionaba**. Con el proxy, el mismo
> código funciona en desarrollo y en producción (donde el reparto lo hace el proxy del
> servidor). Requisito: `FR-FE-13`.

---

## 6. Reglas para desarrollo

- **Sin código sin autorización:** la estructura y la documentación se crean; la lógica se
  escribe cuando se pide.
- **Documentar cambios:** se registra en `documentation/` (ver
  [`README.md`](./README.md)).
- **No tocar lógica del backend:** el frontend consume la API; los contratos están
  definidos en [`documentation/API/openapi.yaml`](../../documentation/API/openapi.yaml).
- **Componentes UI puros:** sin efectos secundarios en la vista.
- **Tipado estricto:** TypeScript en todo, sin `any` implícito.
- **Formato automático:** `npm run format` (Prettier) y `npm run lint` (ESLint) antes de
  entregar.
- **Consistencia de estilo:** Prettier está configurado con `semi: false` y
  `singleQuote: true`, que es el estilo **ya presente** en el código.

---

## 7. Dependencias

**Instaladas:**

| Grupo   | Paquetes                                                                                                                |
| ------- | ----------------------------------------------------------------------------------------------------------------------- |
| Core    | `react`, `react-dom`, `react-router-dom`                                                                                |
| Estilos | `tailwindcss`, `postcss`, `autoprefixer`                                                                                |
| Build   | `vite`, `@vitejs/plugin-react`, `typescript`                                                                            |
| Calidad | `eslint` (10, flat config), `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `prettier` |

**Propuestas, no instaladas** (evaluar cuando se implemente la capa de datos):
`axios` (o `fetch` nativo), `clsx` + `tailwind-merge`, `react-hook-form` + `zod`,
`lucide-react`.

---

## 8. Integración con el monorepo

- El frontend vive en `frontend/`, **separado** de `backend/`.
- El backend es un monorepo con npm workspaces y 4 servicios (puertos 3001-3004).
- La comunicación es **HTTP REST**; el contrato público está en
  [`documentation/API/openapi.yaml`](../../documentation/API/openapi.yaml)
  (59 operaciones, 45 rutas).
- El juego (Godot, carpeta `GAME/`) es independiente y se integra por enlace o
  embebido (decisión pendiente en el SRS del juego).

---

## 9. Qué falta (pendiente real)

| #   | Pendiente                                                      | Requisitos                         |
| --- | -------------------------------------------------------------- | ---------------------------------- |
| 1   | **Capa `services/`** con el cliente HTTP y los tipos de la API | `FR-FE-10`, `FR-FE-13`             |
| 2   | **Gestión de sesión** y almacenamiento seguro del token        | `NFR-FE-08`, `FR-FE-01`…`FR-FE-03` |
| 3   | **Estado global** (`store/`)                                   | `FR-FE-02`                         |
| 4   | **Rutas protegidas** (`/orders`, `/profile`)                   | `FR-FE-01`                         |
| 5   | **Bandeja de avisos** (dominio `notifications`)                | `FR-FE-11`                         |
| 6   | **Panel de administración** (dominio `admin`)                  | `FR-FE-12`                         |
| 7   | **Integración con el juego** (aventura y ruleta)               | `FR-FE-07`                         |

> El detalle completo, con el estado de los 21 requisitos del frontend, está en
> [`documentation/Trazabilidad.md`](../../documentation/Trazabilidad.md) §6.

---

## 10. Referencias

- [`README.md`](./README.md) — índice de la documentación del frontend.
- [`CHANGELOG_ESQUEMA.md`](./CHANGELOG_ESQUEMA.md) — historial de cambios del frontend.
- [`ReadmeFrontEnd.md`](../ReadmeFrontEnd.md) — guía de uso del frontend.
- [`documentation/Software-requeriments(SRS)/Frontend.md`](<../../documentation/Software-requeriments(SRS)/Frontend.md>) —
  requisitos `FR-FE-*` y `NFR-FE-*`.
- [`documentation/Trazabilidad.md`](../../documentation/Trazabilidad.md) — estado real.
