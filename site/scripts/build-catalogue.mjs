/**
 * build-catalogue.mjs — normalise the scraped dataset into the site build's data layer.
 *
 * Reads  ../data/site-data.json  +  ../data/products.json
 * Writes src/data/{catalogue,index,facets,categories}.json
 *
 * This is deliberately a *new* implementation rather than a re-run of tools/bal_build_data.py.
 * The upstream normaliser has five defects that matter for the published site:
 *
 *   1. `colour` is a byte-for-byte duplicate of `finish` on all 237 products.
 *   2. `clean_power()` truncates "Hardwired / plug-in" to "Hardwired", losing the plug-in mode.
 *   3. `parse_canopy()` requires a colon, so 96 of 111 canopy-bearing products parse to [].
 *   4. Four live category slugs are missing from FIXTURE_TYPES, leaving 6 products without a
 *      fixture type in their name ("3-Light Mesh", "Cone Matte Black").
 *   5. `short_title_of_ids()` only strips a *leading* finish, polluting 5 of 23 family labels.
 *
 * It also merges the four duplicate category slugs, collapses the 23 variant families into
 * design-level pages, drops the one genuine re-listing, and rewrites every description in-house
 * (the scraped text is pasted from Etsy and carries another seller's copyright).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, '..');
const REPO = join(SITE, '..');
const OUT = join(SITE, 'src', 'data');

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const siteData = read(join(REPO, 'data', 'site-data.json'));
const rawProducts = read(join(REPO, 'data', 'products.json'));

/** The image manifest, when the image pipeline has already run. */
const imageManifest = (() => {
  const p = join(SITE, 'src', 'data', 'images.json');
  if (!existsSync(p)) return {};
  try {
    return read(p);
  } catch {
    return {};
  }
})();

/* ── taxonomy ──────────────────────────────────────────────────────────────── */

/** The four duplicate slugs the source site exposes, folded into their real category. */
const CATEGORY_MERGE = {
  'vertical-light1': 'vertical-lights',
  'horizontal-light1': 'horizontal-lights',
  'table-lamp': 'table-lamps',
  'floor-lamp': 'floor-lamps',
};

const CATEGORIES = {
  'wall-light': { label: 'Wall Lights', fixture: 'Wall Sconce', plural: 'wall sconces' },
  'vertical-lights': { label: 'Vertical Wall Lights', fixture: 'Wall Sconce', plural: 'vertical wall sconces' },
  'horizontal-lights': { label: 'Horizontal Wall Lights', fixture: 'Wall Sconce', plural: 'horizontal wall sconces' },
  'floor-lamps': { label: 'Floor Lamps', fixture: 'Floor Lamp', plural: 'floor lamps' },
  'tripod-floor-lamps': { label: 'Tripod Floor Lamps', fixture: 'Floor Lamp', plural: 'tripod floor lamps' },
  'table-lamps': { label: 'Table Lamps', fixture: 'Table Lamp', plural: 'table lamps' },
  'table-tripod-lamps': { label: 'Table Tripod Lamps', fixture: 'Table Lamp', plural: 'table tripod lamps' },
  'hanging-lights': { label: 'Hanging & Pendant Lights', fixture: 'Pendant Light', plural: 'pendants' },
  'chandelier-lights': { label: 'Chandelier Lights', fixture: 'Chandelier', plural: 'chandeliers' },
  'mirror-lights': { label: 'Vanity Mirror Lights', fixture: 'Vanity Mirror', plural: 'vanity mirrors' },
};

/** Slugs for the public catalogue URLs — clean, plural, no stray hyphens. */
const CATEGORY_SLUGS = {
  'wall-light': 'wall-lights',
  'vertical-lights': 'vertical-wall-lights',
  'horizontal-lights': 'horizontal-wall-lights',
  'floor-lamps': 'floor-lamps',
  'tripod-floor-lamps': 'tripod-floor-lamps',
  'table-lamps': 'table-lamps',
  'table-tripod-lamps': 'table-tripod-lamps',
  'hanging-lights': 'pendant-lights',
  'chandelier-lights': 'chandelier-lights',
  'mirror-lights': 'vanity-mirror-lights',
};

/* ── finishes ──────────────────────────────────────────────────────────────── */

/** Canonical finish names. Order matters: longest / most specific first. */
const FINISH_CANON = [
  ['matte black', 'Matte Black'],
  ['antique brass', 'Antique Brass'],
  ['gold brass', 'Gold Brass'],
  ['nickel plated', 'Nickel Plated'],
  ['natural wood', 'Natural Wood'],
  ['rattan cane', 'Rattan Cane'],
  ['brass', 'Brass'],
  ['golden', 'Gold'],
  ['gold', 'Gold'],
  ['silver', 'Silver'],
  ['chrome', 'Chrome'],
  ['black', 'Black'],
  ['white', 'White'],
  ['red', 'Red'],
  ['green', 'Green'],
  ['blue', 'Blue'],
  ['brown', 'Brown'],
  ['grey', 'Grey'],
  ['gray', 'Grey'],
  ['pink', 'Pink'],
  ['copper', 'Copper'],
  ['wooden', 'Wood'],
  ['wood', 'Wood'],
  ['rattan', 'Rattan Cane'],
];

/** Swatch colours, sampled by eye against the product photography. */
const FINISH_SWATCH = {
  'Matte Black': '#1F1D1B',
  Black: '#141312',
  Red: '#A83A2C',
  'Gold Brass': '#C08A2E',
  'Antique Brass': '#8A6A3A',
  Brass: '#A8862F',
  Gold: '#B08A3C',
  Green: '#2F5B45',
  Blue: '#2B5378',
  Brown: '#6B4A2E',
  Wood: '#9A7444',
  'Natural Wood': '#A87A46',
  'Rattan Cane': '#B79263',
  White: '#E8E1D5',
  Silver: '#B9B2A6',
  'Nickel Plated': '#9C9A93',
  Chrome: '#B4B7B8',
  Grey: '#8E8B85',
  Pink: '#C98A94',
  Copper: '#9C5B32',
  Unspecified: '#B4AAA0',
};

/**
 * The source's own Finish field is entered inconsistently: "Black", "Gold", "Golden",
 * "Matte Gold" and "Brass Gold" all appear for what the photography shows are two real
 * finishes, and three products carry no Finish row at all.
 *
 * Every override below was checked against the product's own photograph, not inferred from
 * the keyword title alone. The catalogue's primary axis is finish, so a wrong swatch here
 * misleads a buyer who is quoting a fixture by code.
 */
const FINISH_OVERRIDES = {
  // spec "black" / "brown" / blank — all photographed matte black
  BT025: 'Matte Black', BT081: 'Matte Black', BT145: 'Matte Black', BT147: 'Matte Black',
  BT149: 'Matte Black', BT185: 'Matte Black', BT139: 'Matte Black', BT203: 'Matte Black',
  // spec "gold" / "golden" / "matte gold" / "brass gold" / "brown" — all photographed gold brass
  BT113: 'Gold Brass', BT094: 'Gold Brass', BT146: 'Gold Brass', BT153: 'Gold Brass',
  BT065: 'Gold Brass', BT115: 'Gold Brass', BT117: 'Gold Brass', BT020: 'Gold Brass',
  // spec blank / truncated
  BT161: 'Antique Brass', BT087: 'Antique Brass', BT156: 'Antique Brass', BT197: 'Red',
  // spec "matte white" / "matte white finish"
  BT060: 'White', BT211: 'White', BT105: 'White',
  // spec "silver" but the title and the photograph are chrome
  BT111: 'Chrome',
  // wooden stock recorded under four different spellings
  BT109: 'Wood', BT127: 'Wood', BT164: 'Wood', BT200: 'Wood', BT204: 'Wood', BT163: 'Wood',
  // woven rattan floor lamp
  BT162: 'Rattan Cane',
  // brown ceramic body with a brass neck
  BT110: 'Brown',
  // photographed silver
  BT148: 'Silver',
};

/** `Color ( Matte Black )` → `Matte Black`. Handles case drift and mid-word truncation. */
function normaliseFinish(raw) {
  if (!raw) return 'Unspecified';
  let v = String(raw).trim();
  const m = v.match(/color\s*\((.*)/i);
  if (m) v = m[1];
  v = v.replace(/[)|]/g, ' ').replace(/\s+/g, ' ').trim(' ,.;');
  if (!v) return 'Unspecified';
  const low = v.toLowerCase();
  for (const [needle, canon] of FINISH_CANON) {
    if (low.includes(needle)) return canon;
  }
  const first = low.split(' ')[0] ?? '';
  for (const [needle, canon] of FINISH_CANON) {
    const nFirst = needle.split(' ')[0];
    if (first === nFirst && low.length >= nFirst.length + 2) return canon;
  }
  return v.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** The raw colour word, e.g. `Color ( Matte black )` → `matte black`. */
function rawColour(raw) {
  if (!raw) return 'Unspecified';
  const m = String(raw).match(/color\s*\(\s*(.*?)\s*\)/i);
  const v = (m ? m[1] : String(raw)).replace(/[)|]/g, ' ').replace(/\s+/g, ' ').trim();
  return v ? v.toLowerCase() : 'Unspecified';
}

/* ── spec clean-up ─────────────────────────────────────────────────────────── */

const SPEC_LABELS = [
  'Material', 'Finish', 'Power Source', 'Voltage', 'Bulb Base',
  'Bulb Included', 'Shade Included', 'Number Of Bulbs',
  'Assembly Required', 'Certification',
];

function specValue(map, label) {
  const v = (map?.[label] ?? '').trim().replace(/[|\s]+$/, '').trim();
  return v || 'Unspecified';
}

/** Keeps dual-mode values intact: "Hardwired / plug-in" stays "Hardwired / Plug-in". */
function cleanPower(raw) {
  if (!raw) return 'Unspecified';
  const v = String(raw).trim();
  const low = v.toLowerCase();
  if (low.includes('hardwired') && low.includes('plug')) return 'Hardwired / Plug-in';
  if (low.startsWith('plug')) return 'Plug-in';
  if (low.startsWith('hard')) return 'Hardwired';
  return v.replace(/\bplug-in\b/gi, 'Plug-in').replace(/\bhardwired\b/gi, 'Hardwired');
}

/** `Steel, Aluminim, Brass |` → `Steel, Aluminium, Brass`. */
function cleanMaterial(raw) {
  const v = String(raw ?? '')
    .replace(/[|\s]+$/, '')
    .replace(/Aluminim/g, 'Aluminium')
    .replace(/\s*,\s*/g, ', ')
    .trim();
  return v || 'Unspecified';
}

const SHADE_WORDS = /white\s+(?:fabric\s+)?shades?/i;

/** Parse `25" IN, ( 64 CM )` into `{ inches, cm }`. */
function parseDimension(value) {
  if (!value) return null;
  const v = String(value).replace(/[|\s]+$/, '').trim();
  const m = v.match(/([\d.]+)\s*(?:"|'|”|″)?\s*(?:IN)?\s*[,(]?\s*\(?\s*([\d.]+)?\s*(?:CM|cm)?/);
  if (!m) return { raw: v, inches: null, cm: null };
  const inches = m[1] ? Number(m[1]) : null;
  const cm = m[2] ? Number(m[2]) : null;
  if (inches === null && cm === null) return { raw: v, inches: null, cm: null };
  return { raw: v, inches, cm };
}

/**
 * The source labels its rows "Product Width", "Product Depth" and "Product Height";
 * one product stores the measurement in the label instead ("Width 16" plus
 * `" IN, ( 41 CM )`). Both forms are recognised here, along with the bare
 * "Width" / "Depth" / "Height" labels. Getting this wrong silently drops the
 * dimensions from every product but one.
 */
function dimensionRows(rows) {
  const out = { width: null, depth: null, height: null };
  for (const r of rows ?? []) {
    let label = (r.label ?? '').trim();
    let value = (r.value ?? '').trim();
    // two products have their spec rows parsed into the dimensions block — skip them
    if (SPEC_LABELS.includes(label)) continue;

    // "Width 16" + `" IN, ( 41 CM )`
    const lm = label.match(/^(Width|Depth|Height)\s+([\d.]+)$/i);
    if (lm) {
      label = lm[1];
      value = `${lm[2]} ${value}`.trim();
    }

    const key = label.toLowerCase().replace(/^product\s+/, '');
    if ((key === 'width' || key === 'depth' || key === 'height') && !out[key]) {
      out[key] = parseDimension(value);
    }
  }
  return out;
}

/**
 * Canopy rows come in three shapes. This recovers all of them:
 *   `Width 6" IN, ( 15 CM )`                    (no colon, three separate rows)
 *   `Width: 25", Depth: 14 ", Height: 13" |`   (one row, all three)
 *   label=`Width 6.5` + value=`IN, ( 17 CM )`  (measurement split across label and value)
 */
function canopyOf(rows) {
  // Some canopies are round: they carry a diameter rather than a width.
  const found = { width: null, depth: null, height: null, diameter: null };
  for (const r of rows ?? []) {
    const label = (r.label ?? '').trim();
    if (SPEC_LABELS.includes(label)) continue;
    const text = `${label} ${(r.value ?? '').trim()}`.trim();
    // "Dia" is spelled "Dai" in one source row, and "diameter" in another.
    const re = /(width|depth|height|d(?:ia|ai|iam\w*))\s*:?\s*([\d.]+\s*(?:"|'|”|″)?)/gi;
    let m;
    while ((m = re.exec(text))) {
      const k = m[1].toLowerCase().startsWith('d') && !m[1].toLowerCase().startsWith('de')
        ? 'diameter'
        : m[1].toLowerCase();
      const value = m[2].trim().replace(/\s+/g, ' ');
      if (!found[k]) {
        found[k] = value;
      } else if (!/["'”″]/.test(found[k]) && /["'”″]/.test(value)) {
        // prefer the imperial measurement when a row carries both
        found[k] = value;
      }
    }
  }
  return Object.values(found).some(Boolean) ? found : null;
}

/* ── naming ────────────────────────────────────────────────────────────────── */

const SHAPES = ['teapot', 'tripod', 'cone', 'spiral', 'sputnik', 'dome', 'tier', 'twisted', 'mesh', 'wave', 'bell', 'drum', 'cage', 'lantern'];

function shapeOf(title) {
  const low = (title ?? '').toLowerCase();
  for (const s of SHAPES) {
    if (new RegExp(`\\b${s}\\b`).test(low)) return s;
  }
  return '';
}

/** Spec wins over the title, matching the upstream behaviour; falls back to the title. */
function bulbCount(specValue_, title) {
  const v = (specValue_ ?? '').trim();
  if (/^\d+$/.test(v)) {
    const n = Number(v);
    if (n > 1) return n;
  }
  const m = (title ?? '').match(/\b(\d+)\s*[-\s]?light\b/i);
  if (m && Number(m[1]) > 1) return Number(m[1]);
  return 1;
}

function slugify(s) {
  return String(s)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/** `5-Light Cone Matte Black Wall Sconce` → `5-Light Cone Wall Sconce` (finish removed). */
function stripFinish(name, finish) {
  let out = name;
  const words = finish.split(' ');
  for (const w of words) {
    out = out.replace(new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), '');
  }
  return out.replace(/\s+/g, ' ').replace(/\s+-\s+/g, '').trim();
}

/* ── description generation ────────────────────────────────────────────────── */

/** `steel, aluminium, brass` → `steel, aluminium and brass`. */
function listToSentence(items) {
  if (!items.length) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/**
 * Every published description is generated from the product's own recorded attributes.
 * Nothing here is invented, and nothing here is scraped: the source copy is another seller's.
 */
function buildDescription(p, spec, dims) {
  const finish = p.finish;
  const fixture = p.fixture;
  const count = p.bulbs;
  const title = p.title ?? '';

  const materials = spec.material === 'Unspecified'
    ? []
    : spec.material.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const materialSentence = listToSentence(materials);

  const shadeIncluded = /^yes$/i.test(spec.shade_included);
  let shadeClause;
  if (!shadeIncluded) {
    shadeClause = 'shades sold separately';
  } else if (/white fabric shades/i.test(title)) {
    shadeClause = 'white fabric shades';
  } else if (SHADE_WORDS.test(title)) {
    shadeClause = 'white shades';
  } else {
    shadeClause = 'shades included';
  }

  const lightWord = count > 1 ? `${count}-light` : 'single-light';
  const countPhrase = count > 1 ? `${count} light sources` : 'a single light source';
  const inMaterial = materialSentence ? ` in ${materialSentence}` : '';

  const openers = [
    `A ${lightWord} ${finish.toLowerCase()} ${fixture.toLowerCase()}${inMaterial} with ${shadeClause}.`,
    `${finish} ${fixture.toLowerCase()} with ${countPhrase}${inMaterial}, ${shadeClause}.`,
    `A ${finish.toLowerCase()} ${fixture.toLowerCase()}${inMaterial} with ${shadeClause} and ${countPhrase}.`,
  ];
  const parts = [openers[p.id.charCodeAt(p.id.length - 1) % openers.length]];

  const d = dims;
  const measure = [];
  if (d.width?.inches) measure.push(`${d.width.inches} in wide`);
  if (d.depth?.inches) measure.push(`${d.depth.inches} in deep`);
  if (d.height?.inches) measure.push(`${d.height.inches} in high`);
  if (measure.length) {
    const cm = [d.width?.cm, d.depth?.cm, d.height?.cm].filter(Boolean);
    parts.push(`Measures ${measure.join(' × ')}${cm.length ? ` (${cm.join(' × ')} cm)` : ''}.`);
  }

  const tail = [
    spec.power_source === 'Unspecified' ? '' : `${spec.power_source} installation`,
    spec.bulb_base === 'Unspecified' ? '' : `${spec.bulb_base} fittings`,
    spec.bulb_included === 'No' ? 'bulbs supplied separately' : '',
  ].filter(Boolean);
  if (tail.length) {
    parts.push(`${tail[0][0].toUpperCase()}${tail[0].slice(1)}${tail.length > 1 ? ', ' + tail.slice(1).join(', ') : ''}.`);
  }

  return parts.join(' ');
}

/* ── assemble ──────────────────────────────────────────────────────────────── */

const rawById = new Map(rawProducts.map((p) => [p.id, p]));
const sdById = new Map(siteData.products.map((p) => [p.id, p]));

/** The one genuine re-listing: same design, same finish. 512 loses to 510. */
const RELISTING_LOSERS = new Set(['512']);

const products = [];
for (const p of siteData.products) {
  if (RELISTING_LOSERS.has(p.id)) continue;
  const raw = rawById.get(p.id);
  const category = CATEGORY_MERGE[p.category] ?? p.category;
  const meta = CATEGORIES[category];
  if (!meta) {
    console.warn(`  ! unmapped category ${p.category} (id ${p.id}) — skipped`);
    continue;
  }

  const specs = raw.specifications_map ?? {};
  const finish = FINISH_OVERRIDES[p.code] ?? normaliseFinish(specs.Finish);
  const colour = rawColour(specs.Finish);
  const bulbs = bulbCount(specs['Number Of Bulbs'], p.title);
  const shape = shapeOf(p.title);

  const spec = {
    material: cleanMaterial(specs.Material),
    power_source: cleanPower(specs['Power Source']),
    voltage: specValue(specs, 'Voltage'),
    bulb_base: specValue(specs, 'Bulb Base'),
    bulb_included: specValue(specs, 'Bulb Included'),
    shade_included: specValue(specs, 'Shade Included'),
    number_of_bulbs: specValue(specs, 'Number Of Bulbs'),
    assembly_required: specValue(specs, 'Assembly Required'),
    certification: specValue(specs, 'Certification'),
    finish: normaliseFinish(specs.Finish),
  };

  const dims = dimensionRows(raw.dimensions);
  const canopy = canopyOf(raw.canopy_dimensions);

  const countPart = bulbs > 1 ? `${bulbs}-Light ` : '';
  const shapePart = shape ? `${shape[0].toUpperCase()}${shape.slice(1)} ` : '';
  const skuName = `${countPart}${shapePart}${finish} ${meta.fixture}`.replace(/\s+/g, ' ').trim();
  const designName = stripFinish(skuName, finish).replace(/\s+/g, ' ').trim() || meta.fixture;

  const images = (p.images ?? [])
    .filter((im) => im.local)
    .map((im) => {
      const base = im.local.split('/').pop().replace(/\.[^.]+$/, '');
      const meta = imageManifest[base];
      // Catalogue products are emitted as square canvases; the nine editorial
      // interiors keep their aspect. The tone is the photograph's own backdrop.
      const square = !base.startsWith('editorial-');
      return {
        base,
        width: square ? 1600 : 1600,
        height: square ? 1600 : Math.round(1600 / (meta?.aspect || 1.25)),
        tone: meta?.tone ?? '#F2EDE4',
      };
    });

  const enriched = {
    ...p,
    title: p.title,
    fixture: meta.fixture,
    category,
    categoryLabel: meta.label,
    categorySlug: CATEGORY_SLUGS[category],
    finish,
    colour,
    bulbs,
    shape,
    spec,
    dims,
    canopy,
    images,
    rawTitle: raw.title,
    sourceUrl: `https://beautyartlights.com${raw.url}`,
  };
  enriched.skuName = skuName;
  enriched.designName = designName;
  enriched.description = buildDescription(enriched, spec, dims);
  products.push(enriched);
}

/* ── group into designs ────────────────────────────────────────────────────── */

const familyOf = new Map();
for (const p of siteData.products) {
  if (p.variant_group) familyOf.set(p.id, p.variant_group);
}

/** Group SKUs into designs: variant families collapse; every other SKU is its own design. */
const designGroups = new Map();
for (const p of products) {
  const gid = familyOf.get(p.id);
  const key = gid ? `vg:${gid}` : `sku:${p.id}`;
  if (!designGroups.has(key)) designGroups.set(key, []);
  designGroups.get(key).push(p);
}

const designs = [];
let designSeq = 0;

for (const [key, members] of designGroups) {
  members.sort((a, b) => a.code.localeCompare(b.code));
  const primary = members[0];
  designSeq += 1;

  // A family's spec rows are identical by construction (the grouping key is
  // material + bulb count + base + power + W/D/H + canopy), but the *titles* of
  // colourways are worded differently — one may say "Tripod" where another says
  // "Triple Head". So take the modal shape and bulb count rather than the
  // primary's, and prefer any shape that is named at all.
  const shapeTally = new Map();
  for (const m of members) if (m.shape) shapeTally.set(m.shape, (shapeTally.get(m.shape) ?? 0) + 1);
  const designShape = [...shapeTally.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? '';

  const bulbTally = new Map();
  for (const m of members) bulbTally.set(m.bulbs, (bulbTally.get(m.bulbs) ?? 0) + 1);
  const designBulbs = [...bulbTally.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0];

  const countPart = designBulbs > 1 ? `${designBulbs}-Light ` : '';
  const shapePart = designShape ? `${designShape[0].toUpperCase()}${designShape.slice(1)} ` : '';
  const designName = `${countPart}${shapePart}${CATEGORIES[primary.category].fixture}`.trim();

  const designSlug = `${slugify(designName)}-${primary.code.toLowerCase()}`;

  const finishes = members.map((m) => ({
    finish: m.finish,
    colour: m.colour,
    swatch: FINISH_SWATCH[m.finish] ?? '#B4AAA0',
    sku: m.code,
    id: m.id,
    skuName: `${designName} — ${m.finish}`,
    spec: m.spec,
    dimensions: { width: m.dims.width, depth: m.dims.depth, height: m.dims.height },
    canopy: m.canopy,
    images: m.images,
    sourceUrl: m.sourceUrl,
    description: m.description,
  }));

  designs.push({
    id: `d${designSeq}`,
    slug: designSlug,
    name: designName,
    skuName: `${designName} — ${primary.finish}`,
    displayName: `${designName} · ${primary.code}`,
    title: primary.rawTitle,
    keywords: primary.rawTitle,
    category: primary.category,
    categoryLabel: primary.categoryLabel,
    categorySlug: primary.categorySlug,
    variantGroup: familyOf.get(primary.id) ?? null,
    bulbs: designBulbs,
    shape: designShape,
    spec: primary.spec,
    dimensions: { width: primary.dims.width, depth: primary.dims.depth, height: primary.dims.height },
    canopy: primary.canopy,
    images: primary.images,
    description: primary.description,
    metaDescription: `${designName} in ${primary.finish}. ${primary.spec.bulb_base} fittings, ${primary.spec.power_source.toLowerCase()}, dimensions in inches and cm. Trade pricing on request.`,
    suitedTo: p_suitedTo(primary),
    finishes,
    primarySku: primary.code,
    sourceUrl: primary.sourceUrl,
  });
}

function p_suitedTo(p) {
  const raw = p.applicable_space ?? [];
  const rooms = raw.filter((r) => r && r !== 'Unspecified');
  return rooms.length ? rooms : ['Living Room', 'Bedroom', 'Office', 'Entryway'];
}

/* ── categories ────────────────────────────────────────────────────────────── */

const categoryMap = new Map();
for (const d of designs) {
  if (!categoryMap.has(d.category)) {
    categoryMap.set(d.category, {
      slug: d.categorySlug,
      label: d.categoryLabel,
      sourceSlug: d.category,
      fixture: CATEGORIES[d.category].fixture,
      designCount: 0,
      skuCount: 0,
    });
  }
  const c = categoryMap.get(d.category);
  c.designCount += 1;
  c.skuCount += d.finishes.length;
}
const categories = [...categoryMap.values()].sort((a, b) => b.skuCount - a.skuCount);

/* ── facets ────────────────────────────────────────────────────────────────── */

/** Facets are computed over SKUs, because that is the unit a buyer filters by. */
const skuRows = [];
for (const d of designs) {
  for (const f of d.finishes) {
    skuRows.push({
      id: f.id,
      sku: f.sku,
      designId: d.id,
      slug: d.slug,
      name: `${d.name}`,
      skuName: f.skuName,
      designName: d.name,
      finish: f.finish,
      colour: f.colour,
      swatch: f.swatch,
      category: d.category,
      categorySlug: d.categorySlug,
      categoryLabel: d.categoryLabel,
      bulbs: d.bulbs,
      base: f.spec.bulb_base,
      power: f.spec.power_source,
      material: f.spec.material,
      image: f.images[0]?.base ?? null,
      imageWidth: f.images[0]?.width ?? 1600,
      imageHeight: f.images[0]?.height ?? 1621,
      imageCount: f.images.length,
    });
  }
}

/**
 * Facet axes. The getter returns the *display* value for each axis, because the
 * facet option's `value` is what the browser compares against — mixing a label
 * on one side and a slug on the other silently zeroes every count.
 *
 * `number_of_bulbs` is the count as a plain number on both sides ('1', '2', '3'),
 * rather than a word for the single-light case.
 */
const present = (v) => (!v || v === 'Unspecified' ? null : v);

const AXES = [
  ['category', (r) => present(r.categoryLabel)],
  ['finish', (r) => present(r.finish)],
  ['bulb_base', (r) => present(r.base)],
  ['number_of_bulbs', (r) => String(r.bulbs)],
  ['power_source', (r) => present(r.power)],
  ['material', (r) => present(r.material)],
];

const facets = {};
for (const [axis, get] of AXES) {
  const counts = new Map();
  for (const r of skuRows) {
    const v = get(r);
    if (v === null) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  facets[axis] = [...counts.entries()]
    .map(([value, count]) => {
      // The category axis needs the public slug too, for the URL and for the
      // range links — the display value is the label.
      const slug = axis === 'category'
        ? CATEGORY_SLUGS[skuRows.find((r) => r.categoryLabel === value).category]
        : undefined;
      return { value, count, ...(slug ? { slug } : {}) };
    })
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** Facets deliberately absent, with the reason. Mirrors docs/10-build-brief.md §4. */
facets.excluded = [
  { field: 'certification', reason: 'No certification data exists on the source site — blank on all 229 products that carry the row. Shown as “available on request” on product pages, never as a filter.' },
  { field: 'applicable_space', reason: 'Identical boilerplate on all 237 products. Carries no product-specific signal, so it is not a filter.' },
  { field: 'voltage', reason: 'A single value (110–240V) across the catalogue. Kept in the spec table, useless as a filter.' },
];

facets.finish = facets.finish.map((f) => ({ ...f, swatch: FINISH_SWATCH[f.value] ?? '#B4AAA0' }));

/* ── related designs ───────────────────────────────────────────────────────── */

/** Same category, different design, prefer a different shape so the row isn't monotonous. */
function relatedFor(design, all) {
  return all
    .filter((d) => d.id !== design.id && d.category === design.category)
    .sort((a, b) => {
      const aSame = a.shape === design.shape ? 1 : 0;
      const bSame = b.shape === design.shape ? 1 : 0;
      return aSame - bSame || a.skuName.localeCompare(b.skuName);
    })
    .slice(0, 4)
    .map((d) => d.id);
}

for (const d of designs) d.relatedIds = relatedFor(d, designs);

/* ── write ─────────────────────────────────────────────────────────────────── */

mkdirSync(OUT, { recursive: true });

const catalogue = {
  meta: {
    source: 'https://beautyartlights.com',
    generatedAt: new Date().toISOString(),
    skuCount: skuRows.length,
    designCount: designs.length,
    categoryCount: categories.length,
    priceModel: 'enquiry',
  },
  site: {
    name: 'Beauty Art Lights',
    tagline: 'Decorative lighting, made to order',
    email: 'sales@beautyartlights.com',
    whatsapp: '+911332351546',
    whatsappNumber: '911332351546',
    url: 'https://beautyartlights.com',
  },
  categories,
  designs,
  facets,
};

/**
 * The rendered size of a generated image. Catalogue products are emitted as
 * square canvases; the nine editorial interiors keep their aspect. The tone is
 * the photograph's own backdrop colour, so the plate it sits on matches it.
 */
function rendered(base) {
  const meta = imageManifest[base];
  if (!meta) return { w: 1600, h: 1600, tone: '#F2EDE4' };
  if (base.startsWith('editorial-')) {
    return { w: 1600, h: Math.round(1600 / meta.aspect), tone: meta.tone ?? '#F2EDE4' };
  }
  return { w: 1600, h: 1600, tone: meta.tone ?? '#F2EDE4' };
}

const index = skuRows.map((r) => ({
  i: r.id,
  s: r.sku,
  d: r.designId,
  u: r.slug,
  n: r.designName,
  f: r.finish,
  c: r.swatch,
  g: r.categorySlug,
  l: r.categoryLabel,
  b: r.bulbs,
  e: r.base === 'Unspecified' ? '' : r.base,
  p: r.power === 'Unspecified' ? '' : r.power,
  m: r.material === 'Unspecified' ? '' : r.material,
  img: r.image,
  ...(r.image ? rendered(r.image) : { w: 1600, h: 1600, tone: '#F2EDE4' }),
}));

writeFileSync(join(OUT, 'catalogue.json'), JSON.stringify(catalogue));
writeFileSync(join(OUT, 'index.json'), JSON.stringify(index));
writeFileSync(join(OUT, 'facets.json'), JSON.stringify(facets));
writeFileSync(join(OUT, 'categories.json'), JSON.stringify(categories));

/* ── report ────────────────────────────────────────────────────────────────── */

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
console.log('build-catalogue');
console.log(`  SKUs            ${skuRows.length}  (237 scraped − 1 re-listing)`);
console.log(`  designs         ${designs.length}`);
console.log(`  categories      ${categories.length}`);
console.log(`  catalogue.json  ${kb(Buffer.byteLength(JSON.stringify(catalogue)))}`);
console.log(`  index.json      ${kb(Buffer.byteLength(JSON.stringify(index)))}`);

const missing = designs.filter((d) => !d.images.length);
if (missing.length) console.log(`  ! ${missing.length} design(s) with no imagery: ${missing.map((d) => d.skuName).join(', ')}`);

for (const [axis, values] of Object.entries(facets)) {
  if (axis === 'excluded') continue;
  const total = values.reduce((s, v) => s + v.count, 0);
  console.log(`  facet ${axis.padEnd(16)} ${values.length} values, ${total} SKUs`);
}
