// Homepage hero — "AI-powered accounting software, built for restaurants."
//
// Four app components floating on the page background, in the hero's right
// column (no app window, like the Ops Calendar and Custom Reports scenes). One
// quick story that sums up the product:
//
//   1. Bank Transactions — a POS deposit and two vendor invoices come in; the
//      invoices sort themselves into the company's cost categories, and
//      "Accept 3 matches" reconciles the feed.
//   2. KPI tiles — Total Sales and Prime Cost % count up, vs. last year.
//   3. Prime Cost by Location — COGS + labor bars, every location side by side
//      against the group average; the outlier gets flagged.
//   4. Dex — "Ask Dex" on that card: the question types out and the answer
//      names what's driving the outlier.
//
// 11s seamless loop. This file is the story, shared by both layouts:
// scenes/home-components (560 × 660) and scenes/home-components-mobile
// (400 × 572, a fingertip instead of a pointer, the feed and Dex sharing one
// slot). Timings are in HC_CUES; every name and number comes from the scenario
// JSON (via the Why DishBooks model, so the feed matches that scene's).
//
// render.mjs bundles every module into one scope, so the names here stay clear
// of app.js's (CUES, model, makeScene, …).

import { seg, ease, lerp, clamp, riseIn, countUp } from '../../lib/timeline.js';
import { icon } from '../../shared/icons.js';
import { CATS, SWATCH } from '../../shared/categories.js';
import { model, answerHtml, esc, kMoney, pct, cents, monoD, CURSOR } from '../why-dishbooks/app.js';

// Seconds, story time. [start, duration] pairs unless noted.
export const HC_CUES = {
  feed: 0.05, // cards rise in
  kpis: 0.15,
  locs: 0.25,
  dex: 0.35, // desktop only: on phones Dex takes the feed's slot at `swap`
  rows: [0.3, 0.09], // feed rows cascade in (start, stagger)
  sort: [0.85, 0.25], // the invoices sort into categories (start, stagger)
  count: [0.3, 1.4], // KPIs count up
  bars: [0.5, 1.1], // location bars grow
  cursorIn: [1.35, 0.25],
  toAccept: [1.45, 0.6],
  accept: 2.2,
  matched: [2.3, 0.12], // rows flip to Reconciled (start, stagger)
  flag: 3.0, // the outlier location lights up
  toDex: [3.15, 0.5],
  goDex: 3.8,
  swap: [3.8, 0.4], // phone: the feed steps out and Dex rises in its place
  typeAsk: [3.95, 0.8],
  send: 4.85,
  thinking: [4.9, 0.35],
  answer: [5.25, 1.6],
  toRest: [4.0, 0.6], // pointer steps off while Dex answers…
  cursorOut: [6.2, 0.35], // …and fades out for the hold
  outro: [10.1, 0.5], // everything leaves; t = 11 matches t = 0 (empty)
};

const LINE_TX = 'M224 56H32v144h192ZM32 96h192M64 160h32M128 160h16'; // credit card (line)
const lineIcon = (d, cls = '') =>
  `<svg class="pi ${cls}" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

// ---- Numbers --------------------------------------------------------------------

function hcModel(D) {
  const N = model(D);
  const cats = CATS[D.id] ?? CATS.default;
  const P = Object.fromEntries(D.pnl.map((r) => [r.metric, r]));
  const sales = D.kpis.find((k) => k.key === 'sales');
  const prime = D.kpis.find((k) => k.key === 'prime');
  const lyPrime = (P['Prime Cost'].lastYear / P['Total Sales'].lastYear) * 100;
  // Feed: the POS deposit and the first food and beverage invoices from the
  // Why DishBooks bank feed, each sorted into the concept's first category on
  // that side (Proteins, Beer & Wine, …).
  const first = (side) => cats.findIndex((c) => c[1] === side);
  const sideCat = (side) => {
    const i = first(side) >= 0 ? first(side) : 0;
    return { name: cats[i][0], color: SWATCH[i] };
  };
  const byCat = (label) => N.tx.find((r) => r[2] === label);
  const feed = [
    { tx: N.tx[0], sub: 'from your POS', cat: { name: 'Sales', color: '#00a63e' }, sales: true },
    { tx: byCat('COGS · Food') ?? N.tx[1], sub: 'vendor invoice', cat: sideCat('f') },
    { tx: byCat('COGS · Beverage') ?? N.tx[4], sub: 'vendor invoice', cat: sideCat('b') },
  ];
  const locs = D.locations.slice(0, 4).map((l) => ({ name: l.name, cogs: l.food + l.bev, labor: l.labor, prime: l.food + l.bev + l.labor }));
  return {
    feed,
    sales: { k: sales, yoy: (P['Total Sales'].actual / P['Total Sales'].lastYear - 1) * 100 },
    prime: { k: prime, delta: prime.value - lyPrime },
    locs,
    avg: prime.value,
    flagRow: D.flag && D.locations.length > 1 ? D.flag.row : -1,
    flagCol: D.flag?.col === 'labor' ? 'l' : 'c',
    max: Math.ceil((Math.max(...locs.map((l) => l.prime)) + 6) / 5) * 5, // bar scale (%)
  };
}

// ---- Markup ---------------------------------------------------------------------

function hcSpark(k, id) {
  const W = 200;
  const H = 40;
  const lo = Math.min(...k.spark);
  const hi = Math.max(...k.spark);
  const pad = (hi - lo) * 0.25 || 1;
  const pts = k.spark.map((v, i) => [(i / (k.spark.length - 1)) * W, H - 4 - ((v - lo + pad) / (hi - lo + 2 * pad)) * (H - 8)]);
  const d = monoD(pts);
  // Prime cost falling is the good direction, so its line is green too.
  const cl = k.trend === 'declining' ? '#e7000b' : '#00a63e';
  return `<svg class="spk" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <clipPath id="${id}"><rect class="rv" width="0" height="${H}"/></clipPath>
    <g clip-path="url(#${id})"><path d="${d}L${W} ${H}L0 ${H}Z" fill="color-mix(in srgb, ${cl} 10%, transparent)"/><path d="${d}" fill="none" stroke="${cl}" stroke-width="2" vector-effect="non-scaling-stroke"/></g></svg>`;
}

function feedCard(M, L) {
  const status = `<span class="st"><span class="s1">Match found</span><span class="s2">${icon('check')}Reconciled</span></span>`;
  const rows = M.feed
    .map((r, i) => {
      const [date, desc, , amt] = r.tx;
      const chip = `<span class="cat${r.sales ? ' sold' : ''}" style="--c:${r.cat.color}"><span class="c0">Sorting…</span><span class="c1"><i></i>${esc(r.cat.name)}</span></span>`;
      const am = `<span class="am${amt > 0 ? ' in' : ''}">${cents(amt)}</span>`;
      return L.compact
        ? `<div class="tr m fr" data-i="${i}"><span class="d2"><b>${esc(desc)}</b>${chip}</span><span class="rt">${am}${status}</span></div>`
        : `<div class="tr m fr" data-i="${i}"><span class="d2"><b>${esc(desc)}</b><em>${date} · ${r.sub}</em></span>${chip}${am}${status}</div>`;
    })
    .join('');
  return `<div class="card fd">
    <div class="fh"><div><div class="ct">Bank Transactions</div><div class="cs">${lineIcon(LINE_TX, 'ci')}Bank &amp; POS · synced 6:02 AM</div></div>
      <span class="btn"><span class="b1">${icon('check')}Accept ${M.feed.length} matches</span><span class="b2">${icon('check')}All reconciled</span></span></div>
    <div class="fx">${rows}</div>
  </div>`;
}

function kpiTile(label, k, delta, good, id) {
  return `<div class="card kt"><div class="lbl">${esc(label)}</div><div class="kr"><span class="kv"></span><span class="dl${good ? ' up' : ' dn'}">${delta} <em>vs last year</em></span></div>${hcSpark(k, id)}</div>`;
}

function locCard(M, D) {
  const rows = M.locs
    .map(
      (l, i) =>
        `<div class="lr${i === M.flagRow ? ' fl' : ''}" data-i="${i}"><span class="ln">${esc(l.name)}</span><span class="lb"><b class="c"></b><b class="l"></b></span><span class="lv"></span></div>`,
    )
    .join('');
  return `<div class="card lc">
    <div class="lh"><div><div class="ct">Prime Cost by ${esc(D.rowLabel)}</div><div class="cs">${esc(D.period)} · COGS + labor</div></div>
      <span class="dex-btn"><span class="dex-btn-in"><span>Ask Dex</span><span class="ai">AI</span></span></span></div>
    <div class="lg"><span><i class="c"></i>COGS</span><span><i class="l"></i>Labor</span><span class="ga"><i></i>Group ${pct(M.avg)}</span></div>
    <div class="lrs" style="--avg:${((M.avg / M.max) * 100).toFixed(2)}%">${rows}<i class="avg"></i></div>
  </div>`;
}

function dexCard(D) {
  return `<div class="card dx">
    <div class="dh"><span class="orb"></span><b>Dex</b><span class="ai">AI</span><span class="dsub">${esc(D.company.name)}</span></div>
    <div class="dxb">
      <div class="la hi"><div class="msg"><span class="orb sm"></span><div class="dex-message"><p>Hi ${esc(D.user.firstName)}, ask me anything about your numbers.</p></div></div></div>
      <div class="la qa"><div class="bubble">${esc(D.dex.ask)}</div><div class="msg ans"><span class="orb sm"></span><div class="dex-message">${answerHtml([D.dex.answer[0]])}<div class="dots"><i></i><i></i><i></i></div></div></div></div>
    </div>
    <div class="input"><span class="typed"></span><span class="caret"></span><span class="ph">Ask Dex about your numbers…</span><span class="send">${icon('paper-plane-right')}</span></div>
  </div>`;
}

// ---- Scene ----------------------------------------------------------------------
// L: { meta, startAt, compact, touch, swap, cursor: { start, rest } }
//   startAt: where in the story the video's t = 0 falls. The loop is seamless,
//            so the timeline is just rotated: frame 0 (the poster Webflow
//            shows first) is everything loaded and answered.
//   swap:    phone: the feed and Dex share one slot (Dex replaces the feed)
//   touch:   a fingertip at each tap instead of a gliding mouse pointer

export function makeHomeComponents(L) {
  let R;
  let root;
  let D;
  let M;

  function build(el, data) {
    root = el;
    D = data;
    M = hcModel(data);
    el.classList.add('db-anim', 'wdb', 'hc');
    if (L.compact) el.classList.add('m');
    window.__hcN = (window.__hcN ?? 0) + 1;
    const id = `hc${window.__hcN}`;
    const s = M.sales;
    const p = M.prime;
    el.innerHTML = `
    ${feedCard(M, L)}
    <div class="kts">
      ${kpiTile('Total Sales', s.k, `${s.yoy >= 0 ? '↑' : '↓'} ${Math.abs(s.yoy).toFixed(1)}%`, s.yoy >= 0, `${id}a`)}
      ${kpiTile('Prime Cost %', p.k, `${p.delta <= 0 ? '↓' : '↑'} ${Math.abs(p.delta).toFixed(1)} pts`, p.delta <= 0, `${id}b`)}
    </div>
    ${locCard(M, data)}
    ${dexCard(data)}
    <div class="cursor${L.touch ? ' touch' : ''}"><div class="ripple"></div>${L.touch ? '<div class="tip"></div>' : CURSOR}</div>`;

    const q = (sel) => el.querySelector(sel);
    const qa = (sel) => [...el.querySelectorAll(sel)];
    R = {
      fd: q('.fd'),
      rows: qa('.fr'),
      cats: qa('.cat'),
      btn: q('.fd .btn'),
      kts: qa('.kt'),
      kvs: qa('.kt .kv'),
      dls: qa('.kt .dl'),
      rvs: qa('.kt .rv'),
      lc: q('.lc'),
      lrs: qa('.lr'),
      bars: qa('.lr').map((r) => [r.querySelector('.c'), r.querySelector('.l'), r.querySelector('.lv')]),
      avg: q('.lrs .avg'),
      dexBtn: q('.lc .dex-btn'),
      dexBtnIn: q('.lc .dex-btn-in'),
      dx: q('.dx'),
      hi: q('.la.hi'),
      qa: q('.la.qa'),
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
    const at = (el, fx = 0.5, fy = 0.55) => {
      const o = offset(el);
      return { x: o.x + o.w * fx, y: o.y + o.h * fy };
    };
    return { ...L.cursor, accept: at(R.btn, 0.5), dex: at(R.dexBtn, 0.45, 0.6) };
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
    const C = HC_CUES;
    const out = ease.inOutCubic(seg(t, ...C.outro));

    // ---- Cards in / out ------------------------------------------------------------
    const place = (el, at, gone = 0, dy = 14) => {
      const p = ease.outCubic(seg(t, at, 0.55));
      show(el, p * (1 - gone) * (1 - out));
      el.style.transform = `translateY(${(lerp(dy, 0, p) - 10 * out - 12 * gone).toFixed(2)}px)`;
    };
    const swap = L.swap ? ease.inOutCubic(seg(t, ...C.swap)) : 0;
    place(R.fd, C.feed, swap);
    R.kts.forEach((el, i) => place(el, C.kpis + i * 0.06));
    place(R.lc, C.locs);
    if (L.swap) {
      const p = ease.outCubic(seg(t, C.swap[0] + 0.1, 0.5));
      show(R.dx, p * (1 - out));
      R.dx.style.transform = `translateY(${(lerp(18, 0, p) - 10 * out).toFixed(2)}px)`;
    } else place(R.dx, C.dex);

    // ---- 1. Feed: rows come in, invoices sort into categories, matches accepted ----------
    R.rows.forEach((r, i) => riseIn(r, t, C.rows[0] + i * C.rows[1], { dy: 6, dur: 0.4 }));
    R.cats.forEach((c, i) => {
      const at = C.sort[0] + i * C.sort[1];
      const p = ease.outCubic(seg(t, at, 0.3));
      c.style.setProperty('--s', p.toFixed(3));
      c.classList.toggle('done', p >= 0.5);
    });
    R.rows.forEach((r, i) => {
      const at = C.matched[0] + i * C.matched[1];
      const on = t >= at;
      r.classList.toggle('done', on);
      r.style.setProperty('--hl', on ? (1 - seg(t, at + 0.1, 0.7)).toFixed(3) : 0);
    });
    R.btn.classList.toggle('done', t >= C.matched[0] + R.rows.length * C.matched[1]);
    R.btn.style.scale = 1 - pulse(t, C.accept) * 0.05;

    // ---- 2. KPIs count up -----------------------------------------------------------------
    const ks = [M.sales.k, M.prime.k];
    R.kvs.forEach((kv, i) => {
      const v = countUp(t, C.count[0] + i * 0.08, C.count[1], ks[i].value);
      kv.textContent = ks[i].format === 'pct' ? pct(v) : kMoney(v);
    });
    R.dls.forEach((d, i) => (d.style.opacity = ease.outCubic(seg(t, C.count[0] + 0.6 + i * 0.08, 0.4))));
    R.rvs.forEach((rv, i) => rv.setAttribute('width', (200 * ease.inOutCubic(seg(t, C.count[0] + 0.15 + i * 0.08, 1.1))).toFixed(1)));

    // ---- 3. Locations: bars grow, the outlier flags --------------------------------------
    R.bars.forEach(([c, l, v], i) => {
      const loc = M.locs[i];
      const p = ease.outCubic(seg(t, C.bars[0] + i * 0.07, C.bars[1]));
      c.style.width = `${((loc.cogs / M.max) * 100 * p).toFixed(2)}%`;
      l.style.width = `${((loc.labor / M.max) * 100 * p).toFixed(2)}%`;
      v.textContent = pct(loc.prime * ease.outExpo(p));
      riseIn(R.lrs[i], t, C.locs + 0.15 + i * 0.06, { dy: 4, dur: 0.35 });
    });
    R.avg.style.opacity = ease.outCubic(seg(t, C.bars[0] + C.bars[1] - 0.2, 0.4));
    const fl = ease.outCubic(seg(t, C.flag, 0.35));
    if (M.flagRow >= 0) {
      const row = R.lrs[M.flagRow];
      row.style.setProperty('--fl', fl.toFixed(3));
      row.classList.toggle('on', fl > 0.5);
      row.classList.toggle('fc', M.flagCol === 'c');
    }
    R.dexBtnIn.style.backgroundPosition = `${((t / dur) * 200) % 200}% 50%`; // one sweep per loop
    R.dexBtn.style.scale = 1 - pulse(t, C.goDex) * 0.06;
    R.dexBtn.style.setProperty('--glow', (seg(t, C.flag + 0.2, 0.3) * (1 - seg(t, C.goDex + 0.1, 0.4))).toFixed(3));

    // ---- 4. Dex: question typed and sent, answer streams in -------------------------------
    const ask = D.dex.ask;
    const sent = t >= C.send;
    const nChars = Math.round(ask.length * seg(t, ...C.typeAsk));
    R.typed.textContent = sent ? '' : ask.slice(0, nChars);
    R.ph.style.display = nChars === 0 || sent ? '' : 'none';
    const blinkOn = nChars < ask.length || Math.floor(t * 3) % 2 === 0;
    R.caret.style.opacity = !sent && t >= C.typeAsk[0] - 0.1 && blinkOn ? 1 : 0;
    const qaIn = ease.outCubic(seg(t, C.send, 0.3));
    show(R.hi, 1 - qaIn);
    R.hi.style.transform = `translateY(${(-10 * qaIn).toFixed(2)}px)`;
    show(R.qa, qaIn);
    R.bubble.style.transform = `translateY(${lerp(10, 0, qaIn).toFixed(2)}px)`;
    show(R.ans, seg(t, C.thinking[0], 0.15));
    R.dots.style.opacity = t < C.answer[0] ? 1 : 0;
    [...R.dots.children].forEach((d, i) => {
      d.style.transform = `translateY(${(Math.sin(t * 9 - i * 0.9) * -2.5).toFixed(2)}px)`;
    });
    const shown = R.words.length * seg(t, ...C.answer);
    R.words.forEach((w, i) => (w.style.opacity = clamp(shown - i)));

    // ---- Pointer ---------------------------------------------------------------------------
    const clicks = [C.accept, C.goDex];
    if (L.touch) {
      // A fingertip lands just before each tap and lifts after.
      const taps = [G.accept, G.dex];
      const i = clicks.reduce((b, c, j) => (Math.abs(t - c) < Math.abs(t - clicks[b]) ? j : b), 0);
      const at = clicks[i];
      const press = pulse(t, at);
      R.cursor.style.opacity = seg(t, at - 0.3, 0.14) * (1 - seg(t, at + 0.15, 0.25));
      R.cursor.style.transform = `translate(${taps[i].x.toFixed(1)}px, ${taps[i].y.toFixed(1)}px) scale(${1 - press * 0.18})`;
      const rip = t >= at && t < at + 0.45 ? seg(t, at, 0.45) : 0;
      R.ripple.style.opacity = rip > 0 && rip < 1 ? 1 - rip : 0;
      R.ripple.style.transform = `scale(${lerp(0.5, 1.6, rip)})`;
      return;
    }
    let pos = mix(G.start, G.accept, ease.inOutCubic(seg(t, ...C.toAccept)));
    pos = mix(pos, G.dex, ease.inOutCubic(seg(t, ...C.toDex)));
    pos = mix(pos, G.rest, ease.inOutCubic(seg(t, ...C.toRest)));
    const click = Math.max(...clicks.map((c) => pulse(t, c)));
    R.cursor.style.opacity = seg(t, ...C.cursorIn) * (1 - seg(t, ...C.cursorOut));
    R.cursor.style.transform = `translate(${(pos.x - 4).toFixed(1)}px, ${(pos.y - 2.5).toFixed(1)}px) scale(${1 - click * 0.12})`;
    const last = [...clicks].reverse().find((c) => t >= c);
    const rip = last != null && t < last + 0.45 ? seg(t, last, 0.45) : 0;
    R.ripple.style.opacity = rip > 0 && rip < 1 ? 1 - rip : 0;
    R.ripple.style.transform = `translate(4px, 2.5px) scale(${lerp(0.3, 1.4, rip)})`;
  }

  return { meta: L.meta, build, frame };
}
