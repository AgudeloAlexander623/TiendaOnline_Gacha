# 07 · Runbook de operación

> **Estado:** esqueleto de Fase 0 — pendiente de completar y aprobar.
> **Área:** operación de la seguridad.
> **Referencias:** `FR-INF-05`, `NFR-INF-05`, `NFR-SEC-01`.

---

## 1. Propósito

Explicar qué hacer cuando salta una alerta, cómo investigar y cómo dejar evidencia sin
exponer datos sensibles.

## 2. Alertas previstas

| Alerta | Señal | Primer paso |
| --- | --- | --- |
| Drift de saldo | Reconciliación distinta de cero | Congelar ajustes y revisar movimientos |
| Saldo negativo | Invariante roto | Bloquear monedero afectado y abrir incidente |
| Partida imposible | Regla de plausibilidad | Retener recompensa y revisar sesión |
| Replay de sesión | Sesión ya validada | Rechazar y revisar cuenta |
| Pago duplicado | Crédito repetido | Revisar pago y movimiento |
| Tirada anómala | Frecuencia o premio fuera de rango | Revisar historial y cuenta |
| Fuerza bruta | Muchos `401` en poco tiempo | Aplicar rate limit y revisar IP |
| Token interno inválido | `403` de servicio | Revisar emisor y rotación |
| `fraud-service` caído | Health check fallido | Aplicar política de contingencia |

## 3. Investigación

- [ ] Identificar el evento y la regla que disparó.
- [ ] Revisar la línea de tiempo del usuario.
- [ ] Confirmar que no es un falso positivo.
- [ ] Consultar movimientos, lotes y auditoría.
- [ ] Aplicar la acción mínima necesaria.
- [ ] Registrar la decisión y la evidencia.
- [ ] Notificar al responsable.

## 4. Acciones administrativas

- [ ] Bloquear o desbloquear un monedero.
- [ ] Retener o liberar una recompensa.
- [ ] Invalidar una sesión.
- [ ] Añadir o retirar una entrada de blocklist.
- [ ] Ajustar un saldo con justificación y auditoría.
- [ ] Cambiar una regla o un umbral.

## 5. Prevención de errores

- [ ] Doble confirmación para acciones destructivas.
- [ ] Registro de quién hizo qué y cuándo.
- [ ] Prohibido borrar evidencia.
- [ ] Datos sensibles enmascarados en las alertas.
- [ ] Revisión posterior de cada incidente.

## 6. Decisiones pendientes

1. Herramienta de guardia y notificación.
2. Horario y responsables de revisión.
3. Tiempo de respuesta esperado.
4. Procedimiento de escalamiento.
5. Plantilla de informe de incidente.
