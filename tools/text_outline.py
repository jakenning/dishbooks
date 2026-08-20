"""Convert a run of text into Lottie-ready cubic contours.

The labels get outlined rather than shipped as Lottie text layers so the
published animation carries no font dependency at all -- it renders
identically whether or not Albert Sans has loaded on the host page.

Shaping goes through HarfBuzz so kerning pairs ("Ve", "Pa", "Ta") land
exactly where they do on the real site.
"""

import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import DecomposingRecordingPen

from svg_path import Contour, transform_contours


def _mid(a, b):
    return ((a[0] + b[0]) / 2.0, (a[1] + b[1]) / 2.0)


def _quad_to_cubic(p0, q, p1):
    c1 = (p0[0] + 2.0 / 3.0 * (q[0] - p0[0]), p0[1] + 2.0 / 3.0 * (q[1] - p0[1]))
    c2 = (p1[0] + 2.0 / 3.0 * (q[0] - p1[0]), p1[1] + 2.0 / 3.0 * (q[1] - p1[1]))
    return c1, c2


def _replay(recording):
    """Turn a RecordingPen trace (TrueType quadratics) into cubic Contours."""
    contours, cur, pos = [], None, (0.0, 0.0)

    for op, args in recording:
        if op == "moveTo":
            if cur is not None:
                contours.append(cur)
            pos = tuple(args[0])
            cur = Contour(pos[0], pos[1])
        elif op == "lineTo":
            pos = tuple(args[0])
            cur.line_to(pos)
        elif op == "curveTo":
            c1, c2, p = [tuple(a) for a in args]
            cur.curve_to(c1, c2, p)
            pos = p
        elif op == "qCurveTo":
            pts = [tuple(a) if a is not None else None for a in args]
            if pts[-1] is None:
                # All-off-curve contour: the true start is the midpoint of
                # the last and first control points.
                offs = pts[:-1]
                start = _mid(offs[-1], offs[0])
                if cur is not None:
                    contours.append(cur)
                cur = Contour(start[0], start[1])
                pos = start
                pts = offs + [start]
            offs, end = pts[:-1], pts[-1]
            for k, ctrl in enumerate(offs):
                seg_end = end if k == len(offs) - 1 else _mid(ctrl, offs[k + 1])
                c1, c2 = _quad_to_cubic(pos, ctrl, seg_end)
                cur.curve_to(c1, c2, seg_end)
                pos = seg_end
        elif op == "closePath":
            if cur is not None:
                cur.close()
                contours.append(cur)
                cur = None
        elif op == "endPath":
            if cur is not None:
                contours.append(cur)
                cur = None

    if cur is not None:
        contours.append(cur)
    return contours


class FontOutliner:
    def __init__(self, path):
        self.path = path
        self.tt = TTFont(path)
        self.upem = self.tt["head"].unitsPerEm
        self.glyph_order = self.tt.getGlyphOrder()
        self.glyph_set = self.tt.getGlyphSet()
        self._blob = hb.Blob.from_file_path(path)
        self._face = hb.Face(self._blob)
        self._hbfont = hb.Font(self._face)
        self._hbfont.scale = (self.upem, self.upem)
        self._cache = {}

    @property
    def cap_height(self):
        return getattr(self.tt["OS/2"], "sCapHeight", 0.7 * self.upem)

    @property
    def x_height(self):
        return getattr(self.tt["OS/2"], "sxHeight", 0.52 * self.upem)

    def _glyph_contours(self, gid):
        if gid not in self._cache:
            name = self.glyph_order[gid]
            pen = DecomposingRecordingPen(self.glyph_set)
            self.glyph_set[name].draw(pen)
            self._cache[gid] = _replay(pen.value)
        return self._cache[gid]

    def shape(self, text):
        """Return (glyph runs, advance width) in font units."""
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self._hbfont, buf, {"kern": True, "liga": True})

        runs, pen_x = [], 0.0
        for info, position in zip(buf.glyph_infos, buf.glyph_positions):
            runs.append((info.codepoint, pen_x + position.x_offset, position.y_offset))
            pen_x += position.x_advance
        return runs, pen_x

    def outline(self, text, size, x, baseline, align="center"):
        """Outline `text` at `size` px. `x` is the left edge, or the centre
        when align="center". Returns a flat list of Contours in Lottie space
        (y down), positioned against `baseline`."""
        runs, advance = self.shape(text)
        scale = size / self.upem
        width = advance * scale

        if align == "center":
            origin = x - width / 2.0
        elif align == "right":
            origin = x - width
        else:
            origin = x

        contours = []
        for gid, gx, gy in runs:
            glyph = self._glyph_contours(gid)
            if not glyph:
                continue  # space and friends
            contours.extend(
                transform_contours(
                    glyph,
                    sx=scale,
                    sy=-scale,
                    tx=origin + gx * scale,
                    ty=baseline - gy * scale,
                )
            )
        return contours, width
