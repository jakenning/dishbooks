// Custom reports — "The right numbers, to exactly the right person."
//
// Four pieces of the reporting workflow, floating on their own rather than
// inside an app window:
//
//   1. Report template — the prebuilt Prime Cost P&L. COGS opens up into the
//      company's own categories; prime cost = COGS + labor.
//   2. Who gets it — the owner sees the whole group; picking the GM re-scopes
//      the same template to their one location and the numbers roll over.
//   3. Schedule — Weekly, Mondays, 7:00 AM.
//   4. Inboxes — the report lands for each person, with their own numbers, on
//      top of last week's copy.
//
// 10s seamless loop. This file is the story, shared by both layouts:
// scenes/custom-reports (640 × 506) and scenes/custom-reports-mobile (400 × 680)
// each call makeScene() with their own geometry. Timings are in CUES; company,
// people, locations and P&L figures come from the scenario JSON.

import { seg, ease, lerp, riseIn, fmt } from '../../lib/timeline.js';
import { icon } from '../../shared/icons.js';
import { CATS, SWATCH } from '../../shared/categories.js';

// Seconds. [start, duration] pairs unless noted.
export const CUES = {
  rep: 0.1, // report card
  rows: [0.3, 0.8], // P&L rows count up
  cursorIn: [1.0, 0.2],
  toCogs: [1.0, 0.4],
  cogsClick: 1.5,
  cats: [1.6, 0.7], // COGS opens into the custom categories
  who: 2.2, // "Who gets it" card
  toGm: [2.5, 0.5],
  gmClick: 3.1,
  rescope: [3.2, 0.7], // report re-scopes to the GM's location
  whoOut: 4.4, // phone only: the schedule card takes the recipients' place
  sched: 4.45, // schedule card
  toWeekly: [4.75, 0.45],
  weeklyClick: 5.25,
  toMon: [5.3, 0.35],
  monClick: 5.7,
  toSend: [5.75, 0.45],
  sendClick: 6.3,
  cursorOut: [6.4, 0.4],
  recede: [6.65, 0.45], // the app cards step back…
  inbox: [6.8, 0.25], // …two inboxes rise (start, stagger)
  mail: [7.25, 0.3], // the new emails drop in (start, stagger)
  outro: [9.3, 0.55], // everything leaves; t = 10 matches t = 0 (empty)
};

// The second recipient: someone who should only see one location. Fictional.
const GMS = {
  home: ['Luis Park', 'GM'],
  'independent-restaurants': ['Tessa Lin', 'GM'],
  'multi-unit-groups': ['Owen Price', 'GM'],
  'accounting-firms': ['Rosa Delgado', 'Owner'],
  qsr: ['Kayla Brooks', 'Store GM'],
  'fast-casual': ['Nate Ferris', 'GM'],
  'casual-dining': ['Dana Whitfield', 'GM'],
  'fine-dining': ['Theo Laurent', 'GM'],
  'coffee-shops': ['Ivy Chen', 'Café Manager'],
  pizzerias: ['Marco Bellini', 'GM'],
  'bars-nightclubs': ['Simone Hart', 'GM'],
  'hotel-restaurants-bars': ['Rafael Ortega', 'Outlet Manager'],
};


const WEEK = 'Oct 5–11'; // the Monday 7:00 AM send on Oct 12, 2026 covers last week
const LAST_WEEK = 'Sep 28–Oct 4';

const CURSOR = `<svg viewBox="0 0 22 22"><path d="M4 2.5v15.2l4.1-3.9 2.7 6.1 2.6-1.1-2.7-6h5.7L4 2.5Z" fill="#0b0c0d" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
const MARK = `<svg class="mark" viewBox="0 0 68 48" aria-hidden="true"><path d="M46.2 24C46.2 11 34.5.3 20 0H2C.9 0 0 .9 0 2v44c0 1.1.9 2 2 2h18c14.5-.3 26.2-11 26.2-24Z" fill="#2eb2ff"/><path d="M57.1 24C57.1 12.8 48.4 3.3 36.7.7c-.8-.2-1.3.9-.6 1.3C43.9 6.9 49 14.9 49 24s-5.1 17.1-12.9 22c-.7.4-.2 1.5.6 1.3C48.4 44.7 57.1 35.2 57.1 24Z" fill="#326cff"/><path d="M47.5.6c-.8-.2-1.3.9-.6 1.4 7.8 4.8 13 12.9 13 22s-5.2 17.2-13 22c-.7.5-.2 1.6.6 1.4 4.6-1 8.8-3.3 12-6.4 4.5-4.4 7.4-10.4 7.4-17C66.8 12.6 58.6 3.1 47.5.6Z" fill="#5542ff"/></svg>`;
// Phosphor-style line icons (regular weight) the shared set doesn't have.
const LINE = {
  file: 'M200 224H56a8 8 0 0 1-8-8V40a8 8 0 0 1 8-8h96l56 56v128a8 8 0 0 1-8 8ZM152 32v56h56M96 136h64M96 168h64',
  clock: 'M128 32a96 96 0 1 0 0 192 96 96 0 1 0 0-192ZM128 72v56h56',
  users: 'M84 152a44 44 0 1 0 0-88 44 44 0 1 0 0 88ZM16 200c14-24 40-40 68-40s54 16 68 40M168 64a44 44 0 0 1 0 88M188 160c24 4 42 18 52 40',
  envelope: 'M32 56h192v136a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8V56ZM224 56l-96 88-96-88',
  clip: 'M160 80l-76 76a20 20 0 0 0 28 28l92-92a40 40 0 0 0-56-56l-92 92a60 60 0 0 0 84 84l76-76',
};
const line = (n, cls = '') =>
  `<svg class="pi ${cls}" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${LINE[n]}"/></svg>`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('');
const pct1 = (v) => `${v.toFixed(1)}%`;

// ---- Fictional weekly P&L -----------------------------------------------------
// One week = 1/52 of the scenario's annual figures, rounded to dollars first and
// then summed, so prime cost = COGS + labor and the categories add up to COGS.
function scopeNumbers(sales, cogsPct, laborPct, foodShare, cats) {
  const s = Math.round(sales / 52);
  const cogs = Math.round((s * cogsPct) / 100);
  const labor = Math.round((s * laborPct) / 100);
  const side = { f: Math.round(cogs * foodShare) };
  side.b = cogs - side.f;
  const cat = cats.map(([, k, share]) => Math.round(side[k] * share));
  // Rounding leftovers go to the largest category so the column still foots.
  const big = cat.indexOf(Math.max(...cat));
  cat[big] += cogs - cat.reduce((a, b) => a + b, 0);
  return { sales: s, cogs, labor, prime: cogs + labor, cat };
}

function numbers(data) {
  const cats = CATS[data.id] ?? CATS.default;
  const pnl = Object.fromEntries(data.pnl.map((r) => [r.metric, r.actual]));
  const locs = data.locations;
  const tot = locs.reduce((a, l) => a + l.sales, 0);
  const groupFood = locs.reduce((a, l) => a + l.sales * l.food, 0) / tot;
  const groupBev = locs.reduce((a, l) => a + l.sales * l.bev, 0) / tot;
  const S = pnl['Total Sales'];
  const group = scopeNumbers(S, (pnl.COGS / S) * 100, (pnl.Labor / S) * 100, groupFood / (groupFood + groupBev), cats);
  const loc = locs[data.flag?.row ?? 0];
  const one = scopeNumbers(loc.sales, loc.food + loc.bev, loc.labor, loc.food / (loc.food + loc.bev), cats);
  const n = parseInt(data.company.scopeLabel, 10);
  const unit = data.company.scopeLabel.replace(/^\d+\s*/, '').toLowerCase();
  const [gmName, gmRole] = GMS[data.id] ?? ['Luis Park', 'GM'];
  return {
    cats,
    group,
    one,
    owner: { name: `${data.user.firstName} ${data.user.lastName}`, role: data.user.role, scope: n > 1 ? `All ${n} ${unit}` : loc.name },
    gm: { name: gmName, role: gmRole, scope: loc.name },
  };
}

// ---- Markup -------------------------------------------------------------------

const avatar = (name, cls = '') => `<span class="av ${cls}">${esc(initials(name))}</span>`;

function reportCard(N) {
  const row = (k, label, cls = '') =>
    `<div class="pr ${cls}" data-k="${k}"><span class="lb">${label}</span><span class="amt"></span><span class="pc"></span></div>`;
  const cats = N.cats
    .map(
      ([name], i) =>
        `<div class="cr"><span class="lb"><i style="background:${SWATCH[i]}"></i>${esc(name)}</span><span class="bar"><b style="background:${SWATCH[i]}"></b></span><span class="amt"></span><span class="pc"></span></div>`,
    )
    .join('');
  return `<div class="card rep">
    <div class="rh">
      <div class="tt">${line('file', 'ti')}<span>Prime Cost P&amp;L</span><em class="tag">Template</em></div>
      <div class="chips">
        <span class="chip who-chip"><span class="sw o">${avatar(N.owner.name)}<b>${esc(N.owner.name)}</b><span class="sc">· ${esc(N.owner.scope)}</span></span><span class="sw g">${avatar(N.gm.name, 'gm')}<b>${esc(N.gm.name)}</b><span class="sc">· ${esc(N.gm.scope)}</span></span></span>
        <span class="chip wk">${icon('calendar', 'ci')}${WEEK}</span>
      </div>
    </div>
    <div class="ph"><span></span><span>Amount</span><span>% Sales</span></div>
    ${row('sales', 'Total Sales')}
    ${row('cogs', `${icon('caret-right', 'tw')}COGS`, 'cogs')}
    <div class="cats"><div class="cin"><div class="cap">Your categories</div>${cats}</div></div>
    ${row('labor', 'Labor')}
    ${row('prime', 'Prime Cost', 'prime')}
  </div>`;
}

function whoCard(N) {
  const person = (p, cls) =>
    `<div class="pp ${cls}">${avatar(p.name, cls === 'g' ? 'gm' : '')}<span class="nm"><span class="n1"><b>${esc(p.name)}</b><em>${esc(p.role)}</em></span><span class="n2">${icon(cls === 'g' ? 'map-pin' : 'buildings', 'pin')}${esc(p.scope)}</span></span>${icon('check', 'on')}</div>`;
  return `<div class="card who">
    <div class="hd">${line('users', 'ti')}<span>Who gets it</span><em>Each sees their own</em></div>
    ${person(N.owner, 'o')}${person(N.gm, 'g')}
  </div>`;
}

function schedCard() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => `<span class="d${i === 0 ? ' mon' : ''}">${d}</span>`).join('');
  return `<div class="card sched">
    <div class="hd">${line('clock', 'ti')}<span>Schedule</span></div>
    <div class="fl"><span class="k">Repeats</span><span class="seg3"><span>Daily</span><span class="wkly">Weekly</span><span class="mo">Monthly</span><i class="knob"></i></span></div>
    <div class="fl"><span class="k">On</span><span class="days">${days}</span></div>
    <div class="fl"><span class="k">At</span><span class="tsel">7:00 AM${icon('caret-down', 'car')}</span><span class="via">${line('envelope', 'ci')}Email</span></div>
    <div class="btn"><span class="b1">${icon('paper-plane-right', 'ci')}Schedule report</span><span class="b2">${icon('check', 'ci')}Next: Mon, Oct 12 · 7:00 AM</span></div>
  </div>`;
}

function inboxCard(p, nums, cls) {
  const pc = (k) => (nums[k] / nums.sales) * 100;
  // Last week's copy ran a little hotter (prime = COGS + labor still holds).
  // Each "label value" stays on one line when the snippet wraps (phone).
  const snip = (dc, dl) =>
    `<i>Prime cost <b>${pct1(pc('cogs') + dc + pc('labor') + dl)}</b></i> · <i>COGS ${pct1(pc('cogs') + dc)}</i> · <i>Labor ${pct1(pc('labor') + dl)}</i>`;
  const mail = (when, wk, extra, dc, dl) =>
    `<div class="ml ${extra}">${MARK}<span class="mt"><span class="l1"><b>Prime Cost P&amp;L · ${esc(p.scope)}</b><time>${when}</time></span><span class="l2"><i>Week of ${wk}</i> · ${snip(dc, dl)}</span></span></div>`;
  return `<div class="card ibx ${cls}">
    <div class="ih">${avatar(p.name, cls === 'g' ? 'gm' : '')}<b>${esc(p.name)}</b><span>${esc(p.role)} · Inbox</span>${line('envelope', 'ie')}</div>
    <div class="mls">${mail('Mon 7:00 AM', WEEK, 'new', 0, 0)}${mail('Oct 5', LAST_WEEK, 'old', 0.4, 0.3)}</div>
  </div>`;
}

// ---- Scene --------------------------------------------------------------------
// L: { meta, compact, touch, swapWho, cursor: { start, rest } }
//   swapWho: the schedule card replaces the recipients card (phone: one slot)
//   touch:   show a fingertip at each tap instead of a gliding mouse pointer

export function makeScene(L) {
  let R;
  let root;
  let N;

  function build(el, data) {
    root = el;
    el.classList.add('db-anim', 'crp');
    if (L.compact) el.classList.add('m');
    N = numbers(data);

    el.innerHTML = `
    ${reportCard(N)}${whoCard(N)}${schedCard()}
    ${inboxCard(N.owner, N.group, 'o')}${inboxCard(N.gm, N.one, 'g')}
    <div class="cursor${L.touch ? ' touch' : ''}"><div class="ripple"></div>${L.touch ? '<div class="tip"></div>' : CURSOR}</div>`;

    const q = (s) => el.querySelector(s);
    const qa = (s) => [...el.querySelectorAll(s)];
    R = {
      rep: q('.rep'),
      who: q('.who'),
      sched: q('.sched'),
      ibx: qa('.ibx'),
      rows: qa('.pr'),
      cogs: q('.pr.cogs'),
      tw: q('.tw'),
      cats: q('.cats'),
      cin: q('.cin'),
      crs: qa('.cr'),
      chipO: q('.sw.o'),
      chipG: q('.sw.g'),
      chip: q('.who-chip'),
      ppO: q('.pp.o'),
      ppG: q('.pp.g'),
      seg: q('.seg3'),
      segItems: qa('.seg3 > span'),
      knob: q('.knob'),
      weekly: q('.wkly'),
      days: q('.days'),
      mon: q('.d.mon'),
      btn: q('.btn'),
      newMail: qa('.ml.new'),
      oldMail: qa('.ml.old'),
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
    const seg3 = R.segItems.map((s) => ({ x: s.offsetLeft, w: s.offsetWidth }));
    return {
      ...L.cursor,
      seg3,
      cats: R.cin.offsetHeight,
      cogs: at(R.cogs, L.compact ? 0.16 : 0.2),
      gm: at(R.ppG, 0.45),
      weekly: at(R.weekly, 0.5),
      mon: at(R.mon, 0.5),
      send: at(R.btn, 0.5),
    };
  }

  const mix = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) });
  const pulse = (t, at) => seg(t, at - 0.06, 0.06) - seg(t, at + 0.04, 0.12);
  const money = (v) => fmt.money(v);

  function frame(t) {
    // Layout is only measurable once the stage is rendered (an embed can start
    // out hidden, e.g. the desktop version on a phone breakpoint).
    const G = R.geo ?? measure();
    if (root.offsetWidth) R.geo = G;
    const C = CUES;
    const out = ease.inOutCubic(seg(t, C.outro[0], C.outro[1]));
    const recede = ease.inOutCubic(seg(t, ...C.recede));

    // ---- Cards in / out -----------------------------------------------------------
    const place = (el, at, dim = 0) => {
      const p = riseIn(el, t, at, { dy: 16, dur: 0.55 });
      el.style.opacity = p * (1 - dim) * (1 - out);
      el.style.transform = `translateY(${lerp(16, 0, p) - out * 10}px) scale(${1 - 0.04 * recede})`;
    };
    place(R.rep, C.rep, 0.82 * recede);
    // On phones the schedule card takes the recipients' slot.
    const whoGone = L.swapWho ? ease.inOutCubic(seg(t, C.whoOut, 0.35)) : 0;
    place(R.who, C.who, Math.max(0.82 * recede, whoGone));
    if (whoGone) R.who.style.transform += ` translateY(${-12 * whoGone}px)`;
    place(R.sched, C.sched, 0.82 * recede);
    R.ibx.forEach((el, i) => {
      const p = riseIn(el, t, C.inbox[0] + i * C.inbox[1], { dy: 22, dur: 0.55, scale: 0.97 });
      el.style.opacity = p * (1 - out);
      el.style.transform += ` translateY(${-10 * out}px)`;
    });

    // ---- 1. Report: rows count up, COGS opens into categories ------------------------
    // ---- 2. …then re-scopes from the whole group to the GM's location --------------
    const rs = ease.inOutCubic(seg(t, ...C.rescope));
    const v = (k) => lerp(N.group[k], N.one[k], rs);
    const sales = v('sales');
    R.rows.forEach((r, i) => {
      const k = r.dataset.k;
      const p = ease.outCubic(seg(t, C.rows[0] + i * 0.08, C.rows[1] - 0.24));
      r.style.opacity = p;
      r.children[1].textContent = money(v(k) * ease.outExpo(p));
      r.children[2].textContent = k === 'sales' ? '100%' : pct1((v(k) / sales) * 100);
    });
    const open = ease.inOutCubic(seg(t, ...C.cats));
    R.cats.style.height = `${(G.cats * open).toFixed(1)}px`;
    R.tw.style.transform = `rotate(${90 * open}deg)`;
    R.cogs.classList.toggle('opened', open > 0);
    const catVals = N.cats.map((_, i) => lerp(N.group.cat[i], N.one.cat[i], rs));
    // Bars: each category against the scope's biggest one.
    const rel = (s) => s.cat.map((c) => c / Math.max(...s.cat));
    const [relG, relL] = [rel(N.group), rel(N.one)];
    R.crs.forEach((r, i) => {
      const p = ease.outCubic(seg(t, C.cats[0] + 0.1 + i * 0.06, 0.4));
      r.style.opacity = p;
      r.style.transform = `translateY(${lerp(6, 0, p)}px)`;
      r.children[1].firstChild.style.width = `${(lerp(relG[i], relL[i], rs) * 100 * ease.outCubic(seg(t, C.cats[0] + 0.25 + i * 0.06, 0.5))).toFixed(1)}%`;
      r.children[2].textContent = money(catVals[i]);
      r.children[3].textContent = pct1((catVals[i] / sales) * 100);
    });
    // Whose view the report shows: the chip slides from the owner to the GM.
    const sw = ease.inOutCubic(seg(t, C.rescope[0] - 0.05, 0.4));
    R.chipO.style.opacity = 1 - sw;
    R.chipO.style.transform = `translateY(${-8 * sw}px)`;
    R.chipG.style.opacity = sw;
    R.chipG.style.transform = `translateY(${8 * (1 - sw)}px)`;
    R.chip.style.setProperty('--flash', sw * (1 - seg(t, C.rescope[0] + 0.5, 0.8)));
    R.rep.style.setProperty('--sheen', seg(t, C.rescope[0], C.rescope[1] + 0.2));

    // Recipients: the selected person is the one the report is previewed as.
    const gmOn = t >= C.gmClick;
    R.ppO.classList.toggle('sel', !gmOn);
    R.ppG.classList.toggle('sel', gmOn);

    // ---- 3. Schedule ------------------------------------------------------------------
    const wk = ease.inOutCubic(seg(t, C.weeklyClick, 0.25));
    const [s1, s2] = [G.seg3[2], G.seg3[1]];
    R.knob.style.transform = `translateX(${lerp(s1.x, s2.x, wk).toFixed(1)}px)`;
    R.knob.style.width = `${lerp(s1.w, s2.w, wk).toFixed(1)}px`;
    R.segItems.forEach((s, i) => s.classList.toggle('cur', i === (t >= C.weeklyClick + 0.1 ? 1 : 2)));
    R.days.style.opacity = lerp(0.35, 1, seg(t, C.weeklyClick, 0.3));
    R.mon.classList.toggle('cur', t >= C.monClick);
    const sent = t >= C.sendClick;
    R.btn.classList.toggle('done', sent);

    // ---- 4. Inboxes: this week's email drops in above last week's ----------------------
    R.newMail.forEach((m, i) => {
      const p = seg(t, C.mail[0] + i * C.mail[1], 0.5);
      const h = m.offsetHeight || 1;
      m.style.marginTop = `${(-h * (1 - ease.outCubic(p))).toFixed(1)}px`;
      m.style.opacity = ease.outCubic(seg(t, C.mail[0] + i * C.mail[1] + 0.1, 0.35));
      m.style.setProperty('--hl', 1 - seg(t, C.mail[0] + i * C.mail[1] + 0.6, 1.2));
    });

    // ---- Cursor -----------------------------------------------------------------------
    const clicks = [C.cogsClick, C.gmClick, C.weeklyClick, C.monClick, C.sendClick];
    const click = Math.max(...clicks.map((c) => pulse(t, c)));
    const last = [...clicks].reverse().find((c) => t >= c);
    const rip = last != null && t < last + 0.45 ? seg(t, last, 0.45) : 0;
    R.ripple.style.opacity = rip > 0 && rip < 1 ? 1 - rip : 0;
    if (L.touch) {
      // A fingertip lands on each control just before its tap and lifts after.
      const taps = [G.cogs, G.gm, G.weekly, G.mon, G.send];
      const i = clicks.reduce((b, c, j) => (Math.abs(t - c) < Math.abs(t - clicks[b]) ? j : b), 0);
      const at = clicks[i];
      R.cursor.style.opacity = seg(t, at - 0.3, 0.14) * (1 - seg(t, at + 0.15, 0.25));
      R.cursor.style.transform = `translate(${taps[i].x.toFixed(1)}px, ${taps[i].y.toFixed(1)}px) scale(${1 - click * 0.18})`;
      R.ripple.style.transform = `scale(${lerp(0.5, 1.6, rip)})`;
      return;
    }
    let pos = mix(G.start, G.cogs, ease.inOutCubic(seg(t, ...C.toCogs)));
    pos = mix(pos, G.gm, ease.inOutCubic(seg(t, ...C.toGm)));
    pos = mix(pos, G.weekly, ease.inOutCubic(seg(t, ...C.toWeekly)));
    pos = mix(pos, G.mon, ease.inOutCubic(seg(t, ...C.toMon)));
    pos = mix(pos, G.send, ease.inOutCubic(seg(t, ...C.toSend)));
    pos = mix(pos, G.rest, ease.inOutCubic(seg(t, ...C.cursorOut)));
    R.cursor.style.opacity = seg(t, ...C.cursorIn) * (1 - seg(t, C.cursorOut[0] + 0.1, 0.3));
    R.cursor.style.transform = `translate(${(pos.x - 4).toFixed(1)}px, ${(pos.y - 2.5).toFixed(1)}px) scale(${1 - click * 0.12})`;
    R.ripple.style.transform = `translate(4px, 2.5px) scale(${lerp(0.3, 1.4, rip)})`;
  }

  return { meta: L.meta, build, frame };
}

