/**
 * site.ts — the client-safe half of the data layer.
 *
 * Types, constants and pure helpers only. Nothing here imports the catalogue
 * JSON, so a client component can depend on it without dragging 685 KB of
 * product records into the browser bundle.
 */

export const SITE_URL = 'https://beautyartlights.com';
export const WHATSAPP_NUMBER = '911332351546';
export const EMAIL = 'sales@beautyartlights.com';

export type Spec = {
  material: string;
  power_source: string;
  voltage: string;
  bulb_base: string;
  bulb_included: string;
  shade_included: string;
  number_of_bulbs: string;
  assembly_required: string;
  certification: string;
  finish: string;
};

export type Dimension = { raw: string; inches: number | null; cm: number | null } | null;

export type ProductImage = { base: string; width: number; height: number; tone: string };

export type Finish = {
  finish: string;
  colour: string;
  swatch: string;
  sku: string;
  id: string;
  skuName: string;
  spec: Spec;
  dimensions: { width: Dimension; depth: Dimension; height: Dimension };
  canopy: { width: string | null; depth: string | null; height: string | null; diameter: string | null } | null;
  images: ProductImage[];
  sourceUrl: string;
  description: string;
};

export type Design = {
  id: string;
  slug: string;
  name: string;
  skuName: string;
  displayName: string;
  title: string;
  keywords: string;
  category: string;
  categoryLabel: string;
  categorySlug: string;
  variantGroup: string | null;
  bulbs: number;
  shape: string;
  spec: Spec;
  dimensions: { width: Dimension; depth: Dimension; height: Dimension };
  canopy: { width: string | null; depth: string | null; height: string | null; diameter: string | null } | null;
  images: ProductImage[];
  description: string;
  metaDescription: string;
  suitedTo: string[];
  finishes: Finish[];
  primarySku: string;
  sourceUrl: string;
  relatedIds: string[];
};

export type Category = {
  slug: string;
  label: string;
  sourceSlug: string;
  fixture: string;
  designCount: number;
  skuCount: number;
};

export type FacetOption = { value: string; count: number; swatch?: string; slug?: string };

export type Facets = {
  category: FacetOption[];
  finish: FacetOption[];
  bulb_base: FacetOption[];
  number_of_bulbs: FacetOption[];
  power_source: FacetOption[];
  material: FacetOption[];
  excluded: { field: string; reason: string }[];
};

/** One row per SKU — the unit the catalogue filters by. Short keys keep the payload small. */
export type IndexRow = {
  /** product id */
  i: string;
  /** SKU code */
  s: string;
  /** design id */
  d: string;
  /** design slug */
  u: string;
  /** design name */
  n: string;
  /** finish name */
  f: string;
  /** finish swatch */
  c: string;
  /** category slug */
  g: string;
  /** category label */
  l: string;
  /** number of lights */
  b: number;
  /** bulb base */
  e: string;
  /** power source */
  p: string;
  /** material */
  m: string;
  /** primary image base name */
  img: string | null;
  /** rendered width */
  w: number;
  /** rendered height */
  h: number;
  /** the photograph's own backdrop tone */
  tone: string;
};

/** The SKU code a finish selector points at, e.g. "BT034". */
export const findFinish = (design: Design, sku: string): Finish =>
  design.finishes.find((f) => f.sku === sku) ?? design.finishes[0];

/** `25 in wide × 14 in deep × 13 in high (64 × 36 × 33 cm)` */
export const formatDimensions = (
  d: { width: Dimension; depth: Dimension; height: Dimension },
): string | null => {
  const parts: string[] = [];
  const cm: number[] = [];
  if (d.width?.inches) parts.push(`${d.width.inches} in wide`);
  if (d.depth?.inches) parts.push(`${d.depth.inches} in deep`);
  if (d.height?.inches) parts.push(`${d.height.inches} in high`);
  if (d.width?.cm) cm.push(d.width.cm);
  if (d.depth?.cm) cm.push(d.depth.cm);
  if (d.height?.cm) cm.push(d.height.cm);
  if (!parts.length) return null;
  return parts.join(' × ') + (cm.length ? ` (${cm.join(' × ')} cm)` : '');
};

export const formatCanopy = (
  c: {
    width: string | null;
    depth: string | null;
    height: string | null;
    diameter?: string | null;
  } | null,
): string | null => {
  if (!c) return null;
  const parts: string[] = [];
  if (c.width) parts.push(`width ${c.width}`);
  if (c.depth) parts.push(`depth ${c.depth}`);
  if (c.height) parts.push(`height ${c.height}`);
  if (c.diameter) parts.push(`diameter ${c.diameter}`);
  return parts.length ? parts.join(', ') : null;
};

export const slugifyValue = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
