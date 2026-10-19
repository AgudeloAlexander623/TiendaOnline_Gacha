# Requisitos de Notificaciones — GearQuest

> **Área:** Notificaciones al usuario
> **Estado:** Borrador para revisión — canales de correo y SMS **pendientes de proveedor**
> **Versión:** 1.0 — 2026-10-18
> **Documento base:** `README.MD` (raíz), §4.5

---

## 1. Propósito

Define **qué avisos recibe la persona usuaria, por qué canales y en qué momentos**. Como
los proveedores de correo y SMS todavía no se han elegido, el alcance se presenta por
prioridades.

## 2. Contexto en lenguaje sencillo

Las monedas ganadas **vencen a los 30 días**. Sin avisos, una persona podría perder su
saldo sin enterarse. Por eso el sistema prevé avisarle a tiempo. Hay tres canales posibles:

| Canal | Estado | Descripción |
| --- | --- | --- |
| **Interna** (dentro de la aplicación) | Obligatoria | Avisos visibles en la cuenta del usuario (campana, bandeja o mensajes en pantalla) |
| **Correo electrónico** | Por evaluar | Requiere proveedor y configuración; costo generalmente bajo |
| **SMS** | Por evaluar | Requiere proveedor; **los costos por mensaje deben revisarse antes** de habilitarlo |

## 3. Requisitos funcionales

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-NO-01 | El sistema debe generar notificaciones internas dentro de la aplicación | Must | El usuario ve sus avisos al iniciar sesión, sin depender de terceros |
| FR-NO-02 | Avisar cuando se obtienen monedas (juego o recarga) | Must | Tras jugar o recargar, el usuario recibe confirmación con el monto |
| FR-NO-03 | Avisar con anticipación cuando monedas están por vencer | Must | El aviso indica cuántas monedas y para cuándo, en lenguaje claro |
| FR-NO-04 | Avisar cuando monedas ganadas hayan expirado | Must | El usuario es informado del vencimiento; el registro histórico lo conserva |
| FR-NO-05 | Avisar descuentos disponibles para el usuario | Should | El aviso indica el nivel alcanzado y su vigencia |
| FR-NO-06 | Confirmar operaciones relevantes (pedido, canje, recarga simulada) | Must | Toda operación importante deja constancia visible para el usuario |
| FR-NO-07 | Los canales de correo y SMS solo se activan con proveedor configurado | Must | Sin proveedor, el sistema funciona igualmente usando notificaciones internas |
| FR-NO-08 | Identificar claramente al remitente de los mensajes | Must | Los mensajes indican que provienen de GearQuest y no parecen spam |

## 4. Requisitos no funcionales

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| NFR-NO-01 | Nunca enviar contraseñas, tokens ni datos sensibles por correo o SMS | Must | Revisión de plantillas: sin credenciales ni información privada |
| NFR-NO-02 | Costo de SMS revisado y aprobado antes de habilitarse | Must | Documentado el costo estimado y el límite de mensajes del proyecto |
| NFR-NO-03 | Registro de envíos para diagnóstico | Should | Se puede consultar qué aviso se envió, a quién y cuándo (sin contenido sensible) |
| NFR-NO-04 | Respetar las preferencias del usuario respecto a los canales | Could | El usuario puede activar o desactivar los canales opcionales |

## 5. Dependencias e integraciones

- **economy-service y payments-service:** generan los eventos (monedas, vencimientos,
  recargas) que originan los avisos.
- **Proveedores de correo y SMS:** pendientes de selección; su integración condiciona los
  canales externos (ver [`Infrastructure.md`](./Infrastructure.md)).
- **Frontend:** muestra las notificaciones internas (ver [`Frontend.md`](./Frontend.md)).

## 6. Criterios de aceptación del área

- [ ] Tras jugar una partida, el usuario ve la confirmación de monedas obtenidas.
- [ ] El sistema avisa antes y después de un vencimiento de monedas.
- [ ] Sin proveedor configurado, ningún canal externo falla ni rompe el flujo principal.
- [ ] Ningún mensaje externo contiene datos sensibles.

## 7. Decisiones pendientes

1. Proveedores de correo electrónico y SMS (y sus costos).
2. Días exactos del aviso previo de vencimiento.
3. Plantillas y redacción de los mensajes.
4. Frecuencia máxima de avisos para no incomodar al usuario.

## 8. Referencias

- `README.MD` (raíz): §4.5 (notificaciones), §5 (tecnologías), §11 (costos de SMS).
