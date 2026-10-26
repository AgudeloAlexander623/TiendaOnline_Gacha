# Documentación del backend — GearQuest

> **Para quién es esto:** para quien va a tocar el backend y quiera saber **dónde está
> cada cosa** y **qué reglas tiene que respetar** antes de escribir código.
>
> **Regla de oro del proyecto:** cada servicio es **dueño de su base de datos**. Ningún
> servicio lee ni escribe las tablas de otro. Todo lo que cruce una frontera entre
> servicios pasa por un contrato explícito.

---

## 1. Dónde está la documentación

| Documento | Qué contiene | Dónde vive |
| --- | --- | --- |
| **Contrato de la API pública** | Las 59 operaciones que consumen el frontend y el juego (`openapi.yaml`, 45 rutas) | [`documentation/API/`](../../documentation/API/README.md) |
| **Contrato entre servicios** | Las 6 operaciones internas entre microservicios, con sus esquemas | [`documentation/Contrato-entre-servicios.md`](../../documentation/Contrato-entre-servicios.md) |
| **SRS del backend** | `FR-BE-*` y `NFR-BE-*`: qué debe cumplir cada servicio | [`documentation/Software-requeriments(SRS)/Backend.md`](../../documentation/Software-requeriments(SRS)/Backend.md) |
| **Reglas de negocio** | `FR-BR-*`: monedas, descuentos, vencimientos | [`documentation/Software-requeriments(SRS)/Business-Rules.md`](../../documentation/Software-requeriments(SRS)/Business-Rules.md) |
| **Modelo de datos** | Los 26 modelos Prisma, explicados campo a campo | [`documentation/Diccionario-de-Datos.md`](../../documentation/Diccionario-de-Datos.md) |
| **Trazabilidad** | El estado real de los 164 requisitos (`✅` / `⚠️` / `⬜`) | [`documentation/Trazabilidad.md`](../../documentation/Trazabilidad.md) |
| **Guía del backend** | Convenciones de código, nombres, estilo | [`../README.md`](../README.md) |
| **Catálogo por familias** | Diseño técnico del catálogo de periféricos, licencias y juegos (rutas, modelo de datos, seguridad de las claves) | [`./Catalogo-por-Familias.md`](./Catalogo-por-Familias.md) |

> **Cómo se reparte la documentación entre las dos carpetas:** los **requisitos** (qué debe
> hacer el sistema) viven una sola vez, en `documentation/`; este directorio **apunta** a
> ellos en vez de copiarlos, para que no haya dos verdades que se contradigan.
>
> Lo que **sí** vive en este directorio es el **detalle de implementación** de cada
> módulo: rutas, capas, variables, migraciones y pruebas. Ese detalle cambia con el
> código y no interesa fuera del backend.
>
> La única excepción a esa regla es una funcionalidad que se documenta **entera** en los
> dos sitios porque se lee desde los dos lados: [`Catalogo-por-Familias.md`](./Catalogo-por-Familias.md)
> (detalle técnico, aquí) y
> [`documentation/Catalogo-por-Familias.md`](../../documentation/Catalogo-por-Familias.md)
> (alcance y negocio, a nivel de proyecto). Cada uno tiene su propio índice y su propio
> público; ninguno es copia literal del otro.

---

## 2. Los 4 servicios

| Servicio | Puerto | Base de datos | Módulos | Responsabilidad |
| --- | ---: | --- | --- | --- |
| `identity-service` | 3001 | `gearquest_identity` | `auth`, `users`, `health` | Registro, sesión (JWT), roles, perfil |
| `store-service` | 3002 | `gearquest_store` | `catalog`, `inventory`, `orders`, `discounts`, `health` | Productos, categorías, carrito, pedidos, niveles de descuento |

> **Próximo cambio en `store-service`:** el módulo `catalog` se partirá en **tres
> dominios** (periféricos, licencias, juegos) dentro del mismo servicio, con **un solo
> carrito y un solo pago**. El diseño está en
> [`./Catalogo-por-Familias.md`](./Catalogo-por-Familias.md); **todavía no está en el
> código** (ver la matriz de trazabilidad).
| `economy-service` | 3003 | `gearquest_economy` | `wallet`, `transactions`, `gacha`, `rewards`, `player-inventory`, `health` | Monedero, lotes, movimientos, ruleta, sesiones de aventura, objetos |
| `payments-service` | 3004 | `gearquest_payments` | `packages`, `payments`, `recharges`, `health` | Paquetes de monedas, pagos simulados, recargas |

Cada uno tiene su `package.json`, su `tsconfig.json`, su `prisma/` y su `.env`.

---

## 3. Patrón de un módulo

Todos los módulos del backend siguen la misma estructura, así que si entiendes uno
entiendes todos:

```text
src/modules/<dominio>/
├── <nombre>.schemas.ts      # Esquemas Zod: validación de entrada y de salida
├── <nombre>.repository.ts   # Acceso a Prisma (solo este fichero toca la base)
├── <nombre>.service.ts      # Reglas de negocio (sin saber nada de HTTP)
├── <nombre>.router.ts       # Rutas Express: lee, valida, llama, responde
└── <nombre>.types.ts        # Tipos propios del módulo (si hace falta)
```

**Reglas que se respetan siempre:**

1. El `router` **no** contiene reglas de negocio: valida y delega.
2. El `service` **no** conoce Express: recibe datos y devuelve datos.
3. El `repository` es el **único** que habla con Prisma.
4. Los errores de negocio se lanzan con `AppError` y se traducen en el `errorHandler`
   global, con el formato `{ "code": "...", "message": "..." }`.

---

## 4. Convenciones

- **Puertos y variables:** cada servicio lee su configuración de `process.env` a través de
  `src/config/` (validada con Zod al arrancar). No se leen variables sueltas desde el
  código.
- **Prisma:** el cliente generado va a `src/generated/prisma/` y **no** se versiona.
- **Migraciones:** una por servicio, en `prisma/migrations/`. Se aplican con
  `npm run prisma:deploy`.
- **Seeds:** `prisma/seed.ts` es **idempotente** (se puede ejecutar varias veces sin
  duplicar datos) y usa **datos ficticios**, nunca reales.
- **Estilo:** Prettier y ESLint, ambos con scripts en la raíz del workspace
  (`npm run format`, `npm run lint`).

---

## 5. Qué **no** hay que hacer

- ❌ Escribir en la base de datos de otro servicio (ni leerla).
- ❌ Poner lógica de negocio dentro de un `router`.
- ❌ Dejar `TODO` sinOwner: cada `TODO` debe apuntar a un requisito del SRS.
- ❌ Meter datos reales de personas usuarias en los *seeds*.
- ❌ Exponer por HTTP lo que es interno: las operaciones entre servicios van bajo
  `/internal/*` y se autentican con el token interno (ver el contrato entre servicios).

---

## 6. Documentos relacionados

- [`./Catalogo-por-Familias.md`](./Catalogo-por-Familias.md) — diseño técnico del catálogo
  por familias (periféricos, licencias, juegos) con carrito único.
- [`README.md`](../README.md) — guía de puesta en marcha y comandos del backend.
- [`../../documentation/Trazabilidad.md`](../../documentation/Trazabilidad.md) — qué está
  hecho y qué no, requisito por requisito.
- [`../../documentation/Historias-Tecnicas.md`](../../documentation/Historias-Tecnicas.md) —
  las tareas técnicas que implementan la integración entre servicios y el catálogo por
  familias.

## Cambios API interna economy (2026-10-24)
- Endpoints internos: GET `/internal/wallets/:userId/balance`, POST `/internal/wallets/:userId/debit`, POST `/internal/wallets/:userId/credit`, POST `/internal/game-sessions/:sessionId/validate`
- Autenticación servicio-a-servicio con JWT interno (scopes por operación)
- Idempotencia persistida en BD (`idempotency_keys`) para POST internos
- Débito FIFO por vencimiento con `batchesConsumed`
- Crédito: `PURCHASED` sin vencimiento, `EARNED` con TTL 30 días
- Validación de partida endurecida (FR-BE-17): solo otorga en FINISHED, puntaje acotado, ABANDONED conserva monedas sin items, REJECTED descarta
- Migración: `prisma/migrations/20261024_add_internal_api/migration.sql`
