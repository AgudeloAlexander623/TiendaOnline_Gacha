# Estrategia de pruebas — GearQuest

> **Enfoque:** pruebas guiadas por **riesgo**, no por porcentaje de cobertura.
> **Decisión adoptada (equipo):** no se impone una meta global de cobertura; se prioriza
> cubrir las **reglas críticas** del negocio, porque son las que un fallo cuesta dinero
> (monedas, inventario, pagos) o confianza (permisos).
> **Estado actual:** 7 ficheros de prueba, ninguno toca la base de datos (ver §5).

---

## 1. Por qué probamos (y por qué así)

GearQuest maneja **monedas con vencimiento, inventario y pagos simulados**. Un fallo aquí no
es "una pantalla fea": es saldo regalado, stock inconsistente o compras fantasma. Probar esas
reglas cuesta poco comparado con el coste de que fallen en la demo.

Por eso **la cobertura se mide por riesgo, no por línea**. Un módulo con el 90 % de líneas
cubiertas pero sin ningún caso de **concurrencia o vencimiento** no está probado para lo que
importa.

---

## 2. Principios

1. **Las reglas de negocio viven en el servidor y se prueban en el servidor.** El frontend no
   decide precios ni saldos, así que las pruebas del frontend no son la red de seguridad de
   las reglas (NFR-BR-01).
2. **Se prueba el comportamiento, no la implementación.** Los tests atacan la API o el
   servicio con entradas reales; no comprueban detalles internos que cambiarán.
3. **Cada prueba describe una regla.** El nombre del test cita el requisito cuando aplica
   (`FR-BR-02`, `FR-BE-19`…), para que la matriz y las pruebas se puedan cruzar.
4. **Una regla crítica sin prueba es deuda técnica**, y se refleja en
   [`Trazabilidad.md`](./Trazabilidad.md) (`NFR-BR-02`).

---

## 3. Pirámide adaptada al proyecto

| Nivel | Qué prueba | Herramienta | Dónde |
| --- | --- | --- | --- |
| **Unitario** | Reglas puras: sorteo ponderado, puntaje→monedas, cálculo de saldo, validación de esquemas | Vitest | `services/*/tests/`, junto al módulo |
| **Integración de servicio** | Un módulo entero contra una **base de datos real** (o contenedor): checkout, débito, vencimientos, gacha | Vitest + PostgreSQL de pruebas | `services/*/tests/integration/` *(por crear)* |
| **Contrato (API)** | Que la respuesta real cumple `openapi.yaml` | *(propuesto)* validación contra el contrato | CI |
| **Extremo a extremo** | Flujos completos entre servicios (registro → compra → gacha) | *(propuesto)* | CI / manual guiado |
| **Manual exploratorio** | Lo que aún no está automatizado (UI, juego) | Guion de prueba | Antes de cada entrega |

El frontend (todavía sin conectar, ver matriz §6) se prueba hoy con `tsc -b` (tipos) y
`eslint`; sus pruebas de comportamiento llegarán con la integración.

---

## 4. Qué es "crítico" (prioridad de pruebas)

Estas son las reglas que **sí o sí** deben tener prueba, con el requisito que las respalda:

| # | Regla crítica | Requisitos | Prueba esperada | ¿Hoy? |
| --- | --- | --- | --- | --- |
| 1 | El **saldo** solo cuenta monedas vigentes (expira lotes vencidos) | FR-BR-04, FR-BE-18 | Integración: lote vencido no suma; queda movimiento `EXPIRE` | ⬜ |
| 2 | Las monedas **compradas nunca caducan**; las ganadas sí (30 días) | FR-BR-02, FR-BR-03 | Integración + unitario de la política de vencimiento | ⬜ |
| 3 | El **historial** es append-only y cuadra (`balanceAfter` encadenado) | FR-BR-06, FR-DB-04 | Integración: la suma de movimientos = saldo actual | ⬜ |
| 4 | **Tirada de gacha**: debita el coste y entrega premio en una sola transacción | FR-BE-16, FR-GA-11/12 | Unitario (sorteo ponderado) + integración (débito y registro) | ⚠️ unitario sí, integración no |
| 5 | **Sin saldo suficiente** la tirada falla y no cobra | FR-BE-16 | Integración: error `INSUFFICIENT_BALANCE`, saldo intacto | ⬜ |
| 6 | **Checkout**: descuenta inventario y guarda snapshot de precios de forma atómica | FR-BE-12, FR-BR-12/13 | Integración: sin stock → 409 y nada se descuenta | ⚠️ parcial |
| 7 | **El cliente nunca fija precio ni saldo** que se acepte sin validar | FR-BR-16, NFR-BR-01 | Integración: enviar `total`/`balance` falso no altera nada | ⬜ |
| 8 | **Repetición/concurrencia**: la misma operación no duplica el efecto | FR-BE-19, FR-BR-15 | Integración: dos peticiones simultáneas → un solo efecto | ⬜ *(falta idempotencia)* |
| 9 | **Permisos**: rol sin permiso recibe 403; sin token, 401 | FR-BE-08, FR-SEC-02 | API: rutas ADMIN con rol `PLAYER` | ⚠️ parcial (401 sí) |
| 10 | **Entradas inválidas** se rechazan con `VALIDATION_ERROR` genérico | FR-BE-02, FR-SEC-08 | Unitario de esquemas + API | ⚠️ parcial (esquemas sí) |
| 11 | **Recargas son simuladas** y no tocan datos bancarios | FR-BR-10, FR-SEC-03 | Integración: `provider: MOCK`, sin datos sensibles | ⚠️ parcial |
| 12 | **Puntaje→monedas** con tope y validación de sesión propia | FR-BE-17, FR-GA-19/20 | Unitario (tope 500) + integración (sesión ajena → 404) | ⚠️ unitario sí |

Leyenda: ✅ cubierto · ⚠️ parcial · ⬜ pendiente.

---

## 5. Estado actual (honesto)

- **Existen 7 ficheros de prueba**, todos con Vitest + Supertest:
  - `health.test.ts` en los 4 servicios (liveness, readiness, 404/401).
  - `auth.schemas.test.ts` (identity) y `products.schemas.test.ts` (store): validación.
  - `gacha.service.test.ts` (economy): sorteo ponderado y `scoreToCoins`.
- **No hay pruebas de integración con base de datos.** Es la carencia más importante: las
  reglas de §4 (saldo, checkout, permisos con datos reales) **no** están cubiertas.
- **No hay CI** que ejecute nada automáticamente; los controles son locales (ver
  [`CONTRIBUTING.md`](./CONTRIBUTING.md) §5).
- **Frontend:** sin pruebas y sin integración al backend (la UI es estática).

---

## 6. Cómo se ejecutan

```bash
# Backend (desde backend/): requiere PostgreSQL levantado para futuras pruebas de integración
npm run db:up          # levanta PostgreSQL por servicio (docker compose)
npm test               # vitest run (una pasada)
npm run test:watch     # modo interactivo durante el desarrollo

# Frontend (desde frontend/)
npm run lint           # ESLint
npm run build          # tsc -b (tipos) + vite build
```

> **Convención de nombres:** `<módulo>.test.ts` para unitarios de servicio y
> `integration/<caso>.test.ts` para los que tocan base de datos. El nombre del `it()` cita
> el requisito: `it("FR-BR-02: las monedas ganadas expiran a los 30 días", …)`.

---

## 7. Cómo se añade una prueba de integración (guía)

1. En el servicio correspondiente, crea `tests/integration/` (no existe aún).
2. Usa una **base de datos de pruebas** (mismo contenedor de `db:up`, distinta base) y
   `prisma migrate deploy` + `seed` antes de la suite; limpia entre casos.
3. Ejercita el **servicio real** (llamando a `checkout(...)`, `getBalance(...)`, etc.) o la
   API con Supertest, nunca un mock del propio módulo bajo prueba.
4. Afirma **efectos observables**: saldo resultante, filas creadas, códigos de error,
   movimientos del libro mayor.
5. Añade el caso a la tabla de §4 y actualiza `Trazabilidad.md` si cambia un estado.

---

## 8. Deuda priorizada (qué hacer primero)

| Orden | Trabajo | Desbloquea |
| ---: | --- | --- |
| 1 | Pruebas de integración del **monedero** (saldo, vencimiento, libro mayor) | Reglas 1-3 |
| 2 | Pruebas de **checkout** (sin stock, snapshot de precios, atomicidad) | Regla 6 |
| 3 | Pruebas de **gacha** (débito, sin saldo, premio) | Reglas 4-5 |
| 4 | **Idempotencia** en operaciones de saldo + su prueba | Regla 8 (cierra `FR-BE-19`) |
| 5 | Matriz de **permisos** por ruta (rol `PLAYER` → 403 en ADMIN) | Regla 9 |
| 6 | Validación de **contrato** (respuestas contra `openapi.yaml`) en CI | NFR-BE-04 |

> Esta lista coincide a propósito con los `TODO` de `Trazabilidad.md` §12.1: probar lo que
> hoy está a medias es la forma más rápida de convertirlo en "hecho y demostrable".
