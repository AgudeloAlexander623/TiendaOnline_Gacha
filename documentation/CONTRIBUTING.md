# Cómo contribuir — GearQuest

> Este documento explica **cómo trabajamos en el repositorio**: ramas, mensajes de
> commit, flujo de PR y qué se revisa antes de mergear. El objetivo no es burocracia;
> es que cualquiera pueda entender el historial y que nada entre sin pasar por el control
> mínimo de calidad.
>
> **Convenciones elegidas:** [Conventional Commits](https://www.conventionalcommits.org/es/)
> + ramas por tarea.

---

## 1. Antes de escribir código

1. **Lee el SRS y la matriz.** Todo lo que se construye responde a un requisito
   (`FR-*` / `NFR-*`) o a un caso de uso (`UC-*`):
   - [`Software-requeriments(SRS)/`](./Software-requeriments(SRS)/README.md)
   - [`Casos-de-Uso/`](./Casos-de-Uso/README.md)
   - [`Trazabilidad.md`](./Trazabilidad.md) — el estado real.
2. **Comprueba si ya está hecho.** La matriz dice qué está implementado; evita rehacer algo.
3. **Abre una rama por tarea** (ver §3). Una rama = un objetivo.

---

## 2. Ramas: una tarea, una rama

| Tipo | Patrón | Ejemplo |
| --- | --- | --- |
| Funcionalidad | `feature/<UC-o-FR>-<descripción>` | `feature/UC-08-checkout-descuento` |
| Corrección | `fix/<descripción>` | `fix/vencimiento-lotes` |
| Documentación | `docs/<descripción>` | `docs/contrato-api` |
| Refactor | `refactor/<descripción>` | `refactor/serializador-pedidos` |
| Pruebas | `test/<descripción>` | `test/wallet-vencimientos` |
| Tareas varias | `chore/<descripción>` | `chore/actualizar-dependencias` |

**Reglas:**
- Nombra la rama **en minúsculas con guiones**, usando el código del requisito cuando exista.
- Ramas **cortas**: si vive más de unos días, es señal de que la tarea era demasiado grande.
- `main` es la rama estable; **nunca** se trabaja directamente sobre ella.

---

## 3. Mensajes de commit (Conventional Commits)

Formato:

```
<tipo>(<ámbito>): <descripción en imperativo, minúscula, sin punto final>

[cuerpo opcional: el por qué, no el qué]

[pie opcional: Refs #12 · FR-BE-13]
```

### Tipos permitidos

| Tipo | Cuándo |
| --- | --- |
| `feat` | Nueva funcionalidad para el usuario |
| `fix` | Corrección de un fallo |
| `docs` | Solo documentación |
| `refactor` | Cambio interno que no añade ni corrige nada visible |
| `test` | Añadir o corregir pruebas |
| `chore` | Tareas de mantenimiento (dependencias, configuración) |
| `perf` | Mejora de rendimiento |
| `build` / `ci` | Sistema de build o integración continua |

### Ámbitos sugeridos

`identity`, `store`, `economy`, `payments`, `frontend`, `docs`, `diagramas`, `api`.

### Ejemplos

```
feat(economy): acreditar monedas compradas al aprobar el pago

Cierra el TODO(economia) de payments.service.ts. Se acredita un lote
PURCHASED (sin vencimiento) en una transacción única.

Refs FR-BE-21 · UC-16
```

```
fix(store): congelar el precio del carrito al agregar el producto

Sin este cambio, un cambio de precio alteraba carritos ya armados.
Refs FR-BR-12
```

```
docs(api): documentar el endpoint de reembolsos en openapi.yaml
```

**Reglas del mensaje:**
- Descripción en **imperativo** («añade», no «añadido» ni «añade3 cosas»).
- Una línea de asunto ≤ 72 caracteres; el detalle va en el cuerpo.
- **Referencia el requisito** (`FR-*`, `NFR-*`, `UC-*`) cuando aplique; es lo que mantiene
  viva la trazabilidad.

---

## 4. Flujo de trabajo

```
main ──► crea rama ──► commits ──► PR ──► revisión ──► merge a main
```

1. **Sincroniza** antes de empezar: `git checkout main && git pull`.
2. **Crea la rama**: `git checkout -b feature/UC-13-gacha-ui`.
3. **Commits pequeños y frecuentes** (cada uno con sentido propio).
4. **Antes de abrir el PR**, pasa los controles locales (ver §5).
5. **Abre un Pull Request** hacia `main` con:
   - Título en formato Conventional Commits.
   - Qué hace y **por qué**; requisitos implicados.
   - Capturas o GIF si hay interfaz.
   - La checklist de §5 marcada.
6. **Revisión** (ver §6). Al menos **una persona** revisa y aprueba.
7. **Merge** cuando: la revisión está aprobada + los controles pasan. Se prefiere
   *squash merge* para dejar `main` limpio; el mensaje de squash respeta Conventional Commits.

---

## 5. Checklist antes de abrir el PR

Marca cada punto en la descripción del PR:

- [ ] La rama está actualizada con `main`.
- [ ] **Backend:** `npm run lint`, `npm run typecheck` y `npm test` pasan.
- [ ] **Frontend:** `npm run lint` y `npm run build` pasan.
- [ ] **Si toco la API**, actualicé `documentation/API/openapi.yaml` y
      `npx @redocly/cli lint --config=redocly.yaml openapi.yaml` pasa.
- [ ] **Si toco el modelo de datos**, actualicé `documentation/Diccionario-de-Datos.md` y
      regeneré el diagrama (`documentation/diagramas de flujo/tools/generar.py`).
- [ ] **Si toco diagramas**, `python3 tools/qa.py *.svg` no reporta fallos.
- [ ] **Actualicé `documentation/Trazabilidad.md`** si cambió el estado de algún requisito.
- [ ] **Actualicé `documentation/CHANGELOG.md`** (sección *Sin versionar*) si el cambio es
      visible para el usuario.
- [ ] No he dejado secretos, `console.log` de depuración ni ficheros generados en el commit.
- [ ] El cambio responde a un requisito/caso de uso identificado.

> Si algún control **no** pasa y el PR es un borrador para pedir ayuda, márcalo como
> *Draft* y dilo en la descripción. Lo que no se hace es pedir revisión con controles en rojo.

---

## 6. Qué mira quien revisa

1. **Corrección:** ¿hace lo que dice el requisito? ¿hay casos límite sin cubrir?
2. **Reglas de negocio en el servidor:** precios, saldos y permisos **nunca** se aceptan del
   cliente (`FR-BR-16`, `NFR-BR-01`).
3. **Seguridad:** validación de entradas (Zod), autorización (`authenticate`/`requireRole`),
   nada de secretos en código ni en logs.
4. **Trazabilidad:** ¿referencia el requisito? ¿actualizó la matriz?
5. **Claridad:** nombres, comentarios con el **por qué**, coherencia con el estilo del módulo.

**Tono:** se revisa el **código**, no a la persona. Pregunta y explica; si algo no se
entiende, es que falta un comentario o un nombre mejor.

---

## 7. Estilo de código

- **TypeScript estricto** en backend y frontend (`strict: true`). Sin `any` sin justificar.
- **Backend:** ESLint + Prettier configurados (`npm run lint`, `npm run format`).
- **Frontend:** ESLint configurado; **Prettier aún no** (pendiente, ver
  [`Trazabilidad.md`](./Trazabilidad.md) §12.3). Mantén el formato existente.
- **Comentarios:** explican **por qué**, en español, solo donde el código no lo dice por sí solo.
- **Idioma:** código en inglés (nombres, tipos); mensajes de usuario y comentarios en español.

---

## 8. Reglas de oro del proyecto

1. **El backend es la única fuente de verdad** de precios, saldos y permisos.
2. **Nunca se documenta como hecho algo que no existe** en el código: los pendientes se
   marcan como pendientes (ver los diagramas y la matriz).
3. **Un cambio de estado de requisito se refleja en `Trazabilidad.md` en el mismo PR.**
4. Los **`code` de error** de la API son contrato público: cambiarlos es una decisión de
   equipo, no un detalle de un PR.
