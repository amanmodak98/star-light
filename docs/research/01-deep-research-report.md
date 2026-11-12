# Deep Research Report — Rebuilding beautyartlights.com

**Workflow:** `deep-research` (scope → 5-angle search → fetch/extract → 3-vote adversarial verify → synthesis)  
**Run:** `wf_f87c912f-a54`  
**Agents:** 91 calls · 9 sources fetched · 45 claims extracted · 25 verified · **8 confirmed** · 4 refuted · 13 unverifiable  
**Post-synthesis findings:** 7

---

## Executive summary

The verified evidence base for rebuilding beautyartlights.com is thin but actionable: 8 claims survived (4 refuted, 13 unverifiable), and they cover channel structure, competitor catalogue data practices, structured-data mechanics and one hard image-pipeline constraint — but not market sizing, teardowns of the named competitor catalogues, or lighting compliance. On demand, wholesalers/electricians dominate Indian lighting (47.35% share in 2025 per Mordor, with specialists growing 13.12% CAGR to 2031), confirming that the wholesale/export channel Beauty Art Lights sells into is the right one to design for, though the figures are single-vendor and Mordor-scoped. On competition, the incumbent Indian B2B marketplace (TradeIndia) publishes commercial terms (indicative price and MOQ on most cards) far more consistently than technical depth — spec fields are seller-supplied and thin (one listing: 8 fields, 'Variable' dimensions, no bulb base, wattage, CRI, IP rating or certification; lighting-specific fields on ~1 card each) — and it ships no facet tree anywhere on its lighting pages (zero checkboxes, zero selects, city filter only), so working filters by category, finish, bulb type and size are the clearest available differentiator. On implementation, Google supports variant structured data in both snippets and merchant listings but demands a unique SKU/GTIN per variant and its variesBy whitelist excludes bulb base, so finish/colourways and E14/E27 must be distinct SKUs grouped under a productGroupID; because price-drop annotations and merchant listings both require a published price, the enquiry-for-bulk model should target product-snippet-class markup, not merchant listings. On technology, the one high-confidence, primary-sourced constraint is that Astro serves public/ images untouched — never optimized, never responsive — so the catalogue's 1,412-photo (131.7 MB) library must be imported from src/ or served from an allowlisted remote domain to get AVIF/WebP, srcset and CLS-safe dimensions, making a static Astro build with build-time image transformation the defensible choice for a ~250-SKU catalogue, though no verified Astro-vs-Next.js benchmark or build-time budget survived.

---

## Verified findings

Each finding below survived a 3-vote adversarial verification (a claim is killed only if 2 of 3 voters refute it).

### 1. Wholesalers and electricians are the dominant route to market in Indian lighting (47.35% of the India lighting market in 2025), while lighting specialists and 'others' are forecast to grow faster (13.12% CAGR, 2026-2031) — so the wholesale/export channel Beauty Art Lights sells into is the right one to design for, but the figures are directional, single-vendor and Mordor-scoped.

- **Confidence:** medium
- **Sources:**
  - https://www.mordorintelligence.com/industry-reports/india-lighting-market
- **Vote:** 1-1
- **Evidence:** Mordor Intelligence's India lighting report states verbatim: 'Wholesalers/electricians held 47.35% share of the India lighting market size in 2025' and 'the lighting specialists and others cohort is forecast to capture a 13.12% CAGR to 2031 — more than double the wholesale channel's pace — by bundling design consulting, IoT commissioning, and post-install analytics'. Page last updated 2026-06-17, study period 2020-2031, forecast 2026-2031, so it is the right vintage. Flags: no wholesale-channel CAGR is published anywhere, so 'more than double' is the source's characterisation, not a computed fact; the same page separately says distributors held 46.8% of 2024 volume (different label/year, near-identical magnitude — a signature of opaque proprietary synthesis); and Mordor's own India lighting sizing (USD 354.33M for 2025) sits roughly 10x below peer estimates for the same nominal market (ResearchAndMarkets USD 3.83B 2025 -> 5.12B 2031; Ken Research USD 4,433M 2025; MarketsandMarkets India LED USD 7.09B 2024), so only the channel ratios should be used. No independent source corroborates 47.35% or 13.12%.

### 2. Direct structural comparables to beautyartlights.com exist in India — Daksh Arts (Jaipur) markets itself as a manufacturer and wholesale exporter of handmade chandeliers, floor lamps, wall sconces, fireplaces, table lamps, mirrors and lanterns, and Neokraft Global (New Delhi) as a manufacturer and exporter of premium home decor lighting — confirming the buyer segment and product taxonomy, but the directory ranks are by professionals tracked, not revenue or market share.

- **Confidence:** medium
- **Sources:**
  - https://revenuebase.ai/companies/decorative-lighting-wholesalers/india
  - https://dakshindia.in/
  - https://www.neokraft.in/profile.html
  - https://www.neokraft.in/products.html
- **Vote:** 2-0
- **Evidence:** revenuebase.ai's 'Top 25 Decorative lighting wholesalers based in India' (refreshed October 2026) lists Daksh Arts at #19 (Jaipur, 51-200 employees) with the verbatim line 'We are manufacturer & wholesale exporter of handmade Chandeliers, Floor Lamps, Wall Scones, Fireplace, Table Lamps, Mirrors and Lanterns our major production', and Neokraft Global Pvt. Ltd at #2 (New Delhi, 501-1,000) as 'a renowned manufacturer and leading exporter of premium home decor lighting and furnishing articles'. Primary corroboration: dakshindia.in describes in-house woodworking, fabrication, finishing and wiring of hand-crafted wood and iron chandeliers, wall sconces, table/floor lamps and lanterns; neokraft.in/profile.html says it was established in 2002 to manufacture home lighting/luminaires for the global market, operates from an SEZ in Noida (UP), and is one of the largest Indian exporters of home lighting. Caveats: the ordering is explicitly 'by professionals tracked, largest first' over 495 companies matched by fuzzy business-description search, so #2 and #19 are directory positions, not market share; Neokraft's product page lists table/floor/wall/ceiling lamps, decorative LED, garden decor, accent chairs and bath accessories with no explicit mirrors or chandeliers line, so the taxonomy match is only partly there and Neokraft is a segment-level comparable, not a like-for-like peer.

### 3. The incumbent Indian B2B lighting marketplace (TradeIndia) publishes commercial terms — indicative price and MOQ — far more consistently than technical spec depth: spec fields are seller-supplied and thin (one listing exposes only 8 fields, with non-committal 'Variable' dimensions and no bulb base, wattage, CRI, IP rating or certification), while lighting-specific fields such as Bulb Base and IP Rating appear on roughly one card each.

- **Confidence:** medium
- **Sources:**
  - https://www.tradeindia.com/manufacturers/indoor-decorative-lighting.html
  - https://www.tradeindia.com/products/decorative-light-1915769.html
  - https://www.tradeindia.com/products/decorative-lighting-pole-10362880.html
  - https://www.tradeindia.com/products/led-light-bulb-c4324083.html
- **Vote:** 1-1 + 1-1 (merged)
- **Evidence:** Two live primary pages, both fetched 2026-10-25 with HTTP 200 and no login gate. (a) The category page https://www.tradeindia.com/manufacturers/indoor-decorative-lighting.html renders a <div class='product-specifications'> block on each card with Material, Dimensions, Wattage, Voltage, Color/Color Temperature, Lumens, Surface Finish, Warranty and MOQ alongside prices such as 'Price: 227.0 INR /Piece', 'Price: 2.99 USD ($)/Piece' and 'MOQ 100 Piece/Pieces', 'MOQ 50 Unit/Units'. But coverage is patchy, not templated: of 29 cards carrying a spec block, MOQ appears on 19, Material 21, Color 17, Voltage 8, Dimensions 7, Wattage 5, Warranty 3, Surface Finish 2; nine cards show 'Get Latest Price' instead of a number and one shows no price line at all — so prices are lead-gen anchors, not firm trade prices. Lighting-specific fields are near-absent: Bulb Type 1, Base 1, Number of Lights 1, IP Rating 1, LED Quantity 1. (b) The single listing https://www.tradeindia.com/products/decorative-light-1915769.html has exactly one Product Specifications table with exactly 8 rows — Material (Wood), Color (Black), Dimensions (Variable), Weight (1-3 kg), Light Source (LED), Voltage (120V), Usage, Features — and no rows for Bulb Base, Wattage, CRI, IP Rating or Certification. Important qualification: that 8-field set is a property of one thin, boilerplate seller listing (a Jaipur service provider registered 2014), not a TradeIndia template — sibling TradeIndia decorative-light listings carry up to ~25 fields including Moq, Supply Ability, Packaging Details, and an LED-bulb listing shows Wattage 15W, Base Type E27, Color Temperature 6500k, Luminous Flux 1000lm. Net takeaway for the rebuild: Beauty Art Lights' own spec table (Material, Finish, Power Source, Voltage, Bulb Base, Bulb Included, Shade Included, Number Of Bulbs, Assembly Required, Certification) is already deeper in lighting terms than the marketplace norm, so the differentiator is spec depth, while the marketplace's edge is price/MOQ transparency and a contact funnel.

### 4. Multi-attribute faceted filtering is an unserved gap in Indian B2B lighting: TradeIndia's indoor decorative lighting category page exposes no facet tree at all — zero checkboxes and zero selects — only a generic 'Popular-filter' icon that fronts a city-search box with an 'All India' location chip — and the same absence holds across sibling lighting and search pages, making working filters by category, finish/colour, bulb base and dimensions the clearest available differentiator for a rebuilt catalogue.

- **Confidence:** high
- **Sources:**
  - https://www.tradeindia.com/manufacturers/indoor-decorative-lighting.html
  - https://www.tradeindia.com/manufacturers/chandelier.html
  - https://www.tradeindia.com/manufacturers/decorative-lights.html
  - https://www.tradeindia.com/manufacturers/light-bulb.html
  - https://www.tradeindia.com/search.html?keywords=decorative+lighting
- **Vote:** 2-0
- **Evidence:** Direct inspection of the served HTML (954,958 bytes, 2026-10-25) finds type=checkbox count = 0 and <select count = 0. The single 'Popular-filter' occurrence is the asset name of an icon <img src=/images/v2/Popular-filter.png> sitting inside the city-search input (placeholder 'Please Enter Your City Name') that pairs with the 'All India' chip row (Delhi, Mumbai, Chennai, Kolkata, Bengaluru, Pune, Hyderabad, Jaipur, Ahmedabad) — so it is not really a standalone filter control, which makes the underlying absence starker. The Next.js hydration state ships filters:{} and filterData:{} with no filter API endpoints, and the only filter-related chunk (DesktopCityNearMeFilter-Component) contains city x67 and zero hits for Wattage, Voltage, Base Type, Bulb, Finish, Dimension, checkbox, Price or MOQ. Cross-checks on /manufacturers/light-bulb.html, /manufacturers/light-bulb-base.html, /manufacturers/chandelier.html, /manufacturers/decorative-lights.html and /search.html?keywords=decorative+lighting all return 0 checkboxes and 0 selects, so the gap is channel-wide rather than page-specific. Product attributes (Wattage 12W, Voltage 220V, Material Aluminum, Lumens 800lm, Surface Finish Polished, MOQ 100 Piece/Pieces) exist only as static text inside cards, never as selectable facets.

### 5. For a price-free, enquiry-led B2B catalogue the correct structured-data target is the product-snippet class with variant grouping, not merchant listings: Google supports variants in both snippets and merchant listings but requires a unique sku/gtin per variant and its variesBy whitelist excludes bulb base, so finish/colour and E14/E27 must be modelled as distinct SKUs grouped under one productGroupID — and price-drop annotations, which are computed from observed historical price changes and are not guaranteed, are unreachable for any catalogue that never publishes a price.

- **Confidence:** high
- **Sources:**
  - https://developers.google.com/search/docs/appearance/structured-data/product
  - https://developers.google.com/search/docs/appearance/structured-data/product-variants
  - https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
  - https://support.google.com/merchants/answer/14991443?hl=en-GB
- **Vote:** 2-0 + 3-0 (merged)
- **Evidence:** Google's product-snippet documentation (updated 2025-12-10) states: 'Do you offer variants of your products? Adding product variant structured data can help Google better understand which products are variations of the same parent product. Both product snippets and merchant listings support product variants.' The dedicated variants page (updated 2026-09-08) adds that variations differ by 'various sizes, colors, materials, or patterns' and that 'Each variant must have a unique ID in its corresponding structured data markup (for example, using the sku or gtin properties)'. Two refinements that matter for this catalogue: Google's variesBy whitelist is only color, size, suggestedAge, suggestedGender, material and pattern, so bulb base (E14/E27) is not a standard variant dimension and must be carried as separate SKU/GTIN entries inside a productGroupID/hasVariant group; and merchant-listing eligibility requires Offer.price or priceSpecification.price above zero with feed-to-landing-page price consistency, which a no-price 'Enquiry for bulk' model cannot supply — so the realistic prize here is machine-readability of which SKUs vary together, not price-bearing rich results. On price drops the same doc says: 'Price drops are computed by Google by observing price changes for the product over time. Price drops are not guaranteed to be shown', and Google's price-drop badge spec defines the badge as automatic, shown when a price falls below the average listed price of the previous 60 days — i.e. purely a function of an observed price series. No credible source claims a price-drop annotation can be earned without a published price, and India coverage of price-drop rollout is itself limited, which reinforces the conclusion.

### 6. Astro's public/ directory is a hard constraint on the image pipeline: files placed there are copied into the build output untouched — never optimized, never responsive — so the catalogue's 1,412 product photos (131.7 MB, mostly 1600x1621 PNG/JPG) must be imported from src/ or served from a domain authorised via image.domains / image.remotePatterns to receive AVIF/WebP conversion, srcset generation and CLS-safe dimensions.

- **Confidence:** high
- **Sources:**
  - https://docs.astro.build/en/guides/images/
  - https://docs.astro.build/en/reference/modules/astro-assets/
- **Vote:** 3-0
- **Evidence:** Astro's image guide states verbatim: 'Files in the public/ directory are always served or copied into the build folder as-is, with no processing', 'We recommend that local images are kept in src/ when possible so that Astro can transform, optimize, and bundle them', and 'Images in your public/ folder are never optimized, and responsive images are not supported.' The same guide confirms that image components only process images from authorised sources configured through image.domains and image.remotePatterns, and that unauthorized remotes render with no processing; the astro:assets reference confirms isRemoteAllowed({ domains, remotePatterns }) still exists and that since Astro 5.17.3 inferSize only fetches dimensions for authorised remote domains. Astro 5.10.0 introduced the responsive `layout` property on <Image>/<Picture>, which auto-generates srcset and sizes, and <Picture> supports formats={['avif','webp']}. Minor qualification: explicit width/height also makes a public/ image CLS-safe, so the CLS argument alone is not exclusive to src/ — the decisive reasons are format conversion and responsive srcset. This is directly load-bearing here: the project's own scrape recorded 1,412 product images totalling ~131.7 MB (1,205 PNG, 206 JPG, 1 WebP; 1,402 at 1600x1621; 458 over 100 KB, 26 over 300 KB), and Astro's `layout` property multiplies each source into several width variants — roughly 1,500 source files x ~4-5 sizes is a materially larger build than a single-derivative public/ copy, so the build-time budget and the CDN choice must be planned around it.

### 7. The subject catalogue's own data is facetable but not yet facet-clean, and its trust fields are empty: Bulb Base is a clean two-value facet (E14 199 / E27 35), dimension fields have usable cardinality (74 widths, 69 heights, 58 depths, in inches + cm), but Finish is 50 raw strings for roughly six real finishes, Power Source duplicates on case, Voltage is a single value (110-240V) so it cannot drive a facet, and Certification is blank on all 229 products that carry the row while Number Of Bulbs is present but empty.

- **Confidence:** high
- **Sources:**
  - /Users/aman/Projects/beaustyartlights/data/products.json
  - /Users/aman/Projects/beaustyartlights/data/variants.json
  - /Users/aman/Projects/beaustyartlights/data/images.json
  - /Users/aman/Projects/beaustyartlights/docs/09-catalogue-hygiene.md
  - /Users/aman/Projects/beaustyartlights/docs/05-image-manifest.md
- **Vote:** n/a — computed from the project's own scrape, not a web claim
- **Evidence:** Computed directly from the project's own scrape data (not a web source, so it is asserted as a data fact, not as research). In /Users/aman/Projects/beaustyartlights/data/products.json (237 records): spec keys appear on 234 records for Material, Finish, Power Source, Voltage, Bulb Base, Bulb Included, Number Of Bulbs and Assembly Required, 231 for Shade Included, 229 for Certification. Finish resolves into roughly six real finishes but is stored as 50 distinct strings with case and format drift ('Color ( Red )' x33, 'Color ( Matte Black )' x30, 'Color ( Matte black )' x26, 'Color ( Gold Brass )' x24, 'Color ( Antique brass )' x16, plus RED/Green variants). Bulb Base is clean: E14 x199, E27 x35. Power Source needs normalisation: Hardwired x161, Plug-in x51, 'plug-in' x18, 'Hardwired / plug-in' x2, 'Hardwired (Plug-in)' x2. Voltage is '110-240V' on all 234 — a single value, so it is not a useful facet despite being a headline spec. Shade Included has case drift ('Yes' x218, 'no' x8, 'yes' x3, 'NO' x2); Bulb Included is uniformly 'No'; Assembly Required is uniformly 'Yes'. Certification is empty on every one of the 229 products that have the row, and Number Of Bulbs appears as a key with zero values. Dimensions: Product Width on 233 records (74 distinct), Product Height on 233 (69 distinct), Product Depth on 225 (58 distinct), formatted '25" IN, ( 64 CM )' style, i.e. inches + centimetres in one string that must be parsed and unit-normalised for a size facet. Prices are placeholders ('$ 0' on 223 products, '$ -2' on 14). Image counts: 232 products have 6 images, 4 have 5, 1 has 0. Variant structure from /Users/aman/Projects/beaustyartlights/docs/09-catalogue-hygiene.md: 53 of 237 products sit in 23 variant families (same design, different finish), and exactly 1 is a genuine re-listing — which is what the ProductGroup/hasVariant modelling in the Google variant finding would consolidate.

---

## Claims refuted by adversarial verification

These did **not** survive. Listed for transparency — do not assert them.

- ❌ The TradeIndia category/listing page has no faceted filter UI at all — no price-range, location, MOQ, subcategory or manufacturer filter controls in a sidebar — so its navigation is composed of link blocks and static sections (Explore Related Categories, More Products From This Seller, Compare With Similar Products, Recommended Products, People Also Viewed), and each product card renders a single thumbnail with no gallery count; this is the gap a faceted rebuild differentiates against.  
  Source: https://www.tradeindia.com/products/decorative-light-1915769.html · vote 0-2
- ❌ The enquiry funnel on TradeIndia listing cards is quote-first and multi-entry, offering four overlapping CTAs ('Get Best Quote', 'Get Latest Price', 'Contact Supplier', 'Ask for a Quote', plus 'Buy Now') rather than a single contact form or WhatsApp-style direct channel — a structure buyers of Indian decorative lighting are already accustomed to.  
  Source: https://www.tradeindia.com/manufacturers/indoor-decorative-lighting.html · vote 0-2
- ❌ MOQ is disclosed product-by-product on the marketplace alongside INR prices, with observed minimums spanning roughly two orders of magnitude — 5 pieces (Decorative Lighting Pole, 10000 INR), 10 units (LED String Light; Spiritual Soul Metal Hanging T-Light Holder, 350 INR), 50 pieces (Star Stylus Lights), 100 pieces (Krishna T-Light, 250 INR) and 500 pieces (Cotton Door Curtain) — indicating that Indian B2B lighting listings routinely publish explicit MOQ thresholds rather than enquire for bulk alone.  
  Source: https://www.tradeindia.com/products/decorative-light-1915769.html · vote 1-2
- ❌ TradeIndia's decorative-lighting taxonomy is deliberately fine-grained — at least 12 sub-categories including Led Decorative Light, Diwali Decorative Lights, Decorative Light Bulbs, Car Decorative Light, Indoor Decorative Lighting, Light Decoration Services, Decorative Lighting Poles, Decorative Solar Light, Decorative Stars, Decorative Garland and Led String Lights — which is the SEO category depth a 250-SKU catalogue should mirror (and the vocabulary buyers search with), while the seller itself is a Jaipur Service Provider registered in 2014 with no certification, GSTIN, employee-count or export/lead-time data shown, so trust rests only on the platform's own verified and trusted names claim.  
  Source: https://www.tradeindia.com/products/decorative-light-1915769.html · vote 1-2

---

## Unverified claims

Verifier agents errored (infrastructure), so these are neither confirmed nor refuted. Treat as **unconfirmed**.

- ⚠️ The TradeIndia decorative-light listing is a price-suppressed, enquiry-led funnel rather than a priced catalogue: the main product shows no amount, only the CTA Get Latest Price plus Send Inquiry, with contact routes via VIEW NUMBER, Contact Seller and WhatsApp links under Sold By — the same no-published-price Enquiry for bulk model beautyartlights.com uses, but with a wider set of buyer-intent routes (Post Your Requirement, Get Distributors, Buy Trade Leads).  
  Source: https://www.tradeindia.com/products/decorative-light-1915769.html · 1/2 votes errored
- ⚠️ Google splits product structured data into two classes with different eligibility — product snippets for pages where the user cannot directly purchase the item, and merchant listings for pages where the user can buy — and a page that meets merchant-listing required properties also becomes eligible for product snippets. For a wholesale catalogue with no published prices and a WhatsApp/email Enquiry for bulk funnel (i.e. beautyartlights.com), only the product-snippet class is applicable, since merchant listings require purchase/price data.  
  Source: https://developers.google.com/search/docs/appearance/structured-data/product · 0/3 votes errored
- ⚠️ Product rich data can be supplied by web page structured data, a Google Merchant Center product feed with free listings, or both; providing both maximizes eligibility and lets Google cross-fill — specifically, product snippets may take pricing data from the merchant feed when price is absent from the page markup. This is the documented mechanism by which a price-free enquiry catalogue could still surface price/availability in results via a feed.  
  Source: https://developers.google.com/search/docs/appearance/structured-data/product · 1/2 votes errored
- ⚠️ Goods manufactured purely for export are outside the scope of India's Electrical Equipment Quality Control Order (EEQCO), but an Indian manufacturer who wishes to apply the ISI/Standard Mark to export-bound product must hold a valid BIS licence and comply with the relevant Indian Standards — i.e. an ISI mark on a product page implies a real licence, while export-only production is exempt from the QCO.  
  Source: https://www.bis.gov.in/scheme-x-certification/faq-scheme-x-certification/?lang=en · 0/3 votes errored
- ⚠️ Astro's built-in `<Image />` component transforms images at build time for prerendered (static) pages and on-the-fly for on-demand rendered pages, and its rendered `<img>` tag includes alt/loading/decoding attributes with inferred image dimensions to avoid Cumulative Layout Shift — making a static Astro build viable for a 250-SKU catalogue with CLS-safe images at zero runtime image cost.  
  Source: https://docs.astro.build/en/guides/images/ · 1/2 votes errored
- ⚠️ Astro's default image service for `astro:assets` is Sharp (swappable via the `image.service` config option), and the `<Picture />` component emits AVIF and WebP `<source>` elements with a PNG `<img>` fallback — i.e. a modern-format pipeline with graceful degradation for older browsers, plus default lazy-loading/async-decoding attributes that support Core Web Vitals.  
  Source: https://docs.astro.build/en/guides/images/ · 0/3 votes errored
- ⚠️ Enabling responsive images in Astro (the `layout` property, added in astro@5.10.0) multiplies each source image into several size variants, so build time grows materially with the number of images — a concrete constraint for a 250-SKU catalogue with 6 photos per SKU (~1,500 source images) — and processed assets are cached between builds to mitigate this.  
  Source: https://docs.astro.build/en/guides/images/ · 0/3 votes errored
- ⚠️ IMARC Group sizes the India decorative lighting market at USD 1.7 billion in 2025 rising to USD 1.9 billion in 2026, reaching USD 3.0 billion by 2034 at a 5.89% CAGR over 2026-2034. These are IMARC's own proprietary estimates published only in a paid-report landing page — no primary trade/government data source is cited on the page, so the figures are unverified against official statistics.  
  Source: https://www.imarcgroup.com/india-decorative-lighting-market · 0/3 votes errored
- ⚠️ The demand drivers cited for India's decorative lighting market are festival/cultural-event seasonality (Diwali, weddings), the shift to sustainable and eco-friendly/solar lighting, and the expansion of organized retail and e-commerce, plus a consumer upgrade toward premium branded products bought for quality, warranties and after-sales service — i.e. the stated growth logic is consumer-facing, not B2B/wholesale-led.  
  Source: https://www.imarcgroup.com/india-decorative-lighting-market · 0/3 votes errored
- ⚠️ The global decorative lighting market was USD 75.88 billion in 2025, is projected at USD 78.98 billion in 2026, and is expected to reach USD 96.52 billion by 2031 at a 4.09% CAGR.  
  Source: https://www.mordorintelligence.com/industry-reports/decorative-lighting-market · 0/3 votes errored
- ⚠️ Within decorative lighting, ceiling lights and chandeliers were the largest product segment at 35.02% market share in 2025, while table and floor lamps are the fastest-growing product type at a 5.21% CAGR through 2031.  
  Source: https://www.mordorintelligence.com/industry-reports/decorative-lighting-market · 0/3 votes errored
- ⚠️ Asia-Pacific was the largest and fastest-growing region for decorative lighting, with 35.70% of global market share in 2025 and a forecast 5.98% CAGR through 2031 — the region in which India sits and from which export demand originates.  
  Source: https://www.mordorintelligence.com/industry-reports/decorative-lighting-market · 1/2 votes errored
- ⚠️ The India lighting market is estimated at USD 354.33 million in 2025, USD 391.61 million in 2026 and USD 645.62 million by 2031, growing at a 10.52% CAGR over 2026-2031; the figures come from Mordor Intelligence's proprietary estimation framework rather than published primary statistics.  
  Source: https://www.mordorintelligence.com/industry-reports/india-lighting-market · 1/2 votes errored

---

## Caveats

Coverage gaps are the headline caveat: 13 candidate claims could not be verified because of infrastructure errors (all verifier agents errored), and 4 were actively refuted by adversarial voting. Nothing in this evidence base covers BIS/ISI, UL, CE, RoHS, LED energy labelling, packaging/drop-shipping, MOQ/customisation terms typical of Indian exporters, image count/format/size conventions, Core Web Vitals thresholds, or the named competitor catalogues (Visual Light, Lumen & Watt, Bapital, Sunny Light, Artistic Lighting) — question areas (1) sizing, (2) named-catalogue teardowns and buyer complaints, and (4) compliance are therefore largely unanswered, not answered with confidence.

Specific source weaknesses. Market sizing: every India/global decorative-lighting size and growth figure failed verification (IMARC USD 1.7B 2025 -> USD 1.9B 2026 -> USD 3.0B 2034; Mordor global USD 75.88B 2025 -> 78.98B 2026 -> 96.52B 2031 at 4.09% CAGR; Mordor India USD 354.33M 2025). The one surviving market figure (Mordor channel split) carries a scope warning: Mordor's own India lighting sizing for 2025 (USD 354.33M) sits roughly 10x below peer estimates for the same nominal market (ResearchAndMarkets USD 3.83B, Ken Research USD 4,433M, MarketsandMarkets India LED USD 7.09B), so its channel percentages are usable as ratios only, and any absolute market size taken from it must be labelled Mordor-scoped. Mordor's "more than double the wholesale channel's pace" is the report's own characterisation; no wholesale-channel CAGR is published anywhere, so it must be cited as the source's assertion, not as computed fact. The same page also states distributors held 46.8% of 2024 volume — different label, different year, near-identical magnitude — a sign of opaque proprietary synthesis (its footnote markers do not render), and the page is a subscription-sales landing page.

Competitor-evidence caveats. revenuebase.ai explicitly ranks by professionals tracked via fuzzy description matching over 495 companies, not by revenue or market share, so Daksh Arts #19 and Neokraft #2 are directory positions, not market positions; it also runs a near-duplicate sibling list at /companies/decorative-lighting-distributors/india, a programmatic-SEO pattern to cite with care. The "8-field spec table" is a property of one seller-supplied listing by a Jaipur Service Provider with boilerplate copy, not a TradeIndia platform template — comparable TradeIndia listings carry up to ~25 fields, and wattage and E27 base do appear elsewhere on the platform, so the defensible takeaway is that one thin generic listing survives on minimal specs, not that Indian B2B decorative-light listings only carry 8 fields. On the category page, spec fields are per-product and vary (MOQ on 19 of 29 cards with spec blocks, Material 21, Color 17, Voltage 8, Dimensions 7, Wattage 5, Warranty 3, Surface Finish 2; 9 cards show "Get Latest Price" instead of a number; lighting-specific fields appear on ~1 card each), so any "incumbent publishes X" claim is a frequency observation, not a template guarantee. "Popular-filter" is literally the asset filename of the city-search input's icon, so calling it a standalone filter control is loose — the load-bearing fact is zero checkboxes and zero selects on the page and its sibling lighting pages.

Time sensitivity. All TradeIndia observations were fetched 2026-10-25; Google's product-snippet doc was last updated 2025-12-10 and the variants doc 2026-09-08; the Astro guide and astro:assets reference reflect current main-branch 5.10-5.17-era behaviour; the Mordor page was updated 2026-06-17. Marketplace templates, Google eligibility rules and Astro defaults all change, so re-verify before relying on any specific UI detail or doc string.

Subject-site data caveat (computed locally, not web-verified). The catalogue's own fields need normalisation before faceting can work: 50 raw Finish strings resolve to roughly six real finishes with case/format duplicates ("Color ( Red )" vs "RED"), Power Source is duplicated by case ("Plug-in"/"plug-in"), Voltage is a single value (110-240V) and so is not a usable facet, Bulb Base is a clean two-value facet (E14 199, E27 35), Certification is blank on all 229 products that carry the row, Number Of Bulbs is present but empty, 14 products have price "$ -2" and 223 have "$ 0", and 232 of 237 products carry 6 images with 4 at 5 and 1 at 0. Spec fields are present on 229-234 of 237 products. Dimension facets have reasonable cardinality (74 widths, 69 heights, 58 depths) but need inches/cm parsing and unit normalisation.

Bottom line on confidence. Only the image-pipeline constraint and the Google structured-data mechanics are high-confidence and primary-sourced; the market and competitor findings are directional, single-vendor and must not be used as hard planning inputs for inventory, pricing or channel strategy.

---

## Open questions

- What do the five named competitor catalogues (Visual Light, Lumen & Watt, Bapital, Sunny Light, Artistic Lighting) actually do — navigation depth, spec-table field sets, MOQ and price disclosure, image count per SKU, and enquiry funnel design (WhatsApp vs form vs quote request vs distributor sign-up) — and what do their buyers complain about? No verified claim in this evidence base covers any of them; every competitor finding here is TradeIndia or a company directory, so buyer complaints remain entirely unevidenced (no review mining or forum analysis survived).
- What are the defensible size, growth and demand-driver figures for Indian decorative lighting in the B2B wholesale/export segment and for the global export market? Every sizing claim failed verification (IMARC USD 1.7B 2025; Mordor global USD 75.88B 2025 -> 96.52B 2031 at 4.09% CAGR; Mordor India USD 354.33M 2025), the one surviving market figure is Mordor-scoped and ~10x below peer estimates, and no verified source separates project/hospitality/retail fit-out demand (the segment Beauty Art Lights actually sells into) from consumer festival/decor demand.
- Which compliance marks and buyer-trust artefacts actually apply to Indian decorative-lighting exporters — which BIS/ISI standard covers luminaires, whether CE, UL, RoHS and LED energy labelling apply to export-only goods, and what packaging, drop-shipping, MOQ and customisation terms are standard — and how should the currently empty Certification field on all 229 products be populated with truthful, verifiable values?
- Should Beauty Art Lights publish indicative price bands or MOQ tiers (as TradeIndia does) to unlock merchant listings, price-drop annotations and richer buyer self-qualification, or keep the opaque enquiry-for-bulk model and optimise purely for product-snippet-class structured data — and what build-time and Core Web Vitals budget is acceptable for ~250 SKUs x 6 photos (~1,500 source images) on a static Astro host, given that responsive `layout` output multiplies each source into several width variants?

---

## Sources

| URL | Quality | Claims |
|---|---|---|
| https://www.imarcgroup.com/india-decorative-lighting-market | secondary | 5 |
| https://www.mordorintelligence.com/industry-reports/decorative-lighting-market | secondary | 5 |
| https://www.mordorintelligence.com/industry-reports/india-lighting-market | secondary | 5 |
| https://www.tradeindia.com/manufacturers/indoor-decorative-lighting.html | secondary | 5 |
| https://www.tradeindia.com/products/decorative-light-1915769.html | primary | 5 |
| https://revenuebase.ai/companies/decorative-lighting-wholesalers/india | secondary | 5 |
| https://developers.google.com/search/docs/appearance/structured-data/product | primary | 5 |
| https://www.bis.gov.in/scheme-x-certification/faq-scheme-x-certification/?lang=en | primary | 5 |
| https://docs.astro.build/en/guides/images/ | primary | 5 |

