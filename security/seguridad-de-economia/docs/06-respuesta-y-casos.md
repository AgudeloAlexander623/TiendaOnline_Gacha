# 06 · Respuesta y gestión de casos

> **Estado:** esqueleto de Fase 0 — pendiente de completar y aprobar.
> **Área:** seguridad de la economía y análisis de fraude.
> **Referencias:** `FR-SEC-04`, `FR-SEC-08`, `FR-SEC-10`, diagrama 04.

---

## 1. Propósito

Definir qué hace el sistema cuando detecta una señal de riesgo y cómo se investiga sin
afectar a usuarios legítimos.

## 2. Niveles y acciones

| Nivel | Puntaje | Acción | Responsable |
| --- | --- | --- | --- |
| `LOW` | 0–29 | Permitir y registrar | automático |
| `MEDIUM` | 30–59 | Permitir, marcar y vigilar | automático |
| `HIGH` | 60–84 | Retener recompensa o pedir verificación; abrir caso | automático + revisor |
| `CRITICAL` | 85–100 | Bloqueo temporal, invalidar sesión, alerta y caso | automático + revisor |

## 3. Reglas de respuesta

- [ ] El backend aplica siempre sus validaciones críticas, con o sin `fraud-service`.
- [ ] Si `fraud-service` no responde, se aplica la política acordada.
- [ ] Los bloqueos son temporales y tienen motivo, alcance y vencimiento.
- [ ] El usuario recibe un mensaje genérico, sin revelar la regla exacta.
- [ ] Toda decisión queda auditada.
- [ ] Un falso positivo se puede revertir y queda registrado.
- [ ] Las acciones administrativas requieren rol o scope adecuado.

## 4. Ciclo de un caso

```text
OPEN ──▶ IN_REVIEW ──▶ CONFIRMED ──▶ ACTIONED
                    └──▶ DISMISSED
```

## 5. Evidencia mínima del caso

- [ ] `eventId` y tipo de evento.
- [ ] Usuario y referencias afectadas.
- [ ] Puntaje, nivel y reglas activadas.
- [ ] Versión del motor de reglas.
- [ ] Fecha, servicio origen y datos mínimos.
- [ ] Notas y decisión del revisor.
- [ ] Acción aplicada y su vencimiento.

## 6. Alertas

- [ ] Alerta al equipo por el canal interno.
- [ ] Resumen sin datos sensibles.
- [ ] Enlace al caso y a la evidencia.
- [ ] Prioridad según nivel.
- [ ] Registro de quién atendió y cuándo.

## 7. Decisiones pendientes

1. Umbrales definitivos por dominio.
2. Quién revisa los casos y en qué horario.
3. Canal de alertas del equipo.
4. Política de bloqueo y desbloqueo.
5. Tiempo máximo de retención de una recompensa.
