# Servicio de análisis de fraude (`fraud-service`)

> **Estado:** Fase 0 — estructura y diseño. Sin código todavía.
> **Tecnología prevista:** Python 3.12 + FastAPI + PostgreSQL.
> **Dueño de datos:** base propia `gearquest_fraud`.
> **Carácter:** servicio complementario; no sustituye las validaciones de
> `economy-service`.

---

## 1. Propósito

Detectar patrones sospechosos en las acciones relevantes de GearQuest, calcular un
puntaje de riesgo, abrir casos para revisión y generar alertas. El servicio recibe
eventos mínimos de los demás servicios y **nunca** lee sus bases de datos.

Casos que debe poder detectar:

- Ganancia anómala de monedas o partidas repetidas con resultados sospechosos.
- Replays de sesiones de juego o resultados imposibles.
- Abuso de la ruleta o de los descuentos.
- Recargas y pagos duplicados o inconsistentes.
- Intentos de acceso, fuerza bruta o uso anómalo de tokens.
- Patrones de varias cuentas desde la misma IP o dispositivo.

---

## 2. Límites del servicio

| Sí hace | No hace |
| --- | --- |
| Recibir y almacenar eventos de seguridad | Escribir en la base de `economy-service` |
| Evaluar reglas y calcular riesgo | Decidir el saldo o el precio final |
| Abrir casos y gestionar listas de bloqueo | Sustituir la autenticación o los permisos |
| Alertar y exponer métricas | Procesar pagos reales o datos bancarios |
| Aprender patrones con datos históricos | Guardar contraseñas, tokens o claves de licencia |

---

## 3. Tecnologías previstas

| Pieza | Tecnología |
| --- | --- |
| Lenguaje | Python 3.12 |
| API | FastAPI + Pydantic v2 |
| Persistencia | PostgreSQL 16 + SQLAlchemy 2 + Alembic + asyncpg |
| Cliente HTTP | httpx con timeout y reintentos |
| Reglas | YAML/JSON + evaluador propio |
| Anomalías (fase posterior) | scikit-learn (IsolationForest) |
| Logs | structlog en JSON |
| Métricas | Prometheus |
| Pruebas | pytest + httpx + Testcontainers |
| Calidad | Ruff + mypy + `uv` |
| Contenedores | Docker |

---

## 4. API prevista

| Método | Ruta | Uso | Scope interno |
| --- | --- | --- | --- |
| `GET` | `/health` | Estado del servicio | público interno |
| `POST` | `/v1/events` | Ingesta idempotente de eventos | `fraud:event` |
| `POST` | `/v1/assess` | Evaluación síncrona opcional de una acción | `fraud:assess` |
| `GET` | `/v1/cases` | Listar casos de revisión | `fraud:admin` |
| `GET` | `/v1/cases/{id}` | Ver un caso y su evidencia | `fraud:admin` |
| `PATCH` | `/v1/cases/{id}` | Cambiar estado o añadir notas | `fraud:admin` |
| `GET` | `/v1/blocklist` | Consultar bloqueos | `fraud:admin` |
| `POST` | `/v1/blocklist` | Añadir un bloqueo | `fraud:admin` |
| `DELETE` | `/v1/blocklist/{id}` | Retirar un bloqueo | `fraud:admin` |
| `GET` | `/v1/rules` | Consultar reglas activas | `fraud:admin` |
| `PUT` | `/v1/rules/{id}` | Cambiar una regla | `fraud:admin` |

> La evaluación síncrona es **opcional** y tendrá timeout corto y circuit breaker.
> El camino normal es asíncrono mediante eventos.

---

## 5. Evento mínimo

```json
{
  "eventId": "uuid",
  "occurredAt": "2026-11-01T12:00:00Z",
  "sourceService": "economy-service",
  "eventType": "economy.gacha.pulled",
  "userId": "uuid",
  "sessionId": "uuid",
  "ipHash": "hmac-sha256",
  "amount": 100,
  "referenceType": "gachaPull",
  "referenceId": "uuid",
  "metadata": {},
  "schemaVersion": "1.0"
}
```

Reglas del evento:

- `eventId` es único; la ingesta es idempotente.
- No incluye correo, contraseña, token ni clave de licencia.
- La IP se guarda como hash con clave secreta, no en claro.
- `metadata` solo admite campos permitidos por el contrato.

---

## 6. Niveles de riesgo

| Nivel | Puntaje orientativo | Respuesta |
| --- | --- | --- |
| `LOW` | 0–29 | Permitir y registrar |
| `MEDIUM` | 30–59 | Permitir, marcar y vigilar |
| `HIGH` | 60–84 | Retener recompensa o pedir verificación; abrir caso |
| `CRITICAL` | 85–100 | Bloqueo temporal, invalidar sesión, alerta y caso |

Los umbrales son configurables y deben aprobarse en la Fase 0.

---

## 7. Modelo de datos previsto

| Tabla | Contenido |
| --- | --- |
| `security_events` | Eventos recibidos, con deduplicación por `event_id` |
| `risk_assessments` | Puntaje, nivel, reglas activadas y versión del motor |
| `rule_hits` | Evidencia de cada regla que disparó |
| `fraud_cases` | Casos de revisión con estado y prioridad |
| `case_notes` | Notas y decisiones del revisor |
| `blocklist` | Usuarios, IPs hasheadas o dispositivos bloqueados |
| `model_runs` | Ejecuciones de modelos de anomalías (fase posterior) |

Estados de un caso: `OPEN`, `IN_REVIEW`, `CONFIRMED`, `DISMISSED`, `ACTIONED`.

---

## 8. Estructura de la carpeta

```text
security/analisis-de-fraude/
├── README.md
├── src/
│   └── fraud_service/
│       ├── api/routes/          # endpoints FastAPI
│       ├── core/                # auth, errores, logging
│       ├── db/                  # sesión, modelos, repositorios
│       ├── schemas/             # Pydantic
│       ├── rules/definitions/    # reglas YAML por dominio
│       ├── scoring/             # motor de puntaje y umbrales
│       ├── services/            # ingesta, evaluación, casos, alertas
│       ├── ml/                  # modelo de anomalías (fase posterior)
│       └── workers/             # retención y reconciliación
├── migrations/                  # Alembic
└── tests/
    ├── unit/
    ├── integration/
    └── contract/
```

Los archivos de código se crearán cuando se autorice la implementación. Por ahora solo
existen las carpetas y los marcadores `.gitkeep`.

---

## 9. Integración con `economy-service`

1. `economy-service` escribe un evento en su tabla `SecurityEventOutbox` **dentro de la
   misma transacción** que el movimiento de dinero.
2. Un publicador lo envía a `POST /v1/events` con token de servicio y scope
   `fraud:event`.
3. Si el envío falla, se reintenta con backoff; el evento no se pierde.
4. Para acciones de alto valor puede llamarse `POST /v1/assess` con timeout corto.
5. Si `fraud-service` no responde, se aplica la política acordada (permitir con marca o
   bloquear montos altos). Las reglas críticas del backend siguen activas.

---

## 10. Seguridad del propio servicio

- Solo se expone en la red interna; no se publica al navegador ni al juego.
- Exige token de servicio con scopes `fraud:event`, `fraud:assess` o `fraud:admin`.
- Valida el esquema de cada evento antes de guardarlo.
- Limita el tamaño del cuerpo y la tasa de peticiones.
- No registra datos sensibles ni el cuerpo completo de los eventos.
- Sus migraciones y su base son independientes de los demás servicios.

---

## 11. Decisiones pendientes

1. Ubicación definitiva: esta carpeta o `backend/services/fraud-service/`.
2. Reglas iniciales y umbrales por dominio.
3. Política de retención de eventos y casos.
4. Evaluación síncrona opcional: sí o no en el MVP.
5. Modelo de anomalías: dejar para después del MVP o incluirlo antes.
6. Canal de alertas: bandeja interna, correo o webhook del equipo.
