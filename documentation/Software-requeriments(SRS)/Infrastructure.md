# Requisitos de Infraestructura y Despliegue — GearQuest

> **Área:** Infraestructura (entornos, contenedores y publicación)
> **Estado:** Borrador para revisión — proveedor de despliegue **pendiente**
> **Versión:** 1.0 — 2026-10-18
> **Tecnología de referencia:** Docker, Docker Compose; Kubernetes (opcional)
> **Documento base:** `README.MD` (raíz), §5, §10 y §11

---

## 1. Propósito

Describe cómo se **ejecuta, reproduce y publica** el proyecto: desde el entorno de una
persona desarrolladora hasta la demostración pública con HTTPS.

## 2. Contexto en lenguaje sencillo

GearQuest tiene varias piezas (cuatro servicios, una base de datos, un frontend). Para que
funcionen igual en la computadora de cada integrante y en el servidor de producción, se usa
**Docker**: un "empaquetador" que encierra cada pieza con todo lo que necesita para
correr.

- **Docker Compose (desarrollo local):** levanta PostgreSQL y las bases de datos con un
  comando.
- **Producción:** publicar la demostración en un proveedor gratuito o de bajo costo, con
  HTTPS. El proveedor **aún no está seleccionado**.
- **Kubernetes:** opcional. Solo se usará si hay un requisito académico o una justificación
  técnica clara; para el desarrollo local, Compose es suficiente.

## 3. Alcance

| Componente | Ubicación actual | Estado |
| --- | --- | --- |
| Compose de desarrollo (PostgreSQL) | `backend/infra/docker/` | Creado |
| Script de creación de bases | `backend/infra/docker/initdb/` | Creado |
| Contenedores de cada servicio y del frontend | por definir | Pendiente |
| Proveedor de alojamiento | por seleccionar | Pendiente |
| Orquestación (Kubernetes) | opcional | Pendiente |

## 4. Requisitos funcionales

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-INF-01 | Entorno de desarrollo reproducible con un comando | Must | `npm run db:up` levanta PostgreSQL y crea las cuatro bases en cualquier máquina con Docker |
| FR-INF-02 | Configuración por variables de entorno, con plantilla por servicio | Must | Cada servicio tiene su `.env.example`; sin archivos `.env` reales en el repositorio |
| FR-INF-03 | Publicación con HTTPS en el entorno demo | Must | La demostración es accesible por navegador con conexión cifrada |
| FR-INF-04 | Verificación del proveedor antes de elegirlo | Must | Revisados: límites de uso, suspensión por inactividad, persistencia de datos, compatibilidad con contenedores, costos de correo/SMS y compatibilidad con el stack |
| FR-INF-05 | Documentación de ejecución actualizada | Must | Un integrante nuevo levanta el proyecto siguiendo solo los README |
| FR-INF-06 | Kubernetes solo con justificación | Could | Se usa únicamente si un requisito académico o técnico lo exige y queda documentado |

## 5. Requisitos no funcionales

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| NFR-INF-01 | La demostración debe mantenerse disponible entre uno y dos meses | Must | El proveedor elegido sostiene el plazo de la entrega académica |
| NFR-INF-02 | Costos controlados y conocidos | Must | Antes de activar cualquier servicio de pago (especialmente SMS), se calcula el costo |
| NFR-INF-03 | Entornos separados: desarrollo y publicado no comparten base de datos | Must | Un fallo o prueba local no afecta la demostración publicada |
| NFR-INF-04 | Arranque limpio desde cero | Should | Siguiendo la documentación, un equipo nuevo monta todo sin ayuda externa |

## 6. Criterios de aceptación del área

- [ ] `npm run db:up` crea el entorno de datos completo en una máquina limpia.
- [ ] Todos los servicios y el frontend corren en contenedores (o plan para lograrlo).
- [ ] La versión publicada responde por HTTPS y permite la demostración completa.
- [ ] No hay credenciales reales ni configuraciones locales en el repositorio.

## 7. Decisiones pendientes

1. Proveedor de alojamiento y de base de datos de producción.
2. Imágenes Docker de cada servicio y del frontend (Dockerfiles).
3. Estrategia de variables de entorno en producción y gestión de secretos.
4. Monitoreo y registro de errores en el entorno publicado.
5. Procedimiento de copias de seguridad en producción.

## 8. Referencias

- `README.MD` (raíz): §5 (tecnologías), §10 (ejecución), §11 (despliegue).
- `backend/README.md`: comandos `db:up`, `db:down`, `db:logs`.
