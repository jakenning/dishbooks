// Ops Calendar — "Your restaurant runs on weeks. Your books should too."
//
// Three pieces of the real Ops Calendar workflow, floating on their own rather
// than inside an app window (staging: Settings → Calendars, and the P&L's
// Columns option):
//
//   1. Calendars grid row — Operational Structure is switched from Months to 13-4
//   2. Year timeline — months (28–31 days, 4–5 weekends) re-cut into thirteen
//      28-day periods with exactly 4 weekends each, grouped 3-3-4-3 into quarters
//   3. Sales report — columns switched from Month to Operational Period: the
//      jagged month bars become even, comparable periods
//
// 10s seamless loop. This file is the story, shared by both layouts:
// scenes/ops-calendar (880 × 616) and scenes/ops-calendar-mobile (400 × 632)
// each call makeScene() with their own geometry. Timings are in CUES; company
// name, annual sales and seasonality come from the scenario JSON.

import { seg, ease, lerp, clamp, riseIn } from '../../lib/timeline.js';
import { icon } from '../../shared/icons.js';

const YEAR = 2026; // Jan 1, 2026 is a Thursday — matches the staging calendar
const FIRST_DOW = 3; // Mon = 0
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const STRUCTURES = ['13-4', '4-4-5', '4-5-4', '5-4-4', 'Months']; // app order
const QUARTERS = [3, 3, 4, 3]; // periods per quarter in the app's 13-4 calendar

// Share of a week's sales by weekday (Mon → Sun), by concept.
const WEEKDAYS = {
  default: [0.8, 0.82, 0.88, 0.98, 1.3, 1.4, 1.1],
  qsr: [0.92, 0.93, 0.95, 1.0, 1.12, 1.1, 0.98],
  'fast-casual': [0.95, 0.97, 0.98, 1.02, 1.1, 1.02, 0.9],
  'coffee-shops': [1.05, 1.04, 1.05, 1.04, 1.06, 0.98, 0.85],
  'fine-dining': [0.6, 0.75, 0.9, 1.05, 1.4, 1.5, 0.9],
  'bars-nightclubs': [0.45, 0.5, 0.7, 1.0, 1.75, 1.9, 0.8],
};

// Seconds. [start, duration] pairs unless noted.
export const CUES = {
  cal: 0.1, // Calendars row card
  tl: 0.25, // timeline card
  report: 0.4, // sales report card
  tlDraw: [0.45, 0.9],
  bars: [0.6, 0.8], // month bars draw alongside the timeline
  fiveFlags: 1.2, // months with 5 weekends get flagged (timeline and chart)
  dots: 1.3,
  cursorIn: [1.6, 0.2],
  toCell: [1.65, 0.55],
  cellClick: 2.25,
  selectOpen: [2.3, 0.18],
  toOption: [2.45, 0.35],
  optionHover: 2.72,
  optionClick: 3.0,
  selectClose: [3.05, 0.15],
  morph: [3.15, 1.0], // operational row: months → 13 periods
  quarters: [3.9, 0.45],
  cursorAway: [3.15, 0.5],
  cursorBack: [4.8, 0.2],
  toPill: [4.8, 0.55],
  pillClick: 5.4,
  menuOpen: [5.45, 0.18],
  toItem: [5.6, 0.45],
  itemHover: 5.92,
  itemClick: 6.15,
  menuClose: [6.2, 0.15],
  chartMorph: [6.3, 1.1],
  cursorOut: [6.35, 0.45],
  outro: [9.3, 0.55], // cards leave; t = 10 matches t = 0 (empty)
};

const CURSOR = `<svg viewBox="0 0 22 22"><path d="M4 2.5v15.2l4.1-3.9 2.7 6.1 2.6-1.1-2.7-6h5.7L4 2.5Z" fill="#0b0c0d" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const f1 = (v) => v.toFixed(1);
const axisMoney = (v) => (v >= 1e6 ? `$${+(v / 1e6).toFixed(2)}M` : `$${Math.round(v / 1e3)}K`);
const START = DAYS.map((_, m) => DAYS.slice(0, m).reduce((a, b) => a + b, 0));
const dow = (d) => (FIRST_DOW + d) % 7;
const dateLabel = (d) => {
  let m = 11;
  while (START[m] > d) m--;
  return `${MONTHS[m]} ${d - START[m] + 1}, ${YEAR}`;
};

// ---- Fictional daily sales -------------------------------------------------
// Seasonality from the scenario's monthly sales, smoothed across the year, times
// a weekday pattern. Months then differ by length and weekend count; 28-day
// periods don't — which is the whole point of the scene.
function dailySales(data) {
  const byName = Object.fromEntries(data.months.map((m, i) => [m, data.sales.thisPeriod[i]]));
  const raw = MONTHS.map((m) => byName[m] ?? 1);
  const mean = raw.reduce((a, b) => a + b, 0) / 12;
  const s = raw.map((v) => v / mean);
  const centres = START.map((st, m) => st + DAYS[m] / 2);
  const season = (d) => {
    const c = [centres[11] - 365, ...centres, centres[0] + 365];
    const v = [s[11], ...s, s[0]];
    let i = 0;
    while (c[i + 1] < d) i++;
    const p = (d - c[i]) / (c[i + 1] - c[i]);
    return lerp(v[i], v[i + 1], (1 - Math.cos(Math.PI * p)) / 2);
  };
  const week = WEEKDAYS[data.id] ?? WEEKDAYS.default;
  const days = Array.from({ length: 365 }, (_, d) => season(d) * week[dow(d)] * (1 + 0.04 * (d / 365)));
  const annual = data.kpis.find((k) => k.key === 'sales')?.value ?? 5e6;
  const k = annual / days.reduce((a, b) => a + b, 0);
  return days.map((v) => v * k);
}

function niceTicks(max, count = 3) {
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((v) => v >= raw);
  const top = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(v);
  return { top, ticks };
}

// ---- Timeline (card 2) ------------------------------------------------------
// TL: { w, x0, x1, fy, oy, bh, lbl (label baseline below a bar), qy (quarter
// bracket below a bar), H, five (dot offset left of a month label), stacked
// (row labels above the bars instead of to their left) }

function bar(TL, start, len, y, cls, extra = '') {
  const px = (TL.x1 - TL.x0) / 365;
  const x = TL.x0 + start * px;
  const w = len * px - 2;
  let stripes = '';
  for (let d = start; d < start + len; d++) {
    if (dow(d) < 5) continue;
    const wd = px - (d === start + len - 1 ? 2 : 0); // keep the 2px gap between bars
    if (wd > 0.3) stripes += `<rect class="wk" x="${f1(TL.x0 + d * px)}" y="${y}" width="${f1(wd)}" height="${TL.bh}"/>`;
  }
  return `<g class="${cls}" ${extra}><rect class="bg" x="${f1(x)}" y="${y}" width="${f1(w)}" height="${TL.bh}" rx="3"/>${stripes}</g>`;
}

function rowLabels(TL) {
  const { fy, oy } = TL;
  const sub = '28–31 days · 4–5 weekends';
  const sub2 = '28 days · 4 weekends each';
  if (TL.stacked) {
    // One line above each row: caption + value on the left, detail on the right.
    const line = (y, cap, valCls, subCls) =>
      `<g class="rowlbl"><text y="${y}"><tspan class="cap">${cap}</tspan><tspan class="${valCls}" dx="6">Months</tspan></text>` +
      `<text class="sub ${subCls}" x="${TL.w}" y="${y}" text-anchor="end">${sub}</text>` +
      (subCls ? `<text class="sub opsub2" x="${TL.w}" y="${y}" text-anchor="end">${sub2}</text>` : '') +
      `</g>`;
    return line(fy - 8, 'Fiscal', 'val', '') + line(oy - 8, 'Operational', 'val opval', 'opsub');
  }
  return `<g class="rowlbl"><text class="cap" x="0" y="${fy + 9}">Fiscal</text><text class="val" x="0" y="${fy + 26}">Months</text><text class="sub" x="0" y="${fy + 42}">${sub}</text></g>
    <g class="rowlbl"><text class="cap" x="0" y="${oy + 9}">Operational</text><text class="val opval" x="0" y="${oy + 26}">Months</text><text class="sub opsub" x="0" y="${oy + 42}">${sub}</text><text class="sub opsub2" x="0" y="${oy + 42}">${sub2}</text></g>`;
}

function timelineSvg(TL, fiscalSats) {
  const { fy, oy, bh, H } = TL;
  const px = (TL.x1 - TL.x0) / 365;
  const monthBars = (y, cls) => START.map((st, m) => bar(TL, st, DAYS[m], y, cls, `data-c="${(st + DAYS[m] / 2) / 365}"`)).join('');
  const periodBars = Array.from({ length: 13 }, (_, p) => bar(TL, p * 28, 28, oy, 'pbar', `data-c="${(p * 28 + 14) / 365}"`)).join('');
  const monthLabels = (y, cls) =>
    START.map((st, m) => {
      const cx = TL.x0 + (st + DAYS[m] / 2) * px;
      const five = fiscalSats[m] === 5;
      return `<g class="${cls}">${five ? `<circle class="five" cx="${f1(cx - TL.five)}" cy="${y - 4}" r="3"/>` : ''}<text x="${f1(cx + (five ? 3 : 0))}" y="${y}" text-anchor="middle">${MONTHS[m]}</text></g>`;
    }).join('');
  const periodLabels = Array.from({ length: 13 }, (_, p) => `<text class="plbl" x="${f1(TL.x0 + (p * 28 + 14) * px)}" y="${oy + bh + TL.lbl}" text-anchor="middle">P${p + 1}</text>`).join('');
  let qs = '';
  let p0 = 0;
  QUARTERS.forEach((n, q) => {
    const xa = TL.x0 + p0 * 28 * px + 1;
    const xb = TL.x0 + (p0 + n) * 28 * px - 3;
    const y = oy + bh + TL.qy;
    qs += `<g class="q"><path d="M${f1(xa)} ${y}v5H${f1(xb)}v-5"/><text x="${f1((xa + xb) / 2)}" y="${y + 19}" text-anchor="middle">Q${q + 1} · ${n} periods</text></g>`;
    p0 += n;
  });
  return `<svg class="tl-svg" width="${TL.w}" height="${H}" viewBox="0 0 ${TL.w} ${H}">
    <clipPath id="__ID__r"><rect class="reveal" x="0" y="0" width="0" height="${H}"/></clipPath>
    ${rowLabels(TL)}
    <g clip-path="url(#__ID__r)">
      ${monthBars(fy, 'fbar')}
      ${monthLabels(fy + bh + TL.lbl, 'flbl')}
      ${monthBars(oy, 'obar')}
      ${monthLabels(oy + bh + TL.lbl, 'olbl')}
    </g>
    ${periodBars}${periodLabels}${qs}
  </svg>`;
}

// ---- Sales chart (card 3) ---------------------------------------------------
// CH: { w, h, x0, x1, y0, y1 }

function chartSvg(CH, months, periods, fiscalSats) {
  const { top, ticks } = niceTicks(Math.max(...months, ...periods) * 1.04, 5);
  const y = (v) => CH.y1 - (v / top) * (CH.y1 - CH.y0);
  const slots = (n) => (CH.x1 - CH.x0) / n;
  const bars = (vals, cls) =>
    vals
      .map((v, i) => {
        const s = slots(vals.length);
        const bw = s * 0.56;
        const x = CH.x0 + s * i + (s - bw) / 2;
        return `<rect class="${cls}" x="${f1(x)}" width="${f1(bw)}" y="${CH.y1}" height="0" rx="2" data-h="${f1(CH.y1 - y(v))}" data-c="${(i + 0.5) / vals.length}"/>`;
      })
      .join('');
  const labels = (n, text, cls) =>
    Array.from({ length: n }, (_, i) => `<text class="${cls}" x="${f1(CH.x0 + slots(n) * (i + 0.5))}" y="${CH.h - 8}" text-anchor="middle">${text(i)}</text>`).join('');
  const dots = months
    .map((v, i) => (fiscalSats[i] === 5 ? `<circle class="five mdot" cx="${f1(CH.x0 + slots(12) * (i + 0.5))}" cy="${f1(y(v) - 9)}" r="3.5"/>` : ''))
    .join('');
  return `<svg class="ch-svg" width="${CH.w}" height="${CH.h}" viewBox="0 0 ${CH.w} ${CH.h}">
    <g class="grid">${ticks.map((v) => `<line x1="${CH.x0}" x2="${CH.x1}" y1="${f1(y(v))}" y2="${f1(y(v))}"/><text x="${CH.x0 - 8}" y="${f1(y(v) + 4)}" text-anchor="end">${axisMoney(v)}</text>`).join('')}</g>
    ${bars(months, 'mb')}${bars(periods, 'pb')}${dots}
    ${labels(12, (i) => MONTHS[i], 'xl xm')}${labels(13, (i) => `P${i + 1}`, 'xl xp')}
  </svg>`;
}

// ---- Markup -----------------------------------------------------------------

const opSelect = () => `<span class="selc op"><b class="opv">Months</b>${icon('caret-down', 'car')}</span>`;
const fiscalSelect = () => `<span class="selc">Months${icon('caret-down', 'car')}</span>`;
const endCell = () => `<span class="end"><b class="endv">${dateLabel(364)}</b></span>`;

function calendarCard(L, data) {
  const rs = `<div class="rs">${STRUCTURES.map((s) => `<div class="rs-i${s === 'Months' ? ' sel' : ''}">${s}${s === 'Months' ? icon('check', 'tick') : ''}</div>`).join('')}</div>`;
  if (L.compact) {
    // Phone: the year/entity columns become a row header above the grid.
    return `<div class="card cal">
      <div class="yh">${icon('caret-right', 'chev')}<span class="yr">${YEAR}</span><span class="ent">${esc(data.company.name)}</span></div>
      <div class="gr gh"><span>Fiscal Structure</span><span>Operational Structure</span><span>Operational End</span></div>
      <div class="gr row">${fiscalSelect()}${opSelect()}${endCell()}</div>
      ${rs}
    </div>`;
  }
  return `<div class="card cal">
    <div class="gr gh"><span>Year</span><span>Entity</span><span>Fiscal Structure</span><span>Operational Structure</span><span>Operational Start</span><span>Operational End</span></div>
    <div class="gr row">
      <span class="yr">${icon('caret-right', 'chev')}${YEAR}</span>
      <span class="ent">${esc(data.company.name)}</span>
      ${fiscalSelect()}${opSelect()}
      <span>${dateLabel(0)}</span>
      ${endCell()}
    </div>
    ${rs}
  </div>`;
}

function reportHead(L) {
  const title = `<div class="ct">Total Sales by <b class="by">Month</b></div>`;
  const columns = `<span class="chip"><em>Columns</em><b class="colv">Month</b>${icon('caret-down', 'car')}</span>`;
  if (L.compact) {
    return `<div class="ch">${title}<span class="when">This year, ${YEAR}</span></div><div class="chips">${columns}</div>`;
  }
  return `<div class="ch">${title}<div class="chips"><span class="chip"><em>Date range</em>This year, ${YEAR}</span>${columns}</div></div>`;
}

// ---- Scene ------------------------------------------------------------------
// L: { meta, compact, touch, tl: TL, ch: CH, legendFive, f1, f2, cursor: { start, away, rest } }
// touch: show a fingertip at each tap instead of a gliding mouse pointer.

export function makeScene(L) {
  const { tl: TL, ch: CH } = L;
  let R;
  let root;

  function build(el, data) {
    root = el;
    el.classList.add('db-anim', 'opc');
    if (L.compact) el.classList.add('m');
    window.__opcN = (window.__opcN ?? 0) + 1;
    const id = `opc${window.__opcN}`;

    const daily = dailySales(data);
    const months = START.map((st, m) => daily.slice(st, st + DAYS[m]).reduce((a, b) => a + b, 0));
    const periods = Array.from({ length: 13 }, (_, p) => daily.slice(p * 28, p * 28 + 28).reduce((a, b) => a + b, 0));
    const sats = START.map((st, m) => Array.from({ length: DAYS[m] }, (_, i) => st + i).filter((d) => dow(d) === 5).length);

    el.innerHTML = `
    ${calendarCard(L, data)}
    <div class="card tl">
      <div class="ch"><div class="ct">${YEAR} calendar</div><div class="legend"><span><i class="lw"></i>Weekend</span><span><i class="lf"></i>${L.legendFive}</span></div></div>
      ${timelineSvg(TL, sats).replaceAll('__ID__', id)}
    </div>
    <div class="card rep">
      ${reportHead(L)}
      ${chartSvg(CH, months, periods, sats)}
      <div class="foot"><span class="f1"><i class="lf"></i>${L.f1}</span><span class="f2">${icon('check', 'ok')}${L.f2}</span></div>
      <div class="menu">
        <div class="mi">Total</div><div class="mi">Entity</div><div class="mi">Location</div><div class="mi cur">Month</div>
        <div class="mg">Fiscal Calendar</div><div class="mi">Period</div><div class="mi">Quarter</div><div class="mi">Year</div>
        <div class="mg">Operational Calendar</div><div class="mi target">Period</div><div class="mi">Quarter</div><div class="mi">Year</div>
      </div>
    </div>
    <div class="cursor${L.touch ? ' touch' : ''}"><div class="ripple"></div>${L.touch ? '<div class="tip"></div>' : CURSOR}</div>`;

    const q = (s) => el.querySelector(s);
    const qa = (s) => [...el.querySelectorAll(s)];
    R = {
      cal: q('.cal'),
      tl: q('.tl'),
      rep: q('.rep'),
      opCell: q('.selc.op'),
      opv: q('.opv'),
      endv: q('.endv'),
      end: q('.end'),
      rs: q('.rs'),
      rsItems: qa('.rs-i'),
      reveal: q('.tl-svg .reveal'),
      fiveTl: qa('.tl-svg .five'),
      obars: qa('.obar'),
      olbl: qa('.olbl'),
      pbars: qa('.pbar'),
      plbl: qa('.plbl'),
      qs: qa('.q'),
      opval: q('.opval'),
      opsub: q('.opsub'),
      opsub2: q('.opsub2'),
      by: q('.by'),
      colv: q('.colv'),
      pill: q('.colv').parentElement,
      menu: q('.menu'),
      menuCur: q('.mi.cur'),
      menuTarget: q('.mi.target'),
      mb: qa('.mb'),
      pb: qa('.pb'),
      mdots: qa('.mdot'),
      xm: qa('.xm'),
      xp: qa('.xp'),
      f1: q('.f1'),
      f2: q('.f2'),
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
    // The structure list drops down from the cell being edited.
    R.rs.style.left = `${R.opCell.offsetLeft}px`;
    R.rs.style.top = `${R.opCell.parentElement.offsetTop + R.opCell.offsetHeight}px`;
    // Popups are display:none at rest; measure them open.
    R.rs.style.display = 'block';
    R.menu.style.display = 'block';
    const g = {
      ...L.cursor,
      cell: at(R.opCell, 0.4),
      option: at(R.rsItems[0], 0.3),
      pill: at(R.pill, 0.55),
      item: at(R.menuTarget, 0.3),
    };
    R.rs.style.display = '';
    R.menu.style.display = '';
    return g;
  }

  const mix = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) });
  const pulse = (t, at) => seg(t, at - 0.06, 0.06) - seg(t, at + 0.04, 0.12);
  const popup = (el, t, [start, dur], close) => {
    const open = ease.outCubic(seg(t, start, dur)) * (1 - seg(t, close[0], close[1]));
    el.style.display = open > 0.001 ? 'block' : 'none';
    el.style.opacity = open;
    el.style.transform = `translateY(${lerp(-4, 0, open).toFixed(2)}px)`;
  };
  /** Squash a bar group vertically about its centre (k = 0 hidden, 1 full). */
  const squash = (g, y, k) => g.setAttribute('transform', `translate(0 ${f1(y + TL.bh / 2)}) scale(1 ${k.toFixed(3)}) translate(0 ${f1(-(y + TL.bh / 2))})`);

  function frame(t) {
    // Layout is only measurable once the stage is rendered (an embed can start
    // out hidden, e.g. the desktop version on a phone breakpoint).
    const G = R.geo ?? measure();
    if (root.offsetWidth) R.geo = G;
    const C = CUES;
    const outro = (i) => ease.inOutCubic(seg(t, C.outro[0] + i * 0.08, C.outro[1] - 0.16));

    // ---- Cards in / out ----------------------------------------------------------
    [
      [R.cal, C.cal],
      [R.tl, C.tl],
      [R.rep, C.report],
    ].forEach(([el, at], i) => {
      const p = riseIn(el, t, at, { dy: 16, dur: 0.55 });
      const o = outro(i);
      el.style.opacity = p * (1 - o);
      el.style.transform = `translateY(${lerp(16, 0, p) - o * 10}px)`;
    });

    // ---- 1. Operational Structure: Months → 13-4 ------------------------------
    // The 13-4 calendar ends a day early (Dec 30); Dec 31 starts next year's P1.
    const chosen = t >= C.optionClick;
    R.opv.textContent = chosen ? '13-4' : 'Months';
    R.endv.textContent = dateLabel(chosen ? 363 : 364);
    R.end.style.setProperty('--flash', chosen ? 1 - seg(t, C.optionClick + 0.1, 1.2) : 0);
    R.opCell.classList.toggle('editing', t >= C.cellClick && t < C.selectClose[0] + C.selectClose[1]);
    popup(R.rs, t, C.selectOpen, C.selectClose);
    R.rsItems.forEach((el, i) => el.classList.toggle('hi', t < C.optionHover ? i === 4 : i === 0));

    // ---- 2. Timeline ------------------------------------------------------------
    R.reveal.setAttribute('width', (TL.w * ease.inOutCubic(seg(t, ...C.tlDraw))).toFixed(1));
    R.fiveTl.forEach((d) => (d.style.opacity = seg(t, C.fiveFlags, 0.3)));
    const [m0, md] = C.morph;
    R.obars.forEach((g, i) => {
      const c = Number(g.dataset.c);
      const k = 1 - ease.inCubic(seg(t, m0 + c * md * 0.55, 0.3));
      squash(g, TL.oy, k);
      R.olbl[i].style.opacity = k;
    });
    R.pbars.forEach((g, i) => {
      const c = Number(g.dataset.c);
      const k = ease.outBack(seg(t, m0 + 0.18 + c * md * 0.55, 0.4));
      squash(g, TL.oy, Math.max(0, k));
      g.style.opacity = clamp(k * 3);
      R.plbl[i].style.opacity = clamp(k);
    });
    R.qs.forEach((q, i) => riseIn(q, t, C.quarters[0] + i * 0.08, { dy: -4, dur: C.quarters[1] }));
    const swapped = t >= m0 + 0.3;
    R.opval.textContent = swapped ? '13-4' : 'Months';
    R.opval.classList.toggle('on', swapped);
    R.opsub.style.opacity = 1 - seg(t, m0 + 0.2, 0.3);
    R.opsub2.style.opacity = seg(t, m0 + 0.5, 0.4);

    // ---- 3. Report: Month → Operational Period ---------------------------------
    const [c0, cd] = C.chartMorph;
    R.mb.forEach((b) => {
      const c = Number(b.dataset.c);
      const grow = ease.outCubic(seg(t, C.bars[0] + c * C.bars[1] * 0.5, 0.45));
      const fall = ease.inCubic(seg(t, c0 + c * cd * 0.35, 0.3));
      const h = Number(b.dataset.h) * grow * (1 - fall);
      b.setAttribute('y', (CH.y1 - h).toFixed(2));
      b.setAttribute('height', h.toFixed(2));
    });
    R.pb.forEach((b) => {
      const c = Number(b.dataset.c);
      const h = Number(b.dataset.h) * ease.outBack(seg(t, c0 + 0.3 + c * cd * 0.4, 0.45), 1.1);
      b.setAttribute('y', (CH.y1 - h).toFixed(2));
      b.setAttribute('height', Math.max(0, h).toFixed(2));
    });
    const dotsOn = seg(t, C.dots, 0.3) * (1 - seg(t, c0, 0.25));
    R.mdots.forEach((d) => (d.style.opacity = dotsOn));
    const lbl = seg(t, c0 + 0.25, 0.35);
    R.xm.forEach((x) => (x.style.opacity = 1 - lbl));
    R.xp.forEach((x) => (x.style.opacity = lbl));
    const colSwapped = t >= C.itemClick;
    R.by.textContent = colSwapped ? 'Period' : 'Month';
    R.colv.textContent = colSwapped ? 'Operational · Period' : 'Month';
    R.pill.classList.toggle('editing', t >= C.pillClick && t < C.menuClose[0] + C.menuClose[1]);
    popup(R.menu, t, C.menuOpen, C.menuClose);
    R.menuCur.classList.toggle('hi', t < C.itemHover);
    R.menuTarget.classList.toggle('hi', t >= C.itemHover);
    R.f1.style.opacity = dotsOn;
    R.f2.style.opacity = seg(t, c0 + cd * 0.7, 0.35);

    // ---- Cursor -----------------------------------------------------------------
    const clicks = [C.cellClick, C.optionClick, C.pillClick, C.itemClick];
    const click = Math.max(...clicks.map((c) => pulse(t, c)));
    const last = [...clicks].reverse().find((c) => t >= c);
    const rip = last != null && t < last + 0.45 ? seg(t, last, 0.45) : 0;
    R.ripple.style.opacity = rip > 0 && rip < 1 ? 1 - rip : 0;
    if (L.touch) {
      // A fingertip lands on each control just before its tap and lifts after.
      const taps = [G.cell, G.option, G.pill, G.item];
      const i = clicks.reduce((b, c, j) => (Math.abs(t - c) < Math.abs(t - clicks[b]) ? j : b), 0);
      const at = clicks[i];
      R.cursor.style.opacity = seg(t, at - 0.3, 0.14) * (1 - seg(t, at + 0.15, 0.25));
      R.cursor.style.transform = `translate(${taps[i].x.toFixed(1)}px, ${taps[i].y.toFixed(1)}px) scale(${1 - click * 0.18})`;
      R.ripple.style.transform = `scale(${lerp(0.5, 1.6, rip)})`;
      return;
    }
    let pos;
    let vis;
    if (t < C.cursorBack[0]) {
      pos = mix(G.start, G.cell, ease.inOutCubic(seg(t, ...C.toCell)));
      pos = mix(pos, G.option, ease.inOutCubic(seg(t, ...C.toOption)));
      pos = mix(pos, G.away, ease.inOutCubic(seg(t, ...C.cursorAway)));
      vis = seg(t, ...C.cursorIn) * (1 - seg(t, C.cursorAway[0] + 0.15, 0.3));
    } else {
      pos = mix(G.away, G.pill, ease.inOutCubic(seg(t, ...C.toPill)));
      pos = mix(pos, G.item, ease.inOutCubic(seg(t, ...C.toItem)));
      pos = mix(pos, G.rest, ease.inOutCubic(seg(t, ...C.cursorOut)));
      vis = seg(t, ...C.cursorBack) * (1 - seg(t, C.cursorOut[0] + 0.15, 0.3));
    }
    R.cursor.style.opacity = vis;
    R.cursor.style.transform = `translate(${(pos.x - 4).toFixed(1)}px, ${(pos.y - 2.5).toFixed(1)}px) scale(${1 - click * 0.12})`;
    R.ripple.style.transform = `translate(4px, 2.5px) scale(${lerp(0.3, 1.4, rip)})`;
  }

  return { meta: L.meta, build, frame };
}
