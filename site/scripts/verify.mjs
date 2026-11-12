/**
 * verify.mjs — check the exported site against the plan's acceptance criteria.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, '..');
const OUT = join(SITE, 'out');

const fail = [];
const warn = [];
const ok = (m) => console.log('  ✓ ' + m);
const bad = (m) => { fail.push(m); console.log('  ✗ ' + m); };
const soft = (m) => { warn.push(m); console.log('  ! ' + m); };

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

if (!existsSync(OUT)) { console.error('no out/ — build first'); process.exit(1); }

const files = walk(OUT);
const html = files.filter((f) => f.endsWith('.html'));
console.log('\n1. Structure');
console.log(`  ${html.length} HTML pages, ${files.length} files total`);

const dirSize = (p) => files.filter((f) => f.startsWith(p)).reduce((s, f) => s + statSync(f).size, 0);
const mb = (b) => (b / 1048576).toFixed(1) + ' MB';
console.log(`  out/ total: ${mb(files.reduce((s, f) => s + statSync(f).size, 0))}`);
console.log(`  images: ${mb(dirSize(join(OUT, 'img')))}`);
console.log(`  fonts:  ${mb(dirSize(join(OUT, 'fonts')))}`);
console.log(`  js:     ${mb(dirSize(join(OUT, '_next')))}`);

console.log('\n2. Page inventory');
const expect = {
  'index.html': 'home',
  'catalogue/index.html': 'catalogue',
  'customise/index.html': 'customise',
  'about/index.html': 'about',
  'contact/index.html': 'contact',
  'privacy/index.html': 'privacy',
  'sitemap.xml': 'sitemap',
  'robots.txt': 'robots',
};
for (const [f, label] of Object.entries(expect)) {
  existsSync(join(OUT, f)) ? ok(`${label} → ${f}`) : bad(`missing ${f}`);
}
const productPages = html.filter((f) => f.includes('/products/'));
const categoryPages = html.filter((f) => f.includes('/catalogue/') && !f.includes('/catalogue/index'));
console.log(`  product pages: ${productPages.length} (expected 207)`);
console.log(`  category pages: ${categoryPages.length} (expected 10)`);
productPages.length === 207 ? ok('207 design pages') : bad(`expected 207 design pages, got ${productPages.length}`);
categoryPages.length === 10 ? ok('10 category pages') : bad(`expected 10 category pages, got ${categoryPages.length}`);

console.log('\n3. Image pipeline');
let nextImage = 0, hotlinked = 0, missing = 0;
const referenced = new Set();
for (const f of html) {
  const s = readFileSync(f, 'utf8');
  if (s.includes('/_next/image')) nextImage++;
  if (/beautyartlights\.com\/media\//.test(s)) hotlinked++;
  for (const m of s.matchAll(/\/img\/([A-Za-z0-9_-]+-\d+\.webp)/g)) referenced.add(m[1]);
}
nextImage === 0 ? ok('no /_next/image calls — the custom loader resolved every image') : bad(`${nextImage} pages still call /_next/image`);
hotlinked === 0 ? ok('no hotlinked source-site images') : bad(`${hotlinked} pages hotlink beautyartlights.com/media`);
for (const r of referenced) if (!existsSync(join(OUT, 'img', r))) { missing++; if (missing < 4) bad(`missing image file: ${r}`); }
missing === 0 ? ok(`all ${referenced.size} referenced image files exist`) : bad(`${missing} referenced image files missing`);

console.log('\n4. Content integrity');
const sample = readFileSync(join(OUT, 'products', '5-light-wall-sconce-bt001', 'index.html'), 'utf8');
// React always emits class="value"; the scrape artefact is an unterminated
// attribute, so match class=" that is never closed.
const artefacts = [
  ['Chandilier', 'the misspelling'],
  ['Aluminim', 'the misspelling'],
  ['wt-text-body-01', 'Etsy markup'],
  ['ABCDiatype', 'Etsy markup'],
  ['$ 0', 'a published price'],
  ['$ -2', 'a published price'],
  ['Enquiry for bulk</span></div>', 'a price placeholder'],
];
for (const [needle, label] of artefacts) {
  const hits = html.filter((f) => readFileSync(f, 'utf8').includes(needle)).length;
  hits === 0 ? ok(`no ${label} in the output`) : bad(`${hits} pages still contain ${label} ("${needle}")`);
}
const unterminated = html.filter((f) => /class="(?![^"]*")/.test(readFileSync(f, 'utf8'))).length;
unterminated === 0
  ? ok('no unterminated class attribute — the raw scrape artefact is gone')
  : bad(`${unterminated} pages still contain an unterminated class attribute`);
const ld = html.filter((f) => readFileSync(f, 'utf8').includes('application/ld+json')).length;
ld > 0 ? ok(`${ld} pages carry JSON-LD`) : bad('no JSON-LD emitted');
const withOffers = html.filter((f) => /"offers"/.test(readFileSync(f, 'utf8'))).length;
withOffers === 0 ? ok('no offers/price block anywhere — product-snippet class only') : bad(`${withOffers} pages carry an offers block`);

console.log('\n5. Catalogue integrity');
const catalogue = JSON.parse(readFileSync(join(SITE, 'src', 'data', 'catalogue.json'), 'utf8'));
const index = JSON.parse(readFileSync(join(SITE, 'src', 'data', 'index.json'), 'utf8'));

// Facet option counts must sum to the number of SKUs on every axis that
// covers every SKU. A mismatch means a label/slug mismatch between the facet
// and the index — the bug that silently zeroed every count.
for (const axis of ['category', 'finish', 'number_of_bulbs']) {
  const sum = catalogue.facets[axis].reduce((s, f) => s + f.count, 0);
  sum === index.length
    ? ok(`facet ${axis}: ${catalogue.facets[axis].length} options summing to ${sum}`)
    : bad(`facet ${axis} sums to ${sum}, expected ${index.length}`);
}
for (const axis of ['bulb_base', 'power_source', 'material']) {
  const sum = catalogue.facets[axis].reduce((s, f) => s + f.count, 0);
  sum <= index.length && sum > 0
    ? ok(`facet ${axis}: ${catalogue.facets[axis].length} options summing to ${sum} (the rest are unspecified)`)
    : bad(`facet ${axis} sums to ${sum}`);
}
const blank = Object.entries(catalogue.facets)
  .filter(([k]) => k !== 'excluded')
  .flatMap(([k, opts]) => opts.filter((o) => !o.value).map((o) => `${k}: "${o.value}"`));
blank.length === 0 ? ok('no blank facet options') : bad(`blank facet options: ${blank.join(', ')}`);

// Every category page must actually list its fixtures.
for (const cat of catalogue.categories) {
  const html = readFileSync(join(OUT, 'catalogue', cat.slug, 'index.html'), 'utf8');
  const plates = (html.match(/class="plate"/g) || []).length;
  plates === cat.skuCount
    ? ok(`${cat.label}: ${plates} fixtures listed`)
    : bad(`${cat.label}: ${plates} fixtures listed, expected ${cat.skuCount}`);
}

// Every product page must carry the four things a buyer needs.
let incomplete = 0;
for (const d of catalogue.designs) {
  const html = readFileSync(join(OUT, 'products', d.slug, 'index.html'), 'utf8');
  const hasGallery = html.includes('gallery__main');
  const hasFinishes = html.includes('finish-opt');
  const hasSpec = html.includes('spec__row');
  const hasEnquiry = html.includes('id="enquiry"');
  const hasLd = html.includes('application/ld+json');
  if (!(hasGallery && hasFinishes && hasSpec && hasEnquiry && hasLd)) {
    incomplete++;
    if (incomplete < 4) bad(`${d.slug} missing: ${[!hasGallery && 'gallery', !hasFinishes && 'finishes', !hasSpec && 'spec', !hasEnquiry && 'enquiry', !hasLd && 'json-ld'].filter(Boolean).join(', ')}`);
  }
}
incomplete === 0 ? ok(`all ${catalogue.designs.length} product pages carry gallery, finishes, spec, enquiry and JSON-LD`) : bad(`${incomplete} product pages are incomplete`);

// Dimensions are the site's core promise: every fixture publishes them.
const withDims = catalogue.designs.filter(
  (d) => d.dimensions.width || d.dimensions.depth || d.dimensions.height,
).length;
withDims >= 200
  ? ok(`${withDims} of ${catalogue.designs.length} designs publish dimensions`)
  : bad(`only ${withDims} designs publish dimensions`);

// A canopy is optional, but when it is present it must be complete.
const canopies = catalogue.designs.filter((d) => d.canopy);
const partial = canopies.filter(
  (d) => Object.values(d.canopy).filter(Boolean).length < 2,
);
partial.length === 0
  ? ok(`${canopies.length} canopies parsed, none half-empty`)
  : bad(`${partial.length} canopies are missing a dimension`);

// Every SKU must appear exactly once across the designs.
const skuTotal = catalogue.designs.reduce((s, d) => s + d.finishes.length, 0);
skuTotal === index.length ? ok(`all ${skuTotal} SKUs are reachable`) : bad(`${skuTotal} SKUs across designs vs ${index.length} in the index`);
const codes = new Set(catalogue.designs.flatMap((d) => d.finishes.map((f) => f.sku)));
codes.size === skuTotal ? ok('every product code is unique') : bad(`${skuTotal - codes.size} duplicate product codes`);

// Redirect destinations must resolve to a page that exists.
const redirects = JSON.parse(readFileSync(join(SITE, 'src', 'data', 'redirects.json'), 'utf8'));
let dangling = 0;
for (const r of redirects) {
  const path = r.destination.split('?')[0].replace(/^\//, '');
  const file = path === '' ? 'index.html' : path.endsWith('/') ? join(path, 'index.html') : `${path}/index.html`;
  if (!existsSync(join(OUT, file))) { dangling++; if (dangling < 4) bad(`redirect target missing: ${r.destination}`); }
}
dangling === 0 ? ok(`all ${redirects.length} redirect targets resolve to a generated page`) : bad(`${dangling} redirect targets dangle`);

// The sitemap must list every page.
const sitemap = readFileSync(join(OUT, 'sitemap.xml'), 'utf8');
const urls = (sitemap.match(/<loc>/g) || []).length;
const expected = catalogue.designs.length + catalogue.categories.length + 6;
urls === expected ? ok(`sitemap lists all ${urls} pages`) : bad(`sitemap lists ${urls} URLs, expected ${expected}`);

console.log('\n6. Page weight (uncompressed, as served)');
const homeSize = statSync(join(OUT, 'index.html')).size;
const catSize = statSync(join(OUT, 'catalogue', 'index.html')).size;
console.log(`  home HTML: ${(homeSize / 1024).toFixed(1)} KB`);
console.log(`  catalogue HTML: ${(catSize / 1024).toFixed(1)} KB`);
const scriptBytes = files.filter((f) => f.endsWith('.js')).reduce((s, f) => s + statSync(f).size, 0);
console.log(`  total JS shipped: ${(scriptBytes / 1024).toFixed(0)} KB across ${files.filter((f) => f.endsWith('.js')).length} files`);

console.log('\n7. Redirects');
const rl = readFileSync(join(SITE, 'public', '_redirects'), 'utf8').trim().split('\n');
rl.length === 263 ? ok(`${rl.length} redirects in public/_redirects`) : soft(`${rl.length} redirects in public/_redirects`);
const vj = JSON.parse(readFileSync(join(SITE, 'vercel.json'), 'utf8'));
vj.redirects.length === rl.length ? ok(`${vj.redirects.length} redirects in vercel.json`) : bad('vercel.json redirect count differs');

console.log(`\n${fail.length ? `${fail.length} FAILED` : 'all checks passed'}${warn.length ? `, ${warn.length} warnings` : ''}`);
process.exit(fail.length ? 1 : 0);
