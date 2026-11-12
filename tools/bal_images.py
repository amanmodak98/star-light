#!/usr/bin/env python3
"""
Download every image referenced by the scraped catalogue.

  products/  -> gallery images for each product (media/product/*)
  site/      -> logo, hero banners, category promos, favicons (media/settings|banner|image, front/*)
  other/     -> misc placeholders (no-img.jpg, freeshp.png)

Also records intrinsic pixel dimensions (parsed from file headers) and writes
data/images.json as a manifest.

Standard library only. Run with `python3 -I tools/bal_images.py`.
"""

import os
import re
import json
import struct
import hashlib
import threading
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
IMGDIR = os.path.join(ROOT, "assets", "images")
BASE = "https://beautyartlights.com"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

for d in ("products", "site", "other"):
    os.makedirs(os.path.join(IMGDIR, d), exist_ok=True)

_lock = threading.Lock()
_stats = {"ok": 0, "fail": 0, "bytes": 0}


def log(*a):
    with _lock:
        print(*a, flush=True)


# --------------------------------------------------------------------------
# image dimension sniffing (no third-party deps)
# --------------------------------------------------------------------------

def image_size(path):
    """Return (width, height) by sniffing the file header, or (None, None)."""
    try:
        with open(path, "rb") as fh:
            head = fh.read(32)
            if len(head) < 16:
                return None, None
            # PNG
            if head[:8] == b"\x89PNG\r\n\x1a\n":
                w, h = struct.unpack(">II", head[16:24])
                return w, h
            # GIF
            if head[:6] in (b"GIF87a", b"GIF89a"):
                w, h = struct.unpack("<HH", head[6:10])
                return w, h
            # WEBP
            if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
                chunk = head[12:16]
                if chunk == b"VP8X":
                    w = int.from_bytes(head[24:27], "little") + 1
                    h = int.from_bytes(head[27:30], "little") + 1
                    return w, h
                if chunk == b"VP8 ":
                    w = int.from_bytes(head[26:28], "little") & 0x3FFF
                    h = int.from_bytes(head[28:30], "little") & 0x3FFF
                    return w, h
                if chunk == b"VP8L":
                    b = head[21:25]
                    bits = int.from_bytes(b, "little")
                    w = (bits & 0x3FFF) + 1
                    h = ((bits >> 14) & 0x3FFF) + 1
                    return w, h
                return None, None
            # JPEG
            if head[:2] == b"\xff\xd8":
                fh.seek(2)
                while True:
                    marker = fh.read(2)
                    if len(marker) < 2:
                        break
                    if marker[0] != 0xFF:
                        break
                    size = struct.unpack(">H", fh.read(2))[0]
                    if 0xC0 <= marker[1] <= 0xCF and marker[1] not in (0xC4, 0xC8, 0xCC):
                        fh.read(1)
                        h, w = struct.unpack(">HH", fh.read(4))
                        return w, h
                    fh.seek(size - 2, 1)
                return None, None
    except Exception:  # noqa: BLE001
        return None, None
    return None, None


def download(url, subdir):
    """Download url into assets/images/<subdir>/. Returns a manifest entry."""
    fname = url.rstrip("/").split("/")[-1].split("?")[0] or "index"
    safe = re.sub(r"[^A-Za-z0-9._-]+", "_", fname)
    dest = os.path.join(IMGDIR, subdir, safe)

    if not os.path.exists(dest):
        ok = False
        for attempt in range(3):
            try:
                req = urllib.request.Request(url, headers={
                    "User-Agent": UA,
                    "Referer": BASE + "/",
                    "Accept": "image/avif,image/webp,image/*,*/*;q=0.8",
                })
                with urllib.request.urlopen(req, timeout=60) as resp:
                    blob = resp.read()
                if len(blob) < 64:
                    raise RuntimeError("suspiciously small")
                with open(dest, "wb") as fh:
                    fh.write(blob)
                ok = True
                break
            except Exception:  # noqa: BLE001
                import time
                time.sleep(1.0 * (attempt + 1))
        if not ok:
            with _lock:
                _stats["fail"] += 1
            return {"url": url, "status": "failed", "local": None}

    size = os.path.getsize(dest)
    w, h = image_size(dest)
    with open(dest, "rb") as fh:
        digest = hashlib.sha1(fh.read()).hexdigest()
    with _lock:
        _stats["ok"] += 1
        _stats["bytes"] += size
    return {
        "url": url,
        "status": "ok",
        "local": os.path.relpath(dest, ROOT),
        "bytes": size,
        "width": w,
        "height": h,
        "sha1": digest,
    }


def main():
    with open(os.path.join(DATA, "products.json"), encoding="utf-8") as fh:
        products = json.load(fh)

    # ---- collect every image url ------------------------------------------
    product_imgs = {}          # url -> [product ids]
    for p in products:
        for u in p.get("images", []):
            product_imgs.setdefault(u, []).append(p["id"])
        if p.get("grid_image"):
            product_imgs.setdefault(p["grid_image"], []).append(p["id"])

    site_urls = {
        "https://beautyartlights.com/media/settings/1727265960.gif",  # logo
        "https://beautyartlights.com/freeshp.png",
        "https://beautyartlights.com/no-img.jpg",
        "https://beautyartlights.com/front/images/32x32.png",
        "https://beautyartlights.com/front/images/64x64.png",
    }
    # anything the crawler saw in media/banner, media/image, media/settings
    for p in products:
        for u in p.get("images", []):
            pass
    import glob
    for cached in glob.glob(os.path.join(ROOT, "_scrape", "raw", "pages", "*.html")):
        with open(cached, encoding="utf-8", errors="replace") as fh:
            page = fh.read()
        for u in re.findall(
                r'https://beautyartlights\.com/media/(?:banner|image|settings)/[\w.\-]+', page):
            site_urls.add(u)
        for u in re.findall(
                r'https://beautyartlights\.com/front/images/[\w.\-]+', page):
            site_urls.add(u)

    other_urls = set()
    for cached in glob.glob(os.path.join(ROOT, "_scrape", "raw", "*.html")):
        with open(cached, encoding="utf-8", errors="replace") as fh:
            page = fh.read()
        for u in re.findall(
                r'https://beautyartlights\.com/front/(?:img|images)/[\w.\-]+', page):
            other_urls.add(u)

    all_urls = [(u, "products") for u in sorted(product_imgs)]
    all_urls += [(u, "site") for u in sorted(site_urls)]
    all_urls += [(u, "other") for u in sorted(other_urls)]

    log(f"Downloading {len(all_urls)} images "
        f"({len(product_imgs)} product, {len(site_urls)} site, {len(other_urls)} other)")

    manifest = []
    with ThreadPoolExecutor(max_workers=10) as ex:
        futs = {ex.submit(download, u, sub): u for u, sub in all_urls}
        for i, fut in enumerate(futs, 1):
            entry = fut.result()
            if entry["status"] == "ok":
                entry["used_by_products"] = product_imgs.get(entry["url"], [])
            manifest.append(entry)
            if i % 50 == 0:
                log(f"   ...{i}/{len(all_urls)}")

    with open(os.path.join(DATA, "images.json"), "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, ensure_ascii=False)

    log(f"\nok={_stats['ok']} fail={_stats['fail']} "
        f"total={_stats['bytes']/1_048_576:.1f} MB")
    log("wrote data/images.json")


if __name__ == "__main__":
    main()
