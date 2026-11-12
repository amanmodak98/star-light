# 02 — Category Taxonomy

The site exposes 14 category URLs. Item counts are the number the site itself
declares in its `items-count` element; the scraped count is what the paginated
listing actually yielded.

| Category URL | Declared items | Scraped | Notes |
|---|---|---|---|
| `/category/all-lighting`<br>all-lighting | 237 | 237 |  |
| `/category/all-lighting/categories/chandelier-lights`<br>Chandelier Lights | 17 | 17 |  |
| `/category/all-lighting/categories/floor-lamps`<br>Floor Lamps | 27 | 27 |  |
| `/category/all-lighting/categories/hanging-lights`<br>Hanging / Pendant Lights | 15 | 15 |  |
| `/category/all-lighting/categories/horizontal-lights`<br>Horizontal Wall Lights | 10 | 10 |  |
| `/category/all-lighting/categories/mirror-lights`<br>Mirror Lights | 2 | 2 |  |
| `/category/all-lighting/categories/table-lamps`<br>Table Lamps | 25 | 25 |  |
| `/category/all-lighting/categories/table-tripod-lamps`<br>Table Tripod Lamps | 3 | 3 |  |
| `/category/all-lighting/categories/tripod-floor-lamps`<br>Tripod Floor Lamps | 2 | 2 |  |
| `/category/all-lighting/categories/vertical-lights`<br>Vertical Wall Lights | 14 | 14 |  |
| `/category/all-lighting/categories/wall-clocks`<br>Wall Clocks | 0 | 0 | **empty** — listed in nav but has no products |
| `/category/all-lighting/categories/wall-light`<br>Wall Lights | 116 | 116 |  |
| `/category/all-products-/bedroom-decor`<br>Bedroom Decor | 0 | 0 | **empty** — listed in nav but has no products |
| `/category/all-products-/bedroom-decor/floor-lamp`<br>Floor Lamp (singular slug) | 0 | 0 | **empty** — listed in nav but has no products |

## Product counts by category (derived from product pages)

| Category | Products | Share |
|---|---|---|
| Wall Lights | 116 | 48% |
| Floor Lamps | 27 | 11% |
| Table Lamps | 25 | 10% |
| Chandelier Lights | 17 | 7% |
| Hanging / Pendant Lights | 15 | 6% |
| Vertical Wall Lights | 14 | 5% |
| Horizontal Wall Lights | 10 | 4% |
| Table Tripod Lamps | 3 | 1% |
| Horizontal Wall Lights *(duplicate slug)* | 2 | 0% |
| Mirror Lights | 2 | 0% |
| Tripod Floor Lamps | 2 | 0% |
| Vertical Wall Lights *(duplicate slug)* | 2 | 0% |
| Floor Lamp (singular slug) | 1 | 0% |
| Table Lamps *(singular slug)* | 1 | 0% |
| **Total** | **237** | 100% |

## Products orphaned from the taxonomy

6 products are reachable from the parent listing
`/category/all-lighting` but from **no** nav subcategory. Four of them sit
under duplicate, `1`-suffixed category slugs that exist only in their own
product URLs — a data-entry artefact on the live site.

| Id | Code | Category slug in URL | Listed under | Title |
|---|---|---|---|---|
| 508 | BT203 | `floor-lamp` | `/category/all-lighting` | Modern Matte Black Floor Lamp, 3 Light Tree Floor Lighting, Mesh Metal |
| 526 | BT221 | `horizontal-light1` | `/category/all-lighting` | Green Wall Sconce, 3 Light Wall Lamp, Modern Wall Light, Sculptural Sc |
| 525 | BT220 | `horizontal-light1` | `/category/all-lighting` | Matte Black Wall Sconce, Brass Finish Wall Lamp, Long Vanity Wall Ligh |
| 507 | BT202 | `table-lamp` | `/category/all-lighting` | Modern Matte Black Table Lamp, Sculptural Cone Base Light, Pleated Met |
| 352 | BT053 | `vertical-light1` | `/category/all-lighting` | Antique Brass Wall Sconce Elegant Antique brass Twisted Triple Lamp Wa |
| 353 | BT054 | `vertical-light1` | `/category/all-lighting` | Antique Brass Wall Sconce, 4 Light Modern Wall Lamp, Vertical Bedroom  |

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
