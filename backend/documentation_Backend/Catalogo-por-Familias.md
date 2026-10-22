# Catálogo por familias — store-service

> **Para quién es esto:** para quien va a implementar la **página de ventas** del
> frontend y necesite saber cómo queda el catálogo del `store-service` después de
> separarlo en **periféricos**, **licencias** y **juegos**.
>
> **Estado:** diseño aprobado · **Ninguna de estas tablas existe todavía en el código.**
> Este documento es el contrato de trabajo de las fases 2 a 7 (ver §10).
>
> **Decisión asociada:** [ADR-0017](../../documentation/Decisiones.md)
> — *«Catálogo por familias dentro de store-service, con un solo carrito y un solo pago»*.

---

## 1. Por qué existe este documento

El catálogo actual tiene **un solo tipo de producto**: periféricos. Cada producto es una
fila de la tabla `products` con `sku`, `nombre`, `precio`, `imágenes` y `stock`.

El negocio quiere **tres cosas distintas** en la misma tienda:

| Familia | Qué es | Atributos que **no** aplican a las otras |
| --- | --- | --- |
| **Periférico** | Teclado, ratón, monitor, auriculares | tipo de conexión, DPI, nº de teclas, garantía, compatibilidad |
| **Licencia** | Clave de software que la plataforma revende | clave, activaciones máximas, expiración, plataforma, tipo de licencia |
| **Juego** | Juego que la plataforma revende | género, plataforma, clasificación por edad, desarrollador, fecha de salida |

Meterlos en la misma tabla produce **campos `null` por todas partes** y lógica condicional
en cada consulta (`if (product.kind === "LICENSE") …`). Separarlos da a cada familia sus
**propios atributos, sus propias reglas y su propio tipo de error**, sin tocar los de las
demás.

> **Lo que NO cambia:** el **carrito**, el **pedido**, el **inventario** y los **descuentos**
> siguen siendo los de hoy. Hay **un solo carrito y un solo pago**, con las tres familias
> mezcladas dentro. Ese fue el criterio que decidió el diseño.

---

## 2. La decisión, en una línea

> **Un solo servicio (`store-service`), tres dominios separados dentro, un solo carrito.**

El porqué de esa elección y las alternativas descartadas están en el
[ADR-0017](../../documentation/Decisiones.md). Lo que le afecta al que programa:

- **No se crea ningún servicio nuevo.** Ni base de datos, ni puerto, ni configuración.
- Los **nombres de ruta ya son los del futuro microservicio**
  (`/api/v1/peripherals` ↔ `peripherals-service`), así que la extracción posterior no
  obliga a renumerar nada.
- La **lógica compartida no se duplica**: un único `catalog.service.ts` recibe el `kind` y
  los tres routers lo fijan.

---

## 3. Familias y atributos propios

El discriminador es el enum `ProductKind`:

```prisma
enum ProductKind {
  PERIPHERAL
  LICENSE
  GAME
}
```

`Product` (la tabla base) gana una columna `kind`. Cada familia añade **una tabla de
atributos** en relación 1–1 con `Product`:

| Familia | Tabla de atributos | Campos propios |
| --- | --- | --- |
| Periférico | `PeripheralSpec` | `connectionType`, `dpi`, `switches`, `warrantyMonths`, `compatibility` |
| Licencia | `LicenseSpec` | `platform`, `licenseType`, `durationDays`, `activationLimit` |
| Juego | `GameSpec` | `genre`, `platform`, `ageRating`, `developer`, `publisher`, `releaseDate` |

`Category` gana `kind` **opcional**: `null` significa «categoría transversal» (por ejemplo
*Accesorios*), y con valor significa «categoría de esa familia».

### 3.1 Licencias: dos niveles de datos

Las licencias necesitan **dos** tablas porque su información vive en dos niveles:

```prisma
/// Qué es esta licencia (descripción del producto).
model LicenseSpec {
  productId       String  @id
  platform        String? // "WINDOWS" | "MAC" | "LINUX" | "STEAM"
  licenseType     String? // "PERPETUA" | "SUSCRIPCION" | "PRUEBA"
  durationDays    Int?    // vigencia; null = perpetua
  activationLimit Int     @default(1)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("license_specs")
}

/// Una unidad concreta en stock: la clave que se entrega al comprador.
model LicenseKey {
  id              String    @id @default(uuid())
  productId       String
  keyCiphertext   String // 🔒 secreto cifrado en reposo; nunca sale en listados
  activationsUsed Int       @default(0)
  isRevoked       Boolean   @default(false)
  deliveredAt     DateTime?
  orderItemId     String? // pedido en el que se entregó (null = sin vender)
  createdAt       DateTime  @default(now())

  product   Product    @relation(fields: [productId], references: [id], onDelete: Restrict)
  orderItem OrderItem? @relation(fields: [orderItemId], references: [id], onDelete: SetNull)

  @@index([productId])
  @@map("license_keys")
}
```

**Por qué dos tablas y no una:** `LicenseSpec` describe *el producto* (lo que ve el
cliente en el catálogo) y `LicenseKey` describe *cada unidad en stock* (lo que se entrega
y se consume). El `stock` de una licencia es el **número de `LicenseKey` disponibles**, no
un entero suelto: por eso una licencia agotada es "no quedan claves", no "stock = 0".

**Vencimiento:** la clave no tiene columna `expiresAt` porque se **deriva**:
`deliveredAt + LicenseSpec.durationDays`. Si `durationDays` es `null`, la licencia es
perpetua. Una sola fuente de verdad para la regla.

---

## 4. Modelo de datos resultante

```text
  Category ──┬── (kind opcional: transversal o de una familia)
             │
  Product ───┼── ProductImage        (comunes a las 3 familias)
    (kind)   ├── InventoryItem       (común: el stock)
             ├── InventoryMovement   (común: historial auditable)
             ├── PeripheralSpec      (1–1, solo si kind = PERIPHERAL)
             ├── LicenseSpec         (1–1, solo si kind = LICENSE)
             ├── LicenseKey          (1–N, solo si kind = LICENSE)
             └── GameSpec            (1–1, solo si kind = GAME)
```

`CartItem` y `OrderItem` **no cambian**: siguen apuntando a `Product` con clave foránea
real. Eso es lo que permite el **carrito único**:

- `CartItem.productId` → FK a `products`
- `OrderItem.productId` → FK a `products`, más `nameSnapshot` y `unitPrice` (el snapshot
  que ya existía y que sigue siendo la base del "precio en el momento de la compra")

> **Deuda que esta fase deja anotada:** cuando se extraiga cada familia a su propio
> servicio, la tabla `products` habrá que **partirla** en tres. Está anotado en el
> ADR-0017 y en la matriz de trazabilidad; no se resuelve ahora porque hacerlo antes
> costaría integridad referencial en el carrito a cambio de una comodidad futura.

---

## 5. Endpoints

### 5.1 Periféricos — `/api/v1/peripherals`

| Método | Ruta | Acceso | Qué hace |
| --- | --- | --- | --- |
| `GET` | `/api/v1/peripherals` | público | Lista paginada; filtros `connectionType`, `categoryId`, `search`, `page`, `pageSize` |
| `GET` | `/api/v1/peripherals/slug/:slug` | público | Detalle por slug |
| `GET` | `/api/v1/peripherals/:id` | público | Detalle por id |
| `POST` | `/api/v1/peripherals` | `ADMIN` | Crea un periférico |
| `PATCH` | `/api/v1/peripherals/:id` | `ADMIN` | Edita el periférico |
| `DELETE` | `/api/v1/peripherals/:id` | `ADMIN` | Lo **desactiva** (no borra) |

### 5.2 Licencias — `/api/v1/licenses`

| Método | Ruta | Acceso | Qué hace |
| --- | --- | --- | --- |
| `GET` | `/api/v1/licenses` | público | Lista paginada; filtros `platform`, `licenseType`, `search`. **Nunca** incluye la clave |
| `GET` | `/api/v1/licenses/slug/:slug` | público | Detalle por slug, sin clave |
| `GET` | `/api/v1/licenses/:id` | público | Detalle por id, sin clave |
| `POST` | `/api/v1/licenses` | `ADMIN` | Crea la licencia y su primer lote de claves |
| `PATCH` | `/api/v1/licenses/:id` | `ADMIN` | Edita los datos del **producto** (no las claves ya vendidas) |
| `DELETE` | `/api/v1/licenses/:id` | `ADMIN` | La desactiva |
| `GET` | `/api/v1/licenses/:id/keys` | `ADMIN` | Estado de las claves: cuántas quedan, activaciones usadas, revocadas. **Sin el valor de la clave** |
| `POST` | `/api/v1/licenses/:id/keys` | `ADMIN` | Repone claves (abastece stock) |

### 5.3 Juegos — `/api/v1/games`

| Método | Ruta | Acceso | Qué hace |
| --- | --- | --- | --- |
| `GET` | `/api/v1/games` | público | Lista paginada; filtros `genre`, `platform`, `ageRating`, `search` |
| `GET` | `/api/v1/games/slug/:slug` | público | Detalle por slug |
| `GET` | `/api/v1/games/:id` | público | Detalle por id |
| `POST` | `/api/v1/games` | `ADMIN` | Crea un juego |
| `PATCH` | `/api/v1/games/:id` | `ADMIN` | Edita el juego |
| `DELETE` | `/api/v1/games/:id` | `ADMIN` | Lo desactiva |

### 5.4 Entrega de la clave comprada — `/api/v1/orders`

| Método | Ruta | Acceso | Qué hace |
| --- | --- | --- | --- |
| `GET` | `/api/v1/orders/:id/license-keys` | **solo el dueño del pedido** | Devuelve las claves compradas en ese pedido, descifradas |

### 5.5 Lo que desaparece del contrato público

| Ruta actual | Qué pasa | Por qué |
| --- | --- | --- |
| `GET/POST/PATCH/DELETE /api/v1/products` | **Se elimina** | Era el catálogo genérico de una sola familia. Ahora cada familia tiene su prefijo |
| `GET /api/v1/products/slug/:slug` | **Se elimina** | Ídem |

**No rompe a nadie:** el frontend tiene hoy **0 llamadas HTTP** (`FR-FE-10` ⬜), así que no
hay consumidor real que migre. Aun así es un cambio **rompedor** y va anotado como tal en
el `CHANGELOG.md`.

`/api/v1/categories` **se mantiene** tal cual, con un filtro opcional `?kind=`.

**Recuento del contrato después de este trabajo:** de **59 operaciones en 45 rutas** a
**74 operaciones en 53 rutas**.

---

## 6. Capas de archivos

El módulo `catalog` pasa de tener `products.*` a tener una base compartida y tres
*routers* que fijan su familia:

```text
src/modules/catalog/
├── catalog.types.ts        # ProductKind y tipos de cada familia
├── catalog.schemas.ts      # Zod: base común + atributos por familia
├── catalog.service.ts      # lógica compartida; recibe `kind`
├── catalog.repository.ts   # acceso a Prisma (kind-aware)
├── peripherals.router.ts   # fija kind = PERIPHERAL
├── licenses.router.ts      # fija kind = LICENSE
├── games.router.ts         # fija kind = GAME
├── categories.router.ts    # (existente, sin cambios de ruta)
├── categories.schemas.ts
└── categories.service.ts
```

**Reglas que no se rompen:**

1. El `router` **valida y delega**; no lleva reglas de negocio.
2. El `service` **no conoce Express**: recibe `kind` + datos y devuelve datos.
3. El `repository` es el **único** que habla con Prisma.
4. Los errores de negocio se lanzan con `AppError` y el `errorHandler` global los traduce
   a `{ "code": "...", "message": "..." }`.
5. **Los tres routers llaman al mismo `service`**: cambia el `kind`, no la lógica. Tres
   dominios **no** son tres copias del mismo código.

> ⚠️ **Divergencia detectada durante esta fase:** hoy el `store-service` usa Prisma
> **directamente en los `*.service.ts`** (`products.service.ts`, `carts.service.ts`,
> `orders.service.ts`, `inventory.service.ts`, `discounts.service.ts`,
> `categories.service.ts`), aunque el README del backend describe un
> `*.repository.ts` por módulo. El `catalog.repository.ts` de esta fase **sí** sigue el
> patrón; los demás módulos quedan como están y la unificación se anota como deuda.

---

## 7. Seguridad de las licencias — el punto delicado

La clave de licencia es **un secreto**. Una clave filtrada es una venta perdida y un
soporte de por vida. Estas reglas no son opcionales:

| # | Regla | Cómo se cumple |
| --- | --- | --- |
| 1 | **Nunca en los listados** | Ningún esquema de salida de catálogo incluye `keyCiphertext`. El campo no se serializa nunca |
| 2 | **Cifrada en reposo** | Se guarda cifrada con `LICENSE_KEY_ENCRYPTION_KEY`; el texto claro solo existe en memoria, al descifrar para entregar |
| 3 | **Nunca en los logs** | `AppError` prohíbe secretos en `context`; la clave no se imprime ni en errores ni en trazas |
| 4 | **Solo su dueño la ve** | `GET /api/v1/orders/:id/license-keys` comprueba que el pedido sea del usuario que pregunta |
| 5 | **El administrador ve el estado, no el valor** | `GET /api/v1/licenses/:id/keys` devuelve cuántas hay y cuántas se usaron, nunca el texto |
| 6 | **Una clave se entrega una vez por pedido** | Al confirmar el pedido se marca `deliveredAt` y se enlaza al `OrderItem`; una clave entregada no se puede reasignar |
| 7 | **Activación limitada** | `LicenseSpec.activationLimit` es el tope; `LicenseKey.activationsUsed` cuenta las activaciones |
| 8 | **Revocable** | `isRevoked` permite anular una clave sin borrar el histórico |

**Variable de entorno nueva** (fase 3):

```bash
# store-service/.env.example
LICENSE_KEY_ENCRYPTION_KEY=dev-only-32-byte-key-change-me-in-production
```

> En producción esta clave **nunca** se versiona: vive fuera del repositorio (ver
> [ADR-0013](../../documentation/Decisiones.md)
> y la [política de seguridad documental](../../documentation/Politica-de-Seguridad-Documental.md)).
> Rotar la clave obliga a re-cifrar las claves existentes: eso es una decisión pendiente
> (ver §12).

---

## 8. Configuración

Solo hay **una variable nueva** para el `store-service`. Todo lo demás sigue igual:

| Variable | ¿Nueva? | Para qué |
| --- | --- | --- |
| `LICENSE_KEY_ENCRYPTION_KEY` | ✅ nueva | Cifrar y descifrar las claves de licencia |

Las demás (`PORT`, `SERVICE_NAME`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`,
`RATE_LIMIT_MAX`, `LOG_LEVEL`) **no cambian**. La validación con Zod de
`src/config/config.ts` es la que se encarga de exigirla al arrancar.

> **Por qué no hay variables por familia:** mientras las tres familias vivan en el mismo
> servicio, el mismo esquema y la misma base, elSepararlas en variables distintas sería
> ruido. Cuando se extraigan a servicios separados, cada uno traerá las suyas.

---

## 9. Cómo se migra (orden reversible)

El orden importa: primero los datos, después el contrato, después el código. Al revés se
rompe el frontend.

| Paso | Qué | Por qué en este orden |
| --- | --- | --- |
| 1 | Migración Prisma: `ProductKind`, `kind`, `Category.kind`, `PeripheralSpec`, `LicenseSpec`, `LicenseKey`, `GameSpec` | Los datos primero: el código nuevo necesita las tablas |
| 2 | `kind = PERIPHERAL` por defecto para los productos existentes | Nadie pierde el catálogo actual |
| 3 | Seed idempotente con datos ficticios de las 3 familias | Sin datos no se puede probar el filtro por familia |
| 4 | `catalog.service.ts` *kind-aware* + los 3 routers | La lógica compartida, una sola vez |
| 5 | `openapi.yaml` con las rutas nuevas | El contrato antes que el código publicado |
| 6 | `vite.config.ts`: prefijos `/api/v1/peripherals`, `/api/v1/licenses`, `/api/v1/games` | Sin esto el frontend no llega |
| 7 | `Diccionario-de-Datos.md` + regenerar el diagrama 09 | La documentación refleja lo que ya existe |
| 8 | Pruebas y verde de `lint` + `typecheck` + `test` | Lo que no se demuestra, no existe |

---

## 10. Lo que **no** cambia

Para que nadie rehaga trabajo ya hecho:

| Módulo | Estado |
| --- | --- |
| **Carrito** (`/api/v1/carts`) | Igual. Acepta artículos de las 3 familias |
| **Pedidos** (`/api/v1/orders`) | Igual. Un pedido puede mezclar familias |
| **Inventario** (`/api/v1/inventory`) | Igual. El stock de una licencia es el número de claves disponibles, pero la tabla sigue siendo `InventoryItem` |
| **Descuentos** (`/api/v1/discounts`) | Igual |
| **`economy-service`** | **No se toca.** Es el que conecta con el juego (monedero, ruleta, recompensas, sesiones de aventura) |
| **`identity-service` / `payments-service`** | No se tocan |

---

## 11. Pruebas que hay que escribir

| # | Prueba | Qué demuestra |
| --- | --- | --- |
| 1 | Un `GET /api/v1/peripherals` **no** devuelve productos de las otras familias | El filtro por `kind` funciona |
| 2 | Un `GET /api/v1/licenses` **no** contiene ningún campo con la clave | La regla nº 1 de §7 |
| 3 | Un `GET /api/v1/orders/:id/license-keys` de **otro** usuario devuelve `403` | La regla nº 4 de §7 |
| 4 | Un carrito con artículos de las 3 familias se confirma en **un** pedido | El carrito único |
| 5 | El checkout **revalida** precio y stock contra el catálogo correcto | El cliente no fija el precio (FR-BE-28) |
| 6 | Crear una licencia **exige** sus atributos propios (Zod discriminado) | No se cuela un periférico con atributos de juego |
| 7 | La clave en reposo **no** es el texto claro en la base de datos | La regla nº 2 de §7 |

Las pruebas 1, 2 y 7 son las **críticas**: son las que@Slfían perder una venta.

---

## 12. Riesgos y deuda que deja esta fase

| # | Riesgo o deuda | Por qué importa | Dónde se anota |
| --- | --- | --- | --- |
| 1 | Extraer las familias a microservicios obligará a **partir la tabla `products`** | La FK del carrito apunta a la base común | ADR-0017, `Trazabilidad.md` §12.1 |
| 2 | **Rotar** `LICENSE_KEY_ENCRYPTION_KEY` obliga a re-cifrar las claves guardadas | Sin procedure, una rotación deja las licencias ilegibles | Decisión pendiente (SRS de base de datos) |
| 3 | `InventoryItem` es **global y sin dueño** | Hoy no hay revendedores externos (la plataforma revende), pero el modelo no lo soporta si mañana los hay | `Trazabilidad.md` §12.1 |
| 4 | El `store-service` usa Prisma en los `service`, no en un `repository` | La convención del README no se cumple en este servicio | §6 de este documento |
| 5 | «Juego» en el catálogo **choca** con «la aventura» de `Game.md` | Dos cosas distintas con el mismo nombre | `Glosario.md` (términos *Juego en catálogo* y *Aventura*) |
| 6 | El `stock` de una licencia son **claves en stock**, no un entero | `InventoryItem.stock` y el número de claves tienen que coincidir | Fase 2 (seed y checkout) |

---

## 13. Referencias

- [ADR-0017](../../documentation/Decisiones.md) — la decisión de arquitectura y sus
  alternativas descartadas.
- [`documentation/Catalogo-por-Familias.md`](../../documentation/Catalogo-por-Familias.md) —
  la versión de este documento a nivel de proyecto (alcance, negocio y fases).
- [Contrato de la API](../../documentation/API/openapi.yaml) — la fuente de verdad de las
  rutas y las formas.
- [`Diccionario de datos`](../../documentation/Diccionario-de-Datos.md) — se actualiza en la
  fase 7, cuando las tablas existan.
- [`Trazabilidad`](../../documentation/Trazabilidad.md) — el estado real de cada requisito.
- [`README.md`](./README.md) — índice de la documentación del backend.
