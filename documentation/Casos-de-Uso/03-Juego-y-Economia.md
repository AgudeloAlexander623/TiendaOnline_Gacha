# Casos de Uso — Juego y Economía

> **Dominio:** Juego y economía · **Servicios responsables:** economy-service (puerto 3003),
> payments-service (puerto 3004) y proyecto de juego en `GAME/` (Godot)
> **Estado:** Borrador para revisión · **Versión:** 1.0 — 2026-10-18
> **Requisitos de referencia:** [`SRS · Game.md`](../Software-requeriments\(SRS\)/Game.md) · [`SRS · Business-Rules.md`](../Software-requeriments\(SRS\)/Business-Rules.md)

---

## 1. Introducción

Este documento describe la **experiencia gamificada** de GearQuest: explorar la aventura
para ganar monedas, gastarlas en la ruleta, canjearlas en el mercader del mapa, ver el
saldo y simular recargas. Es el dominio más peculiar del proyecto y también el que exige
más cuidado: **el juego nunca decide cuántas monedas recibe alguien; eso siempre lo valida
el servidor.**

El juego tiene **tres componentes** que comparten la misma moneda:

| Componente | Qué es | Qué da |
| --- | --- | --- |
| **Aventura** | Metroidvania 2D: 5 mapas tipo laberinto con jefe, combate, cofres y zonas de descanso | Monedas (al derrotar enemigos) e items |
| **Mercader** | Zona fija dentro de cada mapa donde el personaje canjea monedas | Objetos (pociones, armas, armaduras) |
| **Ruleta** | Máquina de tiradas con probabilidades a favor de la casa | Descuentos, personajes, armas e items raros |

El alcance detallado del juego está en [`SRS · Game.md`](../Software-requeriments\(SRS\)/Game.md),
que es su **fuente de verdad**.

## 2. Actores

| Actor | Descripción en este dominio |
| --- | --- |
| **Cliente** | A la vez jugador y comprador: explora la aventura, tira en la ruleta, canjea en el mercader, consulta su monedero y recarga (en modo simulado) |

## 3. Mapa de casos de uso

| Caso | Nombre | Prioridad |
| --- | --- | --- |
| UC-12 | Explorar y jugar la aventura | Must |
| UC-13 | Hacer una tirada en la ruleta | Must |
| UC-14 | Consultar el monedero | Must |
| UC-15 | Consultar el historial de monedas | Must |
| UC-16 | Realizar una recarga simulada | Must |
| UC-19 | Canjear monedas por objetos en el mercader | Must |

## 4. Detalle de los casos de uso

### UC-12 · Explorar y jugar la aventura

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como jugador quiero explorar la aventura para ganar monedas y guardar mis objetos |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02); la aventura está disponible |
| Disparador | Pulsa "Jugar" en la sección del juego |
| Prioridad | Must |

**Flujo principal**

1. El jugador entra a la aventura desde su cuenta; el juego confirma su sesión.
2. Explora el mapa: hay **5 mapas tipo laberinto**, cada uno con su **jefe final**.
3. combate cuerpo a cuerpo o a distancia, según el arma equipada, y ve su **barra de vida**.
4. Al derrotar enemigos, **sueltan monedas**; los objetos del entorno se pueden destruir y
   sueltan items.
5. En una **zona de descanso** puede abrir el **cofre** y guardar armas, partes de armaduras
   y pociones: el inventario queda a salvo aunque muera.
6. Cuando la partida termina, el juego envía el resultado al servidor («include»).
7. El servidor lo valida y, si es válido, acredita las monedas correspondientes.
8. El monedero refleja las monedas recién ganadas.

**Flujos alternativos y de excepción**

- *Muerte:* el personaje **pierde todos los items** obtenidos en la aventura, pero
  **conserva las monedas**; la partida queda registrada como abandonada.
- *Sin conexión:* el juego lo avisa y no se otorgan monedas hasta que se recupere el enlace.
- *Resultado rechazado:* el servidor no acepta el resultado y el jugador es informado; nada
  se acredita por su cuenta.

**Resultado:** las monedas ganadas aparecen en el monedero con su fecha de vencimiento
(30 días), y el inventario guardado en el cofre sigue disponible para la siguiente partida.

**Requisitos asociados (SRS):** FR-GA-01 · FR-GA-02 · FR-GA-03 · FR-GA-04 · FR-GA-05 ·
FR-GA-07 · FR-GA-16 · FR-GA-17 · FR-GA-19 · FR-GA-22 · FR-BE-17 · FR-BR-02

---

### UC-13 · Hacer una tirada en la ruleta

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como jugador quiero gastar mis monedas en tiradas para obtener recompensas |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02); saldo suficiente en el monedero (UC-14) |
| Disparador | Confirma una tirada en la ruleta |
| Prioridad | Must |

**Flujo principal**

1. El jugador abre la ruleta.
2. La interfaz muestra el costo de la tirada y su saldo actual (ambos, datos del servidor).
3. Confirma la tirada.
4. El servidor valida el saldo y lo descuenta («include»).
5. Se entrega la recompensa —un descuento de **un solo producto**, un personaje, un arma o un
   item raro— y queda registrada en su cuenta.

**Flujos alternativos y de excepción**

- *Saldo insuficiente:* no se permite tirar; se indica cuánto falta.
- *Fallo de comunicación:* la tirada no se ejecuta a medias; o se hace, o no se hace.
- *Repetición de la petición:* la misma tirada nunca cobra dos veces.

**Resultado:** el jugador tiene una recompensa nueva y su monedero refleja el gasto,
exactamente una vez.

**Requisitos asociados (SRS):** FR-GA-11 · FR-GA-12 · FR-GA-13 · FR-GA-14 · FR-GA-15 ·
FR-BE-16 · FR-BE-19

---

### UC-14 · Consultar el monedero

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero ver mis monedas y sus vencimientos para saber cuánto puedo gastar |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02) |
| Disparador | Entra a la sección "Mi monedero" |
| Prioridad | Must |

**Flujo principal**

1. El cliente abre "Mi monedero".
2. El servidor calcula el saldo real, considerando tipo de moneda y vencimientos.
3. La interfaz muestra el desglose: monedas ganadas vigentes, ganadas próximas a vencer y
   compradas (estas últimas, sin vencimiento).

**Flujos alternativos y de excepción**

- *Sesión expirada:* se pide iniciar sesión.

**Resultado:** el cliente sabe con exactitud cuánto puede gastar y de qué tipo son sus
monedas.

**Requisitos asociados (SRS):** FR-BE-14 · FR-BR-01 · FR-BR-03 · FR-BR-04

---

### UC-15 · Consultar el historial de monedas

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero ver mis movimientos para entender de dónde vienen y a dónde fueron mis monedas |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02) |
| Disparador | Abre el historial desde el monedero (UC-14) |
| Prioridad | Must |

**Flujo principal**

1. El cliente abre el historial de movimientos.
2. El servidor devuelve la lista ordenada: ganancias, consumos y vencimientos, con fecha.
3. Puede recorrer el historial completo (paginado).

**Flujos alternativos y de excepción**

- *Sin movimientos:* se muestra un mensaje que invita a jugar (UC-12).

**Resultado:** el cliente puede explicar cada moneda de su saldo; nada se borra del
registro, ni siquiera lo que ya venció.

**Requisitos asociados (SRS):** FR-BE-15 · FR-BR-05 · FR-BR-06

---

### UC-16 · Realizar una recarga simulada

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero simular una recarga para obtener monedas compradas que no vencen |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02) |
| Disparador | Confirma una recarga en la sección "Recargar monedas" |
| Prioridad | Must |

**Flujo principal**

1. El cliente abre "Recargar monedas".
2. Elige el paquete que desea simular.
3. La pantalla indica con claridad que se trata de una **operación simulada**: no hay
   cobro real ni datos bancarios.
4. Confirma; el servidor registra la recarga como simulada y acredita las monedas.
5. El monedero muestra las monedas nuevas como **compradas, sin vencimiento**, y llega una
   confirmación.

**Flujos alternativos y de excepción**

- *Operación interrumpida:* no se acredita nada a medias.
- *Reintento o doble clic:* la recarga se atiende una sola vez.

**Resultado:** el cliente tiene monedas compradas que nunca vencen, y el sistema deja
constancia de que la recarga fue simulada.

**Requisitos asociados (SRS):** FR-BE-20 · FR-BE-21 · FR-BR-10 · FR-BR-11 · FR-BR-15

---

### UC-19 · Canjear monedas por objetos en el mercader

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como jugador quiero canjear mis monedas por objetos en el mercader para mejorar mi equipo |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02); la aventura está en curso y el jugador alcanzó una **zona de mercader** |
| Disparador | Entra en la zona del mercader y elige un objeto del catálogo |
| Prioridad | Must |

**Flujo principal**

1. El jugador entra en la **zona fija del mercader** dentro del mapa.
2. Ve el catálogo del mercader: pociones, armas y armaduras, con su **precio en monedas** y
   su rareza.
3. Elige un objeto y confirma el canje.
4. El servidor valida el saldo y descuenta el precio («include»).
5. El objeto entra en el inventario del jugador y el canje queda registrado.

**Flujos alternativos y de excepción**

- *Saldo insuficiente:* no se permite el canje; se indica cuánto falta.
- *Objeto ya en el inventario con tope:* el canje se rechaza con un motivo claro.
- *Fallo de comunicación:* el canje no se ejecuta a medias; o se hace, o no se hace.

**Resultado:** el jugador tiene el objeto en su inventario y su monedero refleja el gasto,
exactamente una vez.

**Requisitos asociados (SRS):** FR-GA-09 · FR-GA-10 · FR-BE-22 · FR-BR-01 · FR-BR-04
