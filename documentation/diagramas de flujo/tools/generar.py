#!/usr/bin/env python3
"""generar.py — genera los SVG de la documentación de GearQuest.

Uso (desde cualquier sitio):

    python3 "documentation/diagramas de flujo/tools/generar.py"
    python3 "documentation/diagramas de flujo/tools/generar.py" --check

Con `--check` no se escribe nada: se compara la salida con los SVG existentes
y se sale con código 3 si alguno está desactualizado (modo CI).

Salida: los archivos `NN_nombre.svg` en la carpeta `diagramas de flujo/`,
junto a este script. El proceso es determinista: solo se reescribe un archivo
si su contenido cambia realmente.

Códigos de salida:
    0 · todo correcto
    1 · hay avisos de maquetación (texto que desborda una caja, etc.)
    2 · error fatal (especificación inválida)
    3 · `--check` y algún SVG está desactualizado
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import svgkit          # noqa: E402
from diagramas import DIAGRAMAS   # noqa: E402
from layout import render         # noqa: E402


def main() -> int:
    check = "--check" in sys.argv[1:]
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    escritos = 0
    sin_cambios = 0
    desactualizados = 0

    for spec in DIAGRAMAS:
        destino = os.path.join(base, spec["file"])
        try:
            cv = render(spec)
        except Exception as exc:  # noqa: BLE001 — se informa y se continúa
            print(f"ERROR en {spec['id']} · {spec['title']}: {exc}")
            return 2
        titulo = f"GearQuest · Diagrama {spec['id']} — {spec['title']}"
        desc = spec.get("subtitle", "")
        contenido = cv.render(titulo, desc)
        anterior = None
        if os.path.exists(destino):
            with open(destino, encoding="utf-8") as fh:
                anterior = fh.read()
        if anterior == contenido:
            sin_cambios += 1
            print(f"  = {spec['file']}  (sin cambios)")
        elif check:
            desactualizados += 1
            print(f"  ✗ {spec['file']}  (desactualizado · ejecuta generar.py)")
        else:
            with open(destino, "w", encoding="utf-8") as fh:
                fh.write(contenido)
            escritos += 1
            print(f"  ✓ {spec['file']}  ({int(cv.width)}×{int(cv.height)} px)")

    avisos = svgkit.warnings()
    if avisos:
        print("\nAvisos de maquetación:")
        for a in avisos:
            print(f"  ! {a}")
    print(f"\n{len(DIAGRAMAS)} diagramas · {escritos} escritos · "
          f"{sin_cambios} sin cambios · {desactualizados} desactualizados · "
          f"{len(avisos)} avisos")
    if avisos:
        return 1
    return 3 if desactualizados else 0


if __name__ == "__main__":
    raise SystemExit(main())
