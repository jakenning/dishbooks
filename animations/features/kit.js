// Feature-page animations: one app page, its feature in the spotlight.
//
// Each feature page (the Features CMS template on dishbooks.com) shows its
// animation where the hero image is: a 5:4 slot beside the headline. That slot
// is too small for the whole app to be readable, so these are filmed:
//
//   - the app window (1280 × 1024, the homepage window's components) opens on
//     the page the feature lives on, the whole window in view;
//   - one or two of the page's elements at a time step forward — they lift
//     with a blue ring while the rest of the window dims, a short label says
//     what they are, and the camera pushes in until they read at full size;
//   - the camera pulls back to the whole window, the page clears, and the
//     loop starts again. Each video starts on the loaded page.
//
// Phones get the app's phone layout (400 × 720) in a 4:5 frame: no zooming
// out, the camera pans down the page to whatever is lit, like scrolling.
//
// This file is the frame around a story: the window (title bar, sidebar, page
// header; on phones the app's top bar), the spotlight, label, camera and
// pointer. A story (features/<slug>.js) supplies the page and its own motion:
//
//   STORY = {
//     id, duration, startAt: { d, m }  loop length (s); where t = 0 falls (story time)
//     nav, title, crumb                sidebar item lit, page title, breadcrumb
//     rootClass                        optional extra classes on the app (e.g. ['hh'])
//     head(D, L)                       optional header controls (default: period + scope)
//     view(D, L, N, id)                the page's <section class="view …"> markup
//     extra(D, L, id)                  optional markup beside .main (e.g. Dex)
//     refs(q, qa, L, D)                element refs for frame()
//     frame(t, R, L, D, N)             pose the page at story time t (pure)
//     blocks(L)                        selectors of what dims while something else is lit
//     spots(L)                         [{ at, dur, sel: [selectors] | (R) => [els], label | (D) => label, zoom?, focus? }]
//                                      (focus: what the camera frames, when not everything lit)
//     taps(L)                          [{ at, el: (R) => element, fx, fy }] or
//                                      [{ at, pos: (R, at) => { x, y } }] for something hidden until then
//     app: { d, m }                    optional app size overrides, e.g. { m: { h: 980 } } for a long phone page
//   }
//
// render.mjs bundles a scene's modules into one scope, so names here stay clear
// of app.js's (and a story's of both).

import { seg, ease, lerp, clamp } from '../lib/timeline.js';
import { icon } from '../shared/icons.js';
import { NAV, MARK, CURSOR, COG, SUN, MENU, esc, model } from '../scenes/why-dishbooks/app.js';

/** Desktop: a 1280 × 1024 window filmed in a 1000 × 800 frame (5:4, the hero image slot). */
export const DESKTOP = {
  meta: { width: 1000, height: 800, fps: 30, posterTime: 0, scale: 2 },
  app: { w: 1280, h: 1024 },
  cam: { pad: 28, maxZoom: 1.45 },
  compact: false,
  sales: { W: 612, H: 520 },
  donut: 220,
  txRows: 8,
  cashChart: { W: 288, H: 300, x0: 46, every: 3 },
  tl: { w: 982, x0: 170, x1: 982, fy: 6, oy: 74, bh: 32, lbl: 17, qy: 27, H: 158, five: 14 },
  ch: { w: 982, h: 470, x0: 52, x1: 976, y0: 14, y1: 444 },
  dexRoom: 332,
  rest: { x: 1180, y: 990 }, // where the pointer comes from and goes back to
};
/** Phone: the app's phone layout (400 × 720) in a 400 × 500 frame (4:5). */
export const PHONE = {
  meta: { width: 400, height: 500, fps: 30, posterTime: 0, scale: 2.5 },
  app: { w: 400, h: 720 },
  cam: { pad: 12, maxZoom: 1.12, minZoom: 1 },
  compact: true,
  touch: true,
  sales: { W: 352, H: 168, x0: 44, every: 3 },
  donut: 112,
  txRows: 5,
  tl: { w: 350, x0: 0, x1: 350, fy: 18, oy: 86, bh: 24, lbl: 14, qy: 22, H: 156, five: 12, stacked: true },
  ch: { w: 350, h: 150, x0: 40, x1: 350, y0: 10, y1: 126 },
};

const FADE = 0.35; // spotlight in/out (s)
const DIM = 0.7; // how far everything else fades while a spot is lit
const MOVE = 0.75; // camera move between shots (s)

export function makeFeature(L0, S) {
  const L = { ...L0, meta: { ...L0.meta, duration: S.duration } };
  L.app = { ...L0.app, ...(L.compact ? S.app?.m : S.app?.d) }; // a long page can make the app taller
  const startAt = (L.compact ? S.startAt?.m : S.startAt?.d) ?? S.startAt?.d ?? 0;
  const spots = S.spots(L);
  const taps = S.taps ? S.taps(L) : [];
  const { w: AW, h: AH } = L.app;
  const { width: W, height: H } = L.meta;
  let R;
  let app;
  let D;
  let N;

  function build(el, data) {
    D = data;
    N = model(data);
    el.classList.add('db-anim', 'ftstage');
    window.__ftN = (window.__ftN ?? 0) + 1;
    const id = `ft${window.__ftN}`;
    const u = data.user;
    const head = S.head ? S.head(data, L) : `<span class="pill">${icon('calendar')}${esc(data.period)}${icon('caret-down', 'car')}</span><span class="chip">${icon('map-pin')}${esc(data.company.scopeLabel)}</span>`;

    el.innerHTML = `<div class="cam wdb ft ft-${S.id}${L.compact ? ' m' : ''} ${(S.rootClass ?? []).join(' ')}" style="width:${AW}px;height:${AH}px">
    ${L.compact ? `<div class="mbar"><span class="menu">${MENU}</span><div class="logo">${MARK.replaceAll('__ID__', `${id}t`)}<span>DishBooks</span></div><span class="av">${esc(u.initials)}</span></div>` : '<div class="chrome"><i></i><i></i><i></i></div>'}
    <div class="main">
      <header class="top">
        <div class="tt">${S.crumb ? `<span class="crumb">${S.crumb}</span>` : ''}<h5 class="ttl">${S.title}</h5></div>
        ${L.compact ? '' : head}
      </header>
      <div class="views">${S.view(data, L, N, id)}</div>
    </div>
    ${
      L.compact
        ? ''
        : `<nav class="side">
      <div class="logo">${MARK.replaceAll('__ID__', id)}<span>DishBooks</span></div>
      <div class="org">
        <div class="org-row"><span class="ib">${icon('buildings')}</span><span class="org-name">${esc(data.company.name)}</span>${icon('caret-down', 'car')}</div>
        <div class="org-row"><span class="ib">${icon('map-pin')}</span><span class="org-name">${esc(data.company.scopeLabel)}</span>${icon('caret-down', 'car')}</div>
      </div>
      <div class="items"><i class="nhl"></i>${NAV.map(([ic, label, more], i) => `<div class="ni${i === S.nav ? ' on' : ''}"><span class="ib">${ic === 'cog' ? COG : icon(ic)}</span><span class="nl">${esc(label)}</span>${more ? icon('caret-down', 'car') : ''}</div>`).join('')}</div>
      <div class="grow"></div>
      <div class="setup"><div><b>Setup</b><span>3/4</span></div><i><i></i></i></div>
      <div class="dex-btn"><div class="dex-btn-in"><span>Ask Dex</span><span class="ai">AI</span></div></div>
      <div class="me"><span class="av">${esc(u.initials)}</span><span class="me-name">${esc(u.firstName)} ${esc(u.lastName)}</span><span class="mode">${SUN}</span></div>
    </nav>`
    }
    ${S.extra ? S.extra(data, L, id) : ''}
    <div class="cursor${L.touch ? ' touch' : ''}"><div class="ripple"></div>${L.touch ? '<div class="tip"></div>' : CURSOR}</div>
    </div>
    <div class="callout"><i></i><span></span></div>`;

    app = el.querySelector('.cam');
    const q = (s) => app.querySelector(s);
    const qa = (s) => [...app.querySelectorAll(s)];
    R = {
      view: q('.view'),
      nhl: q('.nhl'),
      nis: qa('.ni'),
      dexBtnIn: q('.dex-btn-in'),
      callout: el.querySelector('.callout'),
      calloutText: el.querySelector('.callout span'),
      cursor: q('.cursor'),
      ripple: q('.ripple'),
      ...S.refs(q, qa, L, data),
    };
    // What dims: the window chrome and the story's blocks. What lights: each spot's targets.
    const frameBlocks = L.compact ? ['.mbar', '.top'] : ['.side', '.top'];
    R.blocks = [...new Set([...frameBlocks, ...S.blocks(L)].flatMap((s) => qa(s)))];
    const pick = (sel) => (typeof sel === 'function' ? sel(R) : sel.flatMap((s) => qa(s)));
    R.spots = spots.map((sp) => ({ ...sp, label: typeof sp.label === 'function' ? sp.label(data) : sp.label, els: pick(sp.sel), framed: pick(sp.focus ?? sp.sel) }));
    R.lit = [...new Set(R.spots.flatMap((sp) => sp.els))];
    R.lit.forEach((e) => e.classList.add('lit'));
  }

  /** Box of an element in app coordinates (transforms ignored). */
  function offset(el) {
    let x = 0;
    let y = 0;
    for (let n = el; n && n !== app; n = n.offsetParent) {
      x += n.offsetLeft;
      y += n.offsetTop;
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  }
  const at = (el, fx = 0.5, fy = 0.55) => {
    const o = offset(el);
    return { x: o.x + o.w * fx, y: o.y + o.h * fy };
  };
  const mix = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) });
  const pulse = (t, a) => seg(t, a - 0.06, 0.06) - seg(t, a + 0.04, 0.12);
  /** 0 → 1 → 0 over a spot, eased at both ends. */
  const weight = (t, sp) => ease.inOutCubic(Math.min(seg(t, sp.at, FADE), 1 - seg(t, sp.at + sp.dur - FADE, FADE)));

  // ---- Camera: { s, x, y } = scale and the app point at the frame's centre ----
  const minS = Math.max(Math.min(W / AW, H / AH), L.cam.minZoom ?? 0);
  /** Keep the visible rect inside the app (centred when the app is smaller). */
  const fitCam = (s, x, y) => {
    const vw = W / s;
    const vh = H / s;
    return {
      s,
      x: vw >= AW ? AW / 2 : clamp(x, vw / 2, AW - vw / 2),
      y: vh >= AH ? AH / 2 : clamp(y, vh / 2, AH - vh / 2),
    };
  };
  const WIDE = fitCam(minS, AW / 2, 0); // the whole window (phones: the top of the page)
  const union = (els) => {
    const shown = els.filter((e) => e.offsetParent);
    const b = (shown.length ? shown : els).map(offset);
    const x0 = Math.min(...b.map((o) => o.x));
    const y0 = Math.min(...b.map((o) => o.y));
    return { x0, y0, x1: Math.max(...b.map((o) => o.x + o.w)), y1: Math.max(...b.map((o) => o.y + o.h)) };
  };
  function shot(sp) {
    const b = union(sp.framed);
    const p = L.cam.pad;
    const max = sp.zoom ?? L.cam.maxZoom;
    const fit = Math.min(W / (b.x1 - b.x0 + 2 * p), H / (b.y1 - b.y0 + 2 * p + 40)); // + room for the label
    return fitCam(clamp(fit, minS, Math.max(minS, max)), (b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2 + 14);
  }
  const mixCam = (a, b, p) => ({ s: lerp(a.s, b.s, p), x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) });
  /** App point → frame point. */
  const toFrame = (c, x, y) => ({ x: (x - c.x) * c.s + W / 2, y: (y - c.y) * c.s + H / 2 });

  function frame(t) {
    const dur = S.duration;
    t = (((t + startAt) % dur) + dur) % dur; // video time → story time

    // The page loads at t = 0 and clears just before the loop point.
    const pin = ease.outCubic(seg(t, 0, 0.45));
    const pout = ease.inOutCubic(seg(t, dur - 0.45, 0.35));
    R.view.style.opacity = pin * (1 - pout);
    R.view.style.transform = `translateY(${(lerp(10, 0, pin) - 6 * pout).toFixed(2)}px)`;
    if (R.nhl) {
      const ni = R.nis[S.nav];
      R.nhl.style.transform = `translateY(${ni.offsetTop}px)`;
      R.nhl.style.height = `${ni.offsetHeight}px`;
    }
    if (R.dexBtnIn) R.dexBtnIn.style.backgroundPosition = `${((t / dur) * 200) % 200}% 50%`;

    S.frame(t, R, L, D, N);

    // ---- Spotlight ------------------------------------------------------------------
    const w = R.spots.map((sp) => weight(t, sp));
    const related = (a, b) => a === b || a.contains(b) || b.contains(a);
    R.blocks.forEach((b) => {
      const d = Math.max(0, ...R.spots.map((sp, i) => (sp.els.some((e) => related(e, b)) ? 0 : w[i])));
      b.style.filter = d > 0.001 ? `opacity(${(1 - DIM * d).toFixed(3)}) saturate(${(1 - 0.6 * d).toFixed(3)})` : '';
    });
    R.lit.forEach((e) => {
      const l = Math.max(0, ...R.spots.map((sp, i) => (sp.els.includes(e) ? w[i] : 0)));
      e.style.setProperty('--lift', l.toFixed(3));
      e.style.scale = l > 0.001 ? `${(1 + 0.012 * l).toFixed(4)}` : '';
      e.style.zIndex = l > 0.001 ? 4 : '';
    });

    // ---- Camera: wide → each spot's shot in turn → wide ------------------------------
    // Shots are measured every frame: a story's own motion (a row opening, say)
    // can move what a later spot lights.
    let cam = WIDE;
    R.spots.forEach((sp) => {
      cam = mixCam(cam, shot(sp), ease.inOutCubic(seg(t, sp.at - 0.2, MOVE)));
    });
    const lastSp = R.spots[R.spots.length - 1];
    if (lastSp) cam = mixCam(cam, WIDE, ease.inOutCubic(seg(t, lastSp.at + lastSp.dur - 0.2, MOVE + 0.1)));
    app.style.transform = `translate(${(W / 2 - cam.x * cam.s).toFixed(2)}px, ${(H / 2 - cam.y * cam.s).toFixed(2)}px) scale(${cam.s.toFixed(4)})`;

    // The label sits under the lit (and framed) elements, in frame space (above them when there's no room).
    const on = w.reduce((b, v, i) => (v > w[b] ? i : b), 0);
    const sp = R.spots[on];
    R.callout.style.opacity = w[on] ?? 0;
    if (sp && w[on] > 0.001) {
      R.calloutText.textContent = sp.label;
      const b = union([...sp.els, ...sp.framed]);
      const a = toFrame(cam, b.x0, b.y0);
      const z = toFrame(cam, b.x1, b.y1);
      const cw = R.callout.offsetWidth;
      const ch = R.callout.offsetHeight;
      const below = z.y + 12 + ch < H - 8;
      const x = clamp((a.x + z.x) / 2 - cw / 2, 10, W - cw - 10);
      const y = below ? z.y + 12 : Math.max(8, a.y - 12 - ch);
      R.callout.style.transform = `translate(${x.toFixed(1)}px, ${(y + (below ? -6 : 6) * (1 - w[on])).toFixed(1)}px)`;
    } else {
      R.callout.style.transform = 'translate(-999px, 0)';
    }

    // ---- Pointer (in app space, so it moves with the camera) ------------------------------
    if (!taps.length) {
      R.cursor.style.opacity = 0;
      return;
    }
    const pts = taps.map((tp) => [tp.at, tp.pos ? tp.pos(R, at) : at(tp.el(R), tp.fx ?? 0.5, tp.fy ?? 0.55)]);
    const clicks = pts.map((p) => p[0]);
    if (L.touch) {
      const [a, pos] = pts.reduce((b, x) => (Math.abs(t - x[0]) < Math.abs(t - b[0]) ? x : b));
      R.cursor.style.opacity = seg(t, a - 0.28, 0.14) * (1 - seg(t, a + 0.12, 0.2));
      R.cursor.style.transform = `translate(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px) scale(${1 - pulse(t, a) * 0.18})`;
      const rip = t >= a && t < a + 0.4 ? seg(t, a, 0.4) : 0;
      R.ripple.style.opacity = rip > 0 && rip < 1 ? 1 - rip : 0;
      R.ripple.style.transform = `scale(${lerp(0.5, 1.6, rip)})`;
      return;
    }
    // A mouse pointer glides in for the first click, between clicks, and back out.
    const rest = L.rest;
    let pos = rest;
    for (const [a, p] of pts) pos = mix(pos, p, ease.inOutCubic(seg(t, a - 0.6, 0.55)));
    const last = clicks[clicks.length - 1];
    pos = mix(pos, rest, ease.inOutCubic(seg(t, last + 0.35, 0.6)));
    R.cursor.style.opacity = seg(t, clicks[0] - 0.8, 0.25) * (1 - seg(t, last + 0.6, 0.35));
    const click = Math.max(...clicks.map((c) => pulse(t, c)));
    R.cursor.style.transform = `translate(${(pos.x - 4).toFixed(1)}px, ${(pos.y - 2.5).toFixed(1)}px) scale(${1 - click * 0.12})`;
    const lastClick = [...clicks].reverse().find((c) => t >= c);
    const rip = lastClick != null && t < lastClick + 0.45 ? seg(t, lastClick, 0.45) : 0;
    R.ripple.style.opacity = rip > 0 && rip < 1 ? 1 - rip : 0;
    R.ripple.style.transform = `translate(4px, 2.5px) scale(${lerp(0.3, 1.4, rip)})`;
  }

  return { meta: L.meta, build, frame };
}
