# Especificación de Requisitos de Software (SRS) — GearQuest

> **Proyecto:** GearQuest — tienda de periféricos con sistema de recompensas gamificado
> **Estado:** Borrador para revisión por el equipo
> **Versión:** 1.0
> **Fecha:** 2026-10-18
> **Fuentes:** `README.MD` (raíz), `backend/README.md`, `frontend/ReadmeFrontEnd.md`,
> `frontend/documentation/FRONTEND_ARCHITECTURE.md`

---

## 1. ¿Qué es este documento?

Este carpeta reúne la **Especificación de Requisitos de Software (SRS)** de GearQuest: un
conjunto de documentos que describen **qué debe hacer el sistema**, con **qué calidad** y
bajo **qué restricciones**.

Es la referencia acordada **antes de escribir código**. Si hay duda sobre lo que una
funcionalidad debe hacer, primero se consulta aquí; si el documento no lo contempla, se
actualiza y luego se implementa.

## 2. ¿Para quién es?

| Lector | Qué encontrará aquí |
| --- | --- |
| Equipo de desarrollo | Qué construir, con qué prioridad y cómo validar que está bien hecho |
| Docentes / evaluadores | Alcance, decisiones técnicas y criterios de aceptación del proyecto |
| Persona sin perfil técnico | Explicaciones en lenguaje sencillo de cada área del sistema |

> **Nota de honestidad (actualizada 2026-10-19):** el proyecto **ya tiene lógica de negocio
> implementada** en backend (identidad, tienda, economía, pagos y seguridad base operan con
> datos reales), mientras que frontend, juego e infraestructura de despliegue siguen en
> fases iniciales. Para saber **qué está hecho, qué está a medias y qué no ha empezado
> requisito a requisito**, consulta la [**Matriz de trazabilidad**](../Trazabilidad.md):
> es la fuente de verdad del estado real y se actualiza en el mismo PR que toca el código.

## 3. Cómo leer los requisitos

Cada requisito tiene un código único para poder referenciarlo en reuniones, commits y
pruebas:

```text
FR-BE-01          NFR-DB-02
│  │   │          │  │   │
│  │   └──────────│──│───└── Número correlativo (01, 02, …)
│  │              │  └────── Área (BE, DB, FE, …)
│  └──────────────┘───────── Tipo: FR = funcional · NFR = no funcional
└─────────────────────────── Prefijo fijo del esquema de requisitos
```

- **Requisito funcional (FR):** *qué* debe hacer el sistema (una acción observable).
- **Requisito no funcional (NFR):** *cómo* debe ser el sistema (calidad, seguridad, rendimiento).

**Prioridades (notación MoSCoW):**

| Prioridad | Significado |
| --- | --- |
| **Must** | Imprescindible. Sin esto, la versión académica no se considera completa |
| **Should** | Importante. Se espera incluirlo; solo se pospone con justificación |
| **Could** | Deseable. Se incluye si alcanza el tiempo |

## 4. Índice de documentos

| Documento | Área | Contenido |
| --- | --- | --- |
| [`Backend.md`](./Backend.md) | Servidor | Servicios, API, reglas de negocio del servidor y calidad del código |
| [`Frontend.md`](./Frontend.md) | Interfaz web | Pantallas, experiencia de uso y comunicación con la API |
| [`Database.md`](./Database.md) | Bases de datos | PostgreSQL, Prisma, modelos, migraciones e integridad de datos |
| [`Game.md`](./Game.md) | Juego (Godot) | Minijuego, ruta gacha e integración con la cuenta de usuario |
| [`Business-Rules.md`](./Business-Rules.md) | Reglas de negocio | Monedas, vencimientos, descuentos, recargas y pedidos |
| [`Security.md`](./Security.md) | Seguridad | Autenticación, protección de datos e integridad de monedas |
| [`Infrastructure.md`](./Infrastructure.md) | Infraestructura | Docker, entornos, despliegue y publicación con HTTPS |
| [`Notifications.md`](./Notifications.md) | Notificaciones | Avisos internos, correo electrónico y SMS |

## 5. Visión general del sistema

```text
   ┌──────────────┐        ┌──────────────────────────────────────────┐
   │  Navegador   │  HTTP  │  Backend (Node.js + Express + TS)        │
   │  (Frontend)  │ ─────▶ │  identity · store · economy · payments   │
   └──────────────┘        └───────────────┬──────────────────────────┘
                                           │ Prisma ORM
   ┌──────────────┐        ┌───────────────▼──────────────────────────┐
   │ Juego (Godot)│ ─────▶ │  PostgreSQL (una base por servicio)      │
   └──────────────┘        └──────────────────────────────────────────┘

   Servicio Python (FastAPI) — análisis de patrones sospechosos: complemento futuro.
```

**En una frase:** el frontend y el juego *preguntan*; el backend *decide* (precios, saldos,
descuentos y permisos siempre se validan en el servidor).

## 6. Alcance y límites actuales

- ✅ Estructura de monorepo creada (frontend, backend, documentación).
- ✅ Backend implementado en gran medida: 65 endpoints en 4 servicios con sus migraciones
  y datos de prueba (ver [Matriz de trazabilidad](../Trazabilidad.md) §3-§5).
- ⚠️ Frontend: UI base con 9 páginas, **sin conectar al backend** (0 llamadas HTTP).
- ⬜ Juego (Godot) y servicio Python: pendientes de inicio.
- ⚠️ Compras y recargas son **simuladas**: no se procesa dinero real.
- ⚠️ Decisiones abiertas (reglas de canje, proveedores, despliegue) se listan en cada
  documento, en la sección *Decisiones pendientes*; el estado real de cada requisito,
  en la [Matriz de trazabilidad](../Trazabilidad.md).

## 7. Glosario

| Término | Significado sencillo |
| --- | --- |
| **API** | Conjunto de reglas que permiten que dos programas se comuniquen (aquí, por HTTP) |
| **Backend** | El "cerebro" del sistema: vive en el servidor y valida todas las reglas |
| **Frontend** | Lo que la persona ve y usa en el navegador |
| **Gacha** | Modalidad de juego estilo maquinita: se gastan monedas en tiradas para obtener recompensas |
| **Microservicio** | Aplicación pequeña e independiente con una responsabilidad clara |
| **Moneda ganada** | Moneda obtenida jugando; vence a los 30 días |
| **Moneda comprada** | Moneda adquirida por recarga simulada; no vence |
| **ORM** | Herramienta que permite trabajar con la base de datos desde código (aquí, Prisma) |
| **PostgreSQL** | Sistema de gestión de bases de datos relacional (SQL) que usa el proyecto |
| **SRS** | Este documento: especificación de requisitos de software |
| **Requisito** | Aquello que el sistema debe cumplir, descrito de forma verificable |

## 8. Mantenimiento de estos documentos

1. Toda decisión que cambie un requisito se refleja aquí **el mismo día**.
2. Se actualiza la versión y la fecha del documento afectado.
3. Se distingue siempre entre requisito **implementado**, **en progreso** y **planificado**.
4. Los requisitos no se dan por cumplidos hasta que existan en el código y estén probados.

---

*Documento vivo. Su propósito es que todo el equipo —técnico o no— hable el mismo idioma.*
