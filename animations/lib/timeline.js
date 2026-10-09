// Timeline helpers shared by every scene.
//
// Scenes are pure functions of time: `frame(t)` must put the DOM in exactly
// the state it should have at `t` seconds, with no memory of earlier frames.
// That is what lets the recorder seek to any frame and get the same pixels
// the live preview shows, and what lets the preview scrubber jump around.

export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, p) => a + (b - a) * p;

/** 0→1 progress of `t` through the window [start, start + dur]. */
export const seg = (t, start, dur) => (dur <= 0 ? (t >= start ? 1 : 0) : clamp((t - start) / dur));

/** 1 while `t` is inside [start, end), easing in and out over `fade` seconds. */
export const window_ = (t, start, end, fade = 0.3) =>
  Math.min(seg(t, start, fade), 1 - seg(t, end - fade, fade));

// Easings — the curves the DishBooks app itself uses are close to these.
export const ease = {
  linear: (p) => p,
  outCubic: (p) => 1 - (1 - p) ** 3,
  outQuart: (p) => 1 - (1 - p) ** 4,
  outExpo: (p) => (p >= 1 ? 1 : 1 - 2 ** (-10 * p)),
  inOutCubic: (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2),
  outBack: (p, s = 1.4) => 1 + (s + 1) * (p - 1) ** 3 + s * (p - 1) ** 2,
};

/** Standard "rise in": fade up and slide `dy` px into place. */
export function riseIn(el, t, start, { dur = 0.6, dy = 12, scale = 1 } = {}) {
  const p = ease.outCubic(seg(t, start, dur));
  el.style.opacity = p;
  const s = lerp(scale, 1, p);
  el.style.transform = `translateY(${lerp(dy, 0, p)}px)${s !== 1 ? ` scale(${s})` : ''}`;
  return p;
}

const money0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const money2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmt = {
  money: (v) => money0.format(Math.round(v)),
  money2: (v) => money2.format(v),
  /** $1.24M / $482K style, for chart axes and compact tiles. */
  moneyShort: (v) => {
    const a = Math.abs(v);
    if (a >= 1e6) return `$${(v / 1e6).toFixed(a >= 1e7 ? 1 : 2)}M`;
    if (a >= 1e3) return `$${Math.round(v / 1e3)}K`;
    return `$${Math.round(v)}`;
  },
  pct: (v, dp = 1) => `${v.toFixed(dp)}%`,
  int: (v) => Math.round(v).toLocaleString('en-US'),
};

/** Number that counts from 0 (or `from`) to `to` between start and start+dur. */
export const countUp = (t, start, dur, to, from = 0, curve = ease.outExpo) =>
  lerp(from, to, curve(seg(t, start, dur)));
