from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform
from pathlib import Path
import math
import re

SRC = Path(r"d:\Project\myprog\logoacoustic\fonts\PlusJakartaSans-wght.ttf")
OUT = Path(r"d:\Project\myprog\logoacoustic\assets")
OUT.mkdir(parents=True, exist_ok=True)

INK = "#0B0B0C"
GOLD = "#C4A574"
MUTED = "#8A8176"
PAPER = "#F6F3EE"


def load_weight(wght: float) -> TTFont:
    return instantiateVariableFont(TTFont(str(SRC)), {"wght": wght})


def round_path(d: str, ndigits: int = 2) -> str:
    def repl(m):
        return f"{float(m.group()):.{ndigits}f}".rstrip("0").rstrip(".")
    return re.sub(r"-?\d+\.\d+", repl, d)


def glyph_paths_and_bounds(font, text, font_size, tracking_em, origin_x, baseline_y):
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    upem = font["head"].unitsPerEm
    scale = font_size / upem
    tracking = tracking_em * font_size
    paths = []
    xmin = ymin = float("inf")
    xmax = ymax = float("-inf")
    x = origin_x
    for i, ch in enumerate(text):
        if ch == " ":
            x += 0.32 * font_size
            if i < len(text) - 1:
                x += tracking * 0.35
            continue
        gname = cmap[ord(ch)]
        glyph = glyph_set[gname]
        t = Transform(scale, 0, 0, -scale, x, baseline_y)
        spen = SVGPathPen(glyph_set)
        glyph.draw(TransformPen(spen, t))
        d = spen.getCommands()
        if d:
            paths.append(round_path(d))
        bpen = BoundsPen(glyph_set)
        glyph.draw(TransformPen(bpen, t))
        if bpen.bounds:
            x0, y0, x1, y1 = bpen.bounds
            xmin, ymin = min(xmin, x0), min(ymin, y0)
            xmax, ymax = max(xmax, x1), max(ymax, y1)
        x += glyph.width * scale
        if i < len(text) - 1:
            x += tracking
    return paths, (xmin, ymin, xmax, ymax), x


def add(a, b):
    return (a[0] + b[0], a[1] + b[1])


def sub(a, b):
    return (a[0] - b[0], a[1] - b[1])


def mul(a, s):
    return (a[0] * s, a[1] * s)


def lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def normalize(v):
    length = math.hypot(v[0], v[1])
    return (v[0] / length, v[1] / length)


def perp(v):
    return (-v[1], v[0])


def dot(a, b):
    return a[0] * b[0] + a[1] * b[1]


def line_intersect(p, r, q, s):
    det = r[0] * s[1] - r[1] * s[0]
    if abs(det) < 1e-9:
        return None
    w = sub(q, p)
    t = (w[0] * s[1] - w[1] * s[0]) / det
    return add(p, mul(r, t))


def point_on_y(p1, p2, y):
    t = (y - p1[1]) / (p2[1] - p1[1])
    return lerp(p1, p2, t)


def d_poly(pts):
    return "M " + " L ".join(f"{p[0]:.2f} {p[1]:.2f}" for p in pts) + " Z"


def d_line(p1, p2):
    return f"M {p1[0]:.2f} {p1[1]:.2f} L {p2[0]:.2f} {p2[1]:.2f}"


def d_polyline(pts):
    return "M " + " L ".join(f"{p[0]:.2f} {p[1]:.2f}" for p in pts)


def chevron_polygon(left_a, left_b, meet, thickness):
    ua = normalize(sub(meet, left_a))
    ub = normalize(sub(meet, left_b))
    na, nb = perp(ua), perp(ub)
    if dot(na, sub(left_b, lerp(left_a, meet, 0.5))) > 0:
        na = mul(na, -1)
    if dot(nb, sub(left_a, lerp(left_b, meet, 0.5))) > 0:
        nb = mul(nb, -1)
    h = thickness / 2
    a_out, a_in = add(left_a, mul(na, h)), add(left_a, mul(na, -h))
    b_out, b_in = add(left_b, mul(nb, h)), add(left_b, mul(nb, -h))
    outer = line_intersect(a_out, ua, b_out, ub)
    inner = line_intersect(a_in, ua, b_in, ub)
    return [a_out, a_in, inner, b_in, b_out, outer]


def stem_hcaps(p1, p2, thickness, y_top, y_bot):
    u = normalize(sub(p2, p1))
    n = perp(u)
    h = thickness / 2
    left1, left2 = add(p1, mul(n, h)), add(p2, mul(n, h))
    right1, right2 = add(p1, mul(n, -h)), add(p2, mul(n, -h))
    horiz = (1.0, 0.0)
    tl = line_intersect(left1, sub(left2, left1), (0.0, y_top), horiz)
    tr = line_intersect(right1, sub(right2, right1), (0.0, y_top), horiz)
    bl = line_intersect(left1, sub(left2, left1), (0.0, y_bot), horiz)
    br = line_intersect(right1, sub(right2, right1), (0.0, y_bot), horiz)
    return [tl, tr, br, bl]


def wrap_svg(view_w, view_h, body, label="VELORA"):
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view_w:.2f} {view_h:.2f}" width="{view_w:.2f}" height="{view_h:.2f}" fill="none" role="img" aria-label="{label}">
  <title>{label}</title>
{body}
</svg>
'''


def va_mark(ink, gold, ox=0.0, oy=0.0):
    top, bot = 40.0, 212.0
    stem = 15.0
    v_lt = (72.0, top)
    v_ap = (136.0, bot)
    shared = (200.0, top)
    a_rb = (264.0, bot)
    bar_y = top + (bot - top) * 0.56
    bar_h = 6.8

    v_pts = chevron_polygon(v_lt, shared, v_ap, stem)
    a_right = stem_hcaps(shared, a_rb, stem, top, bot)

    p_shared = point_on_y(shared, v_ap, bar_y)
    p_right = point_on_y(shared, a_rb, bar_y)
    a_outer = point_on_y(a_right[1], a_right[2], bar_y)

    bar_left = (p_shared[0] + 9, bar_y)
    bar_right = (a_outer[0] + 92, bar_y)
    bar_pts = [
        (bar_left[0], bar_y - bar_h / 2),
        (bar_right[0], bar_y - bar_h / 2),
        (bar_right[0], bar_y + bar_h / 2),
        (bar_left[0], bar_y + bar_h / 2),
    ]

    # Horn: three sharp rays from one origin on the outer V stem
    ul = normalize(sub(v_ap, v_lt))
    nl = perp(ul)
    origin = lerp(v_lt, v_ap, 0.20)
    if dot(nl, sub(shared, origin)) > 0:
        nl = mul(nl, -1)
    origin_edge = add(origin, mul(nl, stem / 2 + 0.4))
    horn = []
    for ang, length in ((-36.0, 74.0), (-12.0, 70.0), (14.0, 74.0)):
        rad = math.radians(180 + ang)
        end = (origin_edge[0] + math.cos(rad) * length, origin_edge[1] + math.sin(rad) * length)
        horn.append((end, origin_edge))

    # Nested emission chevrons to the right of A, same angle, gold bar runs through them
    ratio = 0.72  # depth / half_h
    chevrons = []
    tip_x = a_outer[0] + 38
    for half_h, step in ((52.0, 0.0), (68.0, 16.0), (84.0, 32.0)):
        tx = tip_x + step
        depth = half_h * ratio
        chevrons.append([
            (tx - depth, bar_y - half_h),
            (tx, bar_y),
            (tx - depth, bar_y + half_h),
        ])

    def sh(p):
        return (p[0] + ox, p[1] + oy)

    v_pts = [sh(p) for p in v_pts]
    a_right = [sh(p) for p in a_right]
    bar_pts = [sh(p) for p in bar_pts]
    horn = [(sh(a), sh(b)) for a, b in horn]
    chevrons = [[sh(p) for p in tri] for tri in chevrons]
    origin_s = sh(origin_edge)

    horn_sw = 2.2
    chev_sw = (2.35, 1.9, 1.5)

    horn_paths = "\n".join(
        f'    <path d="{d_line(a, b)}" stroke="{gold}" stroke-width="{horn_sw}" stroke-linecap="butt" stroke-linejoin="miter"/>'
        for a, b in horn
    )
    chev_paths = "\n".join(
        f'    <path d="{d_polyline(tri)}" stroke="{gold}" stroke-width="{chev_sw[i]}" stroke-linecap="butt" stroke-linejoin="miter" fill="none"/>'
        for i, tri in enumerate(chevrons)
    )

    body = f'''  <g id="mark">
    <g id="horn">
{horn_paths}
    </g>
    <path id="letter-v" d="{d_poly(v_pts)}" fill="{ink}"/>
    <path id="letter-a-stem" d="{d_poly(a_right)}" fill="{ink}"/>
    <path id="frequency-bar" d="{d_poly(bar_pts)}" fill="{gold}"/>
    <g id="emission">
{chev_paths}
    </g>
  </g>'''

    pts = v_pts + a_right + bar_pts + [origin_s]
    for a, b in horn:
        pts.extend([a, b])
    for tri in chevrons:
        pts.extend(tri)
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    pad = 2.0
    bbox = (min(xs) - pad, min(ys) - pad, max(xs) + pad, max(ys) + pad)
    return body, bbox


def assemble(ink, gold, muted, label="VELORA Acoustics"):
    pad = 28
    mark, (mx0, my0, mx1, my1) = va_mark(ink, gold, 0, 0)

    bold = load_weight(700)
    medium = load_weight(500)

    name_size = 30
    desc_size = 26
    name_paths, (nx0, ny0, nx1, ny1), _ = glyph_paths_and_bounds(
        bold, "VELORA", name_size, 0.22, 0, 0
    )
    desc_paths, (dx0, dy0, dx1, dy1), _ = glyph_paths_and_bounds(
        medium, "Acoustics", desc_size, 0.06, 0, 0
    )

    gap_words = 16
    name_w = nx1 - nx0
    desc_w = dx1 - dx0
    line_w = name_w + gap_words + desc_w
    mark_cx = (mx0 + mx1) / 2

    caption_gap = 30
    name_origin_x = mark_cx - line_w / 2 - nx0
    name_baseline = my1 + caption_gap - ny0
    desc_origin_x = name_origin_x + (nx1 - nx0) + gap_words - dx0
    desc_baseline = my1 + caption_gap - dy0 + ((ny1 + ny0) - (dy1 + dy0)) / 2

    name_paths, (nx0, ny0, nx1, ny1), _ = glyph_paths_and_bounds(
        bold, "VELORA", name_size, 0.22, name_origin_x, name_baseline
    )
    desc_paths, (dx0, dy0, dx1, dy1), _ = glyph_paths_and_bounds(
        medium, "Acoustics", desc_size, 0.06, desc_origin_x, desc_baseline
    )

    min_x = min(mx0, nx0, dx0) - pad
    min_y = min(my0, ny0, dy0) - pad
    max_x = max(mx1, nx1, dx1) + pad
    max_y = max(my1, ny1, dy1) + pad
    sx, sy = -min_x, -min_y
    vw, vh = max_x + sx, max_y + sy

    mark, _ = va_mark(ink, gold, sx, sy)
    name_paths, _, _ = glyph_paths_and_bounds(
        bold, "VELORA", name_size, 0.22, name_origin_x + sx, name_baseline + sy
    )
    desc_paths, _, _ = glyph_paths_and_bounds(
        medium, "Acoustics", desc_size, 0.06, desc_origin_x + sx, desc_baseline + sy
    )

    name_el = "\n".join(f'    <path d="{d}" fill="{ink}"/>' for d in name_paths)
    desc_el = "\n".join(f'    <path d="{d}" fill="{muted}"/>' for d in desc_paths)
    body = f'''{mark}
  <g id="caption">
{name_el}
{desc_el}
  </g>'''
    return wrap_svg(vw, vh, body, label)


def assemble_mark_only(ink, gold):
    pad = 20
    _, (x0, y0, x1, y1) = va_mark(ink, gold, 0, 0)
    mark, (x0, y0, x1, y1) = va_mark(ink, gold, pad - x0, pad - y0)
    return wrap_svg(x1 + pad, y1 + pad, mark, "VELORA")


(OUT / "velora-lockup.svg").write_text(assemble(INK, GOLD, MUTED), encoding="utf-8")
(OUT / "velora-lockup-inverse.svg").write_text(
    assemble(PAPER, GOLD, "#C9C2B8"), encoding="utf-8"
)
(OUT / "velora-mark.svg").write_text(assemble_mark_only(INK, GOLD), encoding="utf-8")
(OUT / "velora-mark-inverse.svg").write_text(assemble_mark_only(PAPER, GOLD), encoding="utf-8")

print("wrote", [p.name for p in OUT.glob("velora-*.svg")])
