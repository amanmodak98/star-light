#!/usr/bin/env python3
"""
Beauty Art Lights (beautyartlights.com) — full catalogue crawler.

Crawls every category (with pagination) and every product detail page, then
writes normalised JSON to data/. Raw HTML is cached under _scrape/raw/pages/
so re-runs are cheap and the parse step is reproducible.

Standard library only. Run with `python3 -I tools/bal_crawl.py`.
"""

import os
import re
import json
import time
import hashlib
import html as htmlmod
import threading
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "_scrape", "raw", "pages")
DATA = os.path.join(ROOT, "data")
BASE = "https://beautyartlights.com"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

for d in (RAW, DATA):
    os.makedirs(d, exist_ok=True)

_print_lock = threading.Lock()


def log(*a):
    with _print_lock:
        print(*a, flush=True)


# --------------------------------------------------------------------------
# fetching
# --------------------------------------------------------------------------

def _cache_path(url):
    h = hashlib.sha1(url.encode("utf-8")).hexdigest()[:20]
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", url.replace(BASE, "").strip("/"))[:70]
    return os.path.join(RAW, f"{slug}__{h}.html")


def fetch(url, use_cache=True):
    """GET url, returning text. Cached on disk; retries on transient failure."""
    path = _cache_path(url)
    if use_cache and os.path.exists(path):
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            return fh.read()

    last = None
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": UA,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Connection": "close",
            })
            with urllib.request.urlopen(req, timeout=45) as resp:
                raw = resp.read()
            txt = raw.decode("utf-8", errors="replace")
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(txt)
            time.sleep(0.25)
            return txt
        except Exception as exc:  # noqa: BLE001 - retry on anything transient
            last = exc
            time.sleep(1.2 * (attempt + 1))
    raise RuntimeError(f"failed to fetch {url}: {last}")


# --------------------------------------------------------------------------
# html helpers
# --------------------------------------------------------------------------

def strip_tags(fragment):
    """HTML fragment -> plain text, preserving line breaks for <br>/<p>/<li>."""
    if not fragment:
        return ""
    s = re.sub(r"(?i)<\s*br\s*/?\s*>", "\n", fragment)
    s = re.sub(r"(?i)</\s*(p|div|li|h[1-6]|tr)\s*>", "\n", s)
    s = re.sub(r"<[^>]+>", "", s)
    s = htmlmod.unescape(s)
    s = s.replace("​", "").replace(" ", " ")
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in s.split("\n")]
    return "\n".join(ln for ln in lines if ln)


def clean_ws(text):
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


# Section headings the template uses, and the boilerplate blocks that end a
# section. A description may live in an <h2>, an <h3> or a <div>, so a section
# is delimited by these known labels rather than by "the next heading".
SECTION_LABELS = {
    "dimensions", "canopy dimensions", "specifications", "applicable space",
    "discription", "description", "you may also like",
}
STOP_LABELS = {
    "extra fast delivery", "best price", "guarantee", "about us",
    "all products", "contact us", "account details", "have a question?",
}


def find_section(page, heading):
    """Return raw HTML of the block following the heading whose *entire* text
    equals `heading`. Tag-agnostic (h1-h6) and exact-match, so 'DIMENSIONS'
    never matches 'CANOPY DIMENSIONS'.

    The block ends at the next *known* section/boilerplate label, so content
    headings inside the section (an <h3> or a long <h2> holding the actual
    description text) are kept.
    """
    target = heading.strip().lower()
    for m in re.finditer(r"(?is)<h([1-6])[^>]*>(.*?)</h\1>", page):
        txt = clean_ws(strip_tags(m.group(2))).lower().rstrip("*: ").strip()
        if txt != target:
            continue
        tail = page[m.end():]
        end = len(tail)
        for h in re.finditer(r"(?is)<h([1-6])[^>]*>(.*?)</h\1>", tail):
            htxt = clean_ws(strip_tags(h.group(2))).lower().rstrip("*: ").strip()
            if htxt in SECTION_LABELS or htxt in STOP_LABELS:
                end = h.start()
                break
        foot = tail.find("<footer")
        if 0 <= foot < end:
            end = foot
        return tail[:end]
    return ""


# The template's field labels are a closed vocabulary. Matching the longest
# known label as a prefix is far more reliable than guessing from inline
# styles, because the source sometimes splits a label across two <span>s
# ("Bulb B" + "ase") and sometimes wraps the *value* in a bold span too.
KNOWN_LABELS = [
    "Number Of Bulbs", "Assembly Required", "Power Source", "Bulb Included",
    "Bulb Base", "Shade Included", "Certification", "Material", "Finish",
    "Voltage", "Product Width", "Product Depth", "Product Height",
    "Product Length", "Product Weight", "Canopy Width", "Canopy Height",
    "Color", "Colour",
]
_KNOWN_SORTED = sorted(KNOWN_LABELS, key=len, reverse=True)


def split_label_value(text):
    """Split 'Voltage 110-240V' into ('Voltage', '110-240V') using the
    canonical label vocabulary. Returns (None, text) if nothing matches."""
    t = clean_ws(text)
    low = t.lower()
    for lab in _KNOWN_SORTED:
        ll = lab.lower()
        if low.startswith(ll):
            rest = t[len(lab):]
            if rest == "" or rest[0] in " :-–— \t" or rest[0].isdigit():
                return lab, clean_ws(rest.lstrip(" :- "))
    return None, t


def join_fragments(frags):
    """Join label fragments that were split by a source line-wrap.

    "Bulb B" + "ase" -> "Bulb Base"   (mid-word split, join directly)
    "Product" + "Width" -> "Product Width" (word split, re-insert a space)
    """
    out = ""
    for f in frags:
        f = clean_ws(f)
        if not f:
            continue
        if not out:
            out = f
            continue
        if out[-1].islower() and f[0].isupper():
            out += " " + f
        else:
            out += f
    return out


def parse_labeled_list(section):
    """Parse <li> blocks into [{"label": ..., "value": ...}]."""
    out = []
    for li in re.findall(r"(?is)<li[^>]*>(.*?)</li>", section):
        text = clean_ws(strip_tags(li))
        if not text:
            continue
        label, value = split_label_value(text)
        if label is None:
            # fall back to the bold-span heuristic
            labels = re.findall(
                r"(?is)<span[^>]*font-weight:\s*(?:bold|600|700)[^>]*>(.*?)</span>", li)
            label = join_fragments(strip_tags(f) for f in labels)
            rest = re.sub(
                r"(?is)<span[^>]*font-weight:\s*(?:bold|600|700)[^>]*>.*?</span>", "", li)
            value = clean_ws(strip_tags(rest))
        if label or value:
            out.append({"label": label, "value": value})
    return out


def parse_canopy(entries):
    """Turn canopy lines into structured {width, depth, height} per unit row."""
    out = []
    for e in entries:
        txt = e.get("value") or ""
        row = {}
        for m in re.finditer(r'(?i)(width|depth|height)\s*:\s*([^,|]+)', txt):
            row[m.group(1).lower()] = clean_ws(m.group(2))
        if row:
            out.append(row)
    return out


# --------------------------------------------------------------------------
# category parsing
# --------------------------------------------------------------------------

PROD_RE = re.compile(r"https://beautyartlights\.com/product/[^\"'\s]+")


def item_count(page):
    m = re.search(r'class="items-count"[^>]*>(.*?)ITEM', page, re.S)
    return int(clean_ws(strip_tags(m.group(1))).replace(",", "")) if m and clean_ws(
        strip_tags(m.group(1))).replace(",", "").isdigit() else None


def grid_products(page):
    """Extract (url, grid_image, grid_title) triples from a category listing."""
    out = []
    for block in re.findall(
            r'(?is)<div class="col-md-4">(.*?)</div>\s*</div>', page):
        links = re.findall(r'href="(https://beautyartlights\.com/product/[^"#]+)"', block)
        if not links:
            continue
        img = re.search(r'src="(https://beautyartlights\.com/media/product/[^"]+)"', block)
        title = re.search(r'(?is)<div class="product-title">(.*?)(?:</div>|$)', block)
        out.append({
            "url": links[0].replace(BASE, ""),
            "grid_image": img.group(1) if img else None,
            "grid_title": clean_ws(strip_tags(title.group(1))) if title else None,
        })
    return out


def crawl_category(cat_url):
    """Fetch every page of a category listing."""
    rel = cat_url.replace(BASE, "")
    page1 = fetch(cat_url)
    count = item_count(page1)
    products = list(grid_products(page1))
    seen = {p["url"] for p in products}

    page_no = 2
    while True:
        if count is not None and len(seen) >= count:
            break
        if page_no > 60:
            break
        nxt = fetch(f"{cat_url}?page={page_no}")
        got = grid_products(nxt)
        new = [g for g in got if g["url"] not in seen]
        if not new:
            break
        for g in new:
            seen.add(g["url"])
        products.extend(new)
        page_no += 1

    return {
        "category": rel,
        "url": cat_url,
        "declared_count": count,
        "crawled_count": len(products),
        "products": products,
    }


# --------------------------------------------------------------------------
# product parsing
# --------------------------------------------------------------------------

def parse_product(url, rel_url):
    page = fetch(BASE + rel_url)
    parts = [p for p in rel_url.split("/") if p]
    # /product/<cat...>/<id>/<slug>
    pid = parts[-2] if len(parts) >= 2 else None
    slug = parts[-1] if parts else None
    cat_path = "/".join(parts[1:-2]) if len(parts) > 3 else ""

    # title
    h1 = re.search(r"(?is)<h1[^>]*>(.*?)</h1>", page)
    title = clean_ws(strip_tags(h1.group(1))) if h1 else None
    if not title:
        bc = re.findall(r'(?is)<li><span>(.*?)</span></li>', page)
        title = clean_ws(strip_tags(bc[-1])) if bc else slug

    # product code
    code = None
    cm = re.search(r"Product Code:\s*([A-Za-z0-9\-_]+)", page)
    if cm:
        code = cm.group(1).strip()

    # gallery images (data-value appears twice: slide + thumb)
    gallery = []
    for v in re.findall(r'data-value="([^"]+)"', page):
        if v not in gallery:
            gallery.append(v)
    gallery_urls = [f"{BASE}/media/product/{v}" for v in gallery]

    # related products ("You may also like")
    rel_sec = find_section(page, "You may also like")
    related = []
    for u in re.findall(r"https://beautyartlights\.com/product/[^\"'\s#]+", rel_sec):
        if u not in related:
            related.append(u)

    # description -- the source uses three different layouts:
    #   (a) <div class="wt-content-toggle__body"> ... (Etsy paste)
    #   (b) a content-bearing <h3>
    #   (c) a content-bearing <h2>
    desc_html = ""
    sec = find_section(page, "DISCRIPTION") or find_section(page, "DESCRIPTION")
    if sec:
        idx = sec.find("order-0 order-md-100")
        body = sec[:idx] if idx > 0 else sec
        if clean_ws(strip_tags(body)):
            desc_html = body
    if not desc_html:
        # Etsy-style toggle block — but only within the main product column,
        # otherwise we would pick up a related product's description.
        main_end = page.find("You may also like")
        region = page[:main_end] if main_end > 0 else page
        dm = re.search(
            r'(?is)(<div[^>]*class="wt-content-toggle__body[^"]*"[^>]*>.*?</div>)', region)
        if dm:
            desc_html = dm.group(1)
    desc_text = strip_tags(desc_html)

    # specs / dimensions / applicable space
    dims = parse_labeled_list(find_section(page, "DIMENSIONS"))
    canopy = parse_labeled_list(find_section(page, "CANOPY DIMENSIONS"))
    specs = parse_labeled_list(find_section(page, "SPECIFICATIONS"))
    space = parse_labeled_list(find_section(page, "APPLICABLE SPACE"))
    if not space:
        ap = find_section(page, "APPLICABLE SPACE")
        txt = clean_ws(strip_tags(ap.split("</p>")[0])) if ap else ""
        space = [{"label": "Applicable Space", "value": txt}] if txt else []

    # flattened convenience maps
    dim_map = {d["label"]: d["value"] for d in dims if d["label"]}
    spec_map = {s["label"]: s["value"] for s in specs if s["label"]}

    # price
    price = None
    pm = re.search(r'(?is)<div class="prd-price">(.*?)</div>\s*</div>', page)
    if pm:
        price = clean_ws(strip_tags(pm.group(1)))
    if not price:
        pm2 = re.search(r'(?is)class="price-new"[^>]*>(.*?)</div>', page)
        price = clean_ws(strip_tags(pm2.group(1))) if pm2 else None

    # breadcrumbs
    crumbs = [clean_ws(strip_tags(c)) for c in
              re.findall(r'(?is)<li>\s*<a[^>]*>(.*?)</a>', page)]

    return {
        "id": pid,
        "slug": slug,
        "url": rel_url,
        "title": title,
        "product_code": code,
        "category_path": cat_path,
        "category_slug": cat_path.split("/")[-1] if cat_path else None,
        "breadcrumbs": crumbs,
        "price": price,
        "description_text": desc_text,
        "description_html": desc_html,
        "images": gallery_urls,
        "image_count": len(gallery_urls),
        "related_product_urls": related,
        "dimensions": dims,
        "dimensions_map": dim_map,
        "canopy_dimensions": canopy,
        "canopy_dimensions_parsed": parse_canopy(canopy),
        "specifications": specs,
        "specifications_map": spec_map,
        "applicable_space": space,
    }


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------

def main():
    # 1. discover category links from the homepage + the known tree
    home = fetch(BASE + "/")
    cat_links = set()
    for u in re.findall(r'href="(https://beautyartlights\.com/category/[^"#]+)"', home):
        cat_links.add(u.replace(BASE, ""))
    for u in re.findall(r'href="(/category/[^"#]+)"', home):
        cat_links.add(u)

    # drop the top-level aggregators that duplicate a subcategory listing
    cat_links.discard("/category/all-lighting/categories")

    log(f"Discovered {len(cat_links)} category links from homepage")
    for c in sorted(cat_links):
        log("   ", c)

    # 2. crawl each category
    results = []
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = {ex.submit(crawl_category, BASE + c): c for c in sorted(cat_links)}
        for fut, c in futs.items():
            try:
                r = fut.result()
            except Exception as exc:  # noqa: BLE001
                log(f"  !! category failed {c}: {exc}")
                continue
            results.append(r)
            log(f"  cat {r['category']}: declared={r['declared_count']} "
                f"crawled={r['crawled_count']}")

    with open(os.path.join(DATA, "categories.json"), "w", encoding="utf-8") as fh:
        json.dump(results, fh, indent=2, ensure_ascii=False)

    # 3. union of all product URLs
    all_products = {}
    for r in results:
        for p in r["products"]:
            all_products.setdefault(p["url"], {
                "url": p["url"],
                "grid_image": p["grid_image"],
                "grid_title": p["grid_title"],
                "categories": [],
            })
            if r["category"] not in all_products[p["url"]]["categories"]:
                all_products[p["url"]]["categories"].append(r["category"])

    # 4. fetch + parse every product page
    log(f"\nFetching {len(all_products)} product pages...")
    parsed = {}
    done = [0]
    lock = threading.Lock()

    def work(item):
        url, meta = item
        try:
            p = parse_product(url, url)
            p["listed_in"] = meta["categories"]
            p["grid_image"] = meta["grid_image"]
            p["grid_title"] = meta["grid_title"]
            with lock:
                done[0] += 1
                if done[0] % 20 == 0:
                    log(f"   ...{done[0]}/{len(all_products)}")
            return p
        except Exception as exc:  # noqa: BLE001
            log(f"  !! product failed {url}: {exc}")
            return None

    with ThreadPoolExecutor(max_workers=8) as ex:
        for p in ex.map(work, list(all_products.items())):
            if p:
                parsed[p["url"]] = p

    products = list(parsed.values())
    with open(os.path.join(DATA, "products.json"), "w", encoding="utf-8") as fh:
        json.dump(products, fh, indent=2, ensure_ascii=False)

    log(f"\nWrote {len(products)} products -> data/products.json")
    log(f"Wrote {len(results)} categories -> data/categories.json")

    # quick integrity report
    missing_title = [p["url"] for p in products if not p.get("title")]
    missing_img = [p["url"] for p in products if not p.get("images")]
    missing_desc = [p["url"] for p in products if not p.get("description_text")]
    log(f"  missing title : {len(missing_title)}")
    log(f"  missing images: {len(missing_img)}")
    log(f"  missing desc  : {len(missing_desc)}")
    for u in missing_desc[:10]:
        log(f"      no-desc: {u}")
    for u in missing_img[:10]:
        log(f"      no-img : {u}")


if __name__ == "__main__":
    main()
