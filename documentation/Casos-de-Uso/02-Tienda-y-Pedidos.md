# Casos de Uso — Tienda y Pedidos

> **Dominio:** Tienda y pedidos · **Servicio responsable:** store-service (puerto 3002)
> **Estado:** Borrador para revisión · **Versión:** 1.1 — 2026-10-22
> **Requisitos de referencia:** [`SRS · Backend.md`](../Software-requeriments\(SRS\)/Backend.md) · [`SRS · Business-Rules.md`](../Software-requeriments\(SRS\)/Business-Rules.md)
> **Diseño del catálogo por familias:** [`Catalogo-por-Familias.md`](../Catalogo-por-Familias.md)

---

## 1. Introducción

Este documento describe el **corazón comercial** de GearQuest: recorrer la tienda, armar
un carrito, confirmar un pedido y usar un descuento. Aquí aparece también el único actor
con permisos especiales: el **Administrador**, que mantiene el catálogo al día.

Desde la v1.1 el catálogo tiene **tres familias** —periféricos, licencias y juegos— pero el
**carrito y el pedido siguen siendo únicos**: se puede comprar de las tres en la misma
compra. Los tres casos de compra de cada familia están en `UC-20`, `UC-21` y `UC-22`.

## 2. Actores

| Actor | Descripción en este dominio |
| --- | --- |
| **Cliente** | Explora la tienda, arma su carrito, compra y canjea descuentos |
| **Administrador** | Usuario del equipo con permisos para gestionar productos e inventario |

## 3. Mapa de casos de uso

| Caso | Nombre | Actor | Prioridad |
| --- | --- | --- | --- |
| UC-05 | Explorar el catálogo | Cliente | Must |
| UC-06 | Ver el detalle de un producto | Cliente | Must |
| UC-07 | Gestionar el carrito | Cliente | Must |
| UC-08 | Crear un pedido | Cliente | Must |
| UC-09 | Consultar el historial de pedidos | Cliente | Must |
| UC-10 | Canjear un descuento | Cliente | Must |
| UC-11 | Administrar productos e inventario | Administrador | Must |
| UC-20 | Comprar un periférico | Cliente | Must |
| UC-21 | Comprar una licencia y recibir su clave | Cliente | Must |
| UC-22 | Comprar un juego | Cliente | Must |

## 4. Detalle de los casos de uso

### UC-05 · Explorar el catálogo

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como visitante quiero ver los productos disponibles para encontrar lo que me interesa |
| Actor | Cliente (también puede usarlo sin cuenta) |
| Precondiciones | Ninguna especial |
| Disparador | Abre la tienda desde la página principal |
| Prioridad | Must |

**Flujo principal**

1. La persona abre la tienda.
2. El servidor devuelve el listado paginado con precio y disponibilidad de cada producto.
3. Navega por las páginas y usa la búsqueda o los filtros cuando existan.
4. Elige un producto para ver su detalle (UC-06).

**Flujos alternativos y de excepción**

- *Sin productos:* se muestra un mensaje claro ("no hay productos disponibles" por ahora).

**Resultado:** la persona identifica un producto de interés.

**Requisitos asociados (SRS):** FR-BE-09 · FR-FE-01

---

### UC-06 · Ver el detalle de un producto

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero ver la información completa de un producto para decidir si lo compro |
| Actor | Cliente |
| Precondiciones | El producto exista en el catálogo (UC-05) |
| Disparador | Selecciona un producto de la lista |
| Prioridad | Must |

**Flujo principal**

1. Desde el catálogo, la persona elige un producto.
2. El servidor entrega descripción, precio, imágenes y disponibilidad.
3. La interfaz lo muestra junto a la opción "Agregar al carrito" (UC-07).

**Flujos alternativos y de excepción**

- *Producto agotado:* se informa de forma clara y se deshabilita la compra.

**Resultado:** la persona conoce el producto a fondo antes de decidir.

**Requisitos asociados (SRS):** FR-BE-09 · FR-FE-01

---

### UC-07 · Gestionar el carrito

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero armar mi carrito para revisar mi compra antes de confirmarla |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02); el carrito se asocia a la cuenta |
| Disparador | Agrega un producto desde el catálogo o el detalle |
| Prioridad | Must |

**Flujo principal**

1. La persona agrega productos al carrito.
2. El servidor registra cada artículo con su **precio vigente**.
3. Ajusta cantidades o elimina artículos que ya no quiere.
4. La interfaz muestra el total, calculado siempre por el servidor.

**Flujos alternativos y de excepción**

- *Producto que se agota:* se avisa al actualizar el carrito.
- *Sesión expirada:* se pide iniciar sesión para conservar el carrito.

**Resultado:** el carrito refleja exactamente lo que se va a comprar y cuánto cuesta.

**Requisitos asociados (SRS):** FR-BE-11 · FR-BR-12

---

### UC-08 · Crear un pedido

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero confirmar mi compra para recibir mi pedido |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02); carrito con al menos un artículo (UC-07) |
| Disparador | Pulsa "Confirmar compra" en el carrito |
| Prioridad | Must |

**Flujo principal**

1. La persona revisa el carrito y confirma la compra.
2. El servidor **valida precios e inventario** («include») y aplica el descuento canjeado, si tiene uno (UC-10).
3. Se registra el pedido y se descuenta el inventario.
4. El cliente recibe la confirmación con el resumen y el total final.

**Flujos alternativos y de excepción**

- *Sin stock:* se avisa qué artículos fallan y se permite ajustar el carrito.
- *Doble clic o reintento:* el pedido se atiende una sola vez; nunca se cobra dos veces.
- *Sesión expirada:* se pide iniciar sesión antes de pagar.

**Resultado:** existe un pedido confirmado y el inventario quedó descontado.

**Requisitos asociados (SRS):** FR-BE-12 · FR-BR-12 · FR-BR-13 · FR-BR-15

---

### UC-09 · Consultar el historial de pedidos

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero ver mis pedidos anteriores para comprobar su estado |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02) |
| Disparador | Entra a la sección "Mis pedidos" |
| Prioridad | Must |

**Flujo principal**

1. La persona abre "Mis pedidos".
2. El servidor devuelve sus pedidos con fecha, estado y total.
3. Puede abrir el detalle de cualquiera de ellos.

**Flujos alternativos y de excepción**

- *Sin pedidos todavía:* se muestra un mensaje amigable que invita a explorar la tienda.

**Resultado:** el cliente da seguimiento a sus compras sin ayuda de terceros.

**Requisitos asociados (SRS):** FR-BE-12

---

### UC-10 · Canjear un descuento

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero canjear monedas por un descuento para pagar menos en mi pedido |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02); monedas disponibles en el monedero (UC-14) |
| Disparador | Confirma el canje de un nivel de descuento |
| Prioridad | Must |

**Flujo principal**

1. La persona abre "Mis descuentos".
2. El servidor muestra los cinco niveles (10 %, 30 %, 50 %, 70 % y 90 %) con su elegibilidad real.
3. Elige un nivel y confirma el canje.
4. El servidor verifica elegibilidad, saldo, vigencia y límites.
5. El descuento queda disponible para usarlo en un pedido (UC-08).

**Flujos alternativos y de excepción**

- *Saldo insuficiente:* se indica cuántas monedas faltan.
- *Límite alcanzado:* se explica el motivo con palabras claras.

**Resultado:** el cliente tiene un descuento válido aplicado a su siguiente compra. El
navegador nunca calcula el porcentaje ni el precio final: eso lo decide el servidor.

**Relación:** es una **extensión («extend»)** de UC-08: un pedido *puede* incluir un
descuento, pero no es obligatorio.

**Requisitos asociados (SRS):** FR-BE-13 · FR-BR-07 · FR-BR-08 · FR-BR-09 · FR-BR-16

---

### UC-11 · Administrar productos e inventario

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como administrador quiero gestionar el catálogo y el inventario para mantener la tienda al día |
| Actor | Administrador |
| Precondiciones | Cuenta con rol de administrador (UC-02) |
| Disparador | Entra al área de administración |
| Prioridad | Must |

**Flujo principal**

1. El administrador inicia sesión con sus credenciales.
2. Entra a "Administración".
3. Crea, edita o retira productos del catálogo.
4. Ajusta las cantidades de inventario.
5. Los cambios quedan registrados y se reflejan en el catálogo público.

**Flujos alternativos y de excepción**

- *Sin permisos:* el sistema deniega el acceso con un mensaje claro.
- *Datos inválidos:* se señalan los campos con problema y no se guarda nada.

**Resultado:** el catálogo y el stock reflejan la realidad del negocio.

**Requisitos asociados (SRS):** FR-BE-10 · FR-BE-08 · FR-SEC-02

---

### UC-20 · Comprar un periférico

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero comprar un periférico para tenerlo en mi computador |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02); el periférico está publicado y con stock (UC-05) |
| Disparador | Agrega un periférico al carrito y confirma el pedido |
| Prioridad | Must |

**Flujo principal**

1. La persona abre la sección de periféricos y filtra por tipo de conexión, categoría o
   nombre.
2. El servidor devuelve el listado paginado con precio, disponibilidad y los atributos del
   periférico (conexión, garantía, compatibilidad).
3. Agrega el que quiere al carrito (UC-07).
4. Confirma la compra; el servidor **revalida el precio y el stock** antes de cobrar.
5. El pedido queda registrado con el nombre y el precio del momento, y el stock se descuenta.

**Flujos alternativos y de excepción**

- *Sin stock:* se avisa que ya no queda y el servidor **no cobra nada**.
- *El precio cambió entre agregar y pagar:* el servidor cobra el precio vigente y lo
  muestra antes de confirmar; el cliente puede cancelar si no le sirve.
- *Producto retirado:* deja de estar disponible y el carrito avisa.

**Resultado:** existe un pedido con el periférico comprado, el stock descontado y el
precio congelado en el pedido.

**Requisitos asociados (SRS):** FR-BE-24 · FR-BE-11 · FR-BE-12 · FR-BE-28 · FR-BR-17 ·
FR-DB-10

---

### UC-21 · Comprar una licencia y recibir su clave

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero comprar una licencia y recibir su clave para poder usarla |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02); la licencia está publicada y quedan claves disponibles (UC-05) |
| Disparador | Agrega la licencia al carrito, confirma el pedido y abre el detalle del pedido |
| Prioridad | Must |

**Flujo principal**

1. La persona abre la sección de licencias y filtra por plataforma o tipo de licencia.
2. El servidor devuelve el listado **sin ninguna clave**: solo el producto, el precio, la
   plataforma, la vigencia y cuántas activaciones permite.
3. Agrega la licencia al carrito (UC-07) y confirma el pedido (UC-08).
4. El servidor asigna una **clave disponible** al pedido y la marca como entregada.
5. La persona abre el detalle de su pedido y ve la clave, junto a las instrucciones de
   activación.

**Flujos alternativos y de excepción**

- *Sin claves disponibles:* la licencia aparece como agotada y no se puede agregar.
- *Alguien pide las claves del pedido de otra persona:* el servidor lo rechaza; las claves
  solo se entregan a quien compró ese pedido.
- *La clave llega a un límite de activaciones:* deja de servir y hay que pedir soporte.
- *La licencia caducó:* deja de servir; el pedido no se reembolsa (producto digital).

**Resultado:** la persona tiene su clave, vinculada a su pedido, y nadie más puede verla.

**Requisitos asociados (SRS):** FR-BE-25 · FR-BE-12 · FR-BE-28 · FR-BR-18 · FR-BR-19 ·
FR-SEC-12

---

### UC-22 · Comprar un juego

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero comprar un juego para poder jugarlo |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02); el juego está publicado y con stock (UC-05) |
| Disparador | Agrega un juego al carrito y confirma el pedido |
| Prioridad | Must |

**Flujo principal**

1. La persona abre la sección de juegos y filtra por género, plataforma o clasificación por
   edad.
2. El servidor devuelve el listado paginado con precio, disponibilidad y los atributos del
   juego (género, plataforma, clasificación, desarrollador).
3. Agrega el juego al carrito (UC-07).
4. Confirma el pedido; el servidor **revalida precio y stock** y lo registra.
5. La persona ve su pedido con el juego comprado.

**Flujos alternativos y de excepción**

- *Sin stock:* se avisa que no queda y no se cobra nada.
- *Carrito con Peripheral y juego mezclados:* se confirma igual, en **un solo pedido y un
  solo pago** (es la misma regla que el resto del carrito).

**Resultado:** existe un pedido con el juego comprado y el stock descontado.

**Requisitos asociados (SRS):** FR-BE-26 · FR-BE-11 · FR-BE-12 · FR-BE-27 · FR-BE-28 ·
FR-DB-10
