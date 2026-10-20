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

## [0.1.0] - 2026-10-19
### Añadido
- **Documentación técnica inicial (SRS):** 8 documentos que cubren Backend, Reglas de Negocio, Base de Datos, Frontend, Juego, Infraestructura, Notificaciones y Seguridad (`documentation/Software-requeriments(SRS)/`), con sus *Decisiones pendientes* por área.
- **Casos de uso:** 18 casos de uso organizados en 4 ficheros (`documentation/Casos-de-Uso/`), con actores, flujos y requisitos asociados.
- **Diagramas de flujo y arquitectura:** 9 diagramas SVG generados con `tools/svgkit.py` + `layout.py` (flujo, explícitos, secuencia, máquina de estados) dentro de `documentation/diagramas de flujo/`, con índice y convenciones (`README.md`).
  - 01 Compra de producto, 02 Apertura de gacha, 03 Monedas y vencimiento, 04 Revisión de comportamiento sospechoso, 05 Arquitectura general (contenedores), 06 Secuencia autenticación, 07 Secuencia juego↔backend, 08 Ciclo de vida del pedido, 09 Modelo de datos (ER).
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

### Seguridad
- **Auditoría de la documentación:** revisión de los 29 documentos por 11 categorías de riesgo (secretos, credenciales, datos personales, direcciones reales, detalles explotables). Sin secretos ni datos críticos comprometidos.
- **Tono de los límites conocidos:** en `documentation/API/openapi.yaml` se reformularon las notas de «pendiente/no valida» a «límite conocido / pendiente de endurecer», para informar sin dar munición a un atacante.
- Toda la documentación nueva **no expone secretos ni datos críticos**: usa valores de ejemplo evidentemente falsos y remite los valores reales a variables de entorno fuera del repositorio (ver ADR-0013 y ADR-0014).

### Notas
- El contrato API describe lo **realmente implementado**; no documenta como disponible lo que está pendiente (canje de descuentos con débito de monedas, acreditación de monedas compradas). Esto se deja explícito en `documentation/API/README.md` y se traza en `documentation/Trazabilidad.md` §12.1.
- Se corrige la contradicción histórica del SRS ("lógica de negocio todavía no está implementada"): la matriz de trazabilidad refleja el estado real. El `README.md` del SRS se actualiza con un enlace a `../Trazabilidad.md`.
- Se documenta la discrepancia `VITE_API_BASE_URL`: en `frontend/.env.example` apunta a `http://localhost:3000`, mientras que los servicios escuchan en 3001-3004 (hallazgo en `Trazabilidad.md` §12.2). **No se modifica el frontend** (fuera del ámbito de documentación autorizado).

[0.1.0]: https://github.com/AgudeloAlexander623/TiendaOnline_Gacha/commit/ef9a720
