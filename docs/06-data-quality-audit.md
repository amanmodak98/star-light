# 06 — Data Quality Audit

Problems found **in the source data**, not in the scraper. Each one is a
concrete to-do for the rebuild.

## 1. No prices are published — and 14 products show a negative price

- **223 of 237** products render `price-new` as `$ 0`.
- **14 products render it as `$ -2`** — literally in the HTML
  (`<div class="price-new">$ -2</div>`). A negative price is a data bug.

The site is an enquiry-led wholesale catalogue, so `0` is arguably intentional
as "call for price" — but `-2` is an error, and a rebuild should not reproduce
either. The correct treatment is a **"Request a Quote" / "Enquire for Bulk"**
price state, not a numeric field.

Products with the negative price:

| Id | Code | Title |
|---|---|---|
| 487 | BT182 | 3 Light Antique Brass Wall Sconce, Modern Sculptural Wall Lamp, Elegant Vertical Lighting  |
| 383 | BT082 | 3 Light Green Wall Sconce, Sculptural Wall Lamp, Modern Bedroom Lighting, White Shade Scon |
| 384 | BT083 | 3 Light Matte Black Wall Sconce, Sculptural Wall Lamp, Modern Bedroom Lighting, White Shad |
| 394 | BT090 | 4 Light Gold Brass Wall Sconce with White Fabric Shades | Elegant Vintage Wall Lamp for Li |
| 349 | BT050 | Antique Brass 3 Light Wall Sconce, Modern Wall Lamp, Brass Vanity Light, Bedroom Lighting, |
| 356 | BT057 | Antique Brass Wall Sconce, 5 Light Wall Lamp, Sculptural Wall Light, Modern Statement Scon |
| 355 | BT056 | Green Spiral Wall Sconce, Luxury Inspired Lighting, Curved Wall Lamp, White Fabric Shades  |
| 385 | BT084 | Green Wall Light, Contemporary Green Spiral Light, Three Light Wall Sconce, Creative Moder |
| 350 | BT051 | Matte Black 3 Light Wall Sconce, a Modern Vertical Wall Lamp with White Shades, Contempora |
| 386 | BT085 | Matte Black 4 Light Wall Sconce, Modern Wall Lamp, Contemporary Bedroom Lighting, Curved W |
| 354 | BT055 | Matte Black Spiral Wall Sconce, Mid century Modern Lighting Fixture, White Fabric Shades C |
| 357 | BT058 | Matte Black Twisted 5-Light Wall Sconce, Vertical Wall Light, White Fabric Shades, Vertica |
| 521 | BT216 | Red Wall Sconce Light, 3 Light Vertical Wall Lamp with White Fabric Shades, Modern Sculptu |
| 351 | BT052 | Red Wall Sconce, 3 Light Wall Lamp, Sculptural Wall Light, Modern Art Deco Sconce, White S |

## 2. Products with no description (5)

These have **no description section at all** in the source HTML — a genuine
content gap, not a parse failure. Each needs copy written for the rebuild.

| Id | Code | Category | Title |
|---|---|---|---|
| 389 | BT087 | Chandelier Lights | Antique Brass 6-Light Chandelier, Antique brass Chandelier, Elegant Designer Contemporary  |
| 388 | BT086 | Chandelier Lights | Matte Black 6-Light Chandelier, Modern Matte Black Chandelier, Luxury Minimal Ceiling Fixt |
| 393 | BT089 | Chandelier Lights | Matte Red Chandelier with White Fabric Shades, Modern Vintage Ceiling Light for Dining Roo |
| 499 | BT194 | Wall Lights | 8 Light Wall Sconce, Black Wall Lamp, Large Statement Sconce, White Fabric Shades, Modern  |
| 511 | BT206 | Wall Lights | Modern Black Wall Sconce, Layered Cone Shade Wall Light, Minimalist Metal Wall Lamp, Conte |

## 3. Products with no images (1)

| Id | Code | Title |
|---|---|---|
| 536 | BT231 | Modern Brass Double Light, Minimalist Gold Wall Lamp, Mid Century Lighting Fixture for Bed |

## 4. Missing specification / dimension blocks

- **3 products** have no `SPECIFICATIONS` list.
- **3 products** have no `DIMENSIONS` list.
- **151 products** have no
  `CANOPY DIMENSIONS` — expected, since canopies only apply to ceiling fixtures.

| Id | Code | Missing | Title |
|---|---|---|---|
| 508 | BT203 | specs | Modern Matte Black Floor Lamp, 3 Light Tree Floor Lighting, Mesh Metal Shades, B |
| 502 | BT197 | specs | Red 3 Light Metal Mesh Floor Lamp, Decorative Leaf Details, Artistic Modern Stat |
| 505 | BT200 | dims | Tripod Makeup Mirror Lights, Hollywood Vanity Mirror, Vintage Wooden Dressing Ta |
| 509 | BT204 | dims | Wooden Vanity Mirror with Lights, Hollywood Makeup Mirror, Natural Wood Dressing |
| 422 | BT118 | dims | Tripod Floor Lamp, Vintage Wooden Tripod Lamp, Brass Industrial Floor Light, Rus |
| 465 | BT161 | specs | Antique Brass Wall Lamp, Modern Wall Sconce, Cone Shade Wall Light, Vintage Bras |

## 5. Copy-quality issues

| Issue | Count | Detail |
|---|---|---|
| Titles over 120 characters | 236 | SEO-unfriendly; the titles are keyword-stuffed keyword strings, e.g. *"Gold Brass 5 Light Wall Sconce, Luxury Modern Wall Lamp with White Shades, Gold Wall Lighting, Elegant Bedroom and Living Room Light Décor."* |
| Titles under 40 characters | 0 | |
| Descriptions longer than 1,200 chars | 8 | |
| Descriptions shorter than 300 chars | 0 | |
| Average description length | 802 chars | Range 367–1329 |

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
- **`Certification` is empty for 237 products**
  and non-empty for 1. The values present are: ``.
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
