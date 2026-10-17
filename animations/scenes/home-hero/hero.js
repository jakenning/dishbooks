// Homepage hero — the whole product in one loop.
//
// The app in one fixed window, like Why DishBooks (no camera moves): the
// cursor walks the sidebar and each page loads in place.
//
//   Home        KPI cards count up, sales chart and cost breakdown draw
//   Settings →  Operational Structure goes from Months to 13-4: the year re-cuts
//   Calendars   into thirteen 28-day periods, and Total Sales goes from jagged
//               months to even periods
//   Reports →   Prime Cost P&L by location; COGS opens into the company's own
//               categories and the location that's off gets flagged
//   Ask Dex     the question about that location, answer streams in
//   → back to Home (seamless 14s loop: t = 14 is the empty page t = 0 starts on)
//
// This file is the story, shared by both layouts: scenes/home-hero (1280 × 720
// desktop window) and scenes/home-hero-mobile (400 × 720, the app's phone
// layout with a drawer menu). Home, the P&L and Dex are the Why DishBooks
// components (../why-dishbooks/app.js); the Calendars page is drawn here, after
// scenes/ops-calendar. render.mjs bundles every module into one scope, so the
// names below stay clear of app.js's.

import { seg, ease, lerp, clamp, riseIn, countUp } from '../../lib/timeline.js';
import { icon } from '../../shared/icons.js';
import { NAV, MARK, CURSOR, COG, SUN, MENU, esc, kMoney, pct, f1, axisMoney, model, homeView, plView, answerHtml } from '../why-dishbooks/app.js';

// Seconds. [start, duration] pairs unless noted. `go*` are the clicks that
// change page; the page swap and the nav highlight follow each one.
export const HCUES = {
  kpis: 0.05, // Home loads (t = 0 is an empty page, like t = 14)
  kpiStagger: 0.07,
  countDur: 1.3,
  chartDraw: [0.35, 1.1],
  toRest: [0.25, 0.7], // cursor eases off the nav into the page
  toCal: [1.95, 0.55],
  goCal: 2.6, // Settings → Calendars
  tlDraw: [2.9, 0.8], // the year timeline draws
  monthBars: [3.0, 0.7], // Total Sales by month grows
  fiveFlags: 3.55, // months with 5 weekends get a dot
  toCell: [3.15, 0.55],
  cellClick: 3.8, // Operational Structure
  selectOpen: [3.85, 0.18],
  toOption: [3.95, 0.3],
  optionHover: 4.15,
  optionClick: 4.4, // 13-4
  selectClose: [4.45, 0.15],
  calRest: [4.55, 0.55], // cursor steps off the grid so the morph is clear
  morph: [4.55, 0.9], // operational row: months → 13 periods
  quarters: [5.15, 0.4],
  chartMorph: [4.65, 1.0], // month bars → period bars
  toReports: [5.75, 0.45],
  goReports: 6.3,
  toCogs: [6.7, 0.45],
  cogs: 7.25,
  cats: [7.3, 0.55], // COGS opens into the categories
  flag: 7.95, // the location that's off lights up
  toDex: [8.2, 0.5],
  goDex: 8.8,
  dexIn: [8.85, 0.35],
  typeAsk: [9.15, 0.5],
  send: 9.75,
  thinking: [9.8, 0.3],
  answer: [10.1, 1.4],
  dexRest: [9.2, 0.6], // cursor steps out of the panel while Dex answers
  toHome: [12.0, 0.55],
  goHome: 12.65, // Dex closes, the page clears; t = 14 → t = 0
  // Phone only: the menu button is tapped this long before each nav tap.
  menuLead: 0.55,
};

// Page per nav click: [click time, nav index, page index]. Page 0 Home, 1 Calendars, 2 P&L.
const HPAGES = [
  ['Home', ''],
  ['Calendars', 'Settings'],
  ['Prime Cost P&amp;L', 'Reports'],
];
const HSTOPS = [
  [HCUES.goCal, 7, 1],
  [HCUES.goReports, 5, 2],
  [HCUES.goHome, 0, 0],
];

// ---- Calendar (after scenes/ops-calendar/opscal.js) --------------------------------

const YEAR = 2026; // Jan 1, 2026 is a Thursday — matches the staging calendar
const FIRST_DOW = 3; // Mon = 0
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const START = DAYS.map((_, m) => DAYS.slice(0, m).reduce((a, b) => a + b, 0));
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
const dow = (d) => (FIRST_DOW + d) % 7;
const dateLabel = (d) => {
  let m = 11;
  while (START[m] > d) m--;
  return `${MONTHS[m]} ${d - START[m] + 1}, ${YEAR}`;
};

// Seasonality from the scenario's monthly sales, smoothed across the year, times
// a weekday pattern, scaled so the year adds up to the sales KPI. Months then
// differ by length and weekend count; 28-day periods don't.
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

function zeroTicks(max, count) {
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((v) => v >= raw);
  const top = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(v);
  return { top, ticks };
}

// TL: { w, x0, x1, fy, oy, bh, lbl (label baseline below a bar), qy (quarter
// bracket below a bar), H, five (dot offset left of a month label), stacked
// (row labels above the bars instead of to their left) }
function tlBar(TL, start, len, y, cls, extra = '') {
  const px = (TL.x1 - TL.x0) / 365;
  const w = len * px - 2;
  let stripes = '';
  for (let d = start; d < start + len; d++) {
    if (dow(d) < 5) continue;
    const wd = px - (d === start + len - 1 ? 2 : 0); // keep the 2px gap between bars
    if (wd > 0.3) stripes += `<rect class="wk" x="${f1(TL.x0 + d * px)}" y="${y}" width="${f1(wd)}" height="${TL.bh}"/>`;
  }
  return `<g class="${cls}" ${extra}><rect class="bg" x="${f1(TL.x0 + start * px)}" y="${y}" width="${f1(w)}" height="${TL.bh}" rx="3"/>${stripes}</g>`;
}

function tlLabels(TL) {
  const { fy, oy } = TL;
  const sub = '28–31 days · 4–5 weekends';
  const sub2 = '28 days · 4 weekends each';
  if (TL.stacked) {
    const line = (y, cap, valCls, op) =>
      `<g class="rowlbl"><text y="${y}"><tspan class="cap">${cap}</tspan><tspan class="${valCls}" dx="6">Months</tspan></text>` +
      `<text class="sub${op ? ' opsub' : ''}" x="${TL.w}" y="${y}" text-anchor="end">${sub}</text>` +
      (op ? `<text class="sub opsub2" x="${TL.w}" y="${y}" text-anchor="end">${sub2}</text>` : '') +
      `</g>`;
    return line(fy - 8, 'Fiscal', 'val', false) + line(oy - 8, 'Operational', 'val opval', true);
  }
  return `<g class="rowlbl"><text class="cap" x="0" y="${fy + 9}">Fiscal</text><text class="val" x="0" y="${fy + 26}">Months</text><text class="sub" x="0" y="${fy + 42}">${sub}</text></g>
    <g class="rowlbl"><text class="cap" x="0" y="${oy + 9}">Operational</text><text class="val opval" x="0" y="${oy + 26}">Months</text><text class="sub opsub" x="0" y="${oy + 42}">${sub}</text><text class="sub opsub2" x="0" y="${oy + 42}">${sub2}</text></g>`;
}

function timelineSvg(TL, sats, id) {
  const { fy, oy, bh, H } = TL;
  const px = (TL.x1 - TL.x0) / 365;
  const monthBars = (y, cls) => START.map((st, m) => tlBar(TL, st, DAYS[m], y, cls, `data-c="${(st + DAYS[m] / 2) / 365}"`)).join('');
  const periodBars = Array.from({ length: 13 }, (_, p) => tlBar(TL, p * 28, 28, oy, 'pbar', `data-c="${(p * 28 + 14) / 365}"`)).join('');
  const monthLabels = (y, cls) =>
    START.map((st, m) => {
      const cx = TL.x0 + (st + DAYS[m] / 2) * px;
      const five = sats[m] === 5;
      return `<g class="${cls}">${five ? `<circle class="five" cx="${f1(cx - TL.five)}" cy="${y - 4}" r="3"/>` : ''}<text x="${f1(cx + (five ? 3 : 0))}" y="${y}" text-anchor="middle">${MONTHS[m]}</text></g>`;
    }).join('');
  const periodLabels = Array.from({ length: 13 }, (_, p) => `<text class="plbl" x="${f1(TL.x0 + (p * 28 + 14) * px)}" y="${oy + bh + TL.lbl}" text-anchor="middle">P${p + 1}</text>`).join('');
  let qs = '';
  let p0 = 0;
  QUARTERS.forEach((n, q) => {
    const xa = TL.x0 + p0 * 28 * px + 1;
    const xb = TL.x0 + (p0 + n) * 28 * px - 3;
    const y = oy + bh + TL.qy;
    qs += `<g class="q"><path d="M${f1(xa)} ${y}v5H${f1(xb)}v-5"/><text x="${f1((xa + xb) / 2)}" y="${y + 19}" text-anchor="middle">Q${q + 1}${TL.stacked ? '' : ` · ${n} periods`}</text></g>`;
    p0 += n;
  });
  return `<svg class="tl-svg" width="${TL.w}" height="${H}" viewBox="0 0 ${TL.w} ${H}">
    <clipPath id="${id}r"><rect class="reveal" x="0" y="0" width="0" height="${H}"/></clipPath>
    ${tlLabels(TL)}
    <g clip-path="url(#${id}r)">${monthBars(fy, 'fbar')}${monthLabels(fy + bh + TL.lbl, 'flbl')}${monthBars(oy, 'obar')}${monthLabels(oy + bh + TL.lbl, 'olbl')}</g>
    ${periodBars}${periodLabels}${qs}
  </svg>`;
}

// CH: { w, h, x0, x1, y0, y1 }
function periodChart(CH, months, periods, sats) {
  const { top, ticks } = zeroTicks(Math.max(...months, ...periods) * 1.04, CH.h < 160 ? 3 : 4);
  const y = (v) => CH.y1 - (v / top) * (CH.y1 - CH.y0);
  const slot = (n) => (CH.x1 - CH.x0) / n;
  const bars = (vals, cls) =>
    vals
      .map((v, i) => {
        const s = slot(vals.length);
        const bw = s * 0.56;
        return `<rect class="${cls}" x="${f1(CH.x0 + s * i + (s - bw) / 2)}" width="${f1(bw)}" y="${CH.y1}" height="0" rx="2" data-h="${f1(CH.y1 - y(v))}" data-c="${(i + 0.5) / vals.length}"/>`;
      })
      .join('');
  const labels = (n, text, cls) => Array.from({ length: n }, (_, i) => `<text class="${cls}" x="${f1(CH.x0 + slot(n) * (i + 0.5))}" y="${CH.h - 6}" text-anchor="middle">${text(i)}</text>`).join('');
  const dots = months.map((v, i) => (sats[i] === 5 ? `<circle class="five mdot" cx="${f1(CH.x0 + slot(12) * (i + 0.5))}" cy="${f1(y(v) - 9)}" r="3.5"/>` : '')).join('');
  return `<svg class="ch-svg" width="${CH.w}" height="${CH.h}" viewBox="0 0 ${CH.w} ${CH.h}">
    <g class="grid">${ticks.map((v) => `<line x1="${CH.x0}" x2="${CH.x1}" y1="${f1(y(v))}" y2="${f1(y(v))}"/><text x="${CH.x0 - 8}" y="${f1(y(v) + 4)}" text-anchor="end">${v ? axisMoney(v) : '$0'}</text>`).join('')}</g>
    ${bars(months, 'mb')}${bars(periods, 'pb')}${dots}
    ${labels(12, (i) => MONTHS[i], 'xl xm')}${labels(13, (i) => `P${i + 1}`, 'xl xp')}
  </svg>`;
}

function calView(D, L, id) {
  const daily = dailySales(D);
  const months = START.map((st, m) => daily.slice(st, st + DAYS[m]).reduce((a, b) => a + b, 0));
  const periods = Array.from({ length: 13 }, (_, p) => daily.slice(p * 28, p * 28 + 28).reduce((a, b) => a + b, 0));
  const sats = START.map((st, m) => Array.from({ length: DAYS[m] }, (_, i) => st + i).filter((d) => dow(d) === 5).length);
  const op = `<span class="selc op"><b class="opv">Months</b>${icon('caret-down', 'car')}</span>`;
  const fiscal = `<span class="selc">Months${icon('caret-down', 'car')}</span>`;
  const end = `<span class="end"><b class="endv">${dateLabel(364)}</b></span>`;
  const rs = `<div class="rs">${STRUCTURES.map((s) => `<div class="rs-i">${s}${s === 'Months' ? icon('check', 'tick') : ''}</div>`).join('')}</div>`;
  // Phone: the year/entity columns become a row header above the grid.
  const grid = L.compact
    ? `<div class="yh">${icon('caret-right', 'chev')}<span class="yr">${YEAR}</span><span class="ent">${esc(D.company.name)}</span></div>
      <div class="gr gh"><span>Fiscal Structure</span><span>Operational Structure</span><span>Operational End</span></div>
      <div class="gr grow2">${fiscal}${op}${end}</div>`
    : `<div class="gr gh"><span>Year</span><span>Entity</span><span>Fiscal Structure</span><span>Operational Structure</span><span>Operational Start</span><span>Operational End</span></div>
      <div class="gr grow2"><span class="yr">${icon('caret-right', 'chev')}${YEAR}</span><span class="ent">${esc(D.company.name)}</span>${fiscal}${op}<span>${dateLabel(0)}</span>${end}</div>`;
  return `<section class="view calv">
    <div class="card calg">${grid}${rs}</div>
    <div class="card tlc">
      <div class="ch"><div class="ct">${YEAR} calendar</div><div class="lgd"><span><i class="lw"></i>Weekend</span><span><i class="lf"></i>${L.compact ? '5 weekends' : 'Month with 5 weekends'}</span></div></div>
      ${timelineSvg(L.tl, sats, id)}
    </div>
    <div class="card repc">
      <div class="ch"><div class="ct">Total Sales by <b class="by">Month</b></div><span class="sel">${YEAR}${icon('caret-down', 'car')}</span></div>
      ${periodChart(L.ch, months, periods, sats)}
      <div class="foot"><span class="f1"><i class="lf"></i>${L.compact ? 'Months: 28–31 days, 4–5 weekends' : 'Month totals swing with 28–31 days and 4–5 weekends'}</span><span class="f2">${icon('check', 'ok')}${L.compact ? 'Every period: 28 days, 4 weekends' : 'Every period: 28 days, 4 weekends — compare like for like'}</span></div>
    </div>
  </section>`;
}

// ---- Scene ----------------------------------------------------------------------------
// L: { meta, startAt, compact, touch, sales, donut, tl, ch, rest, calRest, dexRoom, dexRest }
//   startAt: where in the story t = 0 falls (s). The loop is seamless, so the
//            timeline is just rotated: the video's first frame, which Webflow
//            uses as the poster, shows the dashboard loaded. HCUES stay in
//            story time.
//   compact: the app's phone layout (top bar + drawer instead of a sidebar)
//   touch:   a fingertip at each tap instead of a gliding mouse pointer

export function makeHero(L) {
  let R;
  let root;
  let D;
  let N;

  function build(el, data) {
    root = el;
    D = data;
    N = model(data);
    el.classList.add('db-anim', 'wdb', 'hh');
    if (L.compact) el.classList.add('m');
    window.__hhN = (window.__hhN ?? 0) + 1;
    const id = `hh${window.__hhN}`;
    const u = data.user;

    el.innerHTML = `
    ${L.compact ? `<div class="mbar"><span class="menu">${MENU}</span><div class="logo">${MARK.replaceAll('__ID__', `${id}t`)}<span>DishBooks</span></div><span class="av">${esc(u.initials)}</span></div>` : '<div class="chrome"><i></i><i></i><i></i></div>'}
    <div class="main">
      <header class="top">
        <div class="tt"><span class="crumb"></span><h5 class="ttl"></h5></div>
        ${L.compact ? '' : `<span class="pill">${icon('calendar')}${esc(data.period)}${icon('caret-down', 'car')}</span><span class="chip">${icon('map-pin')}${esc(data.company.scopeLabel)}</span>`}
      </header>
      <div class="views">${homeView(data, L, id)}${calView(data, L, id)}${plView(data, L, N)}</div>
    </div>
    ${L.compact ? '<div class="scrim"></div>' : ''}
    <nav class="side">
      <div class="logo">${MARK.replaceAll('__ID__', id)}<span>DishBooks</span></div>
      <div class="org">
        <div class="org-row"><span class="ib">${icon('buildings')}</span><span class="org-name">${esc(data.company.name)}</span>${icon('caret-down', 'car')}</div>
        <div class="org-row"><span class="ib">${icon('map-pin')}</span><span class="org-name">${esc(data.company.scopeLabel)}</span>${icon('caret-down', 'car')}</div>
      </div>
      <div class="items"><i class="nhl"></i>${NAV.map(([ic, label, more]) => `<div class="ni"><span class="ib">${ic === 'cog' ? COG : icon(ic)}</span><span class="nl">${esc(label)}</span>${more ? icon('caret-down', 'car') : ''}</div>`).join('')}</div>
      <div class="grow"></div>
      <div class="setup"><div><b>Setup</b><span>3/4</span></div><i><i></i></i></div>
      <div class="dex-btn"><div class="dex-btn-in"><span>Ask Dex</span><span class="ai">AI</span></div></div>
      <div class="me"><span class="av">${esc(u.initials)}</span><span class="me-name">${esc(u.firstName)} ${esc(u.lastName)}</span><span class="mode">${SUN}</span></div>
    </nav>
    <aside class="dex">
      <header><span class="orb"></span><b>Dex</b><span class="ai">AI</span><span class="grow"></span>${icon('x')}</header>
      <div class="dex-body">
        <div class="msg"><span class="orb sm"></span><div class="dex-message"><p>Hi ${esc(u.firstName)}, ask me anything about your numbers.</p></div></div>
        <div class="bubble">${esc(data.dex.ask)}</div>
        <div class="msg ans"><span class="orb sm"></span><div class="dex-message">${answerHtml(data.dex.answer)}<div class="dots"><i></i><i></i><i></i></div></div></div>
      </div>
      <footer><div class="input"><span class="typed"></span><span class="caret"></span><span class="ph">Ask Dex about your numbers…</span><span class="send">${icon('paper-plane-right')}</span></div></footer>
    </aside>
    <div class="cursor${L.touch ? ' touch' : ''}"><div class="ripple"></div>${L.touch ? '<div class="tip"></div>' : CURSOR}</div>`;

    const q = (s) => el.querySelector(s);
    const qa = (s) => [...el.querySelectorAll(s)];
    const kpis = L.compact ? data.kpis.filter((k) => k.key !== 'ebitda') : data.kpis;
    const shown = qa('.pl .th > span:not(.lb)').length;
    R = {
      viewsEl: q('.views'),
      views: qa('.view'),
      ttl: q('.ttl'),
      crumb: q('.crumb'),
      tt: q('.tt'),
      side: q('.side'),
      scrim: q('.scrim'),
      menu: q('.menu'),
      nis: qa('.ni'),
      nhl: q('.nhl'),
      dexBtn: q('.dex-btn'),
      dexBtnIn: q('.dex-btn-in'),
      // Home
      kpis: qa('.kpi').map((k, i) => ({ el: k, kv: k.querySelector('.kv'), rv: k.querySelector('.rv'), d: kpis[i] })),
      salesp: q('.salesp'),
      salesRv: q('.sales .rv'),
      cost: q('.cost'),
      slices: qa('.slice'),
      dc: q('.dc'),
      costItems: qa('.cl li'),
      // Calendars
      calCards: qa('.calv > .card'),
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
      mb: qa('.mb'),
      pb: qa('.pb'),
      mdots: qa('.mdot'),
      xm: qa('.xm'),
      xp: qa('.xp'),
      f1: q('.f1'),
      f2: q('.f2'),
      // P&L
      tiles: qa('.tile'),
      plc: q('.plc'),
      plRows: qa('.pt > .tr:not(.th)'),
      cogs: q('.tr.cogs'),
      tw: q('.tw'),
      cats: q('.cats'),
      cin: q('.cin'),
      crs: qa('.cr'),
      fls: qa('.pt .fl'),
      // Dex
      dex: q('.dex'),
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
    // Category $ values are static text; the line items count up in frame().
    R.plVals = R.plRows.map((r) => ({ k: r.dataset.row, cells: [...r.children].slice(1) }));
    R.colData = (L.compact ? (N.cols.length > 1 ? [N.cols[Math.max(0, N.flagRow)], N.cols[N.cols.length - 1]] : N.cols) : N.cols).slice(0, shown);
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
    // The structure list drops down from the cell being edited; it is
    // display:none at rest, so measure it open.
    R.rs.style.left = `${R.opCell.offsetLeft}px`;
    R.rs.style.top = `${R.opCell.parentElement.offsetTop + R.opCell.offsetHeight}px`;
    R.rs.style.display = 'block';
    const nav = (i) => at(R.nis[i], L.compact ? 0.3 : 0.32);
    const g = {
      navY: R.nis.map((n) => n.offsetTop),
      navH: R.nis[0].offsetHeight,
      cats: R.cin.offsetHeight,
      home: nav(0),
      settings: nav(7),
      reports: nav(5),
      cell: at(R.opCell, 0.4),
      option: at(R.rsItems[0], 0.3),
      cogs: at(R.cogs, L.compact ? 0.12 : 0.08),
      dex: at(R.dexBtn, 0.42, 0.6),
      menu: R.menu ? at(R.menu, 0.5, 0.5) : null,
      rest: L.rest,
      calRest: L.calRest,
      dexRest: L.dexRest,
    };
    R.rs.style.display = '';
    return g;
  }

  const mix = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) });
  const pulse = (t, at) => seg(t, at - 0.06, 0.06) - seg(t, at + 0.04, 0.12);
  const show = (el, v) => {
    el.style.opacity = v;
    el.style.visibility = v <= 0.001 ? 'hidden' : 'visible';
  };
  /** Squash a timeline bar group vertically about its centre (k = 0 hidden, 1 full). */
  const squash = (g, y, k) => g.setAttribute('transform', `translate(0 ${f1(y + L.tl.bh / 2)}) scale(1 ${k.toFixed(3)}) translate(0 ${f1(-(y + L.tl.bh / 2))})`);

  function frame(t) {
    const dur = L.meta.duration;
    t = (((t + (L.startAt ?? 0)) % dur) + dur) % dur; // video time → story time
    // Layout is only measurable once the stage is rendered (an embed can start
    // out hidden, e.g. the desktop version on a phone breakpoint).
    const G = R.geo ?? measure();
    if (root.offsetWidth) R.geo = G;
    const C = HCUES;

    // ---- Which page: the one whose nav click came last (Home before the first) ----
    const stop = [...HSTOPS].reverse().find((s) => t >= s[0] + 0.15);
    const page = stop ? stop[2] : 0;
    R.ttl.innerHTML = HPAGES[page][0];
    R.crumb.textContent = HPAGES[page][1];
    R.tt.style.opacity = Math.min(1, ...HSTOPS.map((s) => clamp(Math.abs(t - (s[0] + 0.15)) / 0.15)));

    // Pages fade/slide in after their click and out at the next one.
    const pageIn = [0, C.goCal + 0.15, C.goReports + 0.15];
    const pageOut = [C.goCal, C.goReports, C.goHome];
    R.views.forEach((v, i) => {
      const pin = ease.outCubic(seg(t, pageIn[i], 0.45));
      const pout = ease.inOutCubic(seg(t, pageOut[i], 0.3));
      show(v, pin * (1 - pout));
      v.style.transform = `translateY(${(lerp(10, 0, pin) - 6 * pout).toFixed(2)}px)`;
    });

    // ---- Nav: the highlight slides to the clicked item ---------------------------
    let ny = G.navY[0];
    let navOn = 0;
    for (const [at, ni] of HSTOPS) {
      ny = lerp(ny, G.navY[ni], ease.inOutCubic(seg(t, at, 0.3)));
      if (t >= at + 0.1) navOn = ni;
    }
    R.nhl.style.transform = `translateY(${ny.toFixed(2)}px)`;
    R.nhl.style.height = `${G.navH}px`;
    R.nis.forEach((n, i) => n.classList.toggle('on', i === navOn));
    R.dexBtnIn.style.backgroundPosition = `${((t / dur) * 200) % 200}% 50%`; // one sweep per loop
    R.dexBtn.style.scale = 1 - pulse(t, C.goDex) * 0.05;

    // Phone: the drawer opens on the menu tap and closes after the item tap.
    const navTaps = [C.goCal, C.goReports, C.goDex, C.goHome];
    if (L.compact) {
      const open = Math.max(...navTaps.map((at) => ease.inOutCubic(seg(t, at - C.menuLead + 0.05, 0.25)) * (1 - ease.inOutCubic(seg(t, at + 0.08, 0.25)))));
      R.side.style.transform = `translateX(${(-104 * (1 - open)).toFixed(2)}%)`;
      R.side.style.visibility = open > 0.001 ? 'visible' : 'hidden';
      show(R.scrim, open);
    }

    // ---- 1. Home: KPIs count up, charts draw ------------------------------------------
    R.kpis.forEach(({ el, kv, rv, d }, i) => {
      const s = C.kpis + i * C.kpiStagger;
      riseIn(el, t, s, { dy: 12, dur: 0.5 });
      const v = countUp(t, s + 0.05, C.countDur, d.value);
      kv.textContent = d.format === 'pct' ? pct(v) : kMoney(v);
      rv.setAttribute('width', (212 * ease.inOutCubic(seg(t, s + 0.2, 1.0))).toFixed(1));
    });
    riseIn(R.salesp, t, C.kpis + 0.25, { dy: 12 });
    R.salesRv.setAttribute('width', (L.sales.W * ease.inOutCubic(seg(t, ...C.chartDraw))).toFixed(1));
    riseIn(R.cost, t, C.kpis + 0.33, { dy: 12 });
    const sweep = ease.outQuart(seg(t, C.kpis + 0.45, 1.1));
    const circ = 2 * Math.PI * L.donut * 0.418;
    let cum = 0;
    R.slices.forEach((s) => {
      const f = Number(s.dataset.f);
      s.setAttribute('stroke-dasharray', `${Math.max(0, f * circ * sweep - 2).toFixed(2)} ${circ.toFixed(2)}`);
      s.setAttribute('stroke-dashoffset', (-cum * circ * sweep).toFixed(2));
      cum += f;
    });
    R.dc.style.opacity = seg(t, C.kpis + 0.7, 0.4);
    R.costItems.forEach((li, i) => riseIn(li, t, C.kpis + 0.6 + i * 0.06, { dy: 4, dur: 0.35 }));

    // ---- 2. Calendars: Months → 13-4, the year and the sales re-cut -------------------
    const c0 = C.goCal + 0.15;
    R.calCards.forEach((el, i) => riseIn(el, t, c0 + i * 0.08, { dy: 12 }));
    // The 13-4 calendar ends a day early (Dec 30); Dec 31 starts next year's P1.
    const chosen = t >= C.optionClick;
    R.opv.textContent = chosen ? '13-4' : 'Months';
    R.endv.textContent = dateLabel(chosen ? 363 : 364);
    R.end.style.setProperty('--flash', chosen ? 1 - seg(t, C.optionClick + 0.1, 1.2) : 0);
    R.opCell.classList.toggle('editing', t >= C.cellClick && t < C.selectClose[0] + C.selectClose[1]);
    const open = ease.outCubic(seg(t, ...C.selectOpen)) * (1 - seg(t, ...C.selectClose));
    R.rs.style.display = open > 0.001 ? 'block' : 'none';
    R.rs.style.opacity = open;
    R.rs.style.transform = `translateY(${lerp(-4, 0, open).toFixed(2)}px)`;
    R.rsItems.forEach((el, i) => el.classList.toggle('hi', t < C.optionHover ? i === 4 : i === 0));
    R.reveal.setAttribute('width', (L.tl.w * ease.inOutCubic(seg(t, ...C.tlDraw))).toFixed(1));
    R.fiveTl.forEach((d) => (d.style.opacity = seg(t, C.fiveFlags, 0.3)));
    const [m0, md] = C.morph;
    R.obars.forEach((g, i) => {
      const k = 1 - ease.inCubic(seg(t, m0 + Number(g.dataset.c) * md * 0.55, 0.3));
      squash(g, L.tl.oy, k);
      R.olbl[i].style.opacity = k;
    });
    R.pbars.forEach((g, i) => {
      const k = ease.outBack(seg(t, m0 + 0.18 + Number(g.dataset.c) * md * 0.55, 0.4));
      squash(g, L.tl.oy, Math.max(0, k));
      g.style.opacity = clamp(k * 3);
      R.plbl[i].style.opacity = clamp(k);
    });
    R.qs.forEach((q, i) => riseIn(q, t, C.quarters[0] + i * 0.08, { dy: -4, dur: C.quarters[1] }));
    const swapped = t >= m0 + 0.3;
    R.opval.textContent = swapped ? '13-4' : 'Months';
    R.opval.classList.toggle('on', swapped);
    R.opsub.style.opacity = 1 - seg(t, m0 + 0.2, 0.3);
    R.opsub2.style.opacity = seg(t, m0 + 0.5, 0.4);
    const [h0, hd] = C.chartMorph;
    const y1 = L.ch.y1;
    R.mb.forEach((b) => {
      const c = Number(b.dataset.c);
      const grow = ease.outCubic(seg(t, C.monthBars[0] + c * C.monthBars[1] * 0.5, 0.45));
      const fall = ease.inCubic(seg(t, h0 + c * hd * 0.35, 0.3));
      const h = Number(b.dataset.h) * grow * (1 - fall);
      b.setAttribute('y', (y1 - h).toFixed(2));
      b.setAttribute('height', h.toFixed(2));
    });
    R.pb.forEach((b) => {
      const h = Number(b.dataset.h) * ease.outBack(seg(t, h0 + 0.3 + Number(b.dataset.c) * hd * 0.4, 0.45), 1.1);
      b.setAttribute('y', (y1 - h).toFixed(2));
      b.setAttribute('height', Math.max(0, h).toFixed(2));
    });
    const dotsOn = seg(t, C.fiveFlags, 0.3) * (1 - seg(t, h0, 0.25));
    R.mdots.forEach((d) => (d.style.opacity = dotsOn));
    const lbl = seg(t, h0 + 0.25, 0.35);
    R.xm.forEach((x) => (x.style.opacity = 1 - lbl));
    R.xp.forEach((x) => (x.style.opacity = lbl));
    R.by.textContent = t >= h0 + 0.25 ? 'Period' : 'Month';
    R.f1.style.opacity = dotsOn;
    R.f2.style.opacity = seg(t, h0 + hd * 0.7, 0.35);

    // ---- 3. Prime Cost P&L: rows count up, COGS opens, the outlier flags ------------------
    const p0 = C.goReports + 0.15;
    R.tiles.forEach((el, i) => riseIn(el, t, p0 + i * 0.06, { dy: 10, dur: 0.45 }));
    riseIn(R.plc, t, p0 + 0.1, { dy: 12 });
    const grow = ease.outExpo(seg(t, p0 + 0.2, 0.9));
    R.plVals.forEach(({ k, cells }, ri) => {
      riseIn(R.plRows[ri], t, p0 + 0.18 + ri * 0.05, { dy: 4, dur: 0.3 });
      if (k === 'pp') return;
      cells.forEach((cell, ci) => {
        cell.textContent = kMoney(R.colData[ci][k] * 100 * grow);
      });
    });
    const unfold = ease.inOutCubic(seg(t, ...C.cats));
    R.cats.style.height = `${(G.cats * unfold).toFixed(1)}px`;
    R.tw.style.transform = `rotate(${90 * unfold}deg)`;
    R.crs.forEach((r, i) => {
      const p = ease.outCubic(seg(t, C.cats[0] + 0.08 + i * 0.05, 0.35));
      r.style.opacity = p;
      r.style.transform = `translateY(${lerp(5, 0, p).toFixed(2)}px)`;
    });
    const fl = ease.outCubic(seg(t, C.flag, 0.35));
    R.fls.forEach((c) => {
      c.style.setProperty('--fl', fl);
      c.classList.toggle('on', fl > 0.5);
    });

    // ---- 4. Dex: question typed and sent, answer streams in ------------------------------
    const dexIn = ease.outCubic(seg(t, ...C.dexIn)) * (1 - ease.inOutCubic(seg(t, C.goHome, 0.35)));
    show(R.dex, dexIn);
    // Desktop: the page makes room for the panel, so the flagged column stays in view.
    if (!L.compact) R.viewsEl.style.right = `${(L.dexRoom * dexIn).toFixed(1)}px`;
    R.dex.style.transform = L.compact ? `translateY(${lerp(60, 0, dexIn).toFixed(2)}px)` : `translateX(${lerp(40, 0, dexIn).toFixed(2)}px)`;
    const ask = D.dex.ask;
    const sent = t >= C.send;
    const nChars = Math.round(ask.length * seg(t, ...C.typeAsk));
    R.typed.textContent = sent ? '' : ask.slice(0, nChars);
    R.ph.style.display = nChars === 0 || sent ? '' : 'none';
    const blinkOn = nChars < ask.length || Math.floor(t * 3) % 2 === 0;
    R.caret.style.opacity = !sent && t >= C.dexIn[0] + 0.25 && blinkOn ? 1 : 0;
    const bub = ease.outCubic(seg(t, C.send, 0.3));
    show(R.bubble, bub);
    R.bubble.style.transform = `translateY(${lerp(10, 0, bub).toFixed(2)}px)`;
    show(R.ans, seg(t, C.thinking[0], 0.15));
    R.dots.style.opacity = t < C.answer[0] ? 1 : 0;
    [...R.dots.children].forEach((d, i) => {
      d.style.transform = `translateY(${(Math.sin(t * 9 - i * 0.9) * -2.5).toFixed(2)}px)`;
    });
    const words = R.words.length * seg(t, ...C.answer);
    R.words.forEach((w, i) => (w.style.opacity = clamp(words - i)));

    // ---- Pointer ---------------------------------------------------------------------
    const clicks = [C.goCal, C.cellClick, C.optionClick, C.goReports, C.cogs, C.goDex, C.goHome];
    if (L.touch) {
      // A fingertip lands just before each tap and lifts after; nav taps are
      // preceded by a tap on the menu button.
      const taps = [
        ...navTaps.map((at) => [at - C.menuLead, G.menu]),
        [C.goCal, G.settings],
        [C.cellClick, G.cell],
        [C.optionClick, G.option],
        [C.goReports, G.reports],
        [C.cogs, G.cogs],
        [C.goDex, G.dex],
        [C.goHome, G.home],
      ];
      const [at, pos] = taps.reduce((b, x) => (Math.abs(t - x[0]) < Math.abs(t - b[0]) ? x : b));
      const press = pulse(t, at);
      R.cursor.style.opacity = seg(t, at - 0.28, 0.14) * (1 - seg(t, at + 0.12, 0.2));
      R.cursor.style.transform = `translate(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px) scale(${1 - press * 0.18})`;
      const rip = t >= at && t < at + 0.4 ? seg(t, at, 0.4) : 0;
      R.ripple.style.opacity = rip > 0 && rip < 1 ? 1 - rip : 0;
      R.ripple.style.transform = `scale(${lerp(0.5, 1.6, rip)})`;
      return;
    }
    // The pointer rests on Home at the loop point, so t = 14 meets t = 0.
    const path = [
      [C.toRest, G.rest],
      [C.toCal, G.settings],
      [C.toCell, G.cell],
      [C.toOption, G.option],
      [C.calRest, G.calRest],
      [C.toReports, G.reports],
      [C.toCogs, G.cogs],
      [C.toDex, G.dex],
      [C.dexRest, G.dexRest],
      [C.toHome, G.home],
    ];
    const pos = path.reduce((p, [[s, d], to]) => mix(p, to, ease.inOutCubic(seg(t, s, d))), G.home);
    const click = Math.max(...clicks.map((c) => pulse(t, c)));
    R.cursor.style.opacity = 1;
    R.cursor.style.transform = `translate(${(pos.x - 4).toFixed(1)}px, ${(pos.y - 2.5).toFixed(1)}px) scale(${1 - click * 0.12})`;
    const last = [...clicks].reverse().find((c) => t >= c);
    const rip = last != null && t < last + 0.45 ? seg(t, last, 0.45) : 0;
    R.ripple.style.opacity = rip > 0 && rip < 1 ? 1 - rip : 0;
    R.ripple.style.transform = `translate(4px, 2.5px) scale(${lerp(0.3, 1.4, rip)})`;
  }

  return { meta: L.meta, build, frame };
}
