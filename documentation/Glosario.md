# Glosario — GearQuest

> **Para quién es esto:** para quien lee la documentación y se topa con una palabra que
> suena a idioma extranjero. Aquí se explica **en lenguaje sencillo**, sin asumir que ya
> sabes programar.
>
> **Cómo usarlo:** busca el término en el índice. Si aparece un término dentro de otra
> definición y no lo conoces, salta a él.

---

## 1. Índice por tipo

- [1.1 Términos del negocio de GearQuest](#11-términos-del-negocio-de-gearquest)
- [1.2 Términos de desarrollo web](#12-términos-de-desarrollo-web)
- [1.3 Términos de bases de datos](#13-términos-de-bases-de-datos)
- [1.4 Términos del juego](#14-términos-del-juego)
- [1.5 Términos de proceso y equipo](#15-términos-de-proceso-y-equipo)

---

## 1.1 Términos del negocio de GearQuest

### Gacha

Sistema de recompensas **aleatorias** inspirado en las máquinas «gachapón» japonesas:
pagas una **tirada** y recibes un premio al azar. En GearQuest, cada tirada cuesta
**monedas** y puede o no dar un premio (según probabilidades definidas por el sistema,
no por el jugador).

### Tirada (*pull*)

Cada **intento** de obtener un premio en el gacha. Se registra en el historial
(`GachaPull`) para poder auditar qué pasó y cuándo. Una tirada consume monedas, aunque no
se gane nada.

### Moneda

La **divisa virtual** de GearQuest. No es dinero real: sirve para jugar al gacha y
obtener descuentos. Hay dos tipos, y esto es **clave**:

| Tipo | Cómo se obtiene | ¿Vence? |
| --- | --- | --- |
| **Ganada** (*EARNED*) | Jugando el minijuego | **Sí**, a los 30 días |
| **Comprada** (*PURCHASED*) | Mediante una recarga (simulada) | **No** vence |

### Lote de monedas (*CoinBatch*)

Cuando consigues monedas, no se suman a un número «flotante»: se guardan como un **lote
aparte** con su origen y su fecha de vencimiento. El **saldo** es la suma de los lotes
válidos. Guardar por lotes permite saber **qué monedas vencen** y cuáles no.

### Saldo (*balance*)

El total de monedas **disponibles** para gastar, calculado por el servidor sumando los
lotes que aún no vencieron. El saldo **no** se guarda como un número fijo: se **deriva**.

### Descuento (*discount*)

Beneficio sobre el precio de un producto. En GearQuest se desbloquea con monedas. Los
**niveles** de descuento (1 a 5, por ejemplo) y sus condiciones **aún están por definir**
en detalle; ver [`Decisiones pendientes`](../README.MD).

### Recarga (*recharge*)

Acción de **comprar** monedas. En GearQuest es **simulada**: no se procesa dinero real ni
se piden datos de tarjeta. Sirve para practicar todo el flujo de pago de forma segura.

### Minijuego

Juego sencillo donde el usuario **gana monedas**. El puntaje se envía al servidor, que
decide cuántas monedas otorgar. El juego real (Godot) **aún no está implementado**.

---

## 1.2 Términos de desarrollo web

### Frontend

La parte que **ve el usuario** en el navegador: botones, páginas, formularios. En GearQuest
está en `frontend/`, hecho con React.

### Backend

La parte que **no se ve**: las reglas, los datos y las decisiones. Aquí viven los precios,
el saldo de monedas y los permisos. En GearQuest está en `backend/`, repartido en 4
**microservicios**.

### API

*Application Programming Interface* (interfaz de programación). Es el **conjunto de peticiones**
que un programa puede hacerle a otro: «dame el catálogo», «cobra estas monedas». El
frontend no toca la base de datos: le **pide** cosas a la API del backend.

### Endpoint

Cada **dirección concreta** de la API a la que se le puede pedir algo. Por ejemplo,
`GET /products` es un endpoint que devuelve la lista de productos. GearQuest tiene 65
endpoints (57 de negocio + 8 de salud).

### Contrato de API

El **documento que describe** exactamente qué peticiones existen y qué responden. Es como
el menú de un restaurante: sabes qué puedes pedir y qué esperar, sin entrar a la cocina.
En GearQuest está en [`API/openapi.yaml`](./API/openapi.yaml). Explicación completa en
[`API/README.md`](./API/README.md).

### Microservicio

Un **programa pequeño e independiente** que se encarga de **una** parte del sistema. En
lugar de un backend gigante, hay varios servicios que se reparten el trabajo. GearQuest
tiene 4: identidad, tienda, economía y pagos.

### Monorepo

Un **solo repositorio** de Git que contiene **varios** proyectos (aquí, los 4 servicios +
el frontend + la documentación). Se clona y se instala todo junto, pero cada parte sigue
siendo independiente.

### Frontend vs Backend vs Base de datos (modelo mental)

Piensa en un restaurante:

- **Frontend:** la sala, donde el cliente pide.
- **Backend:** la cocina, donde se prepara y se decide.
- **Base de datos:** la despensa, donde se guardan los ingredientes.

El cliente nunca entra a la despensa: pide en la sala y la cocina decide.

### Variable de entorno (*environment variable*)

Un valor de configuración que el programa lee al arrancar, en lugar de llevarlo escrito
dentro del código. Sirve para no incrustar **secretos** en el código. Se guardan en
archivos `.env`, que **no** se suben al repositorio. Ver
[`Guia-de-Instalacion.md`](./Guia-de-Instalacion.md) §3.

### Despliegue (*deploy*)

El proceso de **publicar** el sistema para que otros lo usen en internet. GearQuest aún
no está desplegado; ver [`Despliegue.md`](./Despliegue.md).

### Docker y contenedor

**Docker** empaqueta un programa con todo lo que necesita para funcionar en cualquier
computador. Un **contenedor** es esa caja ya en marcha. GearQuest usa un contenedor de
PostgreSQL para la base de datos local.

### CORS

*Cross-Origin Resource Sharing*. Regla de seguridad de los navegadores que controla **qué
páginas** pueden llamar a la API. En desarrollo se permite todo (`*`); en producción se
restringe.

### JWT (*token*)

*JSON Web Token*. Un **pase temporal** que el servidor entrega al iniciar sesión y que el
cliente muestra en cada petición para probar quién es. Es como una pulsera de evento: la
llevas puesta y con ella entras a las zonas. Los tokens son **secretos**: nunca se
comparten ni se guardan en el repositorio.

### Hash

El resultado de transformar un dato (por ejemplo, una contraseña) en un código **del que
no se puede volver atrás**. Se guarda el hash, no la contraseña: así, aunque alguien vea
la base de datos, no puede recuperar la contraseña original.

### Lint / Linter

Herramienta que **revisa el código** buscando errores comunes y malos estilos, sin
ejecutarlo. Es como un corrector ortográfico para programadores.

### Seed (datos de siembra)

Script que **llena la base de datos con datos de ejemplo** para que la aplicación no se
vea vacía al abrirla. No son datos reales.

---

## 1.3 Términos de bases de datos

### Base de datos

El lugar donde se **guardan** los datos de forma ordenada y duradera. GearQuest usa
**PostgreSQL**, un gestor de bases de datos relacionales.

### Tabla

Una «hoja de cálculo» dentro de la base de datos, con **filas** (registros) y **columnas**
(campos). Por ejemplo, la tabla `products` guarda los productos.

### Modelo (entidad)

La **definición** de un tipo de dato en el código. Un modelo `Product` describe qué campos
tiene un producto. GearQuest tiene 26 modelos (entidades).

### Campo / columna

Cada **dato** que guarda una tabla. En `products`, un campo es `price` (precio).

### Clave primaria (*primary key*)

El campo que **identifica de forma única** a cada fila. Como el número de documento de una
persona: no hay dos iguales.

### Clave foránea (*foreign key*, FK)

Un campo que **apunta a otra tabla**, indicando una relación. Por ejemplo, cada imagen
apunta a su producto mediante `productId`.

### Relación 1–N / 1–1 / N–M

Cómo se conectan dos tablas:

- **1–N (uno a muchos):** un producto tiene **muchas** imágenes. La más común.
- **1–1 (uno a uno):** un producto tiene **un** inventario.
- **N–M (muchos a muchos):** varios a varios.

### Migración

Una **receta ordenada** que transforma la base de datos de una versión a la siguiente.
Cada receta se aplica una sola vez y queda registrada. Así todos tienen **la misma**
estructura, sin pasarse scripts por chat.

### ORM

*Object-Relational Mapping*. Capa que traduce entre el código (objetos) y la base de datos
(tablas). GearQuest usa **Prisma** como ORM.

### Esquema (*schema*)

La **descripción completa** de cómo están organizadas las tablas y sus relaciones. En
Prisma se escribe en un archivo `schema.prisma`.

### Índice (*index*)

Estructura que hace las **búsquedas más rápidas**, como el índice de un libro. Se crea en
campos que se consultan mucho (por ejemplo, el correo de un usuario).

### Transacción

Un grupo de operaciones que se ejecutan **todas o ninguna**. Útil para mover dinero
virtual: no puede pasar que se reste de una cuenta y no se sume a la otra.

### Idempotencia

Propiedad por la cual **repetir la misma operación** no cambia el resultado más de una vez.
Importante en pagos y saldos: si el usuario pulsa «cobrar» dos veces por un fallo de red,
el sistema **no** debe cobrar dos veces.

---

## 1.4 Términos del juego

### Gacha (ver [1.1](#gacha))

### Probabilidad / peso (*weight*)

El número que determina **qué tan probable** es cada premio. Un peso mayor = más
probabilidad. El servidor decide el resultado usando estos pesos, **no** el jugador.

### Rareza (*rarity*)

El **nivel de escasez** de un premio (común, raro, épico…). A mayor rareza, menor
probabilidad y mejor recompensa.

### Godot

El **motor de videojuegos** elegido para el minijuego y la ruta gacha. Aún no está
implementado.

### Anti-trampa

Conjunto de medidas para **evitar que el jugador haga trampa**. La principal: el servidor
**no confía** en el puntaje que envía el cliente sin validarlo.

---

## 1.5 Términos de proceso y equipo

### Commit

Un **punto de guardado** en el historial de Git, con un mensaje que describe qué cambió.

### Rama (*branch*)

Una **línea de trabajo paralela** de Git. En GearQuest se crea una rama **por tarea**, no
una fija por persona. Ver [`CONTRIBUTING.md`](./CONTRIBUTING.md).

### PR (*Pull Request*)

Una **propuesta de cambio**: «terminé esta tarea, ¿lo revisamos e integramos?». Permite
comentar y revisar antes de unir el trabajo a la rama principal.

### Conventional Commits

Un **formato estándar** para los mensajes de commit, empezando por un tipo: `feat:` (algo
nuevo), `fix:` (corrección), `docs:` (documentación), etc. Hace el historial legible y
automático. Explicación en [`CONTRIBUTING.md`](./CONTRIBUTING.md).

### Changelog

El **diario de cambios visible** para quien usa el producto, agrupado por versión. No es el
historial de Git. Ver [`CHANGELOG.md`](./CHANGELOG.md).

### SemVer (versionado semántico)

Acuerdo para dar sentido al número de versión `MAYOR.MENOR.PARCHE` (por ejemplo `1.4.2`):
cambia MAYOR si rompes compatibilidad, MENOR si añades algo nuevo, PARCHE si corriges un
fallo. Ver [`CHANGELOG.md`](./CHANGELOG.md).

### ADR

*Architecture Decision Record*. Documento corto que **explica una decisión** de diseño y
su por qué. En GearQuest viven en [`Decisiones.md`](./Decisiones.md).

### Trazabilidad

Poder **seguir la pista** de un requisito: de dónde viene, qué lo implementa y en qué
estado está. En GearQuest, [`Trazabilidad.md`](./Trazabilidad.md) es la fuente de verdad.

### Deuda técnica

Trabajo **pendiente** que se dejó conscientemente para más adelante. No es «código malo»:
es una decisión de priorizar. Se registra para no olvidarla.

### QA (*Quality Assurance*)

Aseguramiento de calidad: las **comprobaciones** que garantizan que el producto funciona.
GearQuest tiene un QA automático para sus diagramas.

### WIP (*Work In Progress*)

«Trabajo en curso»: algo que está **a medias**. Se marca así para no presentarlo como
terminado.

---

## 2. Cómo añadir un término nuevo

1. Añádelo en la sección que le corresponda (o crea una si no encaja).
2. Define **en una o dos frases**, como si se lo explicaras a alguien sin experiencia.
3. Si aparece un término dentro de otra definición, enlázalo o repítelo.
4. Evita ejemplos con datos reales: usa siempre ejemplos genéricos.

---

## 3. Enlaces relacionados

| Documento | Para qué |
| --- | --- |
| [`README.md`](./README.md) | Índice general de la documentación |
| [`Guia-de-Instalacion.md`](./Guia-de-Instalacion.md) | Cómo levantar el proyecto |
| [`Decisiones.md`](./Decisiones.md) | Por qué está construido así |
| [`Diccionario-de-Datos.md`](./Diccionario-de-Datos.md) | Detalle de tablas y campos |
| [`API/README.md`](./API/README.md) | Cómo hablar con el backend |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Cómo se colabora |
