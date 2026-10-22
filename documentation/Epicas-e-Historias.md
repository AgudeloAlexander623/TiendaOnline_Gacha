# Épicas e historias de usuario — GearQuest

> **Para quién es esto:** para todo el equipo. Aquí está el trabajo del proyecto agrupado
> como lo pediría un cliente: **quién** quiere algo, **qué** quiere y **para qué**.
> **Qué resuelve:** convierte el SRS (los requisitos) en **incrementos entregables** que se
> pueden planificar, asignar y marcar como terminados.
> **De dónde sale:** cada historia nace de un caso de uso (`UC-*`) ya escrito; aquí **no se
> inventan** funcionalidades, se agrupan y se resumen.
> **Estado real:** el avance de cada historia lo manda la
> [Matriz de trazabilidad](./Trazabilidad.md); este documento no lo duplica.

---

## 1. ¿Qué es una épica y qué es una historia? (para juniors)

Cuando el trabajo es grande, se parte en pedazos que quepan en una conversación:

```text
   ÉPICA  (un objetivo grande, "una historia que no cabe en una tarde")
     │
     ├── HISTORIA DE USUARIO  (algo pequeño y valioso para una persona)
     ├── HISTORIA DE USUARIO
     └── HISTORIA TÉCNICA     (trabajo necesario que el usuario no ve)
```

| Concepto | Qué es | Tamaño | Ejemplo en GearQuest |
| --- | --- | --- | --- |
| **Épica** | Objetivo grande que agrupa varias historias | Un mes, más o menos | «Poder comprar en la tienda» |
| **Historia de usuario** | Necesidad concreta de una persona | Días | «Ver el detalle de un producto» |
| **Historia técnica** | Trabajo técnico que habilita una historia | Días | «Definir el modelo de datos del carrito» |

> **Por qué separamos:** el usuario no pide «un endpoint REST». Pide *ver un producto*.
> La historia de usuario captura **la necesidad**; la técnica captura **cómo** la hacemos
> posible. Confundirlas lleva a construir cosas que nadie pidió.

**Fórmula de una historia de usuario:**

```text
Como <tipo de persona>, quiero <acción> para <beneficio>.
```

Y para poder decir «está lista», cada historia necesita un **criterio de aceptación**:
una frase verificable de cuándo está bien hecha (ver
[Definition of Done](./Definition-of-Done.md)).

---

## 2. Las épicas del proyecto

GearQuest tiene **4 épicas**. Cada una agrupa los casos de uso que persiguen el mismo
objetivo.

| Épica | Nombre | Objetivo | Historias de usuario | Casos de uso | Prioridad |
| --- | --- | --- | --- | --- | --- |
| **EP-01** | Cuenta e identidad | Que una persona pueda entrar y gestionar su cuenta | US-01 … US-04 | UC-01 … UC-04 | Must |
| **EP-02** | Tienda y compra | Que se pueda explorar el catálogo y comprar | US-05 … US-11 | UC-05 … UC-11 | Must |
| **EP-03** | Juego y economía | Que se ganen monedas en la aventura y se gasten en la ruleta y el mercader | US-12 … US-16, US-19 | UC-12 … UC-16, UC-19 | Must |
| **EP-04** | Avisos al usuario | Que la persona se entere de lo que pasa con sus monedas | US-17 … US-18 | UC-17 … UC-18 | Should / Could |

### Diagrama de las épicas

```text
   ┌──────────────────────────────────────────────────────────────────────┐
   │                          GearQuest                                    │
   ├───────────────┬───────────────┬────────────────────┬─────────────────┤
   │    EP-01      │    EP-02      │       EP-03        │     EP-04       │
   │   Cuenta e    │   Tienda y    │   Juego y          │   Avisos al     │
   │   identidad   │    compra     │   economía         │    usuario      │
   ├───────────────┼───────────────┼────────────────────┼─────────────────┤
   │ UC-01…UC-04   │ UC-05…UC-11   │ UC-12…UC-16, UC-19 │ UC-17, UC-18    │
   └───────────────┴───────────────┴────────────────────┴─────────────────┘
        (entrar)        (comprar)        (jugar y monedas)     (enterarse)
```

---

## 3. Historias de usuario

> Cada historia enlaza su caso de uso (donde están precondiciones, flujo paso a paso y
> excepciones) y sus requisitos del SRS (reglas verificables). **No se repite** el detalle:
> se resume y se enlaza, para que no haya dos versiones de la verdad.

### EP-01 · Cuenta e identidad

| ID | Historia de usuario | Caso de uso | Requisitos | Prioridad |
| --- | --- | --- | --- | --- |
| **US-01** | Como visitante quiero **crear una cuenta** para comprar, jugar y guardar mi progreso | [UC-01](./Casos-de-Uso/01-Identidad-y-Usuarios.md) | FR-BE-01, FR-SEC-01 | Must |
| **US-02** | Como cliente quiero **iniciar sesión** para acceder a mi cuenta, mi monedero y el juego | [UC-02](./Casos-de-Uso/01-Identidad-y-Usuarios.md) | FR-BE-03, FR-SEC-02 | Must |
| **US-03** | Como cliente quiero **ver mis datos de cuenta** para comprobar que están correctos | [UC-03](./Casos-de-Uso/01-Identidad-y-Usuarios.md) | FR-BE-04 | Must |
| **US-04** | Como cliente quiero **actualizar mis datos** para mantenerlos al día | [UC-04](./Casos-de-Uso/01-Identidad-y-Usuarios.md) | FR-BE-05 | Must |

### EP-02 · Tienda y compra

| ID | Historia de usuario | Caso de uso | Requisitos | Prioridad |
| --- | --- | --- | --- | --- |
| **US-05** | Como visitante quiero **ver los productos disponibles** para encontrar lo que me interesa | [UC-05](./Casos-de-Uso/02-Tienda-y-Pedidos.md) | FR-BE-09, FR-FE-02 | Must |
| **US-06** | Como cliente quiero **ver la información completa de un producto** para decidir si lo compro | [UC-06](./Casos-de-Uso/02-Tienda-y-Pedidos.md) | FR-BE-10, FR-FE-03 | Must |
| **US-07** | Como cliente quiero **armar mi carrito** para revisar mi compra antes de confirmarla | [UC-07](./Casos-de-Uso/02-Tienda-y-Pedidos.md) | FR-BE-11, FR-FE-04 | Must |
| **US-08** | Como cliente quiero **confirmar mi compra** para recibir mi pedido | [UC-08](./Casos-de-Uso/02-Tienda-y-Pedidos.md) | FR-BE-12, FR-BR-12 | Must |
| **US-09** | Como cliente quiero **ver mis pedidos anteriores** para comprobar su estado | [UC-09](./Casos-de-Uso/02-Tienda-y-Pedidos.md) | FR-BE-13 | Must |
| **US-10** | Como cliente quiero **canjear monedas por un descuento** para pagar menos en mi pedido | [UC-10](./Casos-de-Uso/02-Tienda-y-Pedidos.md) | FR-BR-07, FR-BR-08 | Must |
| **US-11** | Como administrador quiero **gestionar el catálogo y el inventario** para mantener la tienda al día | [UC-11](./Casos-de-Uso/02-Tienda-y-Pedidos.md) | FR-BE-08, FR-BE-14 | Must |

### EP-03 · Juego y economía

| ID | Historia de usuario | Caso de uso | Requisitos | Prioridad |
| --- | --- | --- | --- | --- |
| **US-12** | Como jugador quiero **explorar la aventura** para ganar monedas y guardar mis objetos | [UC-12](./Casos-de-Uso/03-Juego-y-Economia.md) | FR-GA-05, FR-GA-19, FR-BE-17 | Must |
| **US-13** | Como jugador quiero **gastar mis monedas en la ruleta** para obtener recompensas | [UC-13](./Casos-de-Uso/03-Juego-y-Economia.md) | FR-BE-16, FR-GA-11 | Must |
| **US-14** | Como cliente quiero **ver mis monedas y sus vencimientos** para saber cuánto puedo gastar | [UC-14](./Casos-de-Uso/03-Juego-y-Economia.md) | FR-BR-01, FR-BR-04 | Must |
| **US-15** | Como cliente quiero **ver mis movimientos** para entender de dónde vienen y a dónde fueron mis monedas | [UC-15](./Casos-de-Uso/03-Juego-y-Economia.md) | FR-BR-05, FR-BR-06 | Must |
| **US-16** | Como cliente quiero **simular una recarga** para obtener monedas compradas que no vencen | [UC-16](./Casos-de-Uso/03-Juego-y-Economia.md) | FR-BR-03, FR-BR-10 | Must |
| **US-19** | Como jugador quiero **canjear monedas por objetos en el mercader** para mejorar mi equipo | [UC-19](./Casos-de-Uso/03-Juego-y-Economia.md) | FR-GA-10, FR-BE-22 | Must |

### EP-04 · Avisos al usuario

| ID | Historia de usuario | Caso de uso | Requisitos | Prioridad |
| --- | --- | --- | --- | --- |
| **US-17** | Como cliente quiero **ver mis avisos** para enterarme de mis monedas, vencimientos y descuentos | [UC-17](./Casos-de-Uso/04-Notificaciones.md) | FR-NO-01 | Must |
| **US-18** | Como cliente quiero **elegir qué avisos recibo y por qué canal** para no saturarme | [UC-18](./Casos-de-Uso/04-Notificaciones.md) | FR-NO-03, FR-NO-04 | Could |

---

## 4. Criterios de aceptación (en formato de ejemplo)

Un criterio de aceptación responde a: *«¿cómo sé que esta historia está lista?»*. Debe ser
**observable** y **verificable**. Ejemplos reales del proyecto:

### US-01 · Crear una cuenta

> **Dado** que soy visitante en la pantalla de registro,
> **cuando** envío un correo y una contraseña válidos,
> **entonces** se crea mi cuenta y puedo iniciar sesión.

- ❌ *Mal criterio:* «el registro funciona». (¿Cómo se comprueba «funciona»?)
- ✅ *Buen criterio:* «un correo ya registrado devuelve `VALIDATION_ERROR` y no crea una
  segunda cuenta».

### US-08 · Confirmar mi compra

> **Dado** que tengo productos en el carrito y stock suficiente,
> **cuando** confirmo el pedido,
> **entonces** el stock se descuenta, se guarda el precio del momento y veo mi pedido.

- El criterio completo vive en [UC-08](./Casos-de-Uso/02-Tienda-y-Pedidos.md) y su regla
  en `FR-BE-12` / `FR-BR-12`.
- Caso borde ya documentado: **sin stock** → error `409` y nada se descuenta.

### US-14 · Ver mis monedas y vencimientos

> **Dado** que tengo monedas ganadas y compradas,
> **cuando** abro mi monedero,
> **entonces** veo ambos tipos por separado, con su origen y su fecha de vencimiento.

- Regla que lo respalda: `FR-BR-01` (distinguir tipos) y `FR-BR-04` (el saldo lo calcula el
  servidor).

> **Convención del equipo:** los criterios se escriben con **Dado / cuando / entonces**
> (en inglés, *Given/When/Then*) porque obliga a ser concreto y se traduce directo a una
> prueba automatizada.

---

## 5. Relación con otros documentos

| Quieres… | Ve a… |
| --- | --- |
| El detalle paso a paso de una historia | [Casos de uso](./Casos-de-Uso/README.md) |
| La regla exacta y sus criterios | [SRS](./Software-requeriments\(SRS\)/README.md) |
| Si una historia está hecha o no | [Matriz de trazabilidad](./Trazabilidad.md) |
| Cuándo se considera «terminada» | [Definition of Done](./Definition-of-Done.md) |
| El trabajo técnico que la habilita | [Historias técnicas](./Historias-Tecnicas.md) |
| Cómo se prueba | [Estrategia de pruebas](./Estrategia-de-Pruebas.md) |

---

## 6. Reglas de mantenimiento

1. **Una historia nueva necesita un caso de uso.** No se crea una historia sin su `UC-*`;
   si es puramente técnica, va a `Historias-Tecnicas.md`.
2. **Una historia tiene un dueño por iteración.** Sin dueño, no avanza.
3. **El estado no se escribe aquí.** Se consulta en la matriz; aquí solo vive la
   descripción de la historia.
4. **Si un requisito cambia, se revisa su historia el mismo día** (igual que el caso de uso).
5. **Una historia que no cabe en una iteración se divide**, no se deja a medias.

---

*Las historias son un acuerdo sobre **qué** construir y **para quién**; el SRS dice las
reglas y la matriz dice qué ya existe. Juntos evitan construir lo que nadie pidió.*
