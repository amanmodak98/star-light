#!/usr/bin/env python3
"""
Turn the scraped JSON into human-readable markdown documents.

Writes docs/*.md and data/products.csv. Everything is derived from
data/products.json, data/categories.json, data/site.json and data/images.json.

Standard library only. Run with `python3 -I tools/bal_report.py`.
"""

import os
import re
import csv
import json
import sys
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bal_crawl as C  # noqa: E402

ROOT = C.ROOT
DATA = os.path.join(ROOT, "data")
DOCS = os.path.join(ROOT, "docs")
BYCAT = os.path.join(DOCS, "04-products-by-category")
os.makedirs(BYCAT, exist_ok=True)

BASE = "https://beautyartlights.com"

# canonical display order + labels for the scraped category slugs
CATEGORY_LABELS = {
    "chandelier-lights": "Chandelier Lights",
    "floor-lamps": "Floor Lamps",
    "hanging-lights": "Hanging / Pendant Lights",
    "horizontal-lights": "Horizontal Wall Lights",
    "mirror-lights": "Mirror Lights",
    "table-lamps": "Table Lamps",
    "table-tripod-lamps": "Table Tripod Lamps",
    "tripod-floor-lamps": "Tripod Floor Lamps",
    "vertical-lights": "Vertical Wall Lights",
    "wall-clocks": "Wall Clocks",
    "wall-light": "Wall Lights",
    "bedroom-decor": "Bedroom Decor",
    "floor-lamp": "Floor Lamp (singular slug)",
    # duplicate / orphan slugs that exist only inside product URLs
    "vertical-light1": "Vertical Wall Lights *(duplicate slug)*",
    "horizontal-light1": "Horizontal Wall Lights *(duplicate slug)*",
    "table-lamp": "Table Lamps *(singular slug)*",
}

# colour synonyms -> canonical finish family
FINISH_MAP = [
    ("matte black", "Matte Black"),
    ("black", "Black"),
    ("antique brass", "Antique Brass"),
    ("gold brass", "Gold Brass"),
    ("brass", "Brass"),
    ("gold", "Gold"),
    ("red", "Red"),
    ("green", "Green"),
    ("blue", "Blue"),
    ("white", "White"),
    ("silver", "Silver"),
    ("chrome", "Chrome"),
]


def load(name):
    path = os.path.join(DATA, name)
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def finish_of(p):
    """Canonical finish family for a product, from the Finish spec."""
    raw = (p.get("specifications_map") or {}).get("Finish", "")
    m = re.search(r"(?i)color\s*\(\s*(.*?)\s*\)", raw)
    val = (m.group(1) if m else raw).strip().strip("|").strip()
    low = val.lower()
    for needle, canon in FINISH_MAP:
        if needle in low:
            return canon
    return val or "Unspecified"


def colour_of(p):
    """The colour word itself (as written in the Finish spec)."""
    raw = (p.get("specifications_map") or {}).get("Finish", "")
    m = re.search(r"(?i)color\s*\(\s*(.*?)\s*\)", raw)
    val = (m.group(1) if m else raw).strip().strip("|").strip()
    return re.sub(r"\s+", " ", val) or "Unspecified"


def category_slug(p):
    return (p.get("category_slug") or "uncategorised").replace("-", "-")


def product_line(p, img_prefix="assets/images/products"):
    """A compact markdown block for one product."""
    lines = []
    title = p.get("title") or "(untitled)"
    lines.append(f"### {title}")
    lines.append("")
    meta = []
    if p.get("product_code"):
        meta.append(f"**Code** {p['product_code']}")
    if p.get("category_slug"):
        meta.append(f"**Category** {CATEGORY_LABELS.get(p['category_slug'], p['category_slug'])}")
    meta.append(f"**Finish** {finish_of(p)}")
    if p.get("price"):
        meta.append(f"**Price** {p['price']} *(not published — enquiry model)*")
    lines.append(" · ".join(meta))
    lines.append("")
    lines.append(f"- **Source URL** {BASE}{p['url']}")
    lines.append(f"- **Slug** `{p.get('slug')}`")
    imgs = p.get("images") or []
    if imgs:
        names = ", ".join(f"`assets/images/products/{u.rsplit('/', 1)[-1]}`" for u in imgs)
        lines.append(f"- **Images** ({len(imgs)}) {names}")
    else:
        lines.append("- **Images** *(none published on the source site)*")

    sm = p.get("specifications_map") or {}
    if sm:
        lines.append("- **Specifications**")
        for k, v in sm.items():
            lines.append(f"  - **{k}**: {v or '—'}")
    if p.get("dimensions_map"):
        lines.append("- **Dimensions**")
        for k, v in p["dimensions_map"].items():
            lines.append(f"  - **{k}**: {v}")
    if p.get("canopy_dimensions_parsed"):
        for row in p["canopy_dimensions_parsed"]:
            lines.append(f"- **Canopy** width {row.get('width','—')} · depth {row.get('depth','—')} · height {row.get('height','—')}")
    if p.get("applicable_space"):
        val = "; ".join(a.get("value", "") for a in p["applicable_space"])
        val = re.sub(r"\s*\|\s*", " · ", val).strip(" ·")
        if val:
            lines.append(f"- **Applicable space**: {val}")
    if p.get("description_text"):
        desc = p["description_text"].replace("\n", " ")
        lines.append("")
        lines.append("> " + desc)
    lines.append("")
    return "\n".join(lines)


def main():
    products = load("products.json") or []
    categories = load("categories.json") or []
    site = load("site.json") or {}
    images = load("images.json") or []

    products.sort(key=lambda p: (category_slug(p), p.get("title") or ""))

    # ---------------------------------------------------------------- facets
    by_cat = defaultdict(list)
    for p in products:
        by_cat[category_slug(p)].append(p)

    finish_counts = Counter(finish_of(p) for p in products)
    colour_counts = Counter(colour_of(p) for p in products)
    bulb_counts = Counter((p.get("specifications_map") or {}).get("Bulb Base", "—")
                          for p in products)
    power_counts = Counter((p.get("specifications_map") or {}).get("Power Source", "—")
                            for p in products)
    volts = Counter((p.get("specifications_map") or {}).get("Voltage", "—")
                     for p in products)
    bulbnum = Counter((p.get("specifications_map") or {}).get("Number Of Bulbs", "—")
                       for p in products)
    material_counts = Counter((p.get("specifications_map") or {}).get("Material", "—")
                               for p in products)
    cert_counts = Counter((p.get("specifications_map") or {}).get("Certification", "—")
                           for p in products)
    space_counts = Counter()
    for p in products:
        for a in p.get("applicable_space") or []:
            for tok in re.split(r"[|·]", a.get("value", "")):
                tok = tok.strip()
                if tok and len(tok) < 40 and "etc" not in tok.lower():
                    space_counts[tok] += 1

    # Prefer the normalised facets from the build dataset when it exists, so
    # this document and data/site-data.json can never drift apart.
    build = load("site-data.json")
    if build:
        bf = build.get("facets", {})
        facet_tables = [
            ("Facet 1 — Category", "category", bf.get("category")),
            ("Facet 2 — Finish family", "finish", bf.get("finish")),
            ("Facet 4 — Bulb base", "bulb_base", bf.get("bulb_base")),
            ("Facet 5 — Power source", "power_source", bf.get("power_source")),
            ("Facet 6 — Voltage", "voltage", bf.get("voltage")),
            ("Facet 7 — Number of bulbs", "number_of_bulbs", bf.get("number_of_bulbs")),
            ("Facet 8 — Material", "material", bf.get("material")),
        ]
    else:
        facet_tables = None

    # products that appear ONLY in the parent listing, not in any subcategory
    subcat_listings = {c["category"] for c in categories
                       if c["category"] != "/category/all-lighting"}
    orphans = [p for p in products
               if not any(c in subcat_listings for c in (p.get("listed_in") or []))]

    # ------------------------------------------------------------ 00 README
    with open(os.path.join(DOCS, "README.md"), "w", encoding="utf-8") as fh:
        fh.write(f"""# Beauty Art Lights — Scraped Dataset

Complete extract of **[{site.get('brand', {}).get('name', 'beautyartlights.com')}]({BASE})**,
captured {products and 'from the live site'} with a purpose-built scraper
(`tools/`). Everything here is derived from the source site — no invented content.

## What was captured

| Asset | Count | Where |
|---|---|---|
| Products (SKU detail pages) | **{len(products)}** | `data/products.json`, `docs/03-product-catalogue.md` |
| Category listings | **{len(categories)}** | `data/categories.json`, `docs/02-category-taxonomy.md` |
| Images downloaded | **{sum(1 for i in images if i.get('status') == 'ok')}** | `assets/images/`, `docs/05-image-manifest.md` |
| Static pages (About, Contact, Home) | {len(site.get('pages', {}))} | `data/pages/*.md`, `data/site.json` |
| Product codes | {sum(1 for p in products if p.get('product_code'))} | `Product Code: BT###` |

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
  products.json     {len(products)} products, every scraped field
  categories.json   {len(categories)} category listings with per-page product links
  site.json         nav tree, footer, contact details, static page text
  images.json       {len(images)} image records (url, local path, w/h, bytes, sha1)
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

Raw HTML for all {len(products) + len(categories) + 3} fetched pages is kept under `_scrape/raw/pages/`,
so the parse is reproducible without hitting the network again.
""")

    # ------------------------------------------------------- 01 site overview
    nav = site.get("navigation", [])
    nav_md = "\n".join(
        f"- **{n['label']}** → `{n['path']}`" +
        ("\n" + "\n".join(f"  - {c['label']} → `{c['path']}`" for c in n["children"])
         if n["children"] else "")
        for n in nav)
    contact = site.get("contact", {})
    pages = site.get("pages", {})
    about = pages.get("about-us", {}).get("text", "")

    with open(os.path.join(DOCS, "01-site-overview.md"), "w", encoding="utf-8") as fh:
        fh.write(f"""# 01 — Site Overview

**Source:** {BASE} · **Platform:** custom PHP storefront (Laravel-style Blade
templates, Bootstrap 4 + a bespoke "foxic" commerce theme)

## Brand

| Field | Value |
|---|---|
| Name | {site.get('brand', {}).get('name', 'Beauty Art Lights')} |
| Site title / tagline | {site.get('brand', {}).get('tagline', '')} |
| Copyright | ©{site.get('brand', {}).get('copyright', '')} Beauty Art Lights |
| Positioning | "Beauty Art Lights **Bulk**" — B2B / wholesale decorative lighting |
| Self-description | Manufacturers of lamp lights; indoor + outdoor lamps, lighting and handmade decorations for homes and hotels; customisation offered |

## Contact

| Channel | Value |
|---|---|
| Email | {", ".join(contact.get('emails', [])) or '—'} |
| WhatsApp | {site.get('whatsapp') or '—'} |
| Website | www.beautyartlights.com |
| Contact-page promise | "We typically reply in 24-48 hours" |
| Bulk enquiry | Per-product "Enquiry for bulk" modal + a "For Bulk" nav item |

There is **no published phone number** and **no physical address** anywhere on the site.

## Navigation tree (as shipped)

{nav_md}

> Note: the nav dropdown lists 11 subcategories, but the mega-menu is inconsistent —
> "Wall Clocks" and "Mirror Lights" are listed in the header dropdown and are also
> reachable from the footer, while "Table Tripod Lamps" appears twice. See
> `02-category-taxonomy.md` for the authoritative map.

## Commerce model

- **No prices are published.** Every product renders `price-new` as `$ 0` (and on
  14 products literally `$ -2` — a bug in the source data, not a real price).
- The primary conversion is the **"Enquiry for bulk"** modal: a per-product
  question + email form, plus a `buy_now` POST endpoint.
- Secondary conversion: **WhatsApp** float button ({site.get('whatsapp')}).
- There is a cart/checkout/account shell (`/cart`, `/checkout`, `/login`,
  `/registration`) but no functioning priced cart.

## About Us (verbatim extract)

{about[:3000] if about else '_not captured_'}

## Static pages captured

| Page | URL | Extracted chars |
|---|---|---|
""")
        for slug, p in pages.items():
            fh.write(f"| {slug} | `{p.get('path')}` | {len(p.get('text',''))} |\n")

    # --------------------------------------------------- 02 category taxonomy
    with open(os.path.join(DOCS, "02-category-taxonomy.md"), "w", encoding="utf-8") as fh:
        fh.write("""# 02 — Category Taxonomy

The site exposes 14 category URLs. Item counts are the number the site itself
declares in its `items-count` element; the scraped count is what the paginated
listing actually yielded.

| Category URL | Declared items | Scraped | Notes |
|---|---|---|---|
""")
        for c in categories:
            cat = c["category"]
            slug = cat.rstrip("/").split("/")[-1]
            label = CATEGORY_LABELS.get(slug, slug)
            note = ""
            if c["declared_count"] == 0:
                note = "**empty** — listed in nav but has no products"
            elif c["crawled_count"] != c["declared_count"]:
                note = "count mismatch"
            fh.write(f"| `{cat}`<br>{label} | {c['declared_count']} | {c['crawled_count']} | {note} |\n")

        fh.write(f"""
## Product counts by category (derived from product pages)

""")
        fh.write("| Category | Products | Share |\n|---|---|---|\n")
        for slug, ps in sorted(by_cat.items(), key=lambda kv: -len(kv[1])):
            label = CATEGORY_LABELS.get(slug, slug)
            fh.write(f"| {label} | {len(ps)} | {len(ps)*100//max(1,len(products))}% |\n")
        fh.write(f"| **Total** | **{len(products)}** | 100% |\n")

        fh.write(f"""
## Products orphaned from the taxonomy

{len(orphans)} products are reachable from the parent listing
`/category/all-lighting` but from **no** nav subcategory. Four of them sit
under duplicate, `1`-suffixed category slugs that exist only in their own
product URLs — a data-entry artefact on the live site.

| Id | Code | Category slug in URL | Listed under | Title |
|---|---|---|---|---|
""")
        for p in orphans:
            fh.write(f"| {p['id']} | {p.get('product_code','—')} | `{p.get('category_slug')}` | "
                     f"{', '.join('`'+c+'`' for c in p.get('listed_in') or [])} | "
                     f"{(p.get('title') or '')[:70]} |\n")

        fh.write("""
## Taxonomy observations

1. **The listing total and the taxonomy total do not reconcile.**
   `/category/all-lighting` declares **237** items. The eleven nav subcategories
   cover 231 of them; the six above are the remainder. Any rebuild should
   regenerate the taxonomy from the product records rather than preserving the
   site's hand-made tree.

2. **Duplicate category slugs exist in the source.** `vertical-light1` and
   `horizontal-light1` are literal category slugs on the live site — copies of
   `vertical-lights` and `horizontal-lights` with a `1` appended. Four products
   (352, 353, 525, 526) are filed under them and appear in no nav subcategory.

3. **Singular/plural inconsistency.** `wall-light` (singular) holds 116
   products while the nav label says "Wall Lights"; `table-lamp` (1 product)
   coexists with `table-lamps` (25); `floor-lamp` (1, under
   `all-products-/bedroom-decor`) coexists with `floor-lamps` (27). The
   `all-products-/bedroom-decor` slug also carries a stray trailing hyphen.

4. **Two categories are empty.** `wall-clocks` and `all-products-/bedroom-decor`
   (plus its `floor-lamp` child) return 0 items — yet "Wall Clocks" is in the
   header dropdown and the footer.

5. **The "Categories" index** (`/category/all-lighting/categories`) reports the
   same count as `wall-light` — it behaves as a duplicate of the largest
   subcategory rather than as a true index of all categories.

6. **The grid label is misspelled in the data.** The category tile text reads
   **"Chandilier Light"**, and the misspelling has propagated into the product
   titles themselves. The `grid_title` field in `data/products.json` shows what
   the site actually renders in every listing tile.
""")

    # ------------------------------------------------- 03 full product catalogue
    with open(os.path.join(DOCS, "03-product-catalogue.md"), "w", encoding="utf-8") as fh:
        fh.write(f"""# 03 — Full Product Catalogue

All **{len(products)}** products, complete with images, specifications,
dimensions, applicable space and the source copy. Split by category for
convenience in [`04-products-by-category/`](04-products-by-category/).

| Field | Coverage |
|---|---|
| Title | {sum(1 for p in products if p.get('title'))}/{len(products)} |
| Product code | {sum(1 for p in products if p.get('product_code'))}/{len(products)} |
| Description | {sum(1 for p in products if p.get('description_text'))}/{len(products)} |
| Images | {sum(1 for p in products if p.get('images'))}/{len(products)} (6 per product for 232 of them) |
| Specifications | {sum(1 for p in products if p.get('specifications'))}/{len(products)} |
| Dimensions | {sum(1 for p in products if p.get('dimensions'))}/{len(products)} |

---

""")
        for p in products:
            fh.write(product_line(p) + "\n---\n\n")

    # -------------------------------------------- 04 per-category catalogue
    for slug, ps in by_cat.items():
        label = CATEGORY_LABELS.get(slug, slug)
        fname = re.sub(r"[^a-z0-9-]+", "-", slug.lower()).strip("-") or "uncategorised"
        with open(os.path.join(BYCAT, f"{fname}.md"), "w", encoding="utf-8") as fh:
            fh.write(f"""# {label}

{len(ps)} products · source category `{slug}`

""")
            for p in sorted(ps, key=lambda x: (x.get("title") or "")):
                fh.write(product_line(p) + "\n---\n\n")

    # ---------------------------------------------------- 05 image manifest
    site_imgs = [i for i in images if "/site/" in (i.get("local") or "")]
    other_imgs = [i for i in images if "/other/" in (i.get("local") or "")]
    prod_imgs = [i for i in images if "/products/" in (i.get("local") or "")]
    total_bytes = sum(i.get("bytes") or 0 for i in images if i.get("status") == "ok")

    with open(os.path.join(DOCS, "05-image-manifest.md"), "w", encoding="utf-8") as fh:
        fh.write(f"""# 05 — Image Manifest

Every image referenced by the site, downloaded locally.

| Bucket | Count | Size |
|---|---|---|
| Product photography (`assets/images/products/`) | {len(prod_imgs)} | {sum(i.get('bytes') or 0 for i in prod_imgs)/1048576:.1f} MB |
| Brand & site assets (`assets/images/site/`) | {len(site_imgs)} | {sum(i.get('bytes') or 0 for i in site_imgs)/1048576:.1f} MB |
| Theme chrome (`assets/images/other/`) | {len(other_imgs)} | {sum(i.get('bytes') or 0 for i in other_imgs)/1048576:.1f} MB |
| **Total** | **{sum(1 for i in images if i.get('status')=='ok')}** | **{total_bytes/1048576:.1f} MB** |

Source URLs are unique per file, so the counts above count distinct images, not
references. Machine-readable detail (SHA-1, byte size, pixel dimensions) is in
`data/images.json`.

## Product images

| Local file | Dimensions | Bytes | Used by products |
|---|---|---|---|
""")
        for i in sorted(prod_imgs, key=lambda x: x.get("local") or ""):
            dims = f"{i['width']}×{i['height']}" if i.get("width") else "—"
            used = ", ".join(sorted(set(i.get("used_by_products") or []))) or "—"
            fh.write(f"| `{i['local']}` | {dims} | {i.get('bytes',0):,} | {used} |\n")

        fh.write("\n## Brand & site assets\n\n| Local file | Dimensions | Bytes | Source URL |\n|---|---|---|---|\n")
        for i in sorted(site_imgs + other_imgs, key=lambda x: x.get("local") or ""):
            dims = f"{i['width']}×{i['height']}" if i.get("width") else "—"
            fh.write(f"| `{i['local']}` | {dims} | {i.get('bytes',0):,} | {i['url']} |\n")

    # ------------------------------------------- 06 data quality audit
    no_desc = [p for p in products if not p.get("description_text")]
    no_img = [p for p in products if not p.get("images")]
    no_spec = [p for p in products if not p.get("specifications")]
    no_dims = [p for p in products if not p.get("dimensions")]
    bad_price = [p for p in products if p.get("price") and "-" in p["price"]]
    zero_price = [p for p in products if (p.get("price") or "").replace("$", "").strip() == "0"]
    long_titles = [p for p in products if len(p.get("title") or "") > 120]
    short_titles = [p for p in products if len(p.get("title") or "") < 40]
    descs = [len(p["description_text"]) for p in products if p.get("description_text")]

    with open(os.path.join(DOCS, "06-data-quality-audit.md"), "w", encoding="utf-8") as fh:
        fh.write(f"""# 06 — Data Quality Audit

Problems found **in the source data**, not in the scraper. Each one is a
concrete to-do for the rebuild.

## 1. No prices are published — and 14 products show a negative price

- **{len(zero_price)} of {len(products)}** products render `price-new` as `$ 0`.
- **{len(bad_price)} products render it as `$ -2`** — literally in the HTML
  (`<div class="price-new">$ -2</div>`). A negative price is a data bug.

The site is an enquiry-led wholesale catalogue, so `0` is arguably intentional
as "call for price" — but `-2` is an error, and a rebuild should not reproduce
either. The correct treatment is a **"Request a Quote" / "Enquire for Bulk"**
price state, not a numeric field.

Products with the negative price:

| Id | Code | Title |
|---|---|---|
""")
        for p in bad_price:
            fh.write(f"| {p['id']} | {p.get('product_code','—')} | {(p.get('title') or '')[:90]} |\n")

        fh.write(f"""
## 2. Products with no description ({len(no_desc)})

These have **no description section at all** in the source HTML — a genuine
content gap, not a parse failure. Each needs copy written for the rebuild.

| Id | Code | Category | Title |
|---|---|---|---|
""")
        for p in no_desc:
            fh.write(f"| {p['id']} | {p.get('product_code','—')} | {CATEGORY_LABELS.get(p.get('category_slug'), p.get('category_slug'))} | {(p.get('title') or '')[:90]} |\n")

        fh.write(f"""
## 3. Products with no images ({len(no_img)})

""")
        if no_img:
            fh.write("| Id | Code | Title |\n|---|---|---|\n")
            for p in no_img:
                fh.write(f"| {p['id']} | {p.get('product_code','—')} | {(p.get('title') or '')[:90]} |\n")
        else:
            fh.write("_none_\n")

        fh.write(f"""
## 4. Missing specification / dimension blocks

- **{len(no_spec)} products** have no `SPECIFICATIONS` list.
- **{len(no_dims)} products** have no `DIMENSIONS` list.
- **{sum(1 for p in products if not p.get('canopy_dimensions_parsed'))} products** have no
  `CANOPY DIMENSIONS` — expected, since canopies only apply to ceiling fixtures.

| Id | Code | Missing | Title |
|---|---|---|---|
""")
        for p in products:
            miss = []
            if not p.get("specifications"):
                miss.append("specs")
            if not p.get("dimensions"):
                miss.append("dims")
            if miss:
                fh.write(f"| {p['id']} | {p.get('product_code','—')} | {', '.join(miss)} | {(p.get('title') or '')[:80]} |\n")

        fh.write(f"""
## 5. Copy-quality issues

| Issue | Count | Detail |
|---|---|---|
| Titles over 120 characters | {len(long_titles)} | SEO-unfriendly; the titles are keyword-stuffed keyword strings, e.g. *"Gold Brass 5 Light Wall Sconce, Luxury Modern Wall Lamp with White Shades, Gold Wall Lighting, Elegant Bedroom and Living Room Light Décor."* |
| Titles under 40 characters | {len(short_titles)} | |
| Descriptions longer than 1,200 chars | {sum(1 for d in descs if d > 1200)} | |
| Descriptions shorter than 300 chars | {sum(1 for d in descs if d < 300)} | |
| Average description length | {sum(descs)//max(1,len(descs))} chars | Range {min(descs) if descs else 0}–{max(descs) if descs else 0} |

**Descriptions are pasted from Etsy.** The source markup carries Etsy's own
typography (`ABCDiatype` webfont, `wt-text-body-01` class names) and the
boilerplate *"Works great in…"* / *"Perfect for…"* phrasing. Two problems:

1. **Legal/attribution risk** — the copy belongs to another seller. It should be
   rewritten in-house.
2. **Voice mismatch** — the same paragraph is reused across visually different
   products, so the copy does not actually describe the item being sold.

## 6. Structural / platform issues to fix in the rebuild

- **Spelling in the source data.** "Chandilier Light" (chandelier), "Aluminim"
  (aluminium), and the section heading "DISCRIPTION" are all baked into the
  product records and titles. A rebuild should normalise these — but note that
  the misspelling is currently part of the *title text*, so changing it changes
  the URL and the search footprint.
- **Category slugs are singular/plural inconsistent** — `wall-light` vs
  `wall-lamps`, `table-lamp` vs `table-lamps`, and `all-products-/bedroom-decor`
  carries a stray trailing hyphen. Two categories are *duplicate slugs* that
  exist only inside product URLs — `vertical-light1` and `horizontal-light1`
  (4 products, unreachable from any nav subcategory).
- **Category grid labels are generic.** Every product tile in a listing shows
  the *category name* ("Wall light"), not the product name — so the grid is
  visually uninformative. A rebuild should show the real title.
- **`Certification` is empty for {sum(1 for p in products if not (p.get('specifications_map') or {}).get('Certification'))} products**
  and non-empty for {len(cert_counts) - 1}. The values present are: """ +
          ", ".join(f"`{c}`" for c in cert_counts if c != "—") + ".")
        fh.write(f"""
- **The `Material` spec has stray pipe characters** — e.g. `Steel, Aluminim, Brass |`.
  These are template artefacts and need trimming.
- **The `Applicable Space` field is a run-on string** such as
  `Living Room | Bedroom Coffee Shop | Nursery Decorative Baby Room | Kitchen & dining | Office | Entryway | etc...`
  — the pipes are inconsistent and the wording is ungrammatical. It should
  become a proper multi-select facet.
- **No physical address, no phone number, no social links, no company
  registration details** anywhere on the site. For a B2B wholesale buyer doing
  due diligence this is a trust gap, and it is also a Google Business /
  Local-SEO gap.
- **The site has no `sitemap.xml`, no `robots.txt` restrictions, and no Open
  Graph / Twitter Card tags.** For an SEO rebuild this is the first thing to fix.
""")

    # ------------------------------------------------- 07 brand assets
    logo = next((i for i in site_imgs if "settings" in (i.get("url") or "")), None)
    banners = [i for i in site_imgs if "/banner/" in (i.get("url") or "")]
    promos = [i for i in site_imgs if "/image/" in (i.get("url") or "")]
    with open(os.path.join(DOCS, "07-brand-assets.md"), "w", encoding="utf-8") as fh:
        fh.write(f"""# 07 — Brand Assets

## Logo

| | |
|---|---|
| File | `{logo['local'] if logo else '—'}` |
| Source URL | {logo['url'] if logo else '—'} |
| Dimensions | {f"{logo['width']}×{logo['height']}" if logo and logo.get('width') else '—'} |
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
""")
        for i in banners:
            fh.write(f"| `{i['local']}` | {i.get('width')}×{i.get('height')} | {i['url']} |\n")
        fh.write("\n## Category / promotional imagery\n\n| Local file | Dimensions | Source URL |\n|---|---|---|\n")
        for i in promos:
            fh.write(f"| `{i['local']}` | {i.get('width')}×{i.get('height')} | {i['url']} |\n")

        fh.write(f"""
## Typography

The site loads these Google Fonts:

""")
        for f in site.get("fonts", []):
            fh.write(f"- `{f.replace('&amp;', '&')}`\n")
        fh.write("""
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
""")
        for i in site_imgs + other_imgs:
            if "front/images" in (i.get("url") or ""):
                fh.write(f"| `{i['local']}` | {i['url']} |\n")

    # -------------------------------------------- 08 content / facet analysis
    with open(os.path.join(DOCS, "08-content-analysis.md"), "w", encoding="utf-8") as fh:
        fh.write(f"""# 08 — Content & Facet Analysis

Derived from the {len(products)} scraped product records. This is the raw
material for the catalogue's **filter facets** and for the new site's
information architecture.

""")
        if facet_tables:
            for heading, _key, rows in facet_tables:
                if not rows:
                    continue
                fh.write(f"## {heading}\n\n| Value | Products |\n|---|---|\n")
                for r in rows:
                    label = r["value"]
                    if label in CATEGORY_LABELS:
                        label = CATEGORY_LABELS[label]
                    fh.write(f"| {label} | {r['count']} |\n")
                fh.write("\n")
            ex = (build.get("facets") or {}).get("_excluded") or {}
            if ex:
                fh.write("## Fields deliberately NOT offered as filters\n\n"
                         "| Field | Why it is excluded |\n|---|---|\n")
                for k, v in ex.items():
                    fh.write(f"| `{k}` | {v} |\n")
                fh.write("\n")
        else:
            fh.write("""## Facet 1 — Category

| Value | Products |
|---|---|
""")
            for slug, ps in sorted(by_cat.items(), key=lambda kv: -len(kv[1])):
                fh.write(f"| {CATEGORY_LABELS.get(slug, slug)} | {len(ps)} |\n")

            fh.write("\n## Facet 2 — Finish family\n\n| Value | Products |\n|---|---|\n")
            for k, v in finish_counts.most_common():
                fh.write(f"| {k} | {v} |\n")

            fh.write("\n## Facet 3 — Colour exactly as written in the spec\n\n| Value | Products |\n|---|---|\n")
            for k, v in colour_counts.most_common(30):
                fh.write(f"| {k} | {v} |\n")

            fh.write("\n## Facet 4 — Bulb base\n\n| Value | Products |\n|---|---|\n")
            for k, v in bulb_counts.most_common():
                fh.write(f"| {k} | {v} |\n")

            fh.write("\n## Facet 5 — Power source\n\n| Value | Products |\n|---|---|\n")
            for k, v in power_counts.most_common():
                fh.write(f"| {k} | {v} |\n")

            fh.write("\n## Facet 6 — Voltage\n\n| Value | Products |\n|---|---|\n")
            for k, v in volts.most_common():
                fh.write(f"| {k} | {v} |\n")

            fh.write("\n## Facet 7 — Number of bulbs\n\n| Value | Products |\n|---|---|\n")
            for k, v in sorted(bulbnum.items(), key=lambda kv: (kv[0] == "—", kv[0])):
                fh.write(f"| {k} | {v} |\n")

            fh.write("\n## Facet 8 — Material\n\n| Value | Products |\n|---|---|\n")
            for k, v in material_counts.most_common(20):
                fh.write(f"| {k} | {v} |\n")

            fh.write("\n## Facet 9 — Certification (as recorded)\n\n| Value | Products |\n|---|---|\n")
            for k, v in cert_counts.most_common():
                fh.write(f"| {k or '_(empty)_'} | {v} |\n")

            fh.write("\n## Facet 10 — Applicable space (tokenised from the run-on string)\n\n"
                     "| Value | Products |\n|---|---|\n")
            for k, v in space_counts.most_common(25):
                fh.write(f"| {k} | {v} |\n")

        fh.write(f"""
## Title analysis

| Metric | Value |
|---|---|
| Longest title | {max(len(p.get('title') or '') for p in products)} chars |
| Shortest title | {min(len(p.get('title') or '') for p in products)} chars |
| Average title | {sum(len(p.get('title') or '') for p in products)//len(products)} chars |
| Titles over 120 chars | {len(long_titles)} |
| Titles containing a comma-separated keyword stack | {sum(1 for p in products if (p.get('title') or '').count(',') >= 2)} |

The titles are **Amazon/Etsy-style keyword stacks** rather than product names:

> "Gold Brass 5 Light Wall Sconce, Luxury Modern Wall Lamp with White Shades, Gold Wall Lighting, Elegant Bedroom and Living Room Light Décor."

That is workable for marketplace search but poor for a brand site: it repeats the
product type, buries the distinguishing attributes, and reads as spam. A rebuild
should keep a short **product name** ("5-Light Gold Brass Wall Sconce") and move
the keyword tail into a **subtitle / meta description**.

## Description analysis

| Metric | Value |
|---|---|
| Products with a description | {sum(1 for p in products if p.get('description_text'))} / {len(products)} |
| Average length | {sum(descs)//max(1,len(descs))} chars |
| Median-ish (min / max) | {min(descs) if descs else 0} / {max(descs) if descs else 0} chars |

Common opening patterns (for a copywriter brief):

""")
        openers = Counter()
        for p in products:
            t = p.get("description_text") or ""
            if t:
                openers[" ".join(t.split()[:3])] += 1
        for k, v in openers.most_common(12):
            fh.write(f"- `{k}…` — {v} products\n")

    # ------------------------------------------- 10 build brief (handoff)
    bprods = (build or {}).get("products", [])
    if bprods:
        name_counts = Counter(p["name"] for p in bprods)
        collide = sum(1 for p in bprods if name_counts[p["name"]] > 1)
        with open(os.path.join(DOCS, "10-build-brief.md"), "w", encoding="utf-8") as fh:
            fh.write(f"""# 10 — Build Brief (what the data says the new site needs)

A hand-off document: what the scraped data requires of the rebuild, before
any design or stack decisions are made.

## 1. The catalogue is a design × colourway matrix

This is the single most important structural fact, and it is not visible on
the current site.

- **{len(build.get('variant_groups', []))} variant families** cover
  {sum(len(g['product_ids']) for g in build.get('variant_groups', []))} of the
  {len(products)} SKUs.
- A family is one fixture design offered in 2–3 finishes (matte black /
  antique brass / red / green / gold brass). Verified visually: products 399
  and 400 are the *same* dome pendant, differing only in finish.

**Consequence.** The catalogue should be modelled as **designs, not SKUs**:

```
Design  (e.g. "Dome Pendant")
  ├── SKU BT095  · Matte Black   · £/MOQ on request
  ├── SKU BT096  · Antique Brass
  └── SKU BT097  · Red
```

Each SKU keeps its own code, stock and images. The design gets one page with
a finish selector. That fixes keyword cannibalisation between colourway pages
and gives the buyer what they actually ask for — *"do you have this in matte
black?"*

## 2. Prices must be a state, not a number

The source publishes `$ 0` on 223 products and `$ -2` on 14. The business is
enquiry-led. So the price field should be:

```json
{{ "published": false, "display": "Enquire for bulk" }}
```

with a CTA, not a numeric value. This is already how `data/site-data.json`
represents it.

## 3. Titles: keep two versions

| Field | Purpose |
|---|---|
| `title` | The original marketplace keyword stack — use for meta keywords and long-tail search coverage |
| `name` | A clean human name — use for the H1, the card, the alt text |

`name` is derived mechanically from the facts that distinguish the product:
light count + shape + finish + fixture type.

| | |
|---|---|
| Source title | *"Matte Black 5 Light Wall Sconce, Luxury Modern Wall Lamp with White Shades, Gold Wall Lighting, Elegant Bedroom and Living Room Light Décor."* |
| Derived name | **5-Light Matte Black Wall Sconce** |

**{collide} of {len(bprods)} derived names are shared by more than one SKU**
(e.g. *"3-Light Red Wall Sconce"*). The SKU code is therefore part of the
product's identity and must be visible on the card — in wholesale trade it is
how a buyer quotes the item. `display_name` in `data/site-data.json` appends
the code exactly where it is needed.

## 4. Facets: what will work and what will not

| Axis | Usable? | Detail |
|---|---|---|
| Category | ✅ | 13 real categories |
| Finish / colour | ✅ | 16 normalised values; **Matte Black 68, Red 53, Gold Brass 32, Antique Brass 32** cover 78% of the catalogue |
| Bulb base | ✅ | E14 (199), E27 (35) — a genuine two-way split |
| Number of bulbs | ✅ | 1, 2, 3, 4, 5, 8… |
| Power source | ✅ | Hardwired (165), Plug-in (69) |
| Material | ✅ | 6 values, one dominant |
| Voltage | ❌ | A single value (110-240V) everywhere — constant, not a filter |
| Certification | ❌ | **Blank on all 229 products that carry the row**; 8 have no row. There is no certification data on the site at all |
| Applicable space | ❌ | The **identical boilerplate string on all 237 products** — it carries no product-specific signal, and on one product the description text leaks into the field |

The last two matter: certification and applicable space look like the obvious
"trust" facets a B2B catalogue should show, but the source has no real data
behind either. They have to be **collected**, not scraped. Until then, showing
them as filters would be theatre.

## 5. Fields the source does not have, and a B2B buyer will want

Absent from every one of the 237 records:

- **Certification / compliance marks** (BIS/ISI, CE, UL, RoHS) — nothing at all
- **Wattage / LED lumens / CRI / colour temperature** — the catalogue has bulb
  *count* and *base* but no photometric data
- **IP rating** (outdoor rating) — nothing, despite outdoor lamps being offered
- **MOQ, carton dimensions, gross weight, units per carton, lead time**
- **Country of origin, HS code, manufacturer address**
- **Any price, including a price band**

These are the fields that make a wholesale catalogue useful and trustworthy.
They are a data-collection task, not a scraping task.

## 6. Copy that must be rewritten

- The descriptions are **pasted from Etsy** — the markup carries Etsy's
  `ABCDiatype` webfont and `wt-text-body-01` class names, and the phrasing is
  marketplace boilerplate ("Works great in…", "Perfect for…").
- The same paragraph is reused across visually different products, so the copy
  often does not describe the item.
- **{len(no_desc)} products have no description at all.**
- Titles contain the misspelling **"Chandilier"** and the spec sheet contains
  **"Aluminim"**.

All of it needs in-house rewrite. The scraped text is kept in
`data/products.json` as the reference, not as publishable copy.

## 7. Images

| | |
|---|---|
| Count | 1,412 product images, 125.6 MB |
| Resolution | 1600 × 1621 (near-square) on a neutral studio backdrop |
| Format | 1,205 PNG + 206 JPG + 1 WebP |
| Quality | High and consistent — this is the site's strongest asset |

Two things to fix in the pipeline:

1. **Dead space.** Each frame has a lot of empty backdrop above and below the
   fixture. In a tight grid the product reads as small and distant. Crop to the
   subject; keep the full frame for the lightbox.
2. **Format.** PNG at 1,600 px is far heavier than it needs to be. WebP or AVIF
   would cut the ~126 MB by roughly 70–80% with no visible loss.

## 8. Trust signals that are missing outright

- **No physical address** anywhere on the site
- **No phone number** (only a WhatsApp float)
- **No company registration details, no social links, no privacy policy,
  no terms**
- **No `sitemap.xml`**, no Open Graph / Twitter Card tags
- `robots.txt` exists but is a one-line file with no rules

For a wholesale buyer doing due diligence this is the biggest gap after the
product data itself.

## 9. The build-ready dataset

`data/site-data.json` (1.4 MB) is the hand-off:

```json
{{
  "meta":        {{ "product_count": 237, "price_model": "enquiry" }},
  "site":        {{ "name", "logo", "email", "whatsapp", "navigation" }},
  "categories":  [ {{ "slug", "label", "product_count", "product_ids", "in_main_nav" }} ],
  "variant_groups": [ {{ "id", "label", "finishes", "product_ids" }} ],
  "facets":      {{ "category": [...], "finish": [...], ... }},
  "products":    [ {{ "id", "code", "slug", "title", "name", "display_name",
                      "category", "price", "finish", "specs", "dimensions",
                      "applicable_space", "description",
                      "images": [{{ "url", "local", "width", "height" }}],
                      "variant_group", "related_urls" }} ]
}}
```

Every image carries a **local path** so the build never needs to hotlink the
source site. Stack-agnostic — usable from Astro, Next.js, Eleventy or
SvelteKit unchanged.
""")

    # ------------------------------------------------------------ products.csv
    cols = ["id", "product_code", "title", "category", "category_slug", "finish",
            "colour", "bulb_base", "bulb_count", "power_source", "voltage",
            "material", "shade_included", "bulb_included", "assembly_required",
            "certification", "width", "depth", "height", "applicable_space",
            "image_count", "primary_image", "price", "url", "description"]
    with open(os.path.join(DATA, "products.csv"), "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=cols)
        w.writeheader()
        for p in products:
            sm = p.get("specifications_map") or {}
            dm = p.get("dimensions_map") or {}
            space = "; ".join(a.get("value", "") for a in p.get("applicable_space") or [])
            w.writerow({
                "id": p.get("id"),
                "product_code": p.get("product_code"),
                "title": p.get("title"),
                "category": CATEGORY_LABELS.get(p.get("category_slug"), p.get("category_slug")),
                "category_slug": p.get("category_slug"),
                "finish": finish_of(p),
                "colour": colour_of(p),
                "bulb_base": sm.get("Bulb Base", ""),
                "bulb_count": sm.get("Number Of Bulbs", ""),
                "power_source": sm.get("Power Source", ""),
                "voltage": sm.get("Voltage", ""),
                "material": sm.get("Material", ""),
                "shade_included": sm.get("Shade Included", ""),
                "bulb_included": sm.get("Bulb Included", ""),
                "assembly_required": sm.get("Assembly Required", ""),
                "certification": sm.get("Certification", ""),
                "width": dm.get("Product Width", ""),
                "depth": dm.get("Product Depth", ""),
                "height": dm.get("Product Height", ""),
                "applicable_space": space,
                "image_count": len(p.get("images") or []),
                "primary_image": (p.get("images") or [""])[0],
                "price": p.get("price"),
                "url": BASE + p.get("url", ""),
                "description": (p.get("description_text") or "").replace("\n", " "),
            })

    print("Generated:")
    for root, _dirs, files in os.walk(DOCS):  # noqa: F841
        for f in sorted(files):
            p = os.path.join(root, f)
            print(f"  {os.path.relpath(p, ROOT):60s} {os.path.getsize(p):>9,} b")
    print(f"  {'data/products.csv':60s} {os.path.getsize(os.path.join(DATA,'products.csv')):>9,} b")


if __name__ == "__main__":
    main()
