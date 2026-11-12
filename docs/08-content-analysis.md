# 08 — Content & Facet Analysis

Derived from the 237 scraped product records. This is the raw
material for the catalogue's **filter facets** and for the new site's
information architecture.

## Facet 1 — Category

| Value | Products |
|---|---|
| Wall Lights | 116 |
| Floor Lamps | 27 |
| Table Lamps | 25 |
| Chandelier Lights | 17 |
| Hanging / Pendant Lights | 15 |
| Vertical Wall Lights | 14 |
| Horizontal Wall Lights | 10 |
| Table Tripod Lamps | 3 |
| Vertical Wall Lights *(duplicate slug)* | 2 |
| Tripod Floor Lamps | 2 |
| Mirror Lights | 2 |
| Horizontal Wall Lights *(duplicate slug)* | 2 |
| Table Lamps *(singular slug)* | 1 |
| Floor Lamp (singular slug) | 1 |

## Facet 2 — Finish family

| Value | Products |
|---|---|
| Matte Black | 68 |
| Red | 53 |
| Gold Brass | 32 |
| Antique Brass | 32 |
| Green | 14 |
| White | 6 |
| Black | 6 |
| Gold | 6 |
| Blue | 3 |
| Brown | 3 |
| Wood | 3 |
| Brass | 3 |
| Unspecified | 3 |
| Silver | 2 |
| Natural Wood | 2 |
| Nickel Plated | 1 |

## Facet 4 — Bulb base

| Value | Products |
|---|---|
| E14 | 199 |
| E27 | 35 |
| Unspecified | 3 |

## Facet 5 — Power source

| Value | Products |
|---|---|
| Hardwired | 165 |
| Plug-in | 69 |
| Unspecified | 3 |

## Facet 6 — Voltage

| Value | Products |
|---|---|
| 110-240V | 234 |
| Unspecified | 3 |

## Facet 7 — Number of bulbs

| Value | Products |
|---|---|
| 1 | 89 |
| 3 | 57 |
| 2 | 38 |
| 5 | 26 |
| 4 | 8 |
| 8 | 6 |
| 6 | 4 |
| Unspecified | 3 |
| bulb is not include | 2 |
| 14 | 2 |
| 12 | 2 |

## Facet 8 — Material

| Value | Products |
|---|---|
| Steel, Aluminim, Brass | 228 |
| Unspecified | 3 |
| Steel, Aluminim, Wood | 2 |
| Natural wood, Aluminium | 2 |
| Metal, Wood | 1 |
| Metal,Wood, Steel,Aluminium, Brass | 1 |

## Fields deliberately NOT offered as filters

| Field | Why it is excluded |
|---|---|
| `certification` | blank on all 229 products that have the row; 8 have no row |
| `applicable_space` | identical boilerplate on all 237 products — no product-specific signal |
| `voltage` | single value (110-240V) — constant, kept in specs but not offered as a filter |


## Title analysis

| Metric | Value |
|---|---|
| Longest title | 267 chars |
| Shortest title | 105 chars |
| Average title | 146 chars |
| Titles over 120 chars | 236 |
| Titles containing a comma-separated keyword stack | 220 |

The titles are **Amazon/Etsy-style keyword stacks** rather than product names:

> "Gold Brass 5 Light Wall Sconce, Luxury Modern Wall Lamp with White Shades, Gold Wall Lighting, Elegant Bedroom and Living Room Light Décor."

That is workable for marketplace search but poor for a brand site: it repeats the
product type, buries the distinguishing attributes, and reads as spam. A rebuild
should keep a short **product name** ("5-Light Gold Brass Wall Sconce") and move
the keyword tail into a **subtitle / meta description**.

## Description analysis

| Metric | Value |
|---|---|
| Products with a description | 232 / 237 |
| Average length | 802 chars |
| Median-ish (min / max) | 367 / 1329 chars |

Common opening patterns (for a copywriter brief):

- `Add a bold…` — 23 products
- `Elevate your interior…` — 20 products
- `Enhance your interior…` — 16 products
- `Add timeless elegance…` — 13 products
- `Add a sophisticated…` — 10 products
- `Bring timeless elegance…` — 9 products
- `Make a bold…` — 8 products
- `Illuminate your space…` — 8 products
- `Add a touch…` — 7 products
- `Enhance your home…` — 6 products
- `Introducing our exquisite…` — 6 products
- `Bring a sophisticated…` — 4 products
