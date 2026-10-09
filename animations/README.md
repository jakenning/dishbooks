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
  deliver.mjs            dist/ → a shareable folder with "Open deliverables.html"
  mockup.mjs             "Section mockup.html": the homepage tabs with the animations in place
  dist/                  output (git-ignored) — what you upload to Webflow
```

## Day-to-day

```bash
npm run anim            # preview at http://localhost:5178
npm run anim:render     # render the homepage version → animations/dist/
npm run anim:render -- --scene ops-calendar   # same, for another scene
npm run anim:render -- --scene ops-calendar-mobile
npm run anim:deliver    # copy dist/ to ~/Desktop/DishBooks Animations + an index page
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

| File | Audience | Company (fictional) | Dex is asked about |
|---|---|---|---|
| `home` | Homepage — multi-unit casual dining | Fernhollow Hospitality (4 locations) | Eastside labor |
| `independent-restaurants` | Independent Restaurants | Little Wren Bistro | food cost vs. last year |
| `multi-unit-groups` | Multi-Unit Groups | Brasswick Restaurant Group (7 locations, 3 concepts) | which location needs attention |
| `accounting-firms` | Accounting Firms | Tallis & Penn CPAs (rows are clients) | which client to call |
| `qsr` | QSR | Bolt & Bun Burgers (12 stores, top 4 shown) | #112 overnight labor |
| `fast-casual` | Fast Casual | Field & Fold (5 locations) | Tech Park labor |
| `casual-dining` | Casual Dining | Hollis Street Grill (3 locations) | Airport overtime |
| `fine-dining` | Fine Dining | Maison Verrault | food cost vs. last year |
| `coffee-shops` | Coffee Shops | Lanternfish Coffee (3 cafés) | Station Sq pastry waste |
| `pizzerias` | Pizzerias | Forno Ottavio (2 locations) | Lakeview cheese cost |
| `bars-nightclubs` | Bars & Nightclubs | The Velvet Ledger (2 venues) | Afterglow pour cost |
| `hotel-restaurants-bars` | Hotel Restaurants & Bars | The Ashcombe Hotel (4 F&B outlets) | In-Room Dining labor |

All names are invented. Before publishing, do a quick web search on any name
that will be prominent — an invented name can still collide with a real
business somewhere.

Each file holds what the Home dashboard shows for "Last 12 months": the five
KPI cards with monthly sparklines, the P&L summary vs. last year, monthly sales
vs. last year with guests and average check, the cost breakdown, prime cost by
location, the location performance table (up to 4 rows), the cell the story
flags, and the question/answer for Dex. The numbers are internally consistent:
prime cost = food + beverage + labor, EBITDA = sales − prime − opex, the KPI
cards match the P&L, and every trend is year-over-year. Ranges are tuned to
restaurant benchmarks — see the header of `generate.mjs`.

## Outputs (`dist/<scene>/<scenario>/`)

| File | Use |
|---|---|
| `.webm` | **Recommended.** VP9, 1320 × 924, 10s seamless loop, ~2 MB |
| `.mp4` | H.264 fallback for older Safari/iOS, ~2.4 MB |
| `.jpg` | Poster frame (the Dex moment) — fallback image / reduced motion |
| `.embed.html` | Paste into a Webflow **Embed** element (~47k characters, under Webflow's 50k limit; uses the site's Albert Sans) |
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

### Mobile versions

A scene can have a phone layout in a sibling folder named `<scene>-mobile`
(today: `ops-calendar-mobile`, 400 × 632, rendered at 2.5× → 1000 × 1580). The
preview's phone slot shows it automatically. In Webflow, add both versions to
the section and use the breakpoint visibility settings: hide the desktop
version on Mobile Landscape and Mobile Portrait, and hide the mobile version
on Desktop and Tablet. This works for videos and HTML embeds. An embed that
starts out hidden lays itself out correctly once it is shown.

## How a scene works

Each scene exports `meta` (size, duration, fps), `build(root, data)` which
creates the DOM once, and `frame(t)` which poses everything for time `t`.
`frame` must be a pure function of `t` — no state carried between frames —
which is what makes the scrubber and the frame-exact recorder work. New scenes:
copy `scenes/smart-ops-dashboard/`, keep that contract, and they show up in the
preview picker automatically. A scene can import from its own folder or a
sibling scene's folder. `render.mjs` follows those imports, and relative CSS
`@import`s, when it bundles the embed. Set `meta.scale` to change the video's
pixel ratio (default 1.5).

### Smart Ops Dashboard

The scene rebuilds the real DishBooks Home dashboard — same layout, Phosphor
icons, colours, type scale and chart styles as the app (light theme, taken
from staging in Oct 2026) — at a real 1440 × 1008 browser size, then films it
with a virtual camera:

| Time | Shot |
|---|---|
| 0–0.9s | Sign-in card, cursor clicks **Sign in** |
| 0.9–2.3s | Wide shot: the dashboard loads, KPIs count up, charts draw |
| 2.3–3.75s | Push in and pan along the KPI cards |
| 3.75–5.2s | Sales Performance, hover tooltip on the latest month |
| 5.2–6.5s | Pull back, scroll to Location Performance, the flagged cell lights up, cursor clicks **Ask Dex** |
| 6.5–9.45s | Dex panel: question typed and sent, answer streams in |
| 9.45–10s | Back to the sign-in card (seamless loop) |

The camera keyframes are in `measure()` in `scene.js` (scale + centre per
shot); the timings are in `CUES`. If the app's look changes, the tokens are at
the top of `scene.css` and the icons in `shared/icons.js` (copied from the
app's stylesheet). The Dex panel is designed from the app's tokens and
`.dex-message` styles rather than copied from the live panel.

### Ops Calendar

For the "Ops Calendar & 13-period accounting" section. The story and timings
live in `scenes/ops-calendar/opscal.js`. Each layout's `scene.js` holds only its
geometry: `ops-calendar` is the 880 × 616 desktop slot, and
`ops-calendar-mobile` stacks the same cards for phones. On phones the grid row's
Year and Entity move into a row header, the timeline labels sit above the bars,
and the Columns picker gets its own line. Phones have no pointer, so the mobile
version shows a fingertip tapping each control instead of a moving cursor. This scene has no app
window. It shows three components from the calendar workflow, floating on the
page background, at 880 × 616:

1. **A Calendars grid row.** This is the AG Grid on staging
   `/settings/calendars`, with columns Year, Entity, Fiscal Structure,
   Operational Structure, Operational Start and Operational End.
2. **A 2026 year timeline.** One row shows fiscal months, the other shows
   operational periods. Weekend days are shaded.
3. **A Total Sales chart.** It uses the P&L **Columns** picker, whose real
   options include "Operational Calendar → Period".

| Time | Beat |
|---|---|
| 0–1.6s | Cards rise in: Calendars row, timeline, then Total Sales by Month. The timeline draws while the month bars grow (uneven), and the four 5-weekend months (Jan, May, Aug, Oct) are flagged on both. |
| 1.6–3.15s | Cursor opens Operational Structure and picks **13-4**. Operational End changes from Dec 31 to Dec 30. |
| 3.15–4.8s | The operational row morphs into 13 equal 28-day periods, then the Q1–Q4 brackets (3-3-4-3) appear. |
| 4.8–6.3s | Cursor opens Columns and picks **Operational · Period**. |
| 6.3–9.3s | The bars re-flow into 13 even periods: "Every period: 28 days, 4 weekends". |
| 9.3–10s | Cards leave (seamless loop). |

The daily sales behind the chart come from each scenario's monthly history
(`months` / `sales.thisPeriod`), weighted by day of week per concept (bars peak
on weekends, coffee shops dip). The sales are scaled so the year adds up to the
scenario's sales KPI. The month and period totals are therefore sums of the same
days. The 2026 dates match staging: 13-4 runs P1 Jan 1–28 to P13 Dec 3–30, and
2027 starts Dec 31.

The recorder drives your installed Google Chrome through Playwright and pipes
PNG frames into ffmpeg (both already on this machine: `brew install ffmpeg` if
you set this up elsewhere). The HTML embed is minified with the terser that
ships inside Next.js.
