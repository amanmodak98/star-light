# 07 — Brand Assets

## Logo

| | |
|---|---|
| File | `assets/images/site/1727265960.gif` |
| Source URL | https://beautyartlights.com/media/settings/1727265960.gif |
| Dimensions | 100×100 |
| Format | **GIF** (not SVG) — see note below |
| Used in | header, mobile menu, footer (3 occurrences) |
| Mark | A **"BAL" monogram** — interlocking serif "B" and "L" letters inside a thin gold ring, on a dark charcoal disc |

> **Note for the rebuild:** the logo is a raster GIF. An SVG or a high-resolution
> PNG with a transparent background would be better on every axis — scaling,
> crispness on HiDPI, and file size. The mark itself is strong and distinctive
> (a gold-on-charcoal seal), so it should be redrawn rather than replaced.

## Hero banners

| Local file | Dimensions | Source URL |
|---|---|---|
| `assets/images/site/1762429813.jpg` | 1340×400 | https://beautyartlights.com/media/banner/1762429813.jpg |
| `assets/images/site/1763877272.jpg` | 1200×600 | https://beautyartlights.com/media/banner/1763877272.jpg |

## Category / promotional imagery

| Local file | Dimensions | Source URL |
|---|---|---|
| `assets/images/site/1761133840.png` | 1600×1280 | https://beautyartlights.com/media/image/1761133840.png |
| `assets/images/site/1761134241.png` | 1600×1280 | https://beautyartlights.com/media/image/1761134241.png |
| `assets/images/site/1761134423.png` | 1600×1280 | https://beautyartlights.com/media/image/1761134423.png |
| `assets/images/site/1761134591.jpg` | 1600×1280 | https://beautyartlights.com/media/image/1761134591.jpg |
| `assets/images/site/1761134673.png` | 1600×1280 | https://beautyartlights.com/media/image/1761134673.png |
| `assets/images/site/1761135322.png` | 1600×1621 | https://beautyartlights.com/media/image/1761135322.png |
| `assets/images/site/1761135431.png` | 1600×1621 | https://beautyartlights.com/media/image/1761135431.png |
| `assets/images/site/1761136911.jpg` | 1600×1280 | https://beautyartlights.com/media/image/1761136911.jpg |
| `assets/images/site/1761217527.png` | 1600×1280 | https://beautyartlights.com/media/image/1761217527.png |

## Typography

The site loads these Google Fonts:

- `family=Material+Icons`
- `family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap`
- `family=Open%20Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap`

Used in the theme CSS: **Montserrat** (display) and **Open Sans** (body). The
product descriptions additionally carry Etsy's `ABCDiatype` — an artefact of
the pasted copy, and one more reason to rewrite the descriptions.

## Colour

The theme's own stylesheet uses a muted grey-green for the sticky header
(`#9e9f9e`). The product photography is the real brand signal: matte black,
antique brass, gold brass, red, green and blue fixtures on neutral backdrops.
A rebuild should derive its palette from the product photography rather than
from the current chrome, which reads as unfinished.

## Product photography characteristics

This is the single strongest asset the site has, and it shapes the rebuild.

| Property | Value |
|---|---|
| Count | {len(prod_imgs)} files |
| Dominant resolution | 1600 × 1621 px ({sum(1 for i in prod_imgs if i.get('width')==1600 and i.get('height')==1621)} files) |
| Formats | {", ".join(f"{k}: {v}" for k, v in Counter(i['local'].rsplit('.',1)[-1] for i in prod_imgs).most_common())} |
| File size | {min((i.get('bytes') or 0) for i in prod_imgs):,} – {max((i.get('bytes') or 0) for i in prod_imgs):,} bytes (PNG) |
| Total | {sum(i.get('bytes') or 0 for i in prod_imgs)/1048576:.1f} MB |
| Background | Neutral off-white/light-grey studio backdrop |
| Lighting | Product is lit and glowing — warm, consistent |
| Aspect | Square-ish, near 1:1 |

**Design note.** The photography is high quality and consistent, but each frame
has a great deal of empty space above and below the fixture — the product
occupies roughly the middle band of a square canvas. In a tight product grid
this reads as "small and distant". The rebuild should crop to the subject
(either by asset pipeline or by CSS `object-fit: cover` with a tuned
`object-position`), and keep the full uncropped frame for the zoom/lightbox.

The PNG format is the other lever: converting the catalogue to WebP or AVIF
would cut the {sum(i.get('bytes') or 0 for i in prod_imgs)/1048576:.0f} MB of
product imagery by roughly 70–80% with no visible loss at display size.

## Favicons

| Local file | Source URL |
|---|---|
| `assets/images/site/32x32.png` | https://beautyartlights.com/front/images/32x32.png |
| `assets/images/site/64x64.png` | https://beautyartlights.com/front/images/64x64.png |
| `assets/images/site/contact-us.jpg` | https://beautyartlights.com/front/images/contact-us.jpg |
| `assets/images/other/32x32.png` | https://beautyartlights.com/front/images/32x32.png |
| `assets/images/other/64x64.png` | https://beautyartlights.com/front/images/64x64.png |
| `assets/images/other/contact-us.jpg` | https://beautyartlights.com/front/images/contact-us.jpg |
