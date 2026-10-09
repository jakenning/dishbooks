// Renders a scene to video + a self-contained HTML embed.
//
//   npm run anim:render                                  # smart-ops-dashboard, home
//   npm run anim:render -- --scenario qsr,fine-dining
//   npm run anim:render -- --scenario all
//   npm run anim:render -- --scene smart-ops-dashboard --formats webm,poster
//
// Outputs land in animations/dist/<scene>/<scenario>/:
//   <scene>.webm         VP9  — primary web video
//   <scene>.mp4          H.264 — fallback (older Safari / iOS)
//   <scene>.jpg          poster frame (meta.posterTime)
//   <scene>.html         standalone page, fonts inlined — open or iframe it
//   <scene>.embed.html   snippet for a Webflow Embed element (uses the site's
//                        Albert Sans, so no font payload)
//
// Frames are captured by seeking the scene's pure frame(t) function, so the
// video is frame-exact regardless of machine speed.

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { parseArgs } from 'node:util';
import { createRequire } from 'node:module';
import { serve, listScenarios, ROOT } from './serve.mjs';

// Next.js ships terser; use it to keep the Webflow embed under 50k characters.
const terser = (() => {
  try {
    return createRequire(import.meta.url)('next/dist/compiled/terser');
  } catch {
    return null;
  }
})();

const { values: args } = parseArgs({
  options: {
    scene: { type: 'string', default: 'smart-ops-dashboard' },
    scenario: { type: 'string', default: 'home' },
    formats: { type: 'string', default: 'webm,mp4,poster,html' },
    scale: { type: 'string' }, // device pixel ratio; default meta.scale ?? 1.5 (880×616 → 1320×924)
    fps: { type: 'string' },
  },
});

const formats = new Set(args.formats.split(','));
const scenarios = args.scenario === 'all' ? await listScenarios() : args.scenario.split(',');

const server = await serve(0);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());

try {
  for (const scenario of scenarios) {
    const outDir = join(ROOT, 'dist', args.scene, scenario);
    await mkdir(outDir, { recursive: true });
    const started = Date.now();

    if (formats.has('webm') || formats.has('mp4') || formats.has('poster')) {
      await renderVideo(scenario, outDir);
    }
    if (formats.has('html')) await bundleHtml(scenario, outDir);

    console.log(`✓ ${args.scene}/${scenario} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
    for (const f of ['webm', 'mp4', 'jpg', 'html', 'embed.html']) {
      const p = join(outDir, `${args.scene}.${f}`);
      const s = await stat(p).catch(() => null);
      if (s) console.log(`  ${p.replace(ROOT + '/', 'animations/')}  ${(s.size / 1024).toFixed(0)} KB`);
    }
  }
} finally {
  await browser.close();
  server.close();
}

async function openScene(scenario, viewport, dpr = 1) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: dpr });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${base}/scenes/${args.scene}/index.html?scenario=${scenario}&record=1&fit=0`);
  await page.waitForFunction(() => window.__animReady === true);
  return page;
}

async function renderVideo(scenario, outDir) {
  // Read the stage size from the scene itself.
  const probe = await openScene(scenario, { width: 800, height: 600 });
  const meta = await probe.evaluate(() => window.__anim.meta);
  await probe.close();

  const dpr = Number(args.scale ?? meta.scale ?? 1.5);
  const page = await openScene(scenario, { width: meta.width, height: meta.height }, dpr);
  const fps = Number(args.fps ?? meta.fps);
  const frames = Math.round(meta.duration * fps);
  const name = join(outDir, args.scene);

  if (formats.has('poster')) {
    await page.evaluate((t) => window.__anim.seek(t), meta.posterTime ?? meta.duration / 2);
    await page.screenshot({ path: `${name}.jpg`, type: 'jpeg', quality: 90 });
  }
  if (!formats.has('webm') && !formats.has('mp4')) return page.close();

  // One ffmpeg process, PNG frames on stdin, one output per format.
  const outputs = [];
  if (formats.has('webm')) {
    outputs.push('-c:v', 'libvpx-vp9', '-pix_fmt', 'yuv420p', '-crf', '34', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-an', `${name}.webm`);
  }
  if (formats.has('mp4')) {
    outputs.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '21', '-preset', 'slow', '-tune', 'animation', '-movflags', '+faststart', '-an', `${name}.mp4`);
  }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', ...outputs], {
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));

  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => window.__anim.seek(t), i / fps);
    const png = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % fps === 0) process.stdout.write(`\r  ${scenario}: frame ${i}/${frames}`);
  }
  process.stdout.write('\r' + ' '.repeat(50) + '\r');
  ff.stdin.end();
  await done;
  await page.close();
}

// ---- HTML bundling ---------------------------------------------------------
// Inlines the scene, everything it imports, the player and the scenario into
// one file. The modules are written to use only `import { … } from './…'` /
// `export` at top level and unique top-level names, which is all this needs.

async function bundleHtml(scenario, outDir) {
  const read = (p) => readFile(join(ROOT, p), 'utf8');
  const strip = (src) =>
    src
      .replace(/^import[^;]+;\s*$/gm, '')
      .replace(/^export (const|function|async function|let) /gm, '$1 ');
  const sceneDir = `scenes/${args.scene}`;
  // Scene modules in dependency order (each file once).
  const modules = [];
  const visit = async (file) => {
    if (modules.includes(file)) return;
    const src = await read(file);
    for (const [, dep] of src.matchAll(/^import[^;]+from '(\.[^']+)';/gm)) {
      await visit(relative(ROOT, join(ROOT, dirname(file), dep)));
    }
    modules.push(file);
  };
  await visit(`${sceneDir}/scene.js`);
  // Scene CSS with its relative @imports inlined.
  const inlineCss = async (file) => {
    let css = await read(file);
    for (const [stmt, dep] of css.matchAll(/@import url\('(\.[^']+)'\);/g)) {
      css = css.replace(stmt, await inlineCss(relative(ROOT, join(ROOT, dirname(file), dep))));
    }
    return css;
  };
  const data = JSON.parse(await read(`scenarios/${scenario}.json`));
  delete data.$comment;

  const sources = await Promise.all(modules.map(async (m) => strip(await read(m))));
  const iconsAt = modules.indexOf('shared/icons.js');
  if (iconsAt >= 0) sources[iconsAt] = pruneIcons(sources[iconsAt], sources.filter((_, i) => i !== iconsAt).join('\n'));

  const raw = `(() => {
${sources.join('\n')}
const scene = { meta, build, frame };
${strip(await read('lib/player.js'))}
const host = document.currentScript.previousElementSibling.querySelector('[data-db-anim]');
window.__SCENARIO__ = ${JSON.stringify(data)};
run(scene, { root: host });
})();`;
  // After terser the only line breaks left are inside the markup templates,
  // where any run of whitespace is equivalent to one space.
  const js = terser ? (await terser.minify(raw, { compress: { passes: 2 } })).code.replace(/(?:\\n|\n)\s+/g, ' ') : raw;

  const baseCss = await read('shared/base.css');
  const sceneCss = await inlineCss(`${sceneDir}/scene.css`);
  const cssNoFonts = baseCss.replace(/@font-face\s*{[^}]*}/g, '').replace(/\/\* Preview chrome[\s\S]*$/, '');
  const markup = `<div class="db-anim-wrap" style="width:100%"><div data-db-anim></div></div>`;

  // Embed: relies on the host page's Albert Sans (dishbooks.com loads it).
  const embed = `<!-- DishBooks ${args.scene} · scenario: ${scenario} · generated by animations/render.mjs -->
<style>${pruneVars(minifyCss(cssNoFonts + sceneCss), js)}</style>
${markup}
<script>${js}</script>
`;
  await writeFile(join(outDir, `${args.scene}.embed.html`), embed);

  // Standalone: fonts inlined as data URIs so it works anywhere, offline.
  let fontsCss = '';
  for (const m of baseCss.matchAll(/@font-face\s*{[^}]*}/g)) {
    let block = m[0];
    for (const [, file] of block.matchAll(/url\('fonts\/([^']+)'\)/g)) {
      const b64 = (await readFile(join(ROOT, 'shared/fonts', file))).toString('base64');
      block = block.replace(`url('fonts/${file}')`, `url(data:font/woff2;base64,${b64})`);
    }
    fontsCss += block;
  }
  const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>DishBooks — ${args.scene}</title>
<style>html,body{margin:0;background:transparent}${fontsCss}${minifyCss(cssNoFonts + sceneCss)}</style>
</head><body>
${markup}
<script>${js}</script>
</body></html>
`;
  await writeFile(join(outDir, `${args.scene}.html`), page);
}

// Keep only the icons a bundle names. Every scene names its icons as quoted
// literals (icon('check'), or in a NAV table), so an unquoted name means unused.
function pruneIcons(src, rest) {
  return src.replace(/^"([\w-]+)": \[[^\]]*\],?\n/gm, (entry, name) => (rest.includes(`'${name}'`) || rest.includes(`"${name}"`) ? entry : ''));
}

// Drop custom properties nothing reads (shared tokens a scene doesn't use).
function pruneVars(css, js) {
  const used = new Set([...(css + js).matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]));
  return css.replace(/(--[\w-]+):[^;}]+;?/g, (decl, name) => (used.has(name) ? decl : ''));
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}
