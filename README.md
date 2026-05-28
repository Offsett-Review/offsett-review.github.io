# Offsett Review
### Web → Magazine PDF Engine · Personal Edition

A client-side PWA that fetches up to three public article URLs, extracts their content using Mozilla Readability, typesets them into a high-end editorial layout using Paged.js, and outputs a print-ready A4 PDF — formatted for offline reading on iPad.

---

## Files

```
offsett-review/
├── index.html        — App shell + all logic (self-contained)
├── manifest.json     — PWA manifest (install to home screen)
├── sw.js             — Service worker (offline support)
├── CHANGELOG.md      — Version history (auto-read by app on load)
├── fonts/
│   ├── gambetta-variable.woff2         — Gambetta regular (Fontshare)
│   └── gambetta-variable-italic.woff2  — Gambetta italic (Fontshare)
└── README.md         — This file
```

---

## Local Use (Quickest Path)

**Option A — Open directly in browser**
```
Just open index.html in Chrome or Safari.
No build step. No server required.
```

**Option B — Local server (recommended for full PWA features)**
```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .

# Then open: http://localhost:8080
```

---

## Deploy to GitHub Pages (Free, Permanent URL)

1. Create a new GitHub repository (public)
2. Upload all three files to the root
3. Go to Settings → Pages → Source: `main` branch, `/` (root)
4. Your app is live at `https://yourusername.github.io/repo-name`

**Install as PWA on iPad:**
- Open the GitHub Pages URL in Safari
- Tap Share → Add to Home Screen
- Tap "Add"
- It now runs standalone, offline-capable

---

## How to Use

1. Paste 1–3 public article URLs into the inputs
   - URLs are validated live (private IPs are blocked)
   - Green dot = valid, red dot = blocked/malformed
2. Tap **Generate Magazine**
3. Watch the progress steps:
   - Validating URLs
   - Fetching via CORS proxy (allorigins.win)
   - Extracting article content (Readability.js)
   - Sanitizing HTML (DOMPurify)
   - Building magazine layout (Paged.js)
   - Opening print dialog

> URL indicators: rose dot = valid, red dot = blocked or malformed
4. A new window opens with the typeset magazine
5. On iPad: tap the Share icon → Save to Files (or print, AirDrop, etc.)

---

## Magazine Output

**Cover page** — White background, editorial layout. Offsett Review wordmark in terracotta, eyebrow label "Personal Archive", date, article count, and a preview list of article titles with Roman numeral indices. A thin terracotta rule runs across the top and bottom. If any fetched article contains an image, the first one found is used as a hero image filling the lower half of the cover, with a frosted footer overlay.

**Table of contents** — Generated in code but not rendered; suppressed via CSS. Article titles appear on the cover instead.

**Articles** — Each starts on a new page with a feature header containing the source name, byline (if available), read time (calculated at 220 wpm), article title in Gambetta at 48pt in terracotta, and excerpt in italic Gambetta if present.

**Column layout** — Determined by word count:
- < 1,200 words → Single left-aligned column, max-width 120mm
- ≥ 1,200 words → Two justified columns, 7mm gap, no column rule

**Typography:**
- Body text in Work Sans 12pt, 1.55 line height
- Headings (h2) in Gambetta semibold 22pt, spanning both columns
- Subheadings (h3) in Gambetta medium italic 16pt
- Blockquotes in Gambetta medium italic 18pt with a terracotta left border, spanning both columns
- Figcaptions in Work Sans 9pt, uppercased, grey
- Paragraphs spaced with 3mm margin, no text indent
- No drop cap

**Running heads** — Article title on the top left, page number on the top right. Suppressed on the cover page.

**Page size:** A4 (210 × 297mm), margins 20mm top, 17mm left/right, 18mm bottom.
---

## Architecture

```
URL Input
  └── validateURL()           — SSRF protection, blocks private IPs
        └── fetchViaProxy()   — allorigins.win CORS proxy
              └── extractArticle()  — Readability.js + DOMPurify
                    └── buildMagazineHTML()  — Paged.js layout
                          └── window.print()  — Native iOS print dialog
```

**Security layers:**
- Private IP ranges blocked before any fetch
- All HTML sanitized via DOMPurify (allowlist-only tags/attrs)
- No eval, no dynamic script injection
- Content never touches live DOM unsanitized

---

## Limitations

- **Paywalled articles** will not extract (by design — Readability sees only what's public)
- **JavaScript-heavy SPAs** (e.g. React apps) may not render via proxy — static HTML sites work best
- **allorigins.win** is a free public CORS proxy — not for sensitive URLs
- **PDF generation** uses the browser's native print dialog — on iPad this is Print → Save to Files (2 taps)
- **Images** are inlined from their original URLs — if an image URL is broken, it is silently dropped

---

## Future (Product Path)

Replace `allorigins.win` with a single Cloudflare Worker:

```js
// worker.js — deploy free on Cloudflare Workers
export default {
  async fetch(request) {
    const url = new URL(request.url).searchParams.get('url');
    // Add your own SSRF validation here
    const res = await fetch(url, { headers: { 'User-Agent': 'OffsetReader/1.0' }});
    const html = await res.text();
    return new Response(JSON.stringify({ contents: html }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
```

This gives you a free, controlled, auditable proxy with no third-party data exposure.

---

## Credits

- **Readability.js** — Mozilla Foundation
- **DOMPurify** — Cure53
- **Paged.js** — Pagedmedia.org / W3C Paged Media polyfill
- **Gambetta** — Fontshare / ITF Free License (self-hosted variable font)
- **Work Sans** — Wei Huang (Google Fonts)
