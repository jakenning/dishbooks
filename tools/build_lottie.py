#!/usr/bin/env python3
"""Build the DishBooks integration-hub Lottie animation.

Renders `public/animations/dishbooks-sync.json` -- a seamless six-second
loop in which each data source (POS, Bank, Payroll, Vendors) fires a pulse
down its dotted line into the DishBooks mark, which absorbs it, ripples,
and broadcasts the confirmation back out through its three arcs.

Everything is vector: the mark comes from the real `LogoIcon` paths in
components/Logo.tsx, and the labels are Albert Sans outlined to curves so
the file has no font dependency once published.

    python3 tools/build_lottie.py

Geometry lives in `Layout`, copy in `CHANNELS`, timing in `Timing` -- edit
those and re-run rather than hand-patching the JSON.
"""

import hashlib
import json
import math
import os
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from svg_path import parse_path, bbox, transform_contours  # noqa: E402
from text_outline import FontOutliner  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "animations")
FONT_DIR = os.path.join(ROOT, "tools", "fonts")


# Albert Sans, pinned by URL and content hash. The .ttf files are build-time
# input only -- the published Lottie holds outlined curves, not font data --
# so they are fetched on demand and kept out of the repo.
FONTS = {
    "AlbertSans-400.ttf": (
        "https://fonts.gstatic.com/s/albertsans/v4/"
        "i7dZIFdwYjGaAMFtZd_QA3xXSKZqhr-TenSHq5P_rA.ttf",
        "238931f0a6937052581190e4e051a6da837e99d30d42d69a7e6a105ec4da2e49",
    ),
    "AlbertSans-600.ttf": (
        "https://fonts.gstatic.com/s/albertsans/v4/"
        "i7dZIFdwYjGaAMFtZd_QA3xXSKZqhr-TenSHdZT_rA.ttf",
        "0b2f3cce0c8d1f2b06ca8066bd669ba39f7aacf64ba8277d82efa366c53c7d91",
    ),
}


def ensure_fonts():
    """Download the build fonts if absent, and verify what we have."""
    os.makedirs(FONT_DIR, exist_ok=True)
    for name, (url, digest) in FONTS.items():
        dest = os.path.join(FONT_DIR, name)
        if not os.path.exists(dest):
            print(f"fetching {name}")
            with urllib.request.urlopen(url, timeout=60) as resp:
                blob = resp.read()
            if hashlib.sha256(blob).hexdigest() != digest:
                raise SystemExit(f"{name}: hash mismatch, refusing to use it")
            with open(dest, "wb") as fh:
                fh.write(blob)
        else:
            with open(dest, "rb") as fh:
                if hashlib.sha256(fh.read()).hexdigest() != digest:
                    raise SystemExit(
                        f"{name}: on-disk copy does not match the pinned hash; "
                        f"delete it and re-run to refetch")


# --------------------------------------------------------------------------
# Palette -- lifted verbatim from app/globals.css
# --------------------------------------------------------------------------

def hexc(h):
    h = h.lstrip("#")
    return [int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]


INK = hexc("#0b0b0d")       # --color-ink
CYAN = hexc("#2fb2ff")       # --color-accent-cyan
BLUE = hexc("#326cff")       # --color-primary-500
VIOLET = hexc("#5542ff")     # --color-accent-violet
WHITE = hexc("#ffffff")      # --color-surface-4


# --------------------------------------------------------------------------
# Layout
# --------------------------------------------------------------------------

class Layout:
    W, H = 1188, 800
    CX, CY = 594.0, 400.0

    R_HUB = 123.0            # white disc radius
    R_LINE_IN = 129.0        # dotted line starts just clear of the disc
    R_LINE_OUT = 286.0
    R_DOT_START = 292.0      # pulse spawns at the label end
    R_DOT_END = 123.0        # ...and is absorbed at the disc edge

    R_GLOW = 288.0           # radius of the soft halo behind the disc
    LOGO_WIDTH = 148.0

    TITLE_SIZE = 30.0
    SUB_SIZE = 24.0

    DOT_CORE = 12.5
    DOT_HALO = 42.0
    TRAIL_LEN = 66.0
    TRAIL_W = 7.0

    SIDE_LABEL_X = 154.0   # centre of the left label; the right one mirrors it


class CompactLayout(Layout):
    """Narrow-column build. The desktop canvas is wide because the side
    labels are long, and at a phone width that pushes the type down to ~8px.
    This variant pulls the canvas in and scales the type up against it, so
    the labels stay legible when the graphic is only ~340px wide."""

    # Sized so that in a ~342px phone column the labels land at 12.3px /
    # 10.2px -- the same type sizes the original HTML hub already used there.
    # SIDE_LABEL_X clears half of "US Foods, Sysco…" (the widest sub) plus a
    # margin; everything inboard of that is spoke.
    W, H = 1000, 800
    CX, CY = 500.0, 400.0

    R_HUB = 104.0
    R_LINE_IN = 110.0
    R_LINE_OUT = 227.0
    R_DOT_START = 233.0
    R_DOT_END = 104.0

    R_GLOW = 243.0
    LOGO_WIDTH = 125.0

    TITLE_SIZE = 36.0
    SUB_SIZE = 30.0

    DOT_CORE = 11.0
    DOT_HALO = 36.0
    TRAIL_LEN = 56.0
    TRAIL_W = 6.0

    SIDE_LABEL_X = 136.0


class Timing:
    FPS = 30
    DUR = 180                # 6s, seamless
    TRAVEL = 52              # frames for a pulse to cross its line
    STEP = 45                # one landing every 1.5s -> a clockwise sweep


# Firing order sweeps clockwise from the top, and the pulse colours walk the
# brand gradient (cyan -> blue -> violet) as the sweep goes round. Label
# anchors are derived from the layout so both variants stay in step.
def make_channels(L):
    left = L.SIDE_LABEL_X
    right = L.W - L.SIDE_LABEL_X
    return [
        dict(key="pos", label="POS", sub="Toast & more",
             ux=0.0, uy=-1.0, title=(L.CX, 54.0), sub_pos=(L.CX, 90.0),
             land=45, color=CYAN),
        dict(key="bank", label="Bank", sub="Every Account",
             ux=1.0, uy=0.0, title=(right, 399.0), sub_pos=(right, 435.0),
             land=90, color=BLUE),
        dict(key="payroll", label="Payroll", sub="Synced weekly",
             ux=0.0, uy=1.0, title=(L.CX, 744.0), sub_pos=(L.CX, 780.0),
             land=135, color=VIOLET),
        dict(key="vendors", label="Vendors", sub="US Foods, Sysco…",
             ux=-1.0, uy=0.0, title=(left, 399.0), sub_pos=(left, 435.0),
             land=180, color=BLUE),
    ]


CHANNELS = make_channels(Layout)


def axis_point(ch, radius):
    return [Layout.CX + ch["ux"] * radius, Layout.CY + ch["uy"] * radius]


# --------------------------------------------------------------------------
# Lottie primitives
# --------------------------------------------------------------------------

def prop(value):
    return {"a": 0, "k": value}


def keys(frames, ease=None):
    """frames: list of (t, value[, ease]). Value may be scalar or list.

    Collapses to a static property when there is only one keyframe -- an
    animated property holding a lone keyframe is read inconsistently by
    renderers and can drop out altogether."""
    if len(frames) == 1:
        value = frames[0][1]
        return prop(list(value) if isinstance(value, (list, tuple)) else value)
    out = []
    for idx, entry in enumerate(frames):
        t, value = entry[0], entry[1]
        own = entry[2] if len(entry) > 2 else ease
        value = value if isinstance(value, (list, tuple)) else [value]
        kf = {"t": round(t, 4), "s": [round(v, 5) for v in value]}
        if idx < len(frames) - 1:
            (x1, y1), (x2, y2) = own if own else ((0.333, 0.0), (0.667, 1.0))
            n = len(value)
            kf["o"] = {"x": [x1] * n, "y": [y1] * n}
            kf["i"] = {"x": [x2] * n, "y": [y2] * n}
        out.append(kf)
    return {"a": 1, "k": out}


LINEAR = ((0.0, 0.0), (1.0, 1.0))
EASE_OUT = ((0.16, 1.0), (0.3, 1.0))      # decelerate hard -- ripples, pops
EASE_IN = ((0.30, 0.02), (0.60, 0.90))    # accelerate -- pulse pulled inward
EASE_BOTH = ((0.4, 0.0), (0.2, 1.0))


def gradient_k(color_stops, alpha_stops):
    flat = []
    for pos, c in color_stops:
        flat += [pos, c[0], c[1], c[2]]
    for pos, a in alpha_stops:
        flat += [pos, a]
    return {"p": len(color_stops), "k": prop(flat)}


def fill(color, opacity=100):
    return {"ty": "fl", "c": prop(list(color) + [1]), "o": prop(opacity),
            "r": 1, "bm": 0, "nm": "Fill", "hd": False}


def grad_fill(color_stops, alpha_stops, start, end, gtype=1, opacity=100,
              highlight=0.0):
    item = {"ty": "gf", "o": prop(opacity), "r": 1, "bm": 0, "t": gtype,
            "g": gradient_k(color_stops, alpha_stops),
            "s": prop(list(start)), "e": prop(list(end)),
            "h": prop(highlight), "a": prop(0),
            "nm": "Gradient Fill", "hd": False}
    return item


def stroke(color, width, opacity=100, cap=2, join=2, dash=None):
    item = {"ty": "st", "c": prop(list(color) + [1]), "o": prop(opacity),
            "w": prop(width) if not isinstance(width, dict) else width,
            "lc": cap, "lj": join, "ml": 4, "bm": 0,
            "nm": "Stroke", "hd": False}
    if dash:
        item["d"] = dash
    return item


def grad_stroke(color_stops, alpha_stops, start, end, width, opacity=100,
                cap=2):
    return {"ty": "gs", "o": prop(opacity), "w": prop(width), "lc": cap,
            "lj": 2, "ml": 4, "bm": 0, "t": 1,
            "g": gradient_k(color_stops, alpha_stops),
            "s": prop(list(start)), "e": prop(list(end)),
            "h": prop(0), "a": prop(0), "nm": "Gradient Stroke", "hd": False}


def path_item(contour, name="Path"):
    return {"ty": "sh", "ind": 0, "ix": 1, "ks": prop(contour.to_lottie()),
            "nm": name, "hd": False}


def raw_path_item(d, name="Path"):
    return {"ty": "sh", "ind": 0, "ix": 1, "ks": prop(d), "nm": name,
            "hd": False}


def ellipse(size, pos=(0, 0)):
    return {"ty": "el", "p": prop(list(pos)), "s": prop(list(size)), "d": 1,
            "nm": "Ellipse", "hd": False}


def shape_tr(anchor=(0, 0), pos=(0, 0), scale=(100, 100), rot=0, opacity=100):
    def wrap(v, fallback):
        return v if isinstance(v, dict) else prop(fallback(v))
    return {"ty": "tr",
            "p": wrap(pos, list), "a": wrap(anchor, list),
            "s": wrap(scale, list), "r": wrap(rot, lambda x: x),
            "o": wrap(opacity, lambda x: x),
            "sk": prop(0), "sa": prop(0), "nm": "Transform"}


def group(items, name="Group"):
    return {"ty": "gr", "it": items, "nm": name, "np": len(items),
            "cix": 2, "bm": 0, "ix": 1, "hd": False}


def layer_tr(anchor=(0, 0), pos=(0, 0), scale=(100, 100), rot=0, opacity=100):
    def wrap(v, fallback):
        return v if isinstance(v, dict) else prop(fallback(v))
    return {"o": wrap(opacity, lambda x: x), "r": wrap(rot, lambda x: x),
            "p": wrap(pos, list), "a": wrap(anchor, list),
            "s": wrap(scale, list)}


def shape_layer(name, shapes, transform, ip=0, op=None):
    return {"ddd": 0, "ind": 0, "ty": 4, "nm": name, "sr": 1,
            "ks": transform, "ao": 0, "shapes": shapes,
            "ip": ip, "op": Timing.DUR if op is None else op,
            "st": 0, "bm": 0}


def tile_windows(t, dur, total=Timing.DUR):
    """Every occurrence of an event at `t` (period `total`) whose window
    overlaps the comp. This is what makes the loop seam invisible: a pulse
    still in flight at frame 180 is also on screen at frame 0."""
    out = []
    for shift in (-total, 0, total):
        a = t + shift
        if a + dur > 0 and a < total:
            out.append(a)
    return out


# --------------------------------------------------------------------------
# The DishBooks mark -- paths copied verbatim from components/Logo.tsx
# --------------------------------------------------------------------------

LOGO_VIEWBOX = (68.0, 48.0)

LOGO_BOWL = ("M46.1898 24C46.1898 10.9724 34.4871 0.328591 19.9603 0H2.01486C0.901733 "
             "0 0 0.879463 0 1.9651V46.0349C0 47.1205 0.901733 48 2.01486 "
             "48H19.9603C34.4871 47.6714 46.1898 37.0341 46.1898 24Z")

LOGO_MID = ("M57.1058 23.9998C57.1058 12.773 48.4155 3.31151 36.7161 0.705339C35.8903 "
            "0.521715 35.4147 1.60413 36.1281 2.04547C43.8837 6.86158 48.9737 14.9056 "
            "48.9737 23.9966C48.9737 33.0876 43.8804 41.1316 36.1215 45.9478C35.4081 "
            "46.3923 35.8837 47.4715 36.7095 47.2879C48.4089 44.6882 57.1058 35.2331 "
            "57.1058 23.9998Z")

LOGO_OUTER = ("M47.4968 0.625154C46.6743 0.44153 46.1987 1.53039 46.9155 1.96851C54.7437 "
              "6.77818 59.8898 14.8641 59.8898 24.0002C59.8898 33.146 54.7437 41.2254 "
              "46.9122 46.0351C46.1921 46.4764 46.6743 47.5621 47.5067 47.3752C52.131 "
              "46.3411 56.2631 44.0829 59.51 40.9774C64.0484 36.6316 66.856 30.63 66.856 "
              "24.0099C66.8494 12.6316 58.5851 3.10247 47.4968 0.625154Z")

# Bowl gradient, matching the `dishbooks-icon-a` linearGradient (userSpaceOnUse).
# The 0.1 stop is duplicated at 0 to reproduce SVG's pad behaviour.
BOWL_GRAD_STOPS = [(0.0, CYAN), (0.1, CYAN), (1.0, BLUE)]
BOWL_GRAD_S = (0.0, 23.9726)
BOWL_GRAD_E = (85.2181, 23.9726)

# How far each arc leans outward at the peak of a broadcast pulse, and how
# much it swells -- the mark answers every absorbed pulse with a ripple that
# travels out through its own arcs.
LOGO_PARTS = [
    dict(name="Mark / Bowl", d=LOGO_BOWL, grad=True, color=None,
         stagger=0, swell=0.022, push=0.0),
    dict(name="Mark / Arc 1", d=LOGO_MID, grad=False, color=BLUE,
         stagger=4, swell=0.038, push=2.2),
    dict(name="Mark / Arc 2", d=LOGO_OUTER, grad=False, color=VIOLET,
         stagger=8, swell=0.055, push=4.4),
]


DesktopLayout = Layout


def landing_times():
    """Landing instants, tiled one step either side so pulses that straddle
    the loop seam interpolate correctly at frames 0 and 180."""
    n = Timing.DUR // Timing.STEP
    return [Timing.STEP * i for i in range(-1, n + 2)]


# --------------------------------------------------------------------------
# Layer builders
# --------------------------------------------------------------------------

def build_glow():
    """Soft brand-gradient halo. Breathes across the loop and brightens each
    time the hub swallows a pulse."""
    r = Layout.R_GLOW
    disc_frac = Layout.R_HUB / r
    shapes = [group([
        ellipse((r * 2, r * 2)),
        grad_fill(
            color_stops=[(0.0, CYAN), (0.45, BLUE), (1.0, VIOLET)],
            alpha_stops=[(0.0, 0.30), (disc_frac, 0.26), (0.70, 0.07), (1.0, 0.0)],
            start=(0, 0), end=(r, 0), gtype=2),
        shape_tr(),
    ], "Halo")]

    flash = [(0, 68.0)]
    for L in landing_times():
        flash += [(L + 1, 68.0), (L + 7, 90.0, EASE_OUT), (L + 26, 68.0)]
    flash = [f for f in sorted(flash, key=lambda k: k[0])
             if -Timing.STEP - 8 <= f[0] <= Timing.DUR + Timing.STEP + 8]

    tr = layer_tr(
        pos=(Layout.CX, Layout.CY),
        opacity=keys(flash),
        scale=keys([(0, [100, 100]), (Timing.DUR / 2, [104, 104], EASE_BOTH),
                    (Timing.DUR, [100, 100])], EASE_BOTH),
    )
    return [shape_layer("Halo", shapes, tr)]


def build_lines():
    """Dotted spokes. The dash pattern drifts slowly toward the hub, so the
    lines read as live feeds even between pulses."""
    period = 3 + 11
    layers = []
    for ch in CHANNELS:
        inner = axis_point(ch, Layout.R_LINE_IN)
        outer = axis_point(ch, Layout.R_LINE_OUT)
        # Path starts hub-side: a rising dash offset walks the pattern back
        # toward the path start, i.e. inward.
        path = {"i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]],
                "v": [inner, outer], "c": False}
        dash = [
            {"n": "d", "nm": "dash", "v": prop(3)},
            {"n": "g", "nm": "gap", "v": prop(11)},
            {"n": "o", "nm": "offset",
             "v": keys([(0, 0), (Timing.DUR, period * 5)], LINEAR)},
        ]
        shapes = [group([
            raw_path_item(path, "Spoke"),
            stroke(BLUE, 2.5, opacity=55, cap=2, dash=dash),
            shape_tr(),
        ], "Spoke")]
        layers.append(shape_layer(f"Spoke / {ch['label']}", shapes, layer_tr()))
    return layers


def build_ripples():
    """Expanding ring released from the disc edge on every landing."""
    dur = 40
    layers = []
    for L in landing_times():
        if L + dur <= 0 or L >= Timing.DUR:
            continue
        shapes = [group([
            ellipse((Layout.R_HUB * 2, Layout.R_HUB * 2)),
            stroke(BLUE, keys([(L, 3.4), (L + dur, 0.8)], EASE_OUT),
                   opacity=100),
            shape_tr(),
        ], "Ring")]
        tr = layer_tr(
            pos=(Layout.CX, Layout.CY),
            scale=keys([(L, [100, 100]), (L + dur, [158, 158])], EASE_OUT),
            opacity=keys([(L, 0), (L + 5, 20, EASE_OUT), (L + dur, 0)]),
        )
        layers.append(shape_layer("Ripple", shapes, tr, ip=L, op=L + dur))
    return layers


def build_hub_disc():
    shapes = [group([
        ellipse((Layout.R_HUB * 2, Layout.R_HUB * 2)),
        fill(WHITE),
        shape_tr(),
    ], "Disc")]
    tr = layer_tr(
        pos=(Layout.CX, Layout.CY),
        scale=keys([(0, [100, 100]), (Timing.DUR / 2, [101.4, 101.4], EASE_BOTH),
                    (Timing.DUR, [100, 100])], EASE_BOTH),
    )
    return [shape_layer("Hub disc", shapes, tr)]


def build_logo():
    """One layer per arc so each can lag the one before it."""
    parsed = [parse_path(p["d"]) for p in LOGO_PARTS]
    all_pts = [c for cs in parsed for c in cs]
    x0, y0, x1, y1 = bbox(all_pts)
    scale = Layout.LOGO_WIDTH / (x1 - x0)
    cx_local, cy_local = (x0 + x1) / 2.0, (y0 + y1) / 2.0

    layers = []
    for part, contours in zip(LOGO_PARTS, parsed):
        px0, py0, px1, py1 = bbox(contours)
        anchor = [(px0 + px1) / 2.0, (py0 + py1) / 2.0]
        home = [Layout.CX + (anchor[0] - cx_local) * scale,
                Layout.CY + (anchor[1] - cy_local) * scale]

        if part["grad"]:
            paint = grad_fill(BOWL_GRAD_STOPS, [(0.0, 1.0), (1.0, 1.0)],
                              BOWL_GRAD_S, BOWL_GRAD_E, gtype=1)
        else:
            paint = fill(part["color"])

        shapes = [group([raw_path_item(c.to_lottie(), "Path") for c in contours]
                        + [paint, shape_tr()], part["name"])]

        base = scale * 100.0
        s_keys, p_keys = [(0, [base, base])], [(0, list(home))]
        for L in landing_times():
            t = L + part["stagger"]
            peak = base * (1.0 + part["swell"])
            s_keys += [(t - 2, [base, base]), (t + 7, [peak, peak], EASE_OUT),
                       (t + 24, [base, base])]
            if part["push"]:
                out = [home[0] + part["push"], home[1]]
                p_keys += [(t - 2, list(home)), (t + 7, out, EASE_OUT),
                           (t + 24, list(home))]

        def clip(seq):
            seq = sorted(seq, key=lambda k: k[0])
            lo, hi = -Timing.STEP - 8, Timing.DUR + Timing.STEP + 8
            return [k for k in seq if lo <= k[0] <= hi]

        tr = layer_tr(anchor=anchor, pos=keys(clip(p_keys)),
                      scale=keys(clip(s_keys)))
        layers.append(shape_layer(part["name"], shapes, tr))
    return layers


def build_dots():
    """The travelling pulses -- comet trail, halo, bright core."""
    layers = []
    for ch in CHANNELS:
        emit = ch["land"] - Timing.TRAVEL
        # Travel is inward, so the heading is the reverse of the axis vector.
        angle = math.degrees(math.atan2(-ch["uy"], -ch["ux"]))
        start = axis_point(ch, Layout.R_DOT_START)
        end = axis_point(ch, Layout.R_DOT_END)
        color = ch["color"]

        trail_path = {"i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]],
                      "v": [[-Layout.TRAIL_LEN, 0], [0, 0]], "c": False}

        for E in tile_windows(emit, Timing.TRAVEL):
            end_t = E + Timing.TRAVEL
            shapes = [group([
                ellipse((Layout.DOT_CORE, Layout.DOT_CORE)),
                fill(color),
                shape_tr(),
            ], "Core"), group([
                ellipse((Layout.DOT_HALO, Layout.DOT_HALO)),
                grad_fill([(0.0, color), (1.0, color)],
                          [(0.0, 0.45), (0.55, 0.20), (1.0, 0.0)],
                          (0, 0), (Layout.DOT_HALO / 2, 0), gtype=2),
                shape_tr(),
            ], "Halo"), group([
                raw_path_item(trail_path, "Trail"),
                grad_stroke([(0.0, color), (1.0, color)],
                            [(0.0, 0.0), (0.40, 0.34), (1.0, 0.85)],
                            (-Layout.TRAIL_LEN, 0), (0, 0), Layout.TRAIL_W),
                shape_tr(),
            ], "Trail")]

            tr = layer_tr(
                rot=angle,
                pos=keys([(E, start), (end_t, end)], EASE_IN),
                scale=keys([(E, [0, 0]), (E + 9, [100, 100], EASE_OUT),
                            (end_t - 4, [100, 100]), (end_t, [38, 38])]),
                opacity=keys([(E, 0), (E + 6, 100, EASE_OUT),
                              (end_t - 4, 100), (end_t, 0)]),
            )
            layers.append(shape_layer(f"Pulse / {ch['label']}", shapes, tr,
                                      ip=E, op=end_t))
    return layers


def build_labels(title_font, sub_font):
    """Outlined Albert Sans. Each label pops the instant it emits its pulse."""
    layers = []
    for ch in CHANNELS:
        emit = ch["land"] - Timing.TRAVEL
        specs = [
            ("title", ch["label"], title_font, Layout.TITLE_SIZE, ch["title"],
             INK, 100, title_font.cap_height),
            ("sub", ch["sub"], sub_font, Layout.SUB_SIZE, ch["sub_pos"],
             INK, 40, sub_font.x_height),
        ]
        for kind, text, font, size, (x, baseline), color, opacity, metric in specs:
            contours, _ = font.outline(text, size, x, baseline, align="center")
            centre = [x, baseline - metric / 1000.0 * size / 2.0]

            shapes = [group(
                [raw_path_item(c.to_lottie(), "Glyph") for c in contours]
                + [fill(color, opacity), shape_tr()],
                f"{ch['label']} {kind}")]

            bump = [(0, [100, 100])]
            for shift in (-Timing.DUR, 0, Timing.DUR):
                t = emit + shift
                if t + 30 < -Timing.STEP or t - 4 > Timing.DUR + Timing.STEP:
                    continue
                amp = 104.5 if kind == "title" else 103.0
                bump += [(t - 3, [100, 100]), (t + 7, [amp, amp], EASE_OUT),
                         (t + 27, [100, 100])]
            bump = sorted(bump, key=lambda k: k[0])

            tr = layer_tr(anchor=centre, pos=centre, scale=keys(bump))
            layers.append(shape_layer(f"Label / {ch['label']} {kind}",
                                      shapes, tr))
    return layers


# --------------------------------------------------------------------------
# Assembly
# --------------------------------------------------------------------------

def build(layout=Layout):
    global Layout, CHANNELS  # noqa: PLW0603 -- layer builders read these
    ensure_fonts()
    Layout = layout
    CHANNELS = make_channels(layout)
    title_font = FontOutliner(os.path.join(FONT_DIR, "AlbertSans-600.ttf"))
    sub_font = FontOutliner(os.path.join(FONT_DIR, "AlbertSans-400.ttf"))

    # Front to back.
    layers = (build_labels(title_font, sub_font)
              + build_dots()
              + build_logo()
              + build_hub_disc()
              + build_ripples()
              + build_lines()
              + build_glow())

    for i, layer in enumerate(layers):
        layer["ind"] = i + 1

    return {
        "v": "5.7.4",
        "fr": Timing.FPS,
        "ip": 0,
        "op": Timing.DUR,
        "w": Layout.W,
        "h": Layout.H,
        "nm": "DishBooks \u2014 integration sync",
        "ddd": 0,
        "assets": [],
        "layers": layers,
        "markers": [],
    }


def compact(node):
    """Round every float in the document. Outlined glyphs carry thousands of
    vertices and full float repr roughly doubles the published file.

    Coordinates get 2 decimals -- far below a pixel at this canvas size.
    Sub-unit values (channel colours, gradient stops, easing handles) get 5,
    because rounding a colour component to 2 places shifts it by a whole
    8-bit step."""
    if isinstance(node, float):
        r = round(node, 2 if abs(node) >= 1.0 else 5)
        return int(r) if r == int(r) else r
    if isinstance(node, dict):
        return {k: compact(v) for k, v in node.items()}
    if isinstance(node, list):
        return [compact(v) for v in node]
    return node


VARIANTS = [
    ("dishbooks-sync.json", DesktopLayout),
    ("dishbooks-sync-compact.json", CompactLayout),
]


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, layout in VARIANTS:
        data = compact(build(layout))
        path = os.path.join(OUT_DIR, name)
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(data, fh, separators=(",", ":"), ensure_ascii=False)
        size = os.path.getsize(path)
        print(f"wrote {os.path.relpath(path, ROOT)}  "
              f"{data['w']}x{data['h']}  {len(data['layers'])} layers  "
              f"{size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
