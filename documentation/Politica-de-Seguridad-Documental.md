# Política de seguridad de la documentación — GearQuest

> **Para quién es esto:** para cualquier integrante que **escriba o publique**
> documentación. Responde a una pregunta sencilla: *«¿esto que voy a documentar se puede
> publicar, o es información que un atacante podría aprovechar?»*.
>
> **Por qué existe:** la documentación se comparte, se copia y —en este proyecto— es
> **pública**. Un documento es como una ventana a la casa: debe mostrar la casa, no dónde
> está la llave de la puerta.

---

## 1. Contexto: dónde vive hoy la documentación

GearQuest es un **proyecto académico** y hoy **toda** su documentación está en un
repositorio que se comparte sin restricciones. Eso tiene una consecuencia directa:

> **Regla base:** si no se puede publicar, **no se escribe** todavía. Se pospone hasta
> que exista un lugar privado donde guardarlo.

Esta política define **qué se puede documentar en abierto** y **qué no**, y qué hacer con
lo que no.

---

## 2. Las tres clases de información

Clasificamos todo en tres capas, igual que se hace en las empresas serias.

| Clase | Qué es | Dónde va | Ejemplos |
| --- | --- | --- | --- |
| 🟢 **Pública** | Información que describe **qué hace** el sistema | Repositorio (abierto) | Requisitos, casos de uso, diagramas, contrato de la API, guías |
| 🟡 **Interna** | Información útil para el equipo, sin riesgo si se filtra **hoy** | Repositorio, pero **marcada** | Limitaciones conocidas, deuda técnica, decisiones pendientes |
| 🔴 **Restringida** | Información que, si se filtra, **facilita un ataque** | **Fuera** del repositorio | Secretos, credenciales, topologías de producción, procedimientos de recuperación |

> **Antojo mental:** 🟢 describe la casa; 🟡 describe que aún falta poner una alarma;
> 🔴 **es** la llave de la puerta.

---

## 3. Qué SÍ se puede documentar (🟢 pública)

Está bien documentar, y de hecho conviene hacerlo:

- **Qué hace** cada función del sistema (requisitos, casos de uso, flujos).
- **Cómo se usa** el sistema (manual de usuario).
- **Cómo se levanta** en local (guía de instalación), usando **valores de ejemplo falsos**.
- **Qué forma tienen** los datos y las peticiones (contrato de la API, diccionario de datos).
- **Decisiones de diseño** y su justificación (ADR).
- **El estado real** del proyecto: qué está hecho, a medias o pendiente.

---

## 4. Qué NO se puede documentar (🔴 restringida)

Nunca, bajo ninguna circunstancia, en un documento del repositorio:

| ❌ Prohibido | Por qué |
| --- | --- |
| Contraseñas, tokens o claves **reales** | Dan acceso directo |
| Cadenas de conexión de **producción** | Permiten entrar a la base de datos |
| Direcciones IP, dominios internos o topología de servidores reales | Facilitan la exploración |
| Nombres y correos de usuarios **reales** | Datos personales |
| Datos de tarjetas o pasarelas reales | Riesgo financiero y legal |
| Procedimientos de recuperación de cuentas, códigos de respaldo | Permiten tomar cuentas |
| **Explicaciones detalladas de cómo saltarse un control** | Convierten la documentación en un manual de ataque |

> **Regla de oro:** si dudas, **no lo escribas**. Pregúntale al equipo y, si hace falta,
> guárdalo en un canal privado (fuera del repositorio).

---

## 5. Cómo documentar un límite conocido sin dar munición

Este es el punto más fino. Documentar que algo **falta** es honesto y necesario (🟡
interna), pero el **tono** importa: no debe sonar a invitación.

### ❌ Mal (suena a «ven a atacarme aquí»)

> «Hoy el sistema **no valida** el resultado de la partida: se acepta cualquier puntaje.»

### ✅ Bien (suena a límite gestionado)

> «El endurecimiento de la validación del resultado de la partida está **pendiente**;
> hoy se aplica una regla de conversión con tope.»

### Por qué

- Ambas frases dicen la **verdad**: la regla está pendiente.
- La primera describe **el agujero y cómo usarlo**; la segunda describe **el estado del
  trabajo**.
- Un evaluador o un compañero entiende igual el mensaje; un atacante, mucho menos.

### Reglas de redacción

1. Habla de **estado del trabajo** («pendiente de endurecer»), no de **conducta del sistema**
   («no valida», «acepta cualquier»).
2. **No incluyas** el procedimiento para explotarlo.
3. **No describas** el valor exacto que falta validar ni el campo que lo permite.
4. Referencia el seguimiento interno (`Trazabilidad.md`), no repitas el detalle aquí.

---

## 6. Manejo de secretos (🟢 en su forma de ejemplo)

Un **secreto** es una credencial que da acceso (clave de firma, contraseña de base de
datos). El principio es simple:

- Los secretos **viven fuera del repositorio**: en un archivo `.env` local (que está en
  `.gitignore`) o en el panel de variables del servidor.
- La documentación **solo** muestra **plantillas** (`.env.example`) con valores
  **evidentemente falsos** (`dev-only-secret-change-me-in-production`, `<tu-clave-aqui>`,
  `<dominio>`).
- Si un valor parece «casi real», cámbialo por un placeholder.

### Si un secreto se filtró por accidente

1. **No entres en pánico, pero actúa rápido**: considera el secreto comprometido.
2. **Rótalo** (genera uno nuevo) en el entorno correspondiente.
3. **Sácalo** del repositorio y **límpialo** del historial de Git si es necesario.
4. **Avisa** al equipo.
5. **Documenta** la lección en el `CHANGELOG` (sin el valor filtrado).

> **Por qué rotar y no solo borrar:** si estuvo aunque sea un minuto en Git, hay que
> asumir que alguien lo copió. Borrar no basta; hay que **invalidarlo**.

---

## 7. Comprobación antes de publicar (checklist)

Antes de hacer público un documento (o publicar el repositorio), ejecuta esta comprobación.

```bash
# 1. Buscar posibles secretos en la documentación
grep -rniE "(api[_-]?key|secret|password|token|bearer|private[_-]?key)[[:space:]]*[:=]" \
  documentation README.MD 2>/dev/null

# 2. Buscar datos personales o rutas locales
grep -rniE "([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|/home/|/Users/|C:\\\\)" \
  documentation 2>/dev/null

# 3. Buscar credenciales por defecto que parezcan reales
grep -rniE "(admin:admin|root:|postgres:postgres)" documentation 2>/dev/null
```

**Cómo leer el resultado:** todo lo que aparezca debe ser un **valor de ejemplo evidente**
(`dev-only-…`, `<…>`, `postgres:postgres` marcado como local). Si aparece un valor que
**no** reconoces como falso, **detente** y revísalo.

Checklist manual:

- [ ] Ningún valor parece una credencial real.
- [ ] Los límites conocidos están redactados como **estado**, no como **conducta**.
- [ ] No hay nombres, correos ni datos de personas reales.
- [ ] No hay direcciones de producción ni topología interna.
- [ ] No se explica **cómo** explotar ninguna debilidad.
- [ ] Los enlaces externos apuntan solo a recursos públicos (documentación de herramientas).

---

## 8. Qué hacer si el proyecto crece (documentación interna)

Hoy todo es público porque es un proyecto académico. **Si en el futuro** el proyecto
maneja datos reales, la clase 🟡 (interna) debería **separarse**:

| Hoy (todo público) | Mañana (maduro) |
| --- | --- |
| Limitaciones en la misma guía | Sección **interna** aparte, no publicada |
| Cadena de conexión de ejemplo | Igual (ejemplo), pero el real nunca se toca |
| Post-mortems en el `CHANGELOG` | Post-mortems en un espacio privado |

**Cómo hacerlo:** mover los documentos 🟡 a una carpeta o repositorio **privado**, y
dejar en público solo la clase 🟢. El [ADR-0013](./Decisiones.md) ya anticipó este
principio.

---

## 9. Reglas para el equipo (resumen)

1. **Nunca** escribas un secreto real en la documentación.
2. **Siempre** usa placeholders evidentemente falsos en los ejemplos.
3. Documenta los límites con **tono de estado**, no de conducta.
4. **No** incluyas rutas de explotación ni pasos para saltar controles.
5. Antes de publicar, corre el **checklist de la §7**.
6. Si algo es 🔴, se queda **fuera** del repositorio.
7. Ante la duda: pregunta y, mientras, **no lo escribas**.

---

## 10. Enlaces relacionados

| Documento | Para qué |
| --- | --- |
| [`Decisiones.md`](./Decisiones.md) | ADR-0013 (no exponer secretos) |
| [`Software-requeriments(SRS)/Security.md`](./Software-requeriments(SRS)/Security.md) | Requisitos de seguridad |
| [`Despliegue.md`](./Despliegue.md) | Checklist de seguridad al publicar |
| [`Guia-de-Instalacion.md`](./Guia-de-Instalacion.md) | Uso de `.env` con valores de ejemplo |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Reglas de colaboración del equipo |
| [`Trazabilidad.md`](./Trazabilidad.md) | Seguimiento interno de lo pendiente |
