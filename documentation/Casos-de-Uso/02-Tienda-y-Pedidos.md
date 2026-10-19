# Casos de Uso — Tienda y Pedidos

> **Dominio:** Tienda y pedidos · **Servicio responsable:** store-service (puerto 3002)
> **Estado:** Borrador para revisión · **Versión:** 1.0 — 2026-10-18
> **Requisitos de referencia:** [`SRS · Backend.md`](../Software-requeriments\(SRS\)/Backend.md) · [`SRS · Business-Rules.md`](../Software-requeriments\(SRS\)/Business-Rules.md)

---

## 1. Introducción

Este documento describe el **corazón comercial** de GearQuest: recorrer la tienda, armar
un carrito, confirmar un pedido y usar un descuento. Aquí aparece también el único actor
con permisos especiales: el **Administrador**, que mantiene el catálogo al día.

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
