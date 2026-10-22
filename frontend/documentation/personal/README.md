# Documentación personal — Frontend

Esta carpeta guarda las notas **individuales** de cada persona desarrolladora del
frontend: qué se cambió, por qué, qué dudas quedaron y qué `TODO` se dejó.

## Cómo se usa

1. **Crea un archivo con tu usuario** (por ejemplo `agude.md`) o con el nombre de la
   tarea (`feature-auth-notes.md`).
2. **Anota dentro**:
   - **Qué** cambiaste (archivos y propósito).
   - **Por qué** (la decisión y sus motivos).
   - **Dudas** que quedan abiertas.
   - **`TODO`** que dejaste y a qué requisito del SRS corresponde.
3. **No toques código ajeno** para documentar: la nota es documentación, no una excepción.
4. **No incluyas secretos**, tokens ni datos sensibles.

## Qué **no** va aquí

- El **changelog** del frontend → [`../CHANGELOG_ESQUEMA.md`](../CHANGELOG_ESQUEMA.md).
- El **changelog** del proyecto → [`../../../documentation/CHANGELOG.md`](../../../documentation/CHANGELOG.md).
- La **arquitectura** → [`../FRONTEND_ARCHITECTURE.md`](../FRONTEND_ARCHITECTURE.md).
- Los **requisitos** → [`../../../documentation/Software-requeriments(SRS)/Frontend.md`](<../../../documentation/Software-requeriments(SRS)/Frontend.md>).

## Plantilla sugerida

```markdown
# <Usuario> — <Tarea>

**Fecha:** 2026-XX-XX
**Requisitos relacionados:** FR-FE-XX, NFR-FE-XX

## Qué hice

- `src/...` — ...

## Por qué

...

## Dudas abiertas

- ...

## TODOs

- [ ] `FR-FE-XX` — ...
```
