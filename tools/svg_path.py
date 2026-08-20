"""Minimal SVG path -> cubic bezier contour parser.

Produces contours in the shape Lottie wants: vertex list plus per-vertex
in/out tangents expressed relative to their vertex. Every segment type is
normalised to a cubic, so consumers only ever see cubics.
"""

import re

_NUM = re.compile(r"[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?")
_CMDS = "MmLlHhVvCcSsQqTtAaZz"
_EPS = 1e-6


def _tokenize(d):
    tokens, i, n = [], 0, len(d)
    while i < n:
        c = d[i]
        if c in _CMDS:
            tokens.append(c)
            i += 1
        elif c in " ,\t\r\n":
            i += 1
        else:
            m = _NUM.match(d, i)
            if not m:
                raise ValueError(f"unexpected {c!r} at offset {i}")
            tokens.append(float(m.group()))
            i = m.end()
    return tokens


class Contour:
    """One closed/open subpath, accumulated as cubics."""

    def __init__(self, x, y):
        self.v = [[x, y]]
        self.i = [[0.0, 0.0]]
        self.o = [[0.0, 0.0]]
        self.closed = False

    def curve_to(self, c1, c2, p):
        last = self.v[-1]
        self.o[-1] = [c1[0] - last[0], c1[1] - last[1]]
        self.v.append([p[0], p[1]])
        self.i.append([c2[0] - p[0], c2[1] - p[1]])
        self.o.append([0.0, 0.0])

    def line_to(self, p):
        self.v.append([p[0], p[1]])
        self.i.append([0.0, 0.0])
        self.o.append([0.0, 0.0])

    def close(self):
        # A trailing vertex coincident with the start is redundant once the
        # contour is flagged closed -- fold its in-tangent onto the start
        # point so the joining curve survives the merge.
        if len(self.v) > 1:
            fx, fy = self.v[0]
            lx, ly = self.v[-1]
            if abs(fx - lx) < _EPS and abs(fy - ly) < _EPS:
                self.i[0] = self.i[-1]
                self.v.pop()
                self.i.pop()
                self.o.pop()
        self.closed = True

    def to_lottie(self):
        return {"i": self.i, "o": self.o, "v": self.v, "c": self.closed}


def parse_path(d):
    """Parse an SVG path `d` string into a list of Contour objects."""
    tokens = _tokenize(d)
    contours = []
    cur = None
    pos = (0.0, 0.0)
    start = (0.0, 0.0)
    prev_cubic_c2 = None   # for S/s
    prev_quad_c = None     # for T/t
    cmd = None
    idx = 0

    def need(k):
        nonlocal idx
        if idx + k > len(tokens):
            raise ValueError(f"'{cmd}' wants {k} numbers, ran out")
        vals = tokens[idx:idx + k]
        for val in vals:
            if isinstance(val, str):
                raise ValueError(f"'{cmd}' wants numbers, got {val!r}")
        idx += k
        return vals

    def quad_to_cubic(p0, q, p1):
        c1 = (p0[0] + 2.0 / 3.0 * (q[0] - p0[0]), p0[1] + 2.0 / 3.0 * (q[1] - p0[1]))
        c2 = (p1[0] + 2.0 / 3.0 * (q[0] - p1[0]), p1[1] + 2.0 / 3.0 * (q[1] - p1[1]))
        return c1, c2

    while idx < len(tokens):
        tok = tokens[idx]
        if isinstance(tok, str):
            cmd = tok
            idx += 1
            if cmd in "Zz":
                if cur is not None:
                    cur.close()
                    contours.append(cur)
                    cur = None
                pos = start
                prev_cubic_c2 = prev_quad_c = None
                continue
        elif cmd is None:
            raise ValueError("path data starts without a command")
        elif cmd in "Mm":
            # Repeated coordinate pairs after a moveto are implicit linetos.
            cmd = "L" if cmd == "M" else "l"

        rel = cmd.islower()
        up = cmd.upper()

        if up == "M":
            x, y = need(2)
            if rel:
                x, y = pos[0] + x, pos[1] + y
            if cur is not None:
                contours.append(cur)
            cur = Contour(x, y)
            pos = start = (x, y)
            prev_cubic_c2 = prev_quad_c = None
            continue

        if cur is None:
            raise ValueError(f"'{cmd}' before any moveto")

        if up == "L":
            x, y = need(2)
            if rel:
                x, y = pos[0] + x, pos[1] + y
            cur.line_to((x, y))
            pos = (x, y)
            prev_cubic_c2 = prev_quad_c = None
        elif up == "H":
            (x,) = need(1)
            x = pos[0] + x if rel else x
            cur.line_to((x, pos[1]))
            pos = (x, pos[1])
            prev_cubic_c2 = prev_quad_c = None
        elif up == "V":
            (y,) = need(1)
            y = pos[1] + y if rel else y
            cur.line_to((pos[0], y))
            pos = (pos[0], y)
            prev_cubic_c2 = prev_quad_c = None
        elif up == "C":
            x1, y1, x2, y2, x, y = need(6)
            if rel:
                x1, y1 = pos[0] + x1, pos[1] + y1
                x2, y2 = pos[0] + x2, pos[1] + y2
                x, y = pos[0] + x, pos[1] + y
            cur.curve_to((x1, y1), (x2, y2), (x, y))
            pos, prev_cubic_c2, prev_quad_c = (x, y), (x2, y2), None
        elif up == "S":
            x2, y2, x, y = need(4)
            if rel:
                x2, y2 = pos[0] + x2, pos[1] + y2
                x, y = pos[0] + x, pos[1] + y
            if prev_cubic_c2 is None:
                x1, y1 = pos
            else:
                x1 = 2 * pos[0] - prev_cubic_c2[0]
                y1 = 2 * pos[1] - prev_cubic_c2[1]
            cur.curve_to((x1, y1), (x2, y2), (x, y))
            pos, prev_cubic_c2, prev_quad_c = (x, y), (x2, y2), None
        elif up == "Q":
            qx, qy, x, y = need(4)
            if rel:
                qx, qy = pos[0] + qx, pos[1] + qy
                x, y = pos[0] + x, pos[1] + y
            c1, c2 = quad_to_cubic(pos, (qx, qy), (x, y))
            cur.curve_to(c1, c2, (x, y))
            pos, prev_quad_c, prev_cubic_c2 = (x, y), (qx, qy), None
        elif up == "T":
            x, y = need(2)
            if rel:
                x, y = pos[0] + x, pos[1] + y
            if prev_quad_c is None:
                qx, qy = pos
            else:
                qx = 2 * pos[0] - prev_quad_c[0]
                qy = 2 * pos[1] - prev_quad_c[1]
            c1, c2 = quad_to_cubic(pos, (qx, qy), (x, y))
            cur.curve_to(c1, c2, (x, y))
            pos, prev_quad_c, prev_cubic_c2 = (x, y), (qx, qy), None
        elif up == "A":
            raise NotImplementedError(
                "elliptical arcs are not used by any DishBooks path; "
                "convert them to cubics upstream if that changes"
            )
        else:
            raise ValueError(f"unhandled command {cmd!r}")

    if cur is not None:
        contours.append(cur)
    return contours


def transform_contours(contours, sx=1.0, sy=1.0, tx=0.0, ty=0.0):
    """Scale then translate every vertex/tangent of a contour list."""
    out = []
    for c in contours:
        n = Contour(0, 0)
        n.v = [[x * sx + tx, y * sy + ty] for x, y in c.v]
        n.i = [[x * sx, y * sy] for x, y in c.i]
        n.o = [[x * sx, y * sy] for x, y in c.o]
        n.closed = c.closed
        out.append(n)
    return out


def bbox(contours):
    """Vertex-hull bounds. Ignores tangent overshoot, which is fine for the
    centring maths here (all our shapes have vertices at their extrema)."""
    xs, ys = [], []
    for c in contours:
        for x, y in c.v:
            xs.append(x)
            ys.append(y)
    return min(xs), min(ys), max(xs), max(ys)
