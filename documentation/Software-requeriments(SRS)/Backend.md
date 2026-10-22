# Requisitos del Backend — GearQuest

> **Área:** Backend (API y reglas de negocio)
> **Estado:** Borrador para revisión
> **Versión:** 1.1 — 2026-10-22
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
equipo de cuatro puede avanzar en paralelo sin pisarse el código.

## 3. Alcance

| Servicio | Responsabilidad | Puerto | Base de datos |
| --- | --- | --- | --- |
| `identity-service` | Registro, inicio de sesión, usuarios y roles | 3001 | `gearquest_identity` |
| `store-service` | Catálogo, inventario, carrito, pedidos y descuentos | 3002 | `gearquest_store` |
| `economy-service` | Monedero, movimientos, ruleta, inventario del jugador y recompensas | 3003 | `gearquest_economy` |
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
| FR-BE-24 | Listar y consultar el catálogo de **periféricos** con sus atributos propios (tipo de conexión, DPI, número de teclas, garantía, compatibilidad) | Must | El listado pagina y filtra por familia; el detalle incluye los atributos del periférico y el stock disponible |
| FR-BE-25 | Listar y consultar el catálogo de **licencias** sin exponer la clave, y entregar la clave comprada **solo a quien la compró** | Must | Ningún listado de licencias incluye la clave; la clave solo se entrega en el detalle del pedido de su propietario |
| FR-BE-26 | Listar y consultar el catálogo de **juegos** con sus atributos propios (género, plataforma, clasificación por edad, desarrollador) | Must | El listado filtra por género, plataforma y clasificación; el detalle incluye los atributos del juego y el stock disponible |
| FR-BE-27 | Gestionar **un solo carrito y un solo checkout** capaces de mezclar las tres familias de producto | Must | Un carrito puede contener periféricos, licencias y juegos a la vez, y se confirma en un único pedido y un único pago |
| FR-BE-28 | **Revalidar** precio, stock y estado en el checkout para cualquier familia de producto | Must | El checkout vuelve a consultar el catálogo antes de cobrar; si el precio o el stock ya no cuadran, se rechaza **sin cobrar nada** |

> **Catálogo por familias (v1.1):** el catálogo del `store-service` se separa en **tres
> dominios** —periféricos, licencias y juegos— cada uno con sus propios atributos y sus
> propias rutas (`/api/v1/peripherals`, `/api/v1/licenses`, `/api/v1/games`), **dentro del
> mismo servicio**. El carrito, el pedido, el inventario y los descuentos **no cambian**.
> El diseño completo está en [`Catalogo-por-Familias.md`](../Catalogo-por-Familias.md) y
> la decisión en [ADR-0017](../Decisiones.md).

### 4.4. economy-service (economía del juego)

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-BE-14 | Consultar el monedero con el saldo desglosado por tipo de moneda y vencimiento | Must | Distingue monedas ganadas vigentes, ganadas por vencer y compradas |
| FR-BE-15 | Registrar cada movimiento (ganancia, consumo, vencimiento) en un historial auditable | Must | El historial no se puede editar ni borrar desde la aplicación |
| FR-BE-16 | Ejecutar tiradas de la ruleta (gacha) descontando monedas y entregando recompensas | Must | Solo se tira con saldo suficiente; cada tirada queda registrada |
| FR-BE-17 | Validar en el servidor los resultados de la partida de aventura antes de otorgar monedas | Must | El cliente **nunca** envía un saldo que el servidor acepte sin validar |
| FR-BE-18 | Aplicar el vencimiento de monedas ganadas a los 30 días | Must | Al vencer, el saldo disponible baja pero el registro original **no** desaparece |
| FR-BE-19 | Proteger las operaciones de saldo ante peticiones repetidas o concurrentes | Must | Dos clics simultáneos no gastan ni otorgan monedas dos veces |
| FR-BE-22 | Canjear monedas por objetos en la tienda del mercader, con la misma validación que una tirada | Must | El canje descuenta el precio en monedas, entrega el objeto al inventario y queda registrado; sin saldo suficiente se rechaza |
| FR-BE-23 | Revertir un débito ya aplicado cuando la operación posterior del flujo falla | Must | Si el checkout o el canje falla después de debitar, el saldo vuelve a su valor anterior y queda constancia del movimiento compensatorio |

### 4.5. payments-service (recargas simuladas)

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-BE-20 | Registrar recargas simuladas identificándolas claramente como simuladas | Must | No se capturan datos de tarjetas ni dinero real; la interfaz lo indica de forma evidente |
| FR-BE-21 | Acreditar las monedas compradas como monedas **sin vencimiento** | Must | Tras la recarga, el monedero refleja el aumento y esas monedas nunca expiran |

## 5. Requisitos no funcionales

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| NFR-BE-01 | TypeScript estricto en todo el backend, evitando `any` innecesarios | Must | `npm run typecheck` pasa sin errores en todos los workspaces |
| NFR-BE-02 | Pruebas automatizadas (Vitest + Supertest) sobre reglas críticas | Must | `npm test` en verde y **cada** regla crítica de saldo, vencimiento, descuento, permiso y pedido cubierta por al menos una prueba |
| NFR-BE-03 | Código con estilo uniforme (ESLint + Prettier) | Must | `npm run lint` y `npm run format:check` sin incidencias |
| NFR-BE-04 | Contratos de API claros y en formato JSON predecible | Must | Cada endpoint documenta entrada, salida y errores en [`API/openapi.yaml`](../API/openapi.yaml); los cambios se documentan |
| NFR-BE-05 | Seguridad base: Helmet, CORS restringido y límite de solicitudes | Must | Cabeceras de seguridad presentes; rutas no autorizadas reciben `401/403` |
| NFR-BE-06 | Configuración por variables de entorno, con plantilla `.env.example` por servicio | Must | Un nuevo integrante levanta el entorno siguiendo solo el README |
| NFR-BE-07 | Independencia entre servicios: el fallo de uno no detiene a los demás | Should | Detener un servicio no impide consultar los otros |
| NFR-BE-08 | Arranque y despliegue reproducibles mediante contenedores | Should | El mismo comando levanta el entorno en cualquier máquina con Docker |

> **Cómo se leen los criterios de aceptación:** describen el estado **objetivo** del
> requisito, no una garantía del estado actual. El estado real de cada requisito, con
> evidencia en el código, está en la
> [matriz de trazabilidad](../Trazabilidad.md). Un criterio que hoy no se cumple sigue
> siendo un criterio: por eso la matriz lo marca como ⚠️ o ⬜ y no como ✅.

## 6. Dependencias e integraciones

- **PostgreSQL:** cuatro bases de datos, una por servicio (ver [`Database.md`](./Database.md)).
- **Frontend:** consumidor principal de las APIs por HTTP REST.
- **Juego (Godot):** consume `economy-service` para monedas, tiradas y validación de
  partidas (contrato definido en
  [`Contrato-entre-servicios.md`](../Contrato-entre-servicios.md) §7-§8; alcance del juego
  en [`Game.md`](./Game.md)).
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

1. Tiempo de expiración del token de acceso y política exacta de rotación del token de
   refresco. *(La estrategia JWT con refresco rotativo ya está implementada — ADR-0009.)*
2. Mecanismo de idempotencia: qué clave envía el cliente, quién la genera y cuánto se
   conserva. *(Ver `FR-BE-19` y `FR-DB-09`.)*
3. Política de compensación entre servicios cuando una operación falla después de haber
   debitado. *(Ver `FR-BE-23`.)*
4. Herramientas de integración continua (CI) y cobertura de pruebas. *(Ver `FR-INF-08`.)*
5. Cuándo se extrae cada familia del catálogo a su propio microservicio. *(La separación
   de dominio ya está decidida —ADR-0017—; la de procesos, no. Ver
   [`Catalogo-por-Familias.md`](../Catalogo-por-Familias.md) §3.)*

> **Ya resueltas** (no dependen de una decisión pendiente): el contrato público de la API
> está publicado en [`API/openapi.yaml`](../API/openapi.yaml), el modelo de datos de cada
> servicio está definido en los `schema.prisma` (26 modelos, ver
> [`Diccionario-de-Datos.md`](../Diccionario-de-Datos.md)) y las transacciones de saldo
> usan el soporte transaccional de Prisma.

## 9. Referencias

- `README.MD` (raíz): §3 (decisiones), §6 (arquitectura), §7 (seguridad).
- `backend/README.md`: estructura, comandos y bases de datos.
- [`API/openapi.yaml`](../API/openapi.yaml): contrato público de la API (fuente de verdad).
- [`Contrato-entre-servicios.md`](../Contrato-entre-servicios.md): contrato interno entre
  servicios, incluida la autenticación service-to-service.
- [`Diccionario-de-Datos.md`](../Diccionario-de-Datos.md): descripción de los 26 modelos.
- [`Catalogo-por-Familias.md`](../Catalogo-por-Familias.md): diseño del catálogo por
  familias (periféricos, licencias y juegos) con carrito único, y
  [ADR-0017](../Decisiones.md) con la decisión que lo respalda.
- [`Trazabilidad.md`](../Trazabilidad.md): estado real de cada requisito de este documento.
