# Contratos de seguridad

> **Estado:** Fase 0 — especificación pendiente. Los archivos de contrato todavía no se
> han creado.
> **Alcance:** comunicación entre `economy-service` y `fraud-service`.

---

## 1. Archivos previstos

| Archivo | Contenido | Estado |
| --- | --- | --- |
| `security-event.schema.json` | Sobre común de eventos de seguridad | ⬜ Pendiente |
| `risk-assessment.schema.json` | Petición y respuesta de evaluación de riesgo | ⬜ Pendiente |
| `openapi-fraud.yaml` | Contrato OpenAPI del servicio Python | ⬜ Pendiente |

No se crearán hasta que el equipo apruebe los campos y las reglas de la Fase 0.

---

## 2. Sobre del evento

| Campo | Tipo | Obligatorio | Descripción |
| --- | --- | --- | --- |
| `eventId` | UUID | Sí | Identificador único; permite deduplicar |
| `occurredAt` | ISO-8601 | Sí | Momento del hecho en el servicio origen |
| `sourceService` | string | Sí | Servicio que emite (`economy-service`, etc.) |
| `eventType` | string | Sí | Tipo de evento, por ejemplo `economy.gacha.pulled` |
| `userId` | UUID | No | Usuario afectado, si aplica |
| `sessionId` | UUID | No | Sesión de juego o de autenticación |
| `ipHash` | string | No | Hash con clave secreta, nunca IP en claro |
| `amount` | integer | No | Monto de monedas, si aplica |
| `referenceType` | string | No | Tipo de referencia (`order`, `payment`, `gameSession`…) |
| `referenceId` | UUID | No | Identificador de la referencia |
| `metadata` | object | No | Campos permitidos según el tipo de evento |
| `schemaVersion` | string | Sí | Versión del contrato, por ejemplo `1.0` |

---

## 3. Reglas del contrato

1. **Idempotencia:** `eventId` es único; repetir el mismo evento no duplica el efecto.
2. **Sin datos sensibles:** nunca contraseñas, tokens, correos completos ni claves de
   licencia.
3. **Minimización:** solo los campos necesarios para evaluar el riesgo.
4. **Versionado:** un cambio incompatible sube `schemaVersion`.
5. **Validación estricta:** el receptor rechaza campos desconocidos o tipos incorrectos.
6. **Tamaño limitado:** el cuerpo del evento no supera el límite acordado.
7. **Trazabilidad:** cada evento conserva su origen y su referencia de negocio.

---

## 4. Evaluación de riesgo

### Petición

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `event` | objeto | Evento a evaluar |
| `context` | objeto | Ventana temporal, historial resumido o flags de la cuenta |
| `policyVersion` | string | Versión de la política solicitada |

### Respuesta

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `assessmentId` | UUID | Identificador de la evaluación |
| `score` | integer | Puntaje de 0 a 100 |
| `level` | enum | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `action` | enum | `ALLOW`, `FLAG`, `HOLD`, `REVIEW`, `BLOCK` |
| `reasons` | array | Reglas activadas y explicación breve |
| `ruleVersion` | string | Versión del motor de reglas |
| `expiresAt` | ISO-8601 | Vigencia de la decisión |

---

## 5. Pruebas de contrato

- [ ] Un evento válido se acepta una vez.
- [ ] Un evento repetido no duplica el registro.
- [ ] Un campo desconocido se rechaza.
- [ ] Un evento sin `eventId` se rechaza.
- [ ] Un evento con datos sensibles se rechaza.
- [ ] Una respuesta de riesgo cumple el esquema.
- [ ] Un cambio de versión incompatible se detecta.
