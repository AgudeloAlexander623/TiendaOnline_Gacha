# Requisitos del Backend — GearQuest

> **Área:** Backend (API y reglas de negocio)
> **Estado:** Borrador para revisión
> **Versión:** 1.0 — 2026-10-18
> **Tecnología de referencia:** Node.js + Express + TypeScript, Prisma ORM, PostgreSQL
> **Documento base:** `backend/README.md` y `README.MD` (raíz), secciones 3, 6 y 7

---

## 1. Propósito

Define **qué debe ofrecer el backend**: los cuatro servicios, sus funciones y la calidad
esperada del código. Está escrito para el equipo y para quien evalúe el proyecto, sin
requerir conocimientos de programación para entenderlo.

## 2. Contexto en lenguaje sencillo

El backend es el **cerebro** de GearQuest. El navegador y el juego solo *piden*
información; quien **decide** si una operación es válida es el servidor: el precio real de
un producto, el saldo de monedas, si un descuento aplica o si un usuario tiene permiso.

Está dividido en **cuatro servicios independientes** (microservicios), cada uno con su
propia base de datos. Ventajas: si un área falla, las demás siguen funcionando; y el
equipo de tres puede avanzar en paralelo sin pisarse el código.

## 3. Alcance

| Servicio | Responsabilidad | Puerto | Base de datos |
| --- | --- | --- | --- |
| `identity-service` | Registro, inicio de sesión, usuarios y roles | 3001 | `gearquest_identity` |
| `store-service` | Catálogo, inventario, carrito, pedidos y descuentos | 3002 | `gearquest_store` |
| `economy-service` | Monedero, movimientos, gacha y recompensas | 3003 | `gearquest_economy` |
| `payments-service` | Pagos y recargas simuladas | 3004 | `gearquest_payments` |
| `packages/common` | Código y utilidades compartidas (`@gearquest/common`) | — | — |

## 4. Requisitos funcionales

### 4.1. Transversales a todos los servicios

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-BE-01 | Cada servicio debe exponer un endpoint de salud (`/health`) | Must | Responde `200` con el estado del servicio |
| FR-BE-02 | Toda entrada de datos debe validarse con esquemas (Zod) y rechazarse si es inválida | Must | Una petición malformada recibe `400` con mensaje claro, sin llegar a la base de datos |
| FR-BE-03 | Cada servicio debe registrar eventos (logs) útiles para diagnóstico | Must | Los logs identifican el servicio y la operación; **nunca** contienen contraseñas ni tokens |
| FR-BE-04 | Los errores deben responder con el código HTTP adecuado y un mensaje genérico | Must | Ninguna respuesta expone stack trace, rutas internas ni datos de configuración |

### 4.2. identity-service (identidad y usuarios)

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-BE-05 | Registrar un usuario con correo y contraseña, impidiendo duplicados | Must | No es posible registrar dos veces el mismo correo |
| FR-BE-06 | Iniciar sesión y entregar una credencial de sesión válida | Must | Solo con credenciales correctas se obtiene acceso; los intentos fallidos se limitan |
| FR-BE-07 | Consultar y actualizar el perfil del usuario autenticado | Must | Un usuario solo ve y edita **su propio** perfil |
| FR-BE-08 | Diferenciar roles (cliente / administrador) y denegar acciones no permitidas | Must | Un cliente no puede acceder a endpoints de administración (respuesta `403`) |

### 4.3. store-service (tienda)

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-BE-09 | Listar el catálogo con paginación y mostrar el detalle de cada producto | Must | La lista pagina sin duplicados ni huecos; el detalle incluye precio, imágenes y disponibilidad |
| FR-BE-10 | Administrar productos e inventario (crear, editar, eliminar, reponer) | Must | Solo usuarios autorizados pueden hacerlo; todo cambio queda registrado |
| FR-BE-11 | Gestionar el carrito: agregar, quitar y consultar productos | Must | El carrito refleja siempre el precio vigente **calculado por el servidor** |
| FR-BE-12 | Crear y consultar pedidos, descontando el inventario de forma segura | Must | No se puede comprar por encima del stock disponible, ni con el mismo carrito dos veces |
| FR-BE-13 | Consultar y aplicar descuentos verificando elegibilidad, saldo y límites | Must | Un descuento no aplicable se rechaza en el servidor, aunque el cliente lo pida |

### 4.4. economy-service (economía del juego)

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-BE-14 | Consultar el monedero con el saldo desglosado por tipo de moneda y vencimiento | Must | Distingue monedas ganadas vigentes, ganadas por vencer y compradas |
| FR-BE-15 | Registrar cada movimiento (ganancia, consumo, vencimiento) en un historial auditable | Must | El historial no se puede editar ni borrar desde la aplicación |
| FR-BE-16 | Ejecutar tiradas de gacha descontando monedas y entregando recompensas | Must | Solo se tira con saldo suficiente; cada tirada queda registrada |
| FR-BE-17 | Validar en el servidor los resultados del minijuego antes de otorgar monedas | Must | El cliente **nunca** envía un saldo que el servidor acepte sin validar |
| FR-BE-18 | Aplicar el vencimiento de monedas ganadas a los 30 días | Must | Al vencer, el saldo disponible baja pero el registro original **no** desaparece |
| FR-BE-19 | Proteger las operaciones de saldo ante peticiones repetidas o concurrentes | Must | Dos clics simultáneos no gastan ni otorgan monedas dos veces |

### 4.5. payments-service (recargas simuladas)

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-BE-20 | Registrar recargas simuladas identificándolas claramente como simuladas | Must | No se capturan datos de tarjetas ni dinero real; la interfaz lo indica de forma evidente |
| FR-BE-21 | Acreditar las monedas compradas como monedas **sin vencimiento** | Must | Tras la recarga, el monedero refleja el aumento y esas monedas nunca expiran |

## 5. Requisitos no funcionales

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| NFR-BE-01 | TypeScript estricto en todo el backend, evitando `any` innecesarios | Must | `npm run typecheck` pasa sin errores en todos los workspaces |
| NFR-BE-02 | Pruebas automatizadas (Vitest + Supertest) sobre reglas críticas | Must | Cubiertas: saldos, vencimientos, descuentos, permisos y pedidos; `npm test` en verde |
| NFR-BE-03 | Código con estilo uniforme (ESLint + Prettier) | Must | `npm run lint` y `npm run format:check` sin incidencias |
| NFR-BE-04 | Contratos de API claros y en formato JSON predecible | Must | Cada endpoint documenta entrada, salida y errores; los cambios se documentan |
| NFR-BE-05 | Seguridad base: Helmet, CORS restringido y límite de solicitudes | Must | Cabeceras de seguridad presentes; rutas no autorizadas reciben `401/403` |
| NFR-BE-06 | Configuración por variables de entorno, con plantilla `.env.example` por servicio | Must | Un nuevo integrante levanta el entorno siguiendo solo el README |
| NFR-BE-07 | Independencia entre servicios: el fallo de uno no detiene a los demás | Should | Detener un servicio no impide consultar los otros |
| NFR-BE-08 | Arranque y despliegue reproducibles mediante contenedores | Should | El mismo comando levanta el entorno en cualquier máquina con Docker |

## 6. Dependencias e integraciones

- **PostgreSQL:** cuatro bases de datos, una por servicio (ver [`Database.md`](./Database.md)).
- **Frontend:** consumidor principal de las APIs por HTTP REST.
- **Juego (Godot):** consume `economy-service` para monedas, tiradas y resultados
  (contrato por definir — ver [`Game.md`](./Game.md)).
- **Servicio Python (futuro):** recibirá eventos para análisis; **no sustituye** ninguna
  validación del backend (ver [`Security.md`](./Security.md)).
- **Entre servicios:** solo por contratos explícitos. Ningún servicio puede modificar
  directamente las tablas de otro.

## 7. Criterios de aceptación del área

- [ ] Los cuatro servicios arrancan y responden su endpoint de salud.
- [ ] Flujo completo de extremo a extremo: registro → catálogo → carrito → pedido → monedero.
- [ ] Ningún endpoint permite fijar un saldo o un precio desde el cliente.
- [ ] Las pruebas de reglas críticas pasan de forma local y automatizada.
- [ ] No hay secretos ni credenciales en el repositorio.

## 8. Decisiones pendientes

1. Estrategia de autenticación (JWT vs. sesiones) y tiempo de expiración.
2. Contratos definitivos de API (rutas, versionado y errores estándar).
3. Modelo de datos de cada servicio (modelos en `schema.prisma`).
4. Estrategia de concurrencia y transacciones en operaciones de saldo.
5. Herramientas de integración continua (CI) y cobertura de pruebas.

## 9. Referencias

- `README.MD` (raíz): §3 (decisiones), §6 (arquitectura), §7 (seguridad).
- `backend/README.md`: estructura, comandos y bases de datos.
