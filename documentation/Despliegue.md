# Guía de despliegue — GearQuest

> **Para quién es esto:** para quien necesita **publicar** GearQuest (o entender cómo se
> publicaría) en un servidor, no solo ejecutarlo en su computador.
>
> **Relación con otros documentos:** los *requisitos* de esta área están en el
> [SRS de Infraestructura](./Software-requeriments(SRS)/Infrastructure.md). Este documento
> es la **guía operativa**: qué hay hoy, qué falta y cómo se haría cuando llegue el momento.

> ⚠️ **Aviso de seguridad (léelo primero):** esta guía **no contiene** direcciones de
> servidores, credenciales, tokens ni datos reales de producción. Todos los ejemplos usan
> valores evidentemente falsos (`<dominio>`, `dev-only-secret-change-me-in-production`).
> Los secretos reales se guardan **fuera del repositorio**, en variables del servidor o
> en un gestor de secretos.

---

## 1. Estado actual (honesto)

GearQuest **todavía no está desplegado**. Publicar requiere pasos que aún no existen.
Esta tabla resume qué hay y qué falta.

| Pieza | Estado | Detalle |
| --- | --- | --- |
| PostgreSQL local en Docker | ✅ Listo | `npm run db:up` levanta 4 bases |
| Ejecución local de los 4 servicios | ✅ Listo | Ver [`Guia-de-Instalacion.md`](./Guia-de-Instalacion.md) |
| Ejecución local del frontend | ✅ Listo | `npm run dev` |
| **Dockerfiles** (imágenes de cada servicio/frontend) | ⬜ Pendiente | Sin esto no hay qué publicar |
| **Proveedor de alojamiento** | ⬜ Por seleccionar | Gratuito o de bajo costo, según el SRS |
| **Base de datos de producción** | ⬜ Por definir | Separada de la de desarrollo |
| **Gestión de secretos en producción** | ⬜ Por definir | Nunca en el repositorio |
| **HTTPS / dominio** | ⬜ Pendiente | Requisito del SRS (FR-INF-03) |
| **Monitoreo y copias de seguridad** | ⬜ Pendiente | Necesarios para una demo de 1–2 meses |

> **Regla del proyecto:** no se documenta como hecho lo que no existe. Hoy el despliegue
> es un **plan**, no una realidad. Ver [`Trazabilidad.md`](./Trazabilidad.md).

---

## 2. Conceptos previos (para juniors)

Antes de publicar, entiende estos cuatro conceptos:

### 2.1 Entornos

Un **entorno** es una copia del sistema con un propósito distinto. GearQuest usa (o usará):

| Entorno | Para qué | ¿Datos reales? |
| --- | --- | --- |
| **Desarrollo** | Tu computador; pruebas diarias | No, datos de ejemplo |
| **Producción** | La demo pública | Datos «reales» de la demo |

> **Regla de oro (NFR-INF-03):** desarrollo y producción **nunca** comparten base de datos.
> Un error de prueba no debe afectar la demo publicada.

### 2.2 Contenedor e imagen

Una **imagen** es la «receta empaquetada» de un programa con todo lo que necesita. Un
**contenedor** es esa receta en ejecución. Publicar consiste, básicamente, en construir
imágenes y ponerlas a correr en un servidor.

### 2.3 Variables de entorno y secretos

En producción **no se meten valores en el código**: se pasan como variables de entorno.
Un **secreto** (clave de firma, contraseña de base de datos) se guarda en un lugar
protegido: variables del servidor o un **gestor de secretos**, nunca en Git.

### 2.4 Migraciones al publicar

Cuando publicas una versión nueva, la base de datos puede necesitar cambios de estructura.
Esos cambios son las **migraciones**, que **ya están versionadas** en `prisma/migrations/`.
En producción se aplican con un comando distinto al de desarrollo (ver §4).

---

## 3. Preparación previa (checklist)

Antes de publicar, hay que tener resuelto:

- [ ] **Proveedor elegido** y verificado (ver §5: límites, inactividad, persistencia, costos).
- [ ] **Dockerfiles** de los 4 servicios y del frontend (pendiente).
- [ ] **Base de datos de producción** creada y accesible **solo** desde el servidor.
- [ ] **Secretos generados** (uno por entorno) y guardados fuera del repositorio.
- [ ] **HTTPS** configurado con un certificado válido.
- [ ] **CORS restringido** al dominio real del frontend (no `*`).
- [ ] **Migraciones** listas para aplicarse en producción.
- [ ] **Copias de seguridad** programadas.
- [ ] **Monitoreo** de errores activo.

---

## 4. Cómo se desplegaría (plan por pasos)

> Todos los comandos son **ilustrativos**: los reales dependerán del proveedor que se
> elija. Se muestran para que entiendas el orden lógico, no para copiarlos tal cual.

### Paso 1 — Construir las imágenes

```bash
# Ejemplo ilustrativo (los Dockerfiles aún no existen)
docker build -t gearquest/identity-service   backend/services/identity-service
docker build -t gearquest/store-service      backend/services/store-service
docker build -t gearquest/economy-service    backend/services/economy-service
docker build -t gearquest/payments-service   backend/services/payments-service
docker build -t gearquest/frontend           frontend
```

### Paso 2 — Configurar secretos en el servidor

En el panel del proveedor (o un gestor de secretos) se definen las variables:

| Variable | Cómo se obtiene en producción |
| --- | --- |
| `DATABASE_URL` | La entrega el proveedor de base de datos (valor secreto) |
| `JWT_SECRET` | Clave **larga y aleatoria**, generada para producción |
| `CORS_ORIGIN` | El dominio real del frontend |
| `PAYMENT_PROVIDER` | `mock` (recargas simuladas) |

> 🚨 **Nunca** se reutiliza el `JWT_SECRET` de desarrollo. **Nunca** se escribe un secreto
> real en un archivo que se sube a Git.

### Paso 3 — Aplicar las migraciones en producción

```bash
# En producción se aplican las migraciones ya existentes (sin crear nuevas)
npm run prisma:deploy
```

> **Diferencia clave:** en **desarrollo** se usa `prisma:migrate` (puede crear cambios);
> en **producción** se usa `prisma:deploy` (solo aplica lo que ya está versionado). Así
> producción nunca inventa estructura nueva por su cuenta.

### Paso 4 — Arrancar los servicios y el frontend

Cada servicio escucha en su puerto (**3001–3004**) y el frontend se sirve como sitio
estático. El proveedor se encarga de exponerlos por **HTTPS** con el dominio elegido.

### Paso 5 — Verificar

- [ ] La página carga por HTTPS (`https://<dominio>`).
- [ ] Las rutas de salud (`/health`) de cada servicio responden.
- [ ] Se puede completar un flujo de demostración (catálogo → carrito → pedido).
- [ ] CORS rechaza orígenes no autorizados.

---

## 5. Elección del proveedor (requisitos a verificar)

El proveedor **aún no está elegido**. Antes de decidir, hay que comprobar (FR-INF-04):

| Criterio | Por qué importa |
| --- | --- |
| Límites de uso y recursos | Un plan gratuito puede quedarse corto a mitad de la demo |
| Suspensión por inactividad | Si el servicio «duerme», la demo falla en el peor momento |
| Persistencia de datos | ¿Los datos sobreviven a un reinicio? |
| Compatibilidad con contenedores | Debe poder ejecutar nuestras imágenes Docker |
| Costos de correo/SMS | Solo si se activan notificaciones externas |
| Compatibilidad con el stack | Node 20+, PostgreSQL, frontend estático |

> **Advertencia:** un plan gratuito **no** es para siempre ni garantiza disponibilidad.
> No se debe prometer una demo que el proveedor puede apagar sin avisar.

---

## 6. Seguridad al publicar (checklist crítico)

Estas medidas son **obligatorias** antes de exponer el sistema a internet. Se alinean con
el [README raíz §7](../README.MD) y el [SRS de Seguridad](./Software-requeriments(SRS)/Security.md).

- [ ] **HTTPS obligatorio** en todo el dominio.
- [ ] **CORS restringido**: solo el dominio del frontend; nunca `*` en producción.
- [ ] **Secretos fuera del repositorio**: en variables del servidor o gestor de secretos.
- [ ] **`JWT_SECRET` propio de producción**, largo y aleatorio.
- [ ] **Base de datos aislada**: no accesible públicamente; solo desde los servicios.
- [ ] **Registro de logs sin datos sensibles**: nunca contraseñas, tokens ni datos personales.
- [ ] **Límite de peticiones** activo para frenar abusos.
- [ ] **Errores sin detalles internos**: los mensajes al usuario no revelan rutas ni consultas.
- [ ] **Dependencias revisadas** antes de publicar (vulnerabilidades conocidas).
- [ ] **Copias de seguridad** configuradas y probadas.
- [ ] **Documentación auditada** con el checklist anti-secretos (ver §6.1).

> **Por qué insistimos tanto:** el momento de publicar es cuando el sistema deja de estar
> protegido «por estar en tu PC». Un descuido aquí no es un bug: es una puerta abierta.

### 6.1 Comprobación de secretos en la documentación

Antes de publicar, ejecuta esta búsqueda y revisa que **todo** lo que aparezca sea un
valor de ejemplo evidentemente falso. La política completa está en
[`Politica-de-Seguridad-Documental.md`](./Politica-de-Seguridad-Documental.md).

```bash
# Posibles secretos en la documentación
grep -rniE "(api[_-]?key|secret|password|token|bearer|private[_-]?key)[[:space:]]*[:=]" \
  documentation README.MD 2>/dev/null

# Datos personales o rutas locales
grep -rniE "([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|/home/|/Users/)" \
  documentation 2>/dev/null

# Credenciales por defecto que parezcan reales
grep -rniE "(admin:admin|root:|postgres:postgres)" documentation 2>/dev/null
```

**Cómo interpretarlo:** si aparece `dev-only-secret-change-me-in-production`,
`postgres:postgres` (marcado como local) o placeholders `<…>`, es correcto. Si aparece
un valor que **no** reconoces como falso, **detente** y revísalo antes de publicar.

---

## 7. Mantenimiento de la demo

Una vez publicada, hay que mantenerla durante **1–2 meses** (NFR-INF-01):

| Tarea | Frecuencia sugerida |
| --- | --- |
| Revisar logs de errores | Diaria |
| Comprobar que los servicios responden | Diaria |
| Copia de seguridad de la base de datos | Periódica (según el proveedor) |
| Actualizar dependencias con fallos de seguridad | Cuando aparezcan |
| Aplicar nuevas migraciones al publicar | En cada despliegue |

> **Lección (junior):** «desplegar» no termina al publicar. Empieza ahí: a partir de ese
> momento hay que vigilar, respaldar y actualizar.

---

## 8. Decisiones pendientes de esta área

Copiadas del [SRS de Infraestructura](./Software-requeriments(SRS)/Infrastructure.md) §7,
para que no se pierdan:

1. Proveedor de alojamiento y de base de datos de producción.
2. Imágenes Docker de cada servicio y del frontend (Dockerfiles).
3. Estrategia de variables de entorno en producción y gestión de secretos.
4. Monitoreo y registro de errores en el entorno publicado.
5. Procedimiento de copias de seguridad en producción.

---

## 9. Enlaces relacionados

| Documento | Para qué |
| --- | --- |
| [`Software-requeriments(SRS)/Infrastructure.md`](./Software-requeriments(SRS)/Infrastructure.md) | Requisitos de infraestructura (fuente) |
| [`Guia-de-Instalacion.md`](./Guia-de-Instalacion.md) | Ejecución local, paso a paso |
| [`Decisiones.md`](./Decisiones.md) | Por qué se toman estas decisiones |
| [`Trazabilidad.md`](./Trazabilidad.md) | Estado real de infraestructura |
| [`README.MD`](../README.MD) §11 | Objetivos de despliegue del proyecto |
| [`Estrategia-de-Pruebas.md`](./Estrategia-de-Pruebas.md) | Qué se prueba antes de publicar |
