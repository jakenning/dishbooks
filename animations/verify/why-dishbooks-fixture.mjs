#!/usr/bin/env node
// A local stand-in for the published Why DishBooks page, used to test
// why-dishbooks.mjs before the real Designer work exists. It takes the staging
// HTML and site CSS as they are, adds the planned elements in Webflow's own
// Background Video markup (with play/pause button), serves our MP4/WebM, and
// adds the planned new class values as a <style> (they don't exist on the
// site yet). --variant picks those values:
//
//   naive    wdb-video: aspect ratio only
//   planned  + height auto, z-index 0 (what the Designer steps set)
//   fixed    + the hero's container above the next section (z-index 11)
//
//   node verify/why-dishbooks-fixture.mjs --variant fixed --port 4174
//   node verify/why-dishbooks.mjs --url http://localhost:4174/why-dishbooks.html --no-sharpness

import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const ANIM = join(dirname(fileURLToPath(import.meta.url)), '..');
const { values: args } = parseArgs({ options: {
  variant: { type: 'string', default: 'planned' },
  port: { type: 'string', default: '4174' },
  page: { type: 'string', default: 'https://dish-books.webflow.io/why-dishbooks' },
  home: { type: 'string', default: 'https://dish-books.webflow.io/' },
} });

let html = await (await fetch(args.page)).text();
// The page's webflow.js has no Background Video module until a page uses one; the home page's has.
const homeJs = /https:\/\/cdn\.prod\.website-files\.com\/[^"]*\/js\/webflow\.[0-9a-f]+\.[0-9a-f]+\.js/.exec(await (await fetch(args.home)).text())?.[0];
if (homeJs) html = html.replace(/(<script src=")https:\/\/cdn\.prod\.website-files\.com\/[^"]*\/js\/webflow\.[0-9a-f]+\.[0-9a-f]+\.js"[^>]*>/, `$1${homeJs}" type="text/javascript">`); // drops its integrity hash
html = html.replace(/<script async="" src="\/[^"]*"><\/script>/g, ''); // site-relative loader, 404s locally

// Webflow serves its own icon files; the fixture draws stand-ins
const svg = (d) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="rgba(0,0,0,.45)"/><path fill="#fff" d="${d}"/></svg>`)}`;
const ICON = { pause: svg('M11 9h4v14h-4zM17 9h4v14h-4z'), play: svg('M12 9l12 7-12 7z') };
const bgv = (id, cls, file) => `<div data-poster-url="/${file}.jpg" data-video-urls="/fx_${file}.mp4,/fx_${file}.webm" data-autoplay="true" data-loop="true" data-wf-ignore="true" class="${cls} w-background-video w-background-video-atom"><video id="${id}" autoplay="" loop="" style="background-image:url(&quot;/${file}.jpg&quot;)" muted="" playsinline="" data-wf-ignore="true" data-object-fit="cover"><source src="/fx_${file}.mp4" data-wf-ignore="true"/><source src="/fx_${file}.webm" data-wf-ignore="true"/></video><div aria-live="polite"><button type="button" data-w-bg-video-control="true" aria-controls="${id}" class="w-backgroundvideo-backgroundvideoplaypausebutton w-background-video--control"><span><img loading="lazy" src="${ICON.pause}" alt="Pause video"/></span><span hidden=""><img loading="lazy" src="${ICON.play}" alt="Play video"/></span></button></div></div>`;
const slot = `<div class="wdb-slot"><div class="wdb-win">${bgv('wdb-d', 'anim-desktop wdb-video', 'why-dishbooks')}${bgv('wdb-p', 'anim-phone wdb-video-phone', 'why-dishbooks-mobile')}</div></div>`;

// Insert the slot after the hero block's closing tag (matching <div>s), and the spacer first in the next section's container
const at = html.indexOf('<div class="hero-content-block">');
if (at < 0) throw new Error('No .hero-content-block on the page');
let depth = 0, i = at, end = -1;
for (const m of html.slice(at).matchAll(/<div\b|<\/div>/g)) {
  depth += m[0] === '</div>' ? -1 : 1;
  if (depth === 0) { end = at + m.index + 6; break; }
}
html = html.slice(0, at) + '<div class="hero-content-block is-wdb">' + html.slice(at + 32, end) + slot + html.slice(end);
const next = html.indexOf('<section', html.indexOf('</section>', at));
const cont = html.indexOf('>', html.indexOf('v2-1512-container', next)) + 1;
html = html.slice(0, cont) + '<div class="wdb-spacer"></div>' + html.slice(cont);
if (args.variant === 'fixed') { // the hero's container gets the combo
  const c = html.lastIndexOf('v2-1512-container', at);
  html = html.slice(0, c) + 'v2-1512-container is-over-next' + html.slice(c + 'v2-1512-container'.length);
}

const css = [
  '.hero-content-block.is-wdb{padding-bottom:72px}',
  '@media (max-width:991px){.hero-content-block.is-wdb{padding-bottom:40px}}',
  '@media (max-width:479px){.hero-content-block.is-wdb{padding-bottom:32px}}',
  '.wdb-video{aspect-ratio:16/9}.wdb-video-phone{aspect-ratio:5/9}',
  args.variant !== 'naive' ? '.wdb-video,.wdb-video-phone{height:auto;z-index:0}' : '',
  args.variant === 'fixed' ? '.v2-1512-container.is-over-next{z-index:11}' : '',
].join('\n');
html = html.replace('</head>', `<style>/* fixture: ${args.variant} */\n${css}</style></head>`);

const FILES = {
  '/why-dishbooks.html': null,
  '/fx_why-dishbooks.mp4': 'dist/why-dishbooks/home/why-dishbooks.mp4',
  '/fx_why-dishbooks.webm': 'dist/why-dishbooks/home/why-dishbooks.webm',
  '/why-dishbooks.jpg': 'dist/why-dishbooks/home/why-dishbooks.jpg',
  '/fx_why-dishbooks-mobile.mp4': 'dist/why-dishbooks-mobile/home/why-dishbooks-mobile.mp4',
  '/fx_why-dishbooks-mobile.webm': 'dist/why-dishbooks-mobile/home/why-dishbooks-mobile.webm',
  '/why-dishbooks-mobile.jpg': 'dist/why-dishbooks-mobile/home/why-dishbooks-mobile.jpg',
};
const TYPES = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.jpg': 'image/jpeg' };

createServer((req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  if (path === '/why-dishbooks.html') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(html); }
  const rel = FILES[path];
  if (!rel) { res.writeHead(404); return res.end(); }
  const file = join(ANIM, rel), size = statSync(file).size;
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '');
  const head = { 'content-type': TYPES[extname(file)], 'accept-ranges': 'bytes' };
  if (range) { // video seeking needs ranges
    const start = range[1] ? +range[1] : size - +range[2], stop = range[1] && range[2] ? +range[2] : size - 1;
    res.writeHead(206, { ...head, 'content-range': `bytes ${start}-${stop}/${size}`, 'content-length': stop - start + 1 });
    return createReadStream(file, { start, end: stop }).pipe(res);
  }
  res.writeHead(200, { ...head, 'content-length': size });
  createReadStream(file).pipe(res);
}).listen(+args.port, () => console.log(`fixture (${args.variant}): http://localhost:${args.port}/why-dishbooks.html`));
