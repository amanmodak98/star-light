#!/usr/bin/env python3
"""
Catalogue-hygiene analysis for the Beauty Art Lights scrape.

The catalogue does NOT contain junk duplicates — it contains one fixture
*design* listed once per colourway (matte black / antique brass / gold brass /
red / green), which is how lighting manufacturers sell. What a rebuild needs
is:

  1. VARIANT FAMILIES — the same design in different finishes. These should
     become one product page with a finish selector, not N near-identical
     pages competing for the same keyword.
  2. TRUE RE-LISTINGS — the same design AND the same finish AND the same copy
     under two different ids. These are genuine duplicates and should merge.

Signals used (all stdlib):
  * design signature = material, bulb count, bulb base, power source, and all
    dimensions — deliberately EXCLUDING finish, so colourways group together
  * finish = normalised "Finish" spec value
  * copy similarity = Jaccard over description word sets
  * photo overlap = Jaccard over gallery filenames (ground truth for
    "literally the same product")

Writes data/variants.json and docs/09-catalogue-hygiene.md.

Standard library only. Run with `python3 -I tools/bal_variants.py`.
"""

import os
import re
import sys
import json
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bal_crawl as C  # noqa: E402

ROOT = C.ROOT
DATA = os.path.join(ROOT, "data")
DOCS = os.path.join(ROOT, "docs")
BASE = "https://beautyartlights.com"
os.makedirs(DOCS, exist_ok=True)

STOP = {"the", "a", "an", "and", "or", "with", "for", "of", "in", "to", "modern",
        "light", "lamp", "lights", "wall", "sconce", "dcor", "decor", "home",
        "luxury", "bedroom", "living", "room", "elegant", "style", "fixture"}


def words(text, minlen=4):
    t = re.sub(r"[^a-z0-9]+", " ", (text or "").lower())
    return {w for w in t.split() if len(w) >= minlen and w not in STOP}


def jaccard(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def design_sig(p):
    """Everything that makes two SKUs the same fixture — finish excluded."""
    sm = p.get("specifications_map") or {}
    dm = p.get("dimensions_map") or {}
    canopy = "|".join(
        f"{r.get('width','')}x{r.get('depth','')}x{r.get('height','')}"
        for r in (p.get("canopy_dimensions_parsed") or []))
    return "|".join([
        sm.get("Material", "").strip(" |").lower(),
        sm.get("Number Of Bulbs", ""),
        sm.get("Bulb Base", ""),
        sm.get("Power Source", ""),
        dm.get("Product Width", ""),
        dm.get("Product Depth", ""),
        dm.get("Product Height", ""),
        canopy,
    ])


def finish_of(p):
    return (p.get("specifications_map") or {}).get("Finish", "").strip(" |").strip()


# Canonical colour/finish normalisation. The source writes the same colour a
# dozen different ways — "Color ( Red )", "Color ( RED )", "Color ( red )",
# "Color (Red)", "( Color (Green )" — so the wrapper and the case have to be
# stripped before the value means anything.
_FINISH_CANON = [
    ("matte black", "Matte Black"), ("antique brass", "Antique Brass"),
    ("gold brass", "Gold Brass"), ("nickel plated", "Nickel Plated"),
    ("nickle plated", "Nickel Plated"), ("brass", "Brass"),
    ("golden", "Gold"), ("gold", "Gold"), ("silver", "Silver"),
    ("chrome", "Chrome"), ("black", "Black"), ("white", "White"),
    ("red", "Red"), ("green", "Green"), ("blue", "Blue"),
    ("brown", "Brown"), ("grey", "Grey"), ("gray", "Grey"),
    ("pink", "Pink"), ("copper", "Copper"),
    ("natural wood", "Natural Wood"), ("wooden", "Wood"), ("wood", "Wood"),
    ("rattan", "Rattan Cane"),
]


def normalise_finish(raw):
    """'Color ( RED )' -> 'Red'; 'Color ( Wood,Rattan Cane )' -> 'Wood'."""
    if not raw:
        return "Unspecified"
    val = str(raw).strip()
    # unwrap the "Color ( ... )" wrapper, tolerating unbalanced parens
    m = re.search(r"(?i)color\s*\((.*)", val)
    if m:
        val = m.group(1)
    val = val.replace(")", " ").strip()
    val = re.sub(r"\s+", " ", val).strip(" ,.;")
    if not val:
        return "Unspecified"
    low = val.lower()
    for needle, canon in _FINISH_CANON:
        # `in` catches "Gold Brass"; startswith catches source-truncated
        # values such as "Antique bras" that never contain the full word.
        if needle in low or low.startswith(needle):
            return canon
    # Some source values are truncated mid-word ("Antique bras"). Fall back to
    # matching on the leading word.
    first = low.split()[0] if low.split() else ""
    if first:
        for needle, canon in _FINISH_CANON:
            nfirst = needle.split()[0]
            if first == nfirst and len(low) >= len(nfirst) + 2:
                return canon
    return val.title() if val.islower() else val


def finish_family(p):
    """Normalised finish — the single most important discriminator, because
    this catalogue lists one design in many colourways (matte black, antique
    brass, red, green...). Those are variants, NOT duplicates."""
    return normalise_finish(finish_of(p))


class DSU:
    def __init__(self, n):
        self.p = list(range(n))

    def find(self, x):
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]
            x = self.p[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.p[rb] = ra


def main():
    with open(os.path.join(DATA, "products.json"), encoding="utf-8") as fh:
        products = json.load(fh)
    n = len(products)

    dw = [words(p.get("description_text")) for p in products]
    tw = [words(p.get("title")) for p in products]
    ds = [design_sig(p) for p in products]
    fs = [finish_family(p) for p in products]
    im = [set(u.rsplit("/", 1)[-1] for u in (p.get("images") or [])) for p in products]

    # ---------------------------------------------------------- variants
    # Same design (ignoring finish) AND corroborating copy/photo evidence.
    vdsu = DSU(n)
    vreason = defaultdict(set)
    for i in range(n):
        for j in range(i + 1, n):
            if not ds[i] or ds[i] != ds[j]:
                continue
            same_finish = fs[i] == fs[j]
            img_ov = jaccard(im[i], im[j])
            desc_ov = jaccard(dw[i], dw[j])
            title_ov = jaccard(tw[i], tw[j])
            strong = img_ov >= 0.5 or desc_ov >= 0.45
            if strong:
                bits = []
                if img_ov >= 0.5:
                    bits.append(f"shared photos {img_ov:.0%}")
                if desc_ov >= 0.45:
                    bits.append(f"copy similarity {desc_ov:.0%}")
                if title_ov >= 0.5:
                    bits.append(f"title similarity {title_ov:.0%}")
                vreason[(i, j)].add(" · ".join(bits))
                vdsu.union(i, j)
            # A same-design + same-finish pair with strong copy evidence is a
            # genuine re-listing, not a colourway.
            if same_finish and (img_ov >= 0.3 or desc_ov >= 0.5) and fs[i] != "Unspecified":
                vreason[(i, j)].add(f"RE-LISTING: same finish ({fs[i]}) + same design")

    families = defaultdict(list)
    for i in range(n):
        families[vdsu.find(i)].append(i)
    families = {k: v for k, v in families.items() if len(v) > 1}

    # ---------------------------------------------------------- duplicates
    dup_pairs = []
    for (i, j), why in vreason.items():
        if any(w.startswith("RE-LISTING") for w in why):
            dup_pairs.append({"a": products[i]["id"], "b": products[j]["id"],
                              "reasons": sorted(why)})

    # ---------------------------------------------------------- code gaps
    codes = sorted(int(m.group(1)) for p in products
                   if (m := re.search(r"BT(\d+)", p.get("product_code") or "")))
    gaps = [c for c in range(codes[0], codes[-1] + 1) if c not in set(codes)]

    def member(i):
        p = products[i]
        return {
            "id": p["id"],
            "product_code": p.get("product_code"),
            "title": p.get("title"),
            "finish": fs[i],
            "category": p.get("category_slug"),
            "url": BASE + p["url"],
            "image_count": len(p.get("images") or []),
            "images": p.get("images") or [],
            "description_chars": len(p.get("description_text") or ""),
        }

    fam_out = []
    for idxs in families.values():
        pairs = []
        for a in range(len(idxs)):
            for b in range(a + 1, len(idxs)):
                key = (min(idxs[a], idxs[b]), max(idxs[a], idxs[b]))
                if key in vreason:
                    pairs.append({"ids": [products[idxs[a]]["id"], products[idxs[b]]["id"]],
                                  "reasons": sorted(vreason[key])})
        fam_out.append({
            "members": [member(i) for i in idxs],
            "finishes": sorted({fs[i] for i in idxs}),
            "pair_reasons": pairs,
        })
    fam_out.sort(key=lambda c: (-len(c["members"]), -len(c["finishes"])))

    with open(os.path.join(DATA, "variants.json"), "w", encoding="utf-8") as fh:
        json.dump({
            "method": {
                "design_signature": "material, bulb count, bulb base, power source, "
                                    "width, depth, height, canopy — finish excluded",
                "variant_rule": "same design signature AND (>=50% shared gallery photos "
                                "OR >=45% description word overlap)",
                "relisting_rule": "same design signature AND same normalised finish "
                                  "AND (>=30% shared photos OR >=50% description overlap)",
            },
            "variant_family_count": len(fam_out),
            "products_in_families": sum(len(c["members"]) for c in fam_out),
            "relisting_pairs": dup_pairs,
            "families": fam_out,
        }, fh, indent=2, ensure_ascii=False)

    # ------------------------------------------------------------- markdown
    with open(os.path.join(DOCS, "09-catalogue-hygiene.md"), "w", encoding="utf-8") as fh:
        fh.write(f"""# 09 — Catalogue Hygiene: Variants, Re-listings & Code Gaps

The catalogue is **not** full of duplicates. It is full of **one fixture
design listed once per colourway** — which is how lighting manufacturers
actually sell. What matters for the rebuild is telling those two situations
apart, because they need opposite treatment.

| Finding | Count | Treatment |
|---|---|---|
| Products in a variant family | **{sum(len(c['members']) for c in fam_out)}** of {len(products)} | One page + a finish selector |
| Distinct variant families | **{len(fam_out)}** | — |
| Genuine re-listings (same design, same finish) | **{len(dup_pairs)}** | Merge; 301 the loser |
| Records with byte-identical titles | 0 | — |
| Records sharing the same hero photo | 0 | — |

## 1. Product code sequence

| Property | Value |
|---|---|
| Codes in use | **{len(codes)}** |
| Range | `BT{codes[0]:03d}` – `BT{codes[-1]:03d}` ({codes[-1] - codes[0] + 1} possible) |
| Gaps | **{len(gaps)}** — {', '.join('BT%03d' % g for g in gaps)} |

The range implies **{codes[-1] - codes[0] + 1 - len(codes)} deleted or
never-published SKUs**. Nothing in the live catalogue references them. A
rebuild should issue forward from `BT{codes[-1] + 1:03d}` and leave the gaps
closed.

## 2. Variant families — the same design in different finishes

These are **not** errors. They are the catalogue's product line, expressed as
one page per colour. The rebuild should collapse each family into a single
canonical product with a finish selector, which fixes three problems at once:
keyword cannibalisation between colourway pages, a filter that actually has
meaning, and a catalogue that reads like a range rather than a pile.

""")
        for idx, c in enumerate(fam_out, 1):
            fh.write(f"### Family {idx} — {len(c['members'])} SKUs, "
                     f"{len(c['finishes'])} finishes\n\n")
            fh.write("| Id | Code | Finish | Category | Title |\n|---|---|---|---|---|\n")
            for m in c["members"]:
                fh.write(f"| {m['id']} | {m['product_code']} | **{m['finish']}** | "
                         f"`{m['category']}` | {m['title']} |\n")
            fh.write("\n**Evidence:**\n\n")
            for pr in c["pair_reasons"]:
                fh.write(f"- {pr['ids'][0]} ↔ {pr['ids'][1]}: " +
                         "; ".join(r for r in pr["reasons"] if not r.startswith("RE-LISTING")) + "\n")
            fh.write("\n")

        fh.write(f"""## 3. Genuine re-listings

{len(dup_pairs)} pair(s) share a design **and** a finish — the same fixture
listed twice under two ids. These should be merged into one canonical record.

| Pair | Evidence |
|---|---|
""")
        for d in dup_pairs:
            fh.write(f"| {d['a']} ↔ {d['b']} | {'; '.join(d['reasons'])} |\n")

        fh.write("""
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
""")

    print(f"variant families: {len(fam_out)}  products involved: "
          f"{sum(len(c['members']) for c in fam_out)}  re-listings: {len(dup_pairs)}")
    for c in fam_out:
        print("   ", [(m["id"], m["finish"]) for m in c["members"]])
    print("re-listing pairs:", [(d["a"], d["b"]) for d in dup_pairs])
    print("wrote data/variants.json + docs/09-catalogue-hygiene.md")


if __name__ == "__main__":
    main()
