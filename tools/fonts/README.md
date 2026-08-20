# Build fonts

`tools/build_lottie.py` outlines the animation labels to vector curves using
**Albert Sans** by Andrés Torresi — the same typeface the site loads through
`next/font/google` in `app/layout.tsx`.

The `.ttf` files are build-time input only. The published Lottie contains
outlined paths, not font data, so nothing at runtime reads them. They are
**not checked in**: the build fetches the Regular and SemiBold weights from
Google Fonts on first run, pinned by URL and verified against a SHA-256 in
`FONTS` at the top of `build_lottie.py`, then caches them here.

That means the first build needs network access. After that it's offline. If
a cached file ever fails its hash check the build stops rather than producing
subtly different letterforms — delete the file and re-run to refetch.

Albert Sans is licensed under the SIL Open Font License 1.1
(https://openfontlicense.org). Source:
https://fonts.google.com/specimen/Albert+Sans
