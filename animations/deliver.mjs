// Copies everything in dist/ to one folder (default: ~/Desktop/DishBooks
// Animations) and writes two pages there:
//   Open deliverables.html  every animation playing, with its files,
//                           copy-to-clipboard Webflow embeds, and the other
//                           audiences' versions
//   Section mockup.html     the homepage tabs section with the animations in
//                           place (desktop / phone), see mockup.mjs
// Re-run after rendering to refresh it.
//
//   npm run anim:deliver
//   npm run anim:deliver -- --out ~/Dropbox/DishBooks\ Animations

import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { ROOT, listScenarios } from './serve.mjs';
import { sectionMockup } from './mockup.mjs';

const { values: args } = parseArgs({
  options: { out: { type: 'string', default: join(homedir(), 'Desktop', 'DishBooks Animations') } },
});
const OUT = args.out.replace(/^~(?=\/)/, homedir());
const DIST = join(ROOT, 'dist');

// Website section each animation was made for. Scenes not listed here still
// show up, titled from their folder name.
const SECTIONS = {
  'smart-ops-dashboard': {
    title: 'Smart Ops Dashboard',
    section: 'SMART OPS DASHBOARD — Every number that matters, the moment you log in.',
  },
  'ops-calendar': {
    title: 'Ops Calendar & 13-Period Accounting',
    section: 'OPS CALENDAR & 13-PERIOD ACCOUNTING — Your restaurant runs on weeks. Your books should too.',
  },
  'custom-reports': {
    title: 'Custom Reporting',
    section: 'CUSTOM REPORTS — The right numbers, to exactly the right person.',
  },
};

const exists = (p) => stat(p).then(() => true, () => false);
const kb = async (p) => ((await stat(p)).size / 1024).toFixed(0);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const titleCase = (id) => id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ---- Gather -----------------------------------------------------------------
const rendered = (await readdir(DIST, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);
const scenarios = [];
for (const id of await listScenarios()) {
  const d = JSON.parse(await readFile(join(ROOT, 'scenarios', `${id}.json`), 'utf8'));
  scenarios.push({ id, audience: d.audience, company: d.company.name });
}
scenarios.sort((a, b) => (a.id === 'home' ? -1 : b.id === 'home' ? 1 : a.audience.localeCompare(b.audience)));

// Group <scene> with <scene>-mobile.
const order = (s) => (s in SECTIONS ? Object.keys(SECTIONS).indexOf(s) : 99);
const groups = rendered
  .filter((s) => !s.endsWith('-mobile'))
  .sort((a, b) => order(a) - order(b) || a.localeCompare(b))
  .map((s) => ({ id: s, ...(SECTIONS[s] ?? { title: titleCase(s), section: '' }), variants: [s, `${s}-mobile`].filter((v) => rendered.includes(v)) }));

const embeds = {}; // "<scene>/<scenario>" → embed HTML (for the copy buttons)
const files = async (scene, scenario) => {
  const base = join(DIST, scene, scenario, scene);
  const out = {};
  for (const ext of ['webm', 'mp4', 'jpg', 'html', 'embed.html']) {
    if (await exists(`${base}.${ext}`)) out[ext] = { href: `files/${scene}/${scenario}/${scene}.${ext}`, kb: await kb(`${base}.${ext}`) };
  }
  if (out['embed.html']) embeds[`${scene}/${scenario}`] = await readFile(`${base}.embed.html`, 'utf8');
  return out;
};

// ---- Page -------------------------------------------------------------------
const fontCss = await (async () => {
  const css = await readFile(join(ROOT, 'shared/base.css'), 'utf8');
  let out = '';
  for (const m of css.matchAll(/@font-face\s*{[^}]*}/g)) {
    let block = m[0];
    for (const [, f] of block.matchAll(/url\('fonts\/([^']+)'\)/g)) {
      block = block.replace(`url('fonts/${f}')`, `url(data:font/woff2;base64,${(await readFile(join(ROOT, 'shared/fonts', f))).toString('base64')})`);
    }
    out += block;
  }
  return out;
})();

const btn = (f, label) => (f ? `<a class="btn" href="${esc(f.href)}" download>${label} <small>${f.kb} KB</small></a>` : '');
const copyBtn = (key, label = 'Copy embed code') =>
  embeds[key] ? `<button class="btn primary" type="button" data-copy="${esc(key)}">${label} <small>${(embeds[key].length / 1000).toFixed(1)}k chars</small></button>` : '';
const videoSnippet = (scene, f, label) =>
  `<video autoplay muted loop playsinline preload="metadata" poster="${f.jpg ? `${scene}.jpg` : ''}" aria-label="${label}" style="display:block;width:100%;height:auto;border-radius:12px">\n  <source src="${scene}.webm" type="video/webm">\n  <source src="${scene}.mp4" type="video/mp4">\n</video>`;

let body = '';
for (const g of groups) {
  let players = '';
  for (const v of g.variants) {
    const f = await files(v, 'home');
    const mobile = v.endsWith('-mobile');
    const snippetKey = `video:${v}`;
    embeds[snippetKey] = videoSnippet(v, f, `DishBooks ${g.title}`);
    players += `<figure class="${mobile ? 'mob' : 'desk'}">
      <div class="label">${mobile ? 'Mobile' : 'Desktop & tablet'}</div>
      ${f.webm || f.mp4 ? `<video autoplay muted loop playsinline poster="${f.jpg?.href ?? ''}">${f.webm ? `<source src="${esc(f.webm.href)}" type="video/webm">` : ''}${f.mp4 ? `<source src="${esc(f.mp4.href)}" type="video/mp4">` : ''}</video>` : f.jpg ? `<img src="${esc(f.jpg.href)}" alt="">` : ''}
      <div class="btns">${btn(f.webm, 'WebM')}${btn(f.mp4, 'MP4')}${btn(f.jpg, 'Poster JPG')}</div>
      <div class="btns">${copyBtn(`${v}/home`, 'Copy HTML embed')}${f.webm ? `<button class="btn" type="button" data-copy="${snippetKey}">Copy video tag</button>` : ''}${f.html ? `<a class="btn" href="${esc(f.html.href)}" target="_blank">Open live ↗</a>` : ''}</div>
    </figure>`;
  }

  let rows = '';
  for (const s of scenarios.filter((x) => x.id !== 'home')) {
    const thumbs = [];
    const btns = [];
    for (const v of g.variants) {
      const f = await files(v, s.id);
      if (!Object.keys(f).length) continue;
      const mobile = v.endsWith('-mobile');
      // Thumbnails open the live version.
      if (f.jpg) thumbs.push(`<a href="${esc(f.html?.href ?? f.jpg.href)}" target="_blank" title="Open live"><img loading="lazy" src="${esc(f.jpg.href)}" alt="${mobile ? 'Mobile' : 'Desktop'} poster"></a>`);
      btns.push(copyBtn(`${v}/${s.id}`, mobile ? 'Copy mobile embed' : 'Copy embed'));
    }
    if (thumbs.length || btns.length) rows += `<div class="aud"><div class="aud-h"><b>${esc(s.audience)}</b><span>${esc(s.company)}</span></div><div class="aud-c">${thumbs.join('')}</div><div class="btns sm">${btns.join('')}</div></div>`;
  }

  body += `<section>
    <div class="sh"><h2>${esc(g.title)}</h2>${g.section ? `<p class="sec">${esc(g.section)}</p>` : ''}</div>
    <div class="players">${players}</div>
    ${rows ? `<details><summary>Other audiences (${scenarios.length - 1}): posters, live previews and embeds (click a poster to open it live)</summary>
      <p class="note">Videos are only rendered for the homepage version. To render one of these as video: <code>npm run anim:render -- --scene ${g.id} --scenario &lt;name&gt;</code>${g.variants.length > 1 ? ` (and <code>--scene ${g.id}-mobile</code>)` : ''}, then <code>npm run anim:deliver</code>.</p>
      <div class="auds">${rows}</div></details>` : ''}
  </section>`;
}

const commit = (() => {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
  } catch {
    return '';
  }
})();
const when = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>DishBooks Animations</title>
<style>
${fontCss}
:root { --bg: #f2f4f7; --card: #fff; --line: rgb(130 133 140 / 18%); --text: #0b0c0d; --muted: rgb(11 12 13 / 60%); --primary: #326cff; --primary-ink: #1440ad; --tint: rgb(50 108 255 / 10%); }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font: 14px/1.45 'Albert Sans', system-ui, sans-serif; }
header { padding: 32px 24px 8px; max-width: 1180px; margin: 0 auto; }
h1 { font-size: 26px; font-weight: 600; letter-spacing: -0.4px; margin: 0 0 4px; }
header p { margin: 0; color: var(--muted); }
header a { color: var(--primary-ink); font-weight: 600; }
main { max-width: 1180px; margin: 0 auto; padding: 16px 24px 80px; display: grid; gap: 24px; }
section, .help { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 22px; }
.sh h2 { font-size: 19px; font-weight: 600; margin: 0; }
.sec { margin: 4px 0 0; font-size: 12px; letter-spacing: 0.3px; color: var(--muted); }
.players { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 24px; margin-top: 18px; align-items: start; }
.players:has(figure:only-child) { grid-template-columns: minmax(0, 1fr); max-width: 760px; }
figure { margin: 0; display: grid; gap: 10px; }
figure video, figure img { width: 100%; display: block; border-radius: 10px; border: 1px solid var(--line); background: var(--bg); }
.label { font-size: 11px; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; color: var(--muted); }
.btns { display: flex; flex-wrap: wrap; gap: 6px; }
.btn { font: 500 12.5px/1 'Albert Sans', system-ui, sans-serif; display: inline-flex; gap: 6px; align-items: center; padding: 8px 11px; border-radius: 8px; border: 1px solid var(--line); background: #fff; color: var(--text); text-decoration: none; cursor: pointer; }
.btn:hover { border-color: var(--primary); color: var(--primary-ink); }
.btn small { color: var(--muted); font-weight: 400; }
.btn.primary { background: var(--tint); border-color: transparent; color: var(--primary-ink); }
.btn.done { background: #e7f6ec; color: #00792d; }
.btns.sm .btn { padding: 6px 9px; font-size: 12px; }
details { margin-top: 20px; border-top: 1px solid var(--line); padding-top: 14px; }
summary { cursor: pointer; font-weight: 600; }
.note { color: var(--muted); font-size: 12.5px; }
code { font: 12px ui-monospace, Menlo, monospace; background: var(--bg); padding: 2px 5px; border-radius: 4px; }
.auds { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 14px; }
.aud { border: 1px solid var(--line); border-radius: 10px; padding: 12px; display: grid; gap: 10px; align-content: start; }
.aud-h { display: flex; justify-content: space-between; gap: 8px; }
.aud-h span { color: var(--muted); font-size: 12.5px; text-align: right; }
.aud-c { display: grid; grid-template-columns: minmax(0, 1fr) 90px; gap: 10px; align-items: start; }
.aud-c:has(a:only-child) { grid-template-columns: minmax(0, 1fr); }
.aud-c img { width: 100%; display: block; border-radius: 6px; border: 1px solid var(--line); }
.help h2 { font-size: 16px; margin: 0 0 8px; }
.help ol { margin: 0; padding-left: 20px; display: grid; gap: 6px; }
@media (max-width: 760px) { .players { grid-template-columns: 1fr; } .players .mob { max-width: 320px; } }
</style></head>
<body>
<header>
  <h1>DishBooks animations</h1>
  <p>Updated ${esc(when)}${commit ? ` · commit ${esc(commit)}` : ''} · all names and numbers are fictional · <a href="Section mockup.html">See them in the homepage section ↗</a></p>
</header>
<main>
${body}
<div class="help">
  <h2>Putting one on dishbooks.com (Webflow)</h2>
  <ol>
    <li><b>Video:</b> upload the WebM and MP4 (and the poster) to Webflow Assets. Then add an Embed element, paste the <b>video tag</b> and swap in each file's asset URL.</li>
    <li><b>Or the HTML embed:</b> paste the copied <b>HTML embed</b> into an Embed element. It renders live and sharp, needs no uploads, and stays under Webflow's 50,000-character limit.</li>
    <li><b>Mobile:</b> add both versions to the section. Hide the desktop one on Mobile Landscape and Mobile Portrait, and hide the mobile one on Desktop and Tablet.</li>
  </ol>
  <p class="note">The files are in the <code>files</code> folder next to this page. To refresh this folder after re-rendering, run <code>npm run anim:deliver</code> in the DishBooks repo.</p>
</div>
</main>
<script type="application/json" id="embeds">${JSON.stringify(embeds).replace(/</g, '\\u003c')}</script>
<script>
  const embeds = JSON.parse(document.getElementById('embeds').textContent);
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    const text = embeds[b.dataset.copy];
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      document.body.append(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const html = b.innerHTML;
    b.classList.add('done');
    b.textContent = 'Copied ✓';
    setTimeout(() => { b.classList.remove('done'); b.innerHTML = html; }, 1400);
  });
</script>
</body></html>
`;

// ---- Write ------------------------------------------------------------------
await mkdir(OUT, { recursive: true });
await rm(join(OUT, 'files'), { recursive: true, force: true }); // only ever our own copy
await cp(DIST, join(OUT, 'files'), { recursive: true, filter: (src) => !/\/\.|\.DS_Store$/.test(src.slice(DIST.length)) });
await writeFile(join(OUT, 'Open deliverables.html'), page);
const videos = new Set();
for (const s of rendered) if (await exists(join(DIST, s, 'home', `${s}.webm`))) videos.add(s);
await writeFile(join(OUT, 'Section mockup.html'), sectionMockup({ fontCss, has: (s) => videos.has(s) }));
console.log(`✓ ${OUT}/Open deliverables.html`);
console.log(`✓ ${OUT}/Section mockup.html`);
