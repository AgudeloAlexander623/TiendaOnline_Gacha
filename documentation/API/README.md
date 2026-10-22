# Contrato de la API — GearQuest

> **Qué hay aquí**
> - `openapi.yaml` — el contrato de la API de GearQuest (OpenAPI 3.1).
> - `redocly.yaml` — configuración del validador para este contrato.
>
> **Para quién es:** el frontend, el juego (Godot) y cualquier persona que necesite
> saber **qué pedir y qué esperar** del backend sin leer el código del backend.

---

## 1. Qué es el contrato y por qué existe

### ¿Qué es un «contrato de API»?

Una **API** (interfaz de programación) es el conjunto de peticiones que un programa puede
hacerle a otro: «dame el catálogo», «cobra estas monedas», «inicia sesión». El **contrato**
es el documento que describe **exactamente** esas peticiones y sus respuestas: qué rutas
existen, qué datos hay que enviar, qué se recibe y qué errores pueden aparecer.

La analogía útil: es como el **menú de un restaurante con precios fijos**. El cliente (el
frontend o el juego) no necesita entrar a la cocina (el código del backend) para saber qué
puede pedir, cuánto cuesta ni qué le van a servir. Y si la cocina cambia un ingrediente sin
avisar, el menú miente: por eso el contrato se actualiza **junto** al código, no después.

Sin contrato, cada persona que consume la API tiene que leer el código para adivinar rutas,
campos y errores — y cada una lo adivina distinto. Con contrato:

- El **frontend** sabe qué enviar y qué recibir antes de escribir una sola línea.
- El **juego** integra la economía sin depender de quién "recuerde" el formato.
- Una herramienta puede **validar** que las respuestas reales cumplen lo acordado
  (tests de contrato) y detectar el momento en que código y documentación se separan.

### El contrato de GearQuest

El backend son 4 servicios que registran **65 rutas** (57 de negocio + 8 de salud: `/health`
y `/health/ready` en cada servicio). Como los 4 pares de endpoints de salud son idénticos,
eso equivale a **59 operaciones distintas**, que son exactamente las que documenta
`openapi.yaml` (**45 rutas** y **59 operaciones**). El contrato se escribe en el estándar
**OpenAPI 3.1**: un fichero de texto (`openapi.yaml`) que cualquier herramienta entiende y
puede convertir en documentación interactiva, en tests o en un cliente.

`openapi.yaml` se extrajo **directamente del código** (`backend/services/*/src/modules/**`)
y se validó con Redocly CLI. Es la fuente de verdad del formato; el modelo de datos
completo vive en los `prisma/schema.prisma` de cada servicio.

> **Verificado:** el conjunto de `(método, ruta)` del código y el del `openapi.yaml` coinciden
> uno a uno. No hay ninguna operación del código sin documentar ni al revés.

> **Contratos entre servicios:** este documento describe la API **pública** (la que consumen
> el frontend y el juego). Las llamadas **internas** entre microservicios tienen su propio
> contrato, en [`../Contrato-entre-servicios.md`](../Contrato-entre-servicios.md).

---

## 2. Cómo verlo (documentación interactiva)

OpenAPI se puede abrir en cualquier visor. Dos formas sin instalar nada:

```bash
# 1) Documentación interactiva en el navegador (permite "probar" endpoints)
cd documentation/API
npx @redocly/cli@latest preview-docs openapi.yaml

# 2) Validar que el contrato sigue siendo válido (útil en revisión de PR)
cd documentation/API
npx @redocly/cli@latest lint --config=redocly.yaml openapi.yaml
```

También puedes pegarlo en el editor web <https://editor.redoc.ly> o en
<https://editor.swagger.io> sin instalar nada.

> El contrato es **YAML**: texto, no código. La `redocly.yaml` de al lado desactiva cuatro
> reglas de estilo que no aplican aquí (la más importante: las rutas con barra final son
> reales en el código, no una errata — ver §6).

---

## 3. Mapa de servicios y puertos

Cada servicio es un proceso independiente con su propia base de datos y su propio
`/health`. **Ninguno llama a otro**; comparten el `JWT_SECRET` para verificar los tokens.

| Servicio | Puerto (dev) | Base de datos | Responsabilidad | Endpoints de negocio |
| --- | ---: | --- | --- | ---: |
| identity-service | **3001** | `gearquest_identity` | Registro, sesión, roles, usuarios | 10 |
| store-service | **3002** | `gearquest_store` | Catálogo, inventario, carrito, pedidos, descuentos | 27 |
| economy-service | **3003** | `gearquest_economy` | Monedero, movimientos, ruleta, sesiones de aventura, objetos | 9 |
| payments-service | **3004** | `gearquest_payments` | Paquetes, pagos simulados, recargas | 11 |
| *(compartido)* | — | — | `/health` y `/health/ready` en cada servicio | 8 |

> ### ✅ `VITE_API_BASE_URL` resuelto
> El frontend traía `VITE_API_BASE_URL=http://localhost:3000`, donde **ningún servicio
> escucha**. Ahora `frontend/.env.example` usa `VITE_API_BASE_URL=/api/v1` y el servidor de
> desarrollo de Vite hace de **proxy inverso**: reparte cada prefijo de ruta a su servicio
> (`frontend/vite.config.ts`). Así el navegador necesita **una sola URL base**.
> En producción, el mismo reparto corresponde al proxy del servidor (ver `FR-FE-13` en el
> SRS del frontend). Ver [`../Trazabilidad.md`](../Trazabilidad.md) §12.2.

### 3.1 El contrato entre servicios

Las llamadas **internas** entre microservicios (por ejemplo, que `store-service` cobre
monedas en `economy-service`) **no** pasan por la API pública: tienen su propio contrato, en
[`../Contrato-entre-servicios.md`](../Contrato-entre-servicios.md), que define las
operaciones de saldo, la validación de partida y la autenticación interna.

---

## 4. Autenticación (JWT)

1. El cliente se registra (`POST /api/v1/auth/register`) o entra (`POST /api/v1/auth/login`)
   contra el **identity-service** y recibe:

   ```json
   {
     "user": { "id": "…", "email": "…", "role": "PLAYER", "status": "ACTIVE", "…": "…" },
     "tokens": {
       "accessToken": "eyJ…",
       "refreshToken": "eyJ…",
       "accessExpiresIn": "15m",
       "refreshExpiresIn": "7d"
     }
   }
   ```

2. En cada petición protegida se envía `Authorization: Bearer <accessToken>`.
3. Cuando el access token caduca, se renueva con `POST /api/v1/auth/refresh` (rotación de
   refresh token: el anterior deja de servir).
4. `POST /api/v1/auth/logout` revoca el refresh token y es idempotente.

**Roles:** `PLAYER` y `ADMIN`. Las operaciones administrativas exigen `role: ADMIN`
y responden `403 FORBIDDEN` si el token no lo tiene.

---

## 5. Formato de respuesta y errores

**Éxito** — el recurso, o un listado paginado:

```json
{ "data": [ … ], "meta": { "page": 1, "pageSize": 20, "total": 57, "totalPages": 3 } }
```

**Error** — siempre la misma forma:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Datos de entrada inválidos",
  "details": [ { "path": "email", "message": "Correo inválido" } ]
}
```

- `code` es un **contrato público estable**: inglés, MAYÚSCULAS, no cambia una vez publicado.
  El cliente puede ramificar por `code`, nunca por el texto.
- `message` es español, pensado para mostrar al usuario final.
- `details` solo aparece en `VALIDATION_ERROR`.

**Códigos transversales** (todos los servicios):

| HTTP | `code` | Cuándo |
| ---: | --- | --- |
| 400 | `VALIDATION_ERROR` | La entrada no supera la validación (Zod) |
| 401 | `MISSING_TOKEN` / `INVALID_TOKEN` / `UNAUTHENTICATED` | Falta el token, es inválido/expirado o no hay usuario |
| 403 | `FORBIDDEN` | El usuario no tiene el rol requerido |
| 404 | `NOT_FOUND` | La ruta o el recurso no existe |
| 500 | `INTERNAL_ERROR` | Fallo inesperado (nunca expone *stack*) |

Además hay **códigos de dominio**, p. ej. `BANNER_NOT_FOUND`, `BANNER_NOT_STARTED`,
`INSUFFICIENT_BALANCE`, `PRODUCT_NOT_AVAILABLE`, `GAME_SESSION_NOT_FOUND`,
`PAYMENT_NOT_FOUND`. Cada operación del `openapi.yaml` lista los que le aplican.

---

## 6. Detalles que sorprenden (y están a propósito)

| Detalle | Por qué es así |
| --- | --- |
| Las colecciones usan **barra final** (`/api/v1/users/`) | El router se monta con `app.use("/api/v1/users", …)` y la ruta es `/`. Refleja el código; el validador tiene esa regla desactivada a propósito. |
| `/health` y `/health/ready` **no** viven bajo `/api/v1` | Son de infraestructura, no de negocio, y se mantienen estables. |
| El contrato **no** documenta el canje de descuentos con débito de monedas como disponible | Está **pendiente** en el backend (`FR-BE-13`, `FR-BR-08`). Un contrato que promete lo que no existe es peor que no tenerlo. |
| El contrato **no** documenta la acreditación de monedas compradas como disponible | Pendiente (`FR-BE-21`, UC-16). |
| `provider: MOCK` en los pagos | Las recargas son **simuladas**; el backend no procesa dinero real (`FR-BR-10`). |

Los cuatro pendientes anteriores están trazados en [`../Trazabilidad.md`](../Trazabilidad.md).

---

## 7. Cómo se mantiene (regla del equipo)

1. **El contrato cambia en el mismo PR que el código.** Si añades, cambias o eliminas un
   endpoint, actualizas `openapi.yaml` antes de pedir la revisión (ver
   [`../CONTRIBUTING.md`](../CONTRIBUTING.md), checklist de PR).
2. **Antes de mergear**, el validador debe pasar:
   `npx @redocly/cli lint --config=redocly.yaml openapi.yaml`.
3. Los `code` de error son **contratos públicos**: para cambiar uno hay que decidirlo
   como equipo (es un cambio que rompe a los clientes), no dentro de un PR cualquiera.

> **Pendiente de mejora (no bloquea):** cuando el backend estabilice, el contrato se puede
> *autogenerar* desde los esquemas Zod para eliminar el trabajo manual. Hoy, con 59
> operaciones, mantenerlo a mano es razonable y más honesto que una generación parcial.
