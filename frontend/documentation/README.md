# Documentación del frontend — GearQuest

> **Para quién es esto:** para quien va a trabajar en el frontend y necesite saber
> **dónde está cada cosa** y **qué reglas debe seguir**.
>
> **Regla de oro:** el frontend **consume** el backend; no lo modifica. Los contratos
> están definidos y no se improvisan.

---

## 1. Contenido de esta carpeta

| Documento                                                | Qué es                                                                            |
| -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [`FRONTEND_ARCHITECTURE.md`](./FRONTEND_ARCHITECTURE.md) | La arquitectura real: carpetas, dominios, comunicación con el backend y qué falta |
| [`CHANGELOG_ESQUEMA.md`](./CHANGELOG_ESQUEMA.md)         | El historial de cambios del frontend                                              |
| `personal/`                                              | Registro individual por desarrollador (cambios, decisiones, dudas, TODOs)         |

---

## 2. `personal/`: cómo se usa

Esta carpeta es **de cada quien**. La idea es que nadie tenga que modificar el código de
otro para documentar su propio trabajo.

```text
documentation/
├── README.md
├── FRONTEND_ARCHITECTURE.md
├── CHANGELOG_ESQUEMA.md
└── personal/
    ├── README.md
    ├── <tu-usuario>.md          # o <tarea>-notas.md
```

**Cómo se escribe una nota:**

1. Crea un archivo con tu usuario o con la tarea (`agude-changes.md`,
   `feature-auth-notes.md`).
2. Anota: **qué cambiaste**, **por qué**, **qué dudas quedan** y **qué TODOs dejaste**.
3. No toques código ajeno: la nota es documentación, no una excepción.
4. **No incluyas secretos, tokens ni datos sensibles.**

> **El changelog no va aquí.** Los cambios que afectan al proyecto entero se anotan en el
> [`CHANGELOG.md`](../../documentation/CHANGELOG.md) del proyecto; este de la carpeta es
> el historial **técnico del frontend**.

---

## 3. Documentación que vive fuera de esta carpeta

El frontend es una parte del proyecto; su documentación **técnica** está aquí, y la de
**producto** está en `documentation/`:

| Documento               | Dónde                                                                                                                  | Qué contiene                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Requisitos del frontend | [`documentation/Software-requeriments(SRS)/Frontend.md`](<../../documentation/Software-requeriments(SRS)/Frontend.md>) | `FR-FE-*` y `NFR-FE-*`              |
| Contrato de la API      | [`documentation/API/README.md`](../../documentation/API/README.md)                                                     | Las 59 operaciones del backend      |
| Estado real             | [`documentation/Trazabilidad.md`](../../documentation/Trazabilidad.md)                                                 | Qué está hecho y qué no             |
| Manual de usuario       | [`documentation/Manual-de-Usuario.md`](../../documentation/Manual-de-Usuario.md)                                       | Qué puede hacer una persona usuaria |

---

## 4. Reglas de la carpeta

- **Documentar solo lo relacionado con el frontend.**
- **Mantener conciso y claro**: si un documento tiene que esconderse dentro de otro,
  sobra uno de los dos.
- **Nada de secretos**: ni tokens, ni claves, ni datos de personas usuarias.
- **Un solo changelog por proyecto**: este es el del frontend; el general está en
  `documentation/CHANGELOG.md`.
