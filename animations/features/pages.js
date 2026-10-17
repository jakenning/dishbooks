// App pages shared by the feature stories: refs and load motion for Home, the
// Prime Cost P&L and the Dex panel (markup from ../scenes/why-dishbooks/app.js).
// Stories import from here, never from each other: render.mjs bundles a scene's
// modules into one scope, where two STORY consts would collide.

import { seg, ease, lerp, clamp, riseIn, countUp } from '../lib/timeline.js';
import { icon } from '../shared/icons.js';
import { kMoney, pct, esc, answerHtml } from '../scenes/why-dishbooks/app.js';

/** Home's element refs; each KPI card knows its KPI (phones drop EBITDA). */
export function homeRefs(q, qa, L, D) {
  const ks = L.compact ? D.kpis.filter((k) => k.key !== 'ebitda') : D.kpis;
  return {
    kpis: qa('.kpi').map((k, i) => ({ el: k, kv: k.querySelector('.kv'), rv: k.querySelector('.rv'), d: ks[i] })),
    salesp: q('.salesp'),
    salesRv: q('.sales .rv'),
    cost: q('.cost'),
    slices: qa('.slice'),
    dc: q('.dc'),
    costItems: qa('.cl li'),
  };
}

/** Home's load: KPI cards rise and count up, the charts draw (as on the homepage hero). */
export function homeLoad(t, R, L, D, k0) {
  R.kpis.forEach(({ el, kv, rv, d }, i) => {
    const s = k0 + i * 0.07;
    riseIn(el, t, s, { dy: 12, dur: 0.5 });
    const v = countUp(t, s + 0.05, 1.3, d.value);
    kv.textContent = d.format === 'pct' ? pct(v) : kMoney(v);
    rv.setAttribute('width', (212 * ease.inOutCubic(seg(t, s + 0.2, 1.0))).toFixed(1));
  });
  riseIn(R.salesp, t, k0 + 0.25, { dy: 12 });
  R.salesRv.setAttribute('width', (L.sales.W * ease.inOutCubic(seg(t, k0 + 0.3, 1.1))).toFixed(1));
  riseIn(R.cost, t, k0 + 0.33, { dy: 12 });
  const sweep = ease.outQuart(seg(t, k0 + 0.45, 1.1));
  const circ = 2 * Math.PI * L.donut * 0.418;
  let cum = 0;
  R.slices.forEach((s) => {
    const f = Number(s.dataset.f);
    s.setAttribute('stroke-dasharray', `${Math.max(0, f * circ * sweep - 2).toFixed(2)} ${circ.toFixed(2)}`);
    s.setAttribute('stroke-dashoffset', (-cum * circ * sweep).toFixed(2));
    cum += f;
  });
  R.dc.style.opacity = seg(t, k0 + 0.7, 0.4);
  R.costItems.forEach((li, i) => riseIn(li, t, k0 + 0.6 + i * 0.06, { dy: 4, dur: 0.35 }));
}

/** The Prime Cost P&L's element refs (phones show the flagged location next to the total). */
export function plRefs(q, qa, L, D) {
  const R = {
    tiles: qa('.tile'),
    plc: q('.plc'),
    plRows: qa('.pt > .tr:not(.th)'),
    cogs: q('.tr.cogs'),
    tw: q('.tw'),
    cats: q('.cats'),
    cin: q('.cin'),
    crs: qa('.cr'),
    fls: qa('.pt .fl'),
  };
  R.plVals = R.plRows.map((r) => ({ k: r.dataset.row, cells: [...r.children].slice(1) }));
  return R;
}

/** The P&L at story time t: tiles and rows count up from p0, COGS opens over C.cats, the outlier flags at C.flag. */
export function plFrame(t, R, L, N, C) {
  const shown = qShown(R);
  const cols = (L.compact ? (N.cols.length > 1 ? [N.cols[Math.max(0, N.flagRow)], N.cols[N.cols.length - 1]] : N.cols) : N.cols).slice(0, shown);
  R.tiles.forEach((el, i) => riseIn(el, t, C.p0 + i * 0.06, { dy: 10, dur: 0.45 }));
  riseIn(R.plc, t, C.p0 + 0.1, { dy: 12 });
  const grow = ease.outExpo(seg(t, C.p0 + 0.2, 0.9));
  R.plVals.forEach(({ k, cells }, ri) => {
    riseIn(R.plRows[ri], t, C.p0 + 0.18 + ri * 0.05, { dy: 4, dur: 0.3 });
    if (k === 'pp') return;
    cells.forEach((cell, ci) => {
      cell.textContent = kMoney(cols[ci][k] * 100 * grow);
    });
  });
  const open = C.cats ? ease.inOutCubic(seg(t, ...C.cats)) : 0;
  R.cats.style.height = `${(R.cin.offsetHeight * open).toFixed(1)}px`;
  R.tw.style.transform = `rotate(${90 * open}deg)`;
  R.crs.forEach((r, i) => {
    const p = C.cats ? ease.outCubic(seg(t, C.cats[0] + 0.08 + i * 0.05, 0.35)) : 0;
    r.style.opacity = p;
    r.style.transform = `translateY(${lerp(5, 0, p).toFixed(2)}px)`;
  });
  const fl = ease.outCubic(seg(t, C.flag, 0.35));
  R.fls.forEach((c) => {
    c.style.setProperty('--fl', fl);
    c.classList.toggle('on', fl > 0.5);
  });
}
const qShown = (R) => R.plRows[0].children.length - 1;

/** The Dex panel (docked on desktop, a sheet on phones), as on the homepage hero. */
export function dexPanel(D) {
  const u = D.user;
  return `<aside class="dex">
      <header><span class="orb"></span><b>Dex</b><span class="ai">AI</span><span class="grow"></span>${icon('x')}</header>
      <div class="dex-body">
        <div class="msg"><span class="orb sm"></span><div class="dex-message"><p>Hi ${esc(u.firstName)}, ask me anything about your numbers.</p></div></div>
        <div class="bubble">${esc(D.dex.ask)}</div>
        <div class="msg ans"><span class="orb sm"></span><div class="dex-message">${answerHtml(D.dex.answer)}<div class="dots"><i></i><i></i><i></i></div></div></div>
      </div>
      <footer><div class="input"><span class="typed"></span><span class="caret"></span><span class="ph">Ask Dex about your numbers…</span><span class="send">${icon('paper-plane-right')}</span></div></footer>
    </aside>`;
}

export function dexRefs(q, qa) {
  return {
    views: q('.views'),
    dex: q('.dex'),
    input: q('.dex .input'),
    bubble: q('.bubble'),
    ans: q('.msg.ans'),
    dots: q('.dots'),
    words: qa('.ans .wd'),
    typed: q('.typed'),
    caret: q('.caret'),
    ph: q('.ph'),
  };
}

/** Dex at story time t: C = { dexIn: [s, d], typeAsk: [s, d], send, thinking: [s, d], answer: [s, d], dexOut? }. */
export function dexFrame(t, R, L, D, C) {
  const dexIn = ease.outCubic(seg(t, ...C.dexIn)) * (C.dexOut == null ? 1 : 1 - ease.inOutCubic(seg(t, C.dexOut, 0.35)));
  R.dex.style.opacity = dexIn;
  R.dex.style.visibility = dexIn <= 0.001 ? 'hidden' : 'visible';
  // Desktop: the page makes room for the panel.
  if (!L.compact) R.views.style.right = `${(L.dexRoom * dexIn).toFixed(1)}px`;
  R.dex.style.transform = L.compact ? `translateY(${lerp(60, 0, dexIn).toFixed(2)}px)` : `translateX(${lerp(40, 0, dexIn).toFixed(2)}px)`;
  const ask = D.dex.ask;
  const sent = t >= C.send;
  const nChars = Math.round(ask.length * seg(t, ...C.typeAsk));
  R.typed.textContent = sent ? '' : ask.slice(0, nChars);
  R.ph.style.display = nChars === 0 || sent ? '' : 'none';
  const blinkOn = nChars < ask.length || Math.floor(t * 3) % 2 === 0;
  R.caret.style.opacity = !sent && t >= C.dexIn[0] + 0.25 && blinkOn ? 1 : 0;
  const bub = ease.outCubic(seg(t, C.send, 0.3));
  R.bubble.style.opacity = bub;
  R.bubble.style.transform = `translateY(${lerp(10, 0, bub).toFixed(2)}px)`;
  R.ans.style.opacity = seg(t, C.thinking[0], 0.15);
  R.dots.style.opacity = t < C.answer[0] ? 1 : 0;
  [...R.dots.children].forEach((d, i) => {
    d.style.transform = `translateY(${(Math.sin(t * 9 - i * 0.9) * -2.5).toFixed(2)}px)`;
  });
  const words = R.words.length * seg(t, ...C.answer);
  R.words.forEach((w, i) => (w.style.opacity = clamp(words - i)));
}
