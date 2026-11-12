# Beauty Art Lights — Scraped Dataset

Complete extract of **[Beauty Art Lights](https://beautyartlights.com)**,
captured from the live site with a purpose-built scraper
(`tools/`). Everything here is derived from the source site — no invented content.

## What was captured

| Asset | Count | Where |
|---|---|---|
| Products (SKU detail pages) | **237** | `data/products.json`, `docs/03-product-catalogue.md` |
| Category listings | **14** | `data/categories.json`, `docs/02-category-taxonomy.md` |
| Images downloaded | **1435** | `assets/images/`, `docs/05-image-manifest.md` |
| Static pages (About, Contact, Home) | 4 | `data/pages/*.md`, `data/site.json` |
| Product codes | 237 | `Product Code: BT###` |

## Documents

| File | Contents |
|---|---|
| [`01-site-overview.md`](01-site-overview.md) | Brand, navigation, contact details, platform, commerce model |
| [`02-category-taxonomy.md`](02-category-taxonomy.md) | The 14 category URLs, item counts, slug map |
| [`03-product-catalogue.md`](03-product-catalogue.md) | **Every product** with full data, images, specs, copy |
| [`04-products-by-category/`](04-products-by-category/) | The same catalogue split into one file per category |
| [`05-image-manifest.md`](05-image-manifest.md) | Every image: source URL, local path, pixel size, bytes |
| [`06-data-quality-audit.md`](06-data-quality-audit.md) | **Gaps and bugs found in the source data** — read before rebuilding |
| [`07-brand-assets.md`](07-brand-assets.md) | Logo, banners, promos, fonts, colours, favicons |
| [`08-content-analysis.md`](08-content-analysis.md) | Filter-facet analysis: finishes, colours, bulbs, power, materials, spaces |
| [`09-catalogue-hygiene.md`](09-catalogue-hygiene.md) | **Variant families, re-listings and product-code gaps** — the catalogue's real product-line structure |
| [`10-build-brief.md`](10-build-brief.md) | **Start here for the rebuild** — what the data says the new site needs |
| [`research/`](research/) | External market + rebuild research (cited, with verification status) |

## Machine-readable data

```
data/
  products.json     237 products, every scraped field
  categories.json   14 category listings with per-page product links
  site.json         nav tree, footer, contact details, static page text
  images.json       1435 image records (url, local path, w/h, bytes, sha1)
  variants.json     variant families (design x finish) + re-listing pairs
  site-data.json    **build-ready dataset** — normalised products, facets, categories, variant groups
  products.csv      flat one-row-per-product export
  pages/*.md        raw text of the static pages
```

## Reproducing

```bash
python3 -I tools/bal_crawl.py     # crawl categories + products  (cached in _scrape/raw/pages)
python3 -I tools/bal_site.py      # nav, footer, contact, static pages
python3 -I tools/bal_images.py    # download every image
python3 -I tools/bal_variants.py  # variant families + re-listings + code gaps
python3 -I tools/bal_build_data.py # build-ready data/site-data.json
python3 -I tools/bal_report.py    # regenerate every markdown file
```

Raw HTML for all 254 fetched pages is kept under `_scrape/raw/pages/`,
so the parse is reproducible without hitting the network again.
