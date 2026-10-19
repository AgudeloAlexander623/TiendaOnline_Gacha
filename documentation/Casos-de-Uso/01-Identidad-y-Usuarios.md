# Casos de Uso — Identidad y Usuarios

> **Dominio:** Identidad y usuarios · **Servicio responsable:** identity-service (puerto 3001)
> **Estado:** Borrador para revisión · **Versión:** 1.0 — 2026-10-18
> **Requisitos de referencia:** [`SRS · Backend.md`](../Software-requeriments\(SRS\)/Backend.md) · [`SRS · Security.md`](../Software-requeriments\(SRS\)/Security.md)

---

## 1. Introducción

Este documento describe la **puerta de entrada** a GearQuest: cómo una persona crea su
cuenta, accede a ella y cuida sus datos. Sin una cuenta activa no hay carrito, monedero ni
juego; por eso este dominio es el primero en desarrollarse.

## 2. Actores

| Actor | Descripción en este dominio |
| --- | --- |
| **Cliente** | Visitante que se registra y, a partir de ahí, usa la tienda y el juego |

> El rol de **Administrador** no interviene aquí: aparece en
> [`02-Tienda-y-Pedidos.md`](./02-Tienda-y-Pedidos.md) (UC-11).

## 3. Mapa de casos de uso

| Caso | Nombre | Prioridad |
| --- | --- | --- |
| UC-01 | Registrarse | Must |
| UC-02 | Iniciar sesión | Must |
| UC-03 | Consultar el perfil | Must |
| UC-04 | Actualizar el perfil | Must |

## 4. Detalle de los casos de uso

### UC-01 · Registrarse

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como visitante quiero crear una cuenta para comprar, jugar y guardar mi progreso |
| Actor | Cliente |
| Precondiciones | El visitante no tiene una cuenta con ese correo |
| Disparador | Completa el formulario de registro y lo confirma |
| Prioridad | Must |

**Flujo principal**

1. El visitante abre la opción "Crear cuenta".
2. Ingresa su correo y una contraseña.
3. El servidor valida el formato y comprueba que el correo no esté en uso.
4. La cuenta se crea con el rol de cliente.
5. Se confirma el registro y la persona queda lista para iniciar sesión.

**Flujos alternativos y de excepción**

- *Correo ya registrado:* el sistema lo avisa y sugiere iniciar sesión en su lugar.
- *Datos con errores de formato:* se señala el campo con el problema y se conserva lo ya escrito.

**Resultado:** existe una cuenta activa. La contraseña se guarda protegida (con hash),
nunca en texto plano.

**Requisitos asociados (SRS):** FR-BE-05 · FR-SEC-01 · FR-SEC-03

---

### UC-02 · Iniciar sesión

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero iniciar sesión para acceder a mi cuenta, mi monedero y el juego |
| Actor | Cliente |
| Precondiciones | Existir una cuenta registrada (UC-01) |
| Disparador | Envía sus credenciales en el formulario de acceso |
| Prioridad | Must |

**Flujo principal**

1. El cliente abre "Iniciar sesión".
2. Ingresa correo y contraseña.
3. El servidor verifica las credenciales.
4. Se entrega una credencial de sesión válida.
5. La persona queda autenticada y ve su nombre en la interfaz.

**Flujos alternativos y de excepción**

- *Credenciales incorrectas:* mensaje general ("datos incorrectos") que no revela si el
  correo existe o no.
- *Demasiados intentos fallidos:* el sistema limita temporalmente los intentos (protección
  automatizada).
- *Sesión vencida:* al intentar acceder a una zona privada, se pide iniciar sesión otra vez.

**Resultado:** el cliente tiene una sesión activa con la que puede operar.

**Requisitos asociados (SRS):** FR-BE-06 · FR-SEC-02 · FR-SEC-04

---

### UC-03 · Consultar el perfil

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero ver mis datos de cuenta para comprobar que están correctos |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02) |
| Disparador | Entra a la sección "Mi cuenta" |
| Prioridad | Must |

**Flujo principal**

1. El cliente accede a "Mi cuenta".
2. El servidor devuelve sus datos (correo, nombre y rol).
3. La interfaz muestra la información de forma clara.

**Flujos alternativos y de excepción**

- *Sesión expirada:* se redirige al inicio de sesión.

**Resultado:** el cliente conoce el estado de su cuenta; no se modifica nada.

**Requisitos asociados (SRS):** FR-BE-07 · FR-SEC-02

---

### UC-04 · Actualizar el perfil

| Campo | Contenido |
| --- | --- |
| Historia de usuario | Como cliente quiero actualizar mis datos para mantenerlos al día |
| Actor | Cliente |
| Precondiciones | Sesión iniciada (UC-02) |
| Disparador | Guarda los cambios hechos en "Editar perfil" |
| Prioridad | Must |

**Flujo principal**

1. El cliente abre "Editar perfil".
2. Modifica los campos que desee cambiar.
3. Pulsa "Guardar".
4. El servidor valida los datos nuevos y los persiste.
5. Se confirma que los cambios quedaron guardados.

**Flujos alternativos y de excepción**

- *Datos inválidos:* se señala el campo y no se guarda nada.
- *Sesión expirada:* se pide iniciar sesión antes de continuar.

**Resultado:** los datos actualizados quedan guardados. Un cliente solo puede modificar su
propia cuenta.

**Requisitos asociados (SRS):** FR-BE-07 · FR-SEC-02 · FR-SEC-03
