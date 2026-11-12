# 10 — Build Brief (what the data says the new site needs)

A hand-off document: what the scraped data requires of the rebuild, before
any design or stack decisions are made.

## 1. The catalogue is a design × colourway matrix

This is the single most important structural fact, and it is not visible on
the current site.

- **23 variant families** cover
  53 of the
  237 SKUs.
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
{ "published": false, "display": "Enquire for bulk" }
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

**153 of 237 derived names are shared by more than one SKU**
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
- **5 products have no description at all.**
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
{
  "meta":        { "product_count": 237, "price_model": "enquiry" },
  "site":        { "name", "logo", "email", "whatsapp", "navigation" },
  "categories":  [ { "slug", "label", "product_count", "product_ids", "in_main_nav" } ],
  "variant_groups": [ { "id", "label", "finishes", "product_ids" } ],
  "facets":      { "category": [...], "finish": [...], ... },
  "products":    [ { "id", "code", "slug", "title", "name", "display_name",
                      "category", "price", "finish", "specs", "dimensions",
                      "applicable_space", "description",
                      "images": [{ "url", "local", "width", "height" }],
                      "variant_group", "related_urls" } ]
}
```

Every image carries a **local path** so the build never needs to hotlink the
source site. Stack-agnostic — usable from Astro, Next.js, Eleventy or
SvelteKit unchanged.
