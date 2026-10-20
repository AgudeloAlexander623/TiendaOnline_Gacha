"""svgkit — motor de renderizado SVG para la documentación de GearQuest.

Diseñado para generar diagramas de la documentación de forma **reproducible**:
mismo código de entrada produce exactamente el mismo SVG de salida (no se
incorporan marcas de tiempo ni rutas absolutas), de modo que los diffs de Git
solo reflejen cambios reales del diagrama.

Solo se usa la biblioteca estándar de Python (>= 3.9): no hay dependencias
externas, así que cualquier integrante puede regenerar los diagramas con
`python3 tools/generar.py`.

Estilo visual (design system):
  * tipografía Arial/Helvetica (métricas≈Liberation Sans en Linux)
  * paleta slate + acentos semánticos (verde=correcto, rojo=error, ámbar=decisión)
  * cajas con sombra sutil, etiquetas de servicio en píldora monoespaciada
  * toda caja de texto declara su ancho y el motor verifica que no desborde

Autores: Equipo GearQuest. Mantener este archivo en español (NFR-DOC).
"""

from __future__ import annotations

import html
import math
import unicodedata
from typing import Dict, List, Optional, Sequence, Tuple

# ---------------------------------------------------------------------------
# Sistema de diseño
# ---------------------------------------------------------------------------

SANS = "Arial, Helvetica, sans-serif"
MONO = "Consolas, 'DejaVu Sans Mono', monospace"

C = {
    "bg": "#ffffff",
    "text": "#0f172a",
    "muted": "#64748b",
    "faint": "#94a3b8",
    "rule": "#e2e8f0",
    "process_fill": "#ffffff",
    "process_stroke": "#334155",
    "terminal_fill": "#ecfdf5",
    "terminal_stroke": "#059669",
    "decision_fill": "#fffbeb",
    "decision_stroke": "#d97706",
    "error_fill": "#fef2f2",
    "error_stroke": "#dc2626",
    "ok_fill": "#f0fdf4",
    "ok_stroke": "#16a34a",
    "note_fill": "#fefce8",
    "note_stroke": "#ca8a04",
    "lane_fill": "#f8fafc",
    "lane_stroke": "#cbd5e1",
    "edge": "#475569",
    "edge_ok": "#059669",
    "edge_err": "#dc2626",
    "edge_soft": "#94a3b8",
    "accent": "#4f46e5",
}

# Colores por responsable (etiquetas "owner"). Mismos tonos que en el README.
SERVICE_COLORS: Dict[str, str] = {
    "frontend": "#2563eb",
    "identity-service": "#7c3aed",
    "store-service": "#0891b2",
    "economy-service": "#ea580c",
    "payments-service": "#059669",
    "notificaciones": "#db2777",
    "servicio-python": "#475569",
    "godot": "#4f46e5",
    "postgresql": "#1d4ed8",
    "equipo": "#334155",
}

# ---------------------------------------------------------------------------
# Métricas de texto (tablas de anchos Arial/Helvetica, unidades/1000)
# ---------------------------------------------------------------------------

_W_NORMAL = {
    " ": 278, "!": 278, '"': 355, "#": 556, "$": 556, "%": 889, "&": 667,
    "'": 191, "(": 333, ")": 333, "*": 389, "+": 584, ",": 278, "-": 333,
    ".": 278, "/": 278, "0": 556, "1": 556, "2": 556, "3": 556, "4": 556,
    "5": 556, "6": 556, "7": 556, "8": 556, "9": 556, ":": 278, ";": 278,
    "<": 584, "=": 584, ">": 584, "?": 556, "@": 1015,
    "A": 667, "B": 667, "C": 722, "D": 722, "E": 667, "F": 611, "G": 778,
    "H": 722, "I": 278, "J": 500, "K": 667, "L": 556, "M": 833, "N": 722,
    "O": 778, "P": 667, "Q": 778, "R": 722, "S": 667, "T": 611, "U": 722,
    "V": 667, "W": 944, "X": 667, "Y": 667, "Z": 611,
    "[": 278, "\\": 278, "]": 278, "^": 469, "_": 556, "`": 333,
    "a": 556, "b": 556, "c": 500, "d": 556, "e": 556, "f": 278, "g": 556,
    "h": 556, "i": 222, "j": 222, "k": 500, "l": 222, "m": 833, "n": 556,
    "o": 556, "p": 556, "q": 556, "r": 333, "s": 500, "t": 278, "u": 556,
    "v": 500, "w": 722, "x": 500, "y": 500, "z": 500,
    "{": 334, "|": 260, "}": 334, "~": 584,
    "¡": 333, "¿": 556, "·": 278, "…": 1000, "–": 556, "—": 1000,
    "“": 333, "”": 333, "‘": 222, "’": 222, "«": 556, "»": 556,
    "°": 400, "×": 584, "≤": 584, "≥": 584, "≠": 584, "•": 350,
    "Ñ": 722, "ñ": 556, "Ü": 722, "ü": 556,
    "Á": 667, "É": 667, "Í": 278, "Ó": 778, "Ú": 722,
    "á": 556, "é": 556, "í": 278, "ó": 556, "ú": 556,
    "€": 556,
}

_WARN: List[str] = []


def warn(diagram: str, message: str) -> None:
    _WARN.append(f"[{diagram}] {message}")


def warnings() -> List[str]:
    return list(_WARN)


def _char_width(ch: str) -> int:
    if ch in _W_NORMAL:
        return _W_NORMAL[ch]
    base = unicodedata.normalize("NFD", ch)
    if base:
        plain = unicodedata.normalize("NFC", base[0])
        if plain in _W_NORMAL:
            return _W_NORMAL[plain]
    return 600  # conservador para símbolos desconocidos


def text_width(s: str, size: float, bold: bool = False, mono: bool = False) -> float:
    """Ancho estimado en píxeles de `s` dibujado con las métricas declaradas."""
    if mono:
        return len(s) * size * 0.60
    units = sum(_char_width(ch) for ch in s) / 1000.0
    return units * size * (1.09 if bold else 1.0)


def wrap(text: str, max_w: float, size: float, bold: bool = False,
         mono: bool = False) -> List[str]:
    """Ajuste de líneas voraz por palabras. No parte palabras: si una sola
    palabra no cabe, se emite tal cual y el llamador advierte (ver `fit_box`)."""
    words = text.split()
    if not words:
        return [""]
    lines: List[str] = []
    cur = words[0]
    for word in words[1:]:
        candidate = f"{cur} {word}"
        if text_width(candidate, size, bold, mono) <= max_w:
            cur = candidate
        else:
            lines.append(cur)
            cur = word
    lines.append(cur)
    return lines


# ---------------------------------------------------------------------------
# Lienzo SVG
# ---------------------------------------------------------------------------

def _n(v: float) -> str:
    """Número compacto y determinista."""
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return s if s not in ("-0", "") else "0"


def esc(s: str) -> str:
    return html.escape(s, quote=True)


class Canvas:
    """Acumulador de elementos SVG."""

    def __init__(self, width: float, height: float) -> None:
        self.width = width
        self.height = height
        self.parts: List[str] = []
        self.defs: List[str] = []

    # -- primitivas ---------------------------------------------------------
    def el(self, markup: str) -> None:
        self.parts.append(markup)

    def rect(self, x, y, w, h, *, rx=0, fill="#ffffff", stroke=None, sw=1.5,
             dash=None, opacity=None, shadow=False, extra="") -> None:
        attrs = [f'x="{_n(x)}"', f'y="{_n(y)}"', f'width="{_n(w)}"',
                 f'height="{_n(h)}"']
        if rx:
            attrs.append(f'rx="{_n(rx)}"')
        attrs.append(f'fill="{fill}"')
        if stroke:
            attrs.append(f'stroke="{stroke}" stroke-width="{_n(sw)}"')
        if dash:
            attrs.append(f'stroke-dasharray="{dash}"')
        if opacity is not None:
            attrs.append(f'opacity="{_n(opacity)}"')
        if shadow:
            attrs.append('filter="url(#softshadow)"')
        if extra:
            attrs.append(extra)
        self.el(f"<rect {' '.join(attrs)}/>")

    def ellipse(self, cx, cy, rx, ry, *, fill="#ffffff", stroke=None, sw=1.5,
                dash=None, extra="") -> None:
        attrs = [f'cx="{_n(cx)}"', f'cy="{_n(cy)}"', f'rx="{_n(rx)}"',
                 f'ry="{_n(ry)}"', f'fill="{fill}"']
        if stroke:
            attrs.append(f'stroke="{stroke}" stroke-width="{_n(sw)}"')
        if dash:
            attrs.append(f'stroke-dasharray="{dash}"')
        if extra:
            attrs.append(extra)
        self.el(f"<ellipse {' '.join(attrs)}/>")

    def circle(self, cx, cy, r, *, fill="#ffffff", stroke=None, sw=1.5,
               extra="") -> None:
        attrs = [f'cx="{_n(cx)}"', f'cy="{_n(cy)}"', f'r="{_n(r)}"',
                 f'fill="{fill}"']
        if stroke:
            attrs.append(f'stroke="{stroke}" stroke-width="{_n(sw)}"')
        if extra:
            attrs.append(extra)
        self.el(f"<circle {' '.join(attrs)}/>")

    def line(self, x1, y1, x2, y2, *, stroke="#475569", sw=1.6, dash=None,
             marker=None, cap="round", opacity=None) -> None:
        attrs = [f'x1="{_n(x1)}"', f'y1="{_n(y1)}"', f'x2="{_n(x2)}"',
                 f'y2="{_n(y2)}"', f'stroke="{stroke}"',
                 f'stroke-width="{_n(sw)}"', f'stroke-linecap="{cap}"']
        if dash:
            attrs.append(f'stroke-dasharray="{dash}"')
        if marker:
            attrs.append(f'marker-end="url(#{marker})"')
        if opacity is not None:
            attrs.append(f'opacity="{_n(opacity)}"')
        self.el(f"<line {' '.join(attrs)}/>")

    def path(self, d, *, fill="none", stroke="#475569", sw=1.6, dash=None,
             marker=None, cap="round", join="round", opacity=None) -> None:
        attrs = [f'd="{d}"', f'fill="{fill}"']
        if stroke:
            attrs.append(f'stroke="{stroke}" stroke-width="{_n(sw)}"')
            attrs.append(f'stroke-linecap="{cap}" stroke-linejoin="{join}"')
        if dash:
            attrs.append(f'stroke-dasharray="{dash}"')
        if marker:
            attrs.append(f'marker-end="url(#{marker})"')
        if opacity is not None:
            attrs.append(f'opacity="{_n(opacity)}"')
        self.el(f"<path {' '.join(attrs)}/>")

    def text(self, x, y, s, *, size=12, fill=None, anchor="start", bold=False,
             family=SANS, halo=False, italic=False, ls=None, opacity=None,
             extra="") -> None:
        if s == "":
            return
        fill = fill or C["text"]
        attrs = [f'x="{_n(x)}"', f'y="{_n(y)}"', f'font-size="{_n(size)}"',
                 f'fill="{fill}"', f'font-family="{family}"']
        if anchor != "start":
            attrs.append(f'text-anchor="{anchor}"')
        if bold:
            attrs.append('font-weight="700"')
        if italic:
            attrs.append('font-style="italic"')
        if ls is not None:
            attrs.append(f'letter-spacing="{_n(ls)}"')
        if opacity is not None:
            attrs.append(f'opacity="{_n(opacity)}"')
        if halo:
            attrs.append('stroke="#ffffff" stroke-width="3.2" '
                         'paint-order="stroke" stroke-linejoin="round"')
        if extra:
            attrs.append(extra)
        self.el(f"<text {' '.join(attrs)}>{esc(s)}</text>")

    def text_block(self, x, y_top, lines, *, size=12, lh=17, fill=None,
                   anchor="start", bold=False, family=SANS, halo=False,
                   italic=False) -> None:
        """Bloque de líneas con la primera línea anclada en `y_top` (arriba)."""
        base = y_top + (lh - size) / 2 + size * 0.80
        for i, line in enumerate(lines):
            self.text(x, base + i * lh, line, size=size, fill=fill,
                      anchor=anchor, bold=bold, family=family, halo=halo,
                      italic=italic)

    # -- serialización ------------------------------------------------------
    def render(self, title: str, desc: str = "") -> str:
        head = [
            '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
            "<!-- GENERADO por documentation/diagramas de flujo/tools/generar.py"
            " — NO EDITAR A MANO. Editar svgkit.py / diagramas.py y regenerar. -->",
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'width="{_n(self.width)}" height="{_n(self.height)}" '
            f'viewBox="0 0 {_n(self.width)} {_n(self.height)}" '
            f'role="img" aria-labelledby="titulo">',
            f"<title id=\"titulo\">{esc(title)}</title>",
            (f"<desc>{esc(desc)}</desc>" if desc else ""),
            "<defs>",
            '<filter id="softshadow" x="-20%" y="-20%" width="140%" '
            'height="140%">',
            '<feDropShadow dx="0" dy="1" stdDeviation="1.6" '
            'flood-color="#0f172a" flood-opacity="0.14"/>',
            "</filter>",
        ]
        for name, color in (("arr", C["edge"]), ("arr_ok", C["edge_ok"]),
                            ("arr_err", C["edge_err"]),
                            ("arr_soft", C["edge_soft"]),
                            ("arr_accent", C["accent"])):
            head.append(
                f'<marker id="{name}" viewBox="0 0 10 10" refX="9" refY="5" '
                f'markerWidth="9" markerHeight="9" orient="auto" '
                f'markerUnits="userSpaceOnUse">'
                f'<path d="M0,0 L10,5 L0,10 L2.4,5 Z" fill="{color}"/></marker>'
            )
        head.append("</defs>")
        head.extend(self.defs)
        body = "\n".join(p for p in self.parts if p)
        return "\n".join(head) + "\n" + body + "\n</svg>\n"

    def save(self, path: str, title: str, desc: str = "") -> None:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(self.render(title, desc))


# ---------------------------------------------------------------------------
# Formas de nodo
# ---------------------------------------------------------------------------

KIND_STYLE = {
    "terminal": ("terminal_fill", "terminal_stroke"),
    "process": ("process_fill", "process_stroke"),
    "decision": ("decision_fill", "decision_stroke"),
    "error": ("error_fill", "error_stroke"),
    "ok": ("ok_fill", "ok_stroke"),
    "note": ("note_fill", "note_stroke"),
    "state": ("process_fill", "#4f46e5"),
}

PAD_X = 16
PAD_Y = 14
LH = 17
REFS_H = 15
BADGE_H = 17


def measure(kind: str, lines: Sequence[str], refs: Optional[str],
            fixed_w: Optional[float], diagram: str, nid: str) -> Tuple[float, float]:
    """Devuelve (ancho, alto) de un nodo a partir de sus líneas ya partidas."""
    size = 12
    if kind == "note":
        size = 11.5
    max_line = max((text_width(l, size) for l in lines), default=0)
    if kind == "decision":
        n = max(1, len(lines))
        w = fixed_w or max(250.0, (max_line + 34) / 0.55)
        h = n * LH + 62
        # verificar que las líneas caben dentro del rombo; el bloque de texto
        # va centrado, así que el desplazamiento solo depende de n y de i
        block_top = (h - n * LH) / 2
        for i, l in enumerate(lines):
            offset = abs(block_top + (i + 0.5) * LH - h / 2)
            avail = w * max(0.34, 1.0 - 2 * offset / h) - 16
            if text_width(l, size) > avail:
                warn(diagram, f"nodo '{nid}': la línea \"{l}\" no cabe en el "
                              f"rombo (ancho {text_width(l, size):.0f} > "
                              f"{avail:.0f}). Acorta el texto.")
        return w, h
    w = fixed_w or min(330.0, max(200.0, max_line + 2 * PAD_X))
    inner = w - 2 * PAD_X
    for l in lines:
        if text_width(l, size) > inner + 0.5:
            warn(diagram, f"nodo '{nid}': \"{l}\" desborda {inner:.0f}px "
                          f"({text_width(l, size):.0f}px). Divide la línea o "
                          f"amplía 'w'.")
    h = PAD_Y * 2 + len(lines) * LH
    if kind == "terminal":
        h += 6
    if refs:
        h += REFS_H
    return w, h


def split_lines(spec: dict) -> List[str]:
    txt = spec.get("text", "")
    if isinstance(txt, (list, tuple)):
        return [str(t) for t in txt]
    return [str(txt)]


def draw_node(cv: Canvas, spec: dict, x: float, y: float, w: float, h: float,
              diagram: str) -> None:
    kind = spec.get("kind", "process")
    fill_key, stroke_key = KIND_STYLE.get(kind, KIND_STYLE["process"])
    fill = spec.get("fill", C[fill_key])
    stroke = spec.get("stroke", C[stroke_key])
    dash = "6 5" if kind == "note" else None
    lines = spec.get("_lines", [])
    size = 11.5 if kind == "note" else 12

    if kind == "terminal":
        cv.rect(x, y, w, h, rx=h / 2, fill=fill, stroke=stroke, sw=1.7,
                shadow=True)
    elif kind == "decision":
        cx, cy = x + w / 2, y + h / 2
        cv.el(f'<polygon points="{_n(cx)},{_n(y)} {_n(x + w)},{_n(cy)} '
              f'{_n(cx)},{_n(y + h)} {_n(x)},{_n(cy)}" fill="{fill}" '
              f'stroke="{stroke}" stroke-width="1.7" '
              f'filter="url(#softshadow)"/>')
    else:
        rx = 4 if kind == "note" else 9
        cv.rect(x, y, w, h, rx=rx, fill=fill, stroke=stroke, sw=1.6,
                dash=dash, shadow=(kind != "note"))

    # texto
    text_top = y + PAD_Y
    if kind == "decision":
        block_h = len(lines) * LH
        text_top = y + (h - block_h) / 2
    elif kind == "terminal":
        text_top = y + (h - len(lines) * LH - (REFS_H if spec.get("refs") else 0)) / 2
    cv.text_block(x + w / 2, text_top, lines, size=size, lh=LH,
                  anchor="middle", bold=(kind == "terminal"),
                  fill=spec.get("text_fill", C["text"]))

    # referencia de trazabilidad
    if spec.get("refs"):
        cv.text(x + w - 11, y + h - 7, spec["refs"], size=9, family=MONO,
                fill=C["muted"], anchor="end")

    # etiqueta de servicio (owner)
    if spec.get("owner"):
        color = SERVICE_COLORS.get(spec["owner"], C["accent"])
        label = spec["owner"]
        bw = text_width(label, 9.5, bold=True, mono=True) + 16
        bx = x + 14
        by = y - BADGE_H + 1
        cv.rect(bx, by, bw, BADGE_H, rx=BADGE_H / 2, fill=color,
                stroke="#ffffff", sw=1.4)
        cv.text(bx + bw / 2, by + BADGE_H / 2 + 3.4, label, size=9.5,
                fill="#ffffff", anchor="middle", bold=True, family=MONO)


# ---------------------------------------------------------------------------
# Enrutado de aristas
# ---------------------------------------------------------------------------

def _poly_path(points: Sequence[Tuple[float, float]], r: float = 12,
               end: Optional[str] = None) -> str:
    """Ruta polilínea con esquinas redondeadas. `end` indica si la última
    esquina debe curvar hacia el punto final (para flechas limpias)."""
    if len(points) < 2:
        return ""
    pts = [(round(px, 2), round(py, 2)) for px, py in points]
    d = [f"M{ _n(pts[0][0]) },{ _n(pts[0][1]) }"]
    for i in range(1, len(pts) - 1):
        x0, y0 = pts[i - 1]
        x1, y1 = pts[i]
        x2, y2 = pts[i + 1]
        v1 = (x1 - x0, y1 - y0)
        v2 = (x2 - x1, y2 - y1)
        l1 = math.hypot(*v1) or 1.0
        l2 = math.hypot(*v2) or 1.0
        rr = min(r, l1 / 2, l2 / 2)
        p_a = (x1 - v1[0] / l1 * rr, y1 - v1[1] / l1 * rr)
        p_b = (x1 + v2[0] / l2 * rr, y1 + v2[1] / l2 * rr)
        d.append(f"L{_n(p_a[0])},{_n(p_a[1])}")
        d.append(f"Q{_n(x1)},{_n(y1)} {_n(p_b[0])},{_n(p_b[1])}")
    d.append(f"L{_n(pts[-1][0])},{_n(pts[-1][1])}")
    return " ".join(d)


def _path_length(points: Sequence[Tuple[float, float]]) -> float:
    total = 0.0
    for i in range(1, len(points)):
        total += math.hypot(points[i][0] - points[i - 1][0],
                            points[i][1] - points[i - 1][1])
    return total


def _point_at(points: Sequence[Tuple[float, float]], t: float
              ) -> Tuple[float, float, Tuple[float, float]]:
    total = _path_length(points) or 1.0
    target = total * t
    acc = 0.0
    for i in range(1, len(points)):
        seg = math.hypot(points[i][0] - points[i - 1][0],
                         points[i][1] - points[i - 1][1])
        if acc + seg >= target or i == len(points) - 1:
            f = (target - acc) / seg if seg else 0.0
            f = max(0.0, min(1.0, f))
            x = points[i - 1][0] + (points[i][0] - points[i - 1][0]) * f
            y = points[i - 1][1] + (points[i][1] - points[i - 1][1]) * f
            dx, dy = points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]
            return x, y, (dx, dy)
        acc += seg
    return points[-1][0], points[-1][1], (1, 0)


def rect_exit(cx: float, cy: float, w: float, h: float,
              tx: float, ty: float) -> Tuple[float, float]:
    """Punto de salida desde el centro de un rectángulo hacia (tx, ty)."""
    dx, dy = tx - cx, ty - cy
    if dx == 0 and dy == 0:
        return cx, cy + h / 2
    sx = (w / 2) / abs(dx) if dx else float("inf")
    sy = (h / 2) / abs(dy) if dy else float("inf")
    s = min(sx, sy)
    return cx + dx * s, cy + dy * s


def edge_points(route: str, src: dict, dst: dict, margin: Optional[dict] = None
                ) -> List[Tuple[float, float]]:
    """Puntos que definen la polilínea de una arista según su ruta."""
    sx0, sy0 = src["x"], src["y"]
    sx1, sy1 = src["x"] + src["w"], src["y"] + src["h"]
    dx0, dy0 = dst["x"], dst["y"]
    dx1, dy1 = dst["x"] + dst["w"], dst["y"] + dst["h"]
    scx, scy = (sx0 + sx1) / 2, (sy0 + sy1) / 2
    dcx, dcy = (dx0 + dx1) / 2, (dy0 + dy1) / 2
    m = margin or {}

    if route == "v":  # de abajo de src a arriba de dst (misma columna)
        return [(scx, sy1), (scx, dy0)] if dcy >= scy else [(scx, sy0), (scx, dy1)]

    if route == "vup":  # de arriba de src hacia abajo de dst (misma columna)
        return [(scx, sy0), (scx, dy1)]

    if route == "side_r":  # horizontal, src derecha → dst izquierda
        if abs(scy - dcy) < 6:
            return [(sx1, scy), (dx0, dcy)]
        mid = (sx1 + dx0) / 2
        return [(sx1, scy), (mid, scy), (mid, dcy), (dx0, dcy)]

    if route == "side_l":  # horizontal, src izquierda → dst derecha
        if abs(scy - dcy) < 6:
            return [(sx0, scy), (dx1, dcy)]
        mid = (sx0 + dx1) / 2
        return [(sx0, scy), (mid, scy), (mid, dcy), (dx1, dcy)]

    if route in ("ortho", "ortho_r", "ortho_l"):
        # abajo de src → cruza en horizontal → arriba de dst (en el hueco)
        out = (scx, sy1)
        turn_y = (sy1 + dy0) / 2 if dy0 >= sy1 else sy1 + 24
        return [out, (scx, turn_y), (dcx, turn_y), (dcx, dy0)]

    if route == "loop_r":  # sale por la derecha, sube por el margen, entra
        mx = m.get("right", sx1 + 60)
        enter = m.get("enter_r", "right")
        pts = [(sx1, scy), (mx, scy)]
        if enter == "right":
            pts += [(mx, dcy), (dx1, dcy)]
        else:  # entra por arriba
            pts += [(mx, dy0 - 18), (dcx, dy0 - 18), (dcx, dy0)]
        return pts

    if route == "loop_l":  # sale por la izquierda, sube/baja por el margen
        mx = m.get("left", sx0 - 60)
        enter = m.get("enter_l", "left")
        pts = [(sx0, scy), (mx, scy)]
        if enter == "left":
            pts += [(mx, dcy), (dx1, dcy)]
        else:
            pts += [(mx, dy0 - 18), (dcx, dy0 - 18), (dcx, dy0)]
        return pts

    if route == "cross_r":  # abajo de src → margen derecho → arriba de dst
        mx = m.get("right", sx1 + 60)
        return [(scx, sy1), (scx, sy1 + 22), (mx, sy1 + 22), (mx, dcy),
                (dx1, dcy)]

    if route == "cross_l":  # abajo de src → margen izquierdo → entra por dst
        mx = m.get("left", sx0 - 60)
        return [(scx, sy1), (scx, sy1 + 22), (mx, sy1 + 22), (mx, dcy),
                (dx0, dcy)]

    if route == "to_side":  # abajo de src → entra por el lado de dst
        if scx <= dcx:
            return [(scx, sy1), (scx, dcy), (dx0, dcy)]
        return [(scx, sy1), (scx, dcy), (dx1, dcy)]

    raise ValueError(f"ruta desconocida: {route}")


EDGE_STYLE = {
    "normal": (C["edge"], "arr", False),
    "ok": (C["edge_ok"], "arr_ok", False),
    "err": (C["edge_err"], "arr_err", True),
    "soft": (C["edge_soft"], "arr_soft", True),
    "accent": (C["accent"], "arr_accent", False),
}


def draw_edge(cv: Canvas, points: Sequence[Tuple[float, float]],
              style: str = "normal", label: Optional[str] = None,
              t: float = 0.5, dashed_route: bool = False) -> None:
    color, marker, dashed = EDGE_STYLE.get(style, EDGE_STYLE["normal"])
    d = _poly_path(points, r=12)
    cv.path(d, stroke=color, sw=1.7,
            dash=("7 5" if (dashed or dashed_route) else None),
            marker=marker)
    if label:
        x, y, (dx, dy) = _point_at(points, t)
        if abs(dy) >= abs(dx):          # tramo vertical → etiqueta al lado
            lx, ly, anchor = x + 9, y - 6, "start"
        else:                            # tramo horizontal → encima
            lx, ly, anchor = x, y - 8, "middle"
        cv.text(lx, ly, label, size=11, bold=True, fill=color, anchor=anchor,
                halo=True)
