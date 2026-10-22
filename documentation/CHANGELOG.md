# Changelog — GearQuest

> Este documento responde a una pregunta simple: **«¿qué cambió y en qué versión?»**.
> Sigue la convención de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
> y el [Versionado Semántico](https://semver.org/lang/es/) (SemVer).

## ¿Qué es un *changelog* y por qué llevamos uno?

Un **changelog** es el diario de cambios **visible para quien usa el producto**
(no para quien lo programa). No es lo mismo que el historial de Git: Git registra
*cada* commit, incluidos los de formato o refactor interno; el changelog recoge
**solo lo que a alguien de fuera le importa** (funciones nuevas, correcciones,
cambios que rompen algo).

Se escribe **para el lector, no para el autor**: agrupado por versión y por tipo
de cambio, en lenguaje claro. Sirve para que quien vuelve al proyecto después de
un mes no tenga que leer 200 commits para saber qué pasó.

## ¿Qué es SemVer (versionado semántico) y por qué lo seguimos?

**SemVer** es un acuerdo para dar sentido a los números de versión `MAYOR.MENOR.PARCHE`
(por ejemplo `1.4.2`):

| Cambias… | Subes… | Ejemplo |
| --- | --- | --- |
| Algo que **rompe** a quien ya usaba la versión anterior | **MAYOR** | `1.4.2 → 2.0.0` |
| Una función nueva **compatible** con lo anterior | **MENOR** | `1.4.2 → 1.5.0` |
| Un arreglo **compatible** (corrección de fallo) | **PARCHE** | `1.4.2 → 1.4.3` |

La ventaja es que **el número comunica riesgo**: si ves un cambio de MAYOR, sabes
que puede requerir adaptar tu código; si solo cambia el PARCHE, puedes actualizar
tranquilo. En este proyecto un cambio MAYOR sería, por ejemplo, cambiar el formato
de una respuesta de la API o el nombre de un `code` de error.

> Mientras el proyecto no publique una versión estable usamos `0.x.y`: en SemVer,
> el `0.x` significa «todavía en desarrollo, la API puede cambiar».

## [Sin versionar] (Unreleased)

*(Aquí se añade lo que ya está en `main` pero aún no se ha etiquetado con un número.)*

### Añadido — catálogo por familias (documentación, 2026-10-22)

> **Fase 0 del catálogo por familias:** solo **documentos**. No hay ni una línea de código
> nueva todavía; las 10 filas nuevas de la matriz de trazabilidad están en ⬜.

- **2 documentos nuevos sobre el catálogo por familias**, uno por cada capa de la
  documentación: [`documentation/Catalogo-por-Familias.md`](./Catalogo-por-Familias.md)
  (alcance, recorrido de compra, reglas por familia, fases y riesgos) y
  [`backend/documentation_Backend/Catalogo-por-Familias.md`](../backend/documentation_Backend/Catalogo-por-Familias.md)
  (rutas, modelo de datos, capas de archivos, cifrado de claves, migración y pruebas).
  No son copia uno del otro: cada uno tiene su público y su índice.
- **10 requisitos nuevos en el SRS** (de 154 a **164**), **sin renumerar ninguno** de los
  anteriores: `FR-BE-24`…`FR-BE-28` (catálogo de periféricos, de licencias y de juegos;
  carrito y checkout únicos; revalidación de precio y stock), `FR-DB-10` (producto con tipo
  y tablas de atributos por familia), `FR-BR-17`…`FR-BR-19` (`sku` único, la clave de
  licencia como secreto, licencia digital sin reembolso) y `FR-SEC-12` (la clave solo se
  entrega a quien la compró).
- **3 casos de uso nuevos** en [`Casos-de-Uso/02-Tienda-y-Pedidos.md`](./Casos-de-Uso/02-Tienda-y-Pedidos.md):
  `UC-20` (comprar un periférico), `UC-21` (comprar una licencia y recibir su clave) y
  `UC-22` (comprar un juego).
- **1 historia de usuario nueva:** `US-20` «comprar periféricos, licencias y juegos en un
  solo carrito y pagar una vez», en `EP-02`.
- **5 historias técnicas nuevas** (`TS-25`…`TS-29`): modelo con tipo y atributos por
  familia, catálogo *kind-aware* con tres routers, cifrado y entrega de claves de licencia,
  carrito y checkout multi-familia con revalidación, y contrato + proxy con los prefijos por
  familia. El documento pasa de 24 a **29 historias técnicas**.
- **1 decisión de arquitectura nueva:** **ADR-0017** «Catálogo por familias dentro de
  `store-service`, con un solo carrito y un solo pago». El documento pasa de 16 a **17 ADR**.
- **6 términos nuevos en el glosario:** *familia de producto*, *periférico*, *licencia*,
  *clave de licencia*, *juego en catálogo* y *SKU*, con la distinción explícita entre
  *juego en catálogo* y *aventura*.

### Cambiado — catálogo por familias

- **Matriz de trazabilidad v1.2** (`documentation/Trazabilidad.md`): **164 requisitos**
  (antes 154) con el recuento real **59 ✅ / 36 ⚠️ / 69 ⬜**; 10 filas nuevas, §12.1 ampliado
  a 23 ítems de deuda, tres contradicciones más resueltas en §12.2, §11 a 22 casos de uso y
  §12.4 con **48 decisiones** pendientes del SRS.
- **El catálogo deja de ser de un solo tipo de producto.** El SRS (`Backend.md`,
  `Database.md`, `Business-Rules.md` y `Security.md` pasan a **v1.1**) describe ahora tres
  familias —periféricos, licencias y juegos— dentro del mismo `store-service`, con **un solo
  carrito y un solo pago**. La estructura de la tienda, el carrito, el pedido, el inventario
  y los descuentos **no cambian**.
- **`/api/v1/products` desaparece del contrato público** y se sustituye por
  `/api/v1/peripherals`, `/api/v1/licenses` y `/api/v1/games`; `/api/v1/categories` se
  mantiene, con un filtro opcional `?kind=`. El contrato pasa de **59 operaciones en 45
  rutas** a **74 operaciones en 53 rutas**. Es un **cambio rompedor**, permitido porque el
  frontend todavía no hace llamadas HTTP (`FR-FE-10` ⬜).
- **`backend/documentation_Backend/README.md`:** se añadió el documento del catálogo al
  índice, se pasó el recuento de requisitos a 164 y se explicó **cómo se reparte la
  documentación entre las dos carpetas** (requisitos en `documentation/`, detalle de
  implementación en `backend/documentation_Backend/`).

### Seguridad — catálogo por familias

- **La clave de licencia se trata como un secreto:** cifrada en reposo, nunca en listados ni
  en logs, y solo se entrega a quien compró el pedido que la contiene (`FR-BR-18`,
  `FR-SEC-12`). La nueva variable `LICENSE_KEY_ENCRYPTION_KEY` se documenta **solo** como
  valor de ejemplo evidentemente falso.
- **Decisión pendiente anotada, no ocultada:** el procedimiento de **re-cifrado** al rotar
  la clave de cifrado todavía no existe; mientras tanto, la clave no se rota.

### Notas — catálogo por familias

- **Verificación de esta fase:** `164 IDs del SRS ↔ 164 filas de la matriz` (0 huérfanos, 0
  duplicados), recuento del documento coherente con el conteo real y **0 enlaces rotos**.
- **Nada de esto está implementado.** El estado real, requisito por requisito, sigue siendo
  la [matriz de trazabilidad](./Trazabilidad.md): las 10 filas nuevas están en ⬜ (salvo
  `FR-BE-28`, en ⚠️ porque el checkout actual ya revalida para la única familia existente, y
  `FR-BR-17`, en ✅ porque `Product.sku` ya es `@unique`).

### Añadido
- **Guía de estilo de código:** `documentation/Estilo-de-Codigo.md`, convenciones **descriptivas** del código real (formato Prettier/EditorConfig, TypeScript estricto, nomenclatura, estructura router→schemas→service, manejo de errores, convenciones de frontend y pruebas). Enlaza a `CONTRIBUTING.md` y demás documentos en lugar de duplicarlos.
- **13 requisitos nuevos en el SRS** (de 141 a 154), **sin renumerar ninguno** de los anteriores: `FR-BE-22` (canje del mercader), `FR-BE-23` (compensación de débitos), `FR-FE-11` (bandeja de avisos), `FR-FE-12` (panel de administración), `FR-FE-13` (ruta base única), `NFR-FE-08` (token seguro en el navegador), `FR-DB-09` (idempotencia persistida), `FR-SEC-11` (autenticación service-to-service), `FR-INF-07` (comando global de arranque), `FR-INF-08` (CI en cada PR), `NFR-INF-05` (observabilidad), `FR-NO-09` (marcar aviso como leído) y `FR-NO-10` (aviso generado por el servicio productor).
- **2 casos de uso y 1 historia de usuario nuevos:** `UC-19` (canjear monedas por objetos en el mercader) y `US-19`.
- **6 historias técnicas nuevas** (`documentation/Historias-Tecnicas.md`): TS-19 (canje del mercader), TS-20 (compensación de débitos), TS-21 (idempotencia persistida), TS-22 (token interno service-to-service), TS-23 (módulo de notificaciones) y TS-24 (comando global de arranque). El documento pasa de 18 a **24 historias técnicas**.
- **2 operaciones internas en el contrato entre servicios:** `POST /internal/merchant/redemptions` (canje del mercader) y `POST /internal/notifications` (aviso interno). El contrato pasa de 4 a **6 operaciones**; las secciones siguientes se renumeraron (§8→§10, §9→§11, §10→§12, §11→§13) y se actualizaron todas las referencias cruzadas.
- **Campos de partida de aventura en el contrato** (`Contrato-entre-servicios.md` §7): `outcome`, `mapId`, `enemiesDefeated`, `bossesDefeated`, `itemsObtained`, `chestSaved` e `itemsRetained`, con el mapeo de los enums `GameType` (`MINIGAME` = aventura, `GACHA` = ruleta) y `GameSessionStatus` (`FINISHED` = completada, `ABANDONED` = abandonada/muerte, `REJECTED` = descartada).
- **Documentación del backend:** `backend/documentation_Backend/Documentation01.md` (que estaba vacío, 0 bytes) se renombró a `README.md` y se redactó como índice de la documentación del backend.
- **Dominios `notifications/` y `admin/`** en `frontend/src/features/`, preparados para `FR-FE-11` y `FR-FE-12`.
- **`frontend/documentation/personal/README.md`:** plantilla y reglas de uso de la carpeta de documentación individual, que estaba sin explicación (solo un `.gitkeep`).
- **2 decisiones de arquitectura nuevas** (`documentation/Decisiones.md`): **ADR-0015** «Una única URL base en el frontend, con proxy inverso por prefijo» (el porqué del proxy) y **ADR-0016** «El juego es una aventura metroidvania; la ruleta y el mercader son sus componentes» (la fuente de verdad del alcance del juego). El documento pasa de 14 a **16 ADR**.

### Cambiado
- **El juego se redefinió como una aventura *metroidvania*.** `documentation/Software-requeriments(SRS)/Game.md` (v2.0) pasa a ser la **fuente de verdad** del alcance del juego y todo lo demás se alinea hacia él: la **aventura** (5 laberintos con jefes, el Rey Demonio al final) es el juego, y la **ruleta** (gacha) y el **mercader** son sus componentes. Se actualizaron el README raíz, los casos de uso (`UC-12`, `UC-13`, `UC-19`), las épicas (`US-12`, `US-13`, `US-19`), el glosario, el manual de usuario, el SRS de reglas de negocio y el SRS de notificaciones.
- **Matriz de trazabilidad v1.1** (`documentation/Trazabilidad.md`): 154 requisitos (antes 141) con el recuento real **58 ✅ / 35 ⚠️ / 61 ⬜**, 13 filas nuevas, §12.1 ampliado a 15 ítems de deuda, §12.2 con las contradicciones corregidas y §12.4 con las **44 decisiones** pendientes del SRS.
- **Contrato de API:** la documentación aclara que las **65 rutas** registradas equivalen a **59 operaciones** distintas (los 8 endpoints de salud colapsan en 2 rutas únicas) y que el conjunto `(método, ruta)` del código y el de `openapi.yaml` **coinciden uno a uno**. Se añadió el enlace al contrato entre servicios (§3.1).
- **`backend/README.md`:** el estado, el stack, el árbol de directorios y la sección «Próximos pasos» se reescribieron con la realidad del código (138 ficheros, 26 modelos, 57 endpoints) y se sustituyeron por una tabla de lo que **falta**, con el requisito que lo respalda.
- **`frontend/documentation/FRONTEND_ARCHITECTURE.md`:** pasa de «esquema propuesto, sin código» a la arquitectura **real** (9 páginas, 0 llamadas HTTP, proxy por prefijo, dominios y requisitos).
- **`frontend/ReadmeFrontEnd.md`:** se actualizó el estado del proyecto, la explicación de las variables de entorno y la tabla de dominios.

### Corregido
- **`VITE_API_BASE_URL` roto:** el frontend declaraba `http://localhost:3000`, donde **ningún servicio escucha**. Ahora `frontend/.env.example` usa `/api/v1` y `frontend/vite.config.ts` define un **proxy inverso por prefijo** que reparte cada ruta a su servicio (3001-3004). Es el requisito `FR-FE-13` y elimina de raíz el bug del puerto 3000.
- **Configuración de ESLint muerta:** `frontend/eslintrc.cjs` (que ESLint 10 no lee) se eliminó y se quitó su referencia de `eslint.config.js`.
- **Prettier en el frontend:** se añadió (`^3.9.10`) con `.prettierrc.json` configurado para **respetar** el estilo ya existente (`semi: false`, `singleQuote: true`, 100 columnas) y con los scripts `format`, `format:check` y `lint:fix`. Todo el código se reformateó: **solo cambia el formato**, ni una línea de comportamiento. `npm run format:check`, `npm run lint` y `npm run build` quedan en verde.
- **`FR-DB-01` pasa a ⚠️:** el SRS pedía «credenciales propias» por base de datos, pero las cuatro usan el mismo rol `postgres:postgres` (solo difieren en el nombre de la base). La matriz ahora lo dice con su evidencia.
- **README raíz:** «el equipo de tres integrantes» → cuatro; «etapa de planificación» → desarrollo; la descripción de los módulos como «vacíos a propósito» → el estado real del backend y del frontend.
- **Referencias cruzadas rotas:** los casos de uso enlazaban a requisitos inexistentes (`FR-GA-04`, `FR-GA-08`); `Security.md` apuntaba a `§8` del contrato entre servicios, que al renumerar pasó a ser `§10`.
- **`documentation/CHANGELOG_ESQUEMA.md`** (frontend) decía «ARCHITECTURE.md», pero el fichero real es `FRONTEND_ARCHITECTURE.md`, y mantenía un changelog paralelo que contradecía la regla de un único changelog por proyecto.
- **`documentation/Decisiones.md`:** ADR-0008 ya no dice que al frontend «le falta Prettier» (ya lo tiene) y apunta al ADR-0015 nuevo.

### Seguridad
- **Sin secretos ni datos sensibles** en los cambios: los ejemplos siguen usando valores evidentemente falsos y remitiendo a variables de entorno.

### Notas
- La documentación auditada cubre **37 documentos** del repositorio, revisados **uno a uno** contra el código (65 rutas, 26 modelos Prisma, 4 migraciones, 4 seeds y los 3 `TODO(economia)`).
- Verificaciones ejecutadas: `154 IDs del SRS ↔ 154 filas de la matriz` (0 huérfanos, 0 duplicados), `0 referencias rotas` en casos de uso, épicas, glosario y manual, y `59 operaciones del código ↔ 59 del openapi.yaml` (coinciden exactamente).
- Los cambios de código del frontend son **de bajo riesgo**: reformateo, configuración de herramientas y el proxy de desarrollo. No se toca ninguna lógica de negocio.

## [0.1.0] - 2026-10-19
### Añadido
- **Documentación técnica inicial (SRS):** 8 documentos que cubren Backend, Reglas de Negocio, Base de Datos, Frontend, Juego, Infraestructura, Notificaciones y Seguridad (`documentation/Software-requeriments(SRS)/`), con sus *Decisiones pendientes* por área.
- **Casos de uso:** 18 casos de uso organizados en 4 ficheros (`documentation/Casos-de-Uso/`), con actores, flujos y requisitos asociados.
- **Diagramas de flujo y arquitectura:** 9 diagramas SVG generados con `tools/svgkit.py` + `layout.py` (flujo, explícitos, secuencia, máquina de estados) dentro de `documentation/diagramas de flujo/`, con índice y convenciones (`README.md`).
  - 01 Compra de producto, 02 Apertura de la ruleta, 03 Monedas y vencimiento, 04 Revisión de comportamiento sospechoso, 05 Arquitectura general (contenedores), 06 Secuencia autenticación, 07 Secuencia juego↔backend, 08 Ciclo de vida del pedido, 09 Modelo de datos (ER).
- **Matriz de trazabilidad:** `documentation/Trazabilidad.md` cruza los 141 requisitos del SRS con el estado real del código (57 ✅ / 35 ⚠️ / 49 ⬜), incluyendo evidencia por fichero y deuda técnica explícita (`TODO`).
- **Contrato de API (OpenAPI):** `documentation/API/openapi.yaml` (3.1.0) con 59 operaciones documentadas para los 4 microservicios, validado con Redocly CLI y acompañado de `documentation/API/README.md` (cómo visualizarlo, puertos, auth JWT, formato de errores). Configuración de validación en `documentation/API/redocly.yaml`.
- **Diccionario de datos:** `documentation/Diccionario-de-Datos.md` con los 26 modelos Prisma de los 4 servicios (identity, store, economy, payments), campos, enums, reglas de integridad y referencias entre servicios (sin FK entre bases).
- **Base del backend:** 4 microservicios (identity/store/economy/payments) con sus routers, servicios, esquemas Zod, middlewares de auth/roles, manejo centralizado de errores, migraciones Prisma iniciales (4), seeds idempotentes (4) y tests de salud/esquemas/autorización (Vitest + Supertest).
- **Base del frontend:** estructura React + TypeScript + Vite + Tailwind con 9 páginas, routing, arquitectura por features (esqueleto), variables de entorno de ejemplo y configuración ESLint.
- **Infraestructura local:** `infra/docker/docker-compose.yml` para levantar PostgreSQL por servicio con sus bases (`gearquest_identity/store/economy/payments`) e `initdb/01-create-databases.sql`.
- **QA de diagramas:** `documentation/diagramas de flujo/tools/qa.py` para validación geométrica (solapes, cruces, texto dentro de lienzo). `generar.py` admite `--check` para CI (detecta SVG desactualizados).

### Añadido — documentación de uso y operación
- **Manual de usuario:** `documentation/Manual-de-Usuario.md`, recorrido funcional paso a paso con el **estado real** de cada pantalla (✅ funciona / ⚠️ a medias / ⬜ maqueta).
- **Guía de instalación:** `documentation/Guia-de-Instalacion.md`, puesta en marcha desde cero (requisitos, `.env`, base de datos con Docker, migraciones, seeds, comandos y solución de problemas).
- **Guía de despliegue:** `documentation/Despliegue.md`, cómo se publicaría el proyecto (estados honestos, checklist de seguridad, pasos ilustrativos y decisiones pendientes), coherente con el SRS de Infraestructura.
- **Decisiones de arquitectura (ADR):** `documentation/Decisiones.md` con 14 ADR (microservicios, base por servicio, Prisma, autoridad del servidor, monedas por lotes, pagos simulados, JWT propuesto, clasificación de la información, etc.).
- **Política de seguridad documental:** `documentation/Politica-de-Seguridad-Documental.md` con las 3 capas de información (pública/interna/restringida), reglas de redacción de límites conocidos, manejo de secretos y checklist de verificación previo a publicar.
- **Glosario:** `documentation/Glosario.md`, vocabulario del proyecto explicado para personas sin experiencia (negocio, desarrollo web, bases de datos, juego, proceso).
- **Índice maestro actualizado:** `documentation/README.md` enlaza y organiza los nuevos documentos por secciones (uso y operación, decisiones y vocabulario).

### Añadido — planificación del trabajo (épicas, historias y DoD)
- **Épicas e historias de usuario:** `documentation/Epicas-e-Historias.md` con las **4 épicas** del proyecto (Cuenta e identidad, Tienda y compra, Juego y economía, Avisos) y las **18 historias de usuario** (US-01…US-18), cada una enlazada a su caso de uso y a sus requisitos, con ejemplos de criterios de aceptación (Dado/cuando/entonces). Incluye una explicación de qué es una épica y qué una historia, para juniors.
- **Historias técnicas:** `documentation/Historias-Tecnicas.md` con **18 historias técnicas** (TS-01…TS-18) agrupadas por área (integración entre servicios, integridad de dinero, infraestructura, calidad/CI, frontend, seguridad), cada una nacida de un `TODO` verificado en el código o de un requisito del SRS, con priorización.
- **Definition of Done:** `documentation/Definition-of-Done.md` con el checklist verificable de «terminado» (código, reglas, pruebas, datos, documentación, seguridad e integración) y 3 niveles (tarea, historia, épica), con un ejemplo aplicado.
- **README raíz actualizado:** nueva sección §3 (equipo con espacio para integrantes, planificación del trabajo y decisiones) y §14 con enlaces a toda la documentación; el índice maestro y las convenciones de códigos (`EP-`, `US-`, `TS-`) se amplían para reflejar los nuevos documentos.
- **Contrato entre servicios:** `documentation/Contrato-entre-servicios.md`, contrato **interno** (no público) que define cómo se comunican los microservicios: 4 operaciones (`/internal/*` de saldo, débito, crédito y validación de partida), autenticación service-to-service con JWT, idempotencia, formato de errores y las decisiones pendientes. Es el diseño que cierra la deuda de integración (`TODO(economia)`, `TS-01…TS-04`).

### Seguridad
- **Auditoría de la documentación:** revisión de los 29 documentos por 11 categorías de riesgo (secretos, credenciales, datos personales, direcciones reales, detalles explotables). Sin secretos ni datos críticos comprometidos.
- **Tono de los límites conocidos:** en `documentation/API/openapi.yaml` se reformularon las notas de «pendiente/no valida» a «límite conocido / pendiente de endurecer», para informar sin dar munición a un atacante.
- Toda la documentación nueva **no expone secretos ni datos críticos**: usa valores de ejemplo evidentemente falsos y remite los valores reales a variables de entorno fuera del repositorio (ver ADR-0013 y ADR-0014).

### Notas
- El contrato API describe lo **realmente implementado**; no documenta como disponible lo que está pendiente (canje de descuentos con débito de monedas, acreditación de monedas compradas). Esto se deja explícito en `documentation/API/README.md` y se traza en `documentation/Trazabilidad.md` §12.1.
- Se corrige la contradicción histórica del SRS ("lógica de negocio todavía no está implementada"): la matriz de trazabilidad refleja el estado real. El `README.md` del SRS se actualiza con un enlace a `../Trazabilidad.md`.
- Se documenta la discrepancia `VITE_API_BASE_URL`: en `frontend/.env.example` apunta a `http://localhost:3000`, mientras que los servicios escuchan en 3001-3004 (hallazgo en `Trazabilidad.md` §12.2). **No se modifica el frontend** (fuera del ámbito de documentación autorizado).
  - **Resuelto en `[Sin versionar]`:** el frontend ahora usa `/api/v1` con un proxy inverso por prefijo (`FR-FE-13`).
- La auditoría de 29 documentos citada arriba corresponde a esta versión. La **auditoría completa** (37 documentos, revisados uno a uno contra el código) está en `[Sin versionar]`.

[0.1.0]: https://github.com/AgudeloAlexander623/TiendaOnline_Gacha/commit/ef9a720
