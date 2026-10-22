# Changelog — Frontend GearQuest

> **Un solo changelog.** Este archivo es el historial del frontend. **No crees un
> changelog paralelo** en otra carpeta: la documentación del proyecto tiene una regla
> general de _un único `CHANGELOG.md`_, y este es el del frontend.
>
> **Formato:** sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y
> [Semantic Versioning](https://semver.org/lang/es/).

---

## [No publicado]

### Añadido

- **Proxy inverso por prefijo** en `vite.config.ts`: reparte `/api/v1/auth` y
  `/api/v1/users` al `identity-service` (3001), el catálogo, carrito, pedidos y
  descuentos al `store-service` (3002), monedero, ruleta y partidas al
  `economy-service` (3003), y paquetes, pagos y recargas al `payments-service` (3004).
- **`VITE_API_BASE_URL=/api/v1`** en `.env.example`, con el comentario que explica el
  proxy. Sustituye a `http://localhost:3000`, donde **ningún servicio escuchaba**.
- **Prettier** (`^3.9.10`) con `.prettierrc.json` (sin punto y coma, comillas simples,
  100 columnas) y `.prettierignore`. Los scripts `format`, `format:check` y `lint:fix`
  quedan disponibles en `package.json`.
- **Dominios `notifications/` y `admin/`** en `src/features/`, prepared para
  `FR-FE-11` (bandeja de avisos) y `FR-FE-12` (panel de administración).

### Cambiado

- Todo el código se reformateó con Prettier. **Solo cambia el formato**: ni una línea de
  comportamiento.
- Se eliminó `eslintrc.cjs`, una configuración **muerta** (ESLint 10 usa el formato
  _flat_ y no la leía). `eslint.config.js` ya lo ignoraba.
- `documentation/FRONTEND_ARCHITECTURE.md` se reescribió para reflejar el estado real
  (9 páginas, 0 llamadas HTTP, proxy por prefijo) en vez de un esquema propuesto.

---

## [0.1.0] - 2026-10-13

### Añadido

- Scaffold de Vite + React + TypeScript.
- Configuración de Tailwind CSS + PostCSS + Autoprefixer.
- React Router DOM añadido a dependencias.
- Estructura de carpetas _feature-first_: `auth`, `cart`, `catalog`, `discounts`,
  `game-integration`, `orders`, `profile`, `wallet`.
- Carpetas base: `app/`, `components/`, `config/`, `hooks/`, `layouts/`, `lib/`,
  `pages/`, `routes/`, `services/`, `store/`, `types/`, `utils/`, `assets/`.
- Carpeta `documentation/` con documentación personal por desarrollador y
  `documentation/personal/` para registros individuales.
- `.env.example` con las variables de Vite.
- `FRONTEND_ARCHITECTURE.md` con el esquema detallado de arquitectura.
- `ReadmeFrontEnd.md` actualizado con las instrucciones del frontend.

### Notas

- **Sin lógica de negocio implementada**: solo configuración y estructura.
- Se seguía la norma de «no tocar código sin autorización».
