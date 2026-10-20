#!/usr/bin/env python3
"""QA geométrico de los SVG generados (sustituye a la revisión visual).

Comprueba:
  1. Ningún par de cajas de nodo se solapa.
  2. Ningún segmento de arista atraviesa por dentro una caja de nodo
     (las aristas solo pueden tocar los bordes de sus extremos).
  3. Todo <text> cae dentro del lienzo.
  4. No hay dos etiquetas de arista en la misma posición (colisión gruesa).
"""
import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))
from svgkit import text_width  # noqa: E402

HEADER = 112  # la cabecera (marca, título, leyenda) no cuenta como contenido

def rects(svg):
    out = []
    for m in re.finditer(r'<rect ([^/>]+)/>', svg):
        a = dict(re.findall(r'([\w-]+)="([^"]*)"', m.group(1)))
        try:
            x, y = float(a["x"]), float(a["y"])
            w, h = float(a["width"]), float(a["height"])
        except KeyError:
            continue
        if h < 40 or y < HEADER:          # badges, leyenda, cabecera, pie
            continue
        if w <= 14:                       # barras de activación (UML)
            continue
        if "stroke-dasharray" in a:       # fragmentos «alt» y notas (por diseño)
            continue
        if float(a.get("rx", 0)) >= 14 and w > 500:   # contenedores (explícito)
            continue
        out.append((x, y, x + w, y + h))
    return out

def paths(svg):
    """Devuelve lista de polilíneas (listas de puntos) de las aristas."""
    out = []
    for m in re.finditer(r'<path d="([^"]+)" fill="none"', svg):
        d = m.group(1)
        pts = []
        for cmd in re.finditer(r'([MLQ])([^MLQ]*)', d):
            tag, body = cmd.group(1), cmd.group(2)
            nums = [float(v) for v in re.findall(r'-?\d+(?:\.\d+)?', body)]
            if tag in ("M", "L"):
                pts.append((nums[0], nums[1]))
            elif tag == "Q":
                pts.append((nums[0], nums[1]))   # punto de control ~ esquina
                pts.append((nums[2], nums[3]))
        if len(pts) >= 2:
            out.append(pts)
    return out

def lines(svg):
    """Segmentos <line> (mensajes de secuencia, líneas de fase, etc.)."""
    out = []
    for m in re.finditer(r'<line ([^/>]+)/>', svg):
        a = dict(re.findall(r'([\w-]+)="([^"]*)"', m.group(1)))
        try:
            x0, y0 = float(a["x1"]), float(a["y1"])
            x1, y1 = float(a["x2"]), float(a["y2"])
        except KeyError:
            continue
        out.append(((x0, y0), (x1, y1)))
    return out


def texts(svg):
    """Cajas aproximadas de cada <text> para detectar solapes de etiquetas."""
    out = []
    for m in re.finditer(r'<text ([^>]*)>([^<]*)</text>', svg):
        a = dict(re.findall(r'([\w-]+)="([^"]*)"', m.group(1)))
        s = m.group(2)
        if not s.strip() or float(a.get("opacity", 1)) < 0.5:
            continue
        size = float(a["font-size"])
        bold = a.get("font-weight") == "700"
        mono = "mono" in a.get("font-family", "").lower()
        w = text_width(s, size, bold, mono)
        x, y = float(a["x"]), float(a["y"])
        anchor = a.get("text-anchor", "start")
        if anchor == "middle":
            x -= w / 2
        elif anchor == "end":
            x -= w
        out.append((x, y - size * 0.78, x + w, y + size * 0.24, s))
    return out


def inside(px, py, box, margin=3):
    x0, y0, x1, y1 = box
    return x0 + margin < px < x1 - margin and y0 + margin < py < y1 - margin

def seg_intersects_box(p, q, box, margin=3):
    """¿Cruza el segmento el interior del rectángulo? Muestreo fino."""
    steps = 40
    for i in range(steps + 1):
        t = i / steps
        px = p[0] + (q[0] - p[0]) * t
        py = p[1] + (q[1] - p[1]) * t
        if inside(px, py, box, margin):
            return (px, py)
    return None

def main(files):
    failures = 0
    for f in files:
        svg = open(f, encoding="utf-8").read()
        W = float(re.search(r'width="([\d.]+)"', svg).group(1))
        H = float(re.search(r'height="([\d.]+)"', svg).group(1))
        boxes = rects(svg)
        polylines = paths(svg)

        # 1. solapamiento de cajas
        for i in range(len(boxes)):
            for j in range(i + 1, len(boxes)):
                a, b = boxes[i], boxes[j]
                if a[0] < b[2] - 1 and b[0] < a[2] - 1 and a[1] < b[3] - 1 and b[1] < a[3] - 1:
                    print(f"  ✗ {f}: cajas solapadas {a} vs {b}")
                    failures += 1

        # 2. aristas que atraviesan cajas
        for pts in polylines:
            for seg in zip(pts, pts[1:]):
                for box in boxes:
                    hit = seg_intersects_box(seg[0], seg[1], box)
                    if hit:
                        print(f"  ✗ {f}: arista atraviesa una caja cerca de "
                              f"({hit[0]:.0f},{hit[1]:.0f}) caja={tuple(round(v) for v in box)}")
                        failures += 1

        # 3. textos dentro del lienzo
        for m in re.finditer(r'<text x="(-?[\d.]+)" y="(-?[\d.]+)"[^>]*>([^<]*)</text>', svg):
            x, y = float(m.group(1)), float(m.group(2))
            if not (-5 <= x <= W + 5 and 0 <= y <= H):
                print(f"  ✗ {f}: texto fuera del lienzo ({x:.0f},{y:.0f}) «{m.group(3)[:40]}»")
                failures += 1

        # 4. líneas rectas (mensajes de secuencia, separadores) que cruzan cajas
        for (p, q) in lines(svg):
            if p[1] < HEADER and q[1] < HEADER:
                continue
            for box in boxes:
                hit = seg_intersects_box(p, q, box, margin=4)
                if hit:
                    print(f"  ✗ {f}: línea atraviesa una caja cerca de "
                          f"({hit[0]:.0f},{hit[1]:.0f}) caja={tuple(round(v) for v in box)}")
                    failures += 1

        # 5. etiquetas de texto solapadas entre sí
        tb = texts(svg)
        for i in range(len(tb)):
            for j in range(i + 1, len(tb)):
                a, b = tb[i], tb[j]
                ox = min(a[2], b[2]) - max(a[0], b[0])
                oy = min(a[3], b[3]) - max(a[1], b[1])
                if ox > 4 and oy > 4:
                    print(f"  ✗ {f}: textos solapados «{a[4][:32]}» vs "
                          f"«{b[4][:32]}»")
                    failures += 1

        print(f"  · {f.split('/')[-1]}: {len(boxes)} cajas, {len(polylines)} aristas, "
              f"{len(tb)} textos, {W:.0f}×{H:.0f}")
    print(f"\nFallos: {failures}")
    return 1 if failures else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
