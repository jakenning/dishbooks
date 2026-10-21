// Homepage hero — app components floating on the page, assembled one at a time
// (the boxes format of ../home-components, with the snippets story):
//
//   1. KPI tiles — Total Sales, Prime Cost %, Net Profit rise in one by one and
//      count up (phones: Total Sales and Prime Cost %).
//   2. Cash Balance — the balance counts up and its bank accounts list in; an
//      Ask Dex button sits in the card's corner.
//   3. Ask Dex — the pointer clicks it and the Dex card assembles underneath.
//   4. Dex — "Can we cover payroll and next week's bills?" types out and the
//      answer streams in (cashAsk, the Why DishBooks question); the Cash Balance
//      card it draws on stays lit while it answers. A long hold to read it,
//      then everything leaves.
//
// 18s seamless loop, paced slower than the other heroes so each box lands
// before the next. This file is the story, shared by both layouts:
// scenes/home-boxes (560 × 660) and scenes/home-boxes-mobile (400 × 572, a
// fingertip instead of a pointer). Timings are in HB_CUES; every name and
// number comes from the scenario JSON.
//
// render.mjs bundles every module into one scope, so the names here stay clear
// of app.js's and hc.js's.

import { seg, ease, lerp, clamp, countUp } from '../../lib/timeline.js';
import { icon } from '../../shared/icons.js';
import { model, cashAsk, answerHtml, esc, kMoney, pct, cents, CURSOR } from '../why-dishbooks/app.js';
import { kpiTile } from '../home-components/hc.js';

// Seconds, story time. [start, duration] pairs unless noted.
export const HB_CUES = {
  tiles: [0.2, 0.7], // KPI tiles rise in (start, stagger) …
  count: 1.6, // … and count up for this long
  cash: 2.4, // Cash Balance card rises in
  accts: [2.9, 0.18], // its accounts list in (start, stagger)
  glow: 3.9, // the Ask Dex button glows …
  cursorIn: [3.7, 0.3],
  toDex: [3.9, 0.9],
  goDex: 5.0, // … and is clicked
  dex: 5.2, // the Dex card rises in
  typeAsk: [6.0, 1.6],
  send: 7.85,
  thinking: [7.9, 0.6],
  answer: [8.5, 2.6],
  lit: [8.5, 0.5], // the Cash Balance card lights while Dex answers
  toRest: [5.3, 0.7], // pointer steps off …
  cursorOut: [6.2, 0.4], // … and fades out
  outro: [16.6, 0.8], // everything leaves; t = 18 matches t = 0 (empty)
};

// ---- Numbers --------------------------------------------------------------------

// The homepage shows a mid-sized group, not the scenario's $10.8M one (client
// review, Oct 2026): these figures are set, and everything else is scaled to
// them so the tiles, the accounts and Dex's answer agree. Prime cost % (60.5%)
// and the year-over-year changes stay as the scenario has them.
const HB_FIGURES = {
  sales: 4320000, // Total Sales, shown as $4.32M
  net: 647500, // Net Profit
  accounts: { Operating: 29515926, Payroll: 8263177 }, // cents; Cash Balance is their sum
};

/** The scenario at the homepage's size: P&L, locations and KPIs scaled to HB_FIGURES. */
function hbScenario(D) {
  const F = HB_FIGURES;
  const P = Object.fromEntries(D.pnl.map((r) => [r.metric, r]));
  const f = F.sales / P['Total Sales'].actual;
  // Net Profit is set; EBITDA keeps its ratio to it, and operating expenses take up the difference.
  const net = { actual: F.net, lastYear: F.net * (P['Net Profit'].lastYear / P['Net Profit'].actual) };
  const ebitda = Object.fromEntries(['actual', 'lastYear'].map((y) => [y, net[y] * (P.EBITDA[y] / P['Net Profit'][y])]));
  const pnl = D.pnl.map((r) => {
    const s = (y) => r[y] * f;
    if (r.metric === 'Net Profit') return { ...r, ...net };
    if (r.metric === 'EBITDA') return { ...r, ...ebitda };
    if (r.metric === 'Operating Expenses') {
      const opex = (y) => P['Total Sales'][y] * f - P['Prime Cost'][y] * f - ebitda[y];
      return { ...r, actual: opex('actual'), lastYear: opex('lastYear') };
    }
    return { ...r, actual: s('actual'), lastYear: s('lastYear') };
  });
  const cash = (F.accounts.Operating + F.accounts.Payroll) / 100;
  const value = { sales: F.sales, net: F.net, ebitda: ebitda.actual, cash };
  return {
    ...D,
    pnl,
    locations: D.locations.map((l) => ({ ...l, sales: l.sales * f })),
    kpis: D.kpis.map((k) => (k.key in value ? { ...k, value: value[k.key] } : k)),
  };
}

function hbModel(scenario) {
  const D = hbScenario(scenario);
  const N = model(D);
  N.accounts = N.accounts.map(([nm, last4]) => [nm, last4, HB_FIGURES.accounts[nm]]);
  const P = Object.fromEntries(D.pnl.map((r) => [r.metric, r]));
  const k = (key) => D.kpis.find((x) => x.key === key);
  const yoy = (m) => (P[m].actual / P[m].lastYear - 1) * 100;
  const up = (v) => `${v >= 0 ? '↑' : '↓'} ${Math.abs(v).toFixed(1)}%`;
  const primeDelta = k('prime').value - (P['Prime Cost'].lastYear / P['Total Sales'].lastYear) * 100;
  return {
    N,
    tiles: [
      { label: 'Total Sales', k: k('sales'), delta: up(yoy('Total Sales')), good: yoy('Total Sales') >= 0 },
      { label: 'Prime Cost %', k: k('prime'), delta: `${primeDelta <= 0 ? '↓' : '↑'} ${Math.abs(primeDelta).toFixed(1)} pts`, good: primeDelta <= 0 },
      { label: 'Net Profit', k: k('net'), delta: up(yoy('Net Profit')), good: yoy('Net Profit') >= 0 },
    ],
    dex: cashAsk(D, N),
  };
}

// ---- Markup ---------------------------------------------------------------------

function cashCard(N) {
  const accts = N.accounts
    .map(([nm, last4, v]) => `<li>${icon('bank', 'ai2')}<span>${nm} <em>••${last4}</em></span><b>${cents(v, false)}</b></li>`)
    .join('');
  return `<div class="card cc">
    <div class="ch"><div><div class="lbl">Cash Balance</div><div class="cv"></div><div class="cs">Across ${N.accounts.length} accounts · synced 6:02 AM</div></div>
      <span class="dex-btn"><span class="dex-btn-in"><span>Ask Dex</span><span class="ai">AI</span></span></span></div>
    <ul class="acc">${accts}</ul>
  </div>`;
}

function hbDexCard(D, ask) {
  return `<div class="card dx">
    <div class="dh"><span class="orb"></span><b>Dex</b><span class="ai">AI</span><span class="dsub">${esc(D.company.name)}</span></div>
    <div class="dxb">
      <div class="msg hi"><span class="orb sm"></span><div class="dex-message"><p>Hi ${esc(D.user.firstName)}, ask me anything about your numbers.</p></div></div>
      <div class="bubble">${esc(ask.ask)}</div>
      <div class="msg ans"><span class="orb sm"></span><div class="dex-message">${answerHtml(ask.answer)}<div class="dots"><i></i><i></i><i></i></div></div></div>
    </div>
    <div class="input"><span class="typed"></span><span class="caret"></span><span class="ph">Ask Dex about your numbers…</span><span class="send">${icon('paper-plane-right')}</span></div>
  </div>`;
}

// ---- Scene ----------------------------------------------------------------------
// L: { meta, startAt, compact, touch, tiles, cursor: { start, rest } }
//   startAt: where in the story the video's t = 0 falls. The loop is seamless,
//            so the timeline is just rotated: frame 0 (the poster Webflow
//            shows first) is everything assembled and answered.
//   tiles:   how many KPI tiles (3 on desktop, 2 on phones)
//   touch:   a fingertip at the tap instead of a gliding mouse pointer

export function makeHomeBoxes(L) {
  let R;
  let root;
  let M;

  function build(el, data) {
    root = el;
    M = hbModel(data);
    el.classList.add('db-anim', 'wdb', 'hc', 'hb');
    if (L.compact) el.classList.add('m');
    window.__hbN = (window.__hbN ?? 0) + 1;
    const id = `hb${window.__hbN}`;
    const tiles = M.tiles.slice(0, L.tiles);
    el.innerHTML = `
    <div class="kts">${tiles.map((x, i) => kpiTile(x.label, x.k, x.delta, x.good, `${id}${i}`)).join('')}</div>
    ${cashCard(M.N)}
    ${hbDexCard(data, M.dex)}
    <div class="cursor${L.touch ? ' touch' : ''}"><div class="ripple"></div>${L.touch ? '<div class="tip"></div>' : CURSOR}</div>`;

    const q = (sel) => el.querySelector(sel);
    const qa = (sel) => [...el.querySelectorAll(sel)];
    R = {
      tiles,
      kts: qa('.kt'),
      kvs: qa('.kt .kv'),
      dls: qa('.kt .dl'),
      rvs: qa('.kt .rv'),
      cc: q('.cc'),
      cv: q('.cc .cv'),
      accts: qa('.cc .acc li'),
      dexBtn: q('.cc .dex-btn'),
      dexBtnIn: q('.cc .dex-btn-in'),
      dx: q('.dx'),
      hi: q('.dx .hi'),
      bubble: q('.bubble'),
      ans: q('.msg.ans'),
      dots: q('.dots'),
      words: qa('.ans .wd'),
      typed: q('.typed'),
      caret: q('.caret'),
      ph: q('.ph'),
      cursor: q('.cursor'),
      ripple: q('.ripple'),
      geo: null,
    };
  }

  function offset(el) {
    let x = 0;
    let y = 0;
    for (let n = el; n && n !== root; n = n.offsetParent) {
      x += n.offsetLeft;
      y += n.offsetTop;
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  }

  function measure() {
    const o = offset(R.dexBtn);
    return { ...L.cursor, dex: { x: o.x + o.w * 0.45, y: o.y + o.h * 0.6 } };
  }

  const mix = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) });
  const pulse = (t, at) => seg(t, at - 0.06, 0.06) - seg(t, at + 0.04, 0.12);
  const show = (el, v) => {
    el.style.opacity = v;
    el.style.visibility = v <= 0.001 ? 'hidden' : 'visible';
  };

  function frame(t) {
    const dur = L.meta.duration;
    t = (((t + (L.startAt ?? 0)) % dur) + dur) % dur; // video time → story time
    // Layout is only measurable once the stage is rendered (an embed can start
    // out hidden, e.g. the desktop version on a phone breakpoint).
    const G = R.geo ?? measure();
    if (root.offsetWidth) R.geo = G;
    const C = HB_CUES;
    const out = ease.inOutCubic(seg(t, ...C.outro));

    // ---- Cards in / out ------------------------------------------------------------
    const place = (el, at, dy = 16) => {
      const p = ease.outCubic(seg(t, at, 0.7));
      show(el, p * (1 - out));
      el.style.transform = `translateY(${(lerp(dy, 0, p) - 10 * out).toFixed(2)}px) scale(${lerp(0.97, 1, p).toFixed(4)})`;
    };
    R.kts.forEach((el, i) => place(el, C.tiles[0] + i * C.tiles[1]));
    place(R.cc, C.cash);
    place(R.dx, C.dex, 24);

    // ---- 1. KPI tiles count up --------------------------------------------------------
    R.tiles.forEach(({ k }, i) => {
      const s = C.tiles[0] + i * C.tiles[1] + 0.15;
      const v = countUp(t, s, C.count, k.value);
      R.kvs[i].textContent = k.format === 'pct' ? pct(v) : k.value >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : kMoney(v);
      R.dls[i].style.opacity = ease.outCubic(seg(t, s + C.count - 0.5, 0.5));
      R.rvs[i].setAttribute('width', (200 * ease.inOutCubic(seg(t, s + 0.1, C.count))).toFixed(1));
    });

    // ---- 2. Cash Balance --------------------------------------------------------------
    R.cv.textContent = cents(countUp(t, C.cash + 0.15, C.count, M.N.cash), false);
    R.accts.forEach((li, i) => {
      const p = ease.outCubic(seg(t, C.accts[0] + i * C.accts[1], 0.45));
      li.style.opacity = p;
      li.style.transform = `translateY(${lerp(6, 0, p).toFixed(2)}px)`;
    });
    const lit = ease.outCubic(seg(t, ...C.lit)) * (1 - out);
    R.cc.style.setProperty('--lit', lit.toFixed(3));
    R.dexBtnIn.style.backgroundPosition = `${((t / dur) * 200) % 200}% 50%`; // one sweep per loop
    R.dexBtn.style.scale = 1 - pulse(t, C.goDex) * 0.06;
    R.dexBtn.style.setProperty('--glow', (seg(t, C.glow, 0.4) * (1 - seg(t, C.goDex + 0.1, 0.5))).toFixed(3));

    // ---- 3. Dex: question typed and sent, answer streams in -------------------------------
    const ask = M.dex.ask;
    const sent = t >= C.send;
    const nChars = Math.round(ask.length * seg(t, ...C.typeAsk));
    R.typed.textContent = sent ? '' : ask.slice(0, nChars);
    R.ph.style.display = nChars === 0 || sent ? '' : 'none';
    const blinkOn = nChars < ask.length || Math.floor(t * 3) % 2 === 0;
    R.caret.style.opacity = !sent && t >= C.typeAsk[0] - 0.15 && blinkOn ? 1 : 0;
    const bub = ease.outCubic(seg(t, C.send, 0.35));
    show(R.bubble, bub);
    R.bubble.style.transform = `translateY(${lerp(10, 0, bub).toFixed(2)}px)`;
    // Phones: the greeting steps aside for the conversation.
    if (L.compact) {
      show(R.hi, 1 - bub);
      R.hi.style.marginTop = `${(-R.hi.offsetHeight * bub - 10 * bub).toFixed(1)}px`;
    }
    show(R.ans, seg(t, C.thinking[0], 0.2));
    R.dots.style.opacity = t < C.answer[0] ? 1 : 0;
    [...R.dots.children].forEach((d, i) => {
      d.style.transform = `translateY(${(Math.sin(t * 9 - i * 0.9) * -2.5).toFixed(2)}px)`;
    });
    const shown = R.words.length * seg(t, ...C.answer);
    R.words.forEach((w, i) => (w.style.opacity = clamp(shown - i)));

    // ---- Pointer ---------------------------------------------------------------------------
    const at = C.goDex;
    if (L.touch) {
      // A fingertip lands just before the tap and lifts after.
      const press = pulse(t, at);
      R.cursor.style.opacity = seg(t, at - 0.35, 0.18) * (1 - seg(t, at + 0.15, 0.3));
      R.cursor.style.transform = `translate(${G.dex.x.toFixed(1)}px, ${G.dex.y.toFixed(1)}px) scale(${1 - press * 0.18})`;
      const rip = t >= at && t < at + 0.45 ? seg(t, at, 0.45) : 0;
      R.ripple.style.opacity = rip > 0 && rip < 1 ? 1 - rip : 0;
      R.ripple.style.transform = `scale(${lerp(0.5, 1.6, rip)})`;
      return;
    }
    let pos = mix(G.start, G.dex, ease.inOutCubic(seg(t, ...C.toDex)));
    pos = mix(pos, G.rest, ease.inOutCubic(seg(t, ...C.toRest)));
    R.cursor.style.opacity = seg(t, ...C.cursorIn) * (1 - seg(t, ...C.cursorOut));
    R.cursor.style.transform = `translate(${(pos.x - 4).toFixed(1)}px, ${(pos.y - 2.5).toFixed(1)}px) scale(${1 - pulse(t, at) * 0.12})`;
    const rip = t >= at && t < at + 0.45 ? seg(t, at, 0.45) : 0;
    R.ripple.style.opacity = rip > 0 && rip < 1 ? 1 - rip : 0;
    R.ripple.style.transform = `translate(4px, 2.5px) scale(${lerp(0.3, 1.4, rip)})`;
  }

  return { meta: L.meta, build, frame };
}
