# Guía de estilo de código — GearQuest

> **Para quién es esto:** para quien escribe código en el proyecto.
> **Qué resuelve:** responde a *«¿cómo se escribe el código aquí?»* para que dos personas no
> resuelvan lo mismo de forma distinta. Se aplica a **backend** (Node + TS) y **frontend**
> (React + TS).
> **Cómo se hizo:** es **descriptiva**: refleja las reglas que el código **ya sigue**, no
> inventa un ideal. Donde hay una decisión abierta, se marca como **propuesta**.
> **No es un catálogo de reglas por gusto:** casi todo lo que se describe aquí ya está
> **impuesto por herramientas** (ESLint, Prettier, TypeScript). Si las herramientas lo
> verifican, no hay que memorizarlo: se ejecutan.

---

## 1. La regla de oro: las herramientas manda

No confiamos en «acordarse»: el estilo lo **verifican herramientas**. Si algo se puede
automatizar, no se documenta como convención; se configura.

```bash
# Desde backend/           # Desde frontend/
npm run typecheck          # tsc --noEmit (tipos)   → npm run build (tsc -b + vite)
npm run lint               # ESLint                 → npm run lint
npm run format             # Prettier --write       → (pendiente: sin script, ver §9)
npm test                   # Vitest                 → (pendiente: sin pruebas aún)
```

> **Consecuencia práctica:** antes de pedir revisión, corre `typecheck`, `lint` y `format`.
> Si pasan, la mitad de este documento ya está cumplida.

---

## 2. Formato: Prettier y EditorConfig

### Backend

Config real (`backend/.prettierrc.json`):

| Opción | Valor | Qué significa |
| --- | --- | --- |
| `printWidth` | `100` | Ancho máximo de línea |
| `singleQuote` | `false` | **Comillas dobles** |
| `semi` | `true` | Punto y coma al final |
| `trailingComma` | `all` | Coma final en listas multilínea |

### Frontera entre backend y frontend (a propósito, distinta)

> **Nota de honestidad:** el **frontend** usa **comillas simples** (por Vite/React), mientras
> que el backend usa **dobles**. Es una diferencia **conocida y aceptada**: cada lado sigue lo
> que sus herramientas configuran. **No se fuerza unificar** para no reescribir código que ya
> funciona.

### Base común (`.editorconfig`)

Aplican a **todo** el repositorio: UTF-8, saltos de línea `LF`, 2 espacios de indentación,
línea final, sin espacios al final (excepto en `.md`, donde sí se permiten).

> **Por qué 2 espacios y no 4:** es lo que ya usa el código y lo que esperan las herramientas.
> Cambiarlo reescribiría todo el proyecto sin ganar nada.

---

## 3. TypeScript: estricto de verdad

Ambos lados usan `strict: true`. El backend además activa:

| Flag | Qué exige | Por qué importa aquí |
| --- | --- | --- |
| `noUncheckedIndexedAccess` | Acceder a un array puede ser `undefined` | Evita `products[0].price` cuando el array está vacío |
| `noImplicitReturns` | Toda rama devuelve algo | Evita funciones que a veces devuelven `undefined` |
| `noUnusedLocals` / `noUnusedParameters` | Sin variables/parámetros sin usar | Evita código muerto |
| `noFallthroughCasesInSwitch` | Cada `case` sale | Evita errores sutiles en `switch` |
| `verbatimModuleSyntax` | `import type` explícito para tipos | Importa tipos sin arrastrar código |

### Reglas prácticas derivadas

- **Tipos explícitos en lo público:** las funciones exportadas declaran su tipo de retorno
  (`export async function checkout(...): Promise<OrderView>`). Es la firma del contrato
  interno del módulo.
- **`interface` para objetos de datos, `type` para uniones/alias.** Es lo que usa el código
  (`export interface OrderView`, `type OrderWithItems = …`).
- **`import type` para lo que es solo tipo.** Obligado por `verbatimModuleSyntax`.
- **Imports en backend terminan en `.js`** (patrón `NodeNext`), aunque el archivo sea `.ts`:
  `import { prisma } from "../../db/prisma.js"`. No es un error: es cómo resuelve Node.

---

## 4. Nomenclatura

### Archivos

| Tipo | Patrón | Ejemplo |
| --- | --- | --- |
| Módulo — rutas | `<módulo>.router.ts` | `orders.router.ts` |
| Módulo — lógica | `<módulo>.service.ts` | `orders.service.ts` |
| Módulo — validación | `<módulo>.schemas.ts` | `orders.schemas.ts` |
| Middleware | `<nombre>.middleware.ts` | `auth.middleware.ts` |
| Modelos Prisma | `PascalCase.ts` | `OrderItem.ts` |
| Frontend — componentes/páginas | `PascalCase.tsx` | `PageHeader.tsx`, `HomePage.tsx` |

> **Por qué:** al abrir una carpeta, el tipo de archivo se ve en el nombre. No hay que adivinar
> dónde está la validación: siempre está en `*.schemas.ts`.

### Identificadores

| Elemento | Convención | Ejemplo |
| --- | --- | --- |
| variables y funciones | `camelCase` | `discountPercentage`, `listMyOrders` |
| tipos, interfaces, clases | `PascalCase` | `OrderView`, `AppError` |
| constantes globales | `UPPER_SNAKE_CASE` | `PACKAGE_VERSION` |
| campos de base de datos | `camelCase` (Prisma) | `unitPrice`, `balanceAfter` |
| tipos de enum | `UPPER_SNAKE_CASE` | `EARNED`, `PURCHASED`, `ACTIVE` |
| rutas de API | `kebab-case` plural | `/discount-levels`, `/game-sessions` |

> **Idioma:** los **identificadores de código van en inglés** (`balanceAfter`, no
> `saldoDespues`). Los comentarios y la documentación, en **español**. Es la regla del
> [índice de documentación](./README.md) §4.

---

## 5. Estructura de un módulo (backend)

Un módulo sigue **siempre** la misma separación por responsabilidad:

```text
   petición HTTP
        │
        ▼
   ┌──────────────┐   valida con Zod      ┌────────────────┐   aplica reglas   ┌──────────────┐
   │  *.router.ts │ ────────────────────▶ │  *.service.ts  │ ────────────────▶ │   Prisma     │
   │  (entrada)   │                        │  (negocio)     │                    │  (datos)     │
   └──────────────┘                        └────────────────┘                    └──────────────┘
        │                                        ▲
        │        ┌────────────────┐              │
        └───────▶│ *.schemas.ts   │──────────────┘
                 │ (validación)   │
                 └────────────────┘
```

| Capa | Responsabilidad | **No** debe |
| --- | --- | --- |
| **router** | Recibir, validar y delegar | Contener reglas de negocio |
| **schemas** | Definir y validar la forma de la entrada | Tocar la base de datos |
| **service** | Aplicar las reglas y hablar con Prisma | Saber de `req`/`res` de Express |

### Ejemplo real (patrón del proyecto)

```ts
// orders.router.ts — recibe, valida y delega. Sin reglas de negocio.
ordersRouter.post(
  "/checkout",
  asyncHandler(async (req, res) => {
    const input = checkoutSchema.parse(req.body ?? {});
    res.status(201).json(await checkout(requireUser(req).id, input));
  }),
);

// orders.schemas.ts — la forma de la entrada, con Zod.
export const checkoutSchema = z.object({
  discountLevelId: z.uuid().optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

// orders.service.ts — la regla, en el servidor.
export async function checkout(userId: string, input: CheckoutInput): Promise<OrderView> {
  // ... valida stock, descuenta inventario, calcula precios
}
```

> **Regla dura:** el **router nunca** decide precios, saldos ni permisos. Eso vive en el
> **service** (`FR-BR-16`, `NFR-BR-01`).

---

## 6. Validación de entradas (Zod)

**Toda** entrada externa (cuerpo, params, query) se valida con **Zod** antes de usarse:

- Los esquemas viven en `*.schemas.ts`.
- Se **infiere** el tipo del esquema (`z.infer<typeof x>`) en vez de duplicarlo a mano.
- Los errores de validación se convierten en `VALIDATION_ERROR` (400) de forma centralizada.

> **Por qué:** un dato que no cumple el esquema no debe llegar nunca a la lógica. Es la
> primera línea contra datos maliciosos o mal formados (`FR-BE-02`, `FR-SEC-08`).

---

## 7. Manejo de errores

El proyecto usa una clase única, `AppError`, con **código legible** y **HTTP status**:

```ts
throw new AppError("El carrito está vacío", {
  code: "CART_EMPTY",
  statusCode: 409,
});
```

| Regla | Detalle |
| --- | --- |
| El `code` es **`UPPER_SNAKE_CASE`** y describe el caso | `INSUFFICIENT_BALANCE`, `CART_EMPTY` |
| El **mensaje** es para el usuario (en español, claro) | «El carrito está vacío» |
| El **HTTP status** refleja la naturaleza | `400`/`409`/`403`/`404` |
| El error **nunca** filtra detalles internos | Nada de rutas, consultas ni trazas al cliente |
| Los handlers async se envuelven con `asyncHandler` | Captura el error y lo manda al manejador central |

El formato de respuesta de error es el del proyecto: `{ "code": "...", "message": "..." }`
(el mismo que documenta el [contrato de la API](./API/README.md)).

> Los **códigos de error son contrato público**: cambiarlos es una decisión de equipo, no un
> detalle de un PR (ver [CONTRIBUTING](./CONTRIBUTING.md) §8).

---

## 8. Comentarios y documentación del código

El estilo del proyecto es claro:

- **Comentario de cabecera en cada `*.service.ts`**: qué hace el módulo y **qué reglas aplica**:

  ```ts
  // Lógica de negocio del carrito de compras.
  // Reglas:
  // - Un usuario tiene un solo carrito ACTIVE.
  // - Al agregar un ítem se guarda el precio unitario vigente (snapshot).
  // - El total del carrito se calcula en el servidor.
  ```

- **Docstring `/** … */`** en lo que se reutiliza (helpers, utilidades).
- **En español**, explicando **el por qué**, no el qué (el qué ya lo dice el código).

| ❌ Evitar | ✅ Preferir |
| --- | --- |
| `// incrementa i` | *(nada: el código ya lo dice)* |
| Comentar código en vez de borrarlo | Borrarlo (Git guarda el historial) |
| `TODO` sin contexto | `// TODO(economia): acreditar monedas (FR-BE-21)` |

> **Sobre los `TODO`:** llevan **etiqueta de área** y, si aplica, el requisito. Así la
> [trazabilidad](./Trazabilidad.md) los puede rastrear. Un `TODO` sin etiqueta es deuda oculta.

---

## 9. Frontend (React + TypeScript)

| Aspecto | Convención en el proyecto |
| --- | --- |
| Componentes y páginas | **`PascalCase.tsx`**, `function` + **`export default`** |
| Props | `interface <Nombre>Props`, desestructuradas en la firma |
| Estilos | **Tailwind CSS** en `className` (sin CSS suelto) |
| Estructura | `pages/` (vistas), `components/{ui,shared}/` (reutilizables), `layouts/` |
| Estado y rutas | `app/{providers,router}/` |
| Comillas | **Simples** (config de Vite/ESLint) |

```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
}

/** Encabezado estándar de las páginas: título y descripción opcional. */
function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-6 border-b border-gray-200 pb-4">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {description ? <p className="mt-1 text-gray-600">{description}</p> : null}
    </header>
  );
}

export default PageHeader;
```

> **Pendiente (propuesto):** el frontend aún **no** tiene script `format` ni Prettier (el
> backend sí). Es la carencia de estilo más concreta — ver
> [`Historias-Tecnicas.md`](./Historias-Tecnicas.md) `TS-16` y
> [`Trazabilidad.md`](./Trazabilidad.md) §12.3.

---

## 10. Pruebas

- Los tests viven en **`tests/`**, en la raíz de cada servicio — **no** junto al código.
- Nombre de archivo: **`<módulo>.test.ts`** (`gacha.service.test.ts`, `auth.schemas.test.ts`).
- Cada `describe` se prefija con el servicio: `describe("economy-service · gacha", …)`.
- Cada `it` describe **el comportamiento** en español, no el nombre de la función:

  ```ts
  it("devuelve undefined si no hay premios con peso", () => { … });
  ```

> **Pendiente (propuesto):** aún **no** existe una carpeta `integration/` ni pruebas de
> integración entre servicios. Ver [`Historias-Tecnicas.md`](./Historias-Tecnicas.md).

> El detalle de **qué** probar y **por qué** vive en la
> [Estrategia de pruebas](./Estrategia-de-Pruebas.md). Aquí solo se fija el estilo de los
> nombres y la ubicación.

---

## 11. Reglas de oro (resumen)

1. **Corre las herramientas** antes de revisar: `typecheck`, `lint`, `format`.
2. **El código en inglés, los comentarios en español.**
3. **Un módulo = router + schemas + service**, cada uno con su responsabilidad.
4. **Valida con Zod** en los bordes; nunca confíes en la entrada.
5. **Errores con `AppError`** y `code` en `UPPER_SNAKE_CASE`.
6. **Las reglas de negocio viven en el servidor**, nunca en el router ni en el cliente.
7. **`TODO` con etiqueta de área**, para que sea rastreable.
8. **Si dudas del estilo, mira un módulo existente** y hazlo igual: el código ya es el ejemplo.

---

## 12. Enlaces relacionados

| Documento | Para qué (y qué **no** repite esta guía) |
| --- | --- |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Ramas, commits y revisión — **el proceso**, no el estilo |
| [`Estrategia-de-Pruebas.md`](./Estrategia-de-Pruebas.md) | Qué probar y con qué prioridad |
| [`Diccionario-de-Datos.md`](./Diccionario-de-Datos.md) | Los campos y modelos (nombres reales) |
| [`Contrato-entre-servicios.md`](./Contrato-entre-servicios.md) | Cómo se llaman los servicios |
| [`API/README.md`](./API/README.md) | Formato de la API y de los errores |
| [`Decisiones.md`](./Decisiones.md) | Por qué se eligieron TS, Prisma, Tailwind, etc. |
| [`Trazabilidad.md`](./Trazabilidad.md) | Deuda técnica (p. ej. falta `format` en frontend) |

---

*Una guía de estilo que nadie ejecuta es letra muerta. Por eso aquí lo importante está en las
herramientas: el documento solo explica lo que ninguna herramienta puede decidir.*
