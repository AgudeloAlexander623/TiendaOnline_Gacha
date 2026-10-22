# Historias técnicas — GearQuest

> **Para quién es esto:** para quien programa. Aquí está el trabajo **técnico** que no ve el
> usuario pero que **habilita** las historias de usuario.
> **Diferencia clave:** una **historia de usuario** («quiero ver mi monedero») la pide una
> persona. Una **historia técnica** («crear el endpoint que calcula el saldo con vencimientos»)
> la pide el equipo para poder cumplir la primera.
> **Base real:** todas las historias de este documento salen de la **deuda técnica y los
> pendientes verificados** en el código (ver [Trazabilidad](./Trazabilidad.md) §12) y de los
> requisitos técnicos del SRS. **No se inventan** tareas que el proyecto no necesite.

---

## 1. ¿Qué es una historia técnica? (para juniors)

Una historia técnica es trabajo necesario que **no entrega valor directo al usuario** pero sin
el cual su historia no se puede completar. Se escribe igual («Como… quiero… para…») pero el
«como» es el **equipo**, no el cliente:

```text
Historia de usuario:  Como cliente quiero ver mis monedas y vencimientos…
Historia técnica:     Como equipo queremos exponer un endpoint que calcule el saldo
                      vigente para que el monedero muestre datos reales.
```

### Cómo se relacionan

```text
   ÉPICA
     │
     ├── HISTORIA DE USUARIO  ──necesita──▶  HISTORIA TÉCNICA
     │   (US-14: ver monedero)              (TS-05: endpoint de saldo)
     │
     └── HISTORIA TÉCNICA (sin usuario directo)
         (TS-01: dockerizar los servicios)
```

> **Cuándo una historia es técnica y no de usuario:** cuando no cambia lo que la persona
> percibe, cuando solo se puede verificar «por dentro» (una migración, un contenedor, un
> pipeline de CI) o cuando es una **carencia de la base técnica** que bloquea lo demás.

---

## 2. Historia técnica obligatoria: nada de trabajo sin dueño

Igual que las historias de usuario, cada historia técnica:

1. nace de un **requisito** (`FR-*` / `NFR-*`) o de un `TODO` verificado en el código;
2. tiene un **criterio de verificación** (cómo sé que está hecha);
3. se rige por el [Definition of Done](./Definition-of-Done.md);
4. al terminar, actualiza la [matriz de trazabilidad](./Trazabilidad.md).

---

## 3. Historias técnicas del proyecto

Se agrupan por **área técnica**. La columna «Origen» dice de dónde sale la necesidad
(un requisito, un `TODO` del código o una carencia detectada).

### 3.1 Integración entre microservicios (la deuda más urgente)

Hoy **ningún servicio llama a otro**. Estas historias cierran esa brecha, que es lo que separa
al backend de «funcionar por partes» a «funcionar como sistema».

| ID | Historia técnica | Origen | Requisitos | Habilita |
| --- | --- | --- | --- | --- |
| **TS-01** | Como equipo queremos que **store consulte a economy** para validar y **debitar** las monedas de un descuento al confirmar el pedido, para que el canje descuente saldo de verdad | `TODO(economia)` en `store/…/orders.service.ts:91` | FR-BE-13, FR-BR-08, FR-BR-14 | [US-10](./Epicas-e-Historias.md) |
| **TS-02** | Como equipo queremos que **payments acredite monedas `PURCHASED`** al aprobar un pago, para que comprar monedas aumente el saldo | `TODO(economia)` en `payments/…/payments.service.ts:176` | FR-BE-21, UC-16 | [US-16](./Epicas-e-Historias.md) |
| **TS-03** | Como equipo queremos que **payments acredite** las monedas al completar una recarga, para cerrar el flujo de recarga simulada | Comentario en `payments/…/recharges.service.ts:5` | FR-BE-21 | [US-16](./Epicas-e-Historias.md) |
| **TS-04** | Como equipo queremos que **economy valide la partida contra el juego** antes de otorgar monedas, para no aceptar un puntaje inventado por el cliente | Comentario en `economy/…/rewards.service.ts:9` | FR-BE-17, FR-GA-19 | [US-12](./Epicas-e-Historias.md) |

> **Cómo se verifica:** una prueba de integración que confirme que una operación **de extremo
> a extremo** descuenta/acredita el saldo, y que un fallo **no deja el saldo a medias** (todo
> dentro de una transacción).

### 3.2 Integridad de dinero y datos

| ID | Historia técnica | Origen | Requisitos | Habilita |
| --- | --- | --- | --- | --- |
| **TS-05** | Como equipo queremos un **cálculo de saldo único y probado** que considere tipo de moneda y vencimiento, para que el monedero nunca muestre un saldo que no es | NFR de integridad + §4 de [Estrategia de pruebas](./Estrategia-de-Pruebas.md) | FR-BR-04, FR-BR-05 | [US-14, US-15](./Epicas-e-Historias.md) |
| **TS-06** | Como equipo queremos **idempotencia por petición** en las operaciones de saldo, para que reintentar o repetir no duplique el efecto | Auditoría (Trazabilidad §12.1) | FR-BE-19, FR-BR-15 | [US-08, US-13](./Epicas-e-Historias.md) |
| **TS-07** | Como equipo queremos que **checkout sea atómico** (descuento de stock + snapshot de precio + saldo), para que no queden pedidos fantasma ni stock inconsistente | FR-BE-12 documentado; falta prueba | FR-BE-12, FR-BR-12/13 | [US-08](./Epicas-e-Historias.md) |

> **Cómo se verifica:** pruebas de integración con **concurrencia** (dos peticiones
> simultáneas → un solo efecto) y verificación de que el libro mayor cuadra
> (`balanceAfter` encadenado).

### 3.3 Base técnica / infraestructura

| ID | Historia técnica | Origen | Requisitos | Habilita |
| --- | --- | --- | --- | --- |
| **TS-08** | Como equipo queremos **Dockerfiles** para cada servicio y para el frontend, para poder construir imágenes reproducibles | Auditoría (Trazabilidad §12.1) | NFR-BE-08, FR-INF-01 | Despliegue |
| **TS-09** | Como equipo queremos **migraciones de Prisma versionadas y aplicables** sobre una base limpia, para que cualquiera pueda reproducir el entorno | Práctica adoptada (ADR-0004) | FR-DB-* | Todas |
| **TS-10** | Como equipo queremos configurar el **CORS y las cabeceras** correctamente por entorno, para que el frontend pueda llamar a la API sin abrir la puerta a cualquiera | NFR-SEC | NFR-SEC-*, FR-SEC-* | Integración FE↔BE |

> **Cómo se verifica:** `docker build` de cada imagen; `prisma migrate deploy` sobre base
> vacía sin errores; el frontend recibe respuesta solo desde el origen permitido.

### 3.4 Calidad y automatización

| ID | Historia técnica | Origen | Requisitos | Habilita |
| --- | --- | --- | --- | --- |
| **TS-11** | Como equipo queremos **pruebas de integración con base de datos real** para el monedero, checkout y ruleta, para convertir en demostrable lo que hoy es deuda | Estrategia de pruebas §8 | NFR-BR-02 | Done de épica |
| **TS-12** | Como equipo queremos un **pipeline de CI** que ejecute lint, typecheck y pruebas en cada PR, para que nadie mergee algo roto | No existe CI | NFR-BE-04 | Definition of Done |
| **TS-13** | Como equipo queremos **validar las respuestas contra `openapi.yaml`**, para que el contrato no se desvíe del código real | Estrategia de pruebas §3 | NFR-BE-04 | Contrato |

> **Cómo se verifica:** la CI falla si un PR rompe el lint, los tipos o una prueba; la
> validación de contrato detecta una respuesta que no cumple el esquema.

### 3.5 Frontend

| ID | Historia técnica | Origen | Requisitos | Habilita |
| --- | --- | --- | --- | --- |
| **TS-14** | Como equipo queremos **conectar el frontend al backend** (cliente HTTP real), para que la UI deje de ser estática | Matriz §6: 0 llamadas HTTP | FR-FE-10, FR-FE-13 | Todas las de tienda |
| **TS-15** | Como equipo queremos **resolver el desajuste de `VITE_API_BASE_URL`** (apunta al 3000, los servicios usan 3001-3004), para que la configuración sea correcta | Trazabilidad §12.2 | FR-FE-13 | [TS-14](#35-frontend) — ✅ **hecha en v1.1** |
| **TS-16** | Como equipo queremos un **script `format` y Prettier en el frontend**, para tener el mismo estándar que el backend | Trazabilidad §12.3 | NFR-FE-06 | Calidad FE — ✅ **hecha en v1.1** |

> **Cómo se verifica:** la UI muestra datos reales del backend; cambiar `VITE_API_BASE_URL`
> apunta a un puerto donde algo escucha; `npm run format` existe y funciona.
>
> **TS-15** se resolvió con el **proxy inverso por prefijo** de Vite (`vite.config.ts`) y
> `VITE_API_BASE_URL=/api/v1`. **TS-16** con Prettier (`^3.9.10`), configurado para
> respetar el estilo ya existente del código.

### 3.6 Seguridad

| ID | Historia técnica | Origen | Requisitos | Habilita |
| --- | --- | --- | --- | --- |
| **TS-17** | Como equipo queremos **límite de peticiones (rate limiting)** en la API, para frenar abusos | SRS de seguridad | NFR-SEC-*, FR-SEC-* | Robustez |
| **TS-18** | Como equipo queremos **matriz de permisos probada** (rol sin permiso → 403), para que la autorización no dependa de la suerte | Estrategia de pruebas §4, regla 9 | FR-BE-08, FR-SEC-02 | [US-11](./Epicas-e-Historias.md) |

> **Cómo se verifica:** una ruta ADMIN con rol `PLAYER` devuelve `403`; pasar el límite de
> peticiones devuelve `429`.

### 3.7 Alcance ampliado en v1.1 (juego, avisos y operación)

Estas historias nacieron de los **13 requisitos nuevos** del SRS (v1.1). Sus contratos ya
están definidos: el del juego en
[`Contrato-entre-servicios.md`](./Contrato-entre-servicios.md) §7-§9.

| ID | Historia técnica | Origen | Requisitos | Habilita |
| --- | --- | --- | --- | --- |
| **TS-19** | Como equipo queremos **canjear monedas por objetos en el mercader** con validación de precio en el servidor, para que el jugador compre objetos sin trampas | Requisito nuevo | FR-BE-22, FR-GA-10, FR-BR-01 | [US-19](./Epicas-e-Historias.md) |
| **TS-20** | Como equipo queremos **compensar un débito si la operación posterior falla** (revertir el cobro cuando el checkout no se completa), para que nadie pierda monedas | Requisito nuevo | FR-BE-23 | [US-10](./Epicas-e-Historias.md) |
| **TS-21** | Como equipo queremos **persistir la clave de idempotencia** en base de datos con su plazo de vida, para que un reintento no duplique el efecto aunque el proceso se reinicie | Requisito nuevo | FR-DB-09, FR-BE-19, FR-BR-15 | [TS-06](#32-integridad-de-dinero-y-datos) |
| **TS-22** | Como equipo queremos **autenticar las llamadas entre servicios** con un token interno de alcance limitado, para que ningún servicio pueda llamar a otro sin autorización | Requisito nuevo | FR-SEC-11 | [TS-01](#31-integración-entre-microservicios-la-deuda-más-urgente) |
| **TS-23** | Como equipo queremos el **módulo de notificaciones** con su bandeja interna y el aviso generado por el servicio que produce el hecho, para que el usuario sepa qué ocurrió con sus monedas y sus pedidos | Requisito nuevo | FR-NO-01…FR-NO-10, FR-FE-11 | [US-13](./Epicas-e-Historias.md) |
| **TS-24** | Como equipo queremos un **comando global de arranque** que levante base de datos, los 4 servicios y el frontend, para no levantar 6 procesos a mano | Requisito nuevo | FR-INF-07, NFR-INF-04 | [TS-08](#33-base-técnica--infraestructura) |

> **Cómo se verifica:** cada una tiene su criterio en la matriz
> ([`Trazabilidad.md`](./Trazabilidad.md) §12.1). El canje del mercader se prueba con el
> mismo criterio crítico que la tirada de la ruleta: **si el saldo no alcanza, no se cobra
> nada** y la operación es idempotente.

---

## 4. Priorización (qué hacer primero)

La deuda de **integración** es la que más desbloquea, porque hoy el sistema funciona «por
piezas» pero no «como conjunto». Orden sugerido:

```text
   1. TS-01 … TS-04   Integración entre servicios   ← desbloquea reglas de negocio reales
   2. TS-05 … TS-07   Integridad de dinero          ← evitamos saldo/pedidos inconsistentes
   3. TS-11, TS-12    Pruebas + CI                  ← convierte "hecho" en "demostrable"
   4. TS-14           Conectar frontend             ← el usuario ve algo funcionar
   5. TS-08, TS-09    Docker + migraciones          ← reproducibilidad y despliegue
   6. TS-16 … TS-18   Calidad y seguridad           ← endurecimiento
   7. TS-19 … TS-24   Ampliación v1.1               ← mercader, avisos y operación
```

> **Nota:** **TS-15** (ruta base del frontend) y **TS-16** (Prettier) ya están **hechas**
> en la v1.1 de la documentación; **TS-12** (CI) sigue pendiente y es el siguiente
> candidato natural, porque es lo que convierte «hecho» en «demostrable».

> Esta prioridad coincide a propósito con la **deuda priorizada** de
> [Estrategia de pruebas](./Estrategia-de-Pruebas.md) §8: probar lo de arriba es lo que
> convierte el proyecto de «planificado» a «funcional y demostrable».

---

## 5. Relación con otros documentos

| Quieres… | Ve a… |
| --- | --- |
| El detalle de las reglas que respaldan cada TS | [SRS](./Software-requeriments\(SRS\)/README.md) |
| Qué construye el usuario | [Épicas e historias](./Epicas-e-Historias.md) |
| Cuándo una TS está terminada | [Definition of Done](./Definition-of-Done.md) |
| Qué está hecho de verdad | [Trazabilidad](./Trazabilidad.md) |
| Cómo se prueban | [Estrategia de pruebas](./Estrategia-de-Pruebas.md) |
| La estructura técnica del sistema | [Decisiones (ADR)](./Decisiones.md) |

---

## 6. Reglas de mantenimiento

1. **Toda historia técnica cita su origen** (un requisito o un `TODO` verificado). Si no hay
   origen, se cuestiona si es necesaria.
2. **Si un `TODO` del código se cierra, se marca su TS como hecha** y se actualiza la matriz.
3. **Una historia técnica demasiado grande se divide** (ej. TS-01 en «contrato» y
   «implementación»).
4. **El trabajo técnico que habilita una historia de usuario se enlaza desde ella**: así se
   ve por qué se hace algo que el usuario no ve.

---

*El trabajo técnico no es trabajo «invisible»: es lo que hace posible que lo visible
funcione. Sin él, la demo se cae en la primera pregunta incómoda.*
