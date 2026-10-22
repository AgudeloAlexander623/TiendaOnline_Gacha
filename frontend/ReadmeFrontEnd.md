# GearQuest — Frontend

Guía para entender, levantar y trabajar en la parte visual de GearQuest.

> Este documento es la **puerta de entrada** al frontend. El detalle técnico de la arquitectura vive en
> [`documentation/FRONTEND_ARCHITECTURE.md`](documentation/FRONTEND_ARCHITECTURE.md); aquí no se repite.

## ¿Qué es este proyecto?

GearQuest es una **tienda en línea** con una moneda propia y un **juego integrado**. Los usuarios pueden:

- Explorar un **catálogo** de productos y ver el detalle de cada uno.
- Añadir productos a un **carrito** y generar **pedidos**.
- Administrar su **monedero**: monedas ganadas en la **aventura** (vencen a los 30 días) y monedas compradas (sin vencimiento).
- Acceder a **descuentos** según su nivel (10 %, 30 %, 50 %, 70 % y 90 %).
- Consultar su **perfil** y el resultado de sus partidas.

Este repositorio corresponde únicamente al **frontend**: la aplicación que ve y usa la persona desde el navegador. Se comunica por HTTP con los servicios del backend (carpeta `backend/` del proyecto). El juego (Godot) es independiente y se enlaza o embebe según el diseño definido.

> **El juego tiene tres componentes:** la **aventura** (un metroidvania de laberintos y jefes, de donde se ganan las monedas), el **mercader** del mapa (donde se canjean monedas por objetos) y la **ruleta** (gacha). El detalle está en
> [`documentation/Software-requeriments(SRS)/Game.md`](<../documentation/Software-requeriments(SRS)/Game.md>).

## Estado actual

Hay **9 pantallas** implementadas y enrutadas, pero **todavía no hay lógica de negocio**: **0 llamadas HTTP**. Las carpetas `src/features/*`, `src/services/`, `src/lib/`, `src/config/` y `src/store/` están vacías a la espera del cliente HTTP y la capa de datos. El estado real, requisito por requisito, está en
[`documentation/Trazabilidad.md`](../documentation/Trazabilidad.md) §6.

## Requisitos

- **Node.js 18 o superior** (recomendado la versión LTS). Sirve para ejecutar el proyecto y sus herramientas.
- **npm** (viene incluido con Node.js).

Comprueba que los tienes abriendo una terminal y ejecutando:

```bash
node -v
npm -v
```

Si ambos muestran un número de versión, estás listo. Si no, instala Node.js desde [nodejs.org](https://nodejs.org/es).

## Puesta en marcha

Todos los comandos se ejecutan **dentro de la carpeta `frontend/`**.

```bash
# 1. Entra en la carpeta del frontend
cd frontend

# 2. Instala las dependencias (solo la primera vez, o cuando cambien)
npm install

# 3. Arranca el entorno de desarrollo
npm run dev
```

Vite mostrará una dirección en la terminal (normalmente `http://localhost:5173`). Ábrela en el navegador: cada vez que guardes un cambio, la página se actualizará sola.

## Comandos disponibles

| Comando           | Para qué sirve                                                                         |
| ----------------- | -------------------------------------------------------------------------------------- |
| `npm run dev`     | Arranca la app en modo desarrollo, con recarga automática.                             |
| `npm run build`   | Comprueba los tipos (`tsc`) y genera la versión optimizada para producción en `dist/`. |
| `npm run preview` | Sirve la versión ya compilada, para revisarla antes de publicarla.                     |
| `npm run lint`    | Analiza el código en busca de errores y malas prácticas.                               |

## Variables de entorno

La configuración se lee desde un archivo `.env.local` (no se sube al repositorio). Para crearlo, copia el ejemplo:

```bash
cp .env.example .env.local
```

| Variable            | Descripción                                                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Dirección base del backend contra la que se hacen las peticiones. **Usa `/api/v1`**: el proxy de Vite reparte cada prefijo a su servicio (3001-3004). Ver [`vite.config.ts`](vite.config.ts). |
| `VITE_APP_NAME`     | Nombre de la aplicación que se muestra en la interfaz.                                                                                                                                        |

**Importante:** solo las variables que empiezan por `VITE_` son visibles en el navegador. Nunca pongas aquí claves secretas, tokens ni contraseñas: todo lo que llega al frontend es público. Si cambias el `.env.local`, reinicia `npm run dev` para que se apliquen los cambios.

> **¿Por qué `/api/v1` y no `http://localhost:3000`?** Porque **ningún servicio escucha en el
> puerto 3000**. Con el proxy inverso de Vite, el navegador pide a `/api/v1/...` y el servidor
> de desarrollo lo reenvía al servicio correcto. Así el mismo código funciona en desarrollo
> y en producción. Requisito: `FR-FE-13`.

## Estructura del proyecto

```text
frontend/
├── documentation/   # Documentación (arquitectura, cambios por desarrollador)
├── public/          # Archivos estáticos que se sirven tal cual
├── src/             # Todo el código de la aplicación
├── .env.example     # Plantilla de variables de entorno
├── index.html       # Página HTML base donde se monta la app
├── package.json     # Dependencias y comandos
├── tailwind.config.js, postcss.config.js  # Configuración de estilos
├── tsconfig*.json   # Configuración de TypeScript
└── vite.config.ts   # Configuración de Vite
```

Dentro de `src/`, cada carpeta tiene una responsabilidad concreta:

| Carpeta                    | Responsabilidad                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/`                     | Configuración general: enrutado y proveedores globales.                                                                                           |
| `components/`              | Piezas de interfaz reutilizables (`ui/` genéricas, `shared/` compartidas).                                                                        |
| `features/`                | Funcionalidades por dominio: `auth`, `catalog`, `cart`, `orders`, `wallet`, `discounts`, `profile`, `game-integration`, `notifications`, `admin`. |
| `pages/`                   | Pantallas completas de la aplicación.                                                                                                             |
| `layouts/`                 | Plantillas de estructura (main, auth, admin).                                                                                                     |
| `services/`                | Comunicación con la API del backend.                                                                                                              |
| `hooks/`, `lib/`, `utils/` | Lógica reutilizable: hooks propios, utilidades y funciones puras.                                                                                 |
| `store/`                   | Estado global de la aplicación.                                                                                                                   |
| `config/`                  | Constantes y configuración interna.                                                                                                               |
| `types/`                   | Tipos compartidos de TypeScript.                                                                                                                  |
| `assets/`                  | Imágenes, íconos y fuentes.                                                                                                                       |
| `routes/`                  | Definición de rutas.                                                                                                                              |

La explicación detallada de esta organización está en [`documentation/FRONTEND_ARCHITECTURE.md`](documentation/FRONTEND_ARCHITECTURE.md).

## Cómo trabajar en este frontend

- **Respeta la estructura**: cada cosa en la carpeta que le corresponde; ante la duda, revisa la arquitectura antes de crear algo nuevo.
- **Un componente por archivo**, con nombres claros y en inglés (el código se escribe en inglés; los comentarios y la documentación, en español).
- **Interfaz en lenguaje de negocio**: piensa en la persona que usará la tienda, no solo en que el código funcione.
- **No dupliques lógica**: si algo se repite, muévelo a `lib/`, `utils/` o `components/shared/`.
- **Documenta lo que haces** en `documentation/personal/` (un archivo por desarrollador o tarea), como explica [`documentation/README.md`](documentation/README.md).
- **No toques código ajeno sin autorización**: es una norma del proyecto.

## Documentación relacionada

| Documento                                                                          | Contenido                                        |
| ---------------------------------------------------------------------------------- | ------------------------------------------------ |
| [`documentation/FRONTEND_ARCHITECTURE.md`](documentation/FRONTEND_ARCHITECTURE.md) | Arquitectura, principios y estructura detallada. |
| [`documentation/CHANGELOG_ESQUEMA.md`](documentation/CHANGELOG_ESQUEMA.md)         | Historial del esquema del proyecto.              |
| [`documentation/README.md`](documentation/README.md)                               | Cómo registrar tu documentación personal.        |
| `README.MD` (raíz del proyecto)                                                    | Visión general del proyecto completo.            |

## Problemas frecuentes

- **Los cambios no se ven**: revisa que `npm run dev` siga corriendo y recarga el navegador. Si tocaste `.env.local`, reinicia el servidor.
- **El puerto está ocupado**: Vite propondrá otro puerto automáticamente; usa el que muestre la terminal.
- **Errores raros tras bajar cambios nuevos**: suele resolverse volviendo a ejecutar `npm install` y reiniciando el servidor.

---

¿Dudas sobre una decisión de arquitectura? La respuesta debería estar en `documentation/`. Si no está, pregunta antes de improvisarla.
