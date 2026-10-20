# Diccionario de datos — GearQuest

> **Qué es:** la descripción de **cada entidad de la base de datos** (26 modelos en 4
> microservicios), extraída de los `prisma/schema.prisma` reales.
> **Para quién es:** cualquiera que vaya a leer, escribir o consultar datos.
> **Fuente de verdad:** los `schema.prisma` de cada servicio. Este documento los **describe**;
> si alguna vez discrepan, manda el `schema.prisma` (y hay que corregir este documento).

---

## 1. Cómo está organizada la persistencia

GearQuest sigue una **base de datos por servicio** (patrón *database-per-service*):

| Servicio | Base de datos | Modelos | Esquema |
| --- | --- | ---: | --- |
| identity-service | `gearquest_identity` | 3 | `backend/services/identity-service/prisma/schema.prisma` |
| store-service | `gearquest_store` | 10 | `backend/services/store-service/prisma/schema.prisma` |
| economy-service | `gearquest_economy` | 8 | `backend/services/economy-service/prisma/schema.prisma` |
| payments-service | `gearquest_payments` | 5 | `backend/services/payments-service/prisma/schema.prisma` |
| | | **26** | |

**Consecuencias de este diseño (importantes):**

1. **No hay claves foráneas entre servicios.** Un `Order` del store-service guarda un `userId`
   que pertenece al identity-service, pero la base **no** lo puede validar. La integridad
   entre servicios la garantiza el backend (el `userId` viene del JWT verificado).
2. **Los identificadores son UUID v4** (`@id @default(uuid())`) en todos los modelos: no hay
   autoincrementales, así que un id no revela volumen ni permite adivinar el siguiente.
3. **Las fechas son `DateTime`** (Prisma las almacena en UTC); PostgreSQL usa UTF-8.
4. Cada servicio tiene su **migración inicial versionada** (`prisma/migrations/*_init`) y un
   **seed idempotente** (`prisma/seed.ts`) con datos ficticios.

**Convenciones de columnas transversales:** `id` (UUID), `createdAt` (`@default(now())`),
`updatedAt` (`@updatedAt`, solo donde hay edición), `isActive` (borrado lógico donde aplica).

**Convención de nombres:** los modelos se escriben en **PascalCase singular** en Prisma
(`CoinBatch`) y se mapean a **snake_case plural** en la base con `@@map("coin_batches")`.

> El diagrama visual de las relaciones está en
> [`diagramas de flujo/09_modelo_de_datos.svg`](./diagramas%20de%20flujo/09_modelo_de_datos.svg).

---

## 2. identity-service — identidad y sesiones

### 2.1 `User` → tabla `users`
Cuenta de usuario. El email es la credencial única de acceso.

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `email` | String | **Único**, obligatorio | Credencial de acceso (se normaliza a minúsculas) |
| `passwordHash` | String | Obligatorio | Hash bcrypt; **nunca** la contraseña en claro |
| `displayName` | String | Obligatorio | Nombre visible |
| `role` | `UserRole` | `PLAYER` (def.) / `ADMIN` | Permisos |
| `status` | `UserStatus` | `ACTIVE` (def.) / `SUSPENDED` / `PENDING` | Estado de la cuenta |
| `emailVerified` | Boolean | `false` por defecto | Verificación de correo (flujo pendiente) |
| `lastLoginAt` | DateTime? | Opcional | Último acceso correcto |
| `createdAt` / `updatedAt` | DateTime | Auto | Auditoría temporal |

Relaciones: 1–N con `Session` y `AuditLog` (al borrar el usuario, se borran en cascada / se
anulan).

**Enums:** `UserRole = {PLAYER, ADMIN}` · `UserStatus = {ACTIVE, SUSPENDED, PENDING}`

### 2.2 `Session` → tabla `sessions`
Sesión de refresco. **Solo se guarda el hash** del refresh token, nunca el token.

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `userId` | String | FK → `User.id` (cascade) | Dueño de la sesión |
| `tokenHash` | String | **Único** | Hash del refresh token |
| `userAgent` / `ipAddress` | String? | Opcional | Contexto del cliente (auditoría) |
| `expiresAt` | DateTime | Obligatorio | Caducidad del refresh token |
| `revokedAt` | DateTime? | Opcional | Marcado al hacer logout (revocación) |
| `createdAt` | DateTime | Auto | Creación |

Índice: `userId`.

### 2.3 `AuditLog` → tabla `audit_logs`
Registro auditable de acciones relevantes sobre la cuenta.

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `userId` | String? | FK → `User.id` (set null) | Autor (puede quedar nulo si se borra) |
| `action` | String | Obligatorio | Acción realizada (ej. `LOGIN`, `USER_SUSPENDED`) |
| `ipAddress` | String? | Opcional | Origen |
| `metadata` | Json? | Opcional | Detalle adicional (nunca secretos) |
| `createdAt` | DateTime | Auto | Momento |

Índice: `userId`.

---

## 3. store-service — catálogo, inventario, carrito, pedidos y descuentos

### 3.1 `Category` → `categories`
Categoría del catálogo.

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `name` | String | Obligatorio | Nombre |
| `slug` | String | **Único** | Identificador legible en URL |
| `description` | String? | Opcional | Descripción |
| `isActive` | Boolean | `true` por defecto | Borrado lógico |
| `createdAt` / `updatedAt` | DateTime | Auto | Auditoría temporal |

Relaciones: 1–N con `Product`.

### 3.2 `Product` → `products`
Producto del catálogo.

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `sku` | String | **Único** | Código de producto |
| `name` | String | Obligatorio | Nombre |
| `slug` | String | **Único** | Identificador legible en URL |
| `description` | String? | Opcional | Descripción |
| `price` | Decimal(12,2) | Obligatorio | Precio unitario (fuente de verdad; el cliente nunca lo fija) |
| `currency` | String | `COP` por defecto | Moneda ISO-4217 |
| `isActive` | Boolean | `true` por defecto | Borrado lógico |
| `categoryId` | String? | FK → `Category.id` (set null) | Categoría |
| `createdAt` / `updatedAt` | DateTime | Auto | Auditoría temporal |

Relaciones: N–1 con `Category`; 1–N con `ProductImage`, `InventoryMovement`, `CartItem`,
`OrderItem`; 1–1 con `InventoryItem`.
Índice: `categoryId`.

### 3.3 `ProductImage` → `product_images`
Imagen de un producto (varias por producto, con orden).

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `productId` | String | FK → `Product.id` (cascade) | Producto |
| `url` | String | Obligatorio | URL de la imagen |
| `alt` | String? | Opcional | Texto alternativo (accesibilidad) |
| `position` | Int | `0` por defecto | Orden de presentación |

Índice: `productId`.

### 3.4 `InventoryItem` → `inventory_items`
Existencias de un producto (**una fila por producto**).

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `productId` | String | **Único**, FK → `Product.id` (cascade) | Producto (1–1) |
| `stock` | Int | `0` por defecto | Unidades físicas disponibles |
| `reserved` | Int | `0` por defecto | Unidades reservadas |
| `updatedAt` | DateTime | Auto | Última modificación |

**Disponible = `stock − reserved`** (así lo expone la API como `availableStock`).

### 3.5 `InventoryMovement` → `inventory_movements`
Historial inmutable de movimientos de inventario.

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `productId` | String | FK → `Product.id` (cascade) | Producto afectado |
| `type` | `InventoryMovementType` | Obligatorio | `IN` / `OUT` / `RESERVE` / `RELEASE` / `ADJUSTMENT` |
| `quantity` | Int | Obligatorio | Cantidad del movimiento |
| `reason` | String? | Opcional | Motivo (auditoría) |
| `createdAt` | DateTime | Auto | Momento |

Índice: `productId`.
**Enum:** `InventoryMovementType = {IN, OUT, RESERVE, RELEASE, ADJUSTMENT}`

### 3.6 `Cart` → `carts`
Carrito de compra de un usuario.

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `userId` | String | Obligatorio | Dueño (referencia lógica al identity-service) |
| `status` | `CartStatus` | `ACTIVE` (def.) / `CHECKED_OUT` / `ABANDONED` | Estado |
| `createdAt` / `updatedAt` | DateTime | Auto | Auditoría temporal |

Relaciones: 1–N con `CartItem`. Índice: `userId`.
**Enum:** `CartStatus = {ACTIVE, CHECKED_OUT, ABANDONED}`

### 3.7 `CartItem` → `cart_items`
Línea del carrito. Guarda el **precio unitario del momento** (evita que un cambio de precio
altere el carrito ya armado).

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `cartId` | String | FK → `Cart.id` (cascade) | Carrito |
| `productId` | String | FK → `Product.id` (restrict) | Producto |
| `quantity` | Int | Obligatorio (1..99 en la API) | Cantidad |
| `unitPrice` | Decimal(12,2) | Obligatorio | Precio congelado al agregarlo |

Restricción: **único `(cartId, productId)`** → un producto no se duplica en el carrito.

### 3.8 `Order` → `orders`
Pedido confirmado (resultado del checkout).

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `orderNumber` | String | **Único** | Número legible de pedido |
| `userId` | String | Obligatorio | Comprador (referencia lógica) |
| `status` | `OrderStatus` | `PENDING` (def.) | Estado del pedido |
| `subtotal` | Decimal(12,2) | Obligatorio | Suma de líneas |
| `discountAmount` | Decimal(12,2) | `0` por defecto | Descuento aplicado |
| `total` | Decimal(12,2) | Obligatorio | Total a pagar |
| `currency` | String | `COP` por defecto | Moneda |
| `createdAt` / `updatedAt` | DateTime | Auto | Auditoría temporal |

Relaciones: 1–N con `OrderItem`. Índice: `userId`.
**Enum:** `OrderStatus = {PENDING, PAID, SHIPPED, DELIVERED, CANCELLED}`

### 3.9 `OrderItem` → `order_items`
Línea de pedido con **snapshot** del nombre y precio (el pedido no cambia aunque el producto
cambie después).

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `orderId` | String | FK → `Order.id` (cascade) | Pedido |
| `productId` | String | FK → `Product.id` (restrict) | Producto original |
| `nameSnapshot` | String | Obligatorio | Nombre al confirmar |
| `unitPrice` | Decimal(12,2) | Obligatorio | Precio al confirmar |
| `quantity` | Int | Obligatorio | Cantidad |
| `lineTotal` | Decimal(12,2) | Obligatorio | `unitPrice × quantity` |

Índice: `orderId`.

### 3.10 `DiscountLevel` → `discount_levels`
Nivel de descuento canjeable con monedas. **El canje (débito de monedas) todavía no está
implementado** — ver `Trazabilidad.md` §12.1.

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `level` | Int | **Único** | Nivel (1..5) |
| `percentage` | Int | Obligatorio | Porcentaje de descuento (10..90) |
| `coinsRequired` | Int | Obligatorio | Monedas que cuesta canjearlo |
| `description` | String? | Opcional | Descripción |
| `isActive` | Boolean | `true` por defecto | Borrado lógico |
| `createdAt` / `updatedAt` | DateTime | Auto | Auditoría temporal |

---

## 4. economy-service — monedero, movimientos, gacha y juego

### 4.1 `Wallet` → `wallets`
Monedero del usuario (**uno por usuario**). No guarda el saldo: el saldo se calcula.

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `userId` | String | **Único** | Dueño (referencia lógica al identity-service) |
| `createdAt` / `updatedAt` | DateTime | Auto | Auditoría temporal |

Relaciones: 1–N con `CoinBatch`, `CoinTransaction`, `GachaPull`, `PlayerItem`, `GameSession`.

> **Por qué no hay columna `balance`:** el saldo se **deriva** de la suma de lotes vigentes
> (`sumActiveBatches`). Guardarlo como columna sería un dato duplicado que puede desincronizarse.

### 4.2 `CoinBatch` → `coin_batches`
Lote de monedas. **Es la pieza clave del modelo de vencimiento.**

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `walletId` | String | FK → `Wallet.id` (cascade) | Monedero |
| `type` | `CoinType` | `EARNED` / `PURCHASED` | Origen de las monedas |
| `source` | String | Obligatorio | De dónde vienen (ej. `GACHA`, `MINIGAME`, `RECHARGE`) |
| `originalAmount` | Int | Obligatorio | Cantidad inicial del lote |
| `remainingAmount` | Int | Obligatorio | Lo que queda sin gastar |
| `expiresAt` | DateTime? | **`null` = no caduca** | Vencimiento (ganadas: +30 días; compradas: nulo) |
| `status` | `CoinBatchStatus` | `ACTIVE` (def.) / `DEPLETED` / `EXPIRED` | Estado |
| `createdAt` | DateTime | Auto | Creación |

Índices: `walletId`, `expiresAt`.
**Enum:** `CoinType = {EARNED, PURCHASED}` · `CoinBatchStatus = {ACTIVE, DEPLETED, EXPIRED}`

### 4.3 `CoinTransaction` → `coin_transactions`
**Libro mayor de monedas (append-only).** Nunca se edita ni se borra una fila; cada
movimiento deja el saldo resultante (`balanceAfter`) para poder reconstruir la historia.

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `walletId` | String | FK → `Wallet.id` (cascade) | Monedero |
| `type` | `CoinTransactionType` | `CREDIT` / `DEBIT` / `EXPIRE` / `ADJUSTMENT` | Tipo de movimiento |
| `coinType` | `CoinType` | Obligatorio | Tipo de moneda afectada |
| `amount` | Int | Obligatorio | Cantidad (+/−) |
| `balanceAfter` | Int | Obligatorio | Saldo resultante tras el movimiento |
| `referenceType` / `referenceId` | String? | Opcional | Origen (ej. `GACHA_PULL`, id de la tirada) |
| `description` | String? | Opcional | Texto legible |
| `createdAt` | DateTime | Auto | Momento |

Índice: `walletId`.
**Enum:** `CoinTransactionType = {CREDIT, DEBIT, EXPIRE, ADJUSTMENT}`

### 4.4 `GachaBanner` → `gacha_banners`
Banner (máquina) de la ruleta.

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `name` | String | Obligatorio | Nombre |
| `slug` | String | **Único** | Identificador legible |
| `description` | String? | Opcional | Descripción |
| `costPerPull` | Int | Obligatorio | Coste de una tirada en monedas |
| `isActive` | Boolean | `true` por defecto | Disponibilidad |
| `startsAt` / `endsAt` | DateTime? | Opcional | Ventana de vigencia |
| `createdAt` / `updatedAt` | DateTime | Auto | Auditoría temporal |

Relaciones: 1–N con `GachaReward` y `GachaPull`.

### 4.5 `GachaReward` → `gacha_rewards`
Premio posible de un banner. **El `weight` define la probabilidad** (sorteo ponderado en el
servidor; las probabilidades concretas están pendientes de definir).

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `bannerId` | String | FK → `GachaBanner.id` (cascade) | Banner |
| `name` | String | Obligatorio | Nombre del premio |
| `rarity` | `Rarity` | `COMMON` / `RARE` / `EPIC` / `LEGENDARY` | Rareza |
| `rewardType` | `GachaRewardType` | `COIN` / `ITEM` / `NOTHING` | Qué entrega |
| `coinValue` | Int? | Opcional | Monedas si es de tipo `COIN` |
| `itemName` | String? | Opcional | Objeto si es de tipo `ITEM` |
| `weight` | Int | Obligatorio | Peso relativo del sorteo |
| `isActive` | Boolean | `true` por defecto | Disponibilidad |
| `createdAt` | DateTime | Auto | Creación |

Índice: `bannerId`.
**Enums:** `Rarity = {COMMON, RARE, EPIC, LEGENDARY}` · `GachaRewardType = {COIN, ITEM, NOTHING}`

### 4.6 `GachaPull` → `gacha_pulls`
Registro de cada tirada (auditoría del gacha).

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `bannerId` | String | FK → `GachaBanner.id` (restrict) | Banner jugado |
| `walletId` | String | FK → `Wallet.id` (cascade) | Monedero que pagó |
| `rewardId` | String? | FK → `GachaReward.id` (set null) | Premio obtenido (nulo si no hubo) |
| `costCoins` | Int | Obligatorio | Coste cobrado |
| `isWin` | Boolean | Obligatorio | ¿Hubo premio? |
| `createdAt` | DateTime | Auto | Momento |

### 4.7 `PlayerItem` → `player_items`
Objeto del inventario del jugador (obtenido en el gacha u otras fuentes).

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `walletId` | String | FK → `Wallet.id` (cascade) | Dueño |
| `name` | String | Obligatorio | Nombre del objeto |
| `rarity` | `Rarity` | Obligatorio | Rareza |
| `quantity` | Int | `1` por defecto | Cantidad |
| `source` | `GameType` | Obligatorio | De dónde se obtuvo |
| `acquiredAt` | DateTime | Auto | Adquisición |
| `expiresAt` | DateTime? | Opcional | Vencimiento (si lo tuviera) |

Índice: `walletId`.

### 4.8 `GameSession` → `game_sessions`
Sesión de juego usada para **validar resultados en el servidor** (el juego nunca acredita
monedas por su cuenta).

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `walletId` | String | FK → `Wallet.id` (cascade) | Monedero |
| `gameType` | `GameType` | `GACHA` / `MINIGAME` | Tipo de juego |
| `status` | `GameSessionStatus` | `STARTED` (def.) | Estado |
| `score` | Int? | Opcional | Puntaje reportado |
| `coinsAwarded` | Int | `0` por defecto | Monedas acreditadas |
| `startedAt` / `finishedAt` | DateTime | Auto / opcional | Ventana de la partida |

Índice: `walletId`.
**Enums:** `GameType = {GACHA, MINIGAME}` · `GameSessionStatus = {STARTED, FINISHED, ABANDONED, REJECTED}`

---

## 5. payments-service — paquetes, pagos y recargas

### 5.1 `CoinPackage` → `coin_packages`
Paquete de monedas ofrecido en las recargas **simuladas**.

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `name` | String | Obligatorio | Nombre |
| `slug` | String | **Único** | Identificador legible |
| `coins` | Int | Obligatorio | Monedas que entrega |
| `price` | Decimal(12,2) | Obligatorio | Precio simulado |
| `currency` | String | `COP` por defecto | Moneda |
| `isActive` | Boolean | `true` por defecto | Disponibilidad |
| `createdAt` / `updatedAt` | DateTime | Auto | Auditoría temporal |

Relaciones: 1–N con `Recharge`.

### 5.2 `Payment` → `payments`
Intento de pago (siempre **simulado** en desarrollo).

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `userId` | String | Obligatorio | Pagador (referencia lógica) |
| `orderId` | String? | Opcional | Pedido asociado (referencia lógica al store-service) |
| `amount` | Decimal(12,2) | Obligatorio | Importe |
| `currency` | String | `COP` por defecto | Moneda |
| `provider` | `PaymentProvider` | `MOCK` por defecto | Pasarela (`MOCK` = simulada) |
| `status` | `PaymentStatus` | `PENDING` por defecto | Estado |
| `externalId` | String? | Opcional | Id en la pasarela |
| `failureReason` | String? | Opcional | Motivo de rechazo |
| `createdAt` / `updatedAt` | DateTime | Auto | Auditoría temporal |

Relaciones: 1–N con `Recharge`, `PaymentEvent`, `Refund`. Índice: `userId`.
**Enums:** `PaymentProvider = {MOCK, STRIPE, MERCADOPAGO}` ·
`PaymentStatus = {PENDING, APPROVED, REJECTED, REFUNDED, CANCELLED}`

### 5.3 `Recharge` → `recharges`
Recarga concreta: liga un paquete con un pago. **La acreditación de monedas en el
economy-service está pendiente** (`FR-BE-21`).

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `userId` | String | Obligatorio | Usuario |
| `packageId` | String | FK → `CoinPackage.id` (restrict) | Paquete |
| `paymentId` | String | FK → `Payment.id` (cascade) | Pago asociado |
| `coins` | Int | Obligatorio | Monedas de la recarga |
| `amountPaid` | Decimal(12,2) | Obligatorio | Importe pagado |
| `currency` | String | `COP` por defecto | Moneda |
| `status` | `RechargeStatus` | `PENDING` por defecto | Estado |
| `createdAt` / `updatedAt` | DateTime | Auto | Auditoría temporal |

Índices: `userId`, `paymentId`.
**Enum:** `RechargeStatus = {PENDING, COMPLETED, FAILED, REFUNDED}`

### 5.4 `PaymentEvent` → `payment_events`
Eventos del ciclo de vida de un pago (trazabilidad de la pasarela).

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `paymentId` | String | FK → `Payment.id` (cascade) | Pago |
| `type` | String | Obligatorio | Tipo de evento |
| `payload` | Json? | Opcional | Carga del evento |
| `createdAt` | DateTime | Auto | Momento |

Índice: `paymentId`.

### 5.5 `Refund` → `refunds`
Reembolso de un pago.

| Campo | Tipo | Reglas | Descripción |
| --- | --- | --- | --- |
| `id` | String | PK, UUID | Identificador |
| `paymentId` | String | FK → `Payment.id` (cascade) | Pago reembolsado |
| `amount` | Decimal(12,2) | Obligatorio | Importe reembolsado |
| `reason` | String? | Opcional | Motivo |
| `createdAt` | DateTime | Auto | Momento |

Índice: `paymentId`.

---

## 6. Reglas de integridad que conviene recordar

| Regla | Dónde | Por qué importa |
| --- | --- | --- |
| `User.email` único | identity | Evita cuentas duplicadas |
| `Session.tokenHash` único | identity | Un refresh token, una sesión |
| `Product.sku` y `Product.slug` únicos | store | Identificación inequívoca |
| `InventoryItem.productId` único | store | Relación 1–1 producto↔existencias |
| `@@unique([cartId, productId])` | store | Un producto no se duplica en el carrito |
| `CartItem.unitPrice` y `OrderItem.*Snapshot` | store | Congelan precios: el histórico no cambia |
| `Wallet.userId` único | economy | Un monedero por usuario |
| `CoinBatch.expiresAt` (índice) | economy | Las ganadas caducan; las compradas no |
| `CoinTransaction` append-only | economy | Auditoría reproducible del saldo |
| `GachaReward.weight` | economy | Sorteo ponderado en servidor |
| `Recharge.packageId` con `restrict` | payments | No se borra un paquete con recargas |
| `Payment.provider` por defecto `MOCK` | payments | Recargas claramente simuladas |

## 7. Referencias entre servicios (sin clave foránea)

Estos campos apuntan a entidades de **otro** servicio. La base no los valida; el backend los
comprueba (normalmente vienen del JWT verificado).

| Campo | En | Apunta a | Servicio destino |
| --- | --- | --- | --- |
| `Cart.userId`, `Order.userId` | store | `User.id` | identity |
| `Wallet.userId` | economy | `User.id` | identity |
| `Payment.userId`, `Recharge.userId` | payments | `User.id` | identity |
| `Payment.orderId` | payments | `Order.id` | store |

---

*Este diccionario se mantiene junto al código: si cambias un `schema.prisma`, actualizas su
tabla aquí y regeneras el diagrama
([`diagramas de flujo/09_modelo_de_datos.svg`](./diagramas%20de%20flujo/09_modelo_de_datos.svg)).*
