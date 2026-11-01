# 02 · Invariantes del monedero

> **Estado:** esqueleto de Fase 0 — pendiente de completar y aprobar.
> **Área:** seguridad de la economía.
> **Referencias:** `FR-BR-01` a `FR-BR-06`, `FR-BR-15`, `FR-BR-16`, `FR-BE-19`.

---

## 1. Propósito

Definir las reglas que nunca pueden romperse en el monedero y cómo se comprueban de forma
automática.

## 2. Invariantes

- [ ] El saldo disponible es la suma de lotes vigentes, no un valor enviado por el cliente.
- [ ] Ningún lote tiene cantidad negativa, cero o mayor que su cantidad original.
- [ ] El saldo total nunca es negativo.
- [ ] Cada movimiento tiene tipo, monto, saldo posterior y referencia.
- [ ] Los movimientos son append-only: no se actualizan ni se borran.
- [ ] Un vencimiento crea un movimiento `EXPIRE` y marca el lote como `EXPIRED`.
- [ ] Un débito consume lotes vigentes y actualiza el saldo en la misma transacción.
- [ ] Un crédito crea lote y movimiento en la misma transacción.
- [ ] La misma clave de idempotencia no produce dos efectos.
- [ ] Dos operaciones concurrentes no dejan el saldo negativo.
- [ ] La suma de lotes y el historial de movimientos cuadran al cierre del día.

## 3. Orden de consumo

Decisión pendiente del equipo:

- [ ] Primero las monedas ganadas que vencen antes.
- [ ] Primero las monedas compradas.
- [ ] Otro orden.

Mientras no se decida, la implementación no debe fijarlo implícitamente.

## 4. Concurrencia

- [ ] Bloquear el monedero con `SELECT ... FOR UPDATE` o versión optimista.
- [ ] Ejecutar débito y crédito en una transacción.
- [ ] Reintentar fallos de serialización de forma limitada.
- [ ] Persistir la clave de idempotencia antes de responder.
- [ ] Probar con peticiones simultáneas reales.

## 5. Reconciliación

- [ ] Job diario que recalcula saldos desde lotes y movimientos.
- [ ] Comparación contra el saldo reportado.
- [ ] Registro de cada ejecución en `ReconciliationRun`.
- [ ] Alerta si el drift es distinto de cero.
- [ ] Caso de revisión para diferencias no explicadas.

## 6. Pruebas mínimas

- [ ] Doble clic en una compra.
- [ ] Reintento con la misma clave.
- [ ] Débito concurrente con saldo justo.
- [ ] Lote vencido que no se puede gastar.
- [ ] Intento de enviar saldo desde el cliente.
- [ ] Vencimiento repetido sin duplicar movimientos.
- [ ] Reconciliación con drift forzado.

## 7. Criterio de cierre

- [ ] Invariantes aprobados.
- [ ] Pruebas automatizadas en verde.
- [ ] Reconciliación sin diferencias en el entorno de prueba.
