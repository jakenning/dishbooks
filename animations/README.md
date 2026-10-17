# DishBooks animations workspace

Product animations for dishbooks.com, built as HTML scenes that recreate the
DishBooks app UI with fictional data, then recorded to video.

```
animations/
  scenes/<scene>/        one folder per animation (HTML + CSS + JS)
  features/              the feature-page animations: kit.js (window, spotlight, camera),
                         pages.js (shared app pages) and one story per feature
    scene.js             ← CUES (all timings) at the top, then the layout
    scene.css            ← the look
  scenarios/<name>.json  fictional company / people / financials, one per audience
  scenarios/generate.mjs the assumptions that produce those JSON files
  shared/                brand tokens (base.css), Albert Sans, icons, COGS categories
  lib/                   timeline + player shared by every scene
  render.mjs             records scenes → dist/
  deliver.mjs            dist/ → a shareable folder with "Open deliverables.html"
  mockup.mjs             "Section mockup.html" (homepage tabs), "Why DishBooks mockup.html" and
                         "Homepage mockup.html" (those pages' heroes), with the animations in place
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
(today: `ops-calendar-mobile`, 400 × 632, and `custom-reports-mobile` and
`why-dishbooks-mobile` and `home-hero-mobile`, 400 × 720, all rendered at
2.5× → 1000 × 1580 / 1000 × 1800). The
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

### Custom Reports

For the "Custom reports — The right numbers, to exactly the right person."
tab. The story and timings live in `scenes/custom-reports/reports.js`, and each
layout's `scene.js` holds only geometry, like the Ops Calendar. The desktop
stage is 640 × 506, the shape of the 579 × 458 slot at 1440 wide, rendered at
2× (1280 × 1012). The phone layout `custom-reports-mobile` is 400 × 720 at 2.5×.
There is no app window, only the components of the reporting workflow,
floating on the page background:

1. **Report template.** The prebuilt Prime Cost P&L for last week (Total Sales,
   COGS, Labor, Prime Cost), with a chip showing whose view it is.
2. **Who gets it.** The owner (the scenario's user) sees every location; a GM
   sees only the location the scenario flags.
3. **Schedule.** Repeats Weekly, on Monday, at 7:00 AM, by email.
4. **Two inboxes.** Each person gets their own copy, on top of last week's.

| Time | Beat |
|---|---|
| 0–1.5s | The report rises in and its rows count up, scoped to the owner and all locations. |
| 1.5–2.3s | Cursor opens **COGS**, which unfolds into the company's own categories with share bars. |
| 2.2–4.4s | **Who gets it** rises in. Cursor picks the GM: the chip slides to their name and location, and every number rolls over to that location. |
| 4.45–6.4s | **Schedule** rises in. Cursor picks **Weekly**, then **M**, then **Schedule report**, which turns green: "Next: Mon, Oct 12 · 7:00 AM". |
| 6.65–9.3s | The app cards step back. Two inboxes rise, one per person, and Monday's email drops in above last week's, with each person's own prime cost, COGS and labor. |
| 9.3–10s | Everything leaves (seamless loop). |

On phones, the recipients and schedule cards share one slot under the report
(the schedule replaces the recipients at 4.4s), the inboxes stack, the email
snippets wrap, and a fingertip taps each control instead of a cursor.

The numbers are one week (1/52) of each scenario's annual P&L, rounded to
dollars before summing, so prime cost = COGS + labor and the categories add up
to COGS exactly. The group uses the scenario's P&L. The GM's location uses its
row in `locations` (food + bev = COGS %, labor %). Categories are per concept
(`CATS` in `shared/categories.js`, shared with Why DishBooks: proteins/produce/… for casual dining, liquor/beer/…
for bars, coffee/dairy/cups for cafés). The food and beverage shares come from
the location data. The GM's name and title are in `GMS`, also in
`reports.js`, and are fictional. Last week's email shows slightly higher
percentages, to suggest a recurring weekly report. Single-location scenarios
(`fine-dining`, `independent-restaurants`) show the same location for both
people.

### Why DishBooks

A full-app window for the Why DishBooks page. It sits under the hero copy and
straddles the hero and the section below. There are no camera moves: everything
happens inside the UI (pointer clicks, the nav highlight sliding, page
cross-fades, count-ups, charts drawing). The story lives in
`scenes/why-dishbooks/app.js`, and each layout's `scene.js` holds only geometry.
The components' CSS is in `scenes/why-dishbooks/app.css`, which both layouts
`@import`. The desktop stage is 1280 × 720 (16:9) at 1.5× (1920 × 1080). The
phone layout, `why-dishbooks-mobile`, is 400 × 720 at 2.5× (1000 × 1800). It
loops every 12s.

Four views, picked to cover what the page promises ("prime cost, COGS by
category, labor, cash … ready the moment you log in", AI):

The times below are story time. The loop is rotated so that each video
starts with Home loaded: the desktop at 2.3s (`startAt` in `scene.js`), and
the phone at 1.8s, since by 2.3s its menu drawer is opening. Frame 0, which is
also the poster and the frame Webflow shows before the video plays, is the
full dashboard.

| Time | Beat |
|---|---|
| 0–2s | **Home.** The KPIs rise in and count up, Sales Performance draws, and the Cost Breakdown donut sweeps. |
| 2–3.7s | Pointer → **Banking**. The cash balance counts up, and the bank feed cascades in with "Match found" chips. Pointer clicks **Accept N matches**: every row turns Reconciled, the progress bar fills, and the button turns green. |
| 4.55–6.9s | Pointer → **Reports**, which opens the **Prime Cost P&L** by location. The tiles and rows count up. Pointer opens **COGS**, which unfolds into the company's categories, and the outlier location's cell gets a red outline. |
| 7–10.2s | Pointer → **Ask Dex**. The panel slides in and the page narrows to make room. "Which location needs attention?" types out, sends, and the answer streams in, naming the flagged location. |
| 10.7–12s | Pointer goes back to **Home**. Dex closes and the page clears, so 12s = 0s. |

The P&L comes just before Dex, so the outlier Dex names is the one just
flagged. On phones, the sidebar is a drawer: a fingertip taps the menu button
and then the item. The page shows 4 KPIs, the flagged location next to Total
in the P&L, two-line bank rows, and Dex as a sheet.

**Numbers.** Everything comes from the scenario. Home's KPIs and the P&L tiles
use the same P&L, so they match. The by-location table is worked in hundreds of
dollars so that each column foots: categories add up to COGS, and COGS + labor
= prime cost. Total is the sum of the location columns, and a single location
has no Total column. The bank feed is one week of the P&L (deposits per
location, food and beverage purchases, payroll, rent, utilities), and its
accounts add up to the Cash Balance KPI. The vendor names (Larkfield
Provisions, Copperleaf Beverage Co., Valecrest Power & Light) are invented:
search them before publishing.

**Placement** (see "Why DishBooks mockup.html", written by `npm run
anim:deliver`):

- **Desktop.** Use the width of the hero content (about 1200px at a 1440
  viewport). Pull the window's lower half into the next section with
  `margin-bottom: -28.125%`, which is half of 720/1280. Percentage margins are
  of the parent's width, so wrap the window in a block that is exactly as wide
  as the window. Give the wrapper `position: relative; z-index: 2`. Start the
  next section with a same-width block with `padding-top: 28.125%`, so its
  content starts below the window.
- **Phones.** Keep the straddle. It reads as the same page, and the phone
  version is tall enough to anchor both sections. Use the mobile version
  (≤ 767px) in a 320px-wide slot, with -90% and 90% (half of 720/400).
  Webflow's visibility settings swap the two, as with the other scenes.

**On dishbooks.com it's video** (Webflow's Background Video element).
The HTML embeds mis-measure inside Webflow's page CSS. The window is
`.wdb-slot > .wdb-win`, already on the site, and holds two Background Videos:

| Element | Upload | Classes | Size |
|---|---|---|---|
| Desktop | `dist/why-dishbooks/home/why-dishbooks.mp4` (1920 × 1080) | `anim-desktop` + `wdb-video` | width 100%, height auto, aspect ratio 16 / 9; position relative, z-index 0 |
| Phone | `dist/why-dishbooks-mobile/home/why-dishbooks-mobile.mp4` (1000 × 1800) | `anim-phone` + `wdb-video-phone` | width 100%, height auto, aspect ratio 5 / 9; position relative, z-index 0 |

Each video's box must have the same aspect ratio as its video, so cover-fit
crops nothing. Then the −28.125% / −90% overhang is exactly half the
window's height. Keep Webflow's play/pause button switched on. `.wdb-spacer`
starts the next section. Webflow re-encodes uploads, so upload the MP4 (the
higher-quality file). Webflow uses the video's first frame as the poster,
and that frame is the loaded dashboard (see `startAt` above).

Three values that are easy to miss (all confirmed with the fixture below):

- **Height auto.** Webflow gives `.w-background-video` a height of 500px, and
  aspect-ratio is ignored while a height is set.
- **z-index 0.** Webflow gives the `<video>` `z-index: -100`. Without a
  stacking context on the wrapper, it paints behind `.wdb-win`'s own
  background and the window looks empty.
- **The hero's container on top.** Both sections' `v2-1512-container`s have
  z-index 10, so the next one sits over the window's lower half. That doesn't
  show, but it swallows clicks, and the play/pause button is down there. Give
  the hero's container the combo `is-over-next` with z-index 11. The nav is
  z-index 1000, so it stays above.

**Checking it on staging** (`verify/`, all read-only):

- `why-dishbooks-readback.mjs dump.json` checks the Designer work: structure,
  classes, autoplay/loop, and the style values. The input is a dump from the
  Webflow Data API; the script's header shows how to build it.
- `why-dishbooks.mjs` loads `https://dish-books.webflow.io/why-dishbooks` in
  Chrome at 1920, 1440, 1024, 768, 375 and 320 and checks:
  - the window's centre against the section boundary, and the heading below
  - which video shows, and that it plays, loops and is the right file
  - that the box aspect ratio matches the video
  - that the video's pixels are actually visible
  - the play/pause button, with a real click
  - horizontal overflow and console errors

  It also compares Webflow's transcodes with our MP4 (SSIM). Output goes to
  `dist/verify/why-dishbooks/`: `report.md`, `report.json`,
  `contact-sheet.png`, and the screenshots. It refuses any host except
  `*.webflow.io` and localhost.
- `why-dishbooks-fixture.mjs --variant naive|planned|fixed` serves the
  staging page locally with the planned elements added, to test the test.
  - `naive` fails on the 500px box and the hidden video.
  - `planned` fails only the play/pause click.
  - `fixed` passes everything.

**Embed size.** The embeds are about 48.9k characters at most (the multi-unit
groups scenario), close to Webflow's 50k limit. To keep them there:

- The CSS uses short token names under `.wdb`.
- The settings gear and the sun are drawn locally rather than with Phosphor
  paths.
- `render.mjs` drops icons a bundle never names.

If an edit pushes an embed over 50k, use the video.

### Homepage hero

The homepage's version of the Why DishBooks window: the same 1280 × 720 app
window (phone: 400 × 720), straddling the hero ("AI-powered accounting
software, built for restaurants.") and the section card below it. It tours the
product rather than one argument: Home, then the Ops Calendar, then a report,
then Dex. The story lives in `scenes/home-hero/hero.js`; each layout's
`scene.js` holds only geometry. Home, the Prime Cost P&L and Dex are the Why
DishBooks components (imported from `scenes/why-dishbooks/app.js`, and its
`scene.css` for the window). The Calendars page is drawn in `hero.js` and
`cal.css`, after the Ops Calendar scene. `render.mjs` bundles every module
into one scope, so `hero.js` keeps its names (`HCUES`, `makeHero`, …) clear
of `app.js`'s. It loops every 14s.

| Time | Beat |
|---|---|
| 0–1.9s | **Home.** The KPIs rise in and count up, Sales Performance draws, and the Cost Breakdown donut sweeps. |
| 1.95–2.6s | Pointer → **Settings**, which opens **Calendars**. |
| 2.75–3.6s | The Calendars grid row, the 2026 timeline (fiscal and operational rows) and Total Sales by Month rise in. The months with 5 weekends get an amber dot. |
| 3.8–4.6s | Pointer opens **Operational Structure** and picks **13-4**. Operational End changes from Dec 31 to Dec 30. |
| 4.55–5.7s | The operational row re-cuts into 13 periods of 28 days with Q1–Q4 brackets (3-3-4-3). The month bars fall and 13 even period bars rise: "Every period: 28 days, 4 weekends". |
| 5.75–8.2s | Pointer → **Reports**, which opens the **Prime Cost P&L** by location. The rows count up, COGS opens into the categories, and the outlier location gets a red outline. |
| 8.2–12s | Pointer → **Ask Dex**. "Why is Eastside's prime cost so high?" types out, sends, and the answer streams in, naming labor at the flagged location. |
| 12–14s | Pointer goes back to **Home**. Dex closes and the page clears, so 14s = 0s. |

The times are story time. The video starts at 1.9s (desktop) and 1.8s (phone),
`startAt` in each `scene.js`, so frame 0, which Webflow uses as the poster, is
the loaded dashboard. The calendar numbers are the Ops Calendar scene's: the
scenario's monthly sales spread over the days of 2026 and summed into months
and 28-day periods, so both sets of bars add up to the same year.

**Placement.** The homepage hero is built from the same classes as the Why
DishBooks hero, and those classes are global, so the same setup applies
(read through the Webflow Data API, Oct 2026):

- Hero container `.v2-1512-container`: add the combo `is-over-next`.
- Hero `.hero-content-block`: add the combo `is-wdb` (bottom padding 72px instead of 120px).
- After `.hero-content-block`, inside that container: `.wdb-slot > .wdb-win`
  holding two Background Videos, as in the Why DishBooks table above, with
  `dist/home-hero/home/home-hero.mp4` (`anim-desktop` + `wdb-video`) and
  `dist/home-hero-mobile/home/home-hero-mobile.mp4` (`anim-phone` +
  `wdb-video-phone`).
- The next section (the dark "Built around the numbers restaurants actually
  run on." card): `.wdb-spacer` as the first child of its
  `.v2-1512-container`, before `.v2-content-wrapper`. Put the spacer inside
  its own `.wdb-slot`, as in the mockup. The spacer's padding is a percentage
  of its parent's width and the window's overhang is a percentage of the
  slot's, so a spacer directly in the container comes out about 45px taller
  than the overhang at 1440 wide.

The embeds are about 59k characters (the calendar page adds about 10k), over
Webflow's 50k limit, so the homepage uses the videos.

## Feature pages

One animation per feature page (the Features CMS collection), shown where the
hero image is: a 5:4 slot beside the headline (4:5 on phones). The whole app
can't be read at that size, so each one is filmed: the app window (1280 × 1024)
opens on the page the feature lives on, whole; then one or two of its elements
at a time step forward (a blue ring, everything else dims, a short label), the
camera pushes in until they read at full size, and pulls back out at the end.
Phones get the app's phone layout (400 wide) in a 400 × 500 frame; the camera
pans down the page instead of zooming out. 10 s loops; frame 0 (the poster) is
the loaded page.

| Scene (`scenes/feature-<slug>`, `-mobile`) | Page | What lights up |
|---|---|---|
| `dex-ai` | Prime Cost P&L with Dex open | the question box; the answer; the answer beside the cells it's about |
| `smart-dashboard` | Home | sales + prime cost; net profit + cash; Sales Performance; Cost Breakdown |
| `prime-cost-cogs` | Prime Cost P&L | COGS + labor tiles; prime cost; COGS opening into categories; the flagged location |
| `custom-reporting` | Custom Reports | the report; recipients (a GM is added, scoped to their location); the schedule (Weekly · M · Schedule report) |
| `fiscal-calendar-accounting` | Settings → Calendars | the grid row (Months → 13-4); the timeline re-cut into 13 periods; Total Sales by period |
| `multi-location` | Location Performance | the location cards; prime cost bars; the flagged location's row; the group total |
| `invoice-bill-pay` | Expenses → Bills | bills needing approval; the invoice's coded line items; Approve; Schedule payment |
| `bank-reconciliation` | Banking | cash balance; matched transactions; Accept N matches; the feed reconciled |

Each scene folder is three small files (index.html, scene.js picking
`DESKTOP` or `PHONE` from `features/kit.js`, scene.css importing the window's
CSS, `features/kit.css` and the story's own `features/<slug>.css`). The story
in `features/<slug>.js` has the page markup, its motion and its `spots` (when
each spotlight starts, how long it stays, what it lights, the label) — that's
the file to edit for timing or wording. `focus` frames the camera on part of
what's lit; `zoom` caps the push-in. Stories import shared pages from
`features/pages.js`, never from each other: the bundle puts every module in
one scope, and two `STORY` consts would collide.

The invoices, vendors and line items in `invoice-bill-pay` are invented, like
the bank feed's: search them before publishing. Render one with
`npm run anim:render -- --scene feature-<slug>` (and `-mobile`).

**On dishbooks.com** they're CMS fields on Features: Hero Animation (desktop
MP4), Hero Animation Phone, and a poster for each. The template shows the
video in place of the Hero Image when Hero Animation is set; an item without
one keeps its Hero Image. See the Webflow notes in the commit that set it up.

The recorder drives your installed Google Chrome through Playwright and pipes
PNG frames into ffmpeg (both already on this machine: `brew install ffmpeg` if
you set this up elsewhere). The HTML embed is minified with the terser that
ships inside Next.js.
