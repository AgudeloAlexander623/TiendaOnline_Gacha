# Contrato entre servicios — GearQuest

> **Para quién es esto:** para quien programe la comunicación entre los microservicios.
> **Qué resuelve:** hoy los 4 servicios **no se hablan** (0 llamadas). Este documento define
> **cómo** deben hablarse: qué operación, qué datos y qué respuesta, para que no se improvise
> una integración distinta en cada punto.
> **Complementa a:** el [`openapi.yaml`](./API/openapi.yaml) (contrato **público**, hacia el
> frontend/juego) y el [SRS](./Software-requeriments\(SRS\)/README.md) (las reglas).
> **Estado:** **propuesto** — describe el diseño acordado, aún no implementado. Se traza en
> [`Trazabilidad.md`](./Trazabilidad.md) §12.1 (deuda de integración).

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
   identity-service  ◀──── (valida tokens de todos)
        ▲
        │
   ┌────┴────────────────────────────────────────────────┐
   │                                                      │
   store-service ──(1) validar saldo + debitar──────────▶ economy-service
   │                    (canje de descuento)              ▲
   │                                                      │
   payments-service ──(2) acreditar monedas compradas────┘
                       (al aprobar pago / completar recarga)
```

| # | Origen | Destino | Cuándo | Commit que lo referencia |
| --- | --- | --- | --- | --- |
| 1 | `store` | `economy` | Al confirmar un pedido con descuento | `TODO(economia)` en `orders.service.ts:91` |
| 2 | `payments` | `economy` | Al aprobar un pago o completar una recarga | `TODO(economia)` en `payments.service.ts:176`, `recharges.service.ts:5` |
| 3 | `economy` | *(juego)* | Al validar una partida | Comentario en `rewards.service.ts:9` |

> **No se añaden dependencias que el proyecto no necesite.** Hoy solo hay estos 3 flujos; el
> resto de la comunicación (identidad) ya funciona con el JWT compartido.

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
> ver §9 y el [SRS de reglas](./Software-requeriments\(SRS\)/Business-Rules.md) §7.

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

## 7. Operación interna 4 — Validar una partida del juego

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
  "score": 320,
  "gameType": "MINIGAME",
  "idempotencyKey": "session:uuid-de-la-sesion"
}
```

**Respuesta `200`:**

```json
{
  "sessionId": "uuid",
  "earned": 320,
  "batchId": "uuid",
  "cappedBy": 500
}
```

**Reglas que respeta:**

- Hoy existe una regla simple **puntaje → monedas con tope 500**; el endurecimiento contra
  resultados manipulados está **pendiente** (`FR-BE-17`).
- La **sesión debe ser del propio usuario**: una sesión ajena devuelve `404` (`FR-GA-19/20`).
- Las monedas ganadas crean un lote `EARNED` **con vencimiento a 30 días** — `FR-BR-02`.

> **Por qué esto importa:** es la defensa contra «inventarse monedas». El cliente del juego
> **nunca** dice cuántas monedas recibe; solo reporta el resultado y el servidor decide.

---

## 8. Autenticación entre servicios (cómo, en la práctica)

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

> **Pendiente:** el *scope* exacto y la duración del token son decisiones abiertas (§9). Hoy
> lo importante es el **principio**: la comunicación interna se autentica y no se expone.

---

## 9. Decisiones pendientes de esta área

| # | Decisión | Impacta a | Estado |
| --- | --- | --- | --- |
| 1 | **Orden de consumo** de monedas (ganadas vs compradas) | Operación 2 (débito) | Abierta |
| 2 | **Estrategia definitiva de idempotencia** (clave, almacenamiento, TTL) | Operaciones 2, 3, 4 | Abierta |
| 3 | **Compensación** si `store` pide débito y luego falla el checkout | Operación 2 | Abierta |
| 4 | **Transporte**: HTTP/REST (actual propuesta) vs cola de mensajes | Todas | Abierta |
| 5 | **Scopes** exactos y duración del token interno | §8 | Abierta |
| 6 | Si el contrato se materializa en `@gearquest/common` (tipos Zod compartidos) | Implementación | Abierta |

> Estas decisiones están alineadas con las del [SRS de reglas](./Software-requeriments\(SRS\)/Business-Rules.md)
> §7 y con la deuda de [Trazabilidad](./Trazabilidad.md) §12.1. **Mientras no se cierren, no se
> debe implementar la integración «a ojo».**

---

## 10. Cómo se implementaría (orden sugerido)

Coincide con las historias técnicas [`TS-01…TS-04`](./Historias-Tecnicas.md):

1. **Definir los esquemas** (Zod) de las 4 operaciones en `@gearquest/common` (o en cada
   servicio, según §9.6).
2. **Implementar los endpoints `/internal/*`** en `economy-service` primero (es el que
   responde a los tres flujos).
3. **Implementar el cliente HTTP interno** con el token de servicio.
4. **Conectar `store`** (débito) y **`payments`** (crédito), cerrando los `TODO(economia)`.
5. **Probar cada operación** con la regla crítica correspondiente (ver
   [Estrategia de pruebas](./Estrategia-de-Pruebas.md) §4).
6. **Actualizar la trazabilidad** al cerrar cada `TODO`.

---

## 11. Enlaces relacionados

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
