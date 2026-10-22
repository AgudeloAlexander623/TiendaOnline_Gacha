# Casos de Uso — GearQuest

> **Proyecto:** GearQuest — tienda de periféricos con aventura, mercader y ruleta
> **Estado:** Borrador para revisión · **Versión:** 1.1 — 2026-10-22
> **Complementa a:** [Especificación de Requisitos (SRS)](../Software-requeriments\(SRS\)/README.md)

---

## 1. ¿Qué es esta carpeta?

Una **caso de uso** responde a una pregunta muy concreta: *¿qué puede hacer una persona en
el sistema y qué pasa cuando lo hace?* Aquí se describen las acciones de GearQuest desde el
punto de vista de quien las usa, sin hablar de código.

Cada caso de uso se describe en su archivo `.md`, con una estructura fija que lo hace
fácil de seguir (ver §3).

## 2. Para quién es

- **Para el equipo:** es la referencia antes de programar cada funcionalidad.
- **Para quien no es desarrollador:** todo está escrito en lenguaje cotidiano; basta con
  leer la historia de usuario y los pasos numerados.

## 3. Cómo leer un caso de uso

Cada caso sigue la misma estructura, para que siempre sepas dónde mirar:

1. **Historia de usuario** — una frase tipo *"Como… quiero… para…"* que explica el
   objetivo real de la persona.
2. **Precondiciones** — qué debe ser cierto antes de empezar.
3. **Flujo principal** — los pasos normales, numerados, cuando todo sale bien.
4. **Flujos alternativos y de excepción** — qué pasa si algo falla (datos inválidos,
   sin conexión, sin permisos…).
5. **Resultado** — el estado del sistema al terminar.
6. **Requisitos asociados** — enlaces a los códigos del SRS (`FR-BE-01`, etc.) para saber
   de dónde sale la regla, sin repetirla.

### Relaciones entre casos de uso

Algunos casos se conectan entre sí; en el texto aparecen con estas etiquetas:

| Relación | Significado en palabras simples |
| --- | --- |
| **«include»** | El caso principal *siempre* ejecuta ese paso de apoyo |
| **«extend»** | El caso añadido *puede* ocurrir, pero no es obligatorio |

## 4. Actores del proyecto

| Actor | Quién es | Qué hace |
| --- | --- | --- |
| **Cliente** | Cualquier persona con cuenta en GearQuest | Compra, juega, gasta monedas y gestiona su perfil |
| **Administrador** | Miembro del equipo con permisos especiales | Gestiona productos e inventario de la tienda |

> El **sistema** (el backend y el juego) no es un actor: es el que *responde* a las
> acciones de las personas.

## 5. Índice de casos de uso

### Identidad y usuarios — [`01-Identidad-y-Usuarios.md`](./01-Identidad-y-Usuarios.md)

| Caso | Nombre | Actor | Prioridad |
| --- | --- | --- | --- |
| UC-01 | Registrarse | Cliente | Must |
| UC-02 | Iniciar sesión | Cliente | Must |
| UC-03 | Consultar el perfil | Cliente | Must |
| UC-04 | Actualizar el perfil | Cliente | Must |

### Tienda y pedidos — [`02-Tienda-y-Pedidos.md`](./02-Tienda-y-Pedidos.md)

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

### Juego y economía — [`03-Juego-y-Economia.md`](./03-Juego-y-Economia.md)

| Caso | Nombre | Actor | Prioridad |
| --- | --- | --- | --- |
| UC-12 | Explorar y jugar la aventura | Cliente | Must |
| UC-13 | Hacer una tirada en la ruleta | Cliente | Must |
| UC-14 | Consultar el monedero | Cliente | Must |
| UC-15 | Consultar el historial de monedas | Cliente | Must |
| UC-16 | Realizar una recarga simulada | Cliente | Must |
| UC-19 | Canjear monedas por objetos en el mercader | Cliente | Must |

### Notificaciones — [`04-Notificaciones.md`](./04-Notificaciones.md)

| Caso | Nombre | Actor | Prioridad |
| --- | --- | --- | --- |
| UC-17 | Consultar los avisos internos | Cliente | Must |
| UC-18 | Configurar las preferencias de aviso | Cliente | Could |

## 6. Organización de los archivos

```text
Casos-de-Uso/
├── README.md                        # Este índice
├── 01-Identidad-y-Usuarios.md       # UC-01 a UC-04
├── 02-Tienda-y-Pedidos.md           # UC-05 a UC-11, UC-20, UC-21 y UC-22
├── 03-Juego-y-Economia.md           # UC-12 a UC-16 y UC-19
└── 04-Notificaciones.md             # UC-17 y UC-18
```

## 7. Reglas de mantenimiento

1. **Trazabilidad:** cada caso enlaza con sus requisitos del SRS; si cambia un requisito,
   se revisa su caso de uso el mismo día.
2. **Sin redundancia:** las reglas de negocio (monedas, descuentos, vencimientos) no se
   repiten aquí; se enlazan desde el SRS.
3. **Un caso por acción:** si una historia crece demasiado, se divide en dos casos.

---

*Los casos de uso son un acuerdo entre el equipo y quien usará el producto: describen el
comportamiento esperado, no la implementación.*
