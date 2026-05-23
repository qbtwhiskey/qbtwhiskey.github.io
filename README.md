# The Bourbon Table Website

Static first-pass website for The Bourbon Table, a Central Illinois whiskey review archive built from a handwritten tasting archive.

## What Is Included

- `index.html` - the full static website page.
- `styles.css` - noir lounge visual system, responsive layout, review cards, modal styling.
- `app.js` - search, filters, quick style chips, review detail modal, and related-pour recommendations.
- `data/reviews.js` - indexed review data from the Google Drive inventory, now matched to the full local PDF set, with 231 manually standardized sample reviews.
- `assets/images/hero-lounge.png` - original lounge/table hero image generated for this project.
- `assets/images/leather-texture.png` - original texture image used for atmosphere.
- `assets/images/favicon.png` - simple TBT favicon.

## Current Data Status

- 282 PDFs are indexed from the Google Drive folder inventory.
- 282 PDFs are available locally from `bb_taste_all_282`.
- 281 review sheets have generated transcription crops; `1BLANK.pdf` is skipped as the blank template.
- 231 reviews have sample standardized tasting notes.
- 227 additional local reviews were transcribed after the initial 5-review sample.
- The remaining reviews are title/date/style indexed and marked as reviewed with notes pending.

## Local Review

Open `index.html` directly in a browser, or run a local static server from this folder:

```powershell
python -m http.server 8765
```

Then browse to:

```text
http://localhost:8765/
```

## Free Hosting Options

- GitHub Pages: good free option for a simple static public site.
- Netlify: easy drag-and-drop or Git-connected deployment with free tier.
- Cloudflare Pages: fast free static hosting and good for custom domains.

## Items To Update Later

- Replace sample transcription with a full OCR/transcription workflow once the handwriting cleanup approach is chosen.
- Decide whether to keep every indexed bottle visible as reviewed with notes pending or hide pending reviews until the tasting notes are published.
- Add real bottle photos only if the group owns the images or they are licensed for reuse.
- Add a custom domain, for example `thebourbontable.com`, if available.
- Add an email capture or contact form if the group wants sample offers, newsletter signups, or brand outreach.
- Add a disclosure policy before monetization or free-sample reviews.

## Public Branding Note

The original handwritten binder used a free public tasting sheet template and moved between houses and occasional cigar-club reading sessions. This site intentionally uses original branding, layout, images, and review presentation for The Bourbon Table.
