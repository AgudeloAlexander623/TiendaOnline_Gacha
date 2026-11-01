# 05 · Integridad de pagos y recargas

> **Estado:** esqueleto de Fase 0 — pendiente de completar y aprobar.
> **Área:** seguridad de la economía.
> **Referencias:** `FR-BR-10`, `FR-BR-11`, `FR-BE-19`, `FR-BE-21`, contrato §6.

---

## 1. Propósito

Asegurar que una recarga simulada acredite monedas exactamente una vez y que ningún
reintento, callback repetido o monto manipulado altere el saldo.

## 2. Controles previstos

- [ ] La recarga es simulada y se informa claramente.
- [ ] No se piden datos bancarios ni se procesa dinero real.
- [ ] El monto y el paquete los decide el servidor.
- [ ] El `paymentId` es único.
- [ ] El crédito es idempotente.
- [ ] Un pago aprobado no se puede volver a acreditar.
- [ ] Un pago fallido o reembolsado no acredita monedas.
- [ ] La transición de estados es válida y auditable.
- [ ] Se concilia pago contra movimiento de monedas.
- [ ] Se detectan reintentos y callbacks duplicados.

## 3. Estados previstos

```text
CREATED ──▶ PENDING ──▶ APPROVED ──▶ CREDITED
                    └──▶ FAILED
APPROVED ──▶ REFUNDED
```

## 4. Señales de abuso

- [ ] Muchas recargas en poco tiempo.
- [ ] Mismo pago con varios intentos de crédito.
- [ ] Monto que no coincide con el paquete.
- [ ] Crédito sin pago aprobado.
- [ ] Reembolso después de usar las monedas.
- [ ] Misma IP o dispositivo con muchas cuentas.

## 5. Pruebas mínimas

- [ ] Un pago acredita una sola vez.
- [ ] Callback duplicado no duplica el saldo.
- [ ] Monto manipulado se rechaza.
- [ ] Pago fallido no acredita.
- [ ] Reembolso no deja saldo negativo.
- [ ] Conciliación detecta un crédito huérfano.
- [ ] `fraud-service` caído no impide el flujo normal.

## 6. Decisiones pendientes

1. Proveedor de pago simulado o mecanismo de simulación.
2. Firma o secreto de los callbacks.
3. Política de reembolsos.
4. Ventana de conciliación.
5. Retención de evidencia de pago.
