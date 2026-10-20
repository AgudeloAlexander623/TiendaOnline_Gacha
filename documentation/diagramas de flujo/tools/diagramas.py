"""diagramas.py — especificaciones declarativas de los diagramas de GearQuest.

Cada diagrama es un diccionario de datos; la geometría y el estilo los resuelve
``layout.py``. Reglas de mantenimiento (equipo GearQuest):

  1. Si cambia un requisito del SRS o un caso de uso, se actualiza aquí el
     texto **y** los códigos de trazabilidad (refs) el mismo día.
  2. Nunca se documenta como "implementado" algo que no existe en el código:
     los estados y reglas propuestas se marcan como *pendientes* en el texto.
  3. Se añaden diagramas nuevos numerando (05, 06, …) y registrándolos en
     ``README.md`` de esta carpeta.

Convención de ``refs``: códigos del SRS (FR-xx-nn / NFR-xx-nn) y de casos de
uso (UC-nn), separados por « · ».
"""

from typing import List

FECHA = "2026-10-19"


def meta(version: str, traza: str, estado: str = "revisado") -> dict:
    return {"version": version, "fecha": FECHA, "estado": estado,
            "traza": traza, "owner": "Equipo GearQuest"}


DIAGRAMAS: List[dict] = []


# ===========================================================================
# 01 · Compra de producto
# ===========================================================================

DIAGRAMAS.append({
    "kind": "flow",
    "id": "01",
    "file": "01_compra_producto.svg",
    "title": "Compra de producto",
    "subtitle": "Del carrito confirmado a la notificación: validación en el "
                "servidor, reserva de inventario, pago simulado y auditoría.",
    "meta": meta("2.0", "UC-07, UC-08, UC-10 · FR-BE-12, FR-BR-12 a 15"),
    "width": 1120,
    "nodes": [
        {"id": "n1", "kind": "terminal", "owner": "frontend",
         "text": "El cliente revisa el carrito y confirma la compra",
         "refs": "UC-07 · UC-08"},
        {"id": "n2", "kind": "process", "owner": "store-service",
         "text": "POST /orders: valida sesión, esquema y formato del cuerpo "
                 "(Zod) y aplica rate limit", "refs": "FR-BE-02 · FR-SEC-04"},
        {"id": "n3", "kind": "decision",
         "text": "¿Entrada y sesión válidas?", "refs": "FR-SEC-02"},
        {"id": "e1", "kind": "error",
         "text": "Responde 400/401 con mensaje genérico; el log identifica la "
                 "operación sin secretos", "refs": "FR-BE-04 · FR-SEC-08"},
        {"id": "n4", "kind": "process", "owner": "store-service",
         "text": "Recalcula precios y total con la vigencia del catálogo: el "
                 "navegador nunca envía precios", "refs": "FR-BR-12 · FR-BR-09"},
        {"id": "n5", "kind": "process", "owner": "store-service",
         "text": "Si hay descuento canjeado, verifica nivel, elegibilidad, "
                 "vigencia y límite", "refs": "FR-BE-13 · FR-BR-08"},
        {"id": "nota1", "kind": "note", "w": 250,
         "text": "Pendiente (Business-Rules §7.2): vigencia y uso único de "
                 "los descuentos. El total final siempre lo calcula el "
                 "servidor, nunca la interfaz."},
        {"id": "n6", "kind": "process", "owner": "store-service",
         "text": "Reserva el inventario en una transacción (sin stock "
                 "negativo)", "refs": "FR-BR-13 · FR-BE-12"},
        {"id": "n7", "kind": "decision",
         "text": "¿Stock suficiente para todos los ítems?", "refs": "FR-BR-13"},
        {"id": "e2", "kind": "error",
         "text": "Se libera lo reservado y responde 409 «stock insuficiente»: "
                 "no se crea el pedido", "refs": "FR-BE-12"},
        {"id": "e3", "kind": "terminal", "fill": "#fef2f2", "stroke": "#dc2626",
         "text": "Fin (error): el cliente ajusta el carrito y reintenta",
         "refs": "UC-07"},
        {"id": "n8", "kind": "process", "owner": "store-service",
         "text": "Crea el pedido con ID único en estado PENDIENTE; clave de "
                 "idempotencia para doble clic", "refs": "FR-BE-19 · FR-BR-15"},
        {"id": "n9", "kind": "process", "owner": "payments-service",
         "text": "Registra la recarga/pago SIMULADO: sin tarjetas ni dinero "
                 "real, claramente identificado", "refs": "FR-BE-20 · FR-BR-10"},
        {"id": "n10", "kind": "decision",
         "text": "¿El pago simulado se aprobó?"},
        {"id": "e4", "kind": "error",
         "text": "Se libera la reserva y el pedido pasa a FALLIDO con el "
                 "motivo registrado", "refs": "FR-BE-12 · FR-BE-15"},
        {"id": "e5", "kind": "terminal", "fill": "#fef2f2", "stroke": "#dc2626",
         "text": "Fin (error): intento auditado; se puede reintentar",
         "refs": "FR-BE-15"},
        {"id": "n11", "kind": "process", "owner": "store-service",
         "text": "Transacción final: CONFIRMADO, la reserva pasa a descuento "
                 "definitivo y los precios quedan congelados",
         "refs": "FR-BR-12 · FR-BR-13"},
        {"id": "n12", "kind": "process", "owner": "notificaciones",
         "text": "Notificación interna con el resumen del pedido (correo solo "
                 "si hay proveedor configurado)", "refs": "FR-NO-06 · FR-NO-07"},
        {"id": "n13", "kind": "terminal", "owner": "frontend",
         "text": "Fin (éxito): confirmación con resumen y total final",
         "refs": "UC-08 · FR-NO-06"},
    ],
    "spine": ["n1", "n2", "n3", "n4", "n5", "n6", "n7", "n8", "n9", "n10",
              "n11", "n12", "n13"],
    "branches": {
        "n3": {"right": ["e1"]},
        "n5": {"left": ["nota1"]},
        "n7": {"right": ["e2", "e3"]},
        "n10": {"right": ["e4", "e5"]},
    },
    "edges": [
        {"src": "n1", "dst": "n2"},
        {"src": "n2", "dst": "n3"},
        {"src": "n3", "dst": "n4", "label": "Sí", "style": "ok"},
        {"src": "n3", "dst": "e1", "label": "No", "style": "err"},
        {"src": "e1", "dst": "n1", "label": "corregir y reintentar",
         "style": "err", "route": "loop_r", "t": 0.72},
        {"src": "n4", "dst": "n5"},
        {"src": "n5", "dst": "n6"},
        {"src": "n6", "dst": "n7"},
        {"src": "n7", "dst": "n8", "label": "Sí", "style": "ok"},
        {"src": "n7", "dst": "e2", "label": "No", "style": "err"},
        {"src": "e2", "dst": "e3"},
        {"src": "n8", "dst": "n9"},
        {"src": "n9", "dst": "n10"},
        {"src": "n10", "dst": "n11", "label": "Sí", "style": "ok"},
        {"src": "n10", "dst": "e4", "label": "No", "style": "err"},
        {"src": "e4", "dst": "e5"},
        {"src": "n11", "dst": "n12", "label": "pedido confirmado"},
        {"src": "n12", "dst": "n13"},
    ],
})


# ===========================================================================
# 02 · Apertura de gacha
# ===========================================================================

DIAGRAMAS.append({
    "kind": "flow",
    "id": "02",
    "file": "02_apertura_gacha.svg",
    "title": "Apertura de gacha (tirada)",
    "subtitle": "El servidor valida sesión y saldo, consume los lotes de "
                "monedas y entrega la recompensa en una única transacción.",
    "meta": meta("2.0", "UC-13, UC-14 · FR-BE-16, FR-BR-04, FR-GA-11, FR-GA-12"),
    "width": 1120,
    "nodes": [
        {"id": "g1", "kind": "terminal", "owner": "godot",
         "text": "El jugador abre la ruta gacha y elige una tirada",
         "refs": "UC-13 · FR-GA-15"},
        {"id": "g2", "kind": "process", "owner": "frontend",
         "text": "Muestra el costo de la tirada y el saldo actual, ambos "
                 "calculados por el servidor", "refs": "FR-GA-15 · FR-FE-04"},
        {"id": "g3", "kind": "decision", "text": "¿Sesión de juego válida?",
         "refs": "FR-GA-18"},
        {"id": "ge1", "kind": "error",
         "text": "401: sin sesión no hay tiradas ni consulta de monedero",
         "refs": "FR-SEC-02 · FR-GA-18"},
        {"id": "ge2", "kind": "terminal", "fill": "#fef2f2", "stroke": "#dc2626",
         "text": "Fin (error): iniciar sesión para jugar", "refs": "UC-02"},
        {"id": "g4", "kind": "process", "owner": "economy-service",
         "text": "Consulta el monedero: saldo desglosado por tipo de moneda y "
                 "vencimiento", "refs": "FR-BE-14 · FR-BR-04"},
        {"id": "g5", "kind": "decision",
         "text": "¿Saldo vigente ≥ costo de la tirada?", "refs": "FR-BE-16"},
        {"id": "ge3", "kind": "error",
         "text": "Saldo insuficiente: sugiere el minijuego (ganar monedas) o "
                 "una recarga simulada", "refs": "FR-BR-04 · UC-16"},
        {"id": "ge4", "kind": "terminal", "fill": "#fef2f2", "stroke": "#dc2626",
         "text": "Fin (error): no se descuenta nada", "refs": "FR-BR-15"},
        {"id": "g6", "kind": "process", "owner": "economy-service",
         "text": "Selecciona los lotes a consumir: primero los ganados por "
                 "vencer (más próximos) y después los comprados",
         "refs": "FR-BR-04 · FR-DB-04"},
        {"id": "nota2", "kind": "note", "w": 258,
         "text": "Pendiente (Business-Rules §7.3 y §7.4): orden de consumo y "
                 "tabla de coste, probabilidades y recompensas del gacha. La "
                 "casa siempre gana (FR-GA-12)."},
        {"id": "g7", "kind": "process", "owner": "economy-service",
         "text": "Descuenta el costo y elige la recompensa con la tabla de "
                 "probabilidades del servidor", "refs": "FR-BE-16 · FR-GA-12"},
        {"id": "g8", "kind": "process", "owner": "economy-service",
         "text": "Una sola transacción: débito de monedas + registro de la "
                 "tirada + recompensa en inventario",
         "refs": "FR-BE-19 · FR-DB-04"},
        {"id": "nota3", "kind": "note", "w": 258,
         "text": "El cliente nunca envía un saldo que el servidor acepte sin "
                 "validar: el resultado se calcula aquí, no en el juego "
                 "(NFR-GA-02 · FR-BR-16)."},
        {"id": "g9", "kind": "decision", "text": "¿La transacción se completó?",
         "refs": "FR-BE-19"},
        {"id": "ge5", "kind": "error",
         "text": "Rollback total: saldo e inventario intactos; el reintento "
                 "usa la misma clave de idempotencia", "refs": "FR-BE-19"},
        {"id": "ge6", "kind": "terminal", "fill": "#fef2f2", "stroke": "#dc2626",
         "text": "Fin (error): la tirada no queda registrada",
         "refs": "FR-DB-04"},
        {"id": "g10", "kind": "process", "owner": "servicio-python",
         "text": "Publica el evento de juego para el análisis de "
                 "comportamiento (medida complementaria)", "refs": "FR-SEC-10"},
        {"id": "g11", "kind": "process", "owner": "notificaciones",
         "text": "Muestra la recompensa, actualiza monedero e inventario y "
                 "emite el aviso interno", "refs": "FR-NO-02 · FR-GA-21"},
        {"id": "g12", "kind": "terminal", "owner": "frontend",
         "text": "Fin: la tirada queda en el historial de la cuenta",
         "refs": "UC-13 · FR-GA-21"},
    ],
    "spine": ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", "g9", "g10",
              "g11", "g12"],
    "branches": {
        "g3": {"right": ["ge1", "ge2"]},
        "g5": {"right": ["ge3", "ge4"]},
        "g6": {"left": ["nota2"]},
        "g8": {"left": ["nota3"]},
        "g9": {"right": ["ge5", "ge6"]},
    },
    "phases": [
        {"label": "FASE 1 · VALIDACIÓN", "from": "g1", "to": "g5"},
        {"label": "FASE 2 · DÉBITO Y RECOMPENSA", "from": "g6", "to": "g9"},
        {"label": "FASE 3 · ENTREGA", "from": "g10", "to": "g12"},
    ],
    "edges": [
        {"src": "g1", "dst": "g2"},
        {"src": "g2", "dst": "g3"},
        {"src": "g3", "dst": "g4", "label": "Sí", "style": "ok"},
        {"src": "g3", "dst": "ge1", "label": "No", "style": "err"},
        {"src": "ge1", "dst": "ge2"},
        {"src": "g4", "dst": "g5"},
        {"src": "g5", "dst": "g6", "label": "Sí", "style": "ok"},
        {"src": "g5", "dst": "ge3", "label": "No", "style": "err"},
        {"src": "ge3", "dst": "ge4"},
        {"src": "g6", "dst": "g7"},
        {"src": "g7", "dst": "g8"},
        {"src": "g8", "dst": "g9"},
        {"src": "g9", "dst": "g10", "label": "Sí", "style": "ok"},
        {"src": "g9", "dst": "ge5", "label": "No", "style": "err"},
        {"src": "ge5", "dst": "ge6"},
        {"src": "g10", "dst": "g11", "style": "soft"},
        {"src": "g11", "dst": "g12"},
    ],
})


# ===========================================================================
# 03 · Monedas, vencimiento y descuentos
# ===========================================================================

DIAGRAMAS.append({
    "kind": "flow",
    "id": "03",
    "file": "03_monedas_y_vencimiento.svg",
    "title": "Monedas, vencimiento y descuentos",
    "subtitle": "Tres disparadores en un solo ciclo: acreditación, tarea "
                "programada de vencimiento y canje de niveles de descuento.",
    "meta": meta("2.0", "UC-10, UC-14, UC-15, UC-16 · FR-BR-01 a 08"),
    "width": 1180,
    "nodes": [
        {"id": "m1", "kind": "terminal", "owner": "economy-service",
         "text": "Evento de acreditación: partida validada o recarga simulada "
                 "confirmada", "refs": "UC-12 · UC-16"},
        {"id": "m2", "kind": "decision", "text": "¿De qué origen son las "
                                                 "monedas?", "refs": "FR-BR-01"},
        {"id": "mg", "kind": "process", "owner": "economy-service",
         "text": "Ganadas jugando: vencimiento = hoy + 30 días",
         "refs": "FR-BR-02 · FR-BE-18"},
        {"id": "mc", "kind": "process", "owner": "payments-service",
         "text": "Compradas por recarga simulada: nunca vencen",
         "refs": "FR-BR-03 · FR-BE-21"},
        {"id": "m3", "kind": "process", "owner": "economy-service",
         "text": "Agrega el movimiento al historial inmutable y recalcula el "
                 "saldo disponible", "refs": "FR-BR-06 · FR-DB-04"},
        {"id": "m4", "kind": "process", "owner": "notificaciones",
         "text": "Notificación interna del monto acreditado (correo/SMS solo "
                 "con proveedor configurado)", "refs": "FR-NO-02 · FR-NO-07"},
        {"id": "m5", "kind": "terminal", "owner": "economy-service",
         "text": "Tarea programada (diaria): revisa los lotes de monedas "
                 "ganadas", "refs": "FR-BE-18"},
        {"id": "m6", "kind": "decision",
         "text": "¿Vencen en ≤ N días? (N por definir)", "refs": "FR-NO-03"},
        {"id": "mn", "kind": "process", "owner": "notificaciones",
         "text": "Aviso de vencimiento próximo con monto y fecha",
         "refs": "FR-NO-03"},
        {"id": "m7", "kind": "decision", "text": "¿Ya vencieron?",
         "refs": "FR-BR-02"},
        {"id": "me", "kind": "terminal",
         "text": "Sin acciones: el lote sigue disponible", "refs": "FR-BR-01"},
        {"id": "m8", "kind": "process", "owner": "economy-service",
         "text": "Excluye los lotes vencidos del saldo y agrega el movimiento "
                 "VENCIMIENTO sin borrar el original",
         "refs": "FR-BR-05 · FR-DB-04"},
        {"id": "m9", "kind": "process", "owner": "notificaciones",
         "text": "Aviso «tus monedas vencidas» y registro del envío",
         "refs": "FR-NO-04 · NFR-NO-03"},
        {"id": "m10", "kind": "terminal",
         "text": "Fin del ciclo: saldo e historial actualizados",
         "refs": "FR-BR-06"},
        {"id": "m11", "kind": "terminal", "owner": "frontend",
         "text": "El cliente solicita canjear un descuento (10 % · 30 % · 50 %"
                 " · 70 % · 90 %)", "refs": "UC-10 · FR-BR-07"},
        {"id": "m12", "kind": "process", "owner": "store-service",
         "text": "El servidor calcula elegibilidad, saldo, vigencia y límite "
                 "del nivel elegido", "refs": "FR-BR-08"},
        {"id": "m13", "kind": "decision",
         "text": "¿Elegible y con saldo suficiente?", "refs": "FR-BR-08"},
        {"id": "me2", "kind": "terminal", "fill": "#fef2f2", "stroke": "#dc2626",
         "text": "Fin (error): sin canje y con el motivo visible",
         "refs": "FR-BR-08"},
        {"id": "m14", "kind": "process", "owner": "economy-service",
         "text": "Consume las monedas por el orden definido y registra el "
                 "canje en el historial", "refs": "FR-BR-15 · FR-BR-06"},
        {"id": "nota4", "kind": "note", "w": 258,
         "text": "Pendiente (Business-Rules §7.1 y §7.3): monedas necesarias "
                 "por nivel y orden de consumo. Propuesta: primero las "
                 "ganadas por vencer, después las compradas."},
        {"id": "m15", "kind": "process", "owner": "store-service",
         "text": "El pedido usa el descuento una sola vez y el total lo "
                 "calcula el servidor", "refs": "FR-BR-14 · FR-BR-09"},
        {"id": "m16", "kind": "terminal", "owner": "frontend",
         "text": "Fin: descuento disponible para el pedido (Flujo 01)",
         "refs": "UC-08 · UC-10"},
    ],
    "spine": ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10",
              "m11", "m12", "m13", "m14", "m15", "m16"],
    "branches": {
        "m2": {"left": ["mg"], "right": ["mc"]},
        "m6": {"right": ["mn"]},
        "m7": {"right": ["me"]},
        "m13": {"right": ["me2"]},
        "m14": {"left": ["nota4"]},
    },
    "phases": [
        {"label": "FASE A · ACREDITACIÓN", "from": "m1", "to": "m4"},
        {"label": "FASE B · VENCIMIENTO PROGRAMADO", "from": "m5", "to": "m10"},
        {"label": "FASE C · CANJE DE DESCUENTOS", "from": "m11", "to": "m16"},
    ],
    "edges": [
        {"src": "m1", "dst": "m2"},
        {"src": "m2", "dst": "mg", "label": "jugando", "style": "ok"},
        {"src": "m2", "dst": "mc", "label": "recarga", "style": "ok"},
        {"src": "mg", "dst": "m3", "style": "soft"},
        {"src": "mc", "dst": "m3", "style": "soft"},
        {"src": "m3", "dst": "m4"},
        {"src": "m4", "dst": "m5", "label": "disparador: tarea diaria",
         "style": "soft", "dashed": True},
        {"src": "m5", "dst": "m6"},
        {"src": "m6", "dst": "mn", "label": "Sí", "style": "ok"},
        {"src": "mn", "dst": "m7", "style": "soft"},
        {"src": "m6", "dst": "m7", "label": "No"},
        {"src": "m7", "dst": "m8", "label": "Sí", "style": "ok"},
        {"src": "m7", "dst": "me", "label": "No"},
        {"src": "m8", "dst": "m9"},
        {"src": "m9", "dst": "m10"},
        {"src": "m10", "dst": "m11", "label": "otro disparador: alta de "
                                              "descuento", "style": "soft",
         "dashed": True},
        {"src": "m11", "dst": "m12"},
        {"src": "m12", "dst": "m13"},
        {"src": "m13", "dst": "m14", "label": "Sí", "style": "ok"},
        {"src": "m13", "dst": "me2", "label": "No", "style": "err"},
        {"src": "m14", "dst": "m15"},
        {"src": "m15", "dst": "m16"},
    ],
})


# ===========================================================================
# 04 · Revisión de comportamiento sospechoso
# ===========================================================================

DIAGRAMAS.append({
    "kind": "flow",
    "id": "04",
    "file": "04_revision_comportamiento_sospechoso.svg",
    "title": "Revisión de comportamiento sospechoso",
    "subtitle": "Detección, puntuación de riesgo y respuesta: el análisis en "
                "Python complementa (nunca sustituye) los controles del "
                "backend.",
    "meta": meta("2.0", "FR-SEC-04, FR-SEC-10 · NFR-SEC-01 · UC-02, UC-13"),
    "width": 1080,
    "nodes": [
        {"id": "a1", "kind": "terminal", "owner": "equipo",
         "text": "Acción relevante: inicio de sesión, tirada, recarga o "
                 "pedido", "refs": "UC-02 · UC-13 · UC-16"},
        {"id": "a2", "kind": "process",
         "text": "El servicio afectado emite el evento mínimo: usuario, tipo, "
                 "hora y resultado, sin datos sensibles",
         "refs": "FR-SEC-09 · NFR-DB-03"},
        {"id": "a3", "kind": "process",
         "text": "Controles inmediatos en el propio servicio: validación, "
                 "rate limit y límites de saldo", "refs": "FR-SEC-04 · FR-BE-19"},
        {"id": "a4", "kind": "process", "owner": "servicio-python",
         "text": "El servicio Python (FastAPI) puntúa el riesgo del evento "
                 "con sus reglas", "refs": "FR-SEC-10"},
        {"id": "nota5", "kind": "note", "w": 254,
         "text": "El servicio Python es complementario: las validaciones "
                 "críticas siguen en el backend y él no abre la base de datos "
                 "de los demás servicios (Security.md §7.2 · FR-DB-01)."},
        {"id": "a5", "kind": "decision",
         "text": "¿El puntaje supera el umbral configurado?"},
        {"id": "aok", "kind": "terminal",
         "text": "Fin: acción permitida y archivada para auditoría",
         "refs": "FR-SEC-10"},
        {"id": "a6", "kind": "process",
         "text": "Marca el evento para revisión manual y aplica el límite "
                 "temporal de la política", "refs": "FR-SEC-04"},
        {"id": "a7", "kind": "decision",
         "text": "¿La política exige bloqueo inmediato?"},
        {"id": "ab", "kind": "terminal", "fill": "#fef2f2", "stroke": "#dc2626",
         "text": "Rechazo temporal con mensaje genérico; se registra el "
                 "intento", "refs": "FR-SEC-04 · FR-SEC-08"},
        {"id": "a8", "kind": "process", "owner": "notificaciones",
         "text": "Alerta al equipo por el canal interno con el detalle del "
                 "evento", "refs": "FR-NO-01 · FR-NO-06"},
        {"id": "a9", "kind": "process",
         "text": "Auditoría inmutable de la decisión, el puntaje y la "
                 "evidencia", "refs": "FR-DB-04 · FR-SEC-09"},
        {"id": "a10", "kind": "terminal",
         "text": "Fin: controles críticos del backend siguen activos",
         "refs": "FR-SEC-10 · NFR-SEC-01"},
    ],
    "spine": ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10"],
    "branches": {
        "a4": {"left": ["nota5"]},
        "a5": {"left": ["aok"]},
        "a7": {"right": ["ab"]},
    },
    "phases": [
        {"label": "FASE 1 · DETECCIÓN", "from": "a1", "to": "a4"},
        {"label": "FASE 2 · EVALUACIÓN Y RESPUESTA", "from": "a5", "to": "a10"},
    ],
    "edges": [
        {"src": "a1", "dst": "a2"},
        {"src": "a2", "dst": "a3"},
        {"src": "a3", "dst": "a4", "style": "soft"},
        {"src": "a4", "dst": "a5", "label": "evento enriquecido",
         "style": "soft"},
        {"src": "a5", "dst": "a6", "label": "Sí", "style": "err"},
        {"src": "a5", "dst": "aok", "label": "No", "style": "ok"},
        {"src": "a6", "dst": "a7"},
        {"src": "a7", "dst": "ab", "label": "Sí", "style": "err"},
        {"src": "a7", "dst": "a8", "label": "No"},
        {"src": "a8", "dst": "a9"},
        {"src": "a9", "dst": "a10"},
    ],
})


# ===========================================================================
# 05 · Arquitectura general (nuevo)
# ===========================================================================

DIAGRAMAS.append({
    "kind": "explicit",
    "id": "05",
    "file": "05_arquitectura_general.svg",
    "title": "Arquitectura general (contenedores)",
    "subtitle": "Monorepo con frontend React, cuatro microservicios Node, una "
                "base PostgreSQL por servicio, juego Godot y análisis en "
                "Python.",
    "meta": meta("1.0", "README §6 · FR-DB-01 · NFR-BE-07 · NFR-BE-08"),
    "width": 1600,
    "containers": [
        {"label": "docker-compose · backend/infra/docker", "sub": "entorno "
         "reproducible (NFR-BE-08)",
         "x": 620, "y": 60, "w": 630, "h": 680,
         "fill": "#f8fafc", "stroke": "#94a3b8"},
    ],
    "nodes": [
        {"id": "cliente", "kind": "actor", "cx": 95, "cy": 150,
         "label": "Cliente", "sub": "navegador"},
        {"id": "admin", "kind": "actor", "cx": 95, "cy": 340,
         "label": "Administrador", "sub": "rol admin"},
        {"id": "fe", "kind": "box", "cx": 355, "cy": 165, "w": 260,
         "owner": "frontend", "refs": "FR-FE-10 · NFR-FE-03",
         "title": "Frontend web",
         "bullets": ["React 18 + TypeScript + Vite + Tailwind",
                     "src/features/* · services/ (única capa HTTP)",
                     "Precios, saldos y permisos: solo del backend"]},
        {"id": "game", "kind": "box", "cx": 355, "cy": 445, "w": 260,
         "owner": "godot", "refs": "FR-GA-19 · FR-GA-20",
         "title": "Juego (GAME/ · pendiente)",
         "bullets": ["Godot 2D + C++ · aventura, gacha y minijuego",
                     "Reporta resultados; nunca fija saldos",
                     "Sesión válida obligatoria (FR-GA-18)"]},
        {"id": "ident", "kind": "box", "cx": 770, "cy": 150, "w": 215,
         "owner": "identity-service", "refs": "FR-BE-05 · FR-BE-08",
         "title": "identity-service :3001",
         "bullets": ["Registro, login, JWT y roles",
                     "Módulos: auth · users · health"]},
        {"id": "store", "kind": "box", "cx": 770, "cy": 290, "w": 215,
         "owner": "store-service", "refs": "FR-BE-12 · FR-BE-13",
         "title": "store-service :3002",
         "bullets": ["Catálogo, carrito, pedidos",
                     "Inventario y niveles de descuento"]},
        {"id": "econ", "kind": "box", "cx": 770, "cy": 430, "w": 215,
         "owner": "economy-service", "refs": "FR-BE-16 · FR-BE-18",
         "title": "economy-service :3003",
         "bullets": ["Monedero, gacha y recompensas",
                     "Movimientos, vencimientos y reglas"]},
        {"id": "pay", "kind": "box", "cx": 770, "cy": 570, "w": 215,
         "owner": "payments-service", "refs": "FR-BE-20 · FR-BE-21",
         "title": "payments-service :3004",
         "bullets": ["Recargas simuladas",
                     "Sin datos bancarios ni dinero real"]},
        {"id": "db1", "kind": "db", "cx": 1105, "cy": 150, "w": 168, "h": 58,
         "title": "bd_identity", "sub": "base propia (FR-DB-01)",
         "refs": "FR-DB-07"},
        {"id": "db2", "kind": "db", "cx": 1105, "cy": 290, "w": 168, "h": 58,
         "title": "bd_store", "sub": "base propia (FR-DB-01)",
         "refs": "FR-DB-07"},
        {"id": "db3", "kind": "db", "cx": 1105, "cy": 430, "w": 168, "h": 58,
         "title": "bd_economy", "sub": "base propia (FR-DB-01)",
         "refs": "FR-DB-07"},
        {"id": "db4", "kind": "db", "cx": 1105, "cy": 570, "w": 168, "h": 58,
         "title": "bd_payments", "sub": "base propia (FR-DB-01)",
         "refs": "FR-DB-07"},
        {"id": "notif", "kind": "box", "cx": 770, "cy": 680, "w": 285,
         "owner": "notificaciones", "refs": "FR-NO-01 · FR-NO-07",
         "title": "Notificaciones",
         "bullets": ["Internas siempre; correo y SMS opcionales",
                     "Se activan solo con proveedor configurado"]},
        {"id": "py", "kind": "box", "cx": 1420, "cy": 430, "w": 235,
         "owner": "servicio-python", "refs": "FR-SEC-10",
         "title": "Análisis de fraude (Python)",
         "bullets": ["FastAPI: recibe eventos y puntúa riesgo",
                     "Complementario: no valida reglas críticas"]},
        {"id": "nota6", "kind": "box", "cx": 355, "cy": 690, "w": 300,
         "fill": "#fefce8", "stroke": "#ca8a04", "refs": "FR-BR-16",
         "title": "Regla transversal",
         "bullets": ["El backend es la fuente de verdad: ningún cliente "
                     "envía saldos o precios que se acepten sin validar",
                     "Kubernetes opcional (Infrastructure.md §7)"]},
    ],
    "edges": [
        {"src": "cliente", "dst": "fe", "label": "HTTPS · SPA", "style": "ok"},
        {"src": "admin", "dst": "fe", "label": "gestión (FR-BE-08)",
         "style": "soft"},
        {"src": "fe", "dst": "ident", "label": "REST/JSON · JWT", "t": 0.55},
        {"src": "fe", "dst": "store", "label": "catálogo y pedidos",
         "t": 0.62},
        {"src": "fe", "dst": "econ", "label": "monedero y descuentos",
         "t": 0.5},
        {"src": "fe", "dst": "pay", "label": "recargas simuladas", "t": 0.6},
        {"src": "game", "dst": "econ", "label": "sesión, tiradas y resultados",
         "t": 0.55, "style": "ok"},
        {"src": "game", "dst": "fe", "label": "integración en la tienda "
                                              "(pendiente)", "style": "soft",
         "route": "elbow_h", "t": 0.3},
        {"src": "ident", "dst": "db1", "style": "soft"},
        {"src": "store", "dst": "db2", "style": "soft"},
        {"src": "econ", "dst": "db3", "style": "soft"},
        {"src": "pay", "dst": "db4", "style": "soft"},
        {"src": "store", "dst": "notif", "label": "evento", "style": "soft",
         "route": "elbow_h", "mid": 985, "t": 0.75},
        {"src": "econ", "dst": "notif", "label": "evento", "style": "soft",
         "route": "elbow_h", "mid": 960, "t": 0.75},
        {"src": "notif", "dst": "fe", "label": "avisos internos",
         "style": "soft", "route": "elbow_h", "mid": 555, "t": 0.35},
        {"src": "econ", "dst": "py", "label": "eventos de riesgo",
         "style": "soft", "route": "elbow_v", "mid": 485, "t": 0.55},
        {"src": "py", "dst": "store", "label": "alerta para revisión",
         "style": "soft", "t": 0.35},
    ],
    "extra_h": 40,
})


# ===========================================================================
# 06 · Secuencia de autenticación (nuevo)
# ===========================================================================

DIAGRAMAS.append({
    "kind": "seq",
    "id": "06",
    "file": "06_secuencia_autenticacion.svg",
    "title": "Secuencia de autenticación y autorización",
    "subtitle": "Registro/login con hash en el servidor, JWT firmado y "
                "middleware que verifica identidad y rol en cada petición.",
    "meta": meta("1.0", "UC-01, UC-02, UC-03 · FR-BE-05, FR-BE-06, FR-SEC-01, "
                        "FR-SEC-02"),
    "width": 1240,
    "gap": 175,
    "participants": [
        {"id": "cli", "label": "Cliente", "sub": "navegador", "color": "#334155"},
        {"id": "fe", "label": "Frontend", "sub": "React · services/", "color": "#2563eb"},
        {"id": "idp", "label": "identity-service", "sub": ":3001 · Express + Zod",
         "color": "#7c3aed"},
        {"id": "db", "label": "PostgreSQL", "sub": "bd_identity", "color": "#1d4ed8"},
    ],
    "actions": [
        {"msg": ("cli", "fe"),
         "label": "Envía el formulario de inicio de sesión (/login)"},
        {"msg": ("fe", "idp"),
         "label": "POST /auth/login { email, password }"},
        {"self": "idp",
         "label": "Valida el esquema con Zod y aplica rate limit (FR-SEC-04)"},
        {"msg": ("idp", "db"), "label": "SELECT usuario por correo"},
        {"msg": ("db", "idp"), "style": "reply",
         "label": "Registro con hash Argon2id/bcrypt y rol"},
        {"frag_open": "alt", "span": ("idp", "fe")},
        {"self": "idp",
         "label": "Compara el hash sin exponer la contraseña (FR-SEC-01)"},
        {"msg": ("idp", "fe"), "style": "reply",
         "label": "200 · access token (JWT) + refresh en cookie httpOnly"},
        {"note": "Rama alternativa: credenciales inválidas → 401 con mensaje "
                 "genérico, sin distinguir usuario inexistente de contraseña "
                 "incorrecta (FR-SEC-08).",
         "span": ("idp", "fe")},
        {"frag_close": None},
        {"msg": ("fe", "cli"), "style": "reply",
         "label": "Sesión iniciada; el token no se expone en el código "
                  "(NFR-FE-03)"},
        {"msg": ("cli", "fe"),
         "label": "Navega a una ruta protegida (/perfil)"},
        {"msg": ("fe", "idp"),
         "label": "GET /users/me — Authorization: Bearer <jwt>"},
        {"self": "idp",
         "label": "Middleware: firma, expiración y rol (cliente/admin)"},
        {"msg": ("idp", "fe"), "style": "reply",
         "label": "200 · perfil, o 401 si el token venció"},
        {"msg": ("fe", "cli"), "style": "reply",
         "label": "Perfil visible; sin datos de otros usuarios (FR-BE-07)"},
    ],
})


# ===========================================================================
# 07 · Secuencia juego ↔ backend (nuevo)
# ===========================================================================

DIAGRAMAS.append({
    "kind": "seq",
    "id": "07",
    "file": "07_secuencia_juego_backend.svg",
    "title": "Secuencia juego ↔ backend (validación de partidas)",
    "subtitle": "Protocolo propuesto: el juego reporta y el servidor decide. "
                "Sin validación no hay monedas; los resultados manipulados "
                "generan alerta.",
    "meta": meta("1.0", "UC-12, UC-13 · FR-BE-17, FR-GA-19, FR-GA-20, "
                        "NFR-GA-02 (protocolo: Game.md §8.6 pendiente)"),
    "width": 1420,
    "gap": 170,
    "participants": [
        {"id": "jug", "label": "Jugador", "sub": "persona que juega",
         "color": "#334155"},
        {"id": "jeu", "label": "Juego (Godot)", "sub": "cliente C++ · JWT",
         "color": "#4f46e5"},
        {"id": "eco", "label": "economy-service", "sub": ":3003 · monedas",
         "color": "#ea580c"},
        {"id": "db", "label": "PostgreSQL", "sub": "bd_economy", "color": "#1d4ed8"},
        {"id": "spy", "label": "servicio Python", "sub": "análisis de riesgo",
         "color": "#475569"},
    ],
    "actions": [
        {"msg": ("jug", "jeu"),
         "label": "Selecciona «continuar aventura» con su cuenta"},
        {"msg": ("jeu", "eco"),
         "label": "POST /sessions/start — Bearer JWT (FR-GA-18)"},
        {"self": "eco",
         "label": "Verifica el token y crea la partida con clave de "
                  "idempotencia"},
        {"msg": ("eco", "jeu"), "style": "reply",
         "label": "202 · sessionId y reglas del servidor (costes, probabilidades)"},
        {"self": "jeu",
         "label": "Partida local: el cliente solo representa, no calcula "
                  "saldos (FR-GA-20)"},
        {"msg": ("jeu", "eco"),
         "label": "POST /sessions/{id}/result — resultado de la partida"},
        {"frag_open": "alt", "span": ("eco", "jeu")},
        {"note": "«resultado válido» → el servidor recalcula las monedas con "
                 "su propia tabla (FR-BE-17).",
         "span": ("eco", "db")},
        {"msg": ("eco", "db"),
         "label": "BEGIN · INSERT movimiento · UPDATE saldo"},
        {"msg": ("db", "eco"), "style": "reply", "label": "COMMIT"},
        {"msg": ("eco", "jeu"), "style": "reply",
         "label": "200 · monedas acreditadas y saldo total"},
        {"note": "«resultado inválido o manipulado» → sin acreditación "
                 "(NFR-GA-02).",
         "span": ("eco", "jeu")},
        {"msg": ("eco", "jeu"), "style": "reply",
         "label": "422 · rechazo con mensaje genérico"},
        {"msg": ("eco", "spy"), "style": "reply", "t": 0.45,
         "label": "evento sospechoso (complementario · FR-SEC-10)"},
        {"frag_close": None},
        {"msg": ("jeu", "jug"), "style": "reply",
         "label": "Aviso en pantalla: monedero actualizado (fuente de "
                  "verdad: backend)"},
        {"note": "Sin conexión con el servidor el juego lo informa y no "
                 "otorga monedas ni tiradas (FR-GA-22).",
         "span": ("jug", "eco")},
    ],
})


# ===========================================================================
# 08 · Estados del pedido (nuevo)
# ===========================================================================

DIAGRAMAS.append({
    "kind": "explicit",
    "id": "08",
    "file": "08_estados_pedido.svg",
    "title": "Ciclo de vida del pedido (estados propuestos)",
    "subtitle": "Máquina de estados con transiciones etiquetadas por evento; "
                "el estado solo lo cambia el backend, con registro auditable.",
    "meta": meta("1.0", "UC-08, UC-09 · FR-BE-12, FR-BE-15",
                 estado="propuesto (pendiente de aprobación)"),
    "width": 1200,
    "nodes": [
        {"id": "ini", "kind": "initial", "cx": 560, "cy": 80},
        {"id": "pend", "kind": "state", "cx": 560, "cy": 185, "w": 250,
         "refs": "UC-08", "title": "PENDIENTE",
         "bullets": ["Pedido creado y stock reservado"]},
        {"id": "conf", "kind": "state", "cx": 560, "cy": 350, "w": 250,
         "refs": "FR-BR-13", "title": "CONFIRMADO",
         "bullets": ["Pago simulado aprobado y stock descontado"]},
        {"id": "fall", "kind": "state", "cx": 950, "cy": 350, "w": 250,
         "fill": "#fef2f2", "stroke": "#dc2626", "refs": "FR-BE-12",
         "title": "FALLIDO",
         "bullets": ["Pago rechazado o stock insuficiente"]},
        {"id": "canc", "kind": "state", "cx": 170, "cy": 350, "w": 250,
         "fill": "#f8fafc", "stroke": "#64748b", "refs": "FR-BE-15",
         "title": "CANCELADO",
         "bullets": ["Anulado por el cliente o por el sistema"]},
        {"id": "prep", "kind": "state", "cx": 560, "cy": 510, "w": 250,
         "refs": "UC-09", "title": "EN PREPARACIÓN",
         "bullets": ["Empaque y verificación del pedido"]},
        {"id": "env", "kind": "state", "cx": 560, "cy": 655, "w": 250,
         "refs": "UC-09", "title": "ENVIADO",
         "bullets": ["Despachado al transporte"]},
        {"id": "entr", "kind": "state", "cx": 560, "cy": 800, "w": 250,
         "refs": "UC-09", "title": "ENTREGADO",
         "bullets": ["Entrega confirmada por el cliente"]},
        {"id": "fin1", "kind": "final", "cx": 560, "cy": 915},
        {"id": "fin2", "kind": "final", "cx": 950, "cy": 480},
        {"id": "fin3", "kind": "final", "cx": 170, "cy": 480},
        {"id": "nota7", "kind": "box", "cx": 985, "cy": 700, "w": 300,
         "fill": "#fefce8", "stroke": "#ca8a04", "refs": "FR-BE-15",
         "title": "Notas de diseño",
         "bullets": ["Estados propuestos: faltan por aprobar en "
                     "Database.md §8 y Backend.md §8",
                     "Todo cambio de estado deja movimiento auditable",
                     "El cliente solo puede cancelar PENDIENTE o CONFIRMADO "
                     "antes del envío"]},
    ],
    "edges": [
        {"src": "ini", "dst": "pend", "label": "confirmación (Flujo 01)",
         "style": "ok"},
        {"src": "pend", "dst": "conf", "label": "pago simulado aprobado",
         "style": "ok"},
        {"src": "pend", "dst": "fall", "label": "pago rechazado / sin stock",
         "style": "err", "t": 0.7},
        {"src": "pend", "dst": "canc", "label": "cliente cancela"},
        {"src": "fall", "dst": "pend", "label": "reintento", "t": 0.9},
        {"src": "fall", "dst": "fin2", "label": "cierre", "t": 0.6},
        {"src": "canc", "dst": "fin3", "label": "cierre", "t": 0.6},
        {"src": "conf", "dst": "canc", "label": "anulación en plazo"},
        {"src": "conf", "dst": "prep", "label": "aceptado", "style": "ok"},
        {"src": "prep", "dst": "env", "label": "despacho", "style": "ok"},
        {"src": "env", "dst": "entr", "label": "entrega", "style": "ok"},
        {"src": "entr", "dst": "fin1", "label": "fin del ciclo", "style": "ok"},
    ],
    "extra_h": 40,
})


# ===========================================================================
# 09 · Modelo de datos (entidad-relación, nuevo)
# ===========================================================================

DIAGRAMAS.append({
    "kind": "explicit",
    "id": "09",
    "file": "09_modelo_de_datos.svg",
    "title": "Modelo de datos (entidad-relación)",
    "subtitle": "26 entidades repartidas en 4 bases independientes (una por "
                "servicio). Sin claves foráneas entre servicios: la integridad "
                "la garantiza el backend.",
    "meta": meta("1.0", "FR-DB-01 a 05 · Database.md §6 · "
                        "Diccionario-de-Datos.md"),
    "width": 2100,
    "containers": [
        # columna izquierda: identity (arriba) y payments (abajo)
        {"label": "gearquest_identity", "sub": "identity-service · 3 entidades",
         "x": 40, "y": 60, "w": 700, "h": 320, "dashed": True,
         "fill": "#f8fafc", "stroke": "#2563eb"},
        {"label": "gearquest_payments", "sub": "payments-service · 5 entidades",
         "x": 40, "y": 420, "w": 700, "h": 430, "dashed": True,
         "fill": "#f8fafc", "stroke": "#7c3aed"},
        # columna central: store (10 entidades)
        {"label": "gearquest_store", "sub": "store-service · 10 entidades",
         "x": 780, "y": 60, "w": 680, "h": 800, "dashed": True,
         "fill": "#f8fafc", "stroke": "#0d9488"},
        # columna derecha: economy (8 entidades)
        {"label": "gearquest_economy", "sub": "economy-service · 8 entidades",
         "x": 1500, "y": 60, "w": 680, "h": 800, "dashed": True,
         "fill": "#f8fafc", "stroke": "#b45309"},
    ],
    "nodes": [
        # ---------- identity (cx 230 / 550) ----------
        {"id": "i_user", "kind": "box", "cx": 230, "cy": 150, "w": 250,
         "owner": "users", "refs": "email único",
         "title": "User",
         "bullets": ["id · email · passwordHash",
                     "role · status · emailVerified"]},
        {"id": "i_sess", "kind": "box", "cx": 550, "cy": 150, "w": 250,
         "owner": "sessions", "refs": "FK userId",
         "title": "Session",
         "bullets": ["tokenHash (solo hash)",
                     "expiresAt · revokedAt"]},
        {"id": "i_audit", "kind": "box", "cx": 550, "cy": 280, "w": 250,
         "owner": "audit_logs", "refs": "FK userId",
         "title": "AuditLog",
         "bullets": ["action · ipAddress",
                     "metadata · append-only"]},
        # ---------- store (cx 960 / 1280) ----------
        {"id": "s_prod", "kind": "box", "cx": 960, "cy": 150, "w": 250,
         "owner": "products", "refs": "sku/slug únicos",
         "title": "Product",
         "bullets": ["sku · slug · name · price",
                     "currency · isActive · categoryId"]},
        {"id": "s_cat", "kind": "box", "cx": 960, "cy": 280, "w": 250,
         "owner": "categories", "refs": "FK —",
         "title": "Category",
         "bullets": ["name · slug(único)",
                     "description · isActive"]},
        {"id": "s_cart", "kind": "box", "cx": 960, "cy": 410, "w": 250,
         "owner": "carts", "refs": "userId (lógico)",
         "title": "Cart",
         "bullets": ["userId · status",
                     "1–N cart_items"]},
        {"id": "s_order", "kind": "box", "cx": 960, "cy": 540, "w": 250,
         "owner": "orders", "refs": "orderNumber único",
         "title": "Order",
         "bullets": ["userId(lógico) · status",
                     "subtotal · discountAmount · total"]},
        {"id": "s_disc", "kind": "box", "cx": 960, "cy": 670, "w": 250,
         "owner": "discount_levels", "refs": "level único",
         "fill": "#fffbeb", "stroke": "#ca8a04",
         "title": "DiscountLevel",
         "bullets": ["nivel 1..5 · percentage",
                     "coinsRequired · canje pendiente"]},
        {"id": "s_img", "kind": "box", "cx": 1280, "cy": 150, "w": 250,
         "owner": "product_images", "refs": "FK productId",
         "title": "ProductImage",
         "bullets": ["url · alt · position"]},
        {"id": "s_inv", "kind": "box", "cx": 1280, "cy": 280, "w": 250,
         "owner": "inventory_items", "refs": "FK productId (1–1)",
         "title": "InventoryItem",
         "bullets": ["stock · reserved",
                     "disponible = stock − reserved"]},
        {"id": "s_mov", "kind": "box", "cx": 1280, "cy": 410, "w": 250,
         "owner": "inventory_movements", "refs": "FK productId",
         "title": "InventoryMovement",
         "bullets": ["type · quantity · reason",
                     "append-only"]},
        {"id": "s_citem", "kind": "box", "cx": 1280, "cy": 540, "w": 250,
         "owner": "cart_items", "refs": "único (cartId,productId)",
         "title": "CartItem",
         "bullets": ["quantity · unitPrice,",
                     "congelado al agregar"]},
        {"id": "s_oitem", "kind": "box", "cx": 1280, "cy": 670, "w": 250,
         "owner": "order_items", "refs": "FK orderId",
         "title": "OrderItem",
         "bullets": ["nameSnapshot · unitPrice",
                     "quantity · lineTotal"]},
        # ---------- economy (cx 1680 / 2000) ----------
        {"id": "e_wallet", "kind": "box", "cx": 1680, "cy": 150, "w": 250,
         "owner": "wallets", "refs": "userId único (lógico)",
         "title": "Wallet",
         "bullets": ["saldo derivado de los lotes",
                     "1 Wallet por usuario"]},
        {"id": "e_batch", "kind": "box", "cx": 1680, "cy": 280, "w": 250,
         "owner": "coin_batches", "refs": "FK walletId · idx expiresAt",
         "title": "CoinBatch",
         "bullets": ["type(EARNED/PURCHASED)",
                     "remaining · expiresAt(null=no caduca)"],
         "stroke": "#b45309"},
        {"id": "e_banner", "kind": "box", "cx": 1680, "cy": 410, "w": 250,
         "owner": "gacha_banners", "refs": "slug único",
         "title": "GachaBanner",
         "bullets": ["costPerPull · isActive",
                     "startsAt · endsAt"]},
        {"id": "e_tx", "kind": "box", "cx": 2000, "cy": 150, "w": 250,
         "owner": "coin_transactions", "refs": "FK walletId · append-only",
         "title": "CoinTransaction",
         "bullets": ["type · coinType · amount",
                     "balanceAfter · reference"]},
        {"id": "e_item", "kind": "box", "cx": 2000, "cy": 280, "w": 250,
         "owner": "player_items", "refs": "FK walletId",
         "title": "PlayerItem",
         "bullets": ["name · rarity · quantity",
                     "source · acquiredAt · expiresAt"]},
        {"id": "e_sess", "kind": "box", "cx": 2000, "cy": 410, "w": 250,
         "owner": "game_sessions", "refs": "FK walletId",
         "title": "GameSession",
         "bullets": ["gameType · status · score",
                     "coinsAwarded · valida servidor"]},
        {"id": "e_rew", "kind": "box", "cx": 2000, "cy": 540, "w": 250,
         "owner": "gacha_rewards", "refs": "FK bannerId",
         "title": "GachaReward",
         "bullets": ["rarity · rewardType · weight",
                     "coinValue · itemName"]},
        {"id": "e_pull", "kind": "box", "cx": 2000, "cy": 670, "w": 250,
         "owner": "gacha_pulls", "refs": "FK banner/wallet/reward",
         "title": "GachaPull",
         "bullets": ["costCoins · isWin",
                     "auditoría de cada tirada"]},
        # ---------- payments (cx 230 / 550) ----------
        {"id": "p_pkg", "kind": "box", "cx": 230, "cy": 510, "w": 250,
         "owner": "coin_packages", "refs": "slug único",
         "title": "CoinPackage",
         "bullets": ["name · slug · coins · price",
                     "currency · isActive"]},
        {"id": "p_pay", "kind": "box", "cx": 230, "cy": 640, "w": 250,
         "owner": "payments", "refs": "userId lógico",
         "title": "Payment",
         "bullets": ["amount · provider(MOCK) · status",
                     "externalId · failureReason"]},
        {"id": "p_rec", "kind": "box", "cx": 550, "cy": 510, "w": 250,
         "owner": "recharges", "refs": "FK packageId · paymentId",
         "title": "Recharge",
         "bullets": ["coins · amountPaid · status",
                     "acreditación pendiente"]},
        {"id": "p_evt", "kind": "box", "cx": 550, "cy": 640, "w": 250,
         "owner": "payment_events", "refs": "FK paymentId",
         "title": "PaymentEvent",
         "bullets": ["type · payload(Json)"]},
        {"id": "p_ref", "kind": "box", "cx": 550, "cy": 770, "w": 250,
         "owner": "refunds", "refs": "FK paymentId",
         "title": "Refund",
         "bullets": ["amount · reason"]},
        # ---------- nota ----------
        {"id": "nota9", "kind": "box", "cx": 1120, "cy": 930, "w": 300,
         "fill": "#fefce8", "stroke": "#ca8a04", "refs": "FR-DB-01",
         "title": "Claves entre servicios",
         "bullets": ["Sin FK entre bases: userId y orderId son",
                     "referencias lógicas validadas por el backend",
                     "con el JWT verificado (NFR-BE-07)",
                     "Detalle por campo: Diccionario-de-Datos.md"]},
    ],
    "edges": [
        # identity (canal 355..425)
        {"src": "i_user", "dst": "i_sess", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 375},
        {"src": "i_user", "dst": "i_audit", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 405},
        # store — mismas columnas (directas) y cruzadas por el canal 1085..1155
        {"src": "s_cat", "dst": "s_prod", "label": "1–N", "style": "soft"},
        {"src": "s_cart", "dst": "s_order", "label": "1–N", "style": "soft"},
        {"src": "s_disc", "dst": "s_order", "label": "canje", "style": "soft"},
        {"src": "s_prod", "dst": "s_img", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 1095},
        {"src": "s_prod", "dst": "s_inv", "label": "1–1", "style": "soft",
         "route": "elbow_h", "mid": 1107},
        {"src": "s_prod", "dst": "s_mov", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 1119},
        {"src": "s_prod", "dst": "s_citem", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 1131},
        {"src": "s_prod", "dst": "s_oitem", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 1143},
        {"src": "s_cart", "dst": "s_citem", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 1155},
        {"src": "s_order", "dst": "s_oitem", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 1073},
        # economy — canal 1805..1875
        {"src": "e_wallet", "dst": "e_batch", "label": "1–N", "style": "soft"},
        {"src": "e_rew", "dst": "e_pull", "label": "premio", "style": "soft"},
        {"src": "e_wallet", "dst": "e_tx", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 1815},
        {"src": "e_wallet", "dst": "e_item", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 1827},
        {"src": "e_wallet", "dst": "e_sess", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 1839},
        {"src": "e_wallet", "dst": "e_pull", "label": "paga", "style": "soft",
         "route": "elbow_h", "mid": 1851},
        {"src": "e_batch", "dst": "e_tx", "label": "genera", "style": "soft",
         "route": "elbow_h", "mid": 1863},
        {"src": "e_banner", "dst": "e_rew", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 1803},
        {"src": "e_banner", "dst": "e_pull", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 1875},
        # payments — canal 355..425
        {"src": "p_pkg", "dst": "p_rec", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 365},
        {"src": "p_pay", "dst": "p_rec", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 385},
        {"src": "p_pay", "dst": "p_evt", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 405},
        {"src": "p_pay", "dst": "p_ref", "label": "1–N", "style": "soft",
         "route": "elbow_h", "mid": 415},
    ],
    "extra_h": 40,
})
