# Documentación de GearQuest

> **Qué es esta carpeta:** toda la documentación técnica y funcional del proyecto
> GearQuest, organizada para que puedas encontrar la respuesta sin leer el código.
> **Por dónde empezar:** si es tu primera vez, lee las §1 y §2 de este documento.
> **Estado del sistema:** la [**Matriz de trazabilidad**](./Trazabilidad.md) es la
> fuente de verdad de qué está hecho y qué no.

---

## 1. Mapa de la documentación (por dónde entra cada cosa)

Piensa en esta carpeta como un edificio con entradas distintas según lo que necesites:

| Si buscas… | Entra por… |
| --- | --- |
| **¿Qué debe hacer el sistema?** | [Especificación de Requisitos (SRS)](./Software-requeriments\(SRS\)/README.md) |
| **¿Qué objetivos y necesidades hay?** | [Épicas e historias de usuario](./Epicas-e-Historias.md) |
| **¿Qué trabajo técnico hace falta?** | [Historias técnicas](./Historias-Tecnicas.md) |
| **¿Cuándo algo está terminado?** | [Definition of Done](./Definition-of-Done.md) |
| **¿Cómo lo uso, paso a paso?** | [Manual de usuario](./Manual-de-Usuario.md) |
| **¿Cómo se usa el sistema, caso por caso?** | [Casos de uso](./Casos-de-Uso/README.md) |
| **¿Cómo levanto el proyecto en mi PC?** | [Guía de instalación](./Guia-de-Instalacion.md) |
| **¿Qué está hecho, a medias o pendiente?** | [Matriz de trazabilidad](./Trazabilidad.md) |
| **¿Por qué está construido así?** | [Decisiones de arquitectura (ADR)](./Decisiones.md) |
| **¿Qué significa esta palabra rara?** | [Glosario](./Glosario.md) |
| **¿Cómo hablo con el backend (rutas, datos, errores)?** | [Contrato de la API](./API/README.md) |
| **¿Cómo se hablan los servicios entre sí?** | [Contrato entre servicios](./Contrato-entre-servicios.md) |
| **¿Cómo son las tablas y los campos?** | [Diccionario de datos](./Diccionario-de-Datos.md) |
| **¿Qué vende la tienda y cómo se compra?** | [Catálogo por familias](./Catalogo-por-Familias.md) |
| **¿Cómo se ve un flujo o la arquitectura?** | [Diagramas](./diagramas%20de%20flujo/README.md) |
| **¿Y qué no debo publicar?** | [Política de seguridad documental](./Politica-de-Seguridad-Documental.md) |
| **¿Cómo se publica el proyecto?** | [Guía de despliegue](./Despliegue.md) |
| **¿Cómo contribuyo o qué reglas sigue el equipo?** | [Cómo contribuir](./CONTRIBUTING.md) |
| **¿Cómo se escribe el código aquí?** | [Guía de estilo de código](./Estilo-de-Codigo.md) |
| **¿Cómo se prueba lo crítico?** | [Estrategia de pruebas](./Estrategia-de-Pruebas.md) |
| **¿Qué ha cambiado y en qué versión?** | [Changelog](./CHANGELOG.md) |

---

## 2. Índice completo de documentos

### 2.1 Requisitos y comportamiento

| Documento | Qué contiene |
| --- | --- |
| [`Epicas-e-Historias.md`](./Epicas-e-Historias.md) | Las **4 épicas** y las **20 historias de usuario**, con criterios de aceptación |
| [`Historias-Tecnicas.md`](./Historias-Tecnicas.md) | Las **29 historias técnicas** que habilitan las historias de usuario (integración, integridad, infra, CI, juego, avisos, catálogo por familias) |
| [`Catalogo-por-Familias.md`](./Catalogo-por-Familias.md) | La **página de ventas** en tres familias (periféricos, licencias y juegos) con **un solo carrito y un solo pago**: alcance, recorrido de compra, reglas, fases y riesgos |
| [`Definition-of-Done.md`](./Definition-of-Done.md) | Checklist de «terminado» para toda tarea, con 3 niveles (tarea, historia, épica) |
| [`Software-requeriments(SRS)/README.md`](./Software-requeriments\(SRS\)/README.md) | Puerta de entrada al SRS: cómo leerlo y alcance |
| [`Software-requeriments(SRS)/Backend.md`](./Software-requeriments\(SRS\)/Backend.md) | Requisitos funcionales y no funcionales del backend |
| [`Software-requeriments(SRS)/Business-Rules.md`](./Software-requeriments\(SRS\)/Business-Rules.md) | Reglas de negocio (monedas, vencimientos, descuentos, permisos) |
| [`Software-requeriments(SRS)/Database.md`](./Software-requeriments\(SRS\)/Database.md) | Modelo de datos y decisiones de persistencia |
| [`Software-requeriments(SRS)/Frontend.md`](./Software-requeriments\(SRS\)/Frontend.md) | Requisitos de la interfaz web |
| [`Software-requeriments(SRS)/Game.md`](./Software-requeriments\(SRS\)/Game.md) | **Fuente de verdad del juego:** aventura tipo *metroidvania*, tienda del mercader, ruleta e integración con el backend |
| [`Software-requeriments(SRS)/Infrastructure.md`](./Software-requeriments\(SRS\)/Infrastructure.md) | Entornos, Docker, despliegue |
| [`Software-requeriments(SRS)/Notifications.md`](./Software-requeriments\(SRS\)/Notifications.md) | Notificaciones y avisos |
| [`Software-requeriments(SRS)/Security.md`](./Software-requeriments\(SRS\)/Security.md) | Autenticación, autorización y protección de datos |
| [`Casos-de-Uso/README.md`](./Casos-de-Uso/README.md) | Índice de los 22 casos de uso |
| [`Casos-de-Uso/01-Identidad-y-Usuarios.md`](./Casos-de-Uso/01-Identidad-y-Usuarios.md) | Registro, sesión, perfil y administración de usuarios |
| [`Casos-de-Uso/02-Tienda-y-Pedidos.md`](./Casos-de-Uso/02-Tienda-y-Pedidos.md) | Catálogo, carrito, checkout y pedidos |
| [`Casos-de-Uso/03-Juego-y-Economia.md`](./Casos-de-Uso/03-Juego-y-Economia.md) | Monedero, aventura, mercader, ruleta y recompensas |
| [`Casos-de-Uso/04-Notificaciones.md`](./Casos-de-Uso/04-Notificaciones.md) | Avisos y notificaciones |

### 2.2 Uso y operación

| Documento | Qué contiene |
| --- | --- |
| [`Manual-de-Usuario.md`](./Manual-de-Usuario.md) | Qué puede hacer el usuario, paso a paso, con el **estado real** de cada pantalla (✅/⚠️/⬜) |
| [`Guia-de-Instalacion.md`](./Guia-de-Instalacion.md) | Cómo levantar frontend y backend desde cero: requisitos, `.env`, base de datos y solución de problemas |
| [`Despliegue.md`](./Despliegue.md) | Cómo se publicaría el proyecto en un servidor: estados, checklist de seguridad y pasos ilustrativos |

### 2.3 Estado real y contrato

| Documento | Qué contiene |
| --- | --- |
| [`Trazabilidad.md`](./Trazabilidad.md) | **Matriz requisito → estado → evidencia** para los 164 requisitos y los 22 casos de uso; hallazgos, deuda técnica y contradicciones resueltas |
| [`API/README.md`](./API/README.md) | Guía del contrato: cómo verlo, autenticación, formato de errores y mapa de servicios |
| [`API/openapi.yaml`](./API/openapi.yaml) | Contrato OpenAPI 3.1 de los 4 microservicios (fuente de verdad del formato de la API) |
| [`API/redocly.yaml`](./API/redocly.yaml) | Configuración del validador del contrato |
| [`Contrato-entre-servicios.md`](./Contrato-entre-servicios.md) | El contrato **interno**: cómo se comunican los 5 flujos entre microservicios (saldo, débito, crédito, validación de partida), autenticación service-to-service y decisiones pendientes |
| [`Diccionario-de-Datos.md`](./Diccionario-de-Datos.md) | Descripción campo a campo de las 26 entidades Prisma, enums, reglas de integridad y referencias entre servicios |

### 2.4 Diagramas

| Documento | Qué contiene |
| --- | --- |
| [`diagramas de flujo/README.md`](./diagramas%20de%20flujo/README.md) | Índice de los 9 diagramas, leyenda y cómo regenerarlos |
| [`diagramas de flujo/tools/`](./diagramas%20de%20flujo/tools/) | Generador propio (Python, sin dependencias): especificación + layout + QA |
| `diagramas de flujo/NN_*.svg` | Los 9 diagramas en SVG (flujos, arquitectura, secuencia, estados, modelo de datos) |

### 2.5 Decisiones, vocabulario y seguridad documental

| Documento | Qué contiene |
| --- | --- |
| [`Decisiones.md`](./Decisiones.md) | 17 ADR: por qué microservicios, una base por servicio, monedas por lotes, pagos simulados, ruta base única con proxy inverso, catálogo por familias con carrito único, clasificación de la información, etc. |
| [`Politica-de-Seguridad-Documental.md`](./Politica-de-Seguridad-Documental.md) | Qué se puede publicar y qué no: las 3 capas de información, manejo de secretos y checklist previo |
| [`Glosario.md`](./Glosario.md) | Todos los términos del proyecto (ruleta, lote, JWT, migración…) explicados para juniors |

### 2.6 Proceso del equipo

| Documento | Qué contiene |
| --- | --- |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Ramas, Conventional Commits, flujo de PR y checklist de revisión |
| [`Estilo-de-Codigo.md`](./Estilo-de-Codigo.md) | Convenciones de código (formato, TypeScript, nomenclatura, estructura de módulo, errores, frontend), **descriptivas** del código real |
| [`Estrategia-de-Pruebas.md`](./Estrategia-de-Pruebas.md) | Enfoque de pruebas guiado por riesgo, reglas críticas y deuda priorizada |
| [`CHANGELOG.md`](./CHANGELOG.md) | Historial de cambios por versión (Keep a Changelog + SemVer) |

---

## 3. Cómo leer los códigos de requisito

En toda la documentación verás códigos con un patrón fijo. Sirven para cruzar
documentos sin ambigüedad:

| Código | Significado | Ejemplo |
| --- | --- | --- |
| `FR-<área>-<nn>` | Requisito **funcional** (algo que el sistema hace) | `FR-BE-12` |
| `NFR-<área>-<nn>` | Requisito **no funcional** (calidad, seguridad, rendimiento) | `NFR-BE-07` |
| `FR-BR-<nn>` | Regla de negocio (subconjunto funcional) | `FR-BR-02` |
| `UC-<nn>` | Caso de uso | `UC-08` |
| `EP-<nn>` | Épica (objetivo grande) | `EP-02` |
| `US-<nn>` | Historia de usuario | `US-08` |
| `TS-<nn>` | Historia técnica | `TS-01` |

Los `<área>` habituales son `BE` (backend), `BR` (reglas), `DB` (datos),
`FE` (frontend), `GA` (juego), `SEC` (seguridad), entre otros.

> **Truco:** si un documento dice que algo está hecho, comprueba el estado en
> [`Trazabilidad.md`](./Trazabilidad.md). Si algo dice que *no* está hecho, también.

---

## 4. Convenciones de toda la documentación

1. **Idioma:** la documentación se escribe en **español**. Los identificadores de
   código (nombres de campos, tipos, códigos de error) van en inglés.
2. **Honestidad:** nunca se documenta como hecho algo que no existe en el código.
   Lo que falta se marca como **pendiente** o **propuesto**, y se traza.
3. **Fuente de verdad por tema:** los `schema.prisma` mandan sobre el diccionario
   de datos; el código manda sobre el contrato de la API; el código manda sobre
   la matriz. La documentación **describe**, no sustituye.
4. **Trazabilidad viva:** cuando cambias el estado de un requisito, actualizas
   [`Trazabilidad.md`](./Trazabilidad.md) en el **mismo PR** (ver
   [`CONTRIBUTING.md`](./CONTRIBUTING.md)).
5. **Diagramas generados:** los SVG no se editan a mano; se edita
   `diagramas de flujo/tools/diagramas.py` y se regenera.

---

## 5. Cómo se mantiene esta carpeta

| Tarea | Acción |
| --- | --- |
| Añadir/eliminar un requisito | Editar el SRS correspondiente y actualizar `Trazabilidad.md` |
| Añadir una historia de usuario | Añadirla a `Epicas-e-Historias.md` (con su caso de uso) |
| Añadir una historia técnica | Añadirla a `Historias-Tecnicas.md` (con su origen: requisito o `TODO`) |
| Cambiar la API | Editar `API/openapi.yaml` y validar con Redocly (ver `API/README.md` §7) |
| Cambiar el modelo de datos | Editar `Diccionario-de-Datos.md`, regenerar el diagrama 09 y validar con `qa.py` |
| Añadir un diagrama | Añadirlo a `tools/diagramas.py`, regenerar y registrarlo en su `README.md` |
| Tomar una decisión de diseño | Crear un ADR en `Decisiones.md` |
| Añadir una función visible para el usuario | Actualizar `Manual-de-Usuario.md` con su estado |
| Cambiar cómo se levanta el proyecto | Actualizar `Guia-de-Instalacion.md` |
| Cambiar algo del despliegue | Actualizar `Despliegue.md` |
| Aparece un término nuevo | Añadirlo a `Glosario.md` |
| Vas a documentar algo sensible | Consultar `Politica-de-Seguridad-Documental.md` antes de escribirlo |
| Publicar un cambio del producto | Añadirlo a `CHANGELOG.md` |
| Cambiar una regla del equipo | Editarla en `CONTRIBUTING.md`, no en la memoria de cada quien |

---

*Si algo de esta carpeta no te cuadra con el código, gana el código: corrige el
documento (o abre un issue) y avísalo. La documentación desactualizada es peor que
la ausente, porque engaña con seguridad.*
