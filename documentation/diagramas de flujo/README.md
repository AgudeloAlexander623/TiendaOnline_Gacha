# Diagramas de flujo — GearQuest

Conjunto de diagramas SVG del proyecto: flujos funcionales, arquitectura,
secuencias UML, máquina de estados del pedido y modelo de datos
(entidad-relación). Todos están **generados** por un pequeño motor propio
(`tools/`), de modo que el SVG nunca se edita a mano: se edita la
especificación y se regenera.

## 1. Índice de diagramas

| # | Archivo | Tipo | Trazabilidad principal |
|---|---------|------|------------------------|
| 01 | `01_compra_producto.svg` | Flujo | UC-07, UC-08, UC-10 · FR-BE-12, FR-BR-12 a 15 |
| 02 | `02_apertura_gacha.svg` | Flujo | UC-13, UC-14 · FR-BE-16, FR-BR-04, FR-GA-11/12 |
| 03 | `03_monedas_y_vencimiento.svg` | Flujo | UC-10, UC-14 a 16 · FR-BR-01 a 08 |
| 04 | `04_revision_comportamiento_sospechoso.svg` | Flujo | FR-SEC-04, FR-SEC-10, NFR-SEC-01 · UC-02, UC-13 |
| 05 | `05_arquitectura_general.svg` | Contenedores | README §6 · FR-DB-01 · NFR-BE-07/08 |
| 06 | `06_secuencia_autenticacion.svg` | Secuencia UML | UC-01 a 03 · FR-BE-05/06, FR-SEC-01/02 |
| 07 | `07_secuencia_juego_backend.svg` | Secuencia UML | UC-12, UC-13 · FR-BE-17, FR-GA-19/20, NFR-GA-02 |
| 08 | `08_estados_pedido.svg` | Máquina de estados | UC-08, UC-09 · FR-BE-12, FR-BE-15 |
| 09 | `09_modelo_de_datos.svg` | Entidad-relación | FR-DB-01 a 05 · Database.md §6 · Diccionario-de-Datos.md |

Resumen de contenido:

- **01 · Compra de producto** — del carrito confirmado a la notificación:
  validación en el servidor, reserva de inventario, pago simulado y auditoría.
- **02 · Apertura de gacha** — el servidor valida sesión y saldo, consume los
  lotes de monedas y entrega la recompensa en una única transacción.
- **03 · Monedas, vencimiento y descuentos** — tres disparadores en un ciclo:
  acreditación, tarea programada de vencimiento y canje de niveles.
- **04 · Revisión de comportamiento sospechoso** — detección, puntuación de
  riesgo y respuesta: Python complementa (nunca sustituye) los controles del
  backend.
- **05 · Arquitectura general** — monorepo con frontend React, cuatro
  microservicios Node, una PostgreSQL por servicio, juego Godot y análisis en
  Python (`docker-compose`).
- **06 · Autenticación** — registro/login con hash en el servidor, JWT firmado
  y middleware que verifica identidad y rol en cada petición (fragmento `alt`).
- **07 · Juego ↔ backend** — protocolo propuesto: el juego reporta y el
  servidor decide; sin validación no hay monedas y los resultados manipulados
  generan alerta.
- **08 · Ciclo de vida del pedido** — máquina de estados; solo el backend
  cambia el estado, con registro auditable.
- **09 · Modelo de datos** — 26 entidades en cuatro bases independientes (una
  por servicio), con las relaciones 1–N/1–1 y la nota de que **no hay claves
  foráneas entre servicios** (la integridad la garantiza el backend con el JWT
  verificado).

## 2. Convenciones visuales (leyenda)

Todos los diagramas comparten la misma cabecera (marca, título, subtítulo,
línea de metadatos con versión/estado/trazabilidad), leyenda y pie:

| Elemento | Significado |
|----------|-------------|
| Óvalo terminal | Inicio o fin del flujo |
| Rectángulo redondeado | Proceso (paso del sistema) |
| Rombo | Decisión (pregunta con ramas Sí/No o valor) |
| Rectángulo con cabecera de color | Responsable (microservicio/actor) |
| Borde rojo / trazo discontinuo | Ruta de error o excepción |
| Texto mono en gris | Referencia a requisito (FR-/NFR-/BR-) o caso de uso (UC-) |
| Caja amarilla | Nota: decisión pendiente o regla transversal |

Trazabilidad: cada nodo y arista relevante lleva el código del requisito del
SRS (`documentation/Software-requeriments(SRS)/`) o del caso de uso
(`documentation/Casos-de-Uso/`) que lo justifica.

## 3. Estados marcados como pendientes

Para no documentar como hecho algo que aún no está aprobado, los diagramas
llevan anotaciones explícitas:

- **Diagrama 08** — los estados del pedido se presentan como
  *«propuesto · pendiente de aprobación»* (Database.md §8 y Backend.md §8).
- **Diagrama 01** — orden de consumo de monedas pendiente (Business-Rules §7).
- **Diagrama 02/03** — tablas de gacha y regla de uso único de descuentos
  marcadas como *pendiente*.

## 4. Regenerar los SVG

Requiere solo Python 3 (sin dependencias externas):

```bash
python3 tools/generar.py          # regenera los SVG alterados
python3 tools/generar.py --check  # comprueba sin escribir (CI)
python3 tools/qa.py *.svg         # validación geométrica de los SVG
```

Propiedades del generador:

- **Determinista** — sin marcas de tiempo: dos ejecuciones producen bytes
  idénticos si no ha cambiado la especificación; `generar.py` solo reescribe
  ficheros que han cambiado.
- **Avisos de maquetación** — si un texto no cabe o una arista no puede
  enrutar se imprime un aviso; el proceso falla con `--check`.
- **Validación (`qa.py`)** — detecta cajas solapadas, aristas o líneas que
  atraviesan nodos, etiquetas de texto en colisión y textos fuera del lienzo.

## 5. Estructura de `tools/`

| Fichero | Rol |
|---------|-----|
| `svgkit.py` | Motor SVG: formas, paleta, métricas Arial, enrutado de aristas, avisos |
| `layout.py` | Renderizadores `flow`, `seq` y `explicit` + cabecera/pie/leyenda |
| `diagramas.py` | Especificación declarativa de los 9 diagramas (ediciones aquí) |
| `generar.py` | CLI: valida las especificaciones y escribe los SVG |
| `qa.py` | Validación geométrica de los SVG generados |

Para cambiar un diagrama se edita su bloque en `diagramas.py` y se ejecuta
`generar.py`. Para añadir uno nuevo, `DIAGRAMAS.append({...})` con
`kind` igual a `flow`, `seq` o `explicit`.
