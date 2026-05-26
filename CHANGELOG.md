# Changelog

All notable changes to Offsett Review. Newest first. The top-most `## vX.Y` heading is auto-injected into the footer of the running app.

## v3.16 — 2026-05-26

### Magazine cover
- Cover logo SVG viewBox tightened from `0 0 296 135` to `39 31 219 73`, cropping the empty padding that surrounds the glyph paths inside the original Figma export. The 77 mm × 27 mm container now renders the actual wordmark at its full intended size — previously the glyph occupied only ~57 mm inside that container because of internal whitespace. Result: the cover logo now reads at the same proportional size as in the Figma `Mag_cover` frame.

## v3.15 — 2026-05-26

### Magazine cover
- Cover logo resized and repositioned to match Figma "Layer_2" exactly: **77 mm × 27 mm** (the Figma frame is 218 pt × 76 pt at 72 dpi), with `margin: 5mm 0 14mm` so the top of the logo sits ~38 mm from the page edge — the same offset as in the source file. Previously the logo rendered at 130 mm wide with auto height, which made it dominate the cover and push the contents preview far down the page.
- SVG inside the logo container now uses `width: 100%; height: 100%` instead of intrinsic aspect ratio, locking the rendered logo to the exact Figma frame dimensions.

## v3.14 — 2026-05-26

### Magazine cover
- The Gambetta "Offsett Review" text wordmark on the cover is gone. The full Figma "Layer_2" inline-SVG logo (rose `#C2948A` + graphite `#2E3532`) replaces it at 130 mm wide, matching the brand mark used on the landing page.
- Cover meta line now includes the **final rendered page count** alongside the article count: `26 May 2026 · 3 Articles · 14 Pages`. The number is computed at runtime by `PagedConfig.after` (counts `.pagedjs_page` elements after Paged.js finishes paginating) and injected into the `.cover-meta-pages` slot before the print dialog fires. Accurate every time, regardless of article length or content.

## v3.13 — 2026-05-26

### Magazine cover
- Cover hero image no longer overlaps the contents preview. The image is now a flex child with `order: 2` so it sits *after* `cover-content` in visual flow even though it's first in the DOM, and `flex: 1 1 auto` makes it grow to fill whatever vertical space remains below the contents (eyebrow + wordmark + meta + I/II/III preview). Result: image always starts cleanly below the contents, regardless of how many articles or how long the titles run.
- The "FOR PERSONAL, OFFLINE READING" credit band moved from a free-floating 14 mm-above-bottom placement to a flush, full-width strip at the very bottom of the image. It now reads as an intentional caption bar rather than a label hovering mid-air. Padding bumped to 17 mm sides so the text aligns with the rest of the page grid.

## v3.12 — 2026-05-26

### Magazine
- Two-column threshold lowered from `wc > 1800` to `wc > 1200`. Most web articles fall in the 800–1500 range, so the previous setting left almost everything in a single column. At 12 pt Work Sans on A4 with 17 mm side margins, 1200 words is the inflection point where two columns reach a comfortable fill without starving the right column. Below 1200, articles stay single-column (intimate feel, narrower measure); above 1200, they flow into the two-column editorial layout with justified text and controlled hyphenation introduced in v3.5.

## v3.11 — 2026-05-26

### Fonts
- **Gambetta is now self-hosted.** Two variable WOFF2 files (`gambetta-variable.woff2` and `gambetta-variable-italic.woff2`, ~75 KB combined) sit in `./fonts/` and cover the full 300–700 weight range plus italic, replacing the six static cuts originally planned. Both the landing-page `<style>` and the magazine HTML now serve fonts via inline `@font-face` declarations pointing at these local files.
- Fontshare `<link>` removed from both the UI shell and the magazine `<head>`. This fixes the Chrome blank-page bug: Paged.js was being blocked by Fontshare's `Access-Control-Allow-Origin: https://api.fontshare.com` header when it tried to `fetch` the stylesheet to process `@page` rules. Same-origin font files have no such issue, so Chrome and Firefox now behave identically.
- Magazine popup uses an absolute font URL (`new URL('./fonts/', location.href).href`) so the popup's `about:blank` base URL doesn't break the path. Works on `localhost` and on GitHub Pages without modification.

### Deploy note
- Commit and push the new `./fonts/` directory. Without it the GitHub Pages build will 404 the font requests and fall back to Georgia.

## v3.10 — 2026-05-26

### Popup loader
- The "Preparing your magazine" placeholder now ships with an animated three-dot ellipsis loader in the rose accent — three small dots that bounce-fade in sequence so the user has visible feedback while fetch/extract/build runs in the background. Loads Work Sans inline so the placeholder matches the running app's typography.

### Magazine
- `.article-title` colour changed from black to rose `#c2948a` to match the cover wordmark and reinforce the accent typography across the issue.

## v3.9 — 2026-05-26

### Service worker (`sw.js`)
- Cache name bumped to `offsett-review-v3` so the new worker activates immediately and the old `v2` cache is deleted on `activate`.
- Switched to a **network-first** strategy for the app shell (`index.html`, `/`, `manifest.json`) and `CHANGELOG.md` — the running app and its dynamic version label now always reflect the latest deploy when online, and fall back to the cached copy only when offline. Everything else (fonts, libraries, images) remains cache-first so PWA offline reading still works.
- Fixes the stuck-on-old-version bug where the footer kept reading `v3.6` even after the changelog had moved to `v3.8`. The previous worker cached `CHANGELOG.md` once and never re-fetched it.

## v3.8 — 2026-05-26

### Generate flow (`generate()` in script)
- **Pop-up now opens immediately on click**, before any `await fetchArticle`. Previously the popup was opened only after up to three CORS-proxy fetches and Readability extraction had completed — by then the click's "user activation" had expired and Chrome/Safari silently blocked the window. The popup now shows a "Preparing your magazine…" placeholder while fetch/extract/build run in the background, and the magazine HTML is written into the same window once ready.
- **Print timing is now deterministic.** The old 4-second `setTimeout` could fire either before Paged.js finished paginating (blank preview) or long after it was done (lag). The magazine HTML now sets `window.PagedConfig.after` to `postMessage('paged-ready')` back to the opener; the opener listens for that message and calls `win.print()` the moment pagination completes. A 30 s safety net still triggers print if the message never arrives.
- **Closed-window guards** wrapped around every `win.focus()` / `win.print()` call, plus an `abort()` helper that closes the popup and re-enables the button on every early-return path. The button no longer gets stuck disabled if the user closes the magazine tab mid-process.

## v3.7 — 2026-05-26

### Cover
- Cover hero `<img>` no longer carries `crossorigin="anonymous"` — that attribute was forcing a CORS preflight that Substack and some other CDNs reject. The image now loads as a plain HTML asset. Added `referrerpolicy="no-referrer"` to avoid hotlink rejections from CDNs that block based on Referer.

### Known-good browser
- Generate the magazine in **Firefox** for best results. Chrome's strict cross-origin policy blocks Paged.js from fetching the Fontshare stylesheet when running on a `localhost` origin, which can produce a blank print preview. Firefox loads the stylesheet without issue. (A Chrome-friendly font swap was attempted and reverted — Gambetta is the chosen typeface and is preserved.)

## v3.6 — 2026-05-26

### UI
- Version label dropped from the hero eyebrow. Eyebrow now reads simply `Issue Compiler`.
- Footer now shows `Offsett Review · v3.6 · © 2026`. The version is read at runtime from this file's first `## vX.Y` heading, so bumping this changelog updates the live app automatically.
- Progress step "Opening print dialog" now reads "Opening print dialog · allow pop-ups" so users see the pop-up requirement before the browser blocks the window.

### Cover
- Cover hero image now falls back through each article in order — if the first article has no `<img>`, the second is tried, then the third. Cover is text-only only when none of the articles supply an image.

## v3.5 — 2026-05-26

### Magazine
- Empty TOC page eliminated. `.toc-page` hidden with `!important` and its `break-before` / `break-after` neutralised so Paged.js no longer leaves behind a blank sheet between cover and first article.
- Cover gains a hero image pulled from the first article — fills bottom 58% of A4 with `object-fit: cover`, matching the Figma image block. Cover footer overlays a translucent white band so the credit line stays legible on top of any image.
- Two-column body now justified with controlled hyphenation (`hyphenate-limit-chars: 8 4 3`, `hyphenate-limit-lines: 2`) and tightened word-spacing to suppress rivers.
- One-column body switched to `hyphens: manual` for a softer rag.
- Single-column threshold raised from `wc > 1200` to `wc > 1800` so mid-length articles read in a single comfortable measure.

### Fonts
- Magazine window now loads Gambetta (Fontshare) + Work Sans (Google Fonts) via `<link>` in the print document `<head>`, parallel with HTML parse. Duplicate `@import` removed from MAGAZINE_CSS. Resolves the "cover flashes then prints blank" race where Paged.js paginated before fonts arrived.

## v3.4 — 2026-05-26

### UI
- Header matches Figma: small lock-up icon and "OFFSETT REVIEW" title hidden — only the "WEB → MAGAZINE ENGINE" eyebrow and the 40 px rule remain.
- Hero eyebrow text updated to `Issue Compiler · v3.5` *(later removed in v3.6)*.
- Footer copyright updated to `Offsett Review © 2026`.

### Fonts
- Fontshare URL switched to `f[]=gambetta@1,2,3,4,5,6,7,8,9,10` so every weight and every italic face is fetched. Fixes the headline italic not rendering.

## v3.3 — 2026-05-26

### UI
- Inserted the exact Figma "Layer_2" wordmark as inline SVG inside `.app-main`, above the hero — "Offsett" in rose `#C2948A`, "REVIEW" in graphite `#2E3532`. CSS pseudo-element placeholder removed.
- Right-side image panel reintroduced via `.app-main::after`. Collapses to single column under 880 px viewport.

## v3.0 — 2026-05-26

### Fonts
- Replaced Playfair Display / EB Garamond / DM Mono stack with **Gambetta** (Fontshare) for display and **Work Sans** (Google Fonts) for UI and body.

### UI shell (`<style>` in `<head>`)
- Typography token set rebuilt to match Figma: hero headline 48 px Gambetta Semibold + Italic in rose `#C2948A`; hero sub-copy Work Sans Light 14 px / 1.83; eyebrow Work Sans 10 px UPPER tracking 0.2 em; URL inputs 12 px Work Sans with 1 px `#ADADAD` border; Generate button Gambetta Bold 18 px UPPER on rose fill.
- Colour palette switched to: white `#FFFFFF`, ink `#000`, Mine Shaft `#333`, Emperor `#555`, Silver Chalice `#AAA`, Silver `#ADADAD`, Dusty `#E9E9E9`, accent rose `#C2948A`, error `#B00000`.
- Progress step states recoloured: pending Silver Chalice, active Emperor, done rose accent, error red.
- Footer rules and decorative 40 px lines unified at `#ADADAD`.

### Magazine CSS (`MAGAZINE_CSS` inside `buildMagazine`)
- A4 page geometry: 20 mm top, 17 mm sides, 18 mm bottom. Running head and page number in Work Sans 8 pt `#555`, 0.08 em tracking; suppressed on the first (cover) page.
- Cover repainted white: rose `#C2948A` rules top and bottom, Gambetta Bold 96 pt wordmark in rose, three-column I/II/III contents preview with vertical pipe separators — TOC merged onto the cover.
- Article feature header: Gambetta Regular 48 pt title, Gambetta Italic 20 pt subtitle, Work Sans 10 pt UPPER meta with CSS pipe separators between author / source / metadata, rose bottom rule.
- Body type set in Work Sans 12 pt / 1.55, 0.01 em tracking.
- Pull quote: Gambetta Medium Italic 18 pt with 1 px rose left border.
- Drop cap, decorative diamond end-mark, and oversized quote glyph removed.
