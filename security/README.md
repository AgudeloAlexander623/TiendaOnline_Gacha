# Seguridad de GearQuest

> **Estado:** Fase 0 — estructura y documentación base.
> **Código:** todavía no se ha creado código de negocio.
> **Alcance:** análisis de fraude y seguridad de la economía.
> **Base documental:** [`Security.md`](../documentation/Software-requeriments\(SRS\)/Security.md),
> [`Business-Rules.md`](../documentation/Software-requeriments\(SRS\)/Business-Rules.md),
> [`Game.md`](../documentation/Software-requeriments\(SRS\)/Game.md) y
> [`Contrato-entre-servicios.md`](../documentation/Contrato-entre-servicios.md).

---

## 1. Propósito

Esta carpeta reúne el diseño, los contratos y la estructura del área de seguridad de
GearQuest. La seguridad se divide en dos capas que trabajan juntas, pero con
responsabilidades distintas:

1. **Seguridad de la economía (preventiva):** vive dentro de `economy-service`. Impide
   que se creen, gasten o dupliquen monedas de forma indebida y protege el monedero, la
   ruleta, las partidas, los pagos y los descuentos.
2. **Análisis de fraude (detectiva):** vive en un servicio Python aparte
   (`fraud-service`). Recibe eventos, calcula un puntaje de riesgo, abre casos y genera
   alertas. **Nunca sustituye** las validaciones críticas del backend.

---

## 2. Principios

1. **El servidor no confía en el cliente:** ningún saldo, precio, descuento o resultado
   de partida enviado por el navegador o por Godot se acepta sin validación.
2. **Una base de datos por servicio:** `fraud-service` tiene su propia base
   (`gearquest_fraud`). Ningún servicio lee ni escribe las tablas de otro.
3. **El dinero tiene un solo dueño:** `economy-service` es el único que escribe en el
   monedero. La seguridad económica es un módulo suyo, no un microservicio aparte.
4. **El análisis de fraude es complementario:** si el servicio Python falla, las reglas
   críticas del backend siguen activas.
5. **Todo movimiento sensible deja evidencia:** eventos, auditoría y decisiones deben
   poder reconstruirse sin datos personales innecesarios.
6. **Idempotencia y concurrencia:** un reintento o un doble clic no puede duplicar el
   efecto de una operación.
7. **Sin secretos ni datos personales en eventos o logs:** nunca contraseñas, tokens,
   correos completos ni claves de licencia.
8. **Nada se implementa sin autorización:** esta fase es de diseño y estructura.

---

## 3. Arquitectura en una imagen

```text
        ACCIÓN SENSIBLE
(login, partida, tirada, recarga, pedido, canje)
                    │
                    ▼
    ┌───────────────────────────────────┐
    │  economy-service / store / payments│
    │  CAPA PREVENTIVA (síncrona)        │
    │  permisos, reglas, saldo, locks,   │
    │  idempotencia, auditoría           │
    └───────────────────────────────────┘
                    │ evento mínimo
                    ▼
            ┌───────────────┐
            │ outbox (BD)   │
            └───────────────┘
                    │ HTTP + reintentos
                    ▼
    ┌───────────────────────────────────┐
    │  fraud-service (Python/FastAPI)   │
    │  CAPA DETECTIVA (asíncrona)       │
    │  reglas, riesgo, casos, alertas   │
    └───────────────────────────────────┘
                    │
                    ▼
          revisión humana / bloqueo
          (nunca reemplaza la capa 1)
```

---

## 4. Mapa de esta carpeta

| Ruta | Qué contiene |
| --- | --- |
| [`analisis-de-fraude/`](./analisis-de-fraude/README.md) | Diseño del servicio Python `fraud-service`: API, eventos, reglas, riesgo, casos y base de datos |
| [`seguridad-de-economia/`](./seguridad-de-economia/README.md) | Diseño de los controles preventivos, invariantes del monedero y documentación operativa |
| [`seguridad-de-economia/docs/`](./seguridad-de-economia/docs/) | Documentos de modelo de amenazas, invariantes, anti-cheat, gacha, pagos y operación |
| [`seguridad-de-economia/contracts/`](./seguridad-de-economia/contracts/README.md) | Contratos de eventos y evaluación de riesgo (pendientes de escribir) |
| [`seguridad-de-economia/tests/`](./seguridad-de-economia/tests/escenarios-de-abuso.md) | Escenarios de abuso que deben cubrirse con pruebas |
| [`../backend/services/economy-service/src/modules/security/`](../backend/services/economy-service/src/modules/security/README.md) | Estructura prevista del módulo de seguridad dentro de `economy-service` |

---

## 5. Ruta de trabajo

| Fase | Objetivo | Estado |
| --- | --- | --- |
| **F0** | Estructura, modelo de amenazas, invariantes y contratos | 🟡 En curso (esqueletos creados) |
| **F1** | Integridad del monedero: locks, idempotencia, auditoría y reconciliación | ⬜ Pendiente |
| **F2** | Anti-cheat de partidas: nonce, plausibilidad, topes y replay | ⬜ Pendiente |
| **F3** | MVP de `fraud-service`: ingesta, reglas, riesgo y casos | ⬜ Pendiente |
| **F4** | Integración `economy` ↔ `fraud-service` con outbox y circuit breaker | ⬜ Pendiente |
| **F5** | Integridad de gacha, pagos y descuentos | ⬜ Pendiente |
| **F6** | Endurecimiento, pruebas de abuso, CI y cierre documental | ⬜ Pendiente |

> Cada fase debe actualizar la [matriz de trazabilidad](../documentation/Trazabilidad.md)
> y, si cambia una decisión de arquitectura, añadir un ADR en
> [`Decisiones.md`](../documentation/Decisiones.md).

---

## 6. Decisiones abiertas

1. Ubicación definitiva del servicio Python: `security/analisis-de-fraude/` o
   `backend/services/fraud-service/`.
2. Política cuando `fraud-service` no responde: permitir con marca o bloquear montos
   altos.
3. Umbrales iniciales de riesgo y acciones asociadas.
4. Retención de eventos y casos.
5. Uso de reglas solamente en el MVP o inclusión temprana de un modelo de anomalías.
6. Responsable del dominio de seguridad dentro del equipo.

---

## 7. Próximo paso

Completar los documentos de la Fase 0 y aprobar los contratos de eventos y riesgo.
Después de esa aprobación se podrá autorizar la implementación de la Fase 1.
