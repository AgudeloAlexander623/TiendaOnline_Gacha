# Decisiones de arquitectura (ADR) — GearQuest

> **Para quién es esto:** para quien se pregunta «¿por qué está hecho así?». Cuando
> dentro de tres semanas alguien diga «¿y por qué no usamos una sola base de datos?»,
> la respuesta ya está escrita aquí.

---

## 1. Qué es un ADR y por qué llevamos uno

Un **ADR** (*Architecture Decision Record*, o «registro de decisión de arquitectura») es
un documento **corto** que explica **una** decisión importante: qué se decidió, por qué,
qué alternativas había y qué consecuencias tiene.

Piensa en él como una **nota que le dejas a tu yo del futuro**. Sin ADR, las decisiones
se olvidan y el equipo acaba discutiendo lo mismo cada mes, o —peor— alguien «mejora»
algo sin saber por qué estaba así y rompe el sistema.

**Reglas de un ADR:**

- **Es corto.** Si ocupa más de una página, es una especificación, no un ADR.
- **Es honesto.** Si algo está *propuesto* o *pendiente*, se dice; no se finge que está decidido.
- **No se borra.** Si una decisión cambia, se escribe un ADR nuevo que *reemplaza* al
  anterior. Así queda la historia.
- **Vive con el código.** Se guarda en el repositorio, no en un chat.

### Estados posibles

| Estado | Significado |
| --- | --- |
| **Aceptada** | Decidida y en vigor |
| **Propuesta** | Se plantea, pero aún no es definitiva |
| **Reemplazada** | Una decisión posterior la sustituyó (se indica cuál) |

---

## 2. Índice de decisiones

| ADR | Título | Estado |
| --- | --- | --- |
| [ADR-0001](#adr-0001--usar-microservicios-por-dominio-en-un-monorepo) | Usar microservicios por dominio en un monorepo | Aceptada |
| [ADR-0002](#adr-0002--elegir-nodejs--express--typescript-para-el-backend) | Elegir Node.js + Express + TypeScript para el backend | Aceptada |
| [ADR-0003](#adr-0003--una-base-de-datos-postgresql-por-servicio) | Una base de datos PostgreSQL por servicio | Aceptada |
| [ADR-0004](#adr-0004--prisma-como-orm-y-migraciones-versionadas) | Prisma como ORM y migraciones versionadas | Aceptada |
| [ADR-0005](#adr-0005--el-servidor-decide-las-monedas-y-los-descuentos) | El servidor decide las monedas y los descuentos | Aceptada |
| [ADR-0006](#adr-0006--separar-monedas-ganadas-y-compradas-con-vencimiento) | Separar monedas ganadas y compradas, con vencimiento | Aceptada |
| [ADR-0007](#adr-0007--pagos-y-recargas-simulados-sin-dinero-real) | Pagos y recargas simulados, sin dinero real | Aceptada |
| [ADR-0008](#adr-0008--react--vite--tailwind-para-el-frontend) | React + Vite + Tailwind para el frontend | Aceptada |
| [ADR-0009](#adr-0009--jwt-para-autenticación-con-sesiones-registradas) | JWT para autenticación, con sesiones registradas | Propuesta |
| [ADR-0010](#adr-0010--convención-de-commits-y-ramas-por-tarea) | Convención de commits y ramas por tarea | Aceptada |
| [ADR-0011](#adr-0011--la-documentación-es-parte-del-producto) | La documentación es parte del producto | Aceptada |
| [ADR-0012](#adr-0012--motor-propio-para-los-diagramas-svg) | Motor propio (Python) para los diagramas SVG | Aceptada |
| [ADR-0013](#adr-0013--no-exponer-secretos-en-la-documentación) | No exponer secretos ni datos críticos en la documentación | Aceptada |
| [ADR-0014](#adr-0014--clasificar-la-información-antes-de-documentarla) | Clasificar la información antes de documentarla | Aceptada |
| [ADR-0015](#adr-0015--una-única-url-base-en-el-frontend-con-proxy-inverso-por-prefijo) | Una única URL base en el frontend, con proxy inverso por prefijo | Aceptada |
| [ADR-0016](#adr-0016--el-juego-es-una-aventura-metroidvania-la-ruleta-y-el-mercader-son-sus-componentes) | El juego es una aventura metroidvania; la ruleta y el mercader son sus componentes | Aceptada |
| [ADR-0017](#adr-0017--catálogo-por-familias-dentro-de-store-service-con-un-solo-carrito-y-un-solo-pago) | Catálogo por familias dentro de store-service, con un solo carrito y un solo pago | Aceptada |

---

## ADR-0001 · Usar microservicios por dominio en un monorepo

- **Fecha:** 2026-10
- **Estado:** Aceptada

### Contexto

GearQuest tiene áreas claramente distintas: **usuarios**, **tienda**, **economía del
juego** y **pagos**. Son 4 integrantes y queremos que cada quien pueda avanzar sin
pisar a los demás.

### Decisión

Organizar el backend como **microservicios por dominio** (identity, store, economy,
payments) dentro de **un solo repositorio** (*monorepo*), usando *npm workspaces*.

### Por qué (alternativas)

- **Un solo backend «monolítico»:** más simple al inicio, pero todos editarían los
  mismos archivos y se estorbarían.
- **Repositorios separados:** aislamiento total, pero para un proyecto universitario de
  4 personas el costo de coordinar 4 repositorios es desproporcionado.
- **Monorepo con servicios por dominio** ✅: cada dominio es un paquete independiente,
  pero todo se clona, instala y prueba junto. Es el mejor equilibrio.

### Consecuencias

- ✅ Fronteras claras; se entiende qué hace cada servicio.
- ✅ Un `npm install` instala todo.
- ⚠️ Hay que ser disciplinado: **un servicio no llama directamente a la base de otro**.
- ⚠️ La comunicación entre servicios (por ejemplo, acreditar monedas al aprobar un pago)
  aún está **pendiente**; ver [`Trazabilidad.md`](./Trazabilidad.md).

---

## ADR-0002 · Elegir Node.js + Express + TypeScript para el backend

- **Fecha:** 2026-10
- **Estado:** Aceptada

### Contexto

El equipo ya conoce JavaScript. Necesitábamos un backend con buena validación y tipado.

### Decisión

**Node.js + Express + TypeScript**, con módulos ESM.

### Por qué (alternativas)

- **JavaScript sin tipos:** más rápido de escribir, pero los errores aparecen en
  ejecución (en producción), no al compilar.
- **Otro lenguaje (Java, Python, Go):** válido, pero implicaba que todo el equipo
  aprendiera un segundo lenguaje y ecosistema.
- **Node + Express + TypeScript** ✅: mismo lenguaje en frontend y backend, y el
  **tipado estático** atrapa muchos errores antes de ejecutar el código.

### Consecuencias

- ✅ TypeScript con `strict: true` obliga a manejar los casos nulos/indefinidos.
- ✅ Express es sencillo y muy documentado.
- ⚠️ Node exige versión `>= 20.19` y módulos ESM (`NodeNext`).

---

## ADR-0003 · Una base de datos PostgreSQL por servicio

- **Fecha:** 2026-10
- **Estado:** Aceptada

### Contexto

En microservicios hay dos formas de repartir los datos: una base común o una por servicio.

### Decisión

**Una base PostgreSQL por servicio** (`gearquest_identity`, `gearquest_store`,
`gearquest_economy`, `gearquest_payments`), sin claves foráneas entre bases.

### Por qué (alternativas)

- **Una sola base compartida:** más fácil al principio, pero cualquier servicio podría
  leer/escribir datos de otro → acoplamiento y riesgo.
- **Una base por servicio** ✅: cada servicio es dueño de sus datos. La integridad
  entre servicios se garantiza en el **backend**, no con claves foráneas.

### Consecuencias

- ✅ Los datos quedan aislados por dominio.
- ✅ Para desarrollo local basta **un contenedor** PostgreSQL con 4 bases (ver
  [`Guia-de-Instalacion.md`](./Guia-de-Instalacion.md) §3).
- ⚠️ **No hay integridad referencial entre servicios**: si se borra un usuario, los
  datos de otro servicio no se borran solos. Hay que manejarlo a nivel de aplicación.
- ⚠️ Las referencias entre servicios (por ejemplo `userId` en economy) son **lógicas**,
  no foráneas. Ver [`Diccionario-de-Datos.md`](./Diccionario-de-Datos.md).

> **Modelo mental (junior):** cada base es una **caja cerrada**. Para pedir algo de otra
> caja, no metes la mano dentro: se lo pides al servicio dueño, que decide si te lo da.

---

## ADR-0004 · Prisma como ORM y migraciones versionadas

- **Fecha:** 2026-10
- **Estado:** Aceptada

### Contexto

Necesitábamos hablar con PostgreSQL sin escribir SQL a mano para cada consulta, y
mantener la estructura de la base igual para todo el equipo.

### Decisión

Usar **Prisma** como ORM y su sistema de **migraciones versionadas** en `prisma/migrations/`.

### Por qué (alternativas)

- **SQL a mano:** control total, pero repetitivo y propenso a errores; sin verificación
  de tipos.
- **Sin migraciones (cambiar la base a mano):** cada integrante tendría una base distinta.
- **Prisma** ✅: define el esquema en `schema.prisma`, genera un cliente **con tipos**
  (autocompletado y errores al compilar) y aplica migraciones reproducibles.

### Consecuencias

- ✅ Los tipos de TypeScript salen del esquema: si un campo no existe, **no compila**.
- ✅ Todos aplican las mismas migraciones → mismas tablas.
- ⚠️ Hay que aprender el flujo: `prisma:generate` → `prisma:migrate` → `seed`.
- ⚠️ Las migraciones **no se editan** una vez aplicadas; se crea una nueva.

---

## ADR-0005 · El servidor decide las monedas y los descuentos

- **Fecha:** 2026-10
- **Estado:** Aceptada

### Contexto

El juego corre en el navegador/Godot (el **cliente**). Si el cliente pudiera decir
«gané 1000 monedas», cualquiera podría hacer trampa.

### Decisión

**Toda** decisión sobre monedas, saldo y descuentos ocurre en el **servidor**. El cliente
solo envía datos; el servidor los valida y luego decide.

### Por qué (alternativas)

- **Confiar en el cliente:** rapidísimo de programar, pero trivial de hackear (basta
  modificar la petición).
- **Servidor como autoridad** ✅: el dinero virtual y los descuentos solo los mueve el
  servidor, que es el único con acceso a la base de datos.

### Consecuencias

- ✅ El abuso requiere comprometer el servidor, no solo el navegador.
- ✅ Los movimientos de monedas quedan en un historial auditable.
- ⚠️ La **validación real de las partidas** contra el juego (evitar que alguien envíe un
  puntaje falso) aún está **pendiente**; hoy se aplica una regla simple. Ver
  [`Trazabilidad.md`](./Trazabilidad.md).

---

## ADR-0006 · Separar monedas ganadas y compradas, con vencimiento

- **Fecha:** 2026-10
- **Estado:** Aceptada

### Contexto

Hay dos formas de conseguir monedas: **jugando** y **recargando** (comprando). El negocio
quiere que solo las primeras caduquen, para incentivar que se juegue con regularidad.

### Decisión

Representar las monedas como **lotes** (`CoinBatch`) con un `type`
(`EARNED` / `PURCHASED`) y una fecha `expiresAt`:

- Monedas **ganadas**: vencen a los **30 días**.
- Monedas **compradas**: **no** vencen.

### Por qué (alternativas)

- **Un solo saldo numérico:** imposible saber qué parte vence. Se descartó.
- **Lotes con tipo y vencimiento** ✅: el saldo se **deriva** de la suma de lotes válidos,
  y se puede auditar cada entrada.

### Consecuencias

- ✅ Reglas claras y auditables.
- ✅ El vencimiento no borra el registro original (se marca, no se elimina).
- ⚠️ Decisión **pendiente**: en qué **orden** se consumen las monedas ganadas y compradas.
  Ver [`Decisiones pendientes`](../README.MD) y el SRS de reglas de negocio.

---

## ADR-0007 · Pagos y recargas simulados, sin dinero real

- **Fecha:** 2026-10
- **Estado:** Aceptada

### Contexto

El proyecto es académico. Integrar una pasarela real (Stripe, Mercado Pago) exige cuentas,
datos fiscales y dinero; además, sería un riesgo de seguridad innecesario.

### Decisión

Las **recargas son simuladas**. El servicio de pagos tiene un proveedor `mock`
(`PAYMENT_PROVIDER=mock`) que aprueba/rechaza sin mover dinero real. **No se manejan
datos de tarjeta**.

### Por qué (alternativas)

- **Pasarela real:** fuera del alcance académico y con implicaciones legales/security.
- **Proveedor simulado** ✅: se practica todo el flujo (crear pago, aprobar, acreditar
  monedas) sin riesgos.

### Consecuencias

- ✅ Cero riesgo financiero y cero datos sensibles de pago.
- ✅ El diseño deja la puerta abierta a un proveedor real más adelante.
- ⚠️ La **acreditación de monedas compradas** al aprobar el pago aún está **pendiente**
  (integración entre payments y economy). Ver [`Trazabilidad.md`](./Trazabilidad.md).

---

## ADR-0008 · React + Vite + Tailwind para el frontend

- **Fecha:** 2026-10
- **Estado:** Aceptada

### Contexto

Necesitábamos una interfaz web moderna y rápida de desarrollar entre 4 personas.

### Decisión

**React** (biblioteca de interfaz) + **Vite** (herramienta de desarrollo/compilación) +
**Tailwind CSS** (estilos) + **TypeScript**.

### Por qué (alternativas)

- **HTML/CSS/JS a mano:** sin herramientas, pero el código se vuelve difícil de mantener.
- **Otro framework (Vue, Angular):** válido; se eligió React por familiaridad del equipo
  y su enorme ecosistema.
- **React + Vite + Tailwind** ✅: desarrollo ágil, recarga instantánea y estilos por
  utilidades sin escribir CSS largo.

### Consecuencias

- ✅ Vite arranca en milisegundos y compila rápido.
- ✅ Tailwind mantiene los estilos consistentes.
- ✅ El frontend usa **una única URL base** (`/api/v1`) con un **proxy inverso por prefijo**
  en `vite.config.ts`, en vez de una URL por servicio (ver
  [ADR-0015](#adr-0015--una-única-url-base-en-el-frontend-con-proxy-inverso-por-prefijo)).
- ⚠️ El frontend **aún no está conectado** al backend (0 llamadas HTTP): falta la capa
  `services/` y el cliente HTTP (`FR-FE-10`, `FR-FE-13`).
- ✅ Prettier está instalado y configurado para respetar el estilo ya existente
  (`npm run format` y `npm run format:check` en verde).

---

## ADR-0009 · JWT para autenticación, con sesiones registradas

- **Fecha:** 2026-10
- **Estado:** **Propuesta**

> ⚠️ Este ADR aún **no está cerrado**. Se documenta para no perder el hilo, pero la
> estrategia definitiva de autenticación está en la lista de **decisiones pendientes**.

### Contexto

La API necesita saber quién hace cada petición. Hay dos familias de enfoques: **tokens**
(JWT) o **sesiones en servidor**.

### Propuesta

Usar **JWT** de acceso (corta duración) + **refresh token**, y **además** registrar las
sesiones en la base de datos (`Session`) con un hash del token, para poder **revocar**
sesiones (cerrar sesión en todos los dispositivos).

### Por qué (alternativas)

- **Solo JWT sin registrar sesiones:** simple, pero **no se puede revocar** un token
  antes de que venza; si se filtra, es válido hasta su expiración.
- **Solo sesiones en servidor:** revocables, pero requiere guardar estado y complica el
  escalado.
- **JWT + sesiones registradas** ✅ (propuesta): lo mejor de ambos — tokens ligeros y
  posibilidad de revocar.

### Consecuencias (si se acepta)

- ✅ Se podrá cerrar sesión de forma efectiva.
- ✅ El `JWT_SECRET` y los tokens **nunca** se guardan en el repositorio ni en la
  documentación; solo se guarda el **hash** del token.
- ⚠️ Hay que definir duraciones, rotación del refresh token y manejo de expiración.
- ⚠️ Mientras no se cierre la decisión, no debe presentarse como implementada.

---

## ADR-0010 · Convención de commits y ramas por tarea

- **Fecha:** 2026-10
- **Estado:** Aceptada

### Contexto

Con 4 personas trabajando en paralelo, sin reglas el historial de Git se vuelve un caos
y las revisiones, imposibles.

### Decisión

**Conventional Commits** para los mensajes y **ramas por tarea** (no una rama fija por
integrante). El detalle operativo está en [`CONTRIBUTING.md`](./CONTRIBUTING.md).

### Por qué (alternativas)

- **Nombres libres («cambios», «fix»):** imposibles de entender a distancia.
- **Una rama por persona:** se queda vieja, se desincroniza y provoca conflictos enormes.
- **Ramas por tarea + Conventional Commits** ✅: el historial se lee solo y cada cambio
  es revisable.

### Consecuencias

- ✅ El historial se puede filtrar (`feat:`, `fix:`, `docs:`, etc.).
- ✅ Cada PR cuenta una historia pequeña y cerrada.
- ⚠️ Requiere disciplina del equipo; se refuerza en la revisión.

---

## ADR-0011 · La documentación es parte del producto

- **Fecha:** 2026-10
- **Estado:** Aceptada

### Contexto

Muchos proyectos dejan la documentación para el final; entonces ya nadie recuerda por qué
se hizo nada, y la documentación nace muerta o —peor— mintiendo.

### Decisión

La documentación **se escribe y actualiza junto al código**, en el **mismo cambio (PR)**.
El estado real de cada requisito vive en [`Trazabilidad.md`](./Trazabilidad.md).

### Por qué (alternativas)

- **Documentar al final:** o no se hace, o describe un sistema que ya cambió.
- **Documentación viva** ✅: cada cambio relevante arrastra su documento.

### Consecuencias

- ✅ Quien llega nuevo entiende el proyecto sin leer todo el código.
- ✅ La documentación es **honesta**: lo pendiente se marca como pendiente.
- ⚠️ Exige disciplina; forma parte del checklist de PR.

---

## ADR-0012 · Motor propio para los diagramas SVG

- **Fecha:** 2026-10
- **Estado:** Aceptada

### Contexto

Necesitábamos diagramas de flujo, arquitectura, secuencia, estados y modelo de datos, y
que fueran **fáciles de mantener** cuando el diseño cambie.

### Decisión

Generar los SVG con un **motor propio en Python** (sin dependencias externas), donde se
edita una **especificación en texto** y se regenera el SVG.

### Por qué (alternativas)

- **Dibujar a mano (Figma/draw.io):** bonito, pero cada cambio exige volver a dibujar y
  los archivos binarios son imposibles de revisar en Git.
- **Herramientas como Graphviz/mermaid:** buenas, pero añaden dependencias y su estilo no
  era el que buscábamos.
- **Motor propio** ✅: el diagrama es **código**; se revisa en Git, se regenera igual para
  todos y se valida automáticamente.

### Consecuencias

- ✅ Reproducible: mismo código → mismo SVG.
- ✅ Hay un **QA geométrico** que detecta cajas solapadas o textos desbordados.
- ⚠️ Editar el SVG a mano está **prohibido**: el cambio se pierde al regenerar.

---

## ADR-0013 · No exponer secretos en la documentación

- **Fecha:** 2026-10
- **Estado:** Aceptada

### Contexto

La documentación la lee gente distinta; si incluyera secretos o detalles explotables,
sería un **manual para atacar el sistema**.

### Decisión

La documentación **no contiene** secretos ni datos críticos: nada de contraseñas reales,
tokens, cadenas de conexión de producción, direcciones internas, ni detalles que
faciliten un ataque. Se usan **valores de ejemplo evidentemente falsos**
(`dev-only-secret-change-me-in-production`, `postgres`).

### Por qué

- La documentación se comparte, se copia y a veces se publica. Los secretos no.
- Un junior leyendo la guía no debe copiar por accidente una credencial real a su `.env`
  creyendo que es la correcta.

### Consecuencias

- ✅ Se puede compartir la documentación sin filtrar accesos.
- ✅ Los secretos reales viven solo en variables de entorno **fuera** del repositorio.
- ⚠️ Al documentar configuración hay que **sanear** siempre los valores reales.

### Cómo se verifica

Antes de publicar, se ejecuta el checklist anti-secretos de la
[`Politica-de-Seguridad-Documental.md`](./Politica-de-Seguridad-Documental.md) §7:

```bash
grep -rniE "(api[_-]?key|secret|password|token|bearer|private[_-]?key)[[:space:]]*[:=]" \
  documentation README.MD 2>/dev/null
```

Todo lo que aparezca debe ser un **placeholder** (`<…>`) o un valor de ejemplo
evidentemente falso. Ver también el [ADR-0014](#adr-0014--clasificar-la-información-antes-de-documentarla).

---

## ADR-0014 · Clasificar la información antes de documentarla

- **Fecha:** 2026-10
- **Estado:** Aceptada

### Contexto

El proyecto genera mucha información: requisitos, decisiones, limitaciones conocidas y —
algún día— configuración de entornos. No toda esa información tiene el mismo nivel de
sensibilidad. Sin una clasificación explícita, es fácil publicar por descuido algo que no
debería ser público.

### Decisión

Toda la información del proyecto se clasifica en **tres capas** antes de documentarla,
descritas en la [`Politica-de-Seguridad-Documental.md`](./Politica-de-Seguridad-Documental.md):

- 🟢 **Pública:** describe **qué hace** el sistema → va al repositorio.
- 🟡 **Interna:** útil para el equipo, sin riesgo inmediato → va al repositorio, **marcada**.
- 🔴 **Restringida:** facilitaría un ataque → **fuera** del repositorio.

Además, se decide que **mientras el proyecto sea académico, no exista información 🔴**:
si algo no se puede publicar, no se escribe todavía.

### Por qué (alternativas)

- **No clasificar nada:** lo más cómodo, pero se publica lo que no se debe por simple
  descuido.
- **Guardar todo como «secreto»:** paraliza al equipo y contradice el espíritu abierto del
  proyecto.
- **Clasificar en 3 capas** ✅: permite publicar con confianza lo que es seguro y protege
  lo que no lo es, sin bloquear el trabajo.

### Consecuencias

- ✅ Se puede compartir el repositorio sin exponer el sistema.
- ✅ Los límites conocidos se documentan con **tono de estado** («pendiente de endurecer»),
  no de conducta («no valida»), para no dar munición a un atacante.
- ✅ Existe una comprobación concreta antes de publicar (checklist §7 de la política).
- ⚠️ Cuando el proyecto maneje datos reales, la capa 🟡 deberá **separarse** a un espacio
  privado.

---

## ADR-0015 · Una única URL base en el frontend, con proxy inverso por prefijo

- **Fecha:** 2026-10-22
- **Estado:** Aceptada

### Contexto

El backend son **4 servicios** que escuchan en los puertos 3001-3004. El frontend, en
cambio, es **una sola aplicación** en el navegador. La configuración inicial usaba
`VITE_API_BASE_URL=http://localhost:3000`, un puerto donde **no escucha nadie**: la app
no podía hablar con el backend por mucho que se escribiera el cliente HTTP.

Había dos formas de resolverlo: hardcodear **una URL por servicio** (el navegador tendría
que llamar a 4 orígenes distintos, con sus problemas de CORS y de cookies), o poner **un
único punto de entrada** delante de los 4 servicios.

### Decisión

El frontend usa **una sola URL base** (`/api/v1`) y el **proxy inverso** reparte cada
prefijo de ruta al servicio que le corresponde:

| Prefijo | Servicio | Puerto |
| --- | --- | ---: |
| `/api/v1/auth`, `/api/v1/users` | `identity-service` | 3001 |
| `/api/v1/carts`, `/api/v1/categories`, `/api/v1/discounts`, `/api/v1/inventory`, `/api/v1/orders`, `/api/v1/products` | `store-service` | 3002 |
| `/api/v1/gacha`, `/api/v1/items`, `/api/v1/rewards`, `/api/v1/transactions`, `/api/v1/wallet` | `economy-service` | 3003 |
| `/api/v1/packages`, `/api/v1/payments`, `/api/v1/recharges` | `payments-service` | 3004 |

En **desarrollo**, el reparto lo hace el servidor de Vite (`vite.config.ts`). En
**producción**, lo hará el proxy del servidor, con **la misma tabla de prefijos**.

### Por qué (alternativas)

- **Una URL por servicio en el navegador:** simple de escribir, pero obliga a que el
  cliente HTTP conozca la topología del backend y a configurar CORS para 4 orígenes. Además,
  el bug del puerto 3000 volvería en cuanto cambiara un puerto.
- **Variables de entorno por servicio** (`VITE_API_AUTH_URL`, `VITE_API_STORE_URL`, …):
  más flexible, pero **dispersa** la configuración y obliga a repetirla en cada
  `.env`.
- **Un único prefijo + proxy** ✅: el frontend conoce **una** dirección; cambiar un
  puerto es tocar el proxy, no el código de la aplicación. Es además la forma que
  funcione igual en desarrollo y en producción.

### Consecuencias

- ✅ Se elimina el bug del puerto 3000 y con él la configuración que no funcionaba.
- ✅ Requisito **FR-FE-13** del SRS del frontend cubierto en su parte de infraestructura.
- ✅ La misma tabla de prefijos sirve para el proxy de producción y para la
  documentación del contrato.
- ⚠️ Falta lo demás: la **capa `services/`** que use la URL base, el **cliente HTTP** y
  el **almacenamiento seguro del token** (`FR-FE-10`, `NFR-FE-08`). El proxy resuelve
  *a dónde* se llama, no *qué* se llama.
- ⚠️ La tabla de prefijos debe **mantenerse sincronizada** con el contrato de la API
  (`documentation/API/openapi.yaml`). Si se añade un prefijo nuevo, hay que añadirlo
  también al proxy.

---

## ADR-0016 · El juego es una aventura metroidvania; la ruleta y el mercader son sus componentes

- **Fecha:** 2026-10-22
- **Estado:** Aceptada

### Contexto

La documentación describía el juego de **dos formas distintas** según el documento
que se leyera: unos textos hablaban de un «minijuego» y una «ruta gacha» como dos
cosas separadas; el SRS del juego (`Game.md`) describía otra cosa: un *metroidvania* de
5 laberintos con jefes, cofres, zonas de descanso y un mercader dentro del mapa, con la
ruleta como un componente más.

Con dos descripciones distintas, cada documento del proyecto contaba una historia
distinta y el equipo no sabía cuál era la real.

### Decisión

**`Game.md` es la fuente de verdad del alcance del juego**, y el resto de la
documentación se alinea hacia él:

| Concepto | Nombre en el juego | Valor en el código |
| --- | --- | --- |
| La partida del juego | **Aventura** | `GameType.MINIGAME` |
| La máquina de premios | **Ruleta** (gacha) | `GameType.GACHA` |
| La compra con monedas dentro del mapa | **Mercader** | *(operación interna nueva)* |

El juego tiene **tres componentes**: la **aventura** (5 laberintos, cada uno con su jefe;
el del mapa 5 es el **Rey Demonio**, que entrega el arma legendaria), el **mercader**
(canje de monedas por objetos, con precio fijado por el servidor) y la **ruleta**
(tirada aleatoria con probabilidades del servidor).

El enum `GameType` conserva su valor histórico `MINIGAME` para la aventura; el **mapeo**
está documentado, no se renombra el código.

### Por qué (alternativas)

- **Mantener las dos descripciones y marcar la ambigüedad:** nadie sabría cuál aplicar;
  cada implementación saldría distinta.
- **Cambiar `GameType.MINIGAME` a `ADVENTURE`:** más legible, pero obliga a tocar el
  esquema, los seeds, las migraciones y los datos ya guardados, sin ganar nada
  funcional.
- **Fijar `Game.md` como fuente de verdad y alinear el resto** ✅: una sola descripción,
  cero cambios de código, y el nombre histórico del enum documentado como mapeo.

### Consecuencias

- ✅ Los casos de uso (`UC-12`, `UC-13`, `UC-19`), las historias (`US-12`, `US-13`,
  `US-19`), el glosario, el manual de usuario y el SRS de reglas de negocio cuentan
  **la misma historia**.
- ✅ Aparece un requisito nuevo que faltaba: el **canje del mercader** (`FR-BE-22`), con
  su operación interna (`POST /internal/merchant/redemptions`).
- ✅ Se puede escribir la especificación del juego sin contradicciones.
- ⚠️ El nombre `MINIGAME` en el código **no** significa «minijuego». Cualquier persona
  nueva debe leer el mapeo de §6 de `Game.md` antes de tocarlo.

---

## ADR-0017 · Catálogo por familias dentro de store-service, con un solo carrito y un solo pago

- **Fecha:** 2026-10-22
- **Estado:** Aceptada

### Contexto

La **página de ventas** (el frontend) iba a vender un solo tipo de producto: **periféricos**.
El negocio quiere ampliar el catálogo a **tres familias**:

| Familia | Atributos propios | Regla propia |
| --- | --- | --- |
| Periféricos | tipo de conexión, DPI, teclas, garantía | stock físico que se repone |
| Licencias | clave, activaciones, expiración, plataforma | **la clave es un secreto** y se consume una vez |
| Juegos | género, plataforma, clasificación, desarrollador | filtros por edad y plataforma |

Hoy las tres cosas caben en una sola tabla (`products`) porque solo hay una: campos `null`
por todas partes y condicionales en cada consulta.

La pregunta de fondo era otra: **¿se parte el catálogo en tres servicios ya, o se separa
dentro del servicio que ya existe?** Y, coupled con eso: **¿un carrito o tres?**

### Decisión

**Un solo servicio (`store-service`) con tres dominios separados dentro, y un solo carrito
con un solo pago.**

1. **El catálogo se separa por dominio, no por proceso.** El módulo `catalog` de
   `store-service` pasa a tener una base compartida (`catalog.service.ts` *kind-aware*) y
   **tres routers** que fijan su familia: `peripherals`, `licenses` y `games`. Cada familia
   tiene **sus propias rutas** (`/api/v1/peripherals`, `/api/v1/licenses`, `/api/v1/games`),
   sus **propios atributos** (tablas `PeripheralSpec`, `LicenseSpec` + `LicenseKey` y
   `GameSpec`) y sus **propias reglas**.
2. **El carrito y el pedido siguen siendo únicos.** Un carrito puede contener periféricos,
   licencias y juegos a la vez, y se confirma en un único pedido y un único pago.
3. **El modelo de datos mantiene la integridad referencial:** `Product` es la tabla base con
   un discriminador `kind`; `CartItem` y `OrderItem` siguen apuntando a `Product` con clave
   foránea real.
4. **La plataforma es la vendedora de las licencias.** No hay revendedores externos, así
   que el producto **no** lleva `sellerId`.
5. **La extracción a microservicios se hace más adelante**, cuando el proyecto lo
   justifique. Los nombres de ruta ya son los de los futuros servicios, de modo que la
   extracción sea mecánica.

### Por qué (alternativas)

- **Tres servicios desde ya (periféricos, licencias, juegos):** coherente con
  [ADR-0001](#adr-0001--usar-microservicios-por-dominio-en-un-monorepo), pero el
  `store-service` es **27 de las 59 operaciones** del contrato público. Partirlo ahora
  significa rehacer casi la mitad de la API, crear **3 bases, 3 configuraciones, 3
  despliegues** y, sobre todo, obligar al carrito a **preguntar precio y stock a los tres**
  en cada operación: llamadas internas entre servicios, que son exactamente la deuda que
  el proyecto tiene **abierta hoy** (`TS-01`…`TS-04` y tres `TODO(economia)`).
  Multiplicar esa deuda por tres, sobre la parte menos madura del sistema, es multiplicar
  el riesgo.
- **Un carrito por catálogo:** cada servicio sería autónomo, sin llamadas cruzadas… pero
  habría **tres checkouts, tres pedidos y tres pagos**. La persona que quiere un teclado y
  una licencia pagaría dos veces. Se descartó: se eligió el modelo de marketplace
  (estilo MercadoLibre): **un carrito, un pago**.
- **Todo en una tabla `products` con campos opcionales (lo de hoy):** es lo más rápido de
  implementar, pero produce columnas vacías y lógica condicional en cada consulta. No
  escala a la tercera familia.
- **Un `GET /api/v1/products?kind=LICENSE` en vez de prefijos:** menos endpoints, pero
  mezcla las familias en la URL y obliga a renumerar todo el día que se extraiga cada
  catálogo a su servicio. Con prefijos, `/api/v1/peripherals` **es** la ruta de
  `peripherals-service`: la separación futura no obliga a renumerar nada.
- **Separar el dominio ahora y los procesos después** ✅: el beneficio real (atributos
  propios, reglas propias, errores propios) se obtiene **completo** desde el primer día,
  con **cero** servicios, bases ni despliegues nuevos. La separación en procesos queda
  para cuando el proyecto la justifique, y para entonces la frontera ya está en el sitio
  correcto.

### Consecuencias

- ✅ Cada familia tiene sus atributos y sus reglas, **sin campos vacíos** ni condicionales
  en las consultas.
- ✅ El carrito y el checkout **no cambian**: cero trabajo en el flujo que ya funciona.
- ✅ **Cero** servicios, bases de datos, puertos o configuraciones nuevas.
- ✅ Los nombres de ruta quedan **decididos** para el futuro (`/api/v1/peripherals` ↔
  `peripherals-service`).
- ⚠️ `/api/v1/products` **desaparece** del contrato público. No rompe a nadie porque el
  frontend todavía no hace llamadas HTTP (`FR-FE-10` ⬜), pero es un cambio rompedor y va
  anotado como tal en el `CHANGELOG.md`.
- ⚠️ **Deuda asumida:** cuando las familias se extraigan a servicios separados, la tabla
  `products` habrá que **partirla** en tres, porque la clave foránea del carrito apunta a
  la base común. Se acepta: hoy la integridad referencial vale más que la comodidad
  futura.
- ⚠️ Las **licencias** son un producto con reglas propias: la clave es un secreto
  (cifrada, nunca listada, nunca en logs) y tiene activación limitada y expiración.
  Eso exige una variable de entorno nueva (`LICENSE_KEY_ENCRYPTION_KEY`) y una operación
  de entrega de claves.
- ⚠️ **«Juego»** en el catálogo choca con **«la aventura»** de
  [ADR-0016](#adr-0016--el-juego-es-una-aventura-metroidvania-la-ruleta-y-el-mercader-son-sus-componentes).
  El glosario distingue *juego en catálogo* de *aventura*.
- ✅ `Game.md` (fuente de verdad del juego) y `economy-service` **no se tocan**: el
  servicio que conecta con la información del juego sigue siendo el de economía.

### Diseño completo

- [`Catalogo-por-Familias.md`](./Catalogo-por-Familias.md) — alcance, negocio y fases.
- [`backend/documentation_Backend/Catalogo-por-Familias.md`](../backend/documentation_Backend/Catalogo-por-Familias.md)
  — rutas, capas, variables, migraciones y pruebas.

---

## 3. Cómo añadir una decisión nueva

1. Copia el formato de un ADR existente (Contexto → Decisión → Por qué → Consecuencias).
2. Asígnale el siguiente número libre (ADR-0018, ADR-0019, …).
3. Añádelo al [índice](#2-índice-de-decisiones) con su estado.
4. Si **reemplaza** a uno anterior, marca el viejo como *Reemplazada* y enlaza el nuevo.
5. Inclúyelo en el mismo PR que el cambio que lo motiva.

> **Consejo (junior):** escribe el ADR **cuando** tomas la decisión, no después. En ese
> momento recuerdas las alternativas y el «por qué»; una semana más tarde, ya no.

---

## 4. Enlaces relacionados

| Documento | Para qué |
| --- | --- |
| [`README.MD`](../README.MD) §3 | Estado de las decisiones del proyecto |
| [`Trazabilidad.md`](./Trazabilidad.md) | Qué está hecho y qué no |
| [`Guia-de-Instalacion.md`](./Guia-de-Instalacion.md) | Cómo levantar el proyecto |
| [`Glosario.md`](./Glosario.md) | Vocabulario del proyecto |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Cómo se colabora |
| [`Estrategia-de-Pruebas.md`](./Estrategia-de-Pruebas.md) | Cómo se prueba |
