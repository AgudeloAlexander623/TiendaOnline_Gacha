# Definition of Done (Definición de terminado) — GearQuest

> **Para quién es esto:** para todo el equipo, antes de decir «ya está».
> **Qué resuelve:** evita el clásico «en mi máquina funciona y creo que está listo».
> Define **cuándo una tarea está realmente terminada**, con criterios que se pueden
> comprobar, no con opiniones.
> **Regla base:** «terminado» **no** es «yo creo que funciona». Es «alguien más lo puede
> comprobar siguiendo estos pasos y sale bien».

---

## 1. Por qué existe un Definition of Done (para juniors)

Sin una definición de terminado, cada persona entiende «terminado» de forma distinta:

- Para uno, «terminado» = *el código compila*.
- Para otro, «terminado» = *lo probé una vez y funcionó*.
- Para otro, «terminado» = *está mergeado en `main`*.

Eso produce tareas «terminadas» que rompen la demo, o que nadie sabe si funcionan. El
**Definition of Done (DoD)** es el **acuerdo del equipo** sobre qué significa «terminado».
Se aplica a **toda** tarea: una historia de usuario, una historia técnica o un arreglo de
un bug.

> **Analogía:** para decir que un pastel está «hecho» no basta con que esté en el horno.
> Tiene que estar cocido, frío, decorado y probado. El DoD es la receta de «hecho».

---

## 2. El checklist (lo que se comprueba en cada tarea)

Una tarea está **terminada** solo si **todas** las casillas aplicables están marcadas. Las
que no apliquen se marcan como *N/A* con una razón breve.

### 2.1 Código

- [ ] El código **compila / construye** sin errores.
- [ ] Se ejecuta el **typecheck** sin errores (el proyecto usa TypeScript `strict`).
- [ ] Se ejecuta el **linter** sin errores nuevos.
- [ ] El **formato** está aplicado (Prettier en backend; ESLint en frontend).
- [ ] No quedan `console.log` de depuración, código comentado «por si acaso» ni `TODO` sin explicar.
- [ ] Los **nombres** (variables, funciones, tipos) describen lo que hacen.

### 2.2 Reglas y requisitos

- [ ] La tarea responde a un **requisito** (`FR-*` / `NFR-*`) o a un **caso de uso** (`UC-*`)
      identificado.
- [ ] Los **criterios de aceptación** de la historia se cumplen uno por uno.
- [ ] Las **reglas críticas** (monedas, saldo, vencimientos, permisos, precios) se validan
      **en el servidor**, nunca solo en el cliente.
- [ ] Si la tarea cambia el **contrato de la API**, `documentation/API/openapi.yaml` está
      actualizado y validado.

### 2.3 Pruebas

- [ ] Si toca una **regla crítica** (ver [Estrategia de pruebas](./Estrategia-de-Pruebas.md)
      §4), tiene una prueba que la cubre.
- [ ] Las pruebas **pasan** de forma local (`npm test` en backend).
- [ ] El nombre de la prueba **cita el requisito** cuando aplica
      (`it("FR-BR-02: las monedas ganadas expiran a los 30 días", …)`).
- [ ] No se han **desactivado ni borrado** pruebas para que el build pase.

### 2.4 Datos y migraciones

- [ ] Si cambia el modelo de datos, existe una **migración** versionada de Prisma.
- [ ] La migración se aplica **sin errores** sobre una base limpia (`prisma migrate deploy`).
- [ ] Si cambia el modelo, el [Diccionario de datos](./Diccionario-de-Datos.md) está actualizado.
- [ ] Datos sensibles (contraseñas, tokens) **no** se guardan en claro ni en los logs.

### 2.5 Documentación

- [ ] La [Matriz de trazabilidad](./Trazabilidad.md) refleja el **estado real** del requisito.
- [ ] Si cambia la API, la base de datos o una regla de negocio, los documentos afectados
      están actualizados **en la misma tarea**.
- [ ] Si el usuario ve algo nuevo, el [Manual de usuario](./Manual-de-Usuario.md) lo refleja.
- [ ] Si se tomó una **decisión técnica relevante**, existe su ADR en
      [Decisiones.md](./Decisiones.md).
- [ ] El [CHANGELOG](./CHANGELOG.md) se actualiza si el cambio es visible para el usuario.

### 2.6 Seguridad (siempre)

- [ ] **No hay secretos** en el código, la documentación ni los commits.
- [ ] Las entradas se validan (**Zod**) antes de usarlas.
- [ ] Las rutas protegidas verifican **autenticación** y **rol**.
- [ ] Los errores **no filtran** detalles internos (rutas, consultas, trazas).
- [ ] Se revisó el checklist de
      [seguridad documental](./Politica-de-Seguridad-Documental.md) si se tocó documentación.

### 2.7 Integración (Git)

- [ ] Los cambios están en **una rama por tarea** (ver [CONTRIBUTING](./CONTRIBUTING.md)).
- [ ] Los **commits** siguen Conventional Commits y explican *el por qué*.
- [ ] La rama está **actualizada** con `main` (sin conflictos pendientes).
- [ ] La tarea pasó por **revisión** de al menos otro integrante.
- [ ] Se realizó el **merge a `main`** y la rama se cerró.

---

## 3. Tres niveles de «terminado»

No todo se comprueba igual. Esta tabla aclara cuánto rigor aplicar según el tipo de tarea:

| Nivel | Aplica a | Qué se exige |
| --- | --- | --- |
| **Done de tarea** | Una historia, una técnica o un bug | Todo el checklist de §2 |
| **Done de historia** | Una historia de usuario completa (US-*) | Done de tarea **+** criterios de aceptación verificados **+** manual actualizado si el usuario lo ve |
| **Done de épica** | Una épica completa (EP-*) | Todas sus historias en «Done» **+** reglas críticas cubiertas con prueba **+** trazabilidad sin `TODO` abiertos en esa área |

> **Consecuencia práctica:** una épica **no** está terminada por tener todo el código
> escrito. Está terminada cuando sus reglas críticas se pueden **demostrar** con pruebas.

---

## 4. Ejemplo aplicado

**Tarea:** *«Acreditar las monedas compradas al aprobar el pago»*
(cierra el `TODO(economia)` de `payments.service.ts`).

| Paso del DoD | En esta tarea |
| --- | --- |
| Código | Compila, typecheck ✅, lint ✅, sin logs |
| Requisito | Responde a **FR-BE-21** / **UC-16** |
| Criterios | Al aprobar el pago, el monedero muestra un lote `PURCHASED` (sin vencimiento) |
| Pruebas | Integración: pago aprobado → saldo comprado sube; pago rechazado → no sube |
| Migración | No cambia el modelo → N/A |
| Documentación | `openapi.yaml` (recarga), `Diccionario-de-Datos.md`, trazabilidad y CHANGELOG |
| Seguridad | No expone datos del pago; valida que el pago sea del usuario |
| Git | Rama `feat/economia-acreditar-monedas`, commit `feat(economy): …`, PR revisado |

> Ninguna de esas filas se puede «aprobar a ojo»: todas se comprueban ejecutando o leyendo.

---

## 5. Cómo se usa en el día a día

1. **Antes de empezar:** lee el DoD de la tarea que vas a hacer.
2. **Mientras trabajas:** no esperes al final; revisa la lista a medida que avanzas.
3. **Antes de pedir revisión:** corre tú mismo el checklist de §2.
4. **En la revisión:** el revisor comprueba el DoD (ver
   [CONTRIBUTING](./CONTRIBUTING.md) §6).
5. **Al terminar:** actualiza la [matriz de trazabilidad](./Trazabilidad.md) en el mismo PR.

---

## 6. Lo que el DoD NO es

| ❌ No es… | ✅ Es… |
| --- | --- |
| Una meta de cobertura del 100 % | Cubrir las **reglas críticas** por riesgo |
| Un trámite burocrático | Un acuerdo para no entregar cosas rotas |
| «Que lo revisó alguien» sin criterios | Un **checklist verificable** |
| Una excusa para no avanzar | Una forma de **terminar de verdad** |

---

## 7. Enlaces relacionados

| Documento | Para qué |
| --- | --- |
| [Casos de uso](./Casos-de-Uso/README.md) | Los flujos que hay que cumplir |
| [Épicas e historias](./Epicas-e-Historias.md) | Qué se construye y para quién |
| [Historias técnicas](./Historias-Tecnicas.md) | El trabajo técnico que las habilita |
| [SRS](./Software-requeriments\(SRS\)/README.md) | Las reglas exactas |
| [Estrategia de pruebas](./Estrategia-de-Pruebas.md) | Qué es «crítico» y cómo se prueba |
| [Trazabilidad](./Trazabilidad.md) | El estado real de cada requisito |
| [CONTRIBUTING](./CONTRIBUTING.md) | Ramas, commits y revisión |
| [Política de seguridad documental](./Politica-de-Seguridad-Documental.md) | Qué no debe publicarse |

---

*«Terminado» es el momento en que otra persona puede comprobar que funciona sin
preguntarte cómo. Si hay que preguntarte, todavía no está terminado.*
