# Requisitos del Componente de Juego — GearQuest

> **Área:** Juego (aventura, tienda del mercader y ruleta)
> **Estado:** Borrador para revisión
> **Versión:** 2.0 — 2026-10-18
> **Tecnología de referencia:** Godot 2D con C++
> **Documento base:** `README.MD` (raíz), §4.2
> **Inspiraciones:** *Blasphemous* (principal), *Castlevania: Symphony of the Night* y dificultad tipo *Dark Souls*

---

## 1. Propósito

Define la experiencia de juego, sus tres componentes y cómo se conecta con la cuenta de
usuario. Está pensado para entender el funcionamiento sin conocer motores de videojuegos.

## 2. Contexto en lenguaje sencillo

El juego tiene **tres componentes** que comparten la misma moneda:

```text
┌──────────────────┐    monedas    ┌──────────────────┐    monedas    ┌──────────────────┐
│     AVENTURA     │ ────────────▶ │ TIENDA DEL       │ ◀──────────── │     RULETA       │
│ Explora, pelea y │               │ MERCADER         │               │ Gasta monedas en │
│ obtiene monedas  │               │ Gasta monedas en │               │ tiradas → premios│
└──────────────────┘               │ objetos          │               └──────────────────┘
                                   └──────────────────┘
```

### 2.1. Aventura (exploración y combate)

Metroidvania 2D con dificultad exigente. El jugador recorre **5 mapas tipo laberinto**,
cada uno con un jefe final. Al derrotar al **Rey Demonio** (nivel 5) se obtiene un
**arma legendaria coleccionable**.

Mecánicas principales:

* **Barra de vida** y combate **cuerpo a cuerpo o a distancia** según el arma o el personaje equipado.
* **Objetos del entorno** destruibles que sueltan items.
* Los **enemigos sueltan monedas** al morir.
* **5 mapas**, cada uno con su jefe para avanzar de nivel.
* **Jefe final (Rey Demonio):** dropea un arma legendaria única.

### 2.2. Tienda del mercader

Zona fija dentro del mapa, al estilo de *Blasphemous*: el personaje entra en un área
específica y encuentra un mercader donde **canjea monedas** por objetos (pociones,
armas, armaduras, etc.).

### 2.3. Ruleta (gacha)

Se gasta monedas en **tiradas** con probabilidades **a favor de la casa**. Premios posibles:

| Premio | Detalle |
| --- | --- |
| Descuento de producto | Aplica a **un solo producto** del carrito, nunca al carrito completo |
| Personajes | Exclusivos de la ruleta; no se compran aparte |
| Armas | Exclusivas de la ruleta; no se compran aparte |
| Items raros | Exclusivos de la ruleta; no se compran aparte |

### 2.4. Reglas transversales

* **Muerte:** el personaje pierde **todos los items** obtenidos en la aventura; solo conserva las **monedas**.
* **Anti-farming:** tras matar a un enemigo una cantidad de veces en la misma partida,
  este **desaparece del mapa** para evitar monedas infinitas *(sistema inspirado en Dark Souls 2; implementación diferida)*.
* **Dificultad:** exigente, al estilo *Dark Souls*, para que el jugador experimente ese tipo de desafío.
* **Zonas de descanso ("carga"):** áreas seguras en el mapa donde el jugador descansa. Contienen un
  **cofre** para almacenar el inventario: armas, partes de armaduras e items como pociones.

**Regla fundamental:** el juego es un *cliente* de confianza limitada. Solo *reporta* que algo
pasó, pero **quien otorga monedas es siempre el servidor**, tras validar el resultado.

## 3. Alcance

- Proyecto Godot 2D escrito en C++, ubicado en la carpeta `GAME/` del monorepo (pendiente de crear).
- Integración con `economy-service` del backend para monedas, ruleta, recompensas y transacciones.
- Presentación dentro de la experiencia de la tienda (enlace o embebido, por definir).

## 4. Requisitos funcionales

### 4.1. Aventura

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-GA-01 | La aventura debe tener 5 mapas tipo laberinto con jefe final en cada uno | Must | El jugador completa un mapa, derrota al jefe y accede al siguiente |
| FR-GA-02 | El combate debe ser cuerpo a cuerpo o a distancia según el arma o personaje equipado | Must | El tipo de ataque cambia según el equipamiento activo |
| FR-GA-03 | El jugador debe tener una barra de vida visible | Must | El daño recibido reduce la vida y llega a 0 al morir |
| FR-GA-04 | Los objetos del entorno deben poder destruirse para obtener items | Must | Destruir un objeto entrega un item al inventario |
| FR-GA-05 | Los enemigos deben soltar monedas al ser derrotados | Must | Tras matar un enemigo se suman monedas al monedero tras validación del servidor |
| FR-GA-06 | El nivel 5 debe presentar al Rey Demonio como jefe final | Must | Derrotarlo dropea un arma legendaria coleccionable única |
| FR-GA-07 | Al morir, el jugador pierde todos los items de la aventura y conserva solo las monedas | Must | Tras la muerte el inventario queda vacío y el saldo de monedas no cambia |
| FR-GA-08 | Debe existir un sistema anti-farming por enemigo en la misma partida | Should | Tras N muertes del mismo enemigo este desaparece del mapa *(implementación diferida)* |

### 4.2. Tienda del mercader

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-GA-09 | Debe existir una zona fija de mercader dentro de cada mapa | Must | El jugador puede acceder al mercader en la ubicación designada |
| FR-GA-10 | El mercader debe permitir canjear monedas por objetos | Must | El canje descuenta monedas y entrega el objeto al inventario |

### 4.3. Ruleta

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-GA-11 | La ruleta debe permitir tiradas que cuestan monedas y entregan recompensas | Must | Cada tirada descuenta su costo y queda registrada con su recompensa |
| FR-GA-12 | Las probabilidades deben estar a favor de la casa | Must | La distribución de premios está definida en el servidor |
| FR-GA-13 | Los descuentos deben aplicar a un solo producto del carrito | Must | El descuento nunca reduce el precio del carrito completo |
| FR-GA-14 | Personajes, armas e items raros deben ser exclusivos de la ruleta | Must | No existe otra vía de obtención fuera de la ruleta |
| FR-GA-15 | Debe mostrarse el costo de cada tirada y el saldo disponible antes de jugar | Must | El usuario ve costo y saldo antes de tirar |

### 4.4. Zonas de descanso e inventario

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-GA-16 | Cada mapa debe incluir zonas de descanso ("carga") con un cofre | Must | El jugador puede depositar items en el cofre |
| FR-GA-17 | El cofre debe almacenar armas, partes de armaduras e items (ej: pociones) | Must | El inventario guardado persiste entre partidas |

### 4.5. Integración con la cuenta

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-GA-18 | El juego debe identificar al usuario antes de registrar una partida o transacción | Must | No se juega ni se reporta nada sin una sesión válida |
| FR-GA-19 | El resultado de la partida debe enviarse al backend para validación | Must | Las monedas aparecen en el monedero **solo** cuando el servidor confirma |
| FR-GA-20 | El juego no debe modificar saldos por su cuenta | Must | El monedero oficial es el del backend; el juego solo consulta y reporta |
| FR-GA-21 | El historial de tiradas y recompensas debe ser visible en la cuenta | Must | El usuario ve sus movimientos desde la tienda |
| FR-GA-22 | Debe informarse claramente cuando no hay conexión con el servidor | Must | Sin conexión no se otorgan monedas ni tiradas; se muestra un mensaje claro |

## 5. Requisitos no funcionales

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| NFR-GA-01 | Rendimiento fluido en equipos modestos (60 FPS objetivo en 2D) | Should | Sin tirones visibles en el hardware mínimo acordado |
| NFR-GA-02 | Resistencia a trampas: no obtener monedas sin validación del servidor | Must | Manipular el cliente no produce monedas; el servidor rechaza resultados inválidos |
| NFR-GA-03 | Código C++ limpio, comentado en español y con estilo consistente | Must | Compila sin errores y sigue las convenciones acordadas |
| NFR-GA-04 | No almacenar credenciales en texto plano | Must | El token de sesión se guarda de forma segura y se descarta al cerrar |
| NFR-GA-05 | Dificultad exigente al estilo *Dark Souls* | Should | El jugador experimenta un desafío percibido como difícil pero justo |
| NFR-GA-06 | Experiencia comprensible sin tutorial largo | Should | Una persona nueva entiende el objetivo en el primer intento |

## 6. Dependencias e integraciones

- **economy-service (backend):** fuente de verdad de monedas, ruleta, recompensas y
  validación de partidas. El contrato de comunicación ya está definido en
  [`Contrato-entre-servicios.md`](../Contrato-entre-servicios.md) (6 operaciones: saldo,
  débito, crédito, validación de partida (§7), canje en el mercader (§8) y avisos (§9)) y
  publicado en [`API/openapi.yaml`](../API/openapi.yaml).
- **Frontend:** punto de acceso al juego y lugar donde se muestran los resultados.
- **Reglas de negocio:** costes, probabilidades y recompensas dependen de
  [`Business-Rules.md`](./Business-Rules.md).

> **Correspondencia con el modelo de datos:** el `enum GameType` del `economy-service`
> tiene los valores `GACHA` y `MINIGAME`. El valor **`MINIGAME` corresponde a la
> partida de aventura** (la única que genera monedas por juego) y **`GACHA` a la ruleta**.
> El `enum GameSessionStatus` (`STARTED`, `FINISHED`, `ABANDONED`, `REJECTED`) mapea
> así: `FINISHED` = partida completada, `ABANDONED` = partida abandonada o muerte
> (el jugador pierde los items, no las monedas) y `REJECTED` = resultado descartado
> por el servidor (anti-trampa).

## 7. Criterios de aceptación del área

- [ ] Completar un mapa y derrotar a su jefe permite avanzar de nivel.
- [ ] Derrotar al Rey Demonio dropea el arma legendaria coleccionable.
- [ ] Al morir, el jugador pierde los items y conserva las monedas.
- [ ] El mercader permite canjear monedas por objetos en el mapa.
- [ ] Tirar en la ruleta descuenta monedas exactamente una vez y entrega su recompensa.
- [ ] Un descuento de la ruleta aplica solo a un producto del carrito.
- [ ] Intentar manipular el resultado desde el cliente no produce monedas.
- [ ] Sin conexión al servidor, el juego lo indica y no otorga nada.

## 8. Decisiones pendientes

1. Diseño de los 5 mapas (plano, enemigos, jefes y distribución de zonas de descanso).
2. Mecánicas exactas del combate (movimiento, animaciones y sistema de daño).
3. Probabilidades, coste y tablas de recompensas de la ruleta.
4. Cantidad de muertes de un enemigo para que desaparezca (anti-farming).
5. Contenido del mercader y precios de canje.
6. Forma de integración en la tienda: enlace, modal o embebido.
7. Alcance del análisis antifraude aplicado al juego (servicio Python).
8. Contenido del cofre de cada zona de descanso y qué items se guardan.

> **Ya resueltas** (no dependen del equipo, están implementadas o documentadas):
> el protocolo de validación entre el juego y el backend, definido en
> [`Contrato-entre-servicios.md`](../Contrato-entre-servicios.md) §7 (operación
> `POST /internal/game-sessions/{sessionId}/validate`) y §8 (operación
> `POST /internal/merchant/redemptions`); y las reglas de muerte,
> cofres y anti-farming, fijadas en §2.4 de este documento.

## 9. Referencias

- `README.MD` (raíz): §4.2 (juego y monedas), §7.1 (integridad de monedas).
- [`Business-Rules.md`](./Business-Rules.md): reglas de monedas, descuentos y vencimientos.
- [`Backend.md`](./Backend.md): requisitos de `economy-service` (`FR-BE-17`, `FR-BE-22`).
- [`Contrato-entre-servicios.md`](../Contrato-entre-servicios.md): contrato interno entre
  servicios (validación de partida, canje en el mercader).
- [`API/openapi.yaml`](../API/openapi.yaml): contrato público de la API.
- [`Casos-de-Uso/03-Juego-y-Economia.md`](../Casos-de-Uso/03-Juego-y-Economia.md):
  `UC-12` (aventura), `UC-13` (ruleta) y `UC-19` (mercader).
