# dishbooks.com site audit (9 Oct 2026)

Report: https://claude.ai/artifact/WGQmb3CuErFCGMyXEVD2Mr (source in `report/`).

- `lighthouse/summary.json`: medians of 3 runs × 9 pages × mobile/desktop (Lighthouse 12.8.2). Per-run JSON reports are git-ignored.
- `raw/`: crawl.json (35 sitemap pages + 404 test), links.json, interact.json, robots/sitemap, headers, Webflow asset listing.
- `screenshots/`: full-page and interaction PNGs (git-ignored; compressed copies used in the report are in `report/img/`).
- `scripts/`: run-lh.sh, crawl.mjs (Playwright + axe-core 4.10), interact.mjs, links.py, lhsum.py.

Read-only audit: nothing was changed or published in Webflow.
