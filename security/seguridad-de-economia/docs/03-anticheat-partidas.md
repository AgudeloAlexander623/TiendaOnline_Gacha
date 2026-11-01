# 03 · Anti-cheat de partidas

> **Estado:** esqueleto de Fase 0 — pendiente de completar y aprobar.
> **Área:** seguridad de la economía.
> **Referencias:** `FR-BE-17`, `FR-GA-18` a `FR-GA-22`, `NFR-GA-02`, contrato §7.

---

## 1. Propósito

Evitar que un cliente manipulado obtenga monedas sin jugar o con resultados imposibles.
El servidor es la fuente de verdad; Godot solo reporta lo que ocurrió.

## 2. Ciclo de una sesión

```text
Juego pide iniciar sesión ──▶ servidor crea GameSession(STARTED) + nonce
Juego termina la partida ───▶ envía resultado firmado o identificado
Servidor valida ───────────▶ FINISHED / ABANDONED / REJECTED
Servidor acredita ─────────▶ lote EARNED con vencimiento a 30 días
```

## 3. Controles previstos

- [ ] La sesión la crea el servidor, no el cliente.
- [ ] La sesión tiene nonce y tiempo máximo de vida.
- [ ] Una sesión solo se valida una vez.
- [ ] La sesión pertenece al usuario autenticado.
- [ ] El resultado incluye duración, mapa y contadores.
- [ ] El servidor calcula las monedas; el cliente nunca las envía.
- [ ] Se aplican topes por sesión, hora y día.
- [ ] Se detecta replay y sesión expirada.
- [ ] Se verifican combinaciones imposibles (jefe sin enemigos, tiempo mínimo, items
  fuera de la tabla de drops).
- [ ] Los resultados dudosos se retienen para revisión.

## 4. Señales de manipulación

- [ ] Puntaje superior al máximo teórico del mapa.
- [ ] Partida terminada antes del tiempo mínimo.
- [ ] Enemigos o jefes derrotados incoherentes con el mapa.
- [ ] Items obtenidos que no existen en la tabla de drops.
- [ ] Resultados idénticos repetidos muchas veces.
- [ ] Muchas sesiones por minuto desde la misma cuenta o IP.
- [ ] Ganancias siempre en el tope máximo.
- [ ] Reloj del cliente adelantado o atrasado.

## 5. Respuesta

| Señal | Acción |
| --- | --- |
| Leve | Registrar y permitir |
| Media | Marcar y limitar recompensa |
| Grave | Rechazar sesión y abrir caso |
| Crítica | Bloqueo temporal y alerta |

## 6. Pruebas mínimas

- [ ] Puntaje inventado por el cliente.
- [ ] Replay de una sesión ya validada.
- [ ] Sesión de otro usuario.
- [ ] Partida de duración imposible.
- [ ] Items fuera del catálogo.
- [ ] Superación del tope diario.
- [ ] `fraud-service` caído durante la validación.

## 7. Decisiones pendientes

1. Fórmula de puntaje por mapa.
2. Tiempo mínimo por mapa.
3. Topes por hora y por día.
4. Si el resultado se firma con HMAC o solo se valida por plausibilidad.
5. Qué resultados se retienen y por cuánto tiempo.
