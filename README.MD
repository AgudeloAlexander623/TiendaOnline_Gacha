# GearQuest

> **Estado:** Planificación
> **Tipo:** Proyecto universitario
> **Equipo:** 3 integrantes
> **Estructura:** Monorepo

## 1. Descripción

**GearQuest** es una propuesta de tienda web de periféricos para computadores que combina el comercio electrónico con un sistema de recompensas gamificado.

Los usuarios podrán consultar productos y jugar un minijuego 2D para obtener monedas virtuales que podrán utilizar para acceder a descuentos, de acuerdo con las reglas de negocio que defina el equipo.

El sistema distinguirá entre monedas obtenidas jugando y monedas adquiridas mediante recargas simuladas. Las monedas ganadas jugando vencerán a los **30 días**, mientras que las monedas compradas no caducarán.

El proyecto tiene fines académicos. Las funcionalidades descritas son objetivos de desarrollo y no implican que ya estén implementadas.

## 2. Objetivos

* Desarrollar una tienda web de periféricos.
* Integrar un minijuego 2D con la cuenta del usuario.
* Implementar monedas, vencimientos y descuentos validados en el servidor.
* Separar responsabilidades mediante una arquitectura de microservicios.
* Aplicar buenas prácticas de seguridad, pruebas, control de versiones y documentación.
* Utilizar Docker para facilitar la ejecución de los componentes.
* Evaluar opciones de despliegue web con HTTPS.
* Explorar la detección de comportamientos sospechosos mediante un servicio complementario desarrollado en Python.

## 3. Estado de las decisiones

### Decisiones acordadas

* **Nombre:** GearQuest.
* **Equipo:** 3 integrantes.
* **Propósito:** proyecto universitario.
* **Arquitectura prevista:** microservicios.
* **Organización del código:** monorepo.
* **Frontend:** React, TypeScript y Tailwind CSS.
* **Backend:** Node.js, Express y TypeScript.
* **Base de datos:** PostgreSQL.
* **ORM:** Prisma.
* **Motor del juego:** Godot 2D con C#.
* **Contenedores:** Docker.
* **Pagos:** simulados, sin procesar dinero real.
* **Monedas:** ganadas jugando y adquiridas mediante recargas simuladas.
* **Caducidad:** las monedas ganadas jugando vencen a los 30 días; las compradas no caducan.
* **Notificaciones previstas:** internas, correo electrónico y SMS.
* **Python:** servicio complementario para analizar patrones sospechosos.
* **Despliegue:** proveedor gratuito o de bajo costo, por seleccionar.
* **Kubernetes:** opcional.

### Decisiones pendientes

* Cantidad de monedas necesaria para cada descuento.
* Límites, vigencia y condiciones de uso de los descuentos.
* Orden de consumo de monedas ganadas y compradas.
* Diseño definitivo de los microservicios y sus responsabilidades.
* Estrategia de autenticación y gestión de sesiones o tokens.
* Proveedores de correo electrónico y SMS.
* Proveedor de alojamiento y base de datos de producción.
* Validación de resultados del juego y alcance del análisis antifraude.
* Alcance definitivo del catálogo, carrito, pedidos y administración.
* Herramientas de pruebas, linting y formato de código.

## 4. Funcionalidades previstas

### 4.1. Tienda online

Se prevé desarrollar las siguientes funcionalidades:

* Catálogo de periféricos con descripción, precio, imágenes y disponibilidad.
* Vista detallada de los productos.
* Registro e inicio de sesión.
* Carrito de compras.
* Creación y consulta de pedidos.
* Administración de productos e inventario mediante usuarios autorizados.

### 4.2. Juego y sistema de monedas

El minijuego se desarrollará en Godot con C# y estará integrado con la cuenta del usuario.

Las funcionalidades previstas son:

* Partidas con duración definida.
* Registro de resultados y recompensas.
* Monedas obtenidas jugando.
* Monedas adquiridas mediante recargas simuladas.
* Vencimiento de las monedas ganadas a los 30 días.
* Conservación de las monedas compradas sin fecha de vencimiento.
* Historial de movimientos para registrar ganancias, consumos y vencimientos.

El servidor será la fuente de verdad para los saldos. El cliente del juego no podrá decidir por sí solo cuántas monedas recibe el usuario.

### 4.3. Sistema de descuentos

Se propone ofrecer cinco niveles de descuento:

| Nivel   | Descuento |
| ------- | --------: |
| Nivel 1 |      10 % |
| Nivel 2 |      30 % |
| Nivel 3 |      50 % |
| Nivel 4 |      70 % |
| Nivel 5 |      90 % |

Las cantidades de monedas necesarias y las condiciones de canje todavía están por definir.

Antes de aplicar un descuento, el backend deberá comprobar la elegibilidad, el saldo disponible, los vencimientos y los límites acordados.

El frontend no podrá determinar por su cuenta el porcentaje aplicado ni el precio final.

### 4.4. Recargas simuladas

Las recargas serán simulaciones académicas. No se procesará dinero real ni se solicitarán datos de tarjetas bancarias.

La aplicación deberá identificar claramente que se trata de una operación simulada.

### 4.5. Notificaciones

Se prevé implementar notificaciones internas y evaluar el envío de mensajes por correo electrónico y SMS.

Los avisos podrán informar sobre:

* Monedas obtenidas.
* Próximo vencimiento de monedas.
* Monedas que hayan expirado.
* Descuentos disponibles.
* Confirmaciones de operaciones relevantes.

La integración dependerá de la selección y configuración de los proveedores. Los costos de SMS deberán revisarse antes de habilitar este canal.

## 5. Tecnologías propuestas

| Área                  | Tecnología                        | Responsabilidad                                |
| --------------------- | --------------------------------- | ---------------------------------------------- |
| Frontend              | React + TypeScript + Tailwind CSS | Interfaz web                                   |
| Backend               | Node.js + Express + TypeScript    | API y reglas de negocio                        |
| Base de datos         | PostgreSQL                        | Persistencia relacional                        |
| Acceso a datos        | Prisma ORM                        | Consultas y migraciones                        |
| Minijuego             | Godot 2D + C#                     | Experiencia de juego                           |
| Análisis de seguridad | Python + FastAPI                  | Análisis complementario de eventos sospechosos |
| Contenedores          | Docker                            | Entornos reproducibles                         |
| Orquestación          | Kubernetes (opcional)             | Orquestación de contenedores, si se justifica  |
| Alojamiento           | Por seleccionar                   | Publicación temporal con HTTPS                 |

PostgreSQL es una base de datos relacional SQL.

Las tecnologías indicadas corresponden a decisiones y propuestas actuales. Esto no significa que todos los componentes estén construidos o configurados.

## 6. Arquitectura prevista

GearQuest se organizará como un monorepo con aplicaciones y servicios separados por responsabilidad.

La distribución definitiva se establecerá mediante el diseño de alto y bajo nivel, los casos de uso y los contratos de las API.

### Dominios funcionales candidatos

* **Autenticación y usuarios:** registro, acceso y permisos.
* **Catálogo y pedidos:** productos, inventario, carrito y pedidos.
* **Juego y recompensas:** sesiones de juego, validación de resultados y movimientos de monedas.
* **Descuentos:** reglas, elegibilidad y canjes.
* **Notificaciones:** avisos internos, correo y SMS.
* **Análisis de seguridad:** evaluación complementaria de patrones sospechosos.

La intención es utilizar una arquitectura de microservicios, pero cada servicio deberá tener una responsabilidad clara y una interfaz definida.

Se evitará dividir el sistema en servicios pequeños sin una justificación técnica.

PostgreSQL será la base de datos relacional prevista. La propiedad de los datos y la comunicación entre servicios se definirán durante el diseño.

Los servicios no deberán modificar arbitrariamente las tablas internas de otros servicios. La comunicación deberá seguir contratos explícitos.

### 6.1. Estructura propuesta del monorepo

La siguiente estructura es orientativa y podrá modificarse cuando se cree el repositorio:

```text
GearQuest/
├── frontend/                # Frontend React + TS + Vite + Tailwind (estructura base)
├── backend/                 # Monorepo backend (Node/TS, services, packages)
├── apps/
│   └── game/                # Proyecto Godot
├── services/                # Servicios adicionales (si se requiere fuera de backend)
├── packages/
│   └── shared/              # Contratos o utilidades realmente compartidos
├── infrastructure/
│   └── docker/
├── docs/
├── documentation/           # Documentación general del proyecto
├── .env.example
├── .gitignore
└── README.md
```

Esta estructura es una propuesta, no una descripción de archivos que ya existan.

Los servicios opcionales se crearán únicamente cuando el equipo confirme su necesidad. La configuración de Docker Compose, las herramientas del monorepo y los comandos de ejecución se documentarán cuando se hayan seleccionado.

## 7. Seguridad y buenas prácticas

La seguridad deberá implementarse en las aplicaciones y servicios que procesan los datos.

Un servicio Python complementario no sustituirá la validación ni los controles de acceso del backend principal.

### Medidas previstas

* Almacenar contraseñas mediante un algoritmo de hash adecuado, como Argon2id o bcrypt.
* Implementar autenticación y autorización verificadas en el servidor.
* Validar entradas y esquemas de datos en las API.
* Aplicar límites de solicitudes cuando corresponda.
* Configurar correctamente CORS y las cabeceras HTTP.
* Utilizar HTTPS en el entorno publicado.
* Guardar secretos en variables de entorno o en un gestor de secretos.
* No subir credenciales al repositorio.
* Utilizar Prisma de forma segura y validar permisos en operaciones sensibles.
* Manejar errores sin exponer información interna innecesaria.
* Evitar registrar contraseñas, tokens u otros datos sensibles.
* Probar las reglas críticas y revisar las dependencias antes del despliegue.

### 7.1. Integridad de monedas y descuentos

* El cliente no podrá enviar un saldo para que el servidor lo acepte sin validación.
* El servidor validará los resultados de las partidas antes de otorgar monedas.
* Las operaciones que actualicen saldos y canjeen descuentos deberán contemplar concurrencia y solicitudes repetidas.
* Los movimientos se conservarán en un historial auditable.
* Un vencimiento o consumo no deberá borrar el registro original de la transacción.
* El servidor calculará el saldo disponible teniendo en cuenta el tipo de moneda y su vencimiento.
* Las reglas de descuentos, topes y elegibilidad se aplicarán en el backend.
* El análisis de comportamiento sospechoso será una medida complementaria, no la única defensa contra el abuso.

Estas medidas son objetivos de implementación, no una certificación de que el sistema ya sea seguro.

## 8. Calidad y colaboración

Para facilitar el trabajo entre los tres integrantes, se propone:

* Utilizar Git y un repositorio compartido.
* Crear ramas específicas para cambios acotados.
* Revisar los cambios antes de integrarlos en la rama principal.
* Mantener commits claros y relacionados con una tarea.
* Acordar convenciones de nombres, formato y linting.
* Escribir pruebas para las reglas de negocio críticas.
* Versionar las migraciones de la base de datos.
* Mantener un archivo `.env.example` con ejemplos ficticios, nunca secretos reales.
* Documentar decisiones técnicas y cambios en los contratos API.
* No subir credenciales, datos personales reales, configuraciones locales ni artefactos de compilación innecesarios.

Las herramientas concretas de pruebas, formato, linting y gestión del monorepo se elegirán durante la configuración inicial.

## 9. Plan de trabajo inicial

1. **Requisitos y diseño:** definir casos de uso, reglas de descuentos, vencimientos y modelo de datos.
2. **Base técnica:** crear el monorepo y configurar TypeScript, PostgreSQL, Prisma y el entorno de desarrollo.
3. **Tienda mínima:** implementar y probar las funciones prioritarias del catálogo y la compra simulada.
4. **Recompensas:** integrar el juego con el backend, validar resultados, registrar monedas y gestionar vencimientos.
5. **Descuentos y notificaciones:** implementar las reglas de canje y los canales seleccionados.
6. **Seguridad y pruebas:** probar permisos, abuso de recompensas, concurrencia y vencimientos.
7. **Contenedores y despliegue:** preparar Docker, elegir el alojamiento, habilitar HTTPS y verificar el entorno publicado.
8. **Documentación final:** actualizar diagramas, instrucciones y decisiones para reflejar el código real.

El orden y la profundidad de las fases se ajustarán al tiempo disponible. Se priorizará una versión mínima funcional antes de incorporar mejoras opcionales.

## 10. Ejecución y configuración

### Frontend (React + Vite + Tailwind)

**Ubicación:** `frontend/`

```bash
# Instalar dependencias
cd frontend
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview
```

**Documentación arquitectura frontend:** [frontend/documentation/FRONTEND_ARCHITECTURE.md](frontend/documentation/FRONTEND_ARCHITECTURE.md)

### Backend (Monorepo Node/TS)

Ver [backend/README.md](backend/README.md) para detalles de instalación, migraciones, servicios y Docker.

Resto pendiente de confirmar estructura definitiva para otros componentes (Godot, servicios Python).

## 11. Despliegue

El objetivo es publicar una versión demostrable durante aproximadamente uno o dos meses, utilizando un proveedor gratuito o de bajo costo y HTTPS.

El proveedor todavía no está seleccionado.

Antes de elegirlo, el equipo deberá verificar:

* Límites de uso y recursos disponibles.
* Suspensión por inactividad.
* Persistencia de datos.
* Compatibilidad con contenedores.
* Costos potenciales del correo electrónico y los SMS.
* Compatibilidad con las tecnologías seleccionadas.

Un plan gratuito no debe asumirse como permanente ni como garantía de disponibilidad.

Kubernetes es opcional. Para el desarrollo local, Docker Compose puede ser suficiente. Kubernetes se evaluará si existe un requisito académico o una justificación técnica clara.

## 12. Alcance y limitaciones actuales

* GearQuest es un proyecto académico en etapa de planificación.
* Las compras y recargas se simularán; no se procesará dinero real.
* Las reglas definitivas de descuentos están pendientes.
* Las integraciones de correo y SMS dependen de proveedores y de su costo.
* El alojamiento y la arquitectura de despliegue están pendientes de selección.
* La lista final de microservicios, sus contratos y la propiedad de los datos deben concretarse durante el diseño.
* Las funcionalidades descritas no se consideran implementadas hasta que existan en el código y se hayan probado.

## 13. Contribuciones

1. Coordinar el alcance y la tarea con el equipo.
2. Trabajar en una rama enfocada en un cambio.
3. Mantener cambios pequeños y legibles.
4. Ejecutar las pruebas aplicables antes de solicitar revisión.
5. Documentar decisiones que afecten a otros servicios o al modelo de datos.
6. No incluir secretos ni información real sensible en el repositorio.

---

**Mantenimiento:** actualizar este README cuando se confirmen decisiones o cambie el comportamiento del proyecto. La documentación debe reflejar el estado real del código y distinguir claramente entre funcionalidades implementadas, en progreso y planificadas.
