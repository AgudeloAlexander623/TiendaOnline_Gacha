# Guía de instalación y ejecución — GearQuest

> **Para quién es esto:** para cualquier persona que acaba de clonar el repositorio y
> necesita que el proyecto **funcione en su computador**. No hace falta que entiendas
> el código todavía: sigue los pasos en orden.
>
> **Qué resuelve:** «¿qué instalo?», «¿qué comando ejecuto?», «¿por qué me da este
> error?». Si algo falla, salta a la [§7 Solución de problemas](#7-solución-de-problemas).

> ⚠️ **Regla de oro de la seguridad:** en este documento **nunca** verás contraseñas
> reales, tokens ni direcciones de servidores de producción. Los valores que se
> muestran (`postgres`, `dev-only-secret-change-me-in-production`, etc.) son **valores
> de ejemplo para desarrollo local**. Los secretos reales viven en archivos `.env`
> que **no se suben al repositorio**.

---

## 1. Qué es GearQuest, en una frase

GearQuest es una **tienda web de periféricos para computador** que combina compras
normales con un sistema de recompensas gamificado: juegas un minijuego, ganas
**monedas**, y usas esas monedas en una **máquina gacha** para conseguir descuentos.

Para que no te pierdas: el proyecto está dividido en tres aplicaciones.

| Aplicación | Carpeta | Qué hace | Puerto (desarrollo) |
| --- | --- | --- | --- |
| **Frontend** | `frontend/` | La página que ve el usuario (React) | `5173` |
| **Backend** | `backend/` | 4 microservicios que guardan y deciden todo (Node) | `3001`–`3004` |
| **Juego** | `GAME/` | Minijuego y ruta gacha en Godot | *(pendiente)* |

> **Nota importante:** en este documento se explica cómo levantar **frontend y backend**.
> El juego (Godot) y el servicio Python de análisis **todavía no existen**, así que no
> hay pasos para ellos. Cuando se implementen, se añadirán aquí.

---

## 2. Antes de empezar: qué necesitas instalado

Estas son las herramientas que hay que tener. En la columna «cómo comprobar» está el
comando que confirma que ya la tienes.

| Herramienta | Versión mínima | Para qué | Cómo comprobar |
| --- | --- | --- | --- |
| **Node.js** | `>= 20.19` | Ejecuta frontend y backend | `node --version` |
| **npm** | `>= 10` (viene con Node) | Instala dependencias | `npm --version` |
| **Docker** + Compose | reciente | Base de datos PostgreSQL local | `docker --version` |
| **Git** | reciente | Traer el código | `git --version` |

> **¿Por qué Node 20.19 o superior?** El backend usa *npm workspaces* y módulos ESM
> modernos; con versiones viejas, los comandos fallan con errores extraños.

> **Consejo (junior):** si `node --version` da un número menor que 20, no sigas: primero
> actualiza Node. Es la causa nº 1 de fallos al instalar.

---

## 3. Puesta en marcha, paso a paso

El orden importa: primero el código, luego la base de datos, luego los servicios.

### Paso 1 — Clonar el repositorio

```bash
git clone <URL-del-repositorio>
cd TiendaOnline_Gacha
```

> Reemplaza `<URL-del-repositorio>` por la dirección que te dé GitHub/GitLab. No la
> escribimos aquí porque cambia según dónde esté alojado el proyecto.

### Paso 2 — Levantar la base de datos (PostgreSQL con Docker)

GearQuest usa **una base de datos por servicio** (4 en total). No las creas a mano:
Docker las inicializa solas la primera vez.

```bash
cd backend
npm run db:up
```

Qué acaba de pasar:

- Se descargó la imagen de PostgreSQL 16 y levantó un contenedor llamado
  `gearquest-postgres`.
- Un script (`backend/infra/docker/initdb/…`) creó automáticamente las 4 bases:
  `gearquest_identity`, `gearquest_store`, `gearquest_economy`, `gearquest_payments`.

Comandos útiles de la base de datos:

```bash
npm run db:logs   # ver qué está pasando dentro (útil si algo falla)
npm run db:down   # apagar la base de datos
```

> **¿Por qué un solo contenedor y 4 bases?** Es lo más simple para desarrollo local.
> En producción se evaluará separar más; ver
> [`Decisiones.md`](./Decisiones.md) (ADR-0003).

### Paso 3 — Configurar las variables de entorno (`.env`)

El código **no** trae los valores de configuración dentro: los lee de archivos `.env`
que tú creas localmente. El repositorio sí trae **plantillas** que se llaman
`.env.example` (con valores falsos de ejemplo).

**Qué hacer:** por cada plantilla, crea una copia sin `.example`.

```bash
# Desde la carpeta backend/
cp .env.example .env                          # referencia general (opcional)
for s in identity store economy payments; do
  cp "services/$s-service/.env.example" "services/$s-service/.env"
done
```

En el **frontend** es igual, pero el archivo se llama `.env.local`:

```bash
cd ../frontend
cp .env.example .env.local
```

> **¿Qué es un archivo `.env`?** Es un archivo de texto con pares `CLAVE=valor` que el
> programa lee al arrancar. Sirve para no incrustar secretos en el código. Como contiene
> secretos, **nunca se sube a Git** (está en `.gitignore`).

**Valores que verás en las plantillas** (son de ejemplo, no secretos reales):

| Variable | Valor de desarrollo | Qué es |
| --- | --- | --- |
| `PORT` | `3001`–`3004` | Puerto de cada servicio |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/gearquest_*` | Conexión a la base del servicio |
| `JWT_SECRET` | `dev-only-secret-change-me-in-production` | Clave para firmar sesiones **en local** |
| `CORS_ORIGIN` | `*` | Quién puede llamar a la API (en local, todos) |
| `PAYMENT_PROVIDER` | `mock` | Pagos simulados, sin dinero real |

> 🚨 **Muy importante:** el `JWT_SECRET` de ejemplo **jamás** debe usarse en un entorno
> publicado. En producción se genera una clave larga y aleatoria y se guarda **fuera**
> del repositorio (variable de entorno del servidor o gestor de secretos).

### Paso 4 — Instalar dependencias y preparar la base

Con la base de datos arriba y los `.env` creados:

```bash
# Backend (instala los 4 servicios + paquetes compartidos de una sola vez)
cd backend
npm install
npm run prisma:generate   # genera el cliente de Prisma que usa el código
npm run prisma:migrate    # aplica las migraciones (crea las tablas)
npm run seed              # carga datos de prueba (productos, monedas, etc.)
```

```bash
# Frontend (en otra terminal)
cd frontend
npm install
```

> **¿Qué es «migrar» la base de datos?** Es aplicar recetas ordenadas (`prisma/migrations/`)
> que transforman una base vacía en el esquema actual. Cada receta se aplica una sola vez
> y queda registrada, así todos los integrantes tienen **la misma** estructura.

> **¿Qué es el `seed`?** Es un script que llena la base con datos de ejemplo para que la
> página no se vea vacía al abrirla. No son datos reales.

### Paso 5 — Arrancar todo

Necesitas **5 terminales** (una por servicio + frontend). Este es el reparto:

| Terminal | Carpeta | Comando | Qué levanta |
| --- | --- | --- | --- |
| 1 | `backend/` | `npm run dev:identity` | Servicio de identidad :3001 |
| 2 | `backend/` | `npm run dev:store` | Tienda :3002 |
| 3 | `backend/` | `npm run dev:economy` | Economía/monedas :3003 |
| 4 | `backend/` | `npm run dev:payments` | Pagos simulados :3004 |
| 5 | `frontend/` | `npm run dev` | Página web :5173 |

Cuando todo arranque, abre en el navegador:

- **Frontend:** http://localhost:5173
- **Comprobación de un servicio:** http://localhost:3001/health (debe responder `ok`)

> **Truco:** para saber si un servicio está vivo, visita su ruta `/health`. Si responde,
> el servicio arrancó bien aunque la página aún no lo use.

---

## 4. Verificar que todo quedó bien

| Comprobación | Comando / acción | Resultado esperado |
| --- | --- | --- |
| Node correcto | `node --version` | `v20.19` o superior |
| Base de datos viva | `npm run db:logs` (en `backend/`) | Logs de PostgreSQL sin errores |
| Servicio vivo | abrir `http://localhost:3001/health` | Respuesta `ok` |
| Frontend vivo | abrir `http://localhost:5173` | Se ve la página de inicio |
| Calidad del código | `npm run lint` y `npm run typecheck` (en `backend/`) | Sin errores |

> **Ojo:** el frontend **todavía no está conectado** al backend (hoy hace 0 llamadas HTTP).
> Verás la interfaz, pero los datos aún no vienen del servidor. Revisa
> [`Trazabilidad.md`](./Trazabilidad.md) para saber el estado real de cada parte.

---

## 5. Comandos que usarás a diario

Todos se ejecutan **dentro de `backend/`** salvo el de frontend.

### Backend

| Comando | Qué hace |
| --- | --- |
| `npm run dev:<servicio>` | Arranca un servicio con recarga automática |
| `npm run build` | Compila TypeScript de todos los servicios |
| `npm run typecheck` | Comprueba tipos **sin** generar archivos |
| `npm test` | Ejecuta las pruebas |
| `npm run lint` / `npm run lint:fix` | Revisa / corrige estilo y errores |
| `npm run format` | Formatea el código con Prettier |
| `npm run prisma:studio` *(por servicio)* | Abre un visor web de la base de datos |

### Frontend

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Arranca la página en modo desarrollo |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente lo ya compilado |
| `npm run lint` | Revisa el código |

> **Nota honesta:** el frontend **no tiene** todavía un script `format` (le falta
> Prettier). Está documentado como deuda en
> [`CONTRIBUTING.md`](./CONTRIBUTING.md).

---

## 6. Cómo está organizado el repositorio (mapa rápido)

```text
TiendaOnline_Gacha/
├── frontend/          → la página web (React + Vite + Tailwind)
├── backend/           → los 4 microservicios (Node + Express + TypeScript)
│   ├── services/      → identity · store · economy · payments
│   ├── packages/      → código compartido entre servicios
│   └── infra/         → Docker y scripts de la base de datos
├── documentation/     → esta carpeta: toda la documentación
├── GAME/              → juego en Godot (pendiente)
└── README.MD          → descripción general del proyecto
```

Para el detalle de cada carpeta del backend, ver
[`../backend/README.md`](../backend/README.md). Para entender el modelo de datos, ver
[`Diccionario-de-Datos.md`](./Diccionario-de-Datos.md).

---

## 7. Solución de problemas

Los errores más comunes al instalar, con su causa y arreglo.

### «`node: command not found`» o versión muy vieja

- **Causa:** Node no está instalado o es anterior a 20.19.
- **Solución:** instala Node LTS desde el sitio oficial o con un gestor de versiones
  (`nvm install 20`). Vuelve a comprobar con `node --version`.

### «`Error: connect ECONNREFUSED 127.0.0.1:5432`»

- **Causa:** la base de datos no está levantada o el puerto está ocupado.
- **Solución:** ejecuta `npm run db:up` en `backend/` y mira `npm run db:logs`.
  Si otro PostgreSQL usa el puerto 5432, cambia `POSTGRES_PORT` en tu `.env`.

### «`Environment variable not found: DATABASE_URL`»

- **Causa:** no creaste el archivo `.env` a partir del `.env.example`.
- **Solución:** repite el **Paso 3**. Cada servicio necesita su propio `.env`.

### «`prisma migrate` falla o faltan tablas»

- **Causa:** la base está arriba pero no se aplicaron las migraciones.
- **Solución:** `npm run prisma:generate` y luego `npm run prisma:migrate`.

### El frontend abre, pero no muestra datos

- **Causa esperada:** el frontend aún no está conectado al backend.
- **Solución:** no es un error tuyo. Consulta el estado real en
  [`Trazabilidad.md`](./Trazabilidad.md).

### «`Port 300X is already in use`»

- **Causa:** ya hay algo corriendo en ese puerto (¿otro servicio tuyo?).
- **Solución:** cierra el proceso anterior o cambia el `PORT` en el `.env` del servicio.

---

## 8. Buenas prácticas al trabajar en el proyecto

Estas reglas te ahorrarán dolores de cabeza y errores al subir cambios.

1. **Nunca subas un `.env` real.** Si `git status` lo muestra como archivo nuevo,
   detente: significa que algo está mal configurado. Solo se versionan los `.env.example`.
2. **No metas secretos en el código.** Direcciones de producción, claves o tokens van en
   variables de entorno, jamás «hardcodeados».
3. **Sigue las convenciones del equipo.** Ramas por tarea y mensajes de commit claros;
   ver [`CONTRIBUTING.md`](./CONTRIBUTING.md).
4. **Antes de pedir una revisión, corre** `npm run lint`, `npm run typecheck` y `npm test`.
5. **Si cambias algo del proyecto, actualiza su documentación** en el mismo cambio.

---

## 9. Enlaces relacionados

| Documento | Para qué |
| --- | --- |
| [`README.md`](./README.md) | Índice general de la documentación |
| [`Decisiones.md`](./Decisiones.md) | Por qué está construido así |
| [`Glosario.md`](./Glosario.md) | Qué significa cada término raro |
| [`API/README.md`](./API/README.md) | Cómo hablar con el backend |
| [`Diccionario-de-Datos.md`](./Diccionario-de-Datos.md) | Tablas y campos |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Reglas de contribución |
| [`Estrategia-de-Pruebas.md`](./Estrategia-de-Pruebas.md) | Cómo se prueba el proyecto |
| [`Despliegue.md`](./Despliegue.md) | Cómo se publicaría (estados y requisitos) |
| [`../backend/README.md`](../backend/README.md) | Detalle técnico del backend |
| [`../frontend/ReadmeFrontEnd.md`](../frontend/ReadmeFrontEnd.md) | Detalle del frontend |

---

*Si sigues los pasos y algo no cuadra con lo que dice este documento, gana el código:
corrige la guía y avísale al equipo.*
