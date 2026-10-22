# GearQuest

> **Estado:** Desarrollo
> **Tipo:** Proyecto universitario
> **Equipo:** 4 integrantes (ver abajo)
> **Estructura:** Monorepo

## Integrantes del proyecto

| # | Nombre completo | Rol | Contacto | Código |
| --- | --- | --- | --- | --- |
| 1 | Jessid Alexander Agudelo Herrera | Programador Backend | jessid.agudelo@correounivalle.edu.co | 2478460 |
| 2 | _(pendiente: añadir nombre)_ | _(pendiente: definir rol)_ | _(pendiente)_ | _(pendiente)_ |
| 3 | _(pendiente: añadir nombre)_ | _(pendiente: definir rol)_ | _(pendiente)_ | _(pendiente)_ |
| 4 | _(pendiente: añadir nombre)_ | _(pendiente: definir rol)_ | _(pendiente)_ | _(pendiente)_ |

> **Nota:** el equipo está formado por **4 integrantes**. Los nombres, roles y contactos se
> completarán aquí cuando se confirmen.

### Cómo trabajamos: un rol por integrante

Cada integrante se responsabiliza de un **dominio concreto** del sistema, para poder avanzar
en paralelo sin pisarse (ver [ADR-0001](./documentation/Decisiones.md)). Los roles previstos
son:

| Rol | Dominio | Responsabilidad principal |
| --- | --- | --- |
| **Identidad y usuarios** | `identity-service` | Registro, sesión, perfiles y permisos |
| **Tienda y pedidos** | `store-service` | Catálogo, inventario, carrito, pedidos y descuentos |
| **Juego y economía** | `economy-service` | Monedero, monedas, ruleta, recompensas y sesiones de aventura |
| **Pagos** | `payments-service` | Paquetes, pagos simulados y recargas |

> **Regla del equipo:** cada quien es **dueño** de su dominio (código, pruebas y
> documentación), pero **todos revisan** los cambios de los demás. El reparto de roles se
> asigna a los nombres de la tabla de arriba.

## 1. Descripción

**GearQuest** es una propuesta de tienda web de periféricos para computadores que combina el comercio electrónico con un sistema de recompensas gamificado.

Los usuarios podrán consultar productos y participar en una experiencia de juego con tres componentes: una **aventura** estilo *metroidvania* (explorar laberintos, combatir, derrotar jefes y abrir cofres) de la que se obtienen **monedas**; una **tienda del mercader** dentro del mapa, donde esas monedas se canjean por objetos; y una **ruleta** (el gacha), donde se gastan monedas en tiradas para obtener recompensas. Las monedas permitirán acceder a descuentos, de acuerdo con las reglas de negocio que defina el equipo.

El sistema distinguirá entre monedas obtenidas jugando y monedas adquiridas mediante recargas simuladas. Las monedas ganadas jugando vencerán a los **30 días**, mientras que las monedas compradas no caducarán.

El proyecto tiene fines académicos. Las funcionalidades descritas son objetivos de desarrollo y no implican que ya estén implementadas.

## 2. Objetivos

* Desarrollar una tienda web de periféricos.
* Integrar la experiencia de juego (aventura, mercader y ruleta) con la cuenta del usuario.
* Implementar monedas, vencimientos y descuentos validados en el servidor.
* Separar responsabilidades mediante una arquitectura de microservicios.
* Aplicar buenas prácticas de seguridad, pruebas, control de versiones y documentación.
* Utilizar Docker para facilitar la ejecución de los componentes.
* Evaluar opciones de despliegue web con HTTPS.
* Explorar la detección de comportamientos sospechosos mediante un servicio complementario desarrollado en Python.

## 3. Equipo, planificación y decisiones

### 3.1. Planificación del trabajo

La documentación organiza el trabajo como lo pediría un cliente. Los cinco niveles son:

| Nivel | Qué responde | Dónde está |
| --- | --- | --- |
| **Idea de desarrollo web** | ¿Qué es GearQuest y qué problema resuelve? | §1 de este README |
| **Épicas** | ¿Cuáles son los grandes objetivos? (4 épicas) | [Épicas e historias](documentation/Epicas-e-Historias.md) |
| **Historias de usuario** | ¿Qué necesita cada persona y para qué? (20 historias) | [Épicas e historias](documentation/Epicas-e-Historias.md) |
| **Requisitos funcionales y no funcionales** | ¿Qué debe hacer el sistema y con qué calidad? | [SRS](documentation/Software-requeriments(SRS)/README.md) |
| **Historias técnicas** | ¿Qué trabajo técnico lo habilita? (29 historias) | [Historias técnicas](documentation/Historias-Tecnicas.md) |

**Cierre de una tarea:** antes de dar algo por terminado, se aplica el
[Definition of Done](documentation/Definition-of-Done.md): un checklist verificable de código,
reglas, pruebas, datos, documentación, seguridad e integración.

> **Regla de oro:** lo que no está terminado según el Definition of Done **no está terminado**,
> aunque el código exista. El estado real de cada requisito vive en la
> [matriz de trazabilidad](documentation/Trazabilidad.md).

### 3.2. Decisiones acordadas

* **Nombre:** GearQuest.
* **Equipo:** 4 integrantes.
* **Propósito:** proyecto universitario.
* **Arquitectura prevista:** microservicios.
* **Organización del código:** monorepo.
* **Frontend:** React, TypeScript y Tailwind CSS.
* **Backend:** Node.js, Express y TypeScript.
* **Base de datos:** PostgreSQL (SQL relacional, no NoSQL).
* **ORM:** Prisma.
* **Motor del juego:** Godot 2D con C++.
* **Componentes del juego:** aventura tipo *metroidvania* (mapas, combate y jefes), tienda del mercader en el mapa y ruleta (gacha) para canjear monedas por recompensas.
* **Contenedores:** Docker.
* **Pagos:** simulados, sin procesar dinero real.
* **Monedas:** ganadas jugando y adquiridas mediante recargas simuladas.
* **Caducidad:** las monedas ganadas jugando vencen a los 30 días; las compradas no caducan.
* **Notificaciones previstas:** internas, correo electrónico y SMS.
* **Python:** servicio complementario para analizar patrones sospechosos.
* **Despliegue:** proveedor gratuito o de bajo costo, por seleccionar.
* **Kubernetes:** opcional.

### 3.3. Decisiones pendientes

* Cantidad de monedas necesaria para cada descuento.
* Límites, vigencia y condiciones de uso de los descuentos.
* Orden de consumo de monedas ganadas y compradas.
* Proveedores de correo electrónico y SMS.
* Proveedor de alojamiento y base de datos de producción.
* Validación real de los resultados de la aventura y alcance del análisis antifraude.
* Diseño de los 5 mapas de la aventura, el contenido del mercader y las probabilidades de la ruleta.
* Forma de integrar el juego (Godot) en la tienda: enlace, modal o embebido.
* Dónde se guarda el token de sesión en el navegador (almacenamiento local o cookie `httpOnly`).
* Puerta de entrada única al backend (proxy inverso) frente a cuatro URLs base por servicio.

> **Ya resueltas y aplicadas en el código** (ya no son decisiones abiertas): arquitectura de
> cuatro microservicios con base de datos propia, autenticación por JWT con token de refresco
> rotativo, y herramientas de pruebas, linting y formato (Vitest + Supertest, ESLint y Prettier
> en el backend; Prettier en el frontend). El detalle de cada una está en los ADR de
> [`Decisiones.md`](documentation/Decisiones.md).

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

La experiencia de juego se desarrollará en Godot con C++ y estará integrada con la cuenta del usuario. Se compone de tres partes:

* **Aventura:** un *metroidvania* 2D de dificultad exigente. El jugador recorre **5 mapas tipo laberinto**, cada uno con su jefe final, y combate cuerpo a cuerpo o a distancia según el arma equipada. Derrotar al jefe del nivel 5 (**Rey Demonio**) entrega un arma legendaria única.
* **Tienda del mercader:** zona fija dentro de cada mapa donde el personaje canjea **monedas por objetos** (pociones, armas, armaduras).
* **Ruleta (gacha):** se gastan monedas en **tiradas** con probabilidades a favor de la casa; los premios pueden ser descuentos de un producto, personajes, armas o items raros exclusivos de la ruleta.

Reglas transversales del juego:

* **Muerte:** el personaje pierde todos los items obtenidos en la aventura y conserva solo las monedas.
* **Zonas de descanso ("carga"):** áreas seguras con un **cofre** donde se guarda el inventario entre partidas.
* **Anti-farming:** un enemigo desaparece del mapa tras ser derrotado muchas veces en la misma partida *(implementación diferida)*.

Las funcionalidades previstas son:

* Registro de partidas y recompensas.
* Monedas obtenidas jugando.
* Monedas adquiridas mediante recargas simuladas.
* Vencimiento de las monedas ganadas a los 30 días.
* Conservación de las monedas compradas sin fecha de vencimiento.
* Historial de movimientos para registrar ganancias, consumos y vencimientos.
* Inventario del jugador (armas, armaduras y pociones) con su rareza.

El servidor será la fuente de verdad para los saldos. El cliente del juego no podrá decidir por sí solo cuántas monedas recibe el usuario.

> El detalle completo de la experiencia de juego está en el
> [SRS del componente de juego](documentation/Software-requeriments\(SRS\)/Game.md), que es la
> **fuente de verdad** del alcance del juego.

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
| Juego                 | Godot 2D + C++                    | Experiencia de juego (aventura, mercader y ruleta) |
| Análisis de seguridad | Python + FastAPI                  | Análisis complementario de eventos sospechosos |
| Contenedores          | Docker                            | Entornos reproducibles                         |
| Orquestación          | Kubernetes (opcional)             | Orquestación de contenedores, si se justifica  |
| Alojamiento           | Por seleccionar                   | Publicación temporal con HTTPS                 |

PostgreSQL es un gestor de bases de datos relacional (SQL). El proyecto no utiliza bases de datos NoSQL.

Las tecnologías indicadas corresponden a decisiones y propuestas actuales. Esto no significa que todos los componentes estén construidos o configurados.

## 6. Arquitectura prevista

GearQuest se organizará como un monorepo con aplicaciones y servicios separados por responsabilidad.

La distribución definitiva se establecerá mediante el diseño de alto y bajo nivel, los casos de uso y los contratos de las API.

### Dominios funcionales candidatos

* **Autenticación y usuarios:** registro, acceso y permisos.
* **Catálogo y pedidos:** productos, inventario, carrito y pedidos.
* **Juego y recompensas:** sesiones de aventura, validación de resultados, ruleta y movimientos de monedas.
* **Descuentos:** reglas, elegibilidad y canjes.
* **Notificaciones:** avisos internos, correo y SMS.
* **Análisis de seguridad:** evaluación complementaria de patrones sospechosos.

La intención es utilizar una arquitectura de microservicios, pero cada servicio deberá tener una responsabilidad clara y una interfaz definida.

Se evitará dividir el sistema en servicios pequeños sin una justificación técnica.

PostgreSQL será la base de datos relacional prevista. La propiedad de los datos y la comunicación entre servicios se definirán durante el diseño.

Los servicios no deberán modificar arbitrariamente las tablas internas de otros servicios. La comunicación deberá seguir contratos explícitos.

### 6.1. Estructura del monorepo

La siguiente estructura corresponde al estado actual del repositorio y refleja la organización por aplicaciones y por servicios de dominio:

```text
Tienda_online_gacha/                # Raíz del monorepo (proyecto GearQuest)
├── backend/                        # Monorepo backend (Node.js + TypeScript, npm workspaces)
│   ├── services/
│   │   ├── identity-service/       # Autenticación y usuarios                  (puerto 3001)
│   │   │   ├── prisma/schema.prisma
│   │   │   ├── src/{config,db,modules/{auth,health,users}}/
│   │   │   └── tests/
│   │   ├── store-service/          # Catálogo, inventario, pedidos y descuentos (3002)
│   │   │   ├── prisma/schema.prisma
│   │   │   ├── src/{config,db,shared,modules/{catalog,discounts,health,inventory,orders}}/
│   │   │   └── tests/
│   │   ├── economy-service/        # Monedero, ruleta, inventario y recompensas (3003)
│   │   │   ├── prisma/schema.prisma
│   │   │   ├── src/{config,db,modules/{gacha,health,player-inventory,rewards,transactions,wallet}}/
│   │   │   └── src/tests/
│   │   └── payments-service/       # Pagos y recargas simuladas             (3004)
│   │       ├── prisma/schema.prisma
│   │       ├── src/{config,db,shared,modules/{health,payments}}/
│   │       └── tests/
│   ├── packages/
│   │   └── common/                 # Código y utilidades compartidas (@gearquest/common)
│   ├── infra/docker/               # docker-compose.yml e initdb/ para PostgreSQL local
│   ├── documentation_Backend/      # Documentación del backend
│   ├── package.json                # Raíz del workspace (workspaces y tooling)
│   ├── tsconfig.base.json
│   └── vitest.config.ts
├── frontend/                       # Frontend React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── app/{providers,router}/ # Configuración de app, providers y rutas
│   │   ├── assets/                 # Imágenes, íconos y fuentes
│   │   ├── components/{ui,shared}/ # Componentes reutilizables
│   │   ├── config/                 # Configuración y constantes
│   │   ├── features/               # Módulos por dominio
│   │   │   └── {auth,cart,catalog,discounts,game-integration,orders,profile,wallet}/
│   │   ├── hooks/                  # Hooks reutilizables
│   │   ├── layouts/                # Layouts de la aplicación
│   │   ├── lib/                    # Utilidades, helpers y cliente HTTP
│   │   ├── pages/                  # Vistas de nivel superior
│   │   ├── routes/                 # Definición de rutas
│   │   ├── services/               # Capa de acceso a la API
│   │   ├── store/                  # Estado global
│   │   ├── types/                  # Tipos TypeScript compartidos
│   │   ├── utils/                  # Funciones puras
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── documentation/              # Esquema de arquitectura y documentación personal
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig*.json
│   └── vite.config.ts
├── GAME/                           # Proyecto Godot (C++): aventura, mercader y ruleta (no existe aún — reservada)
├── DataBase/                       # Recursos y scripts de base de datos       (no existe aún — reservada)
├── documentation/                  # Documentación del proyecto (ver §14)
│   ├── README.md                   #   Índice maestro de toda la documentación
│   ├── Software-requeriments(SRS)/ #   Requisitos funcionales y no funcionales
│   ├── Casos-de-Uso/               #   Casos de uso (UC-*)
│   ├── API/                        #   Contrato OpenAPI 3.1 + guía de la API
│   ├── diagramas de flujo/         #   9 diagramas SVG (flujos, arquitectura, secuencias, estados, modelo de datos)
│   ├── Trazabilidad.md             #   Estado real de cada requisito
│   └── ...                         #   Decisiones, glosario, pruebas, despliegue, changelog, etc.
└── README.MD                       # Documentación principal del proyecto
```

Las carpetas de estructura y configuración ya existen. El backend **ya tiene implementados sus módulos de aplicación** (`src/modules/*`: identidad, catálogo, inventario, carrito, pedidos, descuentos, monedero, ruleta, recompensas, pagos) y el frontend tiene sus 9 páginas de interfaz, aunque **todavía sin conectar al backend** (0 llamadas HTTP). El estado exacto de cada requisito vive en la [matriz de trazabilidad](documentation/Trazabilidad.md). Por su parte, `GAME/` y `DataBase/` **todavía no existen en el repositorio**: están reservadas para el proyecto de Godot y los recursos de base de datos, respectivamente, y se crearán y poblarán durante el desarrollo.

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

Para facilitar el trabajo entre los cuatro integrantes, se propone:

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

### Puesta en marcha completa

Para levantar **todo el sistema** (base de datos, los 4 servicios y el frontend) paso a paso, con la explicación de cada comando y la verificación de que quedó funcionando, ver la [Guía de instalación](documentation/Guia-de-Instalacion.md).

El proyecto de Godot se ubica en `GAME/` y los recursos de base de datos en `DataBase/`. La estructura interna de ambos componentes y la del servicio Python de análisis se detallarán cuando se implementen.

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

* GearQuest es un proyecto académico en etapa de desarrollo: el backend opera con datos reales y el frontend está en fase de interfaz.
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

## 14. Documentación

Toda la documentación del proyecto vive en la carpeta [`documentation/`](documentation/), y su punto de entrada es el **índice maestro**: [`documentation/README.md`](documentation/README.md). Ese índice explica en qué orden leer y qué contiene cada documento.

### Documentos principales

| Documento | Para qué sirve |
| --- | --- |
| [Índice maestro](documentation/README.md) | Mapa de toda la documentación y por dónde empezar |
| [Épicas e historias de usuario](documentation/Epicas-e-Historias.md) | Los 4 grandes objetivos del proyecto y las 20 historias de usuario |
| [Historias técnicas](documentation/Historias-Tecnicas.md) | El trabajo técnico que habilita las historias (integración, pruebas, infraestructura) |
| [Definition of Done](documentation/Definition-of-Done.md) | Cuándo una tarea está **realmente** terminada (checklist verificable) |
| [Guía de instalación](documentation/Guia-de-Instalacion.md) | Levantar el proyecto completo en local, paso a paso |
| [SRS (requisitos)](documentation/Software-requeriments(SRS)/README.md) | Qué debe hacer el sistema (requisitos funcionales y no funcionales) |
| [Casos de uso](documentation/Casos-de-Uso/README.md) | Los flujos de uso desde la perspectiva del usuario (UC-*) |
| [Contrato de la API](documentation/API/README.md) | Endpoints y esquemas (`openapi.yaml`, fuente de verdad) |
| [Diccionario de datos](documentation/Diccionario-de-Datos.md) | Modelo de datos por servicio (26 modelos Prisma) |
| [Trazabilidad](documentation/Trazabilidad.md) | **Estado real** de cada requisito: hecho, parcial o pendiente |
| [Decisiones (ADR)](documentation/Decisiones.md) | Por qué se tomó cada decisión técnica |
| [Glosario](documentation/Glosario.md) | Vocabulario del proyecto explicado |
| [Estrategia de pruebas](documentation/Estrategia-de-Pruebas.md) | Enfoque de pruebas y reglas críticas a cubrir |
| [Manual de usuario](documentation/Manual-de-Usuario.md) | Cómo se usa el sistema, pantalla por pantalla |
| [Guía de despliegue](documentation/Despliegue.md) | Cómo se publicaría el proyecto |
| [Política de seguridad documental](documentation/Politica-de-Seguridad-Documental.md) | Qué se puede publicar y qué no |
| [Cómo contribuir](documentation/CONTRIBUTING.md) | Ramas, commits, flujo de PR y checklist de revisión |
| [Changelog](documentation/CHANGELOG.md) | Historial de cambios por versión |

### Regla de oro

> La documentación **refleja el estado real** del proyecto. Lo que todavía no está
> implementado se marca como *pendiente*; no se documenta como terminado. La
> [matriz de trazabilidad](documentation/Trazabilidad.md) es la fuente de verdad sobre
> qué está hecho y qué no.

---

**Mantenimiento:** actualizar este README cuando se confirmen decisiones o cambie el comportamiento del proyecto. La documentación debe reflejar el estado real del código y distinguir claramente entre funcionalidades implementadas, en progreso y planificadas.
