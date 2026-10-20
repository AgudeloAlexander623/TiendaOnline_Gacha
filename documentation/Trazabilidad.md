# Matriz de trazabilidad — GearQuest

> **Proyecto:** GearQuest — tienda de periféricos con sistema de recompensas gamificado
> **Versión:** 1.0 · **Fecha:** 2026-10-19
> **Fuente de verdad:** auditoría directa del código del repositorio (no de intenciones)
> **Complementa a:** [SRS](./Software-requeriments\(SRS\)/README.md) · [Casos de Uso](./Casos-de-Uso/README.md)

---

## 1. Qué es este documento y cómo leerlo

Este documento responde a una sola pregunta: **¿qué dice el SRS que debe existir y qué hay
realmente en el código?** Es la pieza que evita que la documentación se desincronice del
producto: cada requisito del SRS (`FR-*`, `NFR-*`) queda aquí con su **estado real** y su
**evidencia** (el fichero donde se puede comprobar).

> **Regla de mantenimiento:** cuando se implemente, complete o rompa un requisito, se cambia
> su fila aquí **en el mismo PR** que toca el código. Si un requisito no tiene estado
> actualizado, este documento pierde su valor.

**Leyenda de estados:**

| Estado | Significado |
| --- | --- |
| ✅ **Implementado** | El código existe y hace lo que pide el requisito |
| ⚠️ **En progreso** | Funciona parcialmente, o hay un pendiente explícito (`TODO`) o una limitación conocida |
| ⬜ **Prioridad · pendiente** | No hay implementación todavía |
| 🧪 **Probado** | Además de implementado, tiene prueba automatizada que lo cubre |

**Notación de rutas:** `identity/…`, `store/…`, `economy/…`, `payments/…` son relativas a
`backend/services/`; `frontend/…` es relativa a la raíz del repositorio.

**Resumen de estados:** 57 ✅ · 35 ⚠️ · 49 ⬜ de 141 requisitos (recuento en §13)

---

## 2. Resumen ejecutivo

| Área (documento SRS) | Total | ✅ | ⚠️ | ⬜ |
| --- | ---: | ---: | ---: | ---: |
| Backend | 29 | 22 | 7 | 0 |
| Reglas de negocio | 18 | 13 | 5 | 0 |
| Base de datos | 13 | 10 | 2 | 1 |
| Frontend | 17 | 3 | 10 | 4 |
| Juego (Godot) | 28 | 0 | 6 | 22 |
| Infraestructura | 10 | 1 | 3 | 6 |
| Notificaciones | 12 | 0 | 0 | 12 |
| Seguridad | 14 | 8 | 2 | 4 |
| **Total** | **141** | **57** | **35** | **49** |

**Lectura en una frase:** el **backend es el área más madura** (identidad, tienda, economía,
pagos y seguridad base operan con datos reales), el **frontend es UI estática sin conectar**
(0 llamadas HTTP) y **juego, notificaciones e infraestructura de despliegue están sin iniciar**.
Los cuatro puntos de deuda técnica más relevantes están en §12.

---

## 3. Backend — `Software-requeriments(SRS)/Backend.md` (29)

| Código | Requisito (resumen) | Prioridad | Estado | Evidencia / motivo |
| --- | --- | --- | --- | --- |
| FR-BE-01 | Endpoint `/health` por servicio | Must | ✅ 🧪 | `*/modules/health/health.router.ts` (liveness + readiness con `SELECT 1`); `tests/health.test.ts` ×4 |
| FR-BE-02 | Validación de entradas con Zod | Must | ✅ 🧪 | Esquemas en cada router; `tests/auth.schemas.test.ts`, `tests/products.schemas.test.ts` |
| FR-BE-03 | Logs útiles para diagnóstico | Must | ✅ | `pino-http` + `LOG_LEVEL` en los 4 `src/app.ts` |
| FR-BE-04 | Errores con HTTP adecuado y mensaje genérico | Must | ✅ 🧪 | `*/src/shared/errors.ts` (`AppError`, código público, `isOperational=false` nunca expone stack); tests 404 `NOT_FOUND` |
| FR-BE-05 | Registro sin duplicados | Must | ✅ 🧪 | `identity/modules/auth/auth.router.ts:19` + `User.email @unique` |
| FR-BE-06 | Inicio de sesión con credencial válida | Must | ✅ 🧪 | `identity/modules/auth/auth.service.ts` (bcrypt + rotación de refresh token) |
| FR-BE-07 | Consultar y actualizar el perfil | Must | ✅ | `identity/modules/users/users.router.ts:26,34` (`GET/PATCH /users/me`) |
| FR-BE-08 | Roles cliente/administrador | Must | ✅ 🧪 | `identity/modules/auth/auth.middleware.ts:58` (`requireRole("ADMIN")`); test 401 sin token |
| FR-BE-09 | Catálogo paginado y detalle | Must | ✅ | `store/modules/catalog/products.router.ts:24-40` (filtros + paginación) |
| FR-BE-10 | Administrar productos e inventario | Must | ✅ | `products.router.ts:48-69` + `inventory/inventory.service.ts:44-92` (ajuste transaccional auditable) |
| FR-BE-11 | Gestionar el carrito | Must | ✅ | `store/modules/orders/carts.router.ts:23-54` |
| FR-BE-12 | Crear pedidos descontando inventario seguro | Must | ✅ 🧪 parcial | `store/modules/orders/orders.service.ts:64-163` (checkout en transacción; test de 401/404 en `health.test.ts`) |
| FR-BE-13 | Descuentos: elegibilidad, saldo y límites | Must | ⚠️ | CRUD de niveles completo; **débito de monedas pendiente**: `TODO(economia)` en `orders.service.ts:91` |
| FR-BE-14 | Monedero desglosado por tipo y vencimiento | Must | ✅ | `economy/modules/wallet/wallet.service.ts:101-220` (expira lotes vencidos antes de sumar) |
| FR-BE-15 | Historial auditable de movimientos | Must | ✅ | `CoinTransaction` append-only con `balanceAfter`; `transactions/transactions.router.ts:15` |
| FR-BE-16 | Tiradas de gacha con débito y recompensa | Must | ✅ | `economy/modules/gacha/gacha.service.ts:68-168` (sorteo ponderado en transacción) |
| FR-BE-17 | Validar resultados del minijuego en servidor | Must | ⚠️ | `economy/modules/rewards/rewards.service.ts:8-9`: regla simple puntaje→monedas (tope 500); validación real pendiente |
| FR-BE-18 | Vencimiento de monedas ganadas a 30 días | Must | ✅ | `economy/.env.example` (`EARNED_COINS_TTL_DAYS=30`) + `CoinBatch.expiresAt` + expiración en `wallet.service.ts` |
| FR-BE-19 | Operaciones de saldo ante repetición/concurrencia | Must | ⚠️ | Transacciones Prisma en checkout/tirada/débito; **sin clave de idempotencia** (una misma petición repetida puede duplicarse) |
| FR-BE-20 | Recargas claramente simuladas | Must | ✅ | `payments/modules/payments/payments.service.ts:166` (`provider: "MOCK"`, `externalId: mock_…`) |
| FR-BE-21 | Acreditar monedas compradas sin vencimiento | Must | ⚠️ | **Pendiente**: `TODO(economia)` en `payments.service.ts:176` (acreditar `PURCHASED` en economy) |
| NFR-BE-01 | TypeScript estricto | Must | ✅ | `backend/tsconfig.base.json` (`"strict": true`) + script `typecheck` por workspace |
| NFR-BE-02 | Pruebas automatizadas sobre reglas críticas | Must | ⚠️ | Vitest + Supertest operativos, pero **8 ficheros / 180 líneas**: solo esquemas, salud y autorización; ningún test toca BD |
| NFR-BE-03 | ESLint + Prettier | Must | ✅ | `backend/eslint.config.mjs`, `.prettierrc.json`, scripts `lint`/`format` |
| NFR-BE-04 | Contratos de API claros y predecibles | Must | ⚠️ | Respuestas JSON consistentes con `AppError`; **contrato publicado hoy** en [`API/openapi.yaml`](./API/openapi.yaml) (antes no existía) |
| NFR-BE-05 | Helmet, CORS y límite de solicitudes | Must | ✅ | `helmet` + `cors` + `express-rate-limit` en los 4 `src/app.ts` |
| NFR-BE-06 | Configuración en `.env.example` por servicio | Must | ✅ | `backend/.env.example` + uno por servicio (9-10 variables cada uno) |
| NFR-BE-07 | Independencia entre servicios | Should | ✅ | 4 bases propias (`initdb/01-create-databases.sql`); JWT verificado localmente, sin llamadas entre servicios |
| NFR-BE-08 | Arranque/despliegue reproducible en contenedores | Should | ⚠️ | `infra/docker/docker-compose.yml` solo levanta PostgreSQL; **no hay Dockerfiles** de las aplicaciones |

## 4. Reglas de negocio — `Business-Rules.md` (18)

| Código | Requisito (resumen) | Prioridad | Estado | Evidencia / motivo |
| --- | --- | --- | --- | --- |
| FR-BR-01 | Distingue monedas ganadas de compradas | Must | ✅ | `CoinType {EARNED, PURCHASED}` en `economy/prisma/schema.prisma:80` |
| FR-BR-02 | Ganadas vencen a los 30 días | Must | ✅ | `CoinBatch.expiresAt` + `EARNED_COINS_TTL_DAYS=30` |
| FR-BR-03 | Compradas nunca vencen | Must | ✅ | `expiresAt` opcional; lotes `PURCHASED` con `null` |
| FR-BR-04 | Saldo calculado por el servidor (tipo + vencimiento) | Must | ✅ | `wallet.service.ts:101-220` |
| FR-BR-05 | El vencimiento genera movimiento nuevo sin borrar el original | Must | ✅ | Tipo `EXPIRE` en `CoinTransaction`; histórico append-only |
| FR-BR-06 | Historial auditable de ganancia/consumo/vencimiento | Must | ✅ | `CoinTransaction` + `GET /api/v1/transactions/me` |
| FR-BR-07 | Cinco niveles de descuento (10-90 %) | Must | ✅ | Modelo `DiscountLevel` (`level @unique`, `percentage`, `coinsRequired`) + CRUD admin |
| FR-BR-08 | Verificación de elegibilidad, saldo, vigencia y límites antes de aplicar | Must | ⚠️ | **Pendiente**: validación y débito de monedas al canjear (`TODO(economia)`) |
| FR-BR-09 | El precio final lo calcula el servidor | Must | ✅ | Totales calculados en `orders.service.ts`; el cliente no envía importes finales |
| FR-BR-10 | Recargas simuladas, sin dinero real ni datos bancarios | Must | ✅ | `PaymentProvider {MOCK, …}`, pasarela simulada en `payments.service.ts:166` |
| FR-BR-11 | Identificación evidente de que es simulado | Must | ⚠️ | Backend marca `provider: MOCK`; **el frontend aún no lo muestra** (no hay interfaz de recarga) |
| FR-BR-12 | Pedido con precios vigentes al confirmarse | Must | ✅ | Snapshot `CartItem.unitPrice` → `OrderItem.nameSnapshot/unitPrice` |
| FR-BR-13 | Confirmar pedido descuenta inventario | Must | ✅ | Checkout transaccional `orders.service.ts:64-163` |
| FR-BR-14 | Descuento calculado en el servidor antes de confirmar | Must | ⚠️ | Campos `discountAmount` listos; **cálculo con débito de monedas pendiente** (FR-BR-08) |
| FR-BR-15 | Operaciones de saldo seguras ante repetición/concurrencia | Must | ⚠️ | Transacciones + restricciones `@@unique`; **sin idempotencia por petición** |
| FR-BR-16 | El cliente nunca envía un saldo que se acepte sin validar | Must | ✅ | Los saldos solo se modifican en `economy`; los demás servicios no escriben monederos |
| NFR-BR-01 | Las reglas viven en el backend, no en la interfaz | Must | ✅ | Cálculos exclusivamente en `*.service.ts`; frontend sin lógica de negocio |
| NFR-BR-02 | Toda regla crítica con prueba automatizada | Must | ⚠️ | Cubiertas: sorteo ponderado y `scoreToCoins` (`gacha.service.test.ts`); **faltan**: wallet/vencimientos, checkout, pagos, permisos |

## 5. Base de datos — `Database.md` (13)

| Código | Requisito (resumen) | Prioridad | Estado | Evidencia / motivo |
| --- | --- | --- | --- | --- |
| FR-DB-01 | Una base por servicio con credenciales propias | Must | ✅ | `infra/docker/initdb/01-create-databases.sql` crea `gearquest_identity/store/economy/payments` |
| FR-DB-02 | Modelo en `prisma/schema.prisma` por servicio | Must | ✅ | 4 esquemas · **26 modelos** (3 + 10 + 8 + 5) |
| FR-DB-03 | Migraciones versionadas | Must | ✅ | 4 migraciones `*_init` (2026-10-15) + scripts `prisma:migrate/deploy` |
| FR-DB-04 | Historial de monedas inmutable | Must | ✅ | `CoinTransaction` solo-insert con `balanceAfter` |
| FR-DB-05 | Restricciones de integridad | Must | ✅ | `@unique` (email, sku, slug, level…), FK con `onDelete`, `@@unique([cartId, productId])`, enums |
| FR-DB-06 | Cliente Prisma generado no versionado | Must | ✅ | `src/generated/prisma/` ausente de `git ls-files` |
| FR-DB-07 | Script de creación reproducible | Must | ✅ | `npm run db:up` (compose) + `initdb` SQL al primer arranque |
| FR-DB-08 | Datos de prueba ficticios, nunca reales | Must | ✅ | `prisma/seed.ts` idempotente en los 4 servicios |
| NFR-DB-01 | Rendimiento en consultas frecuentes | Should | ⚠️ | Índices creados (`@@index([userId])`, `[walletId]`, `[expiresAt]`…); **sin mediciones** de latencia |
| NFR-DB-02 | Copias de seguridad antes de despliegue real | Should | ⬜ | Sin procedimiento definido (decisión pendiente en Database.md) |
| NFR-DB-03 | Mínima exposición de datos personales | Must | ⚠️ | Esquema mínimo (email, displayName); **falta política formal** de retención/borrado |
| NFR-DB-04 | Codificación y zona horaria homogéneas | Must | ✅ | UTF-8 por compose; Prisma almacena `DateTime` en UTC |
| NFR-DB-05 | Consultas siempre parametrizadas | Must | ✅ | Todo el acceso via Prisma ORM; SQL crudo solo en `initdb` (sin entradas de usuario) |

## 6. Frontend — `Frontend.md` (17)

> **Estado global:** UI base con 9 páginas y routing; **0 llamadas HTTP**, carpetas
> `src/features/*` vacías (solo `.gitkeep`), sin estado global ni capa `services/`.

| Código | Requisito (resumen) | Prioridad | Estado | Evidencia / motivo |
| --- | --- | --- | --- | --- |
| FR-FE-01 | Catálogo con búsqueda/filtros y detalle | Must | ⚠️ | `frontend/src/pages/CatalogPage.tsx:5-12` con `mockProducts`; sin filtros ni llamada al backend |
| FR-FE-02 | Registro e inicio de sesión con validación | Must | ⚠️ | `LoginPage.tsx` / `RegisterPage.tsx` existen; botones `disabled` y sin envío (fase auth) |
| FR-FE-03 | Carrito y pedidos con precios del backend | Must | ⚠️ | `CartPage.tsx` / `OrdersPage.tsx` placeholder ("se conectará en fase posterior") |
| FR-FE-04 | Monedero con saldo, vencimientos e historial | Must | ⚠️ | Solo texto descriptivo en `ProfilePage.tsx:21-27`; sin datos |
| FR-FE-05 | Cinco niveles de descuento y elegibilidad | Must | ⚠️ | Textos estáticos en `ProfilePage.tsx:29-34` y `HomePage.tsx:84-89` |
| FR-FE-06 | Consultar y editar el perfil | Must | ⚠️ | `ProfilePage.tsx` estática ("esta es una vista previa") |
| FR-FE-07 | Integrar acceso al juego y resultados | Should | ⬜ | Sin componente ni página; solo mención textual en `HomePage.tsx:71-77` |
| FR-FE-08 | Estados de carga, vacío y error claros | Must | ⚠️ | Existen estados vacíos ("Tu carrito está vacío"); **faltan** estados de carga y error |
| FR-FE-09 | Identificar que las recargas son simuladas | Must | ⬜ | Sin interfaz de recarga |
| FR-FE-10 | Centralizar la API en `services/` | Must | ⬜ | `frontend/src/services/` y `src/lib/` vacíos; **0 llamadas** `fetch`/`axios` en el código |
| NFR-FE-01 | Diseño adaptable (móvil/tablet/escritorio) | Must | ⚠️ | Tailwind activo; **sin revisión** de breakpoints reales |
| NFR-FE-02 | TypeScript estricto | Must | ✅ | `frontend/tsconfig.app.json` (`strict: true`, `noUnusedLocals`…) |
| NFR-FE-03 | Sin secretos en el navegador | Must | ✅ | Solo `VITE_API_BASE_URL` y `VITE_APP_NAME` (públicas por diseño); ninguna clave |
| NFR-FE-04 | Accesibilidad básica | Should | ⬜ | No evaluada |
| NFR-FE-05 | Rendimiento razonable de carga inicial | Should | ⚠️ | Build de Vite OK; **sin métricas** (LCP/CLS) ni presupuesto definido |
| NFR-FE-06 | Consistencia visual y de código | Must | ⚠️ | ESLint (flat) sí; **Prettier no instalado**; queda un `eslintrc.cjs` muerto |
| NFR-FE-07 | Lenguaje de negocio en la interfaz | Must | ✅ | Textos en español de negocio en las 9 páginas (monedero, niveles, gacha, pedidos) |

## 7. Juego — `Game.md` (28)

> **Estado global:** no existe el proyecto Godot (carpeta `GAME/` no creada). Donde el
> **backend ya cubre la parte servidora**, se marca ⚠️ en lugar de ⬜.

| Código | Requisito (resumen) | Prioridad | Estado | Evidencia / motivo |
| --- | --- | --- | --- | --- |
| FR-GA-01 | 5 mapas laberinto con jefe final | Must | ⬜ | Sin proyecto Godot |
| FR-GA-02 | Combate cuerpo a cuerpo o a distancia según equipo | Must | ⬜ | Sin proyecto Godot |
| FR-GA-03 | Barra de vida visible | Must | ⬜ | Sin proyecto Godot |
| FR-GA-04 | Objetos destructibles que sueltan items | Must | ⬜ | Sin proyecto Godot |
| FR-GA-05 | Enemigos que sueltan monedas | Must | ⬜ | Sin proyecto Godot |
| FR-GA-06 | Nivel 5 con el Rey Demonio | Must | ⬜ | Sin proyecto Godot |
| FR-GA-07 | Al morir: pierde items, conserva monedas | Must | ⬜ | Sin proyecto Godot |
| FR-GA-08 | Anti-farming por enemigo | Should | ⬜ | Sin proyecto Godot |
| FR-GA-09 | Zona de mercader fija por mapa | Must | ⬜ | Sin proyecto Godot |
| FR-GA-10 | Mercader: canjear monedas por objetos | Must | ⬜ | Sin proyecto Godot |
| FR-GA-11 | Ruleta con tiradas que cuestan monedas | Must | ⚠️ | Backend listo (`POST /gacha/banners/:id/pull`); sin interfaz de juego |
| FR-GA-12 | Probabilidades a favor de la casa | Must | ⚠️ | Sorteo ponderado por `weight` implementado; **balance concreto sin definir** (decisión pendiente) |
| FR-GA-13 | Descuento aplicable a un solo producto del carrito | Must | ⬜ | Sin regla de aplicabilidad por producto (además de FR-BR-08 pendiente) |
| FR-GA-14 | Items raros exclusivos de la ruleta | Must | ⬜ | Enums `Rarity` listos en BD; sin contenido ni proyecto de juego |
| FR-GA-15 | Mostrar coste de tirada y saldo antes de jugar | Must | ⬜ | Sin interfaz (backend expone `costPerPull` y `/wallet/me`) |
| FR-GA-16 | Zonas de descanso con cofre | Must | ⬜ | Sin proyecto Godot |
| FR-GA-17 | Cofre que almacena armas/armaduras/items | Must | ⬜ | Sin proyecto Godot |
| FR-GA-18 | Identificar al usuario antes de registrar partida | Must | ⚠️ | `POST /rewards/sessions` exige JWT; el cliente juego no existe (protocolo: Game.md §8.6 pendiente) |
| FR-GA-19 | Enviar resultado al backend para validación | Must | ⚠️ | Endpoints `rewards/sessions/:id/finish` operativos; validación real pendiente (FR-BE-17) |
| FR-GA-20 | El juego no modifica saldos por su cuenta | Must | ⚠️ | Garantizado por diseño (solo economy escribe monederos); se verificará cuando exista el juego |
| FR-GA-21 | Historial de tiradas visible en la cuenta | Must | ⬜ | Backend lo expone (`/transactions/me`, `/rewards/sessions/me`); sin UI |
| FR-GA-22 | Aviso claro cuando no hay conexión | Must | ⬜ | Sin proyecto Godot |
| NFR-GA-01 | 60 FPS en equipos modestos | Should | ⬜ | Sin proyecto Godot |
| NFR-GA-02 | Resistencia a trampas (sin monedas sin validar) | Must | ⚠️ | Servidor único que acredita (NFR-GA-02 cumplido en backend); antitrampa real al integrar juego |
| NFR-GA-03 | C++ limpio, comentado en español | Must | ⬜ | Sin código C++ |
| NFR-GA-04 | Sin credenciales en texto plano | Must | ⬜ | Sin proyecto Godot (aplicar al integrar JWT) |
| NFR-GA-05 | Dificultad exigente tipo *Dark Souls* | Should | ⬜ | Sin diseño de juego |
| NFR-GA-06 | Experiencia comprensible sin tutorial largo | Should | ⬜ | Sin diseño de juego |

## 8. Infraestructura — `Infrastructure.md` (10)

| Código | Requisito (resumen) | Prioridad | Estado | Evidencia / motivo |
| --- | --- | --- | --- | --- |
| FR-INF-01 | Entorno de desarrollo reproducible con un comando | Must | ⚠️ | `npm run db:up` levanta PostgreSQL; las apps aún se arrancan una a una (sin comando global) |
| FR-INF-02 | Variables de entorno con plantilla por servicio | Must | ✅ | `backend/.env.example` + 4 `.env.example` de servicio + `frontend/.env.example` |
| FR-INF-03 | HTTPS en el entorno demo | Must | ⬜ | Sin despliegue ni proveedor elegido |
| FR-INF-04 | Verificación del proveedor antes de elegirlo | Must | ⬜ | Proveedor pendiente (decisión abierta) |
| FR-INF-05 | Documentación de ejecución actualizada | Must | ⚠️ | READMEs existen; **`backend/README.md` §"Próximos pasos" desactualizado** (ver §12) |
| FR-INF-06 | Kubernetes solo con justificación | Could | ⬜ | Correcto: no aplica todavía (opcional por diseño) |
| NFR-INF-01 | Demo disponible 1-2 meses | Must | ⬜ | Sin publicar |
| NFR-INF-02 | Costos controlados y conocidos | Must | ⬜ | Sin proveedor ni cálculo |
| NFR-INF-03 | Entornos separados (dev ≠ producción) | Must | ⬜ | Solo existe entorno de desarrollo local |
| NFR-INF-04 | Arranque limpio desde cero | Should | ⚠️ | `db:up` + `initdb` + `seed` idempotente funcionan desde cero; el arranque de las apps no está orquestado |

## 9. Notificaciones — `Notifications.md` (12)

> **Estado global:** sin módulo de notificaciones en ningún servicio (no existe carpeta
> `notifications` ni tabla asociada). Todo pendiente.

| Código | Requisito (resumen) | Prioridad | Estado | Evidencia / motivo |
| --- | --- | --- | --- | --- |
| FR-NO-01 | Notificaciones internas en la aplicación | Must | ⬜ | Sin módulo ni tablas |
| FR-NO-02 | Aviso al obtener monedas | Must | ⬜ | Sin módulo |
| FR-NO-03 | Aviso anticipado de vencimiento | Must | ⬜ | Sin módulo (los datos de vencimiento sí existen: FR-BR-02) |
| FR-NO-04 | Aviso de monedas expiradas | Must | ⬜ | Sin módulo |
| FR-NO-05 | Aviso de descuentos disponibles | Should | ⬜ | Sin módulo |
| FR-NO-06 | Confirmación de operaciones (pedido, canje, recarga) | Must | ⬜ | Sin módulo |
| FR-NO-07 | Correo/SMS solo con proveedor configurado | Must | ⬜ | Sin integración de proveedores |
| FR-NO-08 | Identificación clara del remitente | Must | ⬜ | Sin mensajes |
| NFR-NO-01 | Nunca enviar datos sensibles por correo/SMS | Must | ⬜ | Sin canal definido (requisito a aplicar al implementar) |
| NFR-NO-02 | Costo de SMS aprobado antes de habilitarse | Must | ⬜ | Proveedor pendiente |
| NFR-NO-03 | Registro de envíos | Should | ⬜ | Sin envíos |
| NFR-NO-04 | Respetar preferencias del usuario | Could | ⬜ | Sin módulo de preferencias |

## 10. Seguridad — `Security.md` (14)

| Código | Requisito (resumen) | Prioridad | Estado | Evidencia / motivo |
| --- | --- | --- | --- | --- |
| FR-SEC-01 | Contraseñas con hash, nunca en texto plano | Must | ✅ 🧪 | bcrypt en `identity/modules/auth/auth.service.ts` |
| FR-SEC-02 | Operaciones sensibles verifican identidad y permisos | Must | ✅ 🧪 | `authenticate` + `requireRole` en todos los routers protegidos; tests 401 |
| FR-SEC-03 | Todas las entradas validadas antes de procesarse | Must | ✅ | Zod en cada router (FR-BE-02) |
| FR-SEC-04 | Rate limit en endpoints sensibles | Must | ✅ | `express-rate-limit` global en los 4 `app.ts` (`RATE_LIMIT_MAX`) |
| FR-SEC-05 | HTTPS en el entorno publicado | Must | ⬜ | Sin despliegue (junto a FR-INF-03) |
| FR-SEC-06 | CORS restringido a orígenes conocidos | Must | ⚠️ | Mecanismo `CORS_ORIGIN` por lista implementado; **plantilla trae `*`** → política por endurecer antes de publicar |
| FR-SEC-07 | Secretos en variables de entorno, nunca en el repo | Must | ✅ | `.gitignore` excluye `.env*` salvo `.env.example`; solo plantillas en git |
| FR-SEC-08 | Errores sin información interna | Must | ✅ 🧪 | `shared/errors.ts`: `isOperational=false` no expone mensaje ni stack; tests verifican `code` genérico |
| FR-SEC-09 | No registrar contraseñas/tokens/datos sensibles | Must | ✅ | `AppError` prohíbe secretos en `context`; logger pino con campos controlados |
| FR-SEC-10 | Análisis antifraude (Python) complementario | Should | ⬜ | Servicio Python no creado (por diseño: nunca sustituye reglas críticas) |
| NFR-SEC-01 | Pruebas de seguridad básicas antes de desplegar | Must | ⬜ | Sin CI ni checklist de despliegue (lo define `CONTRIBUTING.md` en revisión de PR) |
| NFR-SEC-02 | Revisión de dependencias antes de publicar | Should | ⬜ | Sin proceso (`npm audit` manual) |
| NFR-SEC-03 | Mínimo dato personal | Must | ✅ | Solo `email` y `displayName` en `User`; sin datos bancarios (recargas simuladas) |
| NFR-SEC-04 | Cultura de seguridad en el equipo | Must | ⚠️ | Se establece con `CONTRIBUTING.md` + reglas del SRS; sin revisión recurrente aún |

## 11. Casos de uso — `Casos-de-Uso/` (18)

El estado de un caso de uso es el de **su flujo completo** (backend + interfaz). Un backend
listo con la interfaz sin conectar queda en ⚠️.

| UC | Nombre | Estado | Nota |
| --- | --- | --- | --- |
| UC-01 | Registrarse | ⚠️ | Backend ✅ (`POST /auth/register`); formulario frontend sin enviar |
| UC-02 | Iniciar sesión | ⚠️ | Backend ✅ (login + refresh); frontend sin conectar |
| UC-03 | Consultar el perfil | ⚠️ | Backend ✅ (`/users/me`); `ProfilePage` estática |
| UC-04 | Actualizar el perfil | ⚠️ | Backend ✅ (`PATCH /users/me`); sin formulario real |
| UC-05 | Explorar el catálogo | ⚠️ | Backend ✅; frontend con `mockProducts` |
| UC-06 | Ver el detalle de un producto | ⚠️ | Backend ✅; frontend con datos demo |
| UC-07 | Gestionar el carrito | ⚠️ | Backend ✅ (CRUD carrito); frontend placeholder |
| UC-08 | Crear un pedido | ⚠️ | Checkout ✅; descuento por monedas pendiente (FR-BR-08) |
| UC-09 | Consultar historial de pedidos | ⚠️ | Backend ✅ (`/orders/me`); sin UI |
| UC-10 | Canjear un descuento | ⚠️ | Niveles CRUD ✅; **débito de monedas pendiente** |
| UC-11 | Administrar productos e inventario | ⚠️ | Backend ✅ con rol ADMIN; **sin panel de administración** |
| UC-12 | Jugar una partida (minijuego) | ⚠️ | Sesiones y acreditación ✅ con regla simple; juego Godot y validación real pendientes |
| UC-13 | Hacer una tirada en el gacha | ⚠️ | Backend ✅; sin interfaz de gacha |
| UC-14 | Consultar el monedero | ⚠️ | Backend ✅; frontend solo texto |
| UC-15 | Consultar historial de monedas | ⚠️ | Backend ✅; sin UI |
| UC-16 | Realizar una recarga simulada | ⚠️ | Pagos ✅; **acreditación de monedas compradas pendiente** (FR-BE-21) |
| UC-17 | Consultar avisos internos | ⬜ | Sin módulo de notificaciones |
| UC-18 | Configurar preferencias de aviso | ⬜ | Sin módulo de notificaciones |

---

## 12. Hallazgos, deuda técnica y acciones

### 12.1 Deuda técnica explícita en el código

Hay **3 marcas `TODO(economia)`** en el código (4 líneas contando un comentario de
cabecera) más **2 pendientes descritos en comentarios** sin la etiqueta `TODO`. Todos son del
mismo tipo: **integración entre microservicios** (ningún servicio llama a otro todavía).

| # | Qué falta | Dónde | Tipo | Requisitos |
| --- | --- | --- | --- | --- |
| 1 | Validar y debitar `level.coinsRequired` al confirmar el pedido | `store/…/orders.service.ts:91` | `TODO(economia)` | FR-BE-13, FR-BR-08, FR-BR-14 |
| 2 | Acreditar monedas `PURCHASED` al aprobar el pago | `payments/…/payments.service.ts:176` (y cabecera `:8`) | `TODO(economia)` | FR-BE-21, UC-16 |
| 3 | Acreditación de monedas al completar una recarga | `payments/…/recharges.service.ts:5` | comentario | FR-BE-21 |
| 4 | Validación real de la partida contra el juego | `economy/…/rewards.service.ts:9` | comentario | FR-BE-17, FR-GA-19 |

**Añadidos por auditoría (aunque no estén marcados como `TODO`):**
idempotencia por petición en operaciones de saldo (FR-BE-19, FR-BR-15) y
Dockerfiles de las aplicaciones (NFR-BE-08, FR-INF-01).

### 12.2 Contradicciones detectadas y corregidas

| Contradicción | Acción |
| --- | --- |
| El SRS decía *"la lógica de negocio todavía no está implementada"* con 65 endpoints operativos | §2 y §6 del [README del SRS](./Software-requeriments\(SRS\)/README.md) actualizados para enlazar esta matriz |
| Frontend declara `VITE_API_BASE_URL=http://localhost:3000` y ningún servicio escucha en el 3000 | Registrado en [`API/README.md`](./API/README.md) con los puertos reales (3001-3004) |

### 12.3 Detectado fuera de `documentation/` (requiere autorización para tocarlo)

| Hallazgo | Ubicación |
| --- | --- |
| §"Próximos pasos" lista como pendientes cosas ya implementadas | `backend/README.md:151` |
| Estructura describe módulos como vacíos; ya existen 138 ficheros en backend | `README.MD` §6.1 y §12 |
| `frontend/eslintrc.cjs` es una configuración muerta (ESLint 10 no la lee) | `frontend/eslintrc.cjs` |
| Sin script `format` ni Prettier en frontend (el backend sí) | `frontend/package.json` |

### 12.4 Decisiones pendientes del SRS

El SRS acumula **41 decisiones pendientes** listadas por documento (§8 de cada uno). Las que
bloquean más trabajo: orden de consumo de monedas, coste/probabilidades del gacha, estrategia
de idempotencia, proveedor de despliegue y proveedor de correo/SMS.

---

## 13. Recuento de estados

(Generado a partir de las tablas de §3-§10: se cuentan las columnas de estado.)

| Área | ✅ | ⚠️ | ⬜ | Total |
| --- | ---: | ---: | ---: | ---: |
| Backend | 22 | 7 | 0 | 29 |
| Reglas de negocio | 13 | 5 | 0 | 18 |
| Base de datos | 10 | 2 | 1 | 13 |
| Frontend | 3 | 10 | 4 | 17 |
| Juego | 0 | 6 | 22 | 28 |
| Infraestructura | 1 | 3 | 6 | 10 |
| Notificaciones | 0 | 0 | 12 | 12 |
| Seguridad | 8 | 2 | 4 | 14 |
| **Total** | **57** | **35** | **49** | **141** |

---

*Manténimiento: ver §1. Esta matriz es el puente entre lo que el SRS pide y lo que el
código demuestra; si un día deja de coincidir con el repositorio, es ella la que está mal.*
