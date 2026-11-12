/**
 * gen-redirects.mjs — map every URL the source site ever published onto its new home.
 *
 * The source has no sitemap, no redirect rules and no canonical discipline, so every
 * product URL, category URL and static page URL currently in an index is a live 200.
 * This script produces the full map:
 *
 *   /product/all-lighting/categories/wall-light/290/<slug>  →  /products/<design>/?sku=BT001
 *   /category/all-lighting/categories/wall-light             →  /catalogue/wall-lights/
 *   /pages/about-us                                         →  /about/
 *
 * The one genuine re-listing (BT207, a second listing of BT205) is folded into BT205.
 *
 * Output is written twice: as `src/data/redirects.json` for `next.config.ts`, and as
 * `public/_redirects` for Netlify and Cloudflare Pages, so the map applies whether the
 * site is served by Next.js or by a plain static host.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, '..');
const REPO = join(SITE, '..');

const catalogue = JSON.parse(readFileSync(join(SITE, 'src', 'data', 'catalogue.json'), 'utf8'));
const rawProducts = JSON.parse(readFileSync(join(REPO, 'data', 'products.json'), 'utf8'));

const byId = new Map();
for (const d of catalogue.designs) {
  for (const f of d.finishes) byId.set(f.id, { design: d, finish: f });
}

const redirects = [];
const seen = new Set();

function add(from, to, permanent = true) {
  if (!from || seen.has(from)) return;
  seen.add(from);
  redirects.push({ source: from, destination: to, permanent });
}

/* ── product URLs ──────────────────────────────────────────────────────────── */

for (const p of rawProducts) {
  const target = byId.get(p.id);
  if (!target) {
    // The one re-listing that was folded away.
    if (p.id === '512') add(p.url, `/products/${byId.get('510').design.slug}/?sku=${byId.get('510').finish.sku}`);
    continue;
  }
  add(p.url, `/products/${target.design.slug}/?sku=${target.finish.sku}`);
}

/* ── category URLs ─────────────────────────────────────────────────────────── */

const CATEGORY_SOURCE_SLUGS = {
  'wall-light': 'wall-light',
  'vertical-lights': 'vertical-lights',
  'horizontal-lights': 'horizontal-lights',
  'floor-lamps': 'floor-lamps',
  'tripod-floor-lamps': 'tripod-floor-lamps',
  'table-lamps': 'table-lamps',
  'table-tripod-lamps': 'table-tripod-lamps',
  'hanging-lights': 'hanging-lights',
  'chandelier-lights': 'chandelier-lights',
  'mirror-lights': 'mirror-lights',
};

for (const cat of catalogue.categories) {
  add(`/category/all-lighting/categories/${cat.sourceSlug}`, `/catalogue/${cat.slug}/`);
}

// The source's four duplicate slugs, and its empty categories.
for (const dup of ['vertical-light1', 'horizontal-light1', 'table-lamp', 'floor-lamp']) {
  const merged = { 'vertical-light1': 'vertical-lights', 'horizontal-light1': 'horizontal-lights', 'table-lamp': 'table-lamps', 'floor-lamp': 'floor-lamps' }[dup];
  const cat = catalogue.categories.find((c) => c.sourceSlug === merged);
  if (cat) add(`/category/all-lighting/categories/${dup}`, `/catalogue/${cat.slug}/`);
}

for (const empty of ['wall-clocks', 'all-products-/bedroom-decor']) {
  add(`/category/all-lighting/categories/${empty}`, '/catalogue/');
}
add('/category/all-lighting/categories/all-products-/bedroom-decor/floor-lamp', '/catalogue/floor-lamps/');
add('/category/all-lighting/categories', '/catalogue/');
add('/category/all-lighting', '/catalogue/');

/* ── static pages ──────────────────────────────────────────────────────────── */

add('/pages/about-us', '/about/');
add('/pages/contact-us', '/contact/');
add('/raise-an-issue', '/contact/');
add('/cart', '/catalogue/');
add('/checkout', '/catalogue/');
add('/login', '/contact/');
add('/registration', '/contact/');

/* ── write ─────────────────────────────────────────────────────────────────── */

writeFileSync(join(SITE, 'src', 'data', 'redirects.json'), JSON.stringify(redirects));

const netlify = redirects
  .map((r) => `${r.source}  ${r.destination}  ${r.permanent ? 301 : 302}`)
  .join('\n');
writeFileSync(join(SITE, 'public', '_redirects'), netlify + '\n');

// Vercel reads vercel.json rather than _redirects.
const vercel = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  trailingSlash: true,
  cleanUrls: false,
  redirects: redirects.map((r) => ({
    source: r.source,
    destination: r.destination,
    permanent: r.permanent,
  })),
};
writeFileSync(join(SITE, 'vercel.json'), JSON.stringify(vercel, null, 2) + '\n');

console.log(`gen-redirects — ${redirects.length} redirects`);
console.log(`  src/data/redirects.json`);
console.log(`  public/_redirects`);
console.log(`  vercel.json`);
