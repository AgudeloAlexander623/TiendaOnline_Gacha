# Módulo de seguridad de `economy-service`

> **Estado:** estructura únicamente. No hay código todavía.
> **Dueño:** `economy-service`.
> **Función:** aplicar los controles preventivos de la economía y emitir eventos de
> seguridad hacia `fraud-service`.

---

## 1. Por qué está dentro de `economy-service`

El monedero, la ruleta, las sesiones de juego y los movimientos de monedas pertenecen a
este servicio. Un módulo separado que escribiera en su base rompería la regla de “una base
por servicio”. Por eso los controles viven aquí y el servicio Python solo analiza eventos.

---

## 2. Archivos previstos

| Archivo / carpeta | Responsabilidad |
| --- | --- |
| `security.router.ts` | Rutas internas de estado y administración de seguridad |
| `security.schemas.ts` | Esquemas Zod de entrada y salida |
| `security.service.ts` | Orquestación de evaluación y respuesta |
| `audit/audit.service.ts` | Registro append-only con encadenamiento de hashes |
| `audit/audit.schemas.ts` | Tipos y validación de auditoría |
| `events/securityEvent.types.ts` | Tipos de los eventos de seguridad |
| `events/securityEvent.publisher.ts` | Publicación de eventos hacia `fraud-service` |
| `events/outbox.worker.ts` | Reintentos y entrega desde la tabla outbox |
| `guards/ledger.guard.ts` | Bloqueos, saldo, concurrencia y reconciliación |
| `guards/gameSession.guard.ts` | Plausibilidad, topes, nonce y replay |
| `guards/gacha.guard.ts` | RNG seguro, pesos y límites de tiradas |
| `guards/payment.guard.ts` | Idempotencia, monto y crédito único |
| `guards/discount.guard.ts` | Elegibilidad, uso único y precio del servidor |
| `risk/risk.client.ts` | Cliente HTTP hacia `fraud-service` con timeout |
| `risk/risk.policy.ts` | Umbrales y acciones permitidas |
| `risk/risk.types.ts` | Tipos de evaluación de riesgo |

---

## 3. Integración con el código existente

| Elemento existente | Uso previsto |
| --- | --- |
| `shared/idempotency.ts` | Reutilizar la idempotencia persistida en operaciones sensibles |
| `shared/auth.ts` | Reutilizar `authenticateService` y `requireRole` |
| `shared/jwt.ts` | Firmar y verificar tokens de servicio |
| `shared/errors.ts` | Mantener el formato `{ code, message }` y no filtrar detalles |
| `shared/logger.ts` | Registrar eventos sin datos sensibles |
| `CoinBatch` / `CoinTransaction` | Base del libro mayor y de la reconciliación |
| `GameSession` | Punto de partida para nonce, duración y plausibilidad |
| `GachaPull` | Punto de partida para semilla, tirada y auditoría |
| `IdempotencyKey` | Base para no duplicar débitos, créditos y tiradas |

---

## 4. Reglas de implementación

1. Ninguna operación de saldo se hace fuera de una transacción.
2. El débito bloquea el monedero y consume lotes por vencimiento (primero lo que antes
   expira), salvo que el equipo cambie la decisión.
3. El crédito crea lote y movimiento en la misma transacción.
4. El vencimiento es idempotente y no borra nada.
5. Los eventos se escriben en el outbox dentro de la misma transacción que el dinero.
6. La llamada a `fraud-service` nunca bloquea el camino crítico sin timeout y circuit
   breaker.
7. Los errores no revelan detalles internos.
8. Toda acción administrativa queda auditada.

---

## 5. Pruebas previstas

- Doble débito concurrente.
- Reintento con la misma clave de idempotencia.
- Saldo insuficiente y lote vencido.
- Cliente que intenta enviar su propio saldo.
- Partida con puntaje imposible, replay o duración mínima.
- Tirada doble y pesos inválidos.
- Pago duplicado y monto inconsistente.
- Descuento reutilizado.
- `fraud-service` caído o lento.
- Ausencia de datos sensibles en logs y eventos.

La lista completa está en
[`security/seguridad-de-economia/tests/escenarios-de-abuso.md`](../../../../../../security/seguridad-de-economia/tests/escenarios-de-abuso.md).

---

## 6. Estado

Solo existen las carpetas y los `.gitkeep`. La implementación requiere autorización
explícita y debe empezar por la Fase 1 (integridad del monedero).
