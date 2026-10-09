#!/usr/bin/env node
// Checks the Why DishBooks window on the published Webflow page: the straddle,
// the two Background Videos, the play/pause button, overflow and console
// errors, at six widths. Writes screenshots, report.json, report.md and a
// contact sheet (contact-sheet.png) to --out.
//
//   node verify/why-dishbooks.mjs                       # https://dish-books.webflow.io/why-dishbooks
//   node verify/why-dishbooks.mjs --url http://localhost:4174/why-dishbooks.html   # local fixture
//   node verify/why-dishbooks.mjs --no-sharpness
//
// Only *.webflow.io (staging) and localhost are allowed. Production is refused.
// Read-only: the page is loaded and clicked (play/pause), nothing is submitted.

import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const HERE = dirname(fileURLToPath(import.meta.url));
const ANIM = join(HERE, '..');

const { values: args } = parseArgs({
  options: {
    url: { type: 'string', default: 'https://dish-books.webflow.io/why-dishbooks' },
    out: { type: 'string', default: join(ANIM, 'dist/verify/why-dishbooks') },
    widths: { type: 'string', default: '1920,1440,1024,768,375,320' },
    'no-sharpness': { type: 'boolean', default: false },
  },
});

const url = new URL(args.url);
if (!(url.hostname.endsWith('.webflow.io') || ['localhost', '127.0.0.1'].includes(url.hostname))) {
  console.error(`Refusing ${url.hostname}: this test runs on the webflow.io staging subdomain (or a local fixture), never production.`);
  process.exit(2);
}

const WIDTHS = args.widths.split(',').map(Number);
const PHONE_MAX = 767; // Webflow's "small" breakpoint: anim-phone shows, anim-desktop hides
const SCENES = {
  desktop: { cls: 'anim-desktop', file: 'why-dishbooks', ours: join(ANIM, 'dist/why-dishbooks/home/why-dishbooks.mp4'), w: 1920, h: 1080 },
  phone: { cls: 'anim-phone', file: 'why-dishbooks-mobile', ours: join(ANIM, 'dist/why-dishbooks-mobile/home/why-dishbooks-mobile.mp4'), w: 1000, h: 1800 },
};
const TOL = { centre: 3, aspect: 0.01 };

await mkdir(args.out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' }); // Google Chrome: H.264 like real visitors
const results = [];
const srcs = {};

for (const width of WIDTHS) {
  const kind = width <= PHONE_MAX ? 'phone' : 'desktop';
  const r = { width, kind, checks: [], console: [] };
  const check = (name, pass, detail) => r.checks.push({ name, pass: pass === null ? null : !!pass, detail });
  results.push(r);

  const context = await browser.newContext({ viewport: { width, height: width <= PHONE_MAX ? 812 : 900 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  page.on('console', (m) => { if (m.type() === 'error') r.console.push(m.text()); });
  page.on('pageerror', (e) => r.console.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (q) => { if (/\.(mp4|webm)/.test(q.url())) r.console.push(`video request failed: ${q.url()} ${q.failure()?.errorText}`); });

  try {
    await page.goto(url.href, { waitUntil: 'load', timeout: 60_000 });
    await page.locator('.wdb-win').first().scrollIntoViewIfNeeded({ timeout: 10_000 }).catch(() => {});

    // Structure as rendered
    const dom = await page.evaluate(() => {
      const q = (s) => document.querySelector(s);
      const hero = q('.hero-content-block'), slot = q('.wdb-slot'), win = q('.wdb-win'), spacer = q('.wdb-spacer');
      return {
        hero: !!hero, slot: !!slot, win: !!win, spacer: !!spacer,
        heroIsWdb: !!hero?.classList.contains('is-wdb'),
        slotAfterHero: !!slot && slot.previousElementSibling === hero,
        winInSlot: !!win && win.parentElement === slot,
        spacerFirst: !!spacer && spacer.parentElement.firstElementChild === spacer && spacer.closest('section') !== hero?.closest('section'),
        videos: [...(win?.querySelectorAll('video') ?? [])].map((v) => v.parentElement.closest('.anim-desktop,.anim-phone')?.className ?? v.parentElement.className),
      };
    });
    check('structure: hero has combo is-wdb', dom.heroIsWdb);
    check('structure: .wdb-slot > .wdb-win right after .hero-content-block', dom.slotAfterHero && dom.winInSlot);
    check('structure: .wdb-spacer is first child in the next section', dom.spacerFirst);
    check('structure: two videos in .wdb-win (desktop + phone)', dom.videos.length === 2, dom.videos.join(' | '));
    if (!dom.win || !dom.slot) throw new Error('No .wdb-win on the page; the remaining checks need it');

    // Geometry
    const g = await page.evaluate(() => {
      const box = (el) => { const b = el.getBoundingClientRect(); return { top: b.top + scrollY, bottom: b.bottom + scrollY, left: b.left, right: b.right, width: b.width, height: b.height }; };
      const win = document.querySelector('.wdb-win'), spacer = document.querySelector('.wdb-spacer');
      const heroSection = document.querySelector('.hero-content-block').closest('section');
      const after = spacer?.nextElementSibling;
      const heading = after?.querySelector('h1,h2,h3') ?? after;
      const doc = document.documentElement;
      let widest = null;
      if (doc.scrollWidth > doc.clientWidth) for (const el of document.body.querySelectorAll('*')) {
        const b = el.getBoundingClientRect();
        if (b.right > doc.clientWidth + 0.5 && (!widest || b.right > widest.right)) widest = { el: `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`, right: Math.round(b.right) };
      }
      return { win: box(win), boundary: box(heroSection).bottom, heading: heading ? box(heading) : null,
        headingText: heading?.textContent.trim().slice(0, 60), scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, widest };
    });
    const centre = g.win.top + g.win.height / 2;
    check('window centre on the hero/section boundary', Math.abs(centre - g.boundary) <= TOL.centre,
      `centre ${centre.toFixed(1)} vs boundary ${g.boundary.toFixed(1)} (${(centre - g.boundary).toFixed(1)}px)`);
    check('heading below starts under the window', g.heading && g.heading.top >= g.win.bottom - 0.5,
      g.heading ? `"${g.headingText}" top ${g.heading.top.toFixed(1)}, window bottom ${g.win.bottom.toFixed(1)} (gap ${(g.heading.top - g.win.bottom).toFixed(1)}px)` : 'no element after .wdb-spacer');
    check('no horizontal overflow', g.scrollWidth <= g.clientWidth,
      g.scrollWidth <= g.clientWidth ? `${g.scrollWidth}px` : `scrollWidth ${g.scrollWidth} > ${g.clientWidth}; widest ${g.widest?.el} → ${g.widest?.right}px`);

    // Which video shows
    const S = SCENES[kind], other = SCENES[kind === 'phone' ? 'desktop' : 'phone'];
    const vis = await page.evaluate(([a, b]) => {
      const shown = (c) => { const el = document.querySelector(`.wdb-win .${c}`); if (!el) return null; const b = el.getBoundingClientRect(); return getComputedStyle(el).display !== 'none' && b.width > 0 && b.height > 0; };
      return { mine: shown(a), other: shown(b) };
    }, [S.cls, other.cls]);
    check(`the ${kind} video shows and the other is hidden`, vis.mine === true && vis.other === false, `.${S.cls}: ${vis.mine}, .${other.cls}: ${vis.other}`);

    const wrap = page.locator(`.wdb-win .${S.cls}`).first();
    const video = wrap.locator('video');
    // Playing: autoplay, muted, advancing
    const playing = await video.evaluate(async (v) => {
      const t0 = performance.now();
      while (performance.now() - t0 < 12_000 && !(v.readyState >= 3 && !v.paused && v.currentTime > 0.3)) await new Promise((r) => setTimeout(r, 100));
      const a = v.currentTime; await new Promise((r) => setTimeout(r, 600));
      return { autoplay: v.autoplay, loop: v.loop, muted: v.muted, paused: v.paused, advanced: v.currentTime - a, readyState: v.readyState,
        src: v.currentSrc, sources: [...v.querySelectorAll('source')].map((s) => s.src), w: v.videoWidth, h: v.videoHeight, duration: v.duration };
    });
    srcs[kind] ??= playing;
    check('video autoplays (muted, advancing)', playing.autoplay && playing.muted && !playing.paused && playing.advanced > 0.3,
      `autoplay ${playing.autoplay}, muted ${playing.muted}, paused ${playing.paused}, +${playing.advanced.toFixed(2)}s in 0.6s`);
    check(`video is ${S.file}.mp4 (by upload name)`, playing.sources.some((s) => decodeURIComponent(s).includes(`_${S.file}`) || decodeURIComponent(s).includes(`/${S.file}`)) && !(kind === 'desktop' && playing.src.includes('mobile')),
      `${playing.w}×${playing.h}, ${decodeURIComponent(playing.src).split('/').pop()}`);
    check('duration is 12s', Math.abs(playing.duration - 12) < 0.1, `${playing.duration?.toFixed(3)}s`);

    // Loops: jump near the end and see it wrap
    const loop = await video.evaluate(async (v) => {
      v.currentTime = v.duration - 0.4;
      await new Promise((r) => setTimeout(r, 1500));
      return { loop: v.loop, t: v.currentTime, ended: v.ended, paused: v.paused };
    });
    check('video loops', loop.loop && !loop.ended && !loop.paused && loop.t < 1.5, `loop attr ${loop.loop}, t after wrap ${loop.t.toFixed(2)}s, ended ${loop.ended}`);

    // Box ratio = video ratio
    const box = await wrap.boundingBox();
    const ratio = (box.width / box.height) / (playing.w / playing.h);
    check('box aspect = videoWidth/videoHeight (±1%)', Math.abs(ratio - 1) <= TOL.aspect,
      `box ${box.width.toFixed(1)}×${box.height.toFixed(1)} vs video ${playing.w}×${playing.h} (${((ratio - 1) * 100).toFixed(2)}%)`);
    check('video fills the window', Math.abs(box.width - g.win.width) < 1 && Math.abs(box.height - g.win.height) < 1,
      `video ${box.width.toFixed(1)}×${box.height.toFixed(1)}, window ${g.win.width.toFixed(1)}×${g.win.height.toFixed(1)}`);

    // Pixels: the video must be painted (not behind .wdb-win's background or the next section)
    for (const half of ['top', 'bottom']) {
      const clip = { x: box.x + 8, y: box.y + (half === 'top' ? 8 : box.height / 2 + 8), width: box.width - 16, height: box.height / 2 - 16 };
      const sd = grayStdDev(await page.screenshot({ clip }));
      check(`video visible in the window's ${half} half`, sd > 6, `pixel std-dev ${sd.toFixed(1)} (flat background ≈ 0)`);
    }

    // Play/pause button: a real click (fails if something lies over it)
    const btn = wrap.locator('.wdb-pp, .w-background-video--control');
    if (await btn.count()) {
      const label = await btn.evaluate((b) => b.getAttribute('aria-label') || [...b.querySelectorAll('img')].map((i) => i.alt).join('/'));
      const icon = await btn.evaluate((b) => { const i = [...b.querySelectorAll('img, svg')].find((x) => x.getBoundingClientRect().width > 0); const r = i?.getBoundingClientRect(); return i ? { ok: (i.tagName !== 'IMG' || i.naturalWidth > 0) && r.width > 0, size: `${Math.round(r.width)}×${Math.round(r.height)}` } : { ok: false, size: 'none' }; });
      check('play/pause icon loads', icon.ok, `visible icon ${icon.size}px`);
      let detail = `label "${label}"`, ok = false;
      try {
        await btn.evaluate((b) => b.scrollIntoView({ block: 'center' })); // clear of the fixed "Made in Webflow" badge
        await btn.click({ timeout: 4000 });
        await page.waitForTimeout(400);
        const p1 = await video.evaluate((v) => v.paused);
        await btn.click({ timeout: 4000 });
        await page.waitForTimeout(600);
        const p2 = await video.evaluate((v) => ({ paused: v.paused, t: v.currentTime }));
        ok = p1 === true && p2.paused === false;
        detail += `; after 1st click paused=${p1}, after 2nd paused=${p2.paused}`;
      } catch (e) {
        detail += `; click failed: ${e.message.split('\n').find((l) => /intercepts|not visible|outside/.test(l))?.trim() ?? e.message.split('\n')[0]}`;
      }
      check('play/pause button pauses and resumes', ok, detail);
    } else check('play/pause button pauses and resumes', false, 'no play/pause button (.wdb-pp) by the video');

    // Screenshot: the video at its poster time, hero top → heading + 120px
    await video.evaluate(async (v) => { v.pause(); v.currentTime = 0; await new Promise((r) => (v.readyState >= 2 && !v.seeking ? r() : v.addEventListener('seeked', r, { once: true }))); });
    const top = await page.evaluate(() => document.querySelector('.hero-content-block').closest('section').getBoundingClientRect().top + scrollY);
    const bottom = Math.max(g.win.bottom + 60, (g.heading?.bottom ?? g.win.bottom) + 120);
    r.shot = `w${width}.png`;
    await page.screenshot({ path: join(args.out, r.shot), fullPage: true, clip: { x: 0, y: top, width, height: bottom - top } });
    await video.evaluate((v) => v.play());

    // Reduced motion (set before the visit): the video stays on its poster frame
    const rmPage = await context.browser().newPage({ viewport: page.viewportSize(), reducedMotion: 'reduce' });
    await rmPage.goto(url.href, { waitUntil: 'load', timeout: 60_000 });
    await rmPage.waitForTimeout(1500);
    const rm = await rmPage.locator(`.wdb-win .${S.cls} video`).first().evaluate((v) => ({ paused: v.paused, t: v.currentTime }));
    await rmPage.close();
    check('reduced motion: video stays paused', rm.paused && rm.t < 0.1, `paused ${rm.paused}, t ${rm.t.toFixed(2)}s`);
  } catch (e) {
    check('run', false, e.message.split('\n')[0]);
  }
  const noise = (m) => /recaptcha|googletagmanager|gtm\.js|favicon/i.test(m);
  check('no console errors', r.console.filter((m) => !noise(m)).length === 0,
    r.console.length ? r.console.map((m) => (noise(m) ? `(3rd-party) ${m}` : m)).join(' • ').slice(0, 400) : 'none');
  await context.close();
  console.log(`${width}px ${kind}: ${r.checks.filter((c) => c.pass === false).length} failed`);
}

// Sharpness: Webflow's transcode vs our MP4 at the same times
const sharp = [];
if (!args['no-sharpness']) {
  for (const [kind, S] of Object.entries(SCENES)) {
    const p = srcs[kind];
    if (!p) continue;
    for (const src of p.sources) {
      const row = { kind, src: decodeURIComponent(src).split('/').pop(), times: [] };
      row.probe = await ffprobe(src);
      for (const t of [0, 4.5, 9]) {
        const a = join(args.out, `sharp-${kind}-${t}-ours.png`), b = join(args.out, `sharp-${kind}-${t}-${row.probe.codec}.png`);
        await ff(['-ss', String(t), '-i', S.ours, '-frames:v', '1', a]);
        await ff(['-ss', String(t), '-i', src, '-frames:v', '1', '-vf', `scale=${S.w}:${S.h}:flags=lanczos`, b]);
        const ssim = await ffSsim(a, b);
        row.times.push({ t, ssim });
        if (t === 0) { // 100% crops side by side (left: ours, right: Webflow)
          const crop = kind === 'desktop' ? 'crop=900:520:0:0' : 'crop=560:900:0:0';
          await ff(['-i', a, '-i', b, '-filter_complex', `[0]${crop}[x];[1]${crop}[y];[x][y]hstack`, join(args.out, `sharp-${kind}-${row.probe.codec}-crop.png`)]);
        }
      }
      sharp.push(row);
    }
  }
}

// Report
const failed = results.flatMap((r) => r.checks.filter((c) => c.pass === false).map((c) => `${r.width}px: ${c.name} (${c.detail ?? ''})`));
await writeFile(join(args.out, 'report.json'), JSON.stringify({ url: url.href, when: new Date().toISOString(), results, sharp }, null, 2));
const names = [...new Set(results.flatMap((r) => r.checks.map((c) => c.name)))];
const mark = (c) => (!c ? '–' : c.pass === null ? 'i' : c.pass ? '✓' : '✗');
let md = `# Why DishBooks on ${url.host}\n\n${new Date().toISOString()} · ${url.href}\n\n| Check | ${WIDTHS.map((w) => `${w}`).join(' | ')} |\n|---|${WIDTHS.map(() => ':-:').join('|')}|\n`;
for (const n of names) md += `| ${n} | ${results.map((r) => mark(r.checks.find((c) => c.name === n))).join(' | ')} |\n`;
md += `\n## Failures\n\n${failed.length ? failed.map((f) => `- ${f}`).join('\n') : 'None.'}\n\n## Details\n\n`;
for (const r of results) md += `### ${r.width}px (${r.kind})\n\n${r.checks.map((c) => `- ${mark(c)} ${c.name}: ${c.detail ?? ''}`).join('\n')}\n\n`;
if (sharp.length) {
  md += `## Sharpness (Webflow transcode vs our MP4, SSIM after scaling to our size)\n\n| Video | File | Size | Bitrate | SSIM @0 / 4.5 / 9s |\n|---|---|---|---|---|\n`;
  for (const s of sharp) md += `| ${s.kind} | ${s.src} | ${s.probe.width}×${s.probe.height} ${s.probe.codec} | ${Math.round(s.probe.bitrate / 1000)} kb/s | ${s.times.map((t) => t.ssim.toFixed(4)).join(' / ')} |\n`;
}
await writeFile(join(args.out, 'report.md'), md);
await contactSheet();
await browser.close();
console.log(`\n${failed.length ? `${failed.length} FAILED:\n  ${failed.join('\n  ')}` : 'All checks passed.'}\nReport: ${join(args.out, 'report.md')}\nContact sheet: ${join(args.out, 'contact-sheet.png')}`);
process.exitCode = failed.length ? 1 : 0;

async function contactSheet() {
  const page = await browser.newPage({ viewport: { width: 1800, height: 1000 } });
  const img = async (f) => `data:image/png;base64,${(await readFile(join(args.out, f))).toString('base64')}`;
  const cells = [];
  for (const r of results) {
    const bad = r.checks.filter((c) => c.pass === false);
    cells.push(`<figure class="${bad.length ? 'bad' : 'ok'}"><figcaption><b>${r.width}px</b> ${r.kind} — ${bad.length ? `${bad.length} failed` : 'all passed'}</figcaption>
      ${r.shot ? `<img src="${await img(r.shot)}">` : '<p>no screenshot</p>'}
      ${bad.length ? `<ul>${bad.map((c) => `<li>${esc(c.name)}: ${esc(c.detail ?? '')}</li>`).join('')}</ul>` : ''}</figure>`);
  }
  const rows = names.map((n) => `<tr><td>${esc(n)}</td>${results.map((r) => { const c = r.checks.find((x) => x.name === n); return `<td class="${c?.pass === false ? 'f' : c?.pass ? 'p' : ''}">${mark(c)}</td>`; }).join('')}</tr>`).join('');
  await page.setContent(`<style>body{font:14px system-ui;margin:24px;color:#0b0c0d}h1{font-size:20px}
    table{border-collapse:collapse;margin-bottom:24px}td,th{border:1px solid #ddd;padding:4px 10px}td.p{color:#0a7d32}td.f{color:#c01;font-weight:700;background:#fee}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;align-items:start}figure{margin:0;border:2px solid #0a7d32;border-radius:8px;padding:8px}
    figure.bad{border-color:#c01}img{width:100%;display:block}ul{margin:6px 0 0;padding-left:18px;color:#c01;font-size:12px}</style>
    <h1>Why DishBooks — ${esc(url.href)} — ${new Date().toISOString().slice(0, 16)}Z</h1>
    <table><tr><th>Check</th>${WIDTHS.map((w) => `<th>${w}</th>`).join('')}</tr>${rows}</table><div class="grid">${cells.join('')}</div>`);
  await page.screenshot({ path: join(args.out, 'contact-sheet.png'), fullPage: true });
  await page.close();
}

function esc(s) { return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]); }

function run(cmd, argv, input) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, argv, { stdio: ['pipe', 'pipe', 'pipe'] });
    const out = [], err = [];
    p.stdout.on('data', (d) => out.push(d)); p.stderr.on('data', (d) => err.push(d));
    p.on('close', (code) => (code ? rej(new Error(`${cmd} ${code}: ${Buffer.concat(err).toString().slice(-400)}`)) : res({ out: Buffer.concat(out), err: Buffer.concat(err).toString() })));
    if (input) p.stdin.end(input); else p.stdin.end();
  });
}
function ff(a) { return run('ffmpeg', ['-loglevel', 'error', '-y', ...a]); }
async function ffSsim(a, b) {
  const { err } = await run('ffmpeg', ['-i', a, '-i', b, '-lavfi', 'ssim', '-f', 'null', '-']);
  return Number(/All:([\d.]+)/.exec(err)?.[1] ?? NaN);
}
async function ffprobe(src) {
  const { out } = await run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height,bit_rate:format=bit_rate', '-of', 'json', src]);
  const j = JSON.parse(out); const s = j.streams[0];
  return { codec: s.codec_name, width: s.width, height: s.height, bitrate: Number(s.bit_rate ?? j.format.bit_rate) };
}
function grayStdDev(png) {
  const raw = spawnSync('ffmpeg', ['-loglevel', 'error', '-i', '-', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { input: png, maxBuffer: 1e8 }).stdout;
  let s = 0, s2 = 0;
  for (const v of raw) { s += v; s2 += v * v; }
  const n = raw.length || 1;
  return Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2));
}
