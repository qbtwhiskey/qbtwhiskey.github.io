# The Bourbon Table Website

Static Progressive Web App for The Bourbon Table, a Central Illinois whiskey review archive built from a handwritten tasting archive.

## What Is Included

- `index.html` - the full static website page.
- `styles.css` - noir lounge visual system, responsive layout, review cards, modal styling.
- `app.js` - search, filters, quick style chips, review detail modal, app-install prompt, offline status, and related-pour recommendations.
- `manifest.json` - PWA app metadata for Home Screen installation.
- `sw.js` - service worker that caches the review app shell and data for offline use.
- `data/reviews.js` - indexed review data from the Google Drive inventory, now matched to the full local PDF set, with 281 manually standardized sample reviews.
- `assets/images/hero-lounge.png` - original lounge/table hero image generated for this project.
- `assets/images/leather-texture.png` - original texture image used for atmosphere.
- `assets/images/favicon.png` - simple TBT favicon.
- `assets/images/icon-192.png` and `assets/images/icon-512.png` - installable app icons generated from the favicon.

## Current Data Status

- 282 PDFs are available locally from `bb_taste_all_282`.
- 281 actual review sheets are published in the public archive; `1BLANK.pdf` is skipped as the blank template.
- 281 reviews have sample standardized tasting notes.
- 278 local transcription records were merged after the initial indexed sample records.
- No public review cards remain in the reviewed-with-notes-pending state.

## Local Review

Run a local static server from this folder so the service worker can be tested:

```powershell
python -m http.server 8765
```

Then browse to:

```text
http://localhost:8765/
```

The app uses only relative paths (`./`, `manifest.json`, and `./sw.js`) so it works from GitHub Pages without root-path routing.

## Adding More Reviews

Add new records to `data/reviews.js` inside `window.TBT_REVIEWS`. Keep each review id unique, then update `window.TBT_STATS` if totals or year ranges changed. After publishing to GitHub Pages, visitors will receive the updated review data the next time the service worker refreshes its cache.

## Free Hosting Options

- GitHub Pages: good free option for a simple static public site.
- Netlify: easy drag-and-drop or Git-connected deployment with free tier.
- Cloudflare Pages: fast free static hosting and good for custom domains.

## Items To Update Later

- Refine medium-low confidence readings from `TRANSCRIPTION_REVIEW_QUEUE.md` as the group reviews the published archive.
- Add real bottle photos only if the group owns the images or they are licensed for reuse.
- Add a custom domain, for example `thebourbontable.com`, if available.
- Add an email capture or contact form if the group wants sample offers, newsletter signups, or brand outreach.
- Add a disclosure policy before monetization or free-sample reviews.

## Public Branding Note

The original handwritten binder used a free public tasting sheet template and moved between houses and occasional cigar-club reading sessions. This site intentionally uses original branding, layout, images, and review presentation for The Bourbon Table.
