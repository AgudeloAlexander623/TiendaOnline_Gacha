# Casos de Uso — Notificaciones

> **Dominio:** Notificaciones · **Alcance:** avisos internos en la aplicación (correo y SMS, pendientes de proveedor)
> **Estado:** Borrador para revisión · **Versión:** 1.0 — 2026-10-18
> **Requisitos de referencia:** [`SRS · Notifications.md`](../Software-requeriments\(SRS\)/Notifications.md)

---

## 1. Introducción

Las monedas ganadas **vencen a los 30 días**, así que el sistema necesita avisar a tiempo.
Este documento describe cómo la persona consulta sus avisos dentro de la aplicación y cómo
puede decidir qué quiere recibir. Los canales externos (correo y SMS) se activarán cuando
exista un proveedor confirmado; mientras tanto, todo funciona con avisos internos.

## 2. Actores

| Actor | Descripción en este dominio |
| --- | --- |
| **Cliente** | Revisa sus avisos y configura qué canales quiere usar |

## 3. Mapa de casos de uso

| Caso | Nombre | Prioridad |
| --- | --- | --- |
| UC-17 | Consultar los avisos internos | Must |
| UC-18 | Configurar las preferencias de aviso | Could |

## 4. Detalle de los casos de uso

### UC-17 · Consultar los avisos internos

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero ver mis avisos para enterarme de mis monedas, vencimientos y descuentos |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02) |
| Disparador | Abre la bandeja de avisos (campana o sección "Notificaciones") |
| Prioridad | Must |

**Flujo principal**

1. El cliente abre la bandeja de avisos.
2. El servidor devuelve los avisos ordenados por fecha, lo más reciente primero.
3. La persona lee uno y queda marcado como leído.
4. Cada aviso indica su motivo con claridad: monedas obtenidas, vencimiento próximo,
   monedas expiradas, descuento disponible o confirmación de una operación.

**Flujos alternativos y de excepción**

- *Sin avisos:* se muestra un mensaje tranquilo ("todo al día").
- *Sesión expirada:* se pide iniciar sesión.

**Resultado:** el cliente se entera de lo importante sin necesidad de correo ni SMS; si más
adelante activa esos canales, recibiría los mismos avisos allí (FR-NO-07).

**Requisitos asociados (SRS):** FR-NO-01 · FR-NO-03 · FR-NO-04 · FR-NO-06

---

### UC-18 · Configurar las preferencias de aviso

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero elegir qué avisos recibo y por qué canal para no saturarme |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02) |
| Disparador | Guarda los cambios en "Preferencias de aviso" |
| Prioridad | Could |

**Flujo principal**

1. El cliente abre "Preferencias de aviso".
2. Activa o desactiva los canales y los tipos de aviso disponibles.
3. Guarda los cambios.
4. El sistema aplica esas preferencias a los avisos futuros.

**Flujos alternativos y de excepción**

- *Canal no disponible:* si un proveedor (correo o SMS) aún no está configurado, el canal
  aparece deshabilitado con una explicación breve.
- *Sin preferencias guardadas:* el sistema usa los avisos internos por defecto.

**Resultado:** el cliente recibe solo lo que pidió, por el canal que eligió.

**Requisitos asociados (SRS):** FR-NO-07 · NFR-NO-04
