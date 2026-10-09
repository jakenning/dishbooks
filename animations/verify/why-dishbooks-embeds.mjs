#!/usr/bin/env node
// The two HTML Embeds that go inside .wdb-win on the Why DishBooks page: a plain
// <video> (WebM first, then MP4) with a small play/pause button. Webflow's
// Background Video can't be created through the API, and a plain video needs
// none of its workarounds (500px height, z-index -100).
//
//   node verify/why-dishbooks-embeds.mjs urls.json   # prints both embeds
//
// urls.json: { "desktop": { "mp4", "webm", "jpg" }, "phone": { "mp4", "webm", "jpg" } }
// (the hostedUrl of each uploaded asset). The fixture imports embed() so the
// test runs on exactly this code.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const VIDEO = {
  desktop: { cls: 'anim-desktop', w: 1920, h: 1080 },
  phone: { cls: 'anim-phone', w: 1000, h: 1800 },
};
const LABEL = 'DishBooks app demo: the Home dashboard, the bank feed, a Prime Cost P&amp;L that flags one location, and Dex answering which location needs attention';

const CSS = '.wdb-v{position:relative}.wdb-v video{display:block;width:100%;height:auto}'
  + '.wdb-pp{position:absolute;right:8px;bottom:8px;display:grid;place-items:center;width:28px;height:28px;padding:0;border:0;border-radius:50%;background:rgb(0 0 0/45%);cursor:pointer;opacity:.7}'
  + '.wdb-pp:hover,.wdb-pp:focus-visible{opacity:1}.wdb-pp svg{width:12px;height:12px;fill:#fff}'
  + '.wdb-pp .pl,.wdb-pp.is-paused .pa{display:none}.wdb-pp.is-paused .pl{display:block}';

// Reduced motion: stay on the poster frame. The button's label follows the state.
const JS = "(function(s){var w=s.previousElementSibling,v=w.querySelector('video'),b=w.querySelector('button');"
  + "function u(){var p=v.paused;b.classList.toggle('is-paused',p);b.setAttribute('aria-label',p?'Play animation':'Pause animation')}"
  + "if(matchMedia('(prefers-reduced-motion: reduce)').matches){v.removeAttribute('autoplay');v.pause()}"
  + "b.onclick=function(){v.paused?v.play():v.pause()};v.onplay=v.onpause=u;u()})(document.currentScript)";

export function embed(kind, url) {
  const { w, h } = VIDEO[kind];
  return `<style>${CSS}</style><div class="wdb-v"><video autoplay muted loop playsinline preload="auto" width="${w}" height="${h}" poster="${url.jpg}" aria-label="${LABEL}">`
    + `<source src="${url.webm}" type="video/webm"><source src="${url.mp4}" type="video/mp4"></video>`
    + `<button type="button" class="wdb-pp" aria-label="Pause animation"><svg class="pa" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1h3v10H2zM7 1h3v10H7z"/></svg><svg class="pl" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1l8 5-8 5z"/></svg></button></div>`
    + `<script>${JS}</script>`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const urls = JSON.parse(await readFile(process.argv[2], 'utf8'));
  for (const kind of Object.keys(VIDEO)) {
    const code = embed(kind, urls[kind]);
    console.log(`--- ${kind}: HTML Embed with class ${VIDEO[kind].cls} (${code.length} characters)\n${code}\n`);
  }
}
