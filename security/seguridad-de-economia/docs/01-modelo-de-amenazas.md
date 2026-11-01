# 01 · Modelo de amenazas de la economía

> **Estado:** esqueleto de Fase 0 — pendiente de completar y aprobar.
> **Área:** seguridad de la economía.
> **Referencias:** `README.MD` §7, `Security.md`, `Business-Rules.md`, `Game.md`.

---

## 1. Propósito

Identificar qué activos protege GearQuest, quién podría atacarlos y con qué controles
cuenta el sistema antes y después de esta área.

## 2. Activos protegidos

- [ ] Saldo de monedas ganadas y compradas.
- [ ] Lotes, movimientos e historial del monedero.
- [ ] Recompensas de la ruleta y probabilidades.
- [ ] Resultados y recompensas de las partidas.
- [ ] Recargas, pagos y reembolsos simulados.
- [ ] Descuentos, pedidos y canjes del mercader.
- [ ] Claves de licencia y datos de pedidos.
- [ ] Identidad, sesiones y tokens de usuario.
- [ ] Tokens internos entre servicios.
- [ ] Evidencia de auditoría y eventos de seguridad.

## 3. Actores y motivaciones

| Actor | Motivación posible |
| --- | --- |
| Jugador curioso | Probar límites, repetir recompensas, manipular el cliente |
| Atacante externo | Robar cuentas, automatizar abuso, alterar saldos |
| Usuario con varias cuentas | Multiplicar recompensas o evadir bloqueos |
| Empleado o administrador | Acceso indebido o error operativo |
| Servicio comprometido | Llamadas internas no autorizadas |

## 4. Amenazas principales

- [ ] Inyección de saldo o resultado de partida desde el cliente.
- [ ] Doble gasto por concurrencia o reintentos.
- [ ] Replay de sesiones o de operaciones internas.
- [ ] Manipulación de la ruleta o de sus pesos.
- [ ] Crédito duplicado por pagos o recargas.
- [ ] Reutilización de descuentos.
- [ ] Fuerza bruta, credential stuffing o robo de sesión.
- [ ] Escalada de privilegios o uso indebido de tokens de servicio.
- [ ] Fuga de claves de licencia o datos personales.
- [ ] Alteración o borrado de evidencia.

## 5. Controles previstos

| Amenaza | Control preventivo | Control detectivo |
| --- | --- | --- |
| Saldo inyectado | Cálculo y validación en servidor | Evento de ajuste o inconsistencia |
| Doble gasto | Transacción, locks, idempotencia | Alerta de saldo negativo o drift |
| Replay | Nonce, estado de sesión, unicidad | Regla de sesión repetida |
| Ruleta manipulada | CSPRNG y pesos del servidor | Regla de frecuencia anómala |
| Pago duplicado | Idempotencia y estado del pago | Conciliación y caso |
| Descuento reutilizado | Uso único y elegibilidad | Regla de canjes repetidos |
| Robo de cuenta | JWT, refresh rotativo, rate limit | Reglas de acceso anómalo |
| Token interno indebido | Scopes y audiencia | Alerta de `401/403` |
| Fuga de secretos | Cifrado, redacción y permisos | Búsqueda de secretos y logs |
| Evidencia alterada | Append-only y hash chain | Verificación periódica |

## 6. Preguntas abiertas

1. ¿Qué montos o acciones se consideran de alto valor?
2. ¿Qué amenazas quedan fuera del alcance académico?
3. ¿Qué datos personales mínimos se pueden usar para el análisis?
4. ¿Cuál es el apetito de riesgo del equipo?

## 7. Criterio de cierre

- [ ] Tabla de amenazas revisada por el equipo.
- [ ] Cada amenaza tiene al menos un control y una prueba asociada.
- [ ] Las amenazas fuera de alcance están justificadas.
