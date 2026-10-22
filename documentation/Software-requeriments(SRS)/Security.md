# Requisitos de Seguridad — GearQuest

> **Área:** Seguridad y protección de datos
> **Estado:** Borrador para revisión
> **Versión:** 1.0 — 2026-10-18
> **Documento base:** `README.MD` (raíz), §7

---

## 1. Propósito

Reúne las medidas que el sistema **debe** cumplir para proteger a las personas usuarias y
la integridad del negocio. Está redactado en lenguaje claro: la seguridad también es
responsabilidad de todo el equipo, no solo de quien implemente un módulo.

## 2. Contexto en lenguaje sencillo

Una tienda con monedas y descuentos atrae dos problemas típicos:

1. **Robo de cuentas:** que alguien acceda al perfil de otra persona.
2. **Abuso del sistema de recompensas:** obtener monedas o descuentos sin jugar (o jugando
   de forma desleal).

Por eso la premisa del proyecto es: **el servidor no confía en el cliente**. Todo dato que
llegue desde el navegador o desde el juego se valida antes de aceptarse. El análisis
automático de comportamientos sospechosos (servicio Python) será un **complemento**, nunca
la única defensa.

## 3. Requisitos funcionales de seguridad

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-SEC-01 | Las contraseñas se guardan con hash (Argon2id o bcrypt), nunca en texto plano | Must | Inspeccionando la base de datos no aparece ninguna contraseña legible |
| FR-SEC-02 | Toda operación sensible verifica identidad y permisos en el servidor | Must | Sin token válido no hay acceso; un cliente sin rol admin recibe `403` |
| FR-SEC-03 | Todas las entradas de datos se validan antes de procesarse | Must | Datos inválidos se rechazan con `400` y no llegan a la base de datos |
| FR-SEC-04 | Los endpoints sensibles aplican límite de solicitudes (rate limit) | Must | Un flujo automatizado de peticiones recibe bloqueo temporal |
| FR-SEC-05 | El entorno publicado usa HTTPS | Must | Toda comunicación viaja cifrada; el navegador muestra el candado |
| FR-SEC-06 | CORS restringido: solo orígenes conocidos pueden llamar a la API | Must | Una página ajena no puede consumir la API en nombre de un usuario |
| FR-SEC-07 | Los secretos viven en variables de entorno; nunca en el repositorio | Must | El historial de Git no contiene claves reales; `.env.example` usa valores ficticios |
| FR-SEC-08 | Los mensajes de error no revelan información interna | Must | Ninguna respuesta incluye rutas, versiones, consultas SQL o trazas |
| FR-SEC-09 | No se registran (log) contraseñas, tokens ni datos sensibles | Must | Búsqueda en logs: sin coincidencias de esos datos |
| FR-SEC-10 | El análisis de patrones sospechosos (Python) es complementario | Should | Sus hallazgos alertan, pero las validaciones críticas siguen en el backend |
| FR-SEC-11 | Las llamadas entre microservicios se autentican con un token interno de alcance limitado | Must | Un servicio sin token interno válido recibe `401`; el token lleva el alcance de la operación y nunca se entrega al usuario final |

## 4. Integridad de monedas y descuentos

Estas reglas protegen el "dinero" del proyecto y se detallan también en
[`Business-Rules.md`](./Business-Rules.md):

1. El cliente **no** puede enviar un saldo para que el servidor lo acepte sin validación.
2. El servidor valida los resultados de las partidas **antes** de otorgar monedas.
3. Las operaciones que actualizan saldos o canjean descuentos consideran **concurrencia y
   peticiones repetidas**.
4. Los movimientos se conservan en un historial auditable.
5. Un vencimiento o consumo **no borra** el registro original.
6. El saldo disponible se calcula en servidor, según tipo de moneda y vencimiento.
7. Reglas, topes y elegibilidad de descuentos se aplican **únicamente** en el backend.

## 5. Requisitos no funcionales

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| NFR-SEC-01 | Pruebas de seguridad básicas antes de cada despliegue | Must | Existen pruebas automatizadas que cubren permisos, abuso de recompensas, concurrencia y vencimientos, y el checklist de despliegue las ejecuta |
| NFR-SEC-02 | Revisión de dependencias antes de publicar | Should | Se revisan vulnerabilidades conocidas de las librerías usadas |
| NFR-SEC-03 | Mínimo dato personal: solo lo necesario | Must | Formularios que piden únicamente lo imprescindible |
| NFR-SEC-04 | Cultura de seguridad en el equipo | Must | Nada de credenciales en chats, pantallazos o commits |

> Estas medidas son **objetivos de implementación**: no certifican que el sistema ya sea
> seguro. La seguridad se demuestra con pruebas, no con declaraciones.

## 6. Criterios de aceptación del área

- [ ] Ninguna contraseña aparece en texto plano (ni en base de datos ni en logs).
- [ ] Todas las rutas sensibles exigen autenticación y autorización correctas.
- [ ] Ningún endpoint acepta un saldo o precio fijado por el cliente.
- [ ] El repositorio está libre de secretos reales.
- [ ] HTTPS activo en el entorno publicado.

## 7. Decisiones pendientes

1. Alcance y reglas del análisis antifraude (servicio Python).
2. Política de reintentos y bloqueo ante sospecha de abuso.
3. Proveedores de correo y SMS (con sus costos) para notificaciones.
4. Vida y rotación del token interno de servicio a servicio, y su almacén de secretos.

> **Ya resueltas:** la estrategia de autenticación de usuarios (JWT con token de refresco
> rotativo, ADR-0009) y el mecanismo de autenticación entre servicios (token interno con
> alcance, definido en [`Contrato-entre-servicios.md`](../Contrato-entre-servicios.md) §10 y
> exigido por `FR-SEC-11`).

## 8. Referencias

- `README.MD` (raíz): §7 (seguridad y buenas prácticas), §7.1 (integridad de monedas).
- [`Contrato-entre-servicios.md`](../Contrato-entre-servicios.md): autenticación
  service-to-service (`FR-SEC-11`).
- [`Business-Rules.md`](./Business-Rules.md): reglas de integridad de monedas y descuentos.
- [`Trazabilidad.md`](../Trazabilidad.md): estado real de cada requisito de este documento.
