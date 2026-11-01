# Seguridad de la economía

> **Estado:** Fase 0 — estructura y documentación base. Sin código todavía.
> **Ubicación del código previsto:** `economy-service/src/modules/security/`.
> **Dueño del monedero:** `economy-service`. No se crea un microservicio aparte para
> escribir saldos.

---

## 1. Propósito

Definir los controles **preventivos** que protegen el dinero virtual de GearQuest:

- Monedero y lotes de monedas (`EARNED` / `PURCHASED`).
- Vencimientos y cálculo de saldo disponible.
- Ruleta (gacha) y sus recompensas.
- Validación de partidas de la aventura.
- Recargas y pagos simulados.
- Descuentos, pedidos y canjes del mercader.
- Autenticación servicio-a-servicio y auditoría.

La detección de patrones sospechosos vive en el servicio Python
[`fraud-service`](../analisis-de-fraude/README.md). Esta parte no lo reemplaza ni
depende de él para las validaciones críticas.

---

## 2. Por qué no es un microservicio nuevo

`economy-service` es el único dueño de la base del monedero (ADR-0003). Si otro servicio
escribiera los saldos, aparecerían transacciones distribuidas y dos fuentes de verdad.
Por eso:

- La seguridad económica es un **módulo interno** de `economy-service`.
- El **único** servicio nuevo es `fraud-service`, con base propia y función
  complementaria.
- Ningún servicio accede directamente a las tablas de otro.

---

## 3. Invariantes que deben cumplirse siempre

1. El saldo disponible es la suma de los lotes vigentes; nunca lo fija el cliente.
2. Ningún lote puede tener cantidad negativa ni superar su cantidad original.
3. Un movimiento es append-only: no se borra ni se sobrescribe el registro original.
4. Un vencimiento crea un movimiento nuevo; no elimina el lote ni su historial.
5. Un débito y sus movimientos ocurren en una sola transacción.
6. Un reintento con la misma clave de idempotencia no repite el efecto.
7. Dos débitos simultáneos no pueden dejar el saldo negativo.
8. El precio, el descuento y la recompensa los calcula el servidor.
9. La ruleta usa un generador criptográficamente seguro y no acepta una semilla del
   cliente.
10. Una sesión de juego pertenece a un solo usuario y se valida una sola vez.
11. Las monedas ganadas vencen a los 30 días; las compradas no vencen.
12. Toda operación sensible deja evidencia auditable y un evento de seguridad.

---

## 4. Controles previstos

| Control | Dónde vive | Qué protege |
| --- | --- | --- |
| Bloqueo y versión del monedero | `guards/ledger.guard.ts` | Concurrencia y doble gasto |
| Idempotencia persistida | `shared/idempotency.ts` + tablas | Reintentos y duplicados |
| Libro mayor append-only | `CoinTransaction` + auditoría | Trazabilidad del dinero |
| Reconciliación periódica | `ReconciliationRun` + worker | Drift entre saldo y lotes |
| Validación de partidas | `guards/gameSession.guard.ts` | Resultados manipulados |
| RNG seguro y pesos válidos | `guards/gacha.guard.ts` | Ruleta manipulada |
| Idempotencia y conciliación de pagos | `guards/payment.guard.ts` | Crédito duplicado |
| Elegibilidad y uso único de descuentos | `guards/discount.guard.ts` | Abuso de descuentos |
| Auditoría encadenada | `audit/` | Alteración de evidencia |
| Eventos de seguridad | `events/` + outbox | Detección y análisis |
| Evaluación de riesgo opcional | `risk/` + `fraud-service` | Respuesta ante sospecha |

---

## 5. Estructura documental

| Documento | Contenido |
| --- | --- |
| [`docs/01-modelo-de-amenazas.md`](./docs/01-modelo-de-amenazas.md) | Activos, actores, amenazas y controles |
| [`docs/02-invariantes-del-monedero.md`](./docs/02-invariantes-del-monedero.md) | Reglas de saldo, concurrencia y reconciliación |
| [`docs/03-anticheat-partidas.md`](./docs/03-anticheat-partidas.md) | Sesiones, plausibilidad, topes y replay |
| [`docs/04-integridad-gacha.md`](./docs/04-integridad-gacha.md) | RNG, pesos, probabilidades y auditoría |
| [`docs/05-integridad-pagos.md`](./docs/05-integridad-pagos.md) | Idempotencia, montos y conciliación |
| [`docs/06-respuesta-y-casos.md`](./docs/06-respuesta-y-casos.md) | Niveles de riesgo, acciones y casos |
| [`docs/07-runbook-operacion.md`](./docs/07-runbook-operacion.md) | Operación, alertas y revisión manual |

---

## 6. Contratos y pruebas

- [`contracts/README.md`](./contracts/README.md): contrato de eventos, evaluación de
  riesgo y versión del esquema.
- [`tests/escenarios-de-abuso.md`](./tests/escenarios-de-abuso.md): escenarios que deben
  convertirse en pruebas automatizadas.

---

## 7. Estructura prevista del módulo de código

```text
backend/services/economy-service/src/modules/security/
├── README.md
├── security.router.ts
├── security.schemas.ts
├── security.service.ts
├── audit/
├── events/
├── guards/
└── risk/
```

Los archivos `.ts` se crearán cuando se autorice la implementación. Por ahora solo
existen las carpetas y los marcadores `.gitkeep`.

---

## 8. Estado

- [x] Carpeta del área creada.
- [x] Índice y documentos esqueleto.
- [x] Escenarios de abuso iniciales.
- [ ] Modelo de amenazas completo.
- [ ] Invariantes aprobados por el equipo.
- [ ] Contratos JSON y OpenAPI.
- [ ] Implementación de la Fase 1.
