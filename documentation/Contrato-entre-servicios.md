# Contrato entre servicios — GearQuest

> **Para quién es esto:** para quien programe la comunicación entre los microservicios.
> **Qué resuelve:** hoy los 4 servicios **no se hablan** (0 llamadas). Este documento define
> **cómo** deben hablarse: qué operación, qué datos y qué respuesta, para que no se improvise
> una integración distinta en cada punto.
> **Complementa a:** el [`openapi.yaml`](./API/openapi.yaml) (contrato **público**, hacia el
> frontend/juego) y el [SRS](./Software-requeriments\(SRS\)/README.md) (las reglas).
> **Estado:** **propuesto** — describe el diseño acordado, aún no implementado. Se traza en
> [`Trazabilidad.md`](./Trazabilidad.md) §12.1 (deuda de integración).
>
> **Alcance:** 6 operaciones internas — 4 de dinero (`§4`–`§7`) y 2 de juego y avisos
> (`§8`, `§9`). Las 4 primeras existían desde la v1.0 de este documento; las 2 últimas se
> añadieron en la v1.1 para cubrir el canje del mercader (`FR-BE-22`) y los avisos internos
> (`FR-NO-10`).

---

## 1. Por qué hace falta un contrato interno (para juniors)

Un microservicio es como una tienda con **varias cajas independientes**. Cada caja lleva su
propia contabilidad, y para cobrar bien **necesita pedirle datos a otra caja**:

```text
   store-service          "¿este cliente tiene monedas para el descuento?"
        │
        └────── pregunta ──────▶  economy-service
        ◀────── responde ───────       "sí, y ya te las desconté"
```

Ese «pregunta y responde» es una **API interna**. Y como toda API, necesita contrato: si
`store` inventa el formato y `economy` espera otro, la integración falla.

> **Diferencia clave:**
> - **Contrato público** (`openapi.yaml`) → lo usa el **frontend** y el **juego**.
> - **Contrato interno** (este documento) → lo usan los **servicios entre sí**.

**Regla base del proyecto (ADR):** cada servicio es dueño de **su** base de datos. Ningún
servicio lee ni escribe las tablas de otro directamente. **Todo pasa por este contrato.**

---

## 2. Principios de la comunicación entre servicios

1. **Síncrona por HTTP/JSON** para operaciones que necesitan respuesta inmediata (débito de
   monedas antes de cerrar un pedido). Es lo más simple y suficiente para el alcance actual.
2. **Autenticación de servicio a servicio:** cada llamada lleva un **token JWT** firmado con
   el mismo `JWT_SECRET` que usan los servicios, con un *claim* que identifica el servicio
   emisor. No se expone al usuario.
3. **Trazabilidad de origen:** toda operación de dinero lleva `userId`, `referenceType` y
   `referenceId`, para poder auditar de dónde vino cada movimiento.
4. **Idempotencia:** cada operación de dinero acepta una clave de idempotencia
   (`idempotencyKey`) para que un reintento no duplique el efecto (ver
   [TS-06](./Historias-Tecnicas.md)).
5. **Atomicidad:** una operación que mezcla servicios debe poder **revertirse**. Si `store`
   pide el débito y luego falla el checkout, se compensa con una operación inversa.
6. **Errores uniformes:** todas las respuestas de error usan el formato del proyecto
   `{ "code": "...", "message": "..." }` (el mismo del `AppError` que ya existe en el código).

### Códigos transversales

| HTTP | `code` | Cuándo |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | La petición no cumple el esquema |
| 401 | `MISSING_TOKEN` / `INVALID_TOKEN` | Falta o no vale el token de servicio |
| 403 | `FORBIDDEN` | El servicio emisor no está autorizado para esa operación |
| 404 | `WALLET_NOT_FOUND` | El usuario no tiene monedero |
| 409 | `INSUFFICIENT_BALANCE` | No hay saldo vigente suficiente |
| 409 | `IDEMPOTENCY_CONFLICT` | Se repitió una clave con datos distintos |
| 500 | `INTERNAL_ERROR` | Fallo inesperado del servicio destino |

---

## 3. Mapa de dependencias entre servicios

```text
    identity-service  ◄──── (valida tokens de todos)
         ▲
         │
    ┌────┴───────────────────────────────────┐
    │                                                      │
    store-service ──(1) validar saldo + debitar─────────────▶ economy-service
    │                    (canje de descuento)              ▲
    │                                                      │
    payments-service ──(2) acreditar monedas compradas────┘
                        (al aprobar pago / completar recarga)

    juego (Godot) ──(3) validar partida──────────────▶ economy-service
                     (4) canjear en el mercader         ──┘

    economy / payments / store ──(5) generar aviso─────▶ servicio de
                                                       notificaciones
```

| # | Origen | Destino | Cuándo | Operación |
| --- | --- | --- | --- | --- |
| 1 | `store` | `economy` | Al confirmar un pedido con descuento | `POST /internal/wallets/debit` (§5) |
| 2 | `payments` | `economy` | Al aprobar un pago o completar una recarga | `POST /internal/wallets/credit` (§6) |
| 3 | juego (Godot) | `economy` | Al validar una partida de la aventura | `POST /internal/game-sessions/{sessionId}/validate` (§7) |
| 4 | juego (Godot) | `economy` | Al canjear un objeto en el mercader | `POST /internal/merchant/redemptions` (§8) |
| 5 | `economy` / `payments` / `store` | servicio de notificaciones | Al ocurrir un hecho que requiere aviso | `POST /internal/notifications` (§9) |

> **No se añaden dependencias que el proyecto no necesite.** Los flujos 1, 2 y 3 ya existen en
> el código (como `TODO(economia)` o comentarios); los flujos 4 y 5 se **incorporan** con el
> mercader y la bandeja de avisos. La comunicación de identidad ya funciona con el JWT
> compartido, sin llamadas entre servicios.

> **Un solo destino de dinero:** las cuatro operaciones de dinero y canje apuntan a
> `economy-service`, que es el **dueño del monedero**. Ningún otro servicio guarda saldo.

---

## 4. Operación interna 1 — Consultar saldo disponible

**Uso:** `store` pregunta si el usuario tiene monedas vigentes suficientes.

```http
GET /internal/wallets/{userId}/balance
```

- **Servicio destino:** `economy-service`
- **Autenticación:** servicio a servicio (token interno)
- **Idempotente:** sí (es una lectura)

**Respuesta `200`:**

```json
{
  "userId": "uuid",
  "available": 1250,
  "byType": { "EARNED": 800, "PURCHASED": 450 },
  "asOf": "2026-10-20T12:00:00.000Z"
}
```

| Campo | Qué significa |
| --- | --- |
| `available` | Total de monedas **vigentes** (los lotes vencidos no cuentan) — `FR-BR-04` |
| `byType` | Desglose ganadas / compradas — `FR-BR-01` |
| `asOf` | Momento del cálculo (los vencimientos cambian con el tiempo) |

> **Nota importante:** el saldo **nunca** se confía al cliente. Quien pregunta aquí es otro
> servicio, no el usuario (`FR-BR-16`, `NFR-BR-01`).

---

## 5. Operación interna 2 — Debitar monedas (canje de descuento)

**Uso:** `store` pide a `economy` gastar las monedas del descuento al confirmar el pedido.

```http
POST /internal/wallets/{userId}/debit
```

- **Servicio destino:** `economy-service`
- **Idempotente:** sí, mediante `idempotencyKey`

**Petición:**

```json
{
  "amount": 500,
  "reason": "DISCOUNT_REDEEM",
  "referenceType": "order",
  "referenceId": "uuid-del-pedido",
  "idempotencyKey": "checkout:uuid-del-carrito"
}
```

**Respuesta `200`:**

```json
{
  "debited": 500,
  "balanceAfter": 750,
  "batchesConsumed": [
    { "batchId": "uuid", "type": "EARNED", "amount": 500 }
  ],
  "transactionId": "uuid"
}
```

**Errores posibles:**

| HTTP | `code` | Cuándo |
| --- | --- | --- |
| 409 | `INSUFFICIENT_BALANCE` | El saldo vigente no alcanza |
| 400 | `DISCOUNT_LEVEL_INVALID` | El nivel de descuento es inválido o está inactivo |
| 404 | `WALLET_NOT_FOUND` | El usuario no tiene monedero |

> **Orden de consumo (decisión pendiente):** la respuesta `batchesConsumed` existe
> precisamente para poder documentar qué lotes se gastaron. **Qué lotes elegir** (primero los
> que vencen antes, o las compradas primero) es una decisión del equipo aún abierta —
> ver §11 y el [SRS de reglas](./Software-requeriments\(SRS\)/Business-Rules.md) §7.

---

## 6. Operación interna 3 — Acreditar monedas compradas

**Uso:** `payments` pide a `economy` sumar monedas al aprobar un pago o completar una recarga.

```http
POST /internal/wallets/{userId}/credit
```

- **Servicio destino:** `economy-service`
- **Idempotente:** sí, mediante `idempotencyKey` (normalmente el `paymentId`)

**Petición:**

```json
{
  "amount": 300,
  "coinType": "PURCHASED",
  "reason": "PURCHASE",
  "referenceType": "payment",
  "referenceId": "uuid-del-pago",
  "idempotencyKey": "payment:uuid-del-pago"
}
```

**Respuesta `200`:**

```json
{
  "credited": 300,
  "balanceAfter": 1050,
  "batchId": "uuid-del-lote-creado",
  "transactionId": "uuid"
}
```

**Reglas que respeta:**

- `coinType: PURCHASED` crea un **lote sin vencimiento** (`expiresAt: null`) — `FR-BR-03`.
- Solo se acredita **una vez** por pago, aunque lleguen varias notificaciones — `FR-BE-19`.
- Un fallo **no puede dejar el saldo a medias** (todo dentro de una transacción).

> **Regla dura:** `economy` es el **único** que escribe en el monedero. `payments` nunca toca
> la base de datos de `economy` directamente.

---

## 7. Operación interna 4 — Validar una partida de la aventura

**Uso:** el juego reporta una partida y `economy` decide cuántas monedas otorgar.

```http
POST /internal/game-sessions/{sessionId}/validate
```

- **Servicio destino:** `economy-service`
- **Idempotente:** sí (una sesión se valida una sola vez)

**Petición:**

```json
{
  "userId": "uuid",
  "gameType": "MINIGAME",
  "outcome": "FINISHED",
  "mapId": "maze-3",
  "enemiesDefeated": 42,
  "bossesDefeated": 2,
  "score": 320,
  "itemsObtained": [
    { "itemId": "pocion-vida", "quantity": 3 },
    { "itemId": "arma-oscura", "quantity": 1 }
  ],
  "chestSaved": true,
  "idempotencyKey": "session:uuid-de-la-sesion"
}
```

**Respuesta `200`:**

```json
{
  "sessionId": "uuid",
  "status": "FINISHED",
  "earned": 320,
  "batchId": "uuid",
  "cappedBy": 500,
  "itemsRetained": true
}
```

**Reglas que respeta:**

- `gameType` toma los valores del enum `GameType`: **`MINIGAME`** = partida de **aventura**
  (la única que genera monedas por juego) y **`GACHA`** = tirada de la **ruleta**. El mapeo
  está documentado en [`Game.md`](./Software-requeriments\(SRS\)/Game.md) §6.
- `outcome` toma los valores del enum `GameSessionStatus`: `STARTED`, `FINISHED`
  (completada), `ABANDONED` (abandonada o **muerte**) y `REJECTED` (descartada por el
  servidor). Si el resultado es `ABANDONED`, el jugador **pierde los items** y **conserva las
  monedas** (`FR-GA-07`); la respuesta llega con `itemsRetained: false`.
- `chestSaved` indica si el inventario quedó guardado en un cofre de una zona de descanso
  (`FR-GA-16`, `FR-GA-17`).
- Hoy existe una regla simple **puntaje → monedas con tope 500**; el endurecimiento contra
  resultados manipulados está **pendiente** (`FR-BE-17`).
- La **sesión debe ser del propio usuario**: una sesión ajena devuelve `404` (`FR-GA-19/20`).
- Las monedas ganadas crean un lote `EARNED` **con vencimiento a 30 días** — `FR-BR-02`.

> **Por qué esto importa:** es la defensa contra «inventarse monedas». El cliente del juego
> **nunca** dice cuántas monedas recibe; solo reporta el resultado y el servidor decide.

---

## 8. Operación interna 5 — Canjear monedas por objetos (mercader)

**Uso:** el juego pide a `economy` canjear monedas por un objeto del mercader y validar el
precio en el servidor.

```http
POST /internal/merchant/redemptions
```

- **Servicio destino:** `economy-service`
- **Idempotente:** sí, mediante `idempotencyKey`
- **Requisitos:** `FR-BE-22` (backend), `FR-GA-10` (juego), `FR-BR-01`/`FR-BR-04` (reglas)

**Petición:**

```json
{
  "userId": "uuid",
  "itemId": "pocion-vida",
  "quantity": 2,
  "expectedPrice": 80,
  "referenceType": "gameSession",
  "referenceId": "uuid-de-la-sesion",
  "idempotencyKey": "redemption:uuid-de-la-sesion:pocion-vida:1"
}
```

**Respuesta `200`:**

```json
{
  "redeemed": { "itemId": "pocion-vida", "quantity": 2 },
  "debited": 80,
  "balanceAfter": 1170,
  "inventoryItemId": "uuid",
  "transactionId": "uuid"
}
```

**Errores posibles:**

| HTTP | `code` | Cuándo |
| --- | --- | --- |
| 409 | `INSUFFICIENT_BALANCE` | El saldo vigente no alcanza |
| 404 | `ITEM_NOT_FOUND` | El objeto no existe o no está en el catálogo del mercader |
| 400 | `PRICE_MISMATCH` | El precio del servidor difiere del `expectedPrice` enviado (el catálogo cambió) |
| 409 | `ITEM_LIMIT_REACHED` | El jugador ya tiene el máximo de ese objeto |

**Reglas que respeta:**

- El **precio lo decide el servidor**, nunca el cliente (`NFR-BR-01`).
- El canje es un **débito como cualquier otro**: se registra en `CoinTransaction` y consume
  lotes como una tirada de la ruleta, con la misma protección ante repeticiones.
- Los objetos canjeados **entran en el inventario** del jugador (`PlayerItem`), igual que los
  obtenidos en la aventura.
- El canje **no** genera lote nuevo: consume saldo existente, con su vencimiento si lo tiene.

> **Por qué es una operación y no un endpoint público:** el mercader vive **dentro del mapa**
> y lo consume el cliente del juego, no el navegador. La ruta `/internal/*` mantiene la
> superficie pública limpia (ver §10).

---

## 9. Operación interna 6 — Generar un aviso interno

**Uso:** un servicio avisa a la persona usuaria de un hecho que ya ha ocurrido (monedas
obtenidas, próximo vencimiento, monedas expiradas, pedido confirmado, recarga completada).

```http
POST /internal/notifications
```

- **Servicio destino:** servicio de notificaciones (ubicación pendiente, ver §11)
- **Idempotente:** sí, mediante `idempotencyKey`
- **Requisitos:** `FR-NO-10` (contrato interno), `FR-NO-09` (marcar como leído)

**Petición:**

```json
{
  "userId": "uuid",
  "type": "COINS_EXPIRING",
  "title": "Tus monedas ganadas están por vencer",
  "body": "Te quedan 3 días para usarlas.",
  "channel": "INTERNAL",
  "referenceType": "coinBatch",
  "referenceId": "uuid-del-lote",
  "idempotencyKey": "notification:uuid-del-lote:expiring"
}
```

**Respuesta `201`:**

```json
{
  "notificationId": "uuid",
  "createdAt": "2026-10-22T08:00:00.000Z",
  "scheduledFor": null
}
```

**Reglas que respeta:**

- El **servicio que produce el hecho** es quien emite el aviso: `economy` (monedas,
  vencimientos), `payments` (recargas) y `store` (pedidos, canjes). Ninguno escribe en la
  base de datos de otro (`FR-NO-10`).
- El canal `INTERNAL` es **obligatorio** y no depende de proveedores externos; `EMAIL` y
  `SMS` solo se usan si hay proveedor configurado (`FR-NO-07`).
- El aviso **no lleva datos sensibles** (nunca contraseñas ni tokens) (`NFR-NO-01`).
- Si el aviso trae `scheduledFor`, se entrega más tarde (aviso previo de vencimiento).

> **Pendiente de cerrar:** la **ubicación** del servicio de notificaciones (servicio propio
> o módulo dentro de uno existente) y sus tablas son una decisión abierta (§11). Esta
> operación define el **contrato**, no la implementación.

---

## 10. Autenticación entre servicios (cómo, en la práctica)

Los 4 servicios comparten el mismo `JWT_SECRET` (verificado en el código). La llamada interna
usa un token **de servicio**, distinto del token de usuario:

```text
   ┌──────────────────────────────────────────────────────────┐
   │ Token interno (service-to-service)                        │
   │   sub:   "store-service"        ← el servicio emisor      │
   │   scope: "internal:wallet"      ← qué puede hacer         │
   │   exp:   corto (pocos minutos)  ← limita el daño si se filtra │
   └──────────────────────────────────────────────────────────┘
```

| Regla | Por qué |
| --- | --- |
| El token interno **nunca** sale al usuario ni al frontend | Un cliente no debe poder llamar a `/internal/*` |
| Las rutas `/internal/*` **no** se documentan en el `openapi.yaml` público | El contrato público no revela la superficie interna |
| Cada servicio solo puede llamar a las operaciones que necesita | Mínimo privilegio |
| `JWT_SECRET` **nunca** se documenta con su valor real | Ver [`Politica-de-Seguridad-Documental.md`](./Politica-de-Seguridad-Documental.md) |

> **Pendiente:** el *scope* exacto y la duración del token son decisiones abiertas (§11). Hoy
> lo importante es el **principio**: la comunicación interna se autentica y no se expone.

---

## 11. Decisiones pendientes de esta área

| # | Decisión | Impacta a | Estado |
| --- | --- | --- | --- |
| 1 | **Orden de consumo** de monedas (ganadas vs compradas) | Operaciones 2, 4, 5 | Abierta |
| 2 | **Estrategia definitiva de idempotencia** (clave, almacenamiento, TTL) | Operaciones 2, 3, 4, 5, 6 | Abierta |
| 3 | **Compensación** si `store` pide débito y luego falla el checkout | Operación 2 | Abierta |
| 4 | **Transporte**: HTTP/REST (actual propuesta) vs cola de mensajes | Todas | Abierta |
| 5 | **Scopes** exactos y duración del token interno | §10 | Abierta |
| 6 | Si el contrato se materializa en `@gearquest/common` (tipos Zod compartidos) | Implementación | Abierta |
| 7 | **Catálogo y precios del mercader**: quién los define (¿el juego? ¿el economy?) y en qué unidad se expresan | Operación 5 (`§8`), `FR-BE-22` | Abierta |
| 8 | **Límite de objetos** por tipo que puede tener un jugador (`ITEM_LIMIT_REACHED`) | Operación 5 (`§8`) | Abierta |
| 9 | **Ubicación del servicio de notificaciones**: servicio propio (5.º) o módulo dentro de uno existente | Operación 6 (`§9`), `FR-NO-10` | Abierta |
| 10 | **Tipos de aviso** (`type`) del contrato y su equivalencia con los canales | Operación 6 (`§9`) | Abierta |

> Estas decisiones están alineadas con las del [SRS de reglas](./Software-requeriments\(SRS\)/Business-Rules.md)
> §7 y con la deuda de [Trazabilidad](./Trazabilidad.md) §12.1. **Mientras no se cierren, no se
> debe implementar la integración «a ojo».**

---

## 12. Cómo se implementaría (orden sugerido)

Coincide con las historias técnicas [`TS-01…TS-04`](./Historias-Tecnicas.md):

1. **Definir los esquemas** (Zod) de las 6 operaciones en `@gearquest/common` (o en cada
   servicio, según §11.6).
2. **Implementar los endpoints `/internal/*`** en `economy-service` primero (es el que
   responde a los cuatro flujos de dinero y canje).
3. **Implementar el cliente HTTP interno** con el token de servicio.
4. **Conectar `store`** (débito) y **`payments`** (crédito), cerrando los `TODO(economia)`.
5. **Implementar el canje del mercader** (`§8`) cuando se cierren las decisiones 7 y 8.
6. **Implementar el servicio de notificaciones** (`§9`) cuando se cierre la decisión 9.
7. **Probar cada operación** con la regla crítica correspondiente (ver
   [Estrategia de pruebas](./Estrategia-de-Pruebas.md) §4).
8. **Actualizar la trazabilidad** al cerrar cada `TODO`.

> **Orden de valor:** los pasos 1–4 son los que cierran la deuda más antigua (los
> `TODO(economia)`). El paso 5 desbloquea el mercader del juego y el paso 6, la bandeja de
> avisos; ambos dependen de decisiones abiertas (§11), por eso van después.

---

## 13. Enlaces relacionados

| Documento | Para qué |
| --- | --- |
| [`API/openapi.yaml`](./API/openapi.yaml) | El contrato **público** (frontend y juego) |
| [`Diccionario-de-Datos.md`](./Diccionario-de-Datos.md) | Los modelos `Wallet`, `CoinBatch`, `CoinTransaction` |
| [`Historias-Tecnicas.md`](./Historias-Tecnicas.md) | TS-01…TS-04: las tareas que implementan esto |
| [`Software-requeriments(SRS)/Business-Rules.md`](./Software-requeriments\(SRS\)/Business-Rules.md) | Las reglas de monedas y descuentos |
| [`Trazabilidad.md`](./Trazabilidad.md) | Estado real de la integración (§12.1) |
| [`Decisiones.md`](./Decisiones.md) | ADR-0001/0002 (microservicios, una base por servicio) |
| [`Politica-de-Seguridad-Documental.md`](./Politica-de-Seguridad-Documental.md) | Qué no se publica (lo interno) |

---

*Un microservicio sin contrato interno no es una arquitectura: es una colección de servicios
que casualmente conviven. Este documento es lo que los convierte en un sistema.*
