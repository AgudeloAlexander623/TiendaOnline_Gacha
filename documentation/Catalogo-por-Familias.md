# Catálogo por familias — página de ventas

> **Para quién es esto:** para todo el equipo. Aquí está la historia **completa** del
> catálogo con sus tres familias (periféricos, licencias y juegos): qué es, por qué se
> separó, cómo funciona la compra y qué queda por hacer.
>
> **Estado:** diseño aprobado · **Nada de esto está todavía en el código.** El estado
> real, requisito por requisito, está en la
> [Matriz de trazabilidad](./Trazabilidad.md).
>
> **Decisión asociada:** [ADR-0017](./Decisiones.md).
>
> **Detalle técnico equivalente:**
> [`backend/documentation_Backend/Catalogo-por-Familias.md`](../backend/documentation_Backend/Catalogo-por-Familias.md)
> (rutas, capas, variables, migraciones y pruebas).

---

## 1. Qué es este documento

La **página de ventas** es la pantalla donde la gente entra a comprar. Hoy muestra
periféricos. La decisión que este documento recoge es que esa pantalla va a mostrar **tres
tipos de producto**, no uno:

| Familia | Qué vende la plataforma | Ejemplos |
| --- | --- | --- |
| **Periféricos** | Accesorios para el computador | teclado, ratón, monitor, auriculares |
| **Licencias** | Claves de software que la plataforma **revende** | editor de vídeo, antivirus, juego de mesa digital |
| **Juegos** | Juegos que la plataforma **revende** | títulos de PC y consola |

Y, por encima de las tres: **un solo carrito y un solo pago**. Como en un marketplace
clásico: la persona mete cosas de familias distintas en el mismo carrito y paga una vez.

---

## 2. Por qué se separó el catálogo

Antes de este cambio, `store-service` tenía **una sola tabla de productos** (`products`)
con un único tipo de artículo. Meter tres tipos distintos en la misma tabla produce campos
vacíos por todas partes y condicionales en cada consulta.

Además, cada familia tiene **reglas propias** que no tienen sentido para las demás:

- Un **periférico** tiene stock físico, se agota y se repone.
- Una **licencia** no tiene stock: tiene **claves**, y cada clave se consume una sola vez.
- Un **juego** se filtra por género, plataforma y clasificación por edad.

Separarlas por dominio da a cada una sus atributos, sus reglas y sus errores, sin tocar las
demás. Es exactamente lo que ya dice el
[ADR-0001](./Decisiones.md):
*microservicios por dominio*.

---

## 3. La decisión y su porqué

> **Un solo servicio (`store-service`) con tres dominios separados dentro, un solo carrito
> y un solo pago. La separación en procesos (microservicios) se hace más adelante.**

### 3.1 Por qué no tres servicios desde ya

Porque el **catálogo no es la parte difícil**: la difícil es el **carrito**. Un carrito
único que mezcla tres catálogos, si cada catálogo fuera un servicio aparte, obligaría al
carrito a preguntar precio y stock a los tres en cada operación: **llamadas internas
entre servicios**, que son exactamente la deuda que el proyecto tiene **abierta hoy**
(`TS-01`…`TS-04` y tres `TODO(economia)` en `payments` y en el checkout de descuentos).

Multiplicar esa deuda por tres, sobre la parte menos madura del sistema, es multiplicar el
riesgo. La separación de **dominio** es la que aporta el beneficio real; la separación en
**procesos** es la que cuesta.

### 3.2 Por qué no un carrito por catálogo

Porque se decidió **un solo carrito y un solo pago**. Tres carritos serían tres
checkouts, tres pedidos y tres pagos: la persona que quiere un teclado y una licencia
tendría que pagar dos veces. El modelo de datos ya lo permite sin coste extra: `CartItem`
y `OrderItem` apuntan a `Product` con clave foránea real, y `OrderItem` ya guarda el
snapshot del nombre y del precio.

### 3.3 Qué se decidió sobre las licencias

**La plataforma es la vendedora.** No hay revendedores externos. Eso evita un
`sellerId`, un registro de vendedores y el reparto de comisión... y también evita un
problema: el modelo actual de inventario (`InventoryItem`) es **global y sin dueño**, así
que no soportaría multi-vendedor. Cuando lo haga falta, se verá.

### 3.4 Lo que este documento no decide

| Pregunta | Estado |
| --- | --- |
| ¿Cuándo se extrae cada familia a su propio servicio? | **Pendiente**: se hará cuando el proyecto lo justifique. El diseño no lo bloquea |
| ¿Qué claves exactas se cifran y con qué algoritmo? | **Pendiente**: `AES-256-GCM` es la propuesta; la rotación de la clave sigue abierta |
| ¿Los juegos del catálogo tienen relación con la aventura del juego? | **Pendiente**: son cosas distintas y el nombre choca. Ver §9 |
| ¿La licencia se puede reembolsar? | **Decidido en este documento**: **no** (§5.4) |

---

## 4. Cómo se compra: el recorrido completo

```text
  1. La persona entra a la página de ventas
        │
        ├─ Pestaña PERIFÉRICOS ──▶ GET /api/v1/peripherals
        ├─ Pestaña LICENCIAS    ──▶ GET /api/v1/licenses      (sin claves)
        └─ Pestaña JUEGOS       ──▶ GET /api/v1/games
        │
  2. Agrega al carrito ──▶ POST /api/v1/carts/items        (un solo carrito)
        │
  3. Revisa ──▶ GET /api/v1/carts/me                       (total del servidor)
        │
  4. Confirma ──▶ POST /api/v1/orders/checkout             (un solo pedido, un solo pago)
        │     el servidor revalida precio y stock de las 3 familias
        │
  5. Si compró una licencia ──▶ GET /api/v1/orders/:id/license-keys
                                (solo su dueño; aquí sí ve la clave)
```

**El punto clave del paso 4:** el checkout **vuelve a preguntar al catálogo** el precio y
el stock de cada artículo antes de cobrar. El precio que ve la persona al agregar es una
cortesía; el que se cobra es el del servidor. Es la misma regla que ya rige en la ruleta
(«si no hay saldo, no se cobra») y en los descuentos.

---

## 5. Las reglas del negocio por familia

| # | Regla | Por qué |
| --- | --- | --- |
| 1 | El `sku` es **único en todo el catálogo**, no por familia | Dos familias con el mismo código romperían el pedido, que no sabe de qué familia habla |
| 2 | El precio lo fija **siempre** el servidor | El navegador no puede decidir cuánto se paga (regla ya existente: `FR-BR-09`) |
| 3 | La **clave de licencia nunca aparece** en un listado ni en un log | Es un secreto: si se filtra, la venta está perdida (ver §6) |
| 4 | Una licencia comprada **no se reembolsa**: es digital e intransferible | No hay devolución de un producto que ya se puede usar |
| 5 | La clave tiene **activaciones limitadas** y puede **caducar** | Una licencia de por vida sin límite de activaciones no se puede revender |
| 6 | El stock de una licencia es **el número de claves disponibles** | «Agotada» significa «no quedan claves», no «un entero a cero» |
| 7 | Un pedido puede **mezclar las tres familias** | Es lo que hace útil el carrito único |
| 8 | Los tres catálogos son de **solo lectura** para el público | Solo el administrador crea, edita y desactiva |

---

## 6. La clave de licencia es un secreto

Es lo más delicado de todo este trabajo y merece su propio apartado.

Una clave de licencia filtrada es **una venta perdida y un problema sin fecha de
resolución**. Por eso su tratamiento es distinto del resto del catálogo:

| Regla | En palabras |
| --- | --- |
| **Nunca en los listados** | Ni el catálogo de licencias, ni el listado de pedidos, ni los logs |
| **Cifrada en reposo** | En la base de datos no está el texto que el cliente recibe |
| **Solo su dueño la ve** | La ruta que la entrega comprueba que el pedido sea de quien pregunta |
| **El administrador ve el estado, no el valor** | Cuántas claves quedan y cuántas se activaron; el texto, nunca |
| **Una entrega por pedido** | Al confirmar el pedido, la clave se marca como entregada y queda ligada a ese pedido |

**Consecuencia práctica para el frontend:** la clave se ve **en el detalle del pedido**,
no en la ficha del producto. Es el mismo patrón que una descarga o un código de
canje: primero se compra, después se entrega.

---

## 7. Mapa de la API

**Prefijos por familia** (no un catálogo genérico con un filtro):

| Prefijo | Servicio | Qué expone |
| --- | --- | --- |
| `/api/v1/peripherals` | `store-service` (3002) | Catálogo de periféricos |
| `/api/v1/licenses` | `store-service` (3002) | Catálogo de licencias (sin claves) |
| `/api/v1/games` | `store-service` (3002) | Catálogo de juegos |
| `/api/v1/categories` | `store-service` (3002) | Categorías, con filtro opcional por familia |
| `/api/v1/carts` | `store-service` (3002) | **El carrito único** (sin cambios) |
| `/api/v1/orders` | `store-service` (3002) | **El pedido único** (sin cambios) |

Cada familia expone las mismas seis operaciones: listar, ver por slug, ver por id, crear,
editar y desactivar. Las licencias añaden dos de administración (ver el estado de las
claves y reponerlas) y los pedidos añaden una de entrega (ver las claves compradas).

**El contrato público pasa de 59 operaciones en 45 rutas a 74 operaciones en 53 rutas.**
La ruta `/api/v1/products` **desaparece**: era el catálogo genérico de una sola familia.
No rompe a nadie porque el frontend todavía no llama a la API.

> **Por qué prefijos y no un `?kind=`:** el prefijo **es** el nombre del futuro
> microservicio. Cuando `peripherals` se extraiga a su propio servicio, publicará
> `/api/v1/peripherals` y no habrá que renumerar nada. Es la forma de que la separación
> posterior sea mecánica.

---

## 8. Cómo se implementa, por fases

| # | Fase | Qué | Por qué en este orden |
| --- | --- | --- | --- |
| 0 | **Documentos** | Este documento, los requisitos nuevos, los casos de uso y las historias | El SRS manda: si el requisito no existe, el endpoint es código huérfano |
| 1 | **Contrato** | `openapi.yaml` con las rutas y esquemas de las 3 familias | Contrato antes que código: si el contrato falla, el código también |
| 2 | **Datos** | `ProductKind`, tablas de atributos, migración, seed idempotente | La base es lo caro de revertir |
| 3 | **Código** | `catalog.service.ts` *kind-aware* + los 3 routers | Lógica compartida una sola vez |
| 4 | **Licencias** | Cifrado, entrega, activación, revocación | Un secreto mal guardado es una pérdida real |
| 5 | **Checkout** | Revalidación de precio y stock para las 3 familias | El cliente nunca fija el precio |
| 6 | **Frontend** | Prefijos del proxy inverso | Si no, el frontend no llega |
| 7 | **Pruebas** | Casos críticos en verde y documentación al día | Lo que no se demuestra, no existe |

---

## 9. Los riesgos que esta decisión deja abiertos

| # | Riesgo | Impacto | Cómo se mitiga |
| --- | --- | --- | --- |
| 1 | **Extraer** las familias a microservicios obligará a **partir la tabla `products`** | La clave foránea del carrito apunta a la base común | Se acepta ahora: hoy la integridad referencial vale más que la comodidad futura |
| 2 | **«Juego»** en el catálogo vs. **«la aventura»** del juego | Dos cosas distintas con el mismo nombre en la documentación | El glosario distingue *juego en catálogo* de *aventura*; `Game.md` sigue siendo la fuente de verdad del juego |
| 3 | **Rotar** la clave de cifrado deja las claves guardadas ilegibles | Las licencias ya vendidas no se podrían entregar | Procedimiento de re-cifrado pendiente; mientras tanto la clave **no** se rota |
| 4 | El `store-service` usa Prisma en los `service`, no en un `repository` | La convención del README no se cumple en este servicio | El módulo nuevo sí sigue el patrón; unificar queda como deuda |
| 5 | Licencias y juegos son **alcance nuevo** | Más requisitos, más estados, más seed, más documentación | Está todo trazado en la matriz |
| 6 | El modelo de inventario **no soporta multi-vendedor** | Si mañana hay revendedores externos, hay que cambiarlo | Decisión tomada: la plataforma revende (sin `sellerId`) |

---

## 10. Requisitos que deja este trabajo

| ID | Qué exige | Prioridad |
| --- | --- | --- |
| `FR-BE-24` | Catálogo de periféricos con sus atributos propios | Must |
| `FR-BE-25` | Catálogo de licencias **sin exponer la clave** | Must |
| `FR-BE-26` | Catálogo de juegos con sus atributos propios | Must |
| `FR-BE-27` | Carrito y checkout **únicos** que mezclan las tres familias | Must |
| `FR-BE-28` | Revalidación de precio y stock en el checkout | Must |
| `FR-DB-10` | Producto con tipo y tablas de atributos por familia | Must |
| `FR-BR-17` | `sku` único en todo el catálogo | Must |
| `FR-BR-18` | La clave de licencia es un secreto: nunca se lista ni se registra | Must |
| `FR-BR-19` | Licencia digital: activación limitada, con expiración y sin reembolso | Must |
| `FR-SEC-12` | La clave solo se entrega a quien compró el pedido | Must |
| `UC-20` | Comprar un periférico | Must |
| `UC-21` | Comprar una licencia y recibir su clave | Must |
| `UC-22` | Comprar un juego | Must |
| `US-20` | Comprar en un carrito único con productos de las tres familias | Must |
| `TS-25`…`TS-29` | Las cinco historias técnicas que lo implementan | Must |

Los identificadores son **nuevos**: **ninguno** de los 154 requisitos anteriores se
renumera.

---

## 11. Referencias

- [ADR-0017](./Decisiones.md) — la decisión completa, con las alternativas descartadas.
- [`Software-requeriments(SRS)/Backend.md`](./Software-requeriments(SRS)/Backend.md) §4.3 —
  `FR-BE-24`…`FR-BE-28`.
- [`Software-requeriments(SRS)/Database.md`](./Software-requeriments(SRS)/Database.md) —
  `FR-DB-10`.
- [`Software-requeriments(SRS)/Business-Rules.md`](./Software-requeriments(SRS)/Business-Rules.md) —
  `FR-BR-17`…`FR-BR-19`.
- [`Software-requeriments(SRS)/Security.md`](./Software-requeriments(SRS)/Security.md) —
  `FR-SEC-12`.
- [`Casos-de-Uso/02-Tienda-y-Pedidos.md`](./Casos-de-Uso/02-Tienda-y-Pedidos.md) —
  `UC-20`, `UC-21`, `UC-22`.
- [`Epicas-e-Historias.md`](./Epicas-e-Historias.md) — `US-20`.
- [`Historias-Tecnicas.md`](./Historias-Tecnicas.md) — `TS-25`…`TS-29`.
- [`Trazabilidad.md`](./Trazabilidad.md) — el estado real de todo lo anterior.
- [`backend/documentation_Backend/Catalogo-por-Familias.md`](../backend/documentation_Backend/Catalogo-por-Familias.md)
  — el detalle técnico: rutas, capas, variables, migraciones y pruebas.
