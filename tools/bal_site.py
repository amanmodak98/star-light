#!/usr/bin/env python3
"""
Site-level scrape for beautyartlights.com: navigation tree, footer, contact
details, brand copy and the static informational pages.

Writes data/site.json and data/pages/*.md (raw text of each static page).

Standard library only. Run with `python3 -I tools/bal_site.py`.
"""

import os
import re
import json
import sys
import html as htmlmod

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bal_crawl as C  # shared fetch/parse helpers (same directory)

ROOT = C.ROOT
DATA = os.path.join(ROOT, "data")
PAGES = os.path.join(DATA, "pages")
BASE = C.BASE
os.makedirs(PAGES, exist_ok=True)

STATIC = [
    ("/", "home"),
    ("/pages/about-us", "about-us"),
    ("/pages/contact-us", "contact-us"),
    ("/raise-an-issue", "raise-an-issue"),
]


def nav_tree(page):
    """Parse the header <ul class='mmenu'> into a nested tree."""
    i = page.find('<ul class="mmenu')
    if i < 0:
        return []
    seg = page[i:i + 12000]
    # cut at the closing of the top-level ul
    depth = 0
    end = len(seg)
    for m in re.finditer(r"<ul\b|</ul>", seg):
        if m.group(0) == "<ul":
            depth += 1
        else:
            depth -= 1
            if depth == 0:
                end = m.start()
                break
    seg = seg[:end]

    def walk(block):
        out = []
        for li in re.findall(r"(?is)<li[^>]*>(.*?)</li>", block):
            a = re.search(r'(?is)<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', li)
            if not a:
                continue
            label = C.clean_ws(C.strip_tags(a.group(2)))
            href = a.group(1).strip()
            if not label:
                continue
            sub = re.search(r'(?is)<ul[^>]*>(.*)</ul>\s*$', li)
            children = walk(sub.group(1)) if sub else []
            out.append({
                "label": label,
                "href": href,
                "path": href.replace(BASE, "") if href.startswith(BASE) else href,
                "children": children,
            })
        return out

    return walk(seg)


def footer_text(page):
    i = page.find("<footer")
    if i < 0:
        return ""
    seg = page[i:]
    seg = re.sub(r"(?is)<script.*?</script>", "", seg)
    seg = re.sub(r"(?is)<style.*?</style>", "", seg)
    return C.strip_tags(seg)


def contact_details(page):
    text = C.strip_tags(re.sub(r"(?is)<script.*?</script>", "", page))
    emails = sorted(set(re.findall(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)))
    phones = sorted(set(re.findall(
        r"(?:(?:\+|00)91[\s\-]?)?(?:\(?0?\d{2,4}\)?[\s\-]?)?\d{3,5}[\s\-]?\d{5,6}", text)))
    return {"emails": emails, "phones": phones}


def social_links(page):
    out = {}
    for m in re.finditer(r'(?is)<a[^>]*href="(https?://[^"]*(?:facebook|instagram|twitter|linkedin|youtube|pinterest|whatsapp)[^"]*)"[^>]*', page):
        out.setdefault(m.group(1), 0)
        out[m.group(1)] += 1
    return sorted(out)


def main():
    site = {"base_url": BASE, "pages": {}}

    for path, slug in STATIC:
        page = C.fetch(BASE + path)
        body = page[page.find("<body"):] if "<body" in page else page
        body = re.sub(r"(?is)<script.*?</script>", "", body)
        body = re.sub(r"(?is)<style.*?</style>", "", body)
        content = body[body.find('page-content'):] if 'page-content' in body else body
        content = re.split(r"(?i)<footer", content)[0]
        text = C.strip_tags(content)
        title_m = re.search(r"(?is)<title>(.*?)</title>", page)
        desc_m = re.search(r'(?is)<meta[^>]+name="description"[^>]+content="([^"]*)"', page)
        site["pages"][slug] = {
            "path": path,
            "title": C.clean_ws(C.strip_tags(title_m.group(1))) if title_m else None,
            "meta_description": desc_m.group(1) if desc_m else None,
            "text": text,
            "images": sorted(set(re.findall(
                r'https://beautyartlights\.com/(?:media|front)/[\w./\-]+?\.(?:png|jpg|jpeg|gif|webp|svg)',
                page))),
        }
        with open(os.path.join(PAGES, f"{slug}.md"), "w", encoding="utf-8") as fh:
            fh.write(f"# {site['pages'][slug]['title'] or slug}\n\n")
            fh.write(f"Source: {BASE}{path}\n\n")
            if site["pages"][slug]["meta_description"]:
                fh.write(f"Meta description: {site['pages'][slug]['meta_description']}\n\n")
            fh.write("---\n\n")
            fh.write(text + "\n")
        print(f"  page {slug}: {len(text)} chars")

    home = C.fetch(BASE + "/")
    site["navigation"] = nav_tree(home)
    site["footer_text"] = footer_text(home)
    site["contact"] = contact_details(C.fetch(BASE + "/pages/contact-us"))
    site["social_links"] = social_links(home)

    # whatsapp / phone embedded in scripts
    wa = re.findall(r'whatsapp:\s*"([^"]+)"', home)
    site["whatsapp"] = wa[0] if wa else None

    # brand / seo signals
    site["brand"] = {
        "name": "Beauty Art Lights",
        "tagline": "Beauty Art Lights Bulk",
        "copyright": (re.search(r"©\s*(\d{4})\s*copyright", home).group(1)
                      if re.search(r"©\s*(\d{4})\s*copyright", home) else None),
        "footer_brand": (re.search(r'footer-copyright[^>]*>(.*?)</div>', home, re.S)
                         and C.clean_ws(C.strip_tags(re.search(
                             r'footer-copyright[^>]*>(.*?)</div>', home, re.S).group(1)))),
    }
    site["fonts"] = sorted(set(re.findall(
        r'fonts\.googleapis\.com/css2\?([^"\']+)', home)))
    site["all_internal_pages"] = sorted(set(
        p.replace(BASE, "") for p in re.findall(
            r'href="(https://beautyartlights\.com/(?:pages|cart|checkout|login|registration|raise-an-issue)[^"#]*)"',
            home)))
    site["all_categories_linked"] = sorted(set(
        p.replace(BASE, "") for p in re.findall(
            r'href="(https://beautyartlights\.com/category/[^"#]*)"', home)))

    with open(os.path.join(DATA, "site.json"), "w", encoding="utf-8") as fh:
        json.dump(site, fh, indent=2, ensure_ascii=False)

    print("\nNavigation:")
    for n in site["navigation"]:
        print(f"  {n['label']:14s} {n['path']}")
        for c in n["children"]:
            print(f"      - {c['label']:18s} {c['path']}")
    print("\ncontact:", site["contact"])
    print("whatsapp:", site["whatsapp"])
    print("wrote data/site.json + data/pages/*.md")


if __name__ == "__main__":
    main()
