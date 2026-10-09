#!/usr/bin/env node
// Checks the Why DishBooks Designer work from a read-only dump of the Webflow
// Data API (gathered with the Webflow MCP: no writes). The dump is one JSON file:
//
//   {
//     "heroContainer": <data_element_tool query_elements match: element_filter {style:"hero-content-block"},
//                       return_parent "parent", children_depth -1>,
//     "spacerParent":  <same for {style:"wdb-spacer"}, return_parent "parent", children_depth 1>,
//     "settings":      { "<element id of each video element (HTML Embed or Background Video)>":
//                       <data_element_settings_tool get_settings all_resolved_settings result> },
//     "styles":        [<data_style_tool query_styles matches, include_properties, breakpoints main/medium/small/tiny>,
//                       for wdb-video, wdb-video-phone, hero-content-block › is-wdb, v2-1512-container › is-over-next]
//   }
//
//   node verify/why-dishbooks-readback.mjs dump.json

import { readFile } from 'node:fs/promises';

const dump = JSON.parse(await readFile(process.argv[2], 'utf8'));
const rows = [];
const check = (name, pass, detail = '') => rows.push({ name, pass: pass === null ? null : !!pass, detail });
const has = (el, ...names) => names.every((n) => el?.styleNames?.includes(n));
const same = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

// Structure
const hc = dump.heroContainer;
const kids = hc?.children ?? [];
const hi = kids.findIndex((c) => has(c, 'hero-content-block'));
const hero = kids[hi], slot = kids[hi + 1];
check('hero-content-block has combo is-wdb', has(hero, 'is-wdb'), hero?.styleNames?.join(' '));
check("hero's container has combo is-over-next", has(hc, 'v2-1512-container', 'is-over-next'), hc?.styleNames?.join(' '));
check('.wdb-slot right after .hero-content-block', has(slot, 'wdb-slot'), slot ? slot.styleNames.join(' ') : 'nothing after the hero block');
const win = slot?.children?.length === 1 ? slot.children[0] : null;
check('.wdb-slot holds only .wdb-win', has(win, 'wdb-win'), slot?.children?.map((c) => c.styleNames.join(' ')).join(' | '));
const vids = win?.children ?? [];
const isEmbed = vids.some((v) => /embed/i.test(v.type));
check('.wdb-win holds exactly two videos (HTML Embeds or Background Videos)', vids.length === 2 && vids.every((v) => /video|embed/i.test(v.type)), vids.map((v) => `${v.type}(${v.styleNames.join(' ')})`).join(' | '));

const WANT = isEmbed
  ? { desktop: ['anim-desktop', null, 'why-dishbooks'], phone: ['anim-phone', null, 'why-dishbooks-mobile'] }
  : { desktop: ['anim-desktop', 'wdb-video', 'why-dishbooks'], phone: ['anim-phone', 'wdb-video-phone', 'why-dishbooks-mobile'] };
for (const [kind, [a, b, file]] of Object.entries(WANT)) {
  const v = vids.find((x) => same(x.styleNames, [a, b].filter(Boolean)));
  check(`${kind} video has classes ${[a, b].filter(Boolean).join(' + ')} (nothing else)`, v, v ? '' : vids.map((x) => x.styleNames.join(' ')).join(' | '));
  if (!v) continue;
  const s = dump.settings?.[v.id.element];
  if (!s) { check(`${kind} video settings read`, false, `no settings for ${v.id.element}`); continue; }
  const flat = [];
  (function walk(o, path) {
    if (o && typeof o === 'object') for (const [k, x] of Object.entries(o)) walk(x, `${path}.${k}`);
    else flat.push([path, o]);
  })(s, '');
  const flag = (re) => flat.filter(([p]) => re.test(p)).map(([p, x]) => `${p.split('.').slice(-2).join('.')}=${x}`);
  if (isEmbed) { // the embed's code: a <video> with the right files and flags
    const code = flat.map(([, x]) => x).find((x) => typeof x === 'string' && x.includes('<video')) ?? '';
    const tag = /<video[^>]*>/.exec(code)?.[0] ?? '';
    check(`${kind} embed: <video autoplay muted loop playsinline>`, ['autoplay', 'muted', 'loop', 'playsinline'].every((f) => new RegExp(`\\s${f}[\\s>=]`).test(tag)), tag.slice(0, 120) || 'no <video> in the embed code');
    const srcs = [...code.matchAll(/(?:src|poster)="([^"]+)"/g)].map((m) => m[1]);
    const right = (u) => u.includes(`_${file}.`) && u.startsWith('https://cdn.prod.website-files.com/');
    check(`${kind} embed: WebM, MP4 and poster are the hosted ${file} files`, srcs.length === 3 && srcs.every(right) && /\.webm"[^]*\.mp4"/.test(code), srcs.map((u) => u.split('/').pop()).join(', '));
    check(`${kind} embed: play/pause button`, /class="wdb-pp"/.test(code));
    continue;
  }
  const auto = flag(/autoplay/i), loop = flag(/loop/i);
  check(`${kind} video: autoplay on`, auto.length && auto.every((x) => /=true$/.test(x)), auto.join(', ') || 'no autoplay setting found');
  check(`${kind} video: loop on`, loop.length && loop.every((x) => /=true$/.test(x)), loop.join(', ') || 'no loop setting found');
  const named = flat.filter(([, x]) => typeof x === 'string' && x.includes(file) && (file.endsWith('mobile') || !x.includes(`${file}-mobile`)));
  check(`${kind} video: file is ${file}.mp4`, named.length ? true : null, named.length ? named[0][1].split('/').pop() : 'file name not in the settings (check the asset by id)');
}

const sp = dump.spacerParent;
check('.wdb-spacer is the first child of the next section’s container', has(sp?.children?.[0], 'wdb-spacer') && sp.id.element !== hc?.id?.element,
  sp?.children?.slice(0, 2).map((c) => c.styleNames.join(' ')).join(' | '));

// Styles
const style = (chain) => (dump.styles ?? []).find((s) => s.name === chain.at(-1) && (chain.length === 1 || s.isComboClass));
const prop = (s, bp, p) => s?.properties?.breakpoints?.[bp]?.properties?.[p] ?? (bp === 'main' ? s?.properties?.base?.properties?.[p] : undefined);
const ratio = (x) => { const m = /^\s*([\d.]+)\s*(?:\/\s*([\d.]+))?\s*$/.exec(String(x ?? '')); return m ? m[1] / (m[2] ?? 1) : NaN; };
for (const [name, r] of isEmbed ? [] : [['wdb-video', 16 / 9], ['wdb-video-phone', 5 / 9]]) {
  const s = style([name]);
  check(`.${name}: aspect ratio ${r === 16 / 9 ? '16/9' : '5/9'}`, Math.abs(ratio(prop(s, 'main', 'aspect-ratio')) - r) < 0.001, `${prop(s, 'main', 'aspect-ratio')}`);
  check(`.${name}: height auto (overrides Webflow's 500px)`, prop(s, 'main', 'height') === 'auto', `${prop(s, 'main', 'height')}`);
  check(`.${name}: z-index 0 (keeps the video above .wdb-win's background)`, String(prop(s, 'main', 'z-index')) === '0', `${prop(s, 'main', 'z-index')}`);
}
const over = style(['v2-1512-container', 'is-over-next']);
check('.v2-1512-container.is-over-next: z-index 11', String(prop(over, 'main', 'z-index')) === '11', `${prop(over, 'main', 'z-index')}`);
const isw = style(['hero-content-block', 'is-wdb']);
for (const [bp, want] of [['main', '72px'], ['medium', '40px'], ['small', undefined], ['tiny', '32px']]) {
  const got = prop(isw, bp, 'padding-bottom');
  check(`.hero-content-block.is-wdb padding-bottom @${bp}: ${want ?? 'not set (inherits 40px)'}`, got === want, `${got ?? 'not set'}`);
}

// Output
const mark = (r) => (r.pass === null ? 'i' : r.pass ? '✓' : '✗');
for (const r of rows) console.log(`${mark(r)} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
const bad = rows.filter((r) => r.pass === false).length;
console.log(bad ? `\n${bad} failed` : '\nAll read-back checks passed');
process.exitCode = bad ? 1 : 0;
