// "Section mockup.html": the homepage's "What DishBooks does for your
// restaurant" tabs, rebuilt from dishbooks.com (copy, sizes and styles taken
// from the live Webflow page, Oct 2026) with the rendered animations in the
// image slot. Desktop / Phone toggle at the top; the phone view uses the same
// breakpoint swap you'd set up in Webflow (≤ 767px shows the -mobile video).
//
// Written by deliver.mjs next to its files/ folder.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Live copy. `scene` = the animation that replaces the tab's photo.
const TABS = [
  {
    id: 'smart-dashboard',
    tab: 'Smart Dashboard',
    eyebrow: 'Smart Ops Dashboard',
    title: 'Every number that matters, the moment you log in.',
    body: 'Cash balance, prime cost, net profit, sales trend, and more — updated automatically, in one place.',
    points: ['Automate reporting and save hours every week', 'Control costs and act on real-time data', "Restaurant KPI's at your fingertips - no more digging through reports"],
    link: 'Smart Dashboard',
    scene: 'smart-ops-dashboard',
  },
  {
    id: 'ops-calendar',
    tab: 'Ops Calendar',
    eyebrow: 'OPS CALENDAR & 13-PERIOD ACCOUNTING',
    title: 'Your restaurant runs on weeks. Your books should too.',
    body: 'Run your books on 13 four-week periods, on 4-4-5, 4-5-4 or 5-4-4, or on standard calendar months. Every report follows the calendar you choose.',
    points: ['The same number of weekends in every period', '13-period, 4-4-5, 4-5-4, 5-4-4, or standard 12-period', 'Payroll, prime cost, and your P&L on the same cycle'],
    link: 'Fiscal Calendar Accounting',
    scene: 'ops-calendar',
  },
  {
    id: 'custom-reporting',
    tab: 'Custom Reporting',
    eyebrow: 'Custom reports',
    title: 'The right numbers, to exactly the right person.',
    body: 'Prebuilt Ops and Prime Cost P&Ls, with COGS split out by your custom categories. Build your own report template, decide who sees each one, and have it land in their inbox on your schedule.',
    points: ['Prime cost and COGS by category, on every report', 'A GM sees their location, an owner sees the whole group', 'Reports emailed on the cadence you set'],
    link: 'Custom Reporting',
    scene: 'custom-reports',
  },
];

const BULLET = `<svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true"><path d="M11 6C11 2.7 8.2.1 4.8 0H.5C.2 0 0 .2 0 .5v11c0 .3.2.5.5.5h4.3C8.2 11.9 11 9.3 11 6Z" fill="#326CFF"/></svg>`;
const ARROW = `<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="m17.3 10.4-5.6 5.7a.6.6 0 0 1-.9-.9l4.6-4.6H3.1a.6.6 0 0 1 0-1.2h12.3l-4.6-4.6a.6.6 0 0 1 .9-.9l5.6 5.6a.6.6 0 0 1 0 .9Z" fill="#326CFF"/></svg>`;

/**
 * @param fontCss  @font-face rules for Albert Sans (inlined)
 * @param has      (scene) => boolean, whether files/<scene>/home/<scene>.webm exists
 */
export function sectionMockup({ fontCss, has }) {
  const video = (scene, cls) =>
    `<video class="${cls}" autoplay muted loop playsinline poster="files/${scene}/home/${scene}.jpg"><source src="files/${scene}/home/${scene}.webm" type="video/webm"><source src="files/${scene}/home/${scene}.mp4" type="video/mp4"></video>`;
  const media = (t) => {
    if (t.scene && has(t.scene)) {
      const mobile = has(`${t.scene}-mobile`);
      return `<div class="media anim${mobile ? ' has-m' : ''}">${video(t.scene, 'v-desk')}${mobile ? video(`${t.scene}-mobile`, 'v-mob') : ''}</div>`;
    }
    return `<div class="media photo"><img src="${esc(t.photo ?? '')}" alt=""></div>`;
  };

  const tabs = TABS.map((t, i) => `<button class="tab${i === 1 ? ' cur' : ''}" type="button" data-tab="${t.id}">${esc(t.tab)}</button>`).join('');
  const panes = TABS.map(
    (t, i) => `<div class="pane${i === 1 ? ' on' : ''}" id="${t.id}">
      <div class="copy">
        <div class="eyebrow">${esc(t.eyebrow)}</div>
        <h2>${esc(t.title)}</h2>
        <p>${esc(t.body)}</p>
        <ul>${t.points.map((p) => `<li>${BULLET}<span>${esc(p)}</span></li>`).join('')}</ul>
        <a class="ghost" href="#${t.id}">Learn more about ${esc(t.link)} ${ARROW}</a>
      </div>
      ${media(t)}
    </div>`,
  ).join('');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>DishBooks section mockup</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@500&display=swap">
<style>
${fontCss}
* { box-sizing: border-box; }
html, body { margin: 0; }
body { background: #e4e7ee; font-family: 'Albert Sans', system-ui, sans-serif; color: #0b0c0d; }

/* Viewer chrome (not part of the mockup) */
.bar { position: sticky; top: 0; z-index: 5; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; padding: 10px 20px; background: #0b0c0d; color: #fff; font-size: 13px; }
.bar b { font-weight: 600; }
.bar span { color: rgb(255 255 255 / 60%); }
.seg { display: flex; gap: 2px; padding: 3px; background: rgb(255 255 255 / 12%); border-radius: 99px; }
.seg button { font: 500 13px/1 'Albert Sans', system-ui, sans-serif; color: #fff; background: none; border: 0; padding: 7px 14px; border-radius: 99px; cursor: pointer; }
.seg button.on { background: #326cff; }
.stage { padding: 0; transition: padding .2s; }
.frame { margin: 0 auto; background: #f2f4f7; container-type: inline-size; }
body.phone .stage { padding: 32px 16px 64px; }
/* Already on a phone: no toggle, and a one-line bar that scrolls away. */
@media (max-width: 700px) { .bar { position: static; padding: 8px 12px; } .bar span, .seg { display: none; } }
body.phone .frame { width: 375px; border-radius: 40px; border: 10px solid #0b0c0d; overflow: hidden; box-shadow: 0 30px 60px -20px rgb(16 24 40 / 40%); }

/* ---- The section, as on dishbooks.com ---- */
.v2-section { padding: 0 40px; border-bottom: 1px solid #d5d8e0; background: radial-gradient(circle at 50% 200%, #f9fafc, rgb(234 236 242 / 50%) 75%); }
.container { max-width: 1512px; margin: 0 auto; border-left: 1px solid #d5d8e0; border-right: 1px solid #d5d8e0; }
.wrap { display: flex; flex-direction: column; gap: 40px; padding: 120px 80px; }
.intro { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.intro > div { display: flex; flex-direction: column; gap: 24px; }
h2 { margin: 0; font-size: 36px; line-height: 40px; font-weight: 600; letter-spacing: -1px; }
p { margin: 0; font-size: 16px; line-height: 32px; color: #5f6166; }
.tabs { display: flex; padding: 4px; background: #fdfdff; border-radius: 120px; box-shadow: 0 5px 20px -10px rgb(4 29 92 / 16%); }
.tab { flex: 1; font: 400 16px/32px 'Albert Sans', system-ui, sans-serif; color: #0b0c0d; background: none; border: 0; padding: 12px 24px; border-radius: 120px; cursor: pointer; white-space: nowrap; }
.tab.cur { background: #326cff; color: #fdfdff; }
.pane { display: none; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 32px; }
.pane.on { display: grid; }
.copy { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 24px; }
.eyebrow { font: 500 12px/32px 'DM Mono', ui-monospace, monospace; letter-spacing: .6px; text-transform: uppercase; color: #326cff; }
ul { list-style: none; margin: 0 0 10px; padding: 0; }
li { display: flex; align-items: center; gap: 8px; padding: 8px 0; font-size: 16px; line-height: 32px; font-weight: 500; color: #222326; }
li svg { flex: none; }
.ghost { display: inline-flex; align-items: center; gap: 4px; font-size: 16px; line-height: 32px; color: #326cff; text-decoration: none; }
.media { border-radius: 8px; overflow: hidden; min-height: 100%; }
.media.photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.media.anim { align-self: center; min-height: 0; box-shadow: 0 1px 2px rgb(16 24 40 / 6%); }
.media video { display: block; width: 100%; height: auto; }
.media .v-mob { display: none; }

/* Webflow tablet (≤ 991px) keeps two columns; mobile (≤ 767px) stacks. */
@container (max-width: 767px) {
  .v2-section { padding: 0 12px; }
  .wrap { padding: 48px 12px; gap: 24px; }
  .intro, .pane.on { grid-template-columns: 1fr; gap: 24px; }
  h2 { font-size: 28px; line-height: 36px; }
  .tabs { background: none; box-shadow: none; padding: 0 0 8px; gap: 8px; overflow-x: auto; border-radius: 0; scrollbar-width: none; }
  .tab { flex: none; background: #fdfdff; padding: 12px 20px; }
  li { line-height: 24px; }
  .pane { margin-top: 0; }
  .media.photo { height: 390px; }
  .has-m .v-desk { display: none; }
  .has-m .v-mob { display: block; }
}
</style></head>
<body>
<div class="bar">
  <div><b>Section mockup</b> <span>· homepage "What DishBooks does" tabs, with the animations in place of the photos · not the live site</span></div>
  <div class="seg"><button type="button" class="on" data-view="desktop">Desktop</button><button type="button" data-view="phone">Phone</button></div>
</div>
<div class="stage"><div class="frame">
  <section class="v2-section"><div class="container"><div class="wrap">
    <div class="intro"><div>
      <h2>What DishBooks does for your restaurant</h2>
      <p>From daily sales to bank reconciliation, DishBooks brings everything into one system.</p>
    </div></div>
    <div>
      <div class="tabs" role="tablist">${tabs}</div>
      ${panes}
    </div>
  </div></div></section>
</div></div>
<script>
  // Tabs: show the pane and restart its animation so the story plays from the top.
  const show = (id) => {
    if (!document.getElementById(id)) return;
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('cur', t.dataset.tab === id));
    document.querySelectorAll('.pane').forEach((p) => p.classList.toggle('on', p.id === id));
    document.querySelectorAll('#' + id + ' video').forEach((v) => { v.currentTime = 0; v.play().catch(() => {}); });
    history.replaceState(null, '', '#' + id);
  };
  document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => show(t.dataset.tab)));
  document.querySelectorAll('.ghost').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));
  document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('[data-view]').forEach((x) => x.classList.toggle('on', x === b));
    document.body.classList.toggle('phone', b.dataset.view === 'phone');
    document.querySelectorAll('.pane.on video').forEach((v) => { v.currentTime = 0; v.play().catch(() => {}); });
  }));
  if (location.hash) show(location.hash.slice(1));
  if (new URLSearchParams(location.search).has('phone')) document.querySelector('[data-view=phone]').click();
</script>
</body></html>
`;
}
