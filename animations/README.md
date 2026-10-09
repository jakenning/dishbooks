# DishBooks animations workspace

Product animations for dishbooks.com, built as HTML scenes that recreate the
DishBooks app UI with fictional data, then recorded to video.

```
animations/
  scenes/<scene>/        one folder per animation (HTML + CSS + JS)
    scene.js             ← CUES (all timings) at the top, then the layout
    scene.css            ← the look
  scenarios/<name>.json  fictional company / people / financials, one per audience
  scenarios/generate.mjs the assumptions that produce those JSON files
  shared/                brand tokens (base.css) + Albert Sans
  lib/                   timeline + player shared by every scene
  render.mjs             records scenes → dist/
  dist/                  output (git-ignored) — what you upload to Webflow
```

## Day-to-day

```bash
npm run anim            # preview at http://localhost:5178
npm run anim:render     # render the homepage version → animations/dist/
```

The preview shows the animation in a mock of the homepage slot, plus a phone
width version, with a scene/scenario picker and a scrubber. Add `&t=6.5` to a
scene URL to freeze on one moment.

### Common changes

| I want to… | Edit | Then |
|---|---|---|
| Change a number, name or Dex's answer, once | `scenarios/<name>.json` | `npm run anim:render` |
| Change numbers and keep them on regeneration | `PROFILES` in `scenarios/generate.mjs` | `npm run anim:data && npm run anim:render` |
| Speed up / slow down a beat | `CUES` at the top of `scenes/smart-ops-dashboard/scene.js` | refresh preview, then render |
| Restyle (colours, sizes, radii) | `scene.css` / `shared/base.css` | refresh preview, then render |
| Render one audience | | `npm run anim:render -- --scenario qsr` |
| Render every audience | | `npm run anim:render -- --scenario all` |
| Only the video | | `npm run anim:render -- --formats webm,mp4` |

Or just tell Claude what to change ("make the Dex answer about food cost",
"slow the tiles down", "add a fine-dining version for the concept page") — the
structure above is designed so those are small, targeted edits.

### Scenarios

| File | Audience | Company (fictional) |
|---|---|---|
| `home` | Homepage — multi-unit casual dining | Fernhollow Hospitality (4 locations) |
| `independent-restaurants` | Independent Restaurants | Little Wren Bistro |
| `multi-unit-groups` | Multi-Unit Groups | Brasswick Restaurant Group (7 locations, 3 concepts) |
| `accounting-firms` | Accounting Firms | Tallis & Penn CPAs → client Marigold Cantina |
| `qsr` | QSR | Bolt & Bun Burgers (12 locations) |
| `fast-casual` | Fast Casual | Field & Fold (5 locations) |
| `casual-dining` | Casual Dining | Hollis Street Grill (3 locations) |
| `fine-dining` | Fine Dining | Maison Verrault |
| `coffee-shops` | Coffee Shops | Lanternfish Coffee (3 cafés) |
| `pizzerias` | Pizzerias | Forno Ottavio (2 locations) |
| `bars-nightclubs` | Bars & Nightclubs | The Velvet Ledger (2 venues) |
| `hotel-restaurants-bars` | Hotel Restaurants & Bars | The Ashcombe Hotel (4 F&B outlets) |

All names are invented. Before publishing, do a quick web search on any name
that will be prominent — an invented name can still collide with a real
business somewhere.

The numbers are internally consistent: prime cost = food + labor, the
week-to-date sales tile is the sum of this week's bars in the chart, and the
deltas match the sparklines. Ranges are tuned to restaurant benchmarks (prime
cost 55–65%, ~46% for bars, ~67% for fine dining / hotel F&B; net profit
6–14%; cash ≈ 1.5–3 weeks of sales). See the header of `generate.mjs`.

## Outputs (`dist/<scene>/<scenario>/`)

| File | Use |
|---|---|
| `.webm` | **Recommended.** VP9, 1320 × 924, 10s seamless loop, ~0.7 MB |
| `.mp4` | H.264 fallback for older Safari/iOS, ~0.6 MB |
| `.jpg` | Poster frame (the Dex moment) — fallback image / reduced motion |
| `.embed.html` | Paste into a Webflow **Embed** element (~38 KB; uses the site's Albert Sans) |
| `.html` | Standalone page with fonts inlined — open locally, or host and iframe |

### Putting the video in Webflow

1. Upload the `.webm` and `.mp4` to the Webflow Assets panel (or any host you
   use for video).
2. Replace the homepage image in the Smart Dashboard tab with an **Embed**
   element containing:

   ```html
   <video autoplay muted loop playsinline preload="metadata"
          poster="POSTER_URL" aria-label="DishBooks Smart Ops Dashboard"
          style="display:block;width:100%;height:auto;border-radius:12px">
     <source src="WEBM_URL" type="video/webm">
     <source src="MP4_URL" type="video/mp4">
   </video>
   ```

   (Webflow's built-in Background Video element also works, but it re-encodes
   uploads and softens UI text — the embed keeps the original quality.)
3. The video is 10:7, the same shape as the image it replaces (655 × 458).

### Using the HTML embed instead

Paste the whole contents of `smart-ops-dashboard.embed.html` into an Embed
element. It renders live (crisp at any zoom), pauses when scrolled off-screen,
and holds a still frame for visitors with reduced motion turned on. It scopes
all of its CSS under `.db-anim`, so it won't affect the rest of the page.

## How a scene works

Each scene exports `meta` (size, duration, fps), `build(root, data)` which
creates the DOM once, and `frame(t)` which poses everything for time `t`.
`frame` must be a pure function of `t` — no state carried between frames —
which is what makes the scrubber and the frame-exact recorder work. New scenes:
copy `scenes/smart-ops-dashboard/`, keep that contract, and they show up in the
preview picker automatically.

The recorder drives your installed Google Chrome through Playwright and pipes
PNG frames into ffmpeg (both already on this machine: `brew install ffmpeg` if
you set this up elsewhere).
