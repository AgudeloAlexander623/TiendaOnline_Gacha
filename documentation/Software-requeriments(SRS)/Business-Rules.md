# Reglas de Negocio — GearQuest

> **Área:** Reglas de negocio (monedas, descuentos, recargas y pedidos)
> **Estado:** Borrador para revisión — contiene decisiones **pendientes**
> **Versión:** 1.0 — 2026-10-18
> **Documento base:** `README.MD` (raíz), §4

---

## 1. Propósito

Este es el documento **más cercano al negocio**: explica las reglas que hacen que GearQuest
sea lo que es. Está escrito en lenguaje llano a propósito, porque estas reglas las debe
entender todo el equipo, con o sin perfil técnico.

## 2. El corazón del sistema: las monedas

GearQuest tiene una **moneda virtual interna** con dos orígenes distintos:

```text
  ┌─────────────────────────┐      ┌──────────────────────────────┐
  │  MONEDAS GANADAS        │      │  MONEDAS COMPRADAS           │
  │  (jugando)              │      │  (recarga simulada)          │
  │  Vencen a los 30 días   │      │  No vencen nunca             │
  └─────────────────────────┘      └──────────────────────────────┘
```

- **Ganadas:** se obtienen jugando la **aventura** y **vencen a los 30 días**.
- **Compradas:** provienen de una **recarga simulada** (sin dinero real) y **no vencen**.

Con esas monedas se gasta en la **ruleta** (tiradas con recompensas), se **canjea en la
tienda del mercader** del mapa y se accede a **descuentos** en la tienda.

## 3. Tabla de descuentos

| Nivel | Descuento |
| --- | --- |
| Nivel 1 | 10 % |
| Nivel 2 | 30 % |
| Nivel 3 | 50 % |
| Nivel 4 | 70 % |
| Nivel 5 | 90 % |

> Las monedas necesarias para cada nivel y las condiciones de canje **aún no están
> definidas** (ver §7, decisiones pendientes).

## 4. Requisitos funcionales

### 4.1. Monedas y vencimientos

| ID | Regla | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-BR-01 | El sistema distingue monedas ganadas de monedas compradas | Must | El monedero muestra ambos tipos por separado, con su origen |
| FR-BR-02 | Las monedas ganadas vencen 30 días después de obtenerlas | Must | Pasado el plazo, dejan de estar disponibles para gastar |
| FR-BR-03 | Las monedas compradas nunca vencen | Must | Su saldo se conserva indefinidamente |
| FR-BR-04 | El saldo disponible lo calcula **el servidor**, considerando tipo y vencimiento | Must | El cliente no puede afirmar su propio saldo |
| FR-BR-05 | Un vencimiento genera un movimiento nuevo; el registro original no se borra | Must | El historial permite reconstruir qué pasó y cuándo, en cualquier momento |
| FR-BR-06 | Cada ganancia, consumo o vencimiento queda en un historial auditable | Must | El usuario puede consultar su historial completo de movimientos |

### 4.2. Descuentos

| ID | Regla | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-BR-07 | Existen cinco niveles de descuento (10 %, 30 %, 50 %, 70 %, 90 %) | Must | El sistema conoce los cinco niveles y los muestra |
| FR-BR-08 | Antes de aplicar un descuento, el servidor verifica elegibilidad, saldo, vigencia y límites | Must | Un canje no válido se rechaza con un motivo claro |
| FR-BR-09 | El precio final siempre lo calcula el servidor | Must | No existe ninguna ruta en la que el navegador determine el descuento por su cuenta |

### 4.3. Recargas simuladas

| ID | Regla | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-BR-10 | Las recargas son simuladas: no se procesa dinero real ni se piden datos bancarios | Must | En ningún punto del formulario aparece una tarjeta ni un cobro real |
| FR-BR-11 | La aplicación identifica de forma evidente que la operación es simulada | Must | La persona entiende, antes de confirmar, que no se gasta dinero |

### 4.4. Pedidos

| ID | Regla | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-BR-12 | Un pedido usa los precios vigentes del catálogo al momento de confirmarse | Must | Cambios de precio posteriores no alteran el pedido ya creado |
| FR-BR-13 | Confirmar un pedido descuenta el inventario disponible | Must | El stock nunca queda negativo por un pedido |
| FR-BR-14 | El descuento aplicado se calcula en el servidor antes de confirmar el pedido | Must | El total final refleja exactamente el descuento mostrado en el resumen del pedido |

### 4.5. Integridad de las operaciones

| ID | Regla | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-BR-15 | Las operaciones de saldo son seguras ante peticiones repetidas o simultáneas | Must | Doble clic o reintento no gastan monedas dos veces |
| FR-BR-16 | El cliente nunca envía un saldo que el servidor acepte sin validar | Must | Los saldos provienen exclusivamente del cálculo del servidor |

## 5. Requisitos no funcionales

| ID | Regla | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| NFR-BR-01 | Las reglas viven en el backend, no en la interfaz | Must | Revisar el código confirma que cálculos de precio y saldo solo existen en el servidor |
| NFR-BR-02 | Toda regla crítica tiene prueba automatizada | Must | Vencimientos, canjes y concurrencia cubiertos por pruebas |

## 6. Historial y trazabilidad (visión general)

```text
  Monedero ──▶ movimientos:  +150 (ganada, aventura, hoy)
                              +500 (comprada, recarga simulada, hoy)
                              −100 (consumida, tirada en la ruleta, hoy)
                              −80  (consumida, canje en el mercader, hoy)
                              −150 (vencida, 30 días después)
```

Nada se borra: cada línea es un registro permanente. Así el sistema puede responder
siempre la pregunta "¿qué pasó con mis monedas?".

## 7. Decisiones pendientes (importante)

1. **Cantidad de monedas** necesaria para cada nivel de descuento.
2. **Vigencia y límites** de los descuentos (un descuento ¿se usa una vez? ¿por tiempo?).
3. **Orden de consumo** de monedas: ¿se gastan primero las ganadas (que vencen) o las
   compradas?
4. **Coste, probabilidades y recompensas** de las tiradas de la ruleta.
5. **Contenido del mercader y precios de canje** en monedas.
6. **Aviso previo** de vencimiento: ¿con cuántos días de anticipación se avisa?

## 8. Referencias

- `README.MD` (raíz): §4 (funcionalidades previstas), §7.1 (integridad de monedas).
- [`Game.md`](./Game.md): alcance del juego (aventura, mercader y ruleta) del que salen estas reglas.
- `frontend/ReadmeFrontEnd.md`: descripción del monedero y los niveles de descuento.
