# Beauty Art Lights — the wholesale catalogue site

A static rebuild of **beautyartlights.com**: a B2B catalogue of 236 decorative lighting
fixtures across 10 ranges and 12 finishes, with the full specification published on every
item and an enquiry as the only conversion path.

The site is a Next.js 16 static export. It reads a normalised dataset derived from the
scraped source, so the catalogue can never drift from the data it was generated from.

---

## Running it

```bash
npm install
npm run images     # generate the WebP ladder from ../assets/images  (once; ~20 min)
npm run data       # rebuild src/data from ../data/site-data.json
npm run fonts      # self-host Archivo and Azeret Mono
npm run dev        # http://localhost:4321
npm run build      # static export to ./out
```

`npm run build` runs `npm run data` first. `npm run verify` checks the export against the
acceptance criteria (page inventory, facet sums, image resolution, redirect targets,
content integrity).

Deploy `out/` to any static host. Two redirect maps are generated for you:
`public/_redirects` (Netlify, Cloudflare Pages) and `vercel.json` (Vercel). Next.js's own
`redirects()` is not used because it is not applied in a static export.

---

## Where the data comes from

```
../data/site-data.json   the scrape, normalised by tools/bal_build_data.py
        │
        ▼  scripts/build-catalogue.mjs
src/data/catalogue.json  207 designs, 236 SKUs, facets, categories
src/data/index.json      236 slim rows — the only catalogue payload sent to the browser
src/data/images.json     every generated image, its dimensions and its backdrop tone
src/data/redirects.json  263 redirects from the source site's URLs
```

`scripts/build-catalogue.mjs` is a **new** normaliser rather than a re-run of
`tools/bal_build_data.py`. The upstream one has five defects that matter for a published
site, and it is also where the catalogue's structural decisions are made:

| Decision | Why |
|---|---|
| Merge four duplicate category slugs | `vertical-light1`, `horizontal-light1`, `table-lamp` and `floor-lamp` hold six products that belong to categories that already exist. The source site listed them separately and linked to two of them from nowhere. 14 slugs become 10 real ranges. |
| Collapse 23 variant families into designs | A family is one fixture offered in two or three finishes. 53 SKUs become 23 designs with a finish selector, so "do you have this in matte black?" is one click instead of a keyword race between colourway pages. |
| Drop one re-listing | Products 510 and 512 are the same fixture in the same Red finish. 512 loses; the old URL redirects. |
| Rewrite every finish value | The source's own Finish field is entered inconsistently: "Black", "Gold", "Golden", "Matte Gold" and "Brass Gold" all appear for what the photography shows are two finishes. Every override was checked against the product's own photograph, not inferred from the keyword title. |
| Rewrite every description | The scraped copy is pasted from Etsy, carries Etsy's own font and class names, and is reused verbatim across visually different products. Each published description is generated from that product's own recorded attributes. |
| Keep certification, wattage, MOQ and IP rating as "on request" | The scrape holds none of them. A blank row reads as an oversight and an invented value would be a lie, so the product page says what is not published and asks. |

The facets are the same set the data supports: category, finish, bulb base, number of
bulbs, power source, material. **Certification, applicable space and voltage are
deliberately not filters** — the first is empty on all 229 products that carry the row, the
second is identical boilerplate on all 237, and the third is a single constant. The reason
travels with the data in `catalogue.json` under `facets.excluded`.

---

## The image pipeline

`scripts/optimize-images.mjs` turns 1,412 photographs at 1600×1621 into a WebP ladder of
320 / 640 / 960 / 1280, and the nine editorial interiors into 320 / 640 / 960 / 1280 / 1920.

- **Trim to the subject.** Each frame is trimmed to the fixture, then scaled to fill as much
  of a square as it can without being cropped, and centred on a canvas painted in that
  photograph's own backdrop colour. The margin is therefore invisible and the product reads
  large in the grid.
- **The trim is guarded.** Sharp's trim needs a uniform border, and these studio backdrops
  have a lighting gradient, so on 76% of frames it finds nothing to cut. A trim is accepted
  only if it keeps at least 55% of both axes and the resulting aspect stays plausible.
- **Every output is exactly square**, so the srcset is honest and file sizes are predictable.
  Sizing by width alone was the obvious approach and the wrong one: a tall spiral pendant at
  "width 1280" becomes 1280 × 3674, and the catalogue grew to 117 MB instead of 113 MB.
- **On disk the ladder is 112 MB against 126 MB of source photography**, because four widths
  are generated rather than one. The saving that matters is per request: a catalogue card
  costs a median of **3.4 KB on a phone and 8.4 KB on a desktop**, against roughly 89 KB for
  the source frame. A browser that scrolls the whole catalogue now transfers a few megabytes
  rather than a couple of hundred.

`src/data/images.json` records each image's output dimensions and its backdrop tone. The
tone is what lets a card's plate be painted in the exact colour its photograph was shot
against, so the image never sits in a visible rectangle inside its card.

---

## Structure

```
src/
  app/
    layout.tsx                  masthead, footer, WhatsApp float, skip link
    page.tsx                    home
    catalogue/page.tsx          the faceted catalogue
    catalogue/[category]/       one per range
    products/[slug]/            one per design, with the finish selector
    customise/ about/ contact/ privacy/
    sitemap.ts robots.ts not-found.tsx
  components/
    ProductPlate ProductImage PlateImage Gallery
    CatalogueBrowser FinishRail SpecTable EnquiryForm
    Header Footer WhatsAppFloat Seal
  lib/
    site.ts        client-safe: types, constants, pure helpers
    catalogue.ts   server-side: the generated JSON and lookups
    image-loader.ts seo.ts
  styles/
    tokens.css base.css components.css fonts.css
```

`lib/site.ts` carries the types and helpers with no data import, so a client component can
depend on it without dragging 685 KB of product records into the browser bundle.

---

## Design

Light and warm, sampled from the assets rather than chosen by eye:

| Token | Value | Where it came from |
|---|---|---|
| `--paper` | `#FBF8F3` | the page canvas |
| `--bone` | `#F2EDE4` | the plate a product photograph sits on |
| `--ink` | `#171310` | primary text, 17.4:1 on paper |
| `--brass` | `#846515` | accent text, 5.1:1 on paper |
| `--brass-2` | `#EEC45A` | the logo's exact gold, measured from the source GIF |
| `--glow` | `#F6D89A` | the 2700 K bulb glow present in every photograph |

Type is **Archivo** (variable, with a width axis — headlines sit at `wdth 112`, which reads
as trade signage rather than the default grotesque) and **Azeret Mono** for anything that is
data: product codes, dimensions, spec values, counts.

The catalogue's axis is **finish**, so finish gets the prominence of a first-class filter
rather than being buried in a facet list, and the active chip fills with the real finish
colour. Product codes are never optional: 153 of the 237 derived product names are shared by
more than one SKU, so in wholesale trade the code is what identifies a fixture.

---

## What is deliberately absent

- **No prices.** The source publishes `$ 0` on 223 products and `$ -2` on 14. The business
  is enquiry-led, so the price is a state, not a number.
- **No structured `offers`.** Google requires a published price above zero for merchant
  listings. The markup targets the product-snippet class with `productGroupID` and
  `hasVariant` instead, where every finish carries its own unique SKU.
- **No third-party requests.** Fonts and images are self-hosted; the site sets no cookies,
  runs no analytics and loads nothing from another company.
- **No backend.** The enquiry form composes a `mailto:` or a WhatsApp message in the
  browser. Nothing is transmitted by the site, and there is no third-party form service to
  stop delivering.
