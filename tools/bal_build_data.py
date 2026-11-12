#!/usr/bin/env python3
"""
Emit a single build-ready dataset: data/site-data.json.

Normalises the scraped records into the shape a catalogue front-end actually
consumes — short product names, flat spec maps, local image paths, facet
counts, category trees and variant groups — so the eventual build does not
have to re-derive any of it.

Stack-agnostic on purpose: this is plain JSON, usable from Astro, Next.js,
Eleventy, SvelteKit or a static generator of your choosing.

Standard library only. Run with `python3 -I tools/bal_build_data.py`.
"""

import os
import re
import sys
import json
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bal_crawl as C  # noqa: E402
import bal_variants as V  # noqa: E402

ROOT = C.ROOT
DATA = os.path.join(ROOT, "data")
BASE = "https://beautyartlights.com"

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
    "vertical-light1": "Vertical Wall Lights",
    "horizontal-light1": "Horizontal Wall Lights",
    "table-lamp": "Table Lamps",
    "floor-lamp": "Floor Lamps",
    "all-products-/bedroom-decor": "Bedroom Decor",
}

# words that carry no information in a title and should be dropped from the
# short name (the full keyword title stays in `title` for meta/SEO use)
TITLE_NOISE = {
    "dcor", "decor", "decoration", "home", "luxury", "designer", "elegant",
    "modern", "contemporary", "vintage", "retro", "industrial", "nordic",
    "minimalist", "minimal", "mid", "century", "classic", "statement",
    "art", "deco", "for", "the", "and", "with", "a", "an", "of", "in",
}


# The fixture noun for each category, and the shape words that appear in the
# source titles and genuinely distinguish one design from another.
FIXTURE_TYPES = {
    "wall-light": "Wall Sconce",
    "vertical-lights": "Wall Sconce",
    "horizontal-lights": "Wall Sconce",
    "floor-lamps": "Floor Lamp",
    "tripod-floor-lamps": "Floor Lamp",
    "table-lamps": "Table Lamp",
    "table-tripod-lamps": "Table Lamp",
    "hanging-lights": "Pendant Light",
    "chandelier-lights": "Chandelier",
    "mirror-lights": "Vanity Mirror",
    "wall-clocks": "Wall Clock",
}
SHAPES = ["teapot", "tripod", "cone", "spiral", "sputnik", "dome", "tier",
          "twisted", "mesh", "wave", "bell", "drum", "cage", "lantern"]

# The source's "Applicable Space" field is the SAME boilerplate string on all
# 237 products, with the pipe delimiters misplaced. Recover the intended room
# list by matching a vocabulary instead of splitting on the pipes.
ROOM_VOCAB = [
    "Living Room", "Bedroom", "Coffee Shop", "Nursery", "Decorative Baby Room",
    "Kitchen & dining", "Kitchen & Dining", "Office", "Entryway", "Hallway",
    "Dining Room", "Bathroom", "Study", "Lobby", "Restaurant", "Hotel",
    "Cafe", "Bar", "Balcony", "Porch",
]


def parse_spaces(raw):
    """Recover the room list from the source's malformed delimiter string."""
    if not raw:
        return []
    text = raw
    # drop any description text that leaked into the field
    text = re.split(r"\|\s*DISCRIPTIO", text)[0]
    found = []
    low = text.lower()
    for room in ROOM_VOCAB:
        if room.lower() in low:
            canon = {"kitchen & dining": "Kitchen & Dining",
                     "nursery": "Nursery",
                     "decorative baby room": "Nursery"}.get(room.lower(), room)
            if canon not in found:
                found.append(canon)
    return found


def clean_power(raw):
    if not raw:
        return "Unspecified"
    v = str(raw).strip()
    low = v.lower()
    if low.startswith("plug"):
        return "Plug-in"
    if low.startswith("hard"):
        return "Hardwired"
    return " / ".join(part.strip() for part in v.split("/") if part.strip()) or "Unspecified"


def short_title(p):
    """A clean, human product name, e.g. '5-Light Gold Brass Wall Sconce'.

    Built from the facts that actually distinguish the product — light count,
    shape, finish, fixture type — rather than from the marketplace keyword
    stack, which the rebuild keeps in `title` for meta keywords.
    """
    sm = p.get("specifications_map") or {}
    cat = p.get("category_slug") or ""
    fixture = FIXTURE_TYPES.get(cat, "")
    raw = p.get("title") or ""
    low = raw.lower()

    shape = next((s for s in SHAPES if s in low), "")

    bulbs = (sm.get("Number Of Bulbs") or "").strip()
    count = ""
    if bulbs.isdigit() and int(bulbs) > 1:
        count = f"{bulbs}-Light "
    elif re.search(r"\b(\d+)\s*[-\s]?light\b", low):
        m = re.search(r"\b(\d+)\s*[-\s]?light\b", low)
        if m and int(m.group(1)) > 1:
            count = f"{m.group(1)}-Light "

    finish = V.finish_family(p)
    parts = [count]
    if shape:
        parts.append(f"{shape.title()} ")
    if finish and finish != "Unspecified":
        parts.append(f"{finish} ")
    parts.append(fixture)

    name = "".join(parts).strip()
    name = re.sub(r"\s+", " ", name)

    # If the constructed name says nothing (no fixture type known), fall back
    # to the cleaned first segment of the source title.
    if len(name) < 4:
        head = raw.split(",")[0].strip()
        words = [w for w in re.findall(r"[A-Za-z0-9\"'-]+", head)
                 if w.lower() not in TITLE_NOISE]
        name = " ".join(words) or head

    # Guard against duplication, e.g. "Wall Sconce Wall Sconce".
    name = re.sub(r"\b(\w[\w-]*)\s+\1\b", r"\1", name, flags=re.I)
    return name


def facet_key(mapping, key):
    return (mapping or {}).get(key, "").strip(" |") or "Unspecified"


def main():
    with open(os.path.join(DATA, "products.json"), encoding="utf-8") as fh:
        products = json.load(fh)
    with open(os.path.join(DATA, "site.json"), encoding="utf-8") as fh:
        site = json.load(fh)
    with open(os.path.join(DATA, "images.json"), encoding="utf-8") as fh:
        images = json.load(fh)

    img_index = {i["url"]: i for i in images if i.get("status") == "ok"}

    # ------------------------------------------------------- variant groups
    with open(os.path.join(DATA, "variants.json"), encoding="utf-8") as fh:
        variants = json.load(fh)
    variant_of = {}
    variant_groups = []
    for idx, fam in enumerate(variants.get("families", []), 1):
        gid = f"vg{idx:02d}"
        ids = [m["id"] for m in fam["members"]]
        variant_groups.append({
            "id": gid,
            "label": short_title_of_ids(ids, products),
            "finishes": fam.get("finishes", []),
            "product_ids": ids,
            "categories": sorted({m["category"] for m in fam["members"]}),
        })
        for pid in ids:
            variant_of[pid] = gid

    # ------------------------------------------------------------ products
    # Many SKUs share a finish + fixture type ("3-Light Red Wall Sconce" is
    # not unique), so the SKU code is the only reliable discriminator. In a
    # wholesale catalogue the code IS the product identity — it must be
    # visible on the card, not hidden in the spec table.
    name_counts = Counter()
    for p in products:
        name_counts[short_title(p)] += 1

    out_products = []
    for p in products:
        sm = p.get("specifications_map") or {}
        dm = p.get("dimensions_map") or {}
        space = []
        for a in p.get("applicable_space") or []:
            for tok in parse_spaces(a.get("value", "")):
                if tok not in space:
                    space.append(tok)
        gallery = []
        for u in p.get("images") or []:
            rec = img_index.get(u, {})
            gallery.append({
                "url": u,
                "local": rec.get("local"),
                "width": rec.get("width"),
                "height": rec.get("height"),
                "bytes": rec.get("bytes"),
            })
        cat_slug = p.get("category_slug")
        sname = short_title(p)
        code = p.get("product_code")
        out_products.append({
            "id": p.get("id"),
            "code": code,
            "slug": p.get("slug"),
            "url": BASE + p.get("url", ""),
            "title": p.get("title"),
            "name": sname,
            # When the short name is shared by several SKUs, the SKU code is
            # the only reliable discriminator — and in wholesale trade it is
            # how a buyer quotes the item anyway. So the card shows both.
            "display_name": (sname if name_counts[sname] == 1
                             else f"{sname} · {code}"),
            "category": cat_slug,
            "category_label": CATEGORY_LABELS.get(cat_slug, cat_slug),
            "listed_in": p.get("listed_in") or [],
            "price": {
                "published": False,
                "display": "Enquire for bulk",
                "raw_source_value": p.get("price"),
            },
            "finish": V.finish_family(p),
            "colour": V.normalise_finish(sm.get("Finish")),
            "specs": {
                "material": facet_key(sm, "Material"),
                "power_source": clean_power(sm.get("Power Source")),
                "voltage": facet_key(sm, "Voltage"),
                "bulb_base": facet_key(sm, "Bulb Base"),
                "bulb_included": facet_key(sm, "Bulb Included"),
                "shade_included": facet_key(sm, "Shade Included"),
                "number_of_bulbs": facet_key(sm, "Number Of Bulbs"),
                "assembly_required": facet_key(sm, "Assembly Required"),
                "certification": facet_key(sm, "Certification"),
            },
            "dimensions": {
                "width": dm.get("Product Width", ""),
                "depth": dm.get("Product Depth", ""),
                "height": dm.get("Product Height", ""),
                "canopy": p.get("canopy_dimensions_parsed") or [],
            },
            "applicable_space": sorted(set(space)),
            "description": p.get("description_text") or "",
            "images": gallery,
            "image_count": len(gallery),
            "variant_group": variant_of.get(p.get("id")),
            "related_urls": p.get("related_product_urls") or [],
        })

    # ---------------------------------------------------------- categories
    by_cat = defaultdict(list)
    for p in out_products:
        by_cat[p["category"]].append(p["id"])
    cat_out = []
    for slug, ids in sorted(by_cat.items(), key=lambda kv: -len(kv[1])):
        cat_out.append({
            "slug": slug,
            "label": CATEGORY_LABELS.get(slug, slug),
            "product_count": len(ids),
            "product_ids": ids,
            "in_main_nav": slug in {
                "chandelier-lights", "floor-lamps", "hanging-lights",
                "horizontal-lights", "mirror-lights", "table-lamps",
                "table-tripod-lamps", "tripod-floor-lamps", "vertical-lights",
                "wall-clocks", "wall-light",
            },
        })

    # -------------------------------------------------------------- facets
    def count(field, getter):
        c = Counter()
        for p in out_products:
            v = getter(p)
            if isinstance(v, list):
                for x in v:
                    c[x] += 1
            else:
                c[v] += 1
        return [{"value": k, "count": v} for k, v in c.most_common()]

    facets = {
        "category": count("category", lambda p: p["category"]),
        "finish": count("finish", lambda p: p["finish"]),
        "colour": count("colour", lambda p: p["colour"]),
        "bulb_base": count("bulb_base", lambda p: p["specs"]["bulb_base"]),
        "power_source": count("power_source", lambda p: p["specs"]["power_source"]),
        "voltage": count("voltage", lambda p: p["specs"]["voltage"]),
        "number_of_bulbs": count("number_of_bulbs", lambda p: p["specs"]["number_of_bulbs"]),
        "material": count("material", lambda p: p["specs"]["material"]),
    }
    # Deliberately NOT facets:
    #  - certification: blank on all 229 products that carry the row (8 have no
    #    row at all) — there is no certification data on the source site.
    #  - applicable_space: the identical boilerplate string on all 237
    #    products — it carries no product-specific signal.
    facets["_excluded"] = {
        "certification": "blank on all 229 products that have the row; 8 have no row",
        "applicable_space": "identical boilerplate on all 237 products — no product-specific signal",
        "voltage": "single value (110-240V) — constant, kept in specs but not offered as a filter",
    }

    logo = next((i for i in images if "settings" in (i.get("url") or "")), None)
    out = {
        "meta": {
            "source_site": BASE,
            "product_count": len(out_products),
            "category_count": len(cat_out),
            "image_count": sum(i.get("bytes") is not None for i in images),
            "price_model": "enquiry",
            "generated_by": "tools/bal_build_data.py",
            "note": "Derived entirely from the scraped source site. No content "
                    "is invented; `name` is a mechanical shortening of `title`.",
        },
        "site": {
            "name": "Beauty Art Lights",
            "tagline": "Beauty Art Lights Bulk",
            "logo": logo.get("local") if logo else None,
            "logo_url": logo.get("url") if logo else None,
            "email": (site.get("contact", {}).get("emails") or [None])[0],
            "whatsapp": site.get("whatsapp"),
            "navigation": site.get("navigation", []),
            "social_links": site.get("social_links", []),
        },
        "categories": cat_out,
        "variant_groups": variant_groups,
        "facets": facets,
        "products": out_products,
    }

    path = os.path.join(DATA, "site-data.json")
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=2, ensure_ascii=False)

    print(f"wrote {os.path.relpath(path, ROOT)}")
    print(f"  products      : {len(out_products)}")
    print(f"  categories    : {len(cat_out)}")
    print(f"  variant groups: {len(variant_groups)}")
    print(f"  facet axes    : {len(facets)}")
    print(f"  file size     : {os.path.getsize(path)/1024:.0f} KB")
    print("\n  sample product:")
    print(json.dumps(out_products[0], indent=2)[:900])


def short_title_of_ids(ids, products):
    """Label a variant family from its members' short names."""
    byid = {p["id"]: p for p in products}
    names = []
    for i in ids:
        p = byid.get(i)
        if p:
            names.append(short_title(p))
    if not names:
        return "Variant"
    # strip the leading count+finish tokens that differ across colourways
    stripped = []
    for n in names:
        n2 = re.sub(r"^\d+-Light\s+", "", n)
        n2 = re.sub(r"^(Antique Brass|Gold Brass|Matte Black|Black|Brass|Gold|Red|Green|Blue|White|Silver|Chrome)\s+", "", n2, flags=re.I)
        stripped.append(n2)
    base = Counter(stripped).most_common(1)[0][0]
    return base or names[0]


if __name__ == "__main__":
    main()
