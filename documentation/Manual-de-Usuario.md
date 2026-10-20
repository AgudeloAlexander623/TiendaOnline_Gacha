# Manual de usuario — GearQuest

> **Para quién es esto:** para quien va a **usar** GearQuest (o presentarlo), no para quien
> programa. Explica qué se puede hacer, paso a paso, y en qué estado está cada cosa.
>
> **Aviso de honestidad:** GearQuest está **en construcción**. La interfaz web existe y
> se puede ver, pero **todavía no está conectada al backend**: muchas pantallas son
> maquetas. Cada sección de este manual indica su **estado real** con uno de estos
> símbolos:
>
> - ✅ **Funciona**: existe y opera con datos reales.
> - ⚠️ **A medias**: existe parte o hay un pendiente conocido.
> - ⬜ **Maqueta**: se ve la pantalla, pero aún no hace nada real.

---

## 1. Qué es GearQuest

GearQuest es una **tienda web de periféricos para computador** con una vuelta de tuerca:
además de comprar, puedes **jugar** para ganar **monedas** y usar esas monedas en una
**máquina gacha** para conseguir **descuentos**.

En pocas palabras:

1. **Compras** periféricos (teclados, ratones, audífonos…).
2. **Juegas** un minijuego y ganas monedas.
3. **Usas las monedas** en el gacha para obtener descuentos.
4. **Pagas** con el descuento aplicado.

> **Importante:** las compras y recargas son **simuladas**. No se procesa dinero real ni
> se piden datos de tarjeta. Es un proyecto académico.

---

## 2. Cómo entrar

### 2.1 Registro e inicio de sesión

| Función | Estado |
| --- | --- |
| Registro de usuario (correo y contraseña) | ⚠️ Backend sí; frontend sin conectar |
| Inicio de sesión | ⚠️ Backend sí; frontend sin conectar |
| Cerrar sesión | ⚠️ Backend sí; frontend sin conectar |
| Recuperar contraseña | ⬜ Pendiente |

**Qué podrás hacer cuando esté conectado:**

1. Abre la página (`http://localhost:5173` en desarrollo).
2. Pulsa **Registrarse** y rellena tu correo y una contraseña.
3. Inicia sesión con esas credenciales.
4. Verás tu **perfil** con tu nombre y tu **saldo de monedas**.

> **Contraseña:** el sistema no guarda tu contraseña, guarda un **hash** (un código del
> que no se puede volver atrás). Nunca compartas tu contraseña con nadie, ni siquiera con
> el equipo.

---

## 3. La tienda

### 3.1 Explorar productos

| Función | Estado |
| --- | --- |
| Catálogo de productos | ✅ Backend sí; ⬜ frontend maqueta |
| Ver detalle de un producto | ✅ Backend sí; ⬜ frontend maqueta |
| Buscar / filtrar por categoría | ✅ Backend sí; ⬜ frontend maqueta |

**Cómo se comporta:**

- La página de inicio y el catálogo muestran los productos disponibles.
- Cada producto tiene nombre, precio, imágenes y categoría.
- Si un producto no tiene existencias, se indica que **no está disponible**.

> **Detalle importante:** el **precio y la disponibilidad los decide el servidor**, no la
> página. Aunque alguien modificara la página, el servidor cobraría el precio correcto.
> Esto es a propósito (ver [`Decisiones.md`](./Decisiones.md), ADR-0005).

### 3.2 Carrito de compras

| Función | Estado |
| --- | --- |
| Añadir al carrito | ✅ Backend sí; ⬜ frontend maqueta |
| Cambiar cantidades | ✅ Backend sí; ⬜ frontend maqueta |
| Quitar del carrito | ✅ Backend sí; ⬜ frontend maqueta |

**Cómo usarlo (cuando esté conectado):**

1. Desde un producto, pulsa **Añadir al carrito**.
2. Abre el carrito para ver los productos y sus cantidades.
3. Ajusta cantidades o elimina lo que no quieras.

> **Nota:** el carrito guarda el **precio del momento** en que añadiste el producto. Si el
> precio cambia después, se te respeta el precio que viste. Esto evita sorpresas.

### 3.3 Comprar (checkout)

| Función | Estado |
| --- | --- |
| Confirmar compra | ✅ Backend sí; ⬜ frontend maqueta |
| Historial de pedidos | ✅ Backend sí; ⬜ frontend maqueta |
| Seguir el estado del pedido | ✅ Backend sí; ⬜ frontend maqueta |
| Aplicar descuento por monedas | ⚠️ Regla pendiente |

**Cómo funciona:**

1. Desde el carrito, pulsa **Finalizar compra**.
2. El sistema crea un **pedido** con un número único.
3. El pedido pasa por estados: **pendiente → confirmado → enviado → entregado**
   (o **cancelado**).
4. Puedes consultar tus pedidos y su estado en cualquier momento.

> **Solo el servidor cambia el estado de un pedido.** Esto evita que alguien marque su
> pedido como «entregado» sin que lo esté.

---

## 4. El juego y las monedas

### 4.1 Dónde se ven las monedas

| Función | Estado |
| --- | --- |
| Ver saldo de monedas | ✅ Backend sí; ⬜ frontend maqueta |
| Historial de movimientos | ✅ Backend sí; ⬜ frontend maqueta |

Tu **saldo** es el total de monedas disponibles. El saldo lo **calcula el servidor**
sumando las monedas que aún no han vencido.

### 4.2 Tipos de monedas (muy importante)

Hay **dos tipos** de monedas y se comportan distinto:

| Tipo | Cómo se consiguen | ¿Caducan? |
| --- | --- | --- |
| **Ganadas** | Jugando el minijuego | Sí, a los **30 días** |
| **Compradas** | Con una recarga (simulada) | **No** caducan |

> **¿Por qué?** Para incentivar que se juegue con regularidad. Las monedas de regalo
> caducan; las que «compraste» son tuyas para siempre.

> **Pendiente:** aún no se ha definido en qué **orden** se gastan las monedas ganadas y
> las compradas. Ver [`Decisiones pendientes`](../README.MD).

### 4.3 Jugar el minijuego

| Función | Estado |
| --- | --- |
| Minijuego (Godot) | ⬜ No implementado |
| Otorgar monedas al terminar | ✅ Backend sí (regla simple) |

**Cómo funcionará:**

1. Entras al minijuego desde la web.
2. Juegas y consigues un puntaje.
3. Al terminar, el **servidor** decide cuántas monedas ganas.
4. Las monedas se suman a tu saldo como monedas **ganadas** (caducan a los 30 días).

> **Regla anti-trampa:** el servidor **no confía** en el puntaje que llega desde el juego
> sin más; aplica sus propias reglas para convertirlo en monedas. La validación definitiva
> aún está **pendiente** (ver [`Trazabilidad.md`](./Trazabilidad.md)).

### 4.4 La máquina gacha

| Función | Estado |
| --- | --- |
| Ver gachas disponibles | ✅ Backend sí; ⬜ frontend maqueta |
| Hacer una tirada | ✅ Backend sí; ⬜ frontend maqueta |
| Ver el premio obtenido | ✅ Backend sí; ⬜ frontend maqueta |
| Inventario de premios | ✅ Backend sí; ⬜ frontend maqueta |

**Cómo funciona:**

1. Abres la sección del **gacha**.
2. Eliges una máquina (cada una tiene su costo por tirada).
3. Pulsas **Girar** (se te descuentan monedas).
4. El servidor decide el premio según las **probabilidades** de esa máquina.
5. El premio va a tu **inventario**.

> **Las probabilidades las define el servidor**, no la página. Y **cada tirada queda
> registrada**, ganes o no: eso permite auditar si algo va mal.

---

## 5. Descuentos

| Función | Estado |
| --- | --- |
| Ver niveles de descuento | ✅ Backend sí; ⬜ frontend maqueta |
| Canjear monedas por un descuento | ⚠️ Débito de monedas pendiente |

**Cómo funcionará:**

1. Verás una lista de **niveles** de descuento (por ejemplo, del 1 al 5).
2. Cada nivel cuesta cierta cantidad de **monedas**.
3. Al canjearlo, el servidor **descuenta las monedas** y te aplica el descuento.
4. El descuento se usa al pagar tu pedido.

> **Pendiente:** el **canje de monedas para desbloquear el descuento** aún no descuenta
> monedas de verdad (integración entre servicios pendiente). Las reglas finales de
> descuentos también están por definir. Ver [`Trazabilidad.md`](./Trazabilidad.md).

---

## 6. Recargas (comprar monedas)

| Función | Estado |
| --- | --- |
| Ver paquetes de monedas | ✅ Backend sí; ⬜ frontend maqueta |
| Comprar un paquete | ✅ Backend sí (pago simulado) |
| Acreditar las monedas compradas | ⚠️ Pendiente |

**Cómo funciona:**

1. Abres la sección de **recargas**.
2. Eliges un **paquete** de monedas.
3. Se crea un **pago simulado** y, al aprobarse, la recarga se completa.
4. Esas monedas son **compradas**: no caducan nunca.

> **Simulado, sin dinero real:** no introduces tarjeta ni pagas nada. El proveedor de pago
> está en modo `mock`. La acreditación real de las monedas compradas aún está **pendiente**
> (ver [`Trazabilidad.md`](./Trazabilidad.md)).

---

## 7. Notificaciones

| Función | Estado |
| --- | --- |
| Notificaciones internas en la web | ⬜ No implementado |
| Avisos por correo electrónico | ⬜ No implementado |
| Avisos por SMS | ⬜ No implementado |

Está **previsto** avisar, por ejemplo, cuando un pedido cambie de estado, cuando unas
monedas estén por vencer o cuando una recarga se complete. Los canales (interno, correo,
SMS) y sus proveedores **aún no están elegidos**.

---

## 8. Preguntas frecuentes

**¿GearQuest cobra dinero de verdad?**
No. Compras y recargas son **simuladas**. Es un proyecto académico.

**¿Las monedas que gano caducan?**
Solo las **ganadas jugando**: a los 30 días. Las **compradas** no caducan.

**¿Puedo hacer trampa ganando monedas?**
El servidor intenta evitarlo decidiendo él mismo el saldo y las recompensas. La validación
definitiva de las partidas está pendiente.

**¿Por qué algunas pantallas no hacen nada?**
Porque el frontend aún no está conectado al backend (0 llamadas HTTP). Ver el estado real
en [`Trazabilidad.md`](./Trazabilidad.md).

**¿Necesito saber programar para usar el manual?**
No. Este manual es para usuarios y para quien presenta el proyecto.

**¿Dónde veo qué está terminado y qué no?**
En [`Trazabilidad.md`](./Trazabilidad.md), requisito por requisito.

---

## 9. Enlaces relacionados

| Documento | Para qué |
| --- | --- |
| [`README.md`](./README.md) | Índice general de la documentación |
| [`Glosario.md`](./Glosario.md) | Qué significa cada término |
| [`Guia-de-Instalacion.md`](./Guia-de-Instalacion.md) | Cómo levantar el proyecto en tu PC |
| [`Trazabilidad.md`](./Trazabilidad.md) | Estado real de cada función |
| [`Casos-de-Uso/README.md`](./Casos-de-Uso/README.md) | El comportamiento, con más detalle |
| [`Decisiones.md`](./Decisiones.md) | Por qué el sistema se comporta así |
