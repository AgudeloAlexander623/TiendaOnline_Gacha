"""layout.py — composición de páginas (cabecera, leyenda) y motores de
disposición de los tres tipos de diagrama que usa la documentación de GearQuest:

  * ``flow``     → diagrama de flujo con columna principal y ramas laterales
  * ``seq``      → diagrama de secuencia (UML) con actores, mensajes y «fragments»
  * ``explicit`` → diagrama con posiciones declaradas (arquitectura, máquinas
                   de estados)

Las especificaciones viven en ``diagramas.py``; este módulo solo compone.
"""

from __future__ import annotations

from typing import Dict, List, Optional, Sequence, Tuple

from svgkit import (C, MONO, PAD_X, Canvas, _n, draw_edge, draw_node,
                    edge_points, esc, measure, rect_exit, split_lines,
                    text_width, warn, wrap)

HEADER_H = 112
FOOTER_H = 40
PAD = 32

LEGEND = [
    ("terminal", "Inicio / fin del flujo"),
    ("process", "Proceso (paso del sistema)"),
    ("decision", "Decisión (pregunta)"),
    ("owner", "Responsable (microservicio)"),
    ("error", "Ruta de error / excepción"),
]


# ---------------------------------------------------------------------------
# Cabecera y pie
# ---------------------------------------------------------------------------

def _legend_width() -> float:
    return 232.0


def draw_frame(cv: Canvas, spec: dict, subtitle_w: float) -> None:
    meta = spec.get("meta", {})
    w = cv.width

    # marca
    cv.rect(24, 20, 36, 36, rx=10, fill=C["accent"])
    cv.text(42, 43, "GQ", size=15, fill="#ffffff", anchor="middle", bold=True)

    title = f"{spec['id']} · {spec['title']}"
    cv.text(72, 42, title, size=19.5, bold=True, fill=C["text"])
    subtitle = spec.get("subtitle", "")
    if subtitle and text_width(subtitle, 12.5) > subtitle_w:
        warn(spec["id"], f"subtítulo demasiado largo ({len(subtitle)} chr): "
                         f"{subtitle[:60]}…")
    cv.text(72, 63, subtitle, size=12.5, fill=C["muted"])

    meta_line = (
        f"v{meta.get('version', '1.0')} · {meta.get('fecha', '—')} · "
        f"Estado: {meta.get('estado', 'borrador')} · "
        f"Trazabilidad: {meta.get('traza', '—')} · GearQuest"
    )
    if text_width(meta_line, 10, mono=True) > subtitle_w:
        warn(spec["id"], "línea de metadatos demasiado larga para el ancho "
                         "del lienzo; amplía 'width' o acorta 'traza'.")
    cv.text(72, 85, meta_line, size=10, family=MONO, fill=C["muted"])
    cv.line(24, HEADER_H - 6, w - 24, HEADER_H - 6, stroke=C["rule"], sw=1.2,
            cap="butt")

    # leyenda compacta
    lw = _legend_width()
    lx, ly = w - 24 - lw, 12
    row_h = 17.0
    lh_ = 20 + row_h * len(LEGEND)
    cv.rect(lx, ly, lw, lh_, rx=10, fill=C["lane_fill"], stroke=C["lane_stroke"],
            sw=1.2)
    cv.text(lx + 14, ly + 15, "LEYENDA", size=9, family=MONO,
            fill=C["muted"], bold=True, ls=1.2)
    for i, (kind, label) in enumerate(LEGEND):
        cy = ly + 20 + row_h * i + row_h / 2
        gx = lx + 26
        if kind == "terminal":
            cv.rect(gx - 15, cy - 6.5, 30, 13, rx=6.5,
                    fill=C["terminal_fill"], stroke=C["terminal_stroke"], sw=1.4)
        elif kind == "process":
            cv.rect(gx - 15, cy - 7, 30, 14, rx=3.5, fill=C["process_fill"],
                    stroke=C["process_stroke"], sw=1.4)
        elif kind == "decision":
            cv.el(f'<polygon points="{_n(gx)},{_n(cy - 8)} {_n(gx + 17)},{_n(cy)} '
                  f'{_n(gx)},{_n(cy + 8)} {_n(gx - 17)},{_n(cy)}" '
                  f'fill="{C["decision_fill"]}" stroke="{C["decision_stroke"]}" '
                  f'stroke-width="1.4"/>')
        elif kind == "owner":
            cv.rect(gx - 16, cy - 7, 32, 14, rx=7, fill=C["accent"])
            cv.text(gx, cy + 3.2, "svc", size=8.5, fill="#ffffff",
                    anchor="middle", bold=True, family=MONO)
        elif kind == "error":
            cv.line(gx - 15, cy, gx + 12, cy, stroke=C["edge_err"], sw=1.7,
                    dash="5 4", marker="arr_err")
        cv.text(lx + 52, cy + 3.8, label, size=10.5, fill=C["text"])

    # pie — se adapta al ancho: nunca se solapan los dos textos
    fy = cv.height - FOOTER_H
    cv.line(24, fy + 6, w - 24, fy + 6, stroke=C["rule"], sw=1.2, cap="butt")
    left = f"Fuente: documentation/diagramas de flujo/{spec['file']}"
    regen = "  ·  Regenerar: python3 tools/generar.py"
    rights = [
        "Documento vivo: si cambia un requisito del SRS, actualizar y "
        "regenerar.",
        "Documento vivo: regenerar si cambia el SRS.",
    ]
    tw = lambda s: text_width(s, 9.5, mono=True)
    avail = w - 48
    chosen = None
    for use_regen in (True, False):
        text_l = left + (regen if use_regen else "")
        for text_r in rights + [""]:
            if tw(text_l) + (16 + tw(text_r) if text_r else 0) <= avail:
                chosen = (text_l, text_r)
                break
        if chosen:
            break
    text_l, text_r = chosen or (left, "")
    cv.text(24, fy + 26, text_l, size=9.5, family=MONO, fill=C["faint"])
    if text_r:
        cv.text(w - 24, fy + 26, text_r, size=9.5, family=MONO,
                fill=C["faint"], anchor="end")


# ---------------------------------------------------------------------------
# Disposición de diagramas de flujo
# ---------------------------------------------------------------------------

def _prep_nodes(spec: dict) -> Dict[str, dict]:
    dg = spec["id"]
    out: Dict[str, dict] = {}
    for raw in spec["nodes"]:
        node = dict(raw)
        nid = node["id"]
        kind = node.get("kind", "process")
        paragraphs = split_lines(node)
        size = 11.5 if kind == "note" else 12
        fixed_w = node.get("w")
        if kind == "decision":
            wrap_w = (fixed_w or 250) * 0.58 - 8
        elif fixed_w:
            wrap_w = fixed_w - 2 * PAD_X - (10 if node.get("refs") else 0)
        else:
            # ancho de trabajo por defecto: mantiene las cajas compactas
            wrap_w = 278.0
        lines: List[str] = []
        for para in paragraphs:
            if wrap_w:
                lines.extend(wrap(para, wrap_w, size))
            else:
                lines.append(para)
        node["_lines"] = lines
        w, h = measure(kind, lines, node.get("refs"), fixed_w, dg, nid)
        if w > 380 and not fixed_w:
            warn(dg, f"nodo '{nid}' queda muy ancho ({w:.0f}px): parte el "
                     f"texto en varias líneas o fija 'w'.")
        node["w"], node["h"] = w, h
        out[nid] = node
    return out


def _branch_entries(br: dict) -> List[Tuple[str, List[str]]]:
    """Normaliza las ramas de un nodo: puede haber 'seq' (legado), 'left' o
    'right' (una rama por lado)."""
    entries: List[Tuple[str, List[str]]] = []
    if br.get("seq"):
        entries.append((br.get("side", "right"), list(br["seq"])))
    if br.get("left"):
        entries.append(("left", list(br["left"])))
    if br.get("right"):
        entries.append(("right", list(br["right"])))
    return entries


def _infer_route(src: str, dst: str, spec: dict, pos: Dict[str, dict]) -> str:
    spine: List[str] = spec["spine"]
    branches: Dict[str, dict] = spec.get("branches", {})
    if src in spine and dst in spine:
        if spine.index(dst) == spine.index(src) + 1:
            return "v"
        return "v" if pos[dst]["y"] > pos[src]["y"] else "ortho"
    for did, br in branches.items():
        for side, seq in _branch_entries(br):
            if src == did and dst == seq[0]:
                return "side_r" if side == "right" else "side_l"
            if src in seq and dst in seq:
                if seq.index(dst) == seq.index(src) + 1:
                    return "v"
                return "v" if pos[dst]["y"] > pos[src]["y"] else "ortho"
            if src in seq and dst in spine:
                return "ortho"
    if pos[dst]["y"] + pos[dst]["h"] <= pos[src]["y"]:
        centre = pos[src]["x"] + pos[src]["w"] / 2
        return "loop_r" if centre >= 0 else "loop_l"
    return "ortho"


def layout_flow(spec: dict) -> Tuple[Canvas, dict]:
    dg = spec["id"]
    nodes = _prep_nodes(spec)
    spine: List[str] = spec["spine"]
    branches: Dict[str, dict] = spec.get("branches", {})
    row_gap = spec.get("row_gap", 58)
    side_gap = spec.get("side_gap", 40)
    branch_gap = spec.get("branch_gap", 74)

    y = 0.0
    for sid in spine:
        n = nodes[sid]
        n["x"], n["y"] = -n["w"] / 2, y
        row_bottom = y + n["h"]
        br = branches.get(sid)
        if br:
            for side, seq in _branch_entries(br):
                sign = 1 if side == "right" else -1
                first = nodes[seq[0]]
                offset = n["w"] / 2 + first["w"] / 2 + branch_gap
                side_cx = sign * offset
                sy = max(y + (n["h"] - first["h"]) / 2, y)
                for k, cid in enumerate(seq):
                    cn = nodes[cid]
                    if k:
                        prev = nodes[seq[k - 1]]
                        sy = prev["y"] + prev["h"] + side_gap
                    cn["x"], cn["y"] = side_cx - cn["w"] / 2, sy
                    row_bottom = max(row_bottom, cn["y"] + cn["h"])
        y = row_bottom + row_gap

    content_h = y - row_gap

    # márgenes para bucles
    has_loop_r = any(
        e.get("route") == "loop_r" or
        (not e.get("route") and _infer_route(e["src"], e["dst"], spec, nodes)
         == "loop_r")
        for e in spec["edges"])
    has_loop_l = any(
        e.get("route") == "loop_l" or
        (not e.get("route") and _infer_route(e["src"], e["dst"], spec, nodes)
         == "loop_l")
        for e in spec["edges"])
    margin_r = max(nd["x"] + nd["w"] for nd in nodes.values()) + (52 if has_loop_r else 0)
    margin_l = min(nd["x"] for nd in nodes.values()) - (52 if has_loop_l else 0)

    phases = spec.get("phases", [])
    phase_x = margin_l - 46 if phases else None

    margin = {"right": margin_r, "left": margin_l}
    edge_geoms: List[dict] = []
    for e in spec["edges"]:
        src, dst = e["src"], e["dst"]
        if src not in nodes or dst not in nodes:
            warn(dg, f"arista {src}->{dst} referencia un nodo inexistente.")
            continue
        route = e.get("route") or _infer_route(src, dst, spec, nodes)
        pts = edge_points(route, nodes[src], nodes[dst], margin)
        edge_geoms.append({"pts": pts, "style": e.get("style", "normal"),
                           "label": e.get("label"), "t": e.get("t", 0.5),
                           "route": route, "dashed": e.get("dashed", False)})

    # caja del contenido
    xs: List[float] = [nd["x"] for nd in nodes.values()]
    xe: List[float] = [nd["x"] + nd["w"] for nd in nodes.values()]
    ys: List[float] = [nd["y"] for nd in nodes.values()]
    ye: List[float] = [nd["y"] + nd["h"] for nd in nodes.values()]
    for g in edge_geoms:
        for px, py in g["pts"]:
            xs.append(px)
            xe.append(px)
            ys.append(py)
            ye.append(py)
    if phase_x is not None:
        xs.append(phase_x - 26)
        for pid in (phases[0]["from"], phases[0]["to"]):
            ys.append(nodes[pid]["y"])
    min_x, max_x = min(xs) - PAD, max(xe) + PAD
    min_y = min(ys) - PAD
    max_y = max(ye) + PAD
    for ph in phases:
        ye.append(nodes[ph["to"]]["y"] + nodes[ph["to"]]["h"])
        ye.append(nodes[ph["from"]]["y"])
    max_y = max(max_y, max(ye) + PAD)

    width = max(spec.get("width", 0), max_x - min_x, 980)
    height = HEADER_H + (max_y - min_y) + FOOTER_H
    cv = Canvas(width, height)

    # desplazar al área de contenido
    content_top = HEADER_H + 16
    off_x = (width - (max_x - min_x)) / 2 - min_x
    off_y = content_top - min_y
    for nd in nodes.values():
        nd["x"] += off_x
        nd["y"] += off_y
    for g in edge_geoms:
        g["pts"] = [(px + off_x, py + off_y) for px, py in g["pts"]]
    if phase_x is not None:
        phase_x += off_x

    cv.rect(0, 0, width, height, fill=C["bg"])
    draw_frame(cv, spec, subtitle_w=width - 72 - _legend_width() - 60)

    # fases (marcadores verticales rotados)
    if phases:
        for ph in phases:
            top = nodes[ph["from"]]["y"] - 16
            bot = nodes[ph["to"]]["y"] + nodes[ph["to"]]["h"] + 16
            cv.line(phase_x, top, phase_x, bot, stroke=C["faint"], sw=1.2,
                    dash="4 5")
            for yy in (top, bot):
                cv.line(phase_x - 5, yy, phase_x + 5, yy, stroke=C["faint"],
                        sw=1.2)
            mid = (top + bot) / 2
            cv.el(f'<text x="{_n(phase_x - 11)}" y="{_n(mid)}" '
                  f'font-family="{MONO}" font-size="10.5" fill="{C["muted"]}" '
                  f'text-anchor="middle" letter-spacing="1.1" '
                  f'transform="rotate(-90 {_n(phase_x - 11)} {_n(mid)})">'
                  f'{esc(ph["label"])}</text>')

    for g in edge_geoms:
        draw_edge(cv, g["pts"], style=g["style"], label=g["label"], t=g["t"],
                  dashed_route=g["dashed"])
    for nd in nodes.values():
        draw_node(cv, nd, nd["x"], nd["y"], nd["w"], nd["h"], dg)

    return cv, {"width": width, "height": height}


# ---------------------------------------------------------------------------
# Diagramas de secuencia
# ---------------------------------------------------------------------------

def _seq_font(avail: float, text: str, base: float) -> Tuple[float, List[str]]:
    """Reduce la tipografía hasta que el mensaje quepa en `avail` px."""
    size = base
    for _ in range(6):
        lines = wrap(text, avail, size)
        if len(lines) <= 3 and all(text_width(l, size) <= avail for l in lines):
            return size, lines
        size -= 0.75
    return size, wrap(text, avail, size)


def layout_seq(spec: dict) -> Tuple[Canvas, dict]:
    dg = spec["id"]
    parts = spec["participants"]
    gap = spec.get("gap", 170.0)
    bw_list: List[float] = []
    for p in parts:
        w = max(text_width(p["label"], 13.5, bold=True),
                text_width(p.get("sub", ""), 10, mono=True)) + 36
        bw_list.append(max(150.0, w))

    total = sum(bw_list) + gap * (len(parts) - 1)
    width = max(spec.get("width", 0), total + 2 * PAD, 980)
    xs: List[float] = []
    cursor = (width - total) / 2
    for w in bw_list:
        xs.append(cursor + w / 2)
        cursor += w + gap
    life = {p["id"]: xs[i] for i, p in enumerate(parts)}

    box_h = 56.0
    # los mensajes arrancan por debajo de las cajas de participantes
    y = HEADER_H + 26 + box_h + 34
    bars: Dict[str, List[List[float]]] = {p["id"]: [] for p in parts}
    items: List[dict] = []
    frag_stack: List[dict] = []
    frags: List[dict] = []
    last_msg_y: Dict[str, float] = {}

    def span_x(span: Tuple[str, str]) -> Tuple[float, float]:
        a, b = life[span[0]], life[span[1]]
        return (min(a, b) - 30, max(a, b) + 30)

    for act in spec["actions"]:
        if "frag_open" in act:
            fx0, fx1 = span_x(act["span"])
            frag_stack.append({"label": act["frag_open"], "x0": fx0, "x1": fx1,
                               "start": None, "end": None, "open": True})
            frags.append(frag_stack[-1])
            continue
        if "frag_close" in act:
            if frag_stack:
                frag_stack[-1]["end"] = y - 10
                frag_stack.pop()
            continue
        if "note" in act:
            lines = wrap(act["note"], act.get("w", 330), 11)
            h = 12 + len(lines) * 15
            a, b = act.get("span", (parts[0]["id"], parts[-1]["id"]))
            x0, x1 = span_x((a, b))
            items.append({"kind": "note", "lines": lines, "h": h,
                          "x0": x0, "x1": x1, "y": y + h / 2})
            y += h + 26
            for f in frag_stack:
                f["end"] = y - 16
            continue

        if "self" in act:
            pid = act["self"]
            x = life[pid]
            nxt = xs[parts.index(next(p for p in parts if p["id"] == pid)) + 1] \
                if parts.index(next(p for p in parts if p["id"] == pid)) + 1 < len(xs) \
                else None
            avail = (nxt - x - 66) if nxt else 200
            size, lines = _seq_font(max(120.0, avail), act["label"], 11.5)
            step = max(58.0, 34 + (len(lines) - 1) * 15)
            items.append({"kind": "self", "x": x, "y": y, "lines": lines,
                          "size": size, "h": step})
            for f in frag_stack:
                if f["start"] is None:
                    f["start"] = y - 16
                f["end"] = y + step - 6
            bars.setdefault(pid, [])
            bars[pid].append([y - 8, y + step - 14])
            last_msg_y[pid] = y + step - 14
            y += step + 8
            continue

        if "msg" in act:
            a, b = act["msg"]
        else:
            a, b = act["from"], act["to"]
        xa, xb = life[a], life[b]
        span = abs(xb - xa)
        avail = max(96.0, span - 24)
        size, lines = _seq_font(avail, act["label"], 11.5)
        if len(lines) > 3:
            warn(dg, f"mensaje \"{act['label']}\" no cabe en {avail:.0f}px "
                     f"entre {a} y {b}.")
        n_lines = len(lines)
        step = 54 + (n_lines - 1) * 15
        style = act.get("style", "sync")
        items.append({"kind": "msg", "from": a, "to": b, "y": y,
                      "lines": lines, "size": size, "style": style})
        if style == "sync":
            if not bars[b]:
                bars[b].append([y - 6, None])
            last_msg_y[b] = y
        else:  # reply: cierra la barra del emisor
            if bars[a] and bars[a][-1][1] is None:
                bars[a][-1][1] = y + 6
            last_msg_y[a] = y
        for f in frag_stack:
            if f["start"] is None:
                f["start"] = y - n_lines * 15 - 20
            f["end"] = y + 14
        y += step + 8

    for pid, stack in bars.items():
        for bar in stack:
            if bar[1] is None:
                bar[1] = last_msg_y.get(pid, y) + 14

    bottom = y + 14
    height = bottom + FOOTER_H
    cv = Canvas(width, height)
    cv.rect(0, 0, width, height, fill=C["bg"])
    draw_frame(cv, spec, subtitle_w=width - 72 - _legend_width() - 60)

    # cajas de participantes
    for p in parts:
        x = life[p["id"]]
        idx = parts.index(p)
        bx = xs[idx] - bw_list[idx] / 2
        color = p.get("color", C["accent"])
        cv.rect(bx, HEADER_H + 26, bw_list[idx], box_h, rx=9,
                fill=C["lane_fill"], stroke=color, sw=1.8, shadow=True)
        cv.text(x, HEADER_H + 26 + 25, p["label"], size=13.5, bold=True,
                anchor="middle", fill=C["text"])
        if p.get("sub"):
            cv.text(x, HEADER_H + 26 + 43, p["sub"], size=10, family=MONO,
                    anchor="middle", fill=C["muted"])
        cv.line(x, HEADER_H + 26 + box_h, x, bottom, stroke=C["faint"], sw=1.3,
                dash="6 6")

    # fragments (fondo)
    for f in frags:
        if f["start"] is None or f["end"] is None:
            continue
        fy0, fy1 = f["start"] - 6, f["end"] + 8
        cv.rect(f["x0"], fy0, f["x1"] - f["x0"], fy1 - fy0, rx=6,
                fill=C["lane_fill"], stroke=C["faint"], sw=1.3, dash="7 5",
                opacity=0.75)
        cv.rect(f["x0"], fy0, 62, 18, rx=0, fill=C["faint"], stroke=C["faint"],
                sw=1.3)
        cv.text(f["x0"] + 31, fy0 + 13, f["label"], size=10, family=MONO,
                fill="#ffffff", anchor="middle", bold=True)

    # barras de activación
    for p in parts:
        for bar in bars[p["id"]]:
            top, bot = bar
            if bot is None or bot <= top:
                continue
            color = p.get("color", C["accent"])
            cv.rect(life[p["id"]] - 5, top, 10, bot - top, rx=2,
                    fill=color, opacity=0.22, stroke=color, sw=1.1)

    # mensajes
    for it in items:
        if it["kind"] == "msg":
            xa, xb = life[it["from"]], life[it["to"]]
            dirn = 1 if xb > xa else -1
            x0, x1 = xa + 7 * dirn, xb - 9 * dirn
            color = C["edge"] if it["style"] == "sync" else C["edge_soft"]
            cv.line(x0, it["y"], x1, it["y"], stroke=color, sw=1.7,
                    dash=(None if it["style"] == "sync" else "7 5"),
                    marker=("arr" if it["style"] == "sync" else "arr_soft"))
            block_h = len(it["lines"]) * 15
            cv.text_block((xa + xb) / 2, it["y"] - block_h - 9, it["lines"],
                          size=it["size"], lh=15, anchor="middle",
                          fill=C["text"])
        elif it["kind"] == "self":
            x, yy = it["x"], it["y"]
            cv.path(f"M{_n(x + 7)},{_n(yy)} L{_n(x + 46)},{_n(yy)} "
                    f"Q{_n(x + 54)},{_n(yy)} {_n(x + 54)},{_n(yy + 9)} "
                    f"L{_n(x + 54)},{_n(yy + 24)} Q{_n(x + 54)},{_n(yy + 33)} "
                    f"{_n(x + 46)},{_n(yy + 33)} L{_n(x + 9)},{_n(yy + 33)}",
                    stroke=C["edge"], sw=1.7, marker="arr")
            cv.text_block(x + 64, yy + 1, it["lines"], size=it["size"], lh=15,
                          fill=C["text"])
        elif it["kind"] == "note":
            nw = it["x1"] - it["x0"]
            nh = it["h"]
            cv.rect(it["x0"], it["y"] - nh / 2, nw, nh, rx=5,
                    fill=C["note_fill"], stroke=C["note_stroke"], sw=1.3,
                    dash="6 4")
            cv.text_block(it["x0"] + 12, it["y"] - nh / 2 + 7, it["lines"],
                          size=11, lh=15, fill=C["text"])

    return cv, {"width": width, "height": height}


# ---------------------------------------------------------------------------
# Diagramas con posiciones explícitas (arquitectura / estados)
# ---------------------------------------------------------------------------

def _box_lines(spec: dict) -> List[str]:
    lines = [spec["title"]] if spec.get("title") else []
    for b in spec.get("bullets", []):
        wrapped = wrap(f"• {b}", spec.get("w", 230) - 2 * PAD_X, 11)
        lines.extend(wrapped)
    return lines


def layout_explicit(spec: dict) -> Tuple[Canvas, dict]:
    dg = spec["id"]
    shapes: Dict[str, dict] = {}

    for nd in spec["nodes"]:
        kind = nd.get("kind", "box")
        lines = _box_lines(nd) if kind in ("box", "state") else []
        if kind == "actor":
            w = max(text_width(nd["label"], 13, bold=True) + 24, 74)
            h = 92
        elif kind in ("initial", "final"):
            w = h = 30
        else:
            fixed = nd.get("w")
            max_line = max((text_width(l, 11) for l in lines[1:]),
                           default=0)
            title_w = text_width(lines[0], 13, bold=True) if lines else 0
            w = fixed or min(300.0, max(170.0, max_line + 2 * PAD_X,
                                        title_w + 2 * PAD_X))
            if fixed:
                inner = fixed - 2 * PAD_X
                for l in lines:
                    size = 13 if l is lines[0] else 11
                    bold = l is lines[0]
                    if text_width(l, size, bold) > inner + 0.5:
                        warn(dg, f"'{nd.get('id')}': línea \"{l}\" desborda "
                                 f"{inner:.0f}px ({text_width(l, size, bold):.0f}px).")
            h = 18 + len(lines) * 15 + (18 if nd.get("refs") else 0)
            if kind == "state":
                h += 12
        cx, cy = nd["cx"], nd["cy"]
        shapes[nd["id"]] = {
            "id": nd["id"], "kind": kind, "lines": lines, "w": w, "h": h,
            "x": cx - w / 2, "y": cy - h / 2, "cx": cx, "cy": cy,
            "owner": nd.get("owner"), "refs": nd.get("refs"),
            "label": nd.get("label"), "sub": nd.get("sub"),
            "fill": nd.get("fill"), "stroke": nd.get("stroke"),
            "text": nd.get("text"), "bullets": nd.get("bullets", []),
        }

    # caja del lienzo
    xs: List[float] = []
    ys: List[float] = []
    for c in spec.get("containers", []):
        xs += [c["x"], c["x"] + c["w"]]
        ys += [c["y"], c["y"] + c["h"]]
    for s in shapes.values():
        xs += [s["x"], s["x"] + s["w"]]
        ys += [s["y"], s["y"] + s["h"]]
    min_x, max_x = min(xs) - PAD - 10, max(xs) + PAD
    min_y, max_y = min(ys) - PAD, max(ys) + PAD
    width = max(spec.get("width", 0), max_x - min_x, 980)
    height = HEADER_H + (max_y - min_y) + FOOTER_H + spec.get("extra_h", 0)

    off_x = (width - (max_x - min_x)) / 2 - min_x
    off_y = HEADER_H + 16 - min_y
    for s in shapes.values():
        s["x"] += off_x
        s["y"] += off_y
        s["cx"] += off_x
        s["cy"] += off_y

    cv = Canvas(width, height)
    cv.rect(0, 0, width, height, fill=C["bg"])
    draw_frame(cv, spec, subtitle_w=width - 72 - _legend_width() - 60)

    # contenedores
    for c in spec.get("containers", []):
        x, yy = c["x"] + off_x, c["y"] + off_y
        cv.rect(x, yy, c["w"], c["h"], rx=14,
                fill=c.get("fill", C["lane_fill"]),
                stroke=c.get("stroke", C["lane_stroke"]), sw=1.6,
                dash=("8 6" if c.get("dashed") else None))
        cv.text(x + 14, yy + 21, c["label"], size=11, family=MONO,
                fill=c.get("stroke", C["muted"]), bold=True, ls=0.6)
        if c.get("sub"):
            cv.text(x + 14 + text_width(c["label"], 11, mono=True) + 12,
                    yy + 21, c["sub"], size=10.5, fill=C["muted"], italic=True)

    # aristas (detrás de los nodos)
    drawn_edges: List[dict] = []
    for e in spec.get("edges", []):
        a, b = shapes[e["src"]], shapes[e["dst"]]
        via = [(vx + off_x, vy + off_y) for vx, vy in e.get("via", [])]
        pts = _explicit_points(a, b, e, via)
        drawn_edges.append({"pts": pts, "e": e})

    # nodos
    for s in shapes.values():
        _draw_explicit(cv, s, dg)

    for g in drawn_edges:
        e = g["e"]
        style = e.get("style", "soft")
        draw_edge(cv, g["pts"], style=style, label=e.get("label"),
                  t=e.get("t", 0.5), dashed_route=False)

    return cv, {"width": width, "height": height}


def _explicit_points(a: dict, b: dict, e: dict,
                     via: Sequence[Tuple[float, float]] = ()) -> List[Tuple[float, float]]:
    """Puntos de una arista en diagramas con posiciones explícitas.

    Rutas disponibles:
      * ``direct``  → línea recta entre bordes.
      * ``elbow_h`` → horizontal, codo vertical, horizontal. Permite fijar el
        eje del codo con ``e['mid']`` (coordenada x).
      * ``elbow_v`` → vertical, codo horizontal, vertical (``e['mid']`` = y).
      * ``via``     → polilínea por puntos de paso declarados en ``e['via']``
        (ya desplazados por el llamador): permite rodear cajas.
    """
    route = e.get("route", "direct")
    acx, acy = a["x"] + a["w"] / 2, a["y"] + a["h"] / 2
    bcx, bcy = b["x"] + b["w"] / 2, b["y"] + b["h"] / 2
    start = rect_exit(acx, acy, a["w"], a["h"], bcx, bcy)
    end = rect_exit(bcx, bcy, b["w"], b["h"], acx, acy)
    if route == "via" and via:
        return [start, *list(via), end]
    if route == "direct":
        return [start, end]
    if route == "elbow_h":  # horizontal → vertical → horizontal
        mx = e.get("mid", (start[0] + end[0]) / 2)
        if abs(start[1] - end[1]) < 2 and "mid" not in e:
            return [start, end]
        return [start, (mx, start[1]), (mx, end[1]), end]
    if route == "elbow_v":  # vertical → horizontal → vertical
        my = e.get("mid", (start[1] + end[1]) / 2)
        if abs(start[0] - end[0]) < 2 and "mid" not in e:
            return [start, end]
        return [start, (start[0], my), (end[0], my), end]
    return [start, end]


def _draw_explicit(cv: Canvas, s: dict, dg: str) -> None:
    kind = s["kind"]
    x, y, w, h = s["x"], s["y"], s["w"], s["h"]

    if kind == "initial":
        cv.circle(s["cx"], s["cy"], 12, fill=C["text"])
        return
    if kind == "final":
        cv.circle(s["cx"], s["cy"], 14, fill=C["bg"], stroke=C["text"], sw=2)
        cv.circle(s["cx"], s["cy"], 7, fill=C["text"])
        return
    if kind == "actor":
        cx = s["cx"]
        cv.circle(cx, y + 12, 11, fill=C["bg"], stroke=C["process_stroke"],
                  sw=1.7)
        cv.line(cx, y + 23, cx, y + 52, stroke=C["process_stroke"], sw=1.7)
        cv.line(cx - 15, y + 33, cx + 15, y + 33, stroke=C["process_stroke"],
                sw=1.7)
        cv.line(cx, y + 52, cx - 13, y + 74, stroke=C["process_stroke"], sw=1.7)
        cv.line(cx, y + 52, cx + 13, y + 74, stroke=C["process_stroke"], sw=1.7)
        cv.text(cx, y + h - 4, s["label"], size=13, bold=True, anchor="middle")
        if s.get("sub"):
            cv.text(cx, y + h + 12, s["sub"], size=10, family=MONO,
                    anchor="middle", fill=C["muted"])
        return
    if kind == "db":
        rx, ry = w / 2, min(14.0, h / 4)
        stroke_db = s.get("stroke") or "#1d4ed8"
        cv.path(f"M{_n(x)},{_n(y + ry)} L{_n(x)},{_n(y + h - ry)} "
                f"A{_n(rx)},{_n(ry)} 0 0 0 {_n(x + w)},{_n(y + h - ry)} "
                f"L{_n(x + w)},{_n(y + ry)} Z",
                fill=s.get("fill", "#eff6ff"), stroke=stroke_db, sw=1.6)
        cv.path(f"M{_n(x)},{_n(y + h - ry)} A{_n(rx)},{_n(ry)} 0 0 0 "
                f"{_n(x + w)},{_n(y + h - ry)}", stroke=stroke_db, sw=1.6)
        cv.ellipse(x + w / 2, y + ry, rx, ry, fill=s.get("fill", "#eff6ff"),
                   stroke=stroke_db, sw=1.6)
        cv.text(x + w / 2, y + ry + 26, s.get("title", ""), size=12.5,
                bold=True, anchor="middle")
        if s.get("sub"):
            cv.text(x + w / 2, y + ry + 43, s["sub"], size=10, family=MONO,
                    anchor="middle", fill=C["muted"])
        return

    # box / state
    if kind == "state":
        cv.rect(x, y, w, h, rx=14, fill=s.get("fill", "#ffffff"),
                stroke=s.get("stroke", C["accent"]), sw=1.8, shadow=True)
        cv.text(x + w / 2, y + 24, s["lines"][0], size=12.5, bold=True,
                anchor="middle")
        if len(s["lines"]) > 1:
            cv.text_block(x + w / 2, y + 32, s["lines"][1:], size=10.5, lh=14,
                          anchor="middle", fill=C["muted"])
    else:
        cv.rect(x, y, w, h, rx=10, fill=s.get("fill", C["process_fill"]),
                stroke=s.get("stroke", C["process_stroke"]), sw=1.7,
                shadow=True)
        cv.text(x + w / 2, y + 24, s["lines"][0], size=13, bold=True,
                anchor="middle")
        if len(s["lines"]) > 1:
            cv.text_block(x + 14, y + 34, s["lines"][1:], size=11, lh=15,
                          fill=C["text"])
    if s.get("refs"):
        cv.text(x + w - 11, y + h - 8, s["refs"], size=9, family=MONO,
                fill=C["muted"], anchor="end")


# ---------------------------------------------------------------------------
# Despachador
# ---------------------------------------------------------------------------

def render(spec: dict) -> Canvas:
    kind = spec.get("kind", "flow")
    if kind == "flow":
        cv, _ = layout_flow(spec)
    elif kind == "seq":
        cv, _ = layout_seq(spec)
    elif kind == "explicit":
        cv, _ = layout_explicit(spec)
    else:
        raise ValueError(f"tipo de diagrama desconocido: {kind}")
    return cv
