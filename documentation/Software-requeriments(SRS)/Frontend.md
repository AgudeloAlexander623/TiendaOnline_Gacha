# Requisitos del Frontend — GearQuest

> **Área:** Interfaz web (lo que la persona ve y usa en el navegador)
> **Estado:** Borrador para revisión
> **Versión:** 1.0 — 2026-10-18
> **Tecnología de referencia:** React + TypeScript + Vite + Tailwind CSS
> **Documento base:** `frontend/ReadmeFrontEnd.md` y `frontend/documentation/FRONTEND_ARCHITECTURE.md`

---

## 1. Propósito

Describe **qué debe ofrecer la interfaz web**: pantallas, experiencia de uso y forma de
comunicarse con el backend. Pensado tanto para desarrolladores como para cualquier
integrante del equipo que quiera entender qué ve el usuario final.

## 2. Contexto en lenguaje sencillo

El frontend es la **vitrina** de la tienda: catálogo, carrito, monedero y perfil. Su regla
de oro es sencilla:

> **El frontend muestra; el backend decide.**

La interfaz nunca calcula por su cuenta el precio final, un descuento ni un saldo: los
pregunta al servidor y muestra la respuesta. Así nadie puede "engañar" al sistema
modificando la página.

## 3. Alcance — funcionalidades por dominio

| Dominio (`src/features/`) | Qué incluye |
| --- | --- |
| `auth` | Registro, inicio de sesión y cierre de sesión |
| `catalog` | Lista de productos y vista de detalle |
| `cart` | Carrito de compras |
| `orders` | Creación y consulta de pedidos |
| `wallet` | Monedero: saldos, tipos de moneda, vencimientos e historial |
| `discounts` | Niveles de descuento y estado de elegibilidad |
| `profile` | Datos de la cuenta y actividad del usuario |
| `game-integration` | Enlace o embebido del juego y su resultado |

## 4. Requisitos funcionales

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| FR-FE-01 | Mostrar el catálogo con búsqueda y filtros básicos y el detalle de cada producto | Must | Se listan precio, descripción, imágenes y disponibilidad; la paginación funciona |
| FR-FE-02 | Permitir registro e inicio de sesión con validación de formularios | Must | Los errores del servidor (correo duplicado, credenciales inválidas) se entienden sin conocimientos técnicos |
| FR-FE-03 | Gestionar el carrito y crear pedidos con precios servidos por el backend | Must | El total mostrado coincide exactamente con el precio confirmado por el servidor |
| FR-FE-04 | Mostrar el monedero con saldo por tipo de moneda, vencimientos e historial | Must | Se distinguen monedas ganadas (con fecha de vencimiento) y compradas (sin vencimiento) |
| FR-FE-05 | Presentar los cinco niveles de descuento (10 %, 30 %, 50 %, 70 %, 90 %) y la elegibilidad | Must | La interfaz **no** calcula el precio final: muestra lo que responde el servidor |
| FR-FE-06 | Permitir consultar y editar el perfil del usuario | Must | Los cambios se guardan y persisten tras recargar la página |
| FR-FE-07 | Integrar el acceso al juego y mostrar el resultado de las partidas | Should | Desde la cuenta se entra al juego y el resultado vuelve a reflejarse en el monedero |
| FR-FE-08 | Presentar estados claros de carga, vacío y error en cada vista | Must | Toda pantalla informa qué está pasando (cargando, sin datos, algo falló y cómo reintentar) |
| FR-FE-09 | Identificar de forma evidente que las recargas son simuladas | Must | El flujo de recarga indica en lenguaje claro que no se procesa dinero real |
| FR-FE-10 | Centralizar la comunicación con la API en la capa `services/` | Must | Ninguna pantalla hace peticiones HTTP directas; el manejo de sesión y errores es unificado |

## 5. Requisitos no funcionales

| ID | Requisito | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| NFR-FE-01 | Diseño adaptable (móvil, tablet y escritorio) | Must | La tienda es usable en un teléfono sin desplazamientos horizontales |
| NFR-FE-02 | Tipado estricto de TypeScript, sin datos "mágicos" | Must | `npm run build` compila sin errores de tipos |
| NFR-FE-03 | Ningún secreto en las variables de entorno del navegador | Must | Solo se usan variables `VITE_*`; ninguna contiene claves, tokens ni contraseñas |
| NFR-FE-04 | Accesibilidad básica | Should | Navegación por teclado posible, contraste legible y textos alternativos en imágenes |
| NFR-FE-05 | Rendimiento razonable de carga inicial | Should | Build de producción optimizado; sin recursos innecesarios en la primera carga |
| NFR-FE-06 | Consistencia visual y de código | Must | Componentes reutilizables en `components/`; lint sin incidencias; un componente por archivo |
| NFR-FE-07 | Lenguaje de negocio en la interfaz | Must | Los textos hablan de "producto", "pedido" o "monedas", no de términos internos del código |

## 6. Dependencias e integraciones

- **Backend:** consumo de las cuatro APIs por HTTP REST (contratos en
  [`Backend.md`](./Backend.md)). Sin contrato definido, no se implementa la pantalla.
- **Juego (Godot):** integración por enlace o embebido, según diseño (pendiente).
- **Estados compartidos:** cualquier tipo compartido con el backend se define en `src/types/`.

## 7. Criterios de aceptación del área

- [ ] Recorrido completo de compra simulada desde el navegador, de principio a fin.
- [ ] Ninguna pantalla calcula precios, descuentos ni saldos por su cuenta.
- [ ] Toda vista maneja correctamente los estados de carga, vacío y error.
- [ ] La app se ve y funciona correctamente en móvil y escritorio.
- [ ] `npm run build`, `npm run lint` pasan sin errores.

## 8. Decisiones pendientes

1. Librería de rutas (`react-router-dom`) y de estado global (Context vs. Zustand).
2. Librería de peticiones HTTP (fetch nativo vs. axios) y manejo de sesión.
3. Diseño visual definitivo (paleta, identidad y componentes UI).
4. Estrategia de pruebas del frontend (unitarias y de interfaz).
5. Forma concreta de integrar Godot (enlace nuevo, modal o embebido).

## 9. Referencias

- `frontend/ReadmeFrontEnd.md`: guía de entrada y comandos.
- `frontend/documentation/FRONTEND_ARCHITECTURE.md`: estructura de carpetas y principios.
