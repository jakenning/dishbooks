// Smart Ops Dashboard — "Every number that matters, the moment you log in."
//
// Story (10s seamless loop):
//   sign in → dashboard builds → KPI tiles count up → sales trend draws →
//   locations rank by prime cost, one flags amber → cursor asks Dex about it →
//   Dex explains → fade back to the sign-in card.
//
// All timings live in CUES. All copy and numbers come from the scenario JSON.

import { seg, ease, lerp, clamp, riseIn, fmt, countUp } from '../../lib/timeline.js';

export const meta = { width: 880, height: 616, duration: 10, fps: 30, posterTime: 8.8 };

// Seconds. [start, duration] pairs unless noted.
export const CUES = {
  cursorIn: [0.1, 0.25],
  cursorToSignIn: [0.25, 0.6],
  signInClick: 0.9,
  loginOut: [1.12, 0.3],
  shellIn: [1.25, 0.55],
  header: 1.35,
  tiles: 1.55,
  tileStagger: 0.08,
  countDur: 1.4,
  chart: 2.25,
  barStagger: 0.022,
  barDur: 0.5,
  avgLine: [3.0, 0.8],
  callout: 3.55,
  panel: 3.0,
  rowStagger: 0.12,
  rowFill: 0.9,
  cursorBack: [4.55, 0.25],
  cursorToRow: [4.6, 0.75],
  rowHover: 5.2,
  askClick: 5.75,
  dexIn: [5.85, 0.45],
  typing: [6.2, 0.45],
  answer: [6.5, 1.0],
  cursorOut: [6.3, 0.5],
  outro: [9.25, 0.4], // dashboard fades to the background
  outroCard: [9.55, 0.45], // then the sign-in card returns
};

const ICON = {
  mark: `<svg class="mark" viewBox="0 0 68 48" aria-hidden="true"><defs><linearGradient id="dbm" x1="0" y1="24" x2="85" y2="24" gradientUnits="userSpaceOnUse"><stop offset=".1" stop-color="#2EB2FF"/><stop offset="1" stop-color="#326CFF"/></linearGradient></defs><path d="M46.19 24C46.19 10.97 34.49.33 19.96 0H2.01C.9 0 0 .88 0 1.97v44.07C0 47.12.9 48 2.01 48h17.95C34.49 47.67 46.19 37.03 46.19 24Z" fill="url(#dbm)"/><path d="M57.11 24c0-11.23-8.69-20.69-20.39-23.29-.83-.19-1.3.9-.59 1.34 7.76 4.81 12.85 12.86 12.85 21.95s-5.09 17.14-12.85 21.95c-.71.44-.24 1.52.59 1.34C48.41 44.69 57.11 35.23 57.11 24Z" fill="#326CFF"/><path d="M47.5.63c-.82-.19-1.3.9-.58 1.34C54.74 6.78 59.89 14.86 59.89 24c0 9.15-5.15 17.23-12.98 22.04-.72.44-.24 1.53.6 1.34 4.62-1.04 8.75-3.3 12-6.4 4.54-4.35 7.35-10.35 7.35-16.97C66.85 12.63 58.59 3.1 47.5.63Z" fill="#5542FF"/></svg>`,
  grid: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="5.5" height="5.5" rx="1.5"/><rect x="11.5" y="3" width="5.5" height="5.5" rx="1.5"/><rect x="3" y="11.5" width="5.5" height="5.5" rx="1.5"/><rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1.5"/></svg>`,
  cal: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 8h14M7 2.5v3M13 2.5v3"/></svg>`,
  bars: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 16V9M8 16V4M12 16v-5M16 16V7"/></svg>`,
  doc: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 2.5h7l3 3V17a.5.5 0 0 1-.5.5h-9.5A.5.5 0 0 1 4.5 17V3a.5.5 0 0 1 .5-.5Z"/><path d="M7.5 9h5M7.5 12h5"/></svg>`,
  bank: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 7.5 10 3l7 4.5H3ZM4.5 8v6.5M8.5 8v6.5M11.5 8v6.5M15.5 8v6.5M3 17h14"/></svg>`,
  gear: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="2.6"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4"/></svg>`,
  spark: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c.4 3.9 2.1 5.6 6 6-3.9.4-5.6 2.1-6 6-.4-3.9-2.1-5.6-6-6 3.9-.4 5.6-2.1 6-6Z" transform="translate(1 2)"/></svg>`,
  pin: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 14.5s5-4.3 5-8.2A5 5 0 0 0 3 6.3c0 3.9 5 8.2 5 8.2Z"/><circle cx="8" cy="6.3" r="1.8"/></svg>`,
  calSm: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 6.5h12"/></svg>`,
  cursor: `<svg viewBox="0 0 22 22"><path d="M4 2.5v15.2l4.1-3.9 2.7 6.1 2.6-1.1-2.7-6h5.7L4 2.5Z" fill="#0b0c0d" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
};

let D; // scenario data
let R; // element refs + geometry
let root;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function deltaChip(k) {
  if (!k.delta) return `<span class="chip flat">— 0${k.unit === 'pts' ? ' pts' : '%'}</span>`;
  const up = k.delta > 0;
  const good = up === (k.goodWhen === 'up');
  const mag = Math.abs(k.delta).toFixed(1);
  return `<span class="chip ${good ? 'good' : 'bad'}">${up ? '▲' : '▼'} ${mag}${k.unit === 'pts' ? ' pts' : '%'}</span>`;
}

function formatKpi(k, v) {
  return k.format === 'money' ? fmt.money(v) : `${v.toFixed(1)}%`;
}

function sparkPath(values, w, h) {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  return values
    .map((v, i) => `${i ? 'L' : 'M'}${((i / (values.length - 1)) * w).toFixed(1)} ${(h - ((v - lo) / span) * h).toFixed(1)}`)
    .join('');
}

// Rounded "nice" step for a y-axis with ~3 gridlines.
function niceStep(max) {
  const raw = max / 3;
  const mag = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
}

export function build(el, data) {
  root = el;
  D = data;
  el.classList.add('db-anim');
  const u = data.user;
  const warnIdx = Math.max(0, data.panel.rows.findIndex((r) => r.status === 'warn'));

  // ---- Chart geometry -------------------------------------------------------
  const CW = 438; // svg width inside chart card
  const CH = 238;
  const plot = { x0: 34, x1: CW - 4, y0: 14, y1: CH - 24 };
  const days = data.salesTrend.days;
  const step = niceStep(Math.max(...days) * 1.05);
  const yMax = step * Math.ceil((Math.max(...days) * 1.05) / step);
  const slot = (plot.x1 - plot.x0) / days.length;
  const bw = Math.min(10, slot * 0.62);
  const yOf = (v) => plot.y1 - (v / yMax) * (plot.y1 - plot.y0);
  const nowFrom = days.length - data.salesTrend.currentWeekBars;
  const bars = days.map((v, i) => ({ x: plot.x0 + slot * i + (slot - bw) / 2, h: plot.y1 - yOf(v), now: i >= nowFrom }));
  const avgPts = days
    .map((_, i) => (i < 6 ? null : days.slice(i - 6, i + 1).reduce((a, b) => a + b, 0) / 7))
    .map((v, i) => (v == null ? null : [plot.x0 + slot * i + slot / 2, yOf(v)]))
    .filter(Boolean);
  const avgD = avgPts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
  const grid = [];
  for (let v = 0; v <= yMax + 1; v += step) grid.push(v);
  // Week separators fall on Mondays.
  const weekLabels = ['3 wks ago', '2 wks ago', 'Last week', 'This week'];
  const mondays = days.map((_, i) => i).filter((i) => (data.salesTrend.firstWeekday + i) % 7 === 0);
  const last = bars[bars.length - 1];
  const lastDayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][(data.salesTrend.firstWeekday + days.length - 1) % 7];
  const calloutText = `${lastDayName} · ${fmt.money(days[days.length - 1])}`;
  const calloutW = 14 + calloutText.length * 5.9;

  // ---- Panel scale ----------------------------------------------------------
  const rows = data.panel.rows;
  const scaleMax = Math.ceil((Math.max(...rows.map((r) => Math.max(r.pct, r.target))) * 1.12) / 5) * 5;
  const sameTarget = rows.every((r) => r.target === rows[0].target);

  el.innerHTML = `
  <div class="app">
    <aside class="side">
      ${ICON.mark}
      <div class="nav on">${ICON.grid}</div>
      <div class="nav">${ICON.cal}</div>
      <div class="nav">${ICON.bars}</div>
      <div class="nav">${ICON.doc}</div>
      <div class="nav">${ICON.bank}</div>
      <div class="spacer"></div>
      <div class="nav">${ICON.gear}</div>
    </aside>
    <main class="main">
      <header class="top">
        <div class="hello">
          <h2>${esc(data.greeting)}, ${esc(u.firstName)}</h2>
          <p>${esc(data.company.name)} · ${esc(data.company.scopeCount)}</p>
        </div>
        <div class="pill">${ICON.pin}${esc(data.company.scope)}</div>
        <div class="pill">${ICON.calSm}${esc(data.period.label)}</div>
        <div class="pill live"><i></i>Synced just now</div>
        <div class="avatar">${esc(u.initials)}</div>
      </header>
      <section class="kpis">
        ${data.kpis
          .map(
            (k) => `
          <div class="tile">
            <div class="t-label">${esc(k.label)}</div>
            <div class="t-value">${formatKpi(k, k.value)}</div>
            <div class="t-foot">${deltaChip(k)}<span>${esc(k.compare)}</span></div>
            <svg class="t-spark" viewBox="0 0 78 30"><path d="${sparkPath(k.spark, 78, 26)}" fill="none" stroke="${k.delta === 0 || (k.delta > 0) === (k.goodWhen === 'up') ? '#326cff' : '#f82c36'}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"/></svg>
          </div>`,
          )
          .join('')}
      </section>
      <section class="lower">
        <div class="card chart">
          <div class="c-head">
            <div><h3>${esc(data.salesTrend.title)}</h3><p>${esc(data.salesTrend.subtitle)}</p></div>
            <div class="legend"><span><i style="background:var(--p-500)"></i>This week</span><span><i style="background:var(--p-100)"></i>Prior weeks</span><span><i style="background:var(--violet);height:2px;border-radius:1px;vertical-align:3px"></i>7-day avg</span></div>
          </div>
          <svg width="100%" viewBox="0 0 ${CW} ${CH}">
            <g class="grid">${grid
              .map((v) => `<line x1="${plot.x0}" x2="${plot.x1}" y1="${yOf(v)}" y2="${yOf(v)}"/><text x="${plot.x0 - 6}" y="${yOf(v) + 3.5}" text-anchor="end">${fmt.moneyShort(v)}</text>`)
              .join('')}</g>
            <g class="xl">${mondays
              .map((i, n) => {
                const x = plot.x0 + slot * i;
                const end = mondays[n + 1] ?? days.length;
                const label = weekLabels[weekLabels.length - mondays.length + n];
                return `<line x1="${x}" x2="${x}" y1="${plot.y0}" y2="${plot.y1}"/><text x="${x + (slot * (end - i)) / 2}" y="${plot.y1 + 16}" text-anchor="middle">${label}</text>`;
              })
              .join('')}</g>
            <g class="bars">${bars.map((b) => `<rect class="${b.now ? 'bar-now' : 'bar-prior'}" x="${b.x.toFixed(1)}" width="${bw.toFixed(1)}" rx="2" y="${plot.y1}" height="0"/>`).join('')}</g>
            <path class="avg" d="${avgD}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
            <g class="callout" transform="translate(${(last.x + bw / 2 - calloutW + 8).toFixed(1)} ${(plot.y1 - last.h - 30).toFixed(1)})">
              <rect width="${calloutW.toFixed(1)}" height="20" rx="6"/>
              <text x="${(calloutW / 2).toFixed(1)}" y="13.5" text-anchor="middle">${esc(calloutText)}</text>
            </g>
          </svg>
        </div>
        <div class="card panel">
          <div class="c-head"><div><h3>${esc(data.panel.title)}</h3><p>${esc(data.panel.subtitle)}</p></div></div>
          <div class="rows">
            ${rows
              .map(
                (r, i) => `
              <div class="row ${r.status === 'warn' ? 'warn' : ''}">
                ${i === warnIdx ? '<div class="row-hl"></div>' : ''}
                <div class="row-top">
                  <span class="row-name">${esc(r.name)}</span>
                  ${r.sales != null ? `<span class="row-sales"${i === warnIdx ? ' data-hide-on-hover' : ''}>${fmt.moneyShort(r.sales)}</span>` : ''}
                  <span class="row-pct">${r.pct.toFixed(1)}%</span>
                </div>
                <div class="track"><div class="fill" style="width:0"></div><div class="tick" style="left:calc(${((r.target / scaleMax) * 100).toFixed(2)}% - 1px)"></div></div>
                ${i === warnIdx ? `<div class="ask">${ICON.spark}Ask Dex</div>` : ''}
              </div>`,
              )
              .join('')}
          </div>
          <div class="target-note"><span class="tick"></span>${sameTarget ? `Target ${rows[0].target}%` : 'Target for each line'}</div>
        </div>
      </section>
      <div class="dex">
        <div class="dex-head"><div class="orb">${ICON.spark}</div>Dex AI<span>${esc(data.company.name)}</span></div>
        <div class="q">${esc(data.dex.ask)}</div>
        <div class="typing"><i></i><i></i><i></i></div>
        <div class="a">${data.dex.answer
          .split(/(\s+)/)
          .map((w) => (w.trim() ? `<span>${esc(w)}</span>` : w))
          .join('')}</div>
      </div>
    </main>
  </div>
  <div class="login">
    <div class="login-card">
      ${ICON.mark}
      <h1>Welcome back</h1>
      <p>Sign in to DishBooks</p>
      <div class="account"><div class="avatar">${esc(u.initials)}</div><div><b>${esc(u.firstName)} ${esc(u.lastName)}</b><span>${esc(u.role)} · ${esc(data.company.name)}</span></div></div>
      <div class="btn-primary"><span class="spinner"></span><span class="btn-label">Sign in</span></div>
    </div>
  </div>
  <div class="cursor"><div class="ripple"></div>${ICON.cursor}</div>`;

  const q = (s) => el.querySelector(s);
  const qa = (s) => [...el.querySelectorAll(s)];
  R = {
    app: q('.app'),
    login: q('.login'),
    card: q('.login-card'),
    btn: q('.btn-primary'),
    spinner: q('.spinner'),
    btnLabel: q('.btn-label'),
    top: q('.top'),
    pills: qa('.top .pill, .top .avatar'),
    hello: q('.hello'),
    tiles: qa('.tile'),
    values: qa('.t-value'),
    feet: qa('.t-foot'),
    sparks: qa('.t-spark path'),
    chart: q('.card.chart'),
    panel: q('.card.panel'),
    bars: qa('.bars rect'),
    barGeo: bars,
    plotY1: plot.y1,
    avg: q('.avg'),
    callout: q('.callout'),
    rows: qa('.row'),
    fills: qa('.fill'),
    fillPct: rows.map((r) => (r.pct / scaleMax) * 100),
    pctEls: qa('.row-pct'),
    warnIdx,
    hl: q('.row-hl'),
    ask: q('.ask'),
    hideOnHover: q('[data-hide-on-hover]'),
    note: q('.target-note'),
    dex: q('.dex'),
    typing: q('.typing'),
    words: qa('.a span'),
    cursor: q('.cursor'),
    ripple: q('.ripple'),
    geo: null,
  };
}

// Positions are measured from layout (offsets are unaffected by transforms),
// so the cursor lands on the right element whatever the copy length.
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
  const btn = offset(R.btn);
  const ask = offset(R.ask);
  const chart = offset(R.chart);
  // Park Dex over the lower-left of the chart, so the flagged row stays visible.
  R.dex.style.left = `${chart.x - offset(R.dex.offsetParent).x + 14}px`;
  R.dex.style.top = `${chart.y - offset(R.dex.offsetParent).y + chart.h - R.dex.offsetHeight - 14}px`;
  return {
    start: { x: 640, y: 520 },
    signIn: { x: btn.x + btn.w * 0.62, y: btn.y + btn.h * 0.55 },
    rowEntry: { x: 900, y: 470 },
    ask: { x: ask.x + ask.w * 0.5, y: ask.y + ask.h * 0.6 },
    rest: { x: ask.x + ask.w * 0.5 + 30, y: ask.y + 120 },
  };
}

const mix = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) });

export function frame(t) {
  if (!R.geo) R.geo = measure();
  const G = R.geo;
  const C = CUES;
  const outro = ease.inOutCubic(seg(t, ...C.outro));
  const outroCard = ease.outCubic(seg(t, ...C.outroCard));

  // ---- Login → app, and back again in the outro so the loop is seamless ----
  // The login layer's background and its card fade separately, so the card
  // never double-exposes over the dashboard.
  const out = ease.inOutCubic(seg(t, ...C.loginOut));
  const bgShow = t < C.outro[0] ? 1 - ease.inOutCubic(seg(t, C.loginOut[0] + 0.1, 0.4)) : outro;
  const cardShow = t < C.outro[0] ? 1 - out : outroCard;
  R.login.style.opacity = clamp(bgShow);
  R.login.style.visibility = bgShow <= 0.001 ? 'hidden' : 'visible';
  R.card.style.opacity = cardShow;
  R.card.style.transform = t < C.outro[0] ? `scale(${lerp(1, 1.05, out)})` : `translateY(${lerp(10, 0, outroCard)}px) scale(${lerp(0.97, 1, outroCard)})`;

  const press = seg(t, C.signInClick - 0.06, 0.06) - seg(t, C.signInClick + 0.04, 0.12);
  R.btn.style.transform = `scale(${1 - press * 0.035})`;
  const loading = t >= C.signInClick + 0.05 && t < C.outro[0];
  R.spinner.style.display = loading ? 'block' : 'none';
  R.spinner.style.transform = `rotate(${t * 720}deg)`;
  R.btnLabel.textContent = loading ? 'Signing in…' : 'Sign in';

  const shell = ease.outCubic(seg(t, ...C.shellIn));
  R.app.style.opacity = shell * (1 - outro);
  R.app.style.transform = `scale(${lerp(0.975, 1, shell)})`;

  // ---- Header -------------------------------------------------------------
  riseIn(R.hello, t, C.header, { dy: 8 });
  R.pills.forEach((p, i) => riseIn(p, t, C.header + 0.08 + i * 0.05, { dy: 6 }));

  // ---- KPI tiles ------------------------------------------------------------
  D.kpis.forEach((k, i) => {
    const s = C.tiles + i * C.tileStagger;
    riseIn(R.tiles[i], t, s, { dy: 14, dur: 0.55 });
    R.values[i].textContent = formatKpi(k, countUp(t, s + 0.1, C.countDur, k.value));
    const foot = ease.outCubic(seg(t, s + C.countDur * 0.6, 0.35));
    R.feet[i].style.opacity = foot;
    R.feet[i].style.transform = `translateY(${lerp(4, 0, foot)}px)`;
    R.sparks[i].setAttribute('stroke-dashoffset', 1 - ease.outCubic(seg(t, s + 0.25, 1.0)));
  });

  // ---- Sales trend --------------------------------------------------------
  riseIn(R.chart, t, C.chart - 0.2, { dy: 14 });
  R.bars.forEach((el, i) => {
    const p = ease.outQuart(seg(t, C.chart + i * C.barStagger, C.barDur));
    const h = R.barGeo[i].h * p;
    el.setAttribute('y', (R.plotY1 - h).toFixed(2));
    el.setAttribute('height', h.toFixed(2));
  });
  R.avg.setAttribute('stroke-dashoffset', 1 - ease.inOutCubic(seg(t, ...C.avgLine)));
  const co = ease.outBack(seg(t, C.callout, 0.4));
  R.callout.style.opacity = clamp(co);
  R.callout.style.transformBox = 'fill-box';
  R.callout.style.transformOrigin = '85% 100%';
  R.callout.style.scale = lerp(0.85, 1, co);

  // ---- Panel ----------------------------------------------------------------
  riseIn(R.panel, t, C.panel - 0.2, { dy: 14 });
  R.rows.forEach((row, i) => {
    const s = C.panel + i * C.rowStagger;
    riseIn(row, t, s, { dy: 8, dur: 0.45 });
    R.fills[i].style.width = `${R.fillPct[i] * ease.outCubic(seg(t, s + 0.1, C.rowFill))}%`;
  });
  R.note.style.opacity = seg(t, C.panel + 0.5, 0.4);
  const hover = ease.outCubic(seg(t, C.rowHover, 0.3));
  if (R.hl) R.hl.style.opacity = hover;
  if (R.hideOnHover) R.hideOnHover.style.opacity = 1 - hover;
  if (R.ask) {
    R.ask.style.opacity = hover;
    const askPress = seg(t, C.askClick - 0.06, 0.06) - seg(t, C.askClick + 0.04, 0.12);
    R.ask.style.transform = `translateY(${lerp(4, 0, hover)}px) scale(${1 - askPress * 0.06})`;
  }

  // ---- Dex ------------------------------------------------------------------
  const dex = ease.outCubic(seg(t, ...C.dexIn));
  R.dex.style.opacity = dex;
  R.dex.style.transform = `translateY(${lerp(18, 0, dex)}px) scale(${lerp(0.97, 1, dex)})`;
  R.dex.style.visibility = dex <= 0.001 ? 'hidden' : 'visible';
  const typing = seg(t, C.typing[0], 0.15) * (1 - seg(t, C.answer[0], 0.1));
  R.typing.style.display = t < C.answer[0] ? 'flex' : 'none';
  R.typing.style.opacity = typing;
  [...R.typing.children].forEach((d, i) => {
    d.style.transform = `translateY(${Math.sin((t * 9 - i * 0.9) % (Math.PI * 2)) * -2.5}px)`;
  });
  const shown = R.words.length * seg(t, ...C.answer);
  R.words.forEach((w, i) => (w.style.opacity = clamp(shown - i)));

  // ---- Cursor ---------------------------------------------------------------
  let pos;
  let vis;
  if (t < C.cursorBack[0]) {
    pos = mix(G.start, G.signIn, ease.inOutCubic(seg(t, ...C.cursorToSignIn)));
    vis = seg(t, ...C.cursorIn) * (1 - seg(t, C.loginOut[0], 0.3));
  } else {
    pos = mix(G.rowEntry, G.ask, ease.inOutCubic(seg(t, ...C.cursorToRow)));
    pos = mix(pos, G.rest, ease.inOutCubic(seg(t, ...C.cursorOut)));
    vis = seg(t, ...C.cursorBack) * (1 - seg(t, C.cursorOut[0] + 0.2, 0.4));
  }
  R.cursor.style.opacity = vis;
  const click = Math.max(seg(t, C.signInClick - 0.06, 0.06) - seg(t, C.signInClick + 0.04, 0.1), seg(t, C.askClick - 0.06, 0.06) - seg(t, C.askClick + 0.04, 0.1));
  R.cursor.style.transform = `translate(${pos.x - 4}px, ${pos.y - 2.5}px) scale(${1 - click * 0.12})`;
  const rip = Math.max(seg(t, C.signInClick, 0.45) * (t < C.signInClick + 0.45 ? 1 : 0), seg(t, C.askClick, 0.45) * (t >= C.askClick && t < C.askClick + 0.45 ? 1 : 0));
  R.ripple.style.opacity = rip > 0 && rip < 1 ? 1 - rip : 0;
  R.ripple.style.transform = `translate(4px, 2.5px) scale(${lerp(0.3, 1.4, rip)})`;
}
