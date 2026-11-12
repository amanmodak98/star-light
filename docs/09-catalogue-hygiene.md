# 09 — Catalogue Hygiene: Variants, Re-listings & Code Gaps

The catalogue is **not** full of duplicates. It is full of **one fixture
design listed once per colourway** — which is how lighting manufacturers
actually sell. What matters for the rebuild is telling those two situations
apart, because they need opposite treatment.

| Finding | Count | Treatment |
|---|---|---|
| Products in a variant family | **53** of 237 | One page + a finish selector |
| Distinct variant families | **23** | — |
| Genuine re-listings (same design, same finish) | **1** | Merge; 301 the loser |
| Records with byte-identical titles | 0 | — |
| Records sharing the same hero photo | 0 | — |

## 1. Product code sequence

| Property | Value |
|---|---|
| Codes in use | **237** |
| Range | `BT001` – `BT241` (241 possible) |
| Gaps | **4** — BT210, BT217, BT218, BT232 |

The range implies **4 deleted or
never-published SKUs**. Nothing in the live catalogue references them. A
rebuild should issue forward from `BT242` and leave the gaps
closed.

## 2. Variant families — the same design in different finishes

These are **not** errors. They are the catalogue's product line, expressed as
one page per colour. The rebuild should collapse each family into a single
canonical product with a finish selector, which fixes three problems at once:
keyword cannibalisation between colourway pages, a filter that actually has
meaning, and a catalogue that reads like a range rather than a pile.

### Family 1 — 3 SKUs, 3 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 330 | BT034 | **Red** | `horizontal-lights` | Red 2 Light Wall Sconce, Colorful Wall Lamp, Modern Bedroom Lighting, White Shade Sconce, Living Room Light, Hallway & Entryway Decor Design red |
| 332 | BT035 | **Matte Black** | `horizontal-lights` | Matte Black 2 Light Wall Sconce, Double Wall Lamp, Metal Sconce with White Fabric Shades, Modern Wall Lighting, Bedroom Sconce, Dining Room black |
| 333 | BT036 | **Green** | `horizontal-lights` | Green 2 Light Wall Sconce, Modern Wall Lamp, Sculptural Sconce, Curved Arm Lighting, White Fabric Shades, Living Room Bedroom Hallway Décor Green |

**Evidence:**

- 330 ↔ 332: copy similarity 47%
- 330 ↔ 333: copy similarity 51%
- 332 ↔ 333: copy similarity 47%

### Family 2 — 3 SKUs, 3 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 399 | BT095 | **Matte Black** | `hanging-lights` | Matte Black Hanging Light, Industrial Pendant Lamp, Modern Ceiling Light, Vintage Kitchen Lighting, Black Pendant Fixture Modern Ceiling. |
| 400 | BT096 | **Antique Brass** | `hanging-lights` | Antique Brass Hanging Light, Vintage Pendant Lamp, Brass Ceiling Light, Industrial Kitchen Lighting Modern Dining Room Elegant Ceiling decor |
| 401 | BT097 | **Red** | `hanging-lights` | Red Hanging Light, Red Pendant Lamp, Vintage Ceiling Light, Industrial Pendant Fixture, Modern Kitchen Dining Room Home Lighting Decoration. |

**Evidence:**

- 399 ↔ 400: copy similarity 46% · title similarity 58%
- 399 ↔ 401: copy similarity 46% · title similarity 64%
- 400 ↔ 401: copy similarity 48% · title similarity 73%

### Family 3 — 3 SKUs, 3 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 402 | BT098 | **Red** | `hanging-lights` | Red Pendant Light, Red Hanging Lamp, Industrial Light, Vintage Lighting, Modern Ceiling Lamp for Café, Dining Room and Creative Interiors. |
| 403 | BT099 | **Antique Brass** | `hanging-lights` | Antique Brass Pendant Light, Brass Hanging Lamp, Vintage Ceiling Light, Industrial Kitchen Lighting, Modern Dining Room Fixture & Home Decor |
| 404 | BT100 | **Matte Black** | `hanging-lights` | Matte Black Pendant Light, Black Hanging Lamp, Industrial Ceiling Light, Vintage Kitchen Lighting, Modern Dining Room Fixture Design Lights. |

**Evidence:**

- 402 ↔ 403: copy similarity 61% · title similarity 58%
- 402 ↔ 404: copy similarity 59% · title similarity 54%
- 403 ↔ 404: copy similarity 63% · title similarity 62%

### Family 4 — 3 SKUs, 3 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 405 | BT101 | **Matte Black** | `hanging-lights` | Matte Black Teapot Pendant Light, Black Hanging Lamp, Vintage Kitchen Lighting, Industrial Ceiling Light, Unique Tea Kettle Home Fixture. |
| 406 | BT102 | **Red** | `hanging-lights` | Red Teapot Pendant Light, Red Hanging Lamp, Vintage Kitchen Lighting, Industrial Ceiling Light, Unique Tea Kettle Pendant Modern Fixture. |
| 407 | BT103 | **Antique Brass** | `hanging-lights` | Antique Brass Teapot Pendant Light, Brass Hanging Lamp, Vintage Kitchen Lighting, Industrial Ceiling Light, Unique Tea Kettle Kitchen Island |

**Evidence:**

- 405 ↔ 406: copy similarity 74% · title similarity 83%
- 405 ↔ 407: copy similarity 68% · title similarity 67%
- 406 ↔ 407: copy similarity 81% · title similarity 77%

### Family 5 — 3 SKUs, 3 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 445 | BT141 | **Matte Black** | `floor-lamps` | Black Floor Lamp with 3 White Fabric Shades, Modern Matte Black Standing Light, Contemporary Tripod Style Floor Lighting Fixture for Living Room |
| 446 | BT142 | **Red** | `floor-lamps` | Red Floor Lamp, 3 White Fabric Shades, Matte Red Modern Standing Light, Contemporary Fixture for Living Room, Bedroom and Reading Corner.Red Floor Lamp, 3 White Fabric Shades, Matte Red Modern Standing Light, Contemporary Fixture for Living Room, Bedroom |
| 447 | BT143 | **Antique Brass** | `floor-lamps` | Floor Lamp in Antique Brass Color Triple Head Lamp with White Fabric Shades Foot Switch and Corded Plug Lighting for Living Room Bedroom |

**Evidence:**

- 445 ↔ 446: copy similarity 47% · title similarity 58%
- 445 ↔ 447: copy similarity 47%

### Family 6 — 3 SKUs, 3 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 448 | BT144 | **Red** | `table-lamps` | Red Mouse Table Lamp, Unique Animal Figurine Lighting, Glowing Globe Bulb, Creative Decorative Lamp for Bedroom, Living Room, Kids Room. Red |
| 449 | BT145 | **Black** | `table-lamps` | Matte Black Mouse Table Lamp, Unique Animal Figurine Lighting, Light with Glowing Globe Bulb, Modern Decorative Lamp Bedroom, Living Room. Black |
| 450 | BT146 | **Gold** | `table-lamps` | Gold Brass Mouse Table Lamp, Unique Animal Light, Artistic Decorative Table Light Globe Bulb, Luxury Accent Lamp for Bedroom, Living RoomGold Brass Mouse Table Lamp, Unique Animal Light, Artistic Decorative Table Light Globe Bulb, Luxury Accent Lamp for B Golden |

**Evidence:**

- 448 ↔ 449: copy similarity 49% · title similarity 71%
- 448 ↔ 450: copy similarity 51%
- 449 ↔ 450: copy similarity 48%

### Family 7 — 3 SKUs, 3 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 481 | BT177 | **Red** | `floor-lamps` | Modern Red 3 Light Floor Lamp, White Fabric Shades, Contemporary Standing Floor Light, Designer Metal Floor Lamp for Living Room, Bedroom. |
| 482 | BT178 | **Green** | `floor-lamps` | Green 3 Light Floor Lamp, Modern Brass-Free Standing Lighting, Floor Lighting for Living Room, Bedroom, Reading Corner and Luxury Home Décor Green |
| 484 | BT179 | **Matte Black** | `floor-lamps` | Matte Black 3 Light Floor Lamp, Modern Metal Standing Floor Light for Living Room, Elegant Designer Lamp Bedroom, Reading Corner Home Decor |

**Evidence:**

- 481 ↔ 482: copy similarity 49%
- 482 ↔ 484: copy similarity 60%

### Family 8 — 2 SKUs, 2 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 321 | BT025 | **Black** | `wall-light` | Matte Black Wall Sconce, Modern Wall Lamp, Matte Black Wall Light, White Fabric Shade Sconce, Bedroom Lighting, Living Room Lamp Minimalist Matte Black |
| 322 | BT026 | **Red** | `wall-light` | Red Wall Sconce, Colorful Modern Wall Lamp with White Shade, Statement Bedside Lighting, Artistic Metal Fixture for Bold Interior Décor Look red |

**Evidence:**

- 321 ↔ 322: copy similarity 57%

### Family 9 — 2 SKUs, 2 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 326 | BT030 | **Matte Black** | `wall-light` | Matte Black Wall Sconce Modern Wavy Wall Sconce, Luxury Minimalist Bedroom Bedside Lamp, Scandinavian Lighting Fixture Lights Design Lamp black |
| 327 | BT031 | **Gold Brass** | `wall-light` | Golden Wall Sconce with White Fabric Shade | Modern Wavy Gold Wall Light for Bedroom, Living Room, Hallway & Luxury Décor golden |

**Evidence:**

- 326 ↔ 327: copy similarity 48%

### Family 10 — 2 SKUs, 2 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 335 | BT038 | **Red** | `horizontal-lights` | Red Three Arm Curved Wall Sconce, Bold Artistic Modern Wall Light, Luxury Lighting Fixture, Statement Interior Décor , Living Room Lighting red |
| 336 | BT039 | **Matte Black** | `horizontal-lights` | Matte Black 3 Light Wall Sconce, Triple Wall Lamp, Metal Wall Light White Fabric Shades, Modern Bathroom, Bedroom Lighting, Dining Room. black |

**Evidence:**

- 335 ↔ 336: copy similarity 62%

### Family 11 — 2 SKUs, 2 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 338 | BT041 | **Red** | `wall-light` | Red 2 Light Wall Sconce, Sculptural Wall Lamp, White Fabric Shades, Modern Wall Light, Artistic Sconce, Living Room Bedroom Lighting décor. red |
| 339 | BT042 | **Gold Brass** | `wall-light` | 3 Light Wall Sconce, Modern Brass Wall Lamp, Sculptural Lighting, Bedroom Sconce, Living Room Light, Handmade Accent Home lighting Fixture. golden |

**Evidence:**

- 338 ↔ 339: copy similarity 51%

### Family 12 — 2 SKUs, 2 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 349 | BT050 | **Gold Brass** | `vertical-lights` | Antique Brass 3 Light Wall Sconce, Modern Wall Lamp, Brass Vanity Light, Bedroom Lighting, Living Room Sconce, Hallway Accent Light Décor. golden |
| 350 | BT051 | **Matte Black** | `vertical-lights` | Matte Black 3 Light Wall Sconce, a Modern Vertical Wall Lamp with White Shades, Contemporary Bedroom Hallway Lighting Fixture for Home Décor matte black |

**Evidence:**

- 349 ↔ 350: copy similarity 50%

### Family 13 — 2 SKUs, 2 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 358 | BT059 | **Matte Black** | `wall-light` | Matte Black Wall Sconce, Gold Interior Décor, Modern Cone Shade Wall Lamp, Adjustable Arm Lighting Fixture for Bedroom Living Room Hallway. matte black |
| 360 | BT061 | **Gold Brass** | `wall-light` | Gold Brass Wall Sconce, Modern Gold Wall Lamp, Brass Wall Light, Cone Shade Sconce, Minimalist Bedroom Light, Luxury Reading Wall Lamp. golden |

**Evidence:**

- 358 ↔ 360: copy similarity 46%

### Family 14 — 2 SKUs, 2 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 361 | BT062 | **Gold Brass** | `wall-light` | Gold Brass Double Wall Sconce, Elegant 2 Light Wall Lamp with White Shades, Luxury Bedroom Living Room Lighting Home Fixture Wall Décor Item golden |
| 362 | BT063 | **Antique Brass** | `wall-light` | Wall Light Antique brass Double Stem Sconce, Elegant Modern Wall Fixture with White Fabric Shades for Bedroom & Luxury Living Space Antique Brass |

**Evidence:**

- 361 ↔ 362: copy similarity 56%

### Family 15 — 2 SKUs, 2 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 363 | BT064 | **Matte Black** | `wall-light` | Matte Black Wall Sconce, Gold Accent Fixture, Modern Bedroom Wall Lamp, Industrial Wall Light, Contemporary Lighting Home Decoration Item. matte black |
| 364 | BT065 | **Gold** | `wall-light` | Gold Brass Wall Sconce, Modern Brass Wall Lamp, Gold Sconce Light, Bedroom Lighting, Reading Light, Entryway & Living Room Light Hallway golden |

**Evidence:**

- 363 ↔ 364: copy similarity 48%

### Family 16 — 2 SKUs, 2 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 367 | BT067 | **Matte Black** | `wall-light` | Matte Black Wall Lamp Modern Cone Wall Sconce, Luxury Nordic Bedroom Bedside Lamp, Mid Century Industrial Home Lighting Fixture Lamp Design. matte black |
| 368 | BT068 | **Gold Brass** | `wall-light` | Gold Brass Wall Sconce, Modern Cone Wall Lamp, Mid Century Bedroom Light, Handmade Metal Wall Light, Bedside Light cone-shaped metal shade. Golden |

**Evidence:**

- 367 ↔ 368: copy similarity 46%

### Family 17 — 2 SKUs, 2 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 381 | BT080 | **Gold Brass** | `horizontal-lights` | Antique Brass 3 Light Wall Sconce, Brass Wall Lamp, Modern Wall Light, White Shade Sconce, Sculptural Lighting, Elegant Home Decoration lamp golden |
| 382 | BT081 | **Black** | `horizontal-lights` | Matte Black 3 Light Wall Sconce, Modern Wall Lamp, White Fabric Shade Lighting, Sculptural Wall Light, Bedroom, Living Room & Hallway Décor. Black |

**Evidence:**

- 381 ↔ 382: copy similarity 47%

### Family 18 — 2 SKUs, 2 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 417 | BT113 | **Gold** | `table-lamps` | Gold Brass Table Lamp, Modern Cone Shade Desk Lamp with Sculptural Arch Arm, Minimalist Metal Design, Elegant Bedside, Office & Living Room. golden |
| 418 | BT114 | **Matte Black** | `table-lamps` | Matte Black Cone Table Lamp, Contemporary Desk Décor Lamp with Curved Neck Design | Minimal Modern Lighting Minimalist Bedside And Office. matte black |

**Evidence:**

- 417 ↔ 418: copy similarity 100%

### Family 19 — 2 SKUs, 2 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 454 | BT150 | **Red** | `table-lamps` | Red Table Lamp, Modern Red Dome Table Light, Sculptural Base, Accent Lighting for Bedroom, Living Room, Office, Nightstand, Console Table. Red |
| 455 | BT151 | **Matte Black** | `table-lamps` | Matte Black Table Lamp, Modern Black Dome Table Light, Stylish Accent Lighting for Bedroom, Living Room, Office, Nightstand, Console Table. Matte black |

**Evidence:**

- 454 ↔ 455: copy similarity 56% · title similarity 58%

### Family 20 — 2 SKUs, 2 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 478 | BT174 | **Matte Black** | `table-lamps` | Modern Matte Black Desk Lamp, Adjustable Long Arm, Minimalist Industrial Table Light for Home Office, Study Room, Reading Desk, Bedroom. matte black |
| 479 | BT175 | **Red** | `table-lamps` | Modern Matte Black Desk Lamp, Adjustable Long Arm, Minimalist Industrial Table Light for Home Office, Study Room, Reading Desk, Bedroom red |

**Evidence:**

- 478 ↔ 479: copy similarity 100% · title similarity 100%

### Family 21 — 2 SKUs, 2 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 494 | BT189 | **Matte Black** | `wall-light` | Matte Black 2 Light Wall Sconce, Modern Wall Lamp, Black Wall Light, Sculptural Sconce, White Shade Lighting, Elegant Home Decor interior Matte Black |
| 495 | BT190 | **Gold Brass** | `wall-light` | Gold Wall Sconce, 2 Light Wall Lamp, Brass Wall Light, Modern Sculptural Sconce, White Shade Lighting, Elegant Home Décor designing lamp Gold Brass |

**Evidence:**

- 494 ↔ 495: copy similarity 45%

### Family 22 — 2 SKUs, 2 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 529 | BT224 | **Gold Brass** | `wall-light` | Gold Wall Sconce, 5 Light Wall Lamp, Brass Wall Light, Modern Sculptural Sconce White Shade Lighting Luxury Statement Design & Home Décor. Gold Brass |
| 531 | BT226 | **Antique Brass** | `wall-light` | Antique Brass 5 Light Wall Sconce, Vintage Inspired Multi Arm Wall Lamp with White Shades, Classic Indoor Lighting Fixture for Home Lighting Antique brass |

**Evidence:**

- 529 ↔ 531: copy similarity 55%

### Family 23 — 2 SKUs, 1 finishes

| Id | Code | Finish | Category | Title |
|---|---|---|---|---|
| 510 | BT205 | **Red** | `wall-light` | Red Wall Sconce, Modern Wall Light, 3 Tier Wall Lamp, Sculptural Lighting, Red Accent Light, Contemporary Art Deco Home Decor design lamp Red |
| 512 | BT207 | **Red** | `wall-light` | Red Wall Light, Modern Wall Sconce, 3 Tier Wall Lamp, Sculptural Lighting, Contemporary Sconce, Statement Light, Art Deco Home Decor Design Red |

**Evidence:**

- 510 ↔ 512: copy similarity 53% · title similarity 75%

## 3. Genuine re-listings

1 pair(s) share a design **and** a finish — the same fixture
listed twice under two ids. These should be merged into one canonical record.

| Pair | Evidence |
|---|---|
| 510 ↔ 512 | RE-LISTING: same finish (Red) + same design; copy similarity 53% · title similarity 75% |

## 4. What this means for the rebuild

1. **Do not treat the colourways as separate pages.** Build one product page
   per *design*, with the finish as a swatch/variant. That is how buyers
   actually shop — "do you have this in matte black?" — and it stops N pages
   competing for the same keyword.
2. **Keep the existing `Product Code` per SKU.** Even though colourways
   collapse to one page, each colourway is a real SKU with its own stock and
   its own code (`BT###`). The page should list them all.
3. **Filter by finish, because finish is the catalogue's real axis.** The
   facet analysis in `08-content-analysis.md` shows a handful of finishes
   covering most of the range.
4. **Watch the re-listings.** Before launch, pick the surviving URL for each
   pair and 301 the other — otherwise the new site inherits the old site's
   split-equity problem.
