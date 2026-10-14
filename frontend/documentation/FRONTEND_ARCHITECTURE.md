# Esquema de Arquitectura Frontend - GearQuest

**Estado**: Esquema propuesto (sin código implementado). Solo estructura de arquitectura.
**Fecha**: 2026-10-13
**Tecnologías**: React + TypeScript + Vite + Tailwind CSS (según README principal)

## 1. Objetivo

Definir la estructura de carpetas y principios para el frontend, siguiendo buenas prácticas de programación. No se implementa lógica de negocio. Solo organización.

## 2. Principios

- **Separación de responsabilidades**: UI, estado, rutas, datos, utilidades claramente separados
- **Feature-first**: Agrupar por funcionalidad sobre tipo de archivo cuando aplique
- **Minimalismo**: Solo lo necesario, evitando over-engineering
- **Consistente**: Seguir convenciones del código existente y del monorepo
- **Escalable**: Facilita crecimiento manteniendo orden
- **Testeable**: Estructura que permita pruebas futuras

## 3. Estructura de carpetas propuesta

```text
frontend/
├── documentation/           # Documentación personal por desarrollador (cambios, notas)
├── public/                   # Archivos estáticos
├── src/
│   ├── app/                  # Configuración de app (router, providers, store global)
│   │   ├── providers/        # Context/Providers
│   │   ├── router/           # Configuración de rutas
│   │   └── styles/            # Estilos globales (si aplica fuera de index.css)
│   ├── assets/               # Imágenes, íconos, fuentes
│   ├── components/           # Componentes reutilizables UI (atoms/molecules)
│   │   ├── ui/               # Componentes UI atómicos/genéricos
│   │   └── shared/           # Componentes compartidos entre features
│   ├── config/               # Configuración (env, constants, endpoints)
│   ├── features/             # Features por dominio (tienda, auth, juego, monedas, descuentos)
│   │   ├── auth/             # Autenticación (estructura vacía)
│   │   ├── cart/             # Carrito de compras
│   │   ├── catalog/          # Catálogo de productos
│   │   ├── discounts/        # Descuentos
│   │   ├── game-integration/ # Integración con minijuego (cliente)
│   │   ├── orders/           # Pedidos
│   │   ├── profile/          # Perfil usuario
│   │   └── wallet/           # Monedas (ganadas/compradas, vencimientos)
│   ├── hooks/                # Custom hooks reutilizables
│   ├── layouts/              # Layouts (main, auth, admin)
│   ├── lib/                  # Utilidades, helpers, validaciones, http client
│   ├── pages/                # Páginas (vistas top-level)
│   ├── routes/               # Definición de rutas (alternativa a app/router)
│   ├── services/             # Servicios API (fetch/axios wrapper)
│   ├── store/                # Estado global (context/zustand) - si necesario
│   ├── types/                # Tipos TypeScript compartidos
│   └── utils/                # Funciones puras/utilidades
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 4. Dominios mapeados con README

Basado en funcionalidades previstas:

- **auth**: Registro/login, permisos
- **catalog**: Catálogo, vista detalle producto
- **cart**: Carrito
- **orders**: Creación/consulta pedidos
- **wallet**: Monedas, historial, vencimientos (30 días ganadas, sin vencimiento compradas)
- **discounts**: Niveles descuento 10/30/50/70/90%, elegibilidad, canje
- **game-integration**: Integración con Godot (validación resultados vía backend)
- **profile**: Gestión usuario

## 5. Reglas para desarrollo

- **Sin código sin autorización**: Solo crear estructura/documentación
- **Documentar cambios**: Usar `documentation/` para registrar cambios personales
- **No tocar lógica backend**: Frontend consume API (contratos definidos)
- **Componentes UI puros**: Preferir componentes sin efectos secundarios
- **Tipado estricto**: TypeScript en todo
- **Imports relativos claros**: Usar path aliases si se configura más adelante
- **Archivos pequeños**: Un componente por archivo cuando tenga sentido
- **Consistencia**: Seguir estilo existente (lint/format)

## 6. Dependencias propuestas

Instalar según README: React + TypeScript + Tailwind CSS.

Dependencias mínimas sugeridas (solo esquema):

- **Core**: react, react-dom, react-router-dom (para rutas)
- **Estilos**: tailwindcss, postcss, autoprefixer
- **HTTP**: axios (o fetch nativo)
- **Utilidades**: clsx, tailwind-merge (opcionales, evaluar)
- **Icons**: lucide-react (común)
- **Forms**: react-hook-form + zod (para formularios futuros)

**Nota**: No se instalan aún. Se dejará instalación autorizada/documentada.

## 7. Integración con monorepo

- Frontend vive en `/frontend/` (separado de `/backend/`)
- Backend monorepo en `/backend/` con workspaces/services
- Comunicación vía HTTP REST con APIs backend
- Godot (apps/game) independiente, integrado por links/embed según diseño
- Variables env: `.env.local` con `VITE_API_BASE_URL`, etc.

## 8. Próximos pasos (pendientes autorización)

1. Instalar dependencias (tailwindcss, react-router-dom, axios)
2. Configurar Tailwind + PostCSS
3. Configurar rutas base
4. Definir tipos compartidos con backend (cuando contratos definidos)
5. Implementar capa services con tipos

## 9. Notas

- Estructura es **propuesta**. Puede ajustarse con justificación
- Carpeta `documentation/` creada para registro personal
- Scaffold Vite + React + TS creado con configuración mínima
- Tailwind CSS no instalado aún (requeriría postcss.config + tailwind.config) - dejar para autorización
- Sin lógica de negocio implementada

---

**Importante**: Este documento es ESQUEMA. No representa implementación. Seguir norma "no tocar código sin autorización".
