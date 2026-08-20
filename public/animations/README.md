# DishBooks integration-hub animation

A Lottie animation of the integration hub: POS, Bank, Payroll and Vendors
each fire a pulse down their dotted spoke into the DishBooks mark, which
absorbs it, ripples, and broadcasts the confirmation back out through its
three arcs.

Two builds of the same animation ship, because the labels are baked in as
vector curves and therefore scale with the canvas:

| File | Canvas | Use it when |
|---|---|---|
| `dishbooks-sync.json` | 1188 × 800 | The graphic is ~450px wide or more. |
| `dishbooks-sync-compact.json` | 1000 × 800 | Narrow columns and phones. |

The compact build pulls the canvas in and scales the type up against it. At a
~340px phone width its labels land at 12.3px / 10.2px — the same sizes the
original HTML hub used there — where the wide build would render them at
8.6px / 6.9px, too small to read. On the site, `IntegrationHubLottie` swaps
between them at the `md` breakpoint (768px).

| | |
|---|---|
| Format | Lottie (bodymovin 5.7.4) |
| Length | 6.0s — 180 frames at 30fps |
| Loop | Seamless. Frame 180 is identical to frame 0, so it repeats with no visible cut. |
| Size | ~107 KB wide, ~105 KB compact |
| Background | Transparent |
| Fonts | None. All text is outlined to vector curves, so it renders identically everywhere. |

## Using it in Webflow

Webflow reads Lottie JSON natively — you do **not** need the `.txt` filename
trick. That workaround is only for custom `.js` files, which Webflow's asset
uploader rejects; `.json` it accepts as-is.

1. **Assets panel** (`Shift`+`A`) → **Upload** → pick `dishbooks-sync.json`.
2. Drag a **Lottie animation** element onto the canvas (Add panel → Media →
   Lottie animation).
3. In the element settings, choose `dishbooks-sync` as the source.
4. Set:

   | Setting | Value |
   |---|---|
   | Trigger | **Page load** (or *Scroll into view*, see below) |
   | Loop | **On** |
   | Direction | Forward |
   | Speed | 1 |
   | Renderer | **SVG** |
   | Preserve aspect ratio | On |

5. Size the **parent div**, not the Lottie element — the animation scales to
   fill its container. A `max-width` of around 900–1100px works for a hero
   or feature section. The element keeps its canvas ratio, so you only need
   to set width.
6. For mobile, add a second Lottie element pointing at
   `dishbooks-sync-compact.json` and show one or the other with Webflow's
   breakpoint display settings — the wide build's labels get too small below
   roughly 450px.

### Background

The file is transparent, and the hub disc is `#ffffff`. It's designed to sit
on the page background (`--color-surface-1`, `#f2f4f7`) so the white disc
reads as a raised surface. On a pure-white section the disc disappears into
the background and you lose that separation — use the light-grey surface, or
tell me and I'll rebuild the disc with a hairline border.

### Adding an entrance

The loop deliberately has no build-on intro: an intro baked into a looping
file replays every 6 seconds, which gets distracting on a page graphic.

For an entrance, animate the **wrapper div** with a Webflow interaction —
*Scroll into view* → fade `0% → 100%` opacity and move `20px → 0`. That's
more flexible than baking it in, and you can retune it without a new file.

If you'd rather have the build-on drawn into the Lottie itself (spokes
drawing outward, labels fading in, then settling into the loop), that's a
change to `tools/build_lottie.py` — ask and I'll generate the variant.

## Using it in this Next.js app

`components/IntegrationHubLottie.tsx` renders it, and `app/page.tsx` uses it
in the integrations section. It picks the variant with `matchMedia`, imports
the player inside the effect so it stays out of the initial bundle, ties
playback to an `IntersectionObserver` (the section is below the fold), and
holds a still frame when `prefers-reduced-motion` is set.

It needs the player: `npm install lottie-web`.

The original card-based `components/IntegrationHub.tsx` has been deleted; the
Lottie version replaces it.

## Editing it

Don't hand-edit the JSON. Everything is generated:

```bash
python3 tools/build_lottie.py
```

The knobs are all at the top of `tools/build_lottie.py`:

- **`Layout`** / **`CompactLayout`** — canvas size, hub radius, spoke
  lengths, type sizes, pulse and trail dimensions. `CompactLayout` subclasses
  `Layout`, so anything you don't override is inherited.
- **`Timing`** — frame rate, loop length, pulse travel time, and `STEP`, the
  gap between landings. Changing `DUR` or `STEP` re-tiles the whole loop
  automatically and keeps the seam invisible.
- **`CHANNELS`** — label copy, sub-label copy, position, and the colour of
  each channel's pulse.

The mark itself is parsed from the same path data as `LogoIcon` in
`components/Logo.tsx`, and the labels are Albert Sans (`tools/fonts/`)
outlined at build time via HarfBuzz, so kerning matches the live site.

Colours are the real tokens from `app/globals.css` — `#2eb2ff`,
`#326cff`, `#5542ff`, `#0b0c0d` — and they round-trip through the file
byte-exact.

## Previewing locally

Open `preview.html` in a browser (it pulls the lottie-web player from a CDN,
so you need to be online). It plays both builds at a few sizes and has a
frame scrubber, which is the quickest way to check a change before
uploading.
