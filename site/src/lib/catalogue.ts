/**
 * catalogue.ts — the server-side data layer.
 *
 * Imports the generated JSON. Only server components and build scripts may
 * reach for this; client components use lib/site.ts, which carries the same
 * types without the payload.
 */

import catalogueData from '@/data/catalogue.json';
import indexData from '@/data/index.json';
import imagesData from '@/data/images.json';
import type {
  Category,
  Design,
  Facets,
  IndexRow,
} from './site';

export type {
  Category,
  Design,
  FacetOption,
  Facets,
  Finish,
  IndexRow,
  ProductImage,
  Spec,
  Dimension,
} from './site';
export {
  EMAIL,
  SITE_URL,
  WHATSAPP_NUMBER,
  findFinish,
  formatCanopy,
  formatDimensions,
  slugifyValue,
} from './site';

export const catalogue = catalogueData as unknown as {
  meta: {
    source: string;
    generatedAt: string;
    skuCount: number;
    designCount: number;
    categoryCount: number;
    priceModel: string;
  };
  site: {
    name: string;
    tagline: string;
    email: string;
    whatsapp: string;
    whatsappNumber: string;
    url: string;
  };
  categories: Category[];
  designs: Design[];
  facets: Facets;
};

export const index = indexData as unknown as IndexRow[];
export const imageMeta = imagesData as unknown as Record<
  string,
  { w: number; h: number; aspect: number; trimmed: boolean; tone?: string | null }
>;

export const designs = catalogue.designs;
export const categories = catalogue.categories;
export const facets = catalogue.facets;
export const site = catalogue.site;

const designById = new Map(designs.map((d) => [d.id, d]));
const designBySlug = new Map(designs.map((d) => [d.slug, d]));

export const getDesign = (slug: string): Design | undefined => designBySlug.get(slug);
export const getDesignById = (id: string): Design | undefined => designById.get(id);
export const getCategory = (slug: string): Category | undefined =>
  categories.find((c) => c.slug === slug);

export const relatedDesigns = (design: Design): Design[] =>
  design.relatedIds.map((id) => designById.get(id)).filter((d): d is Design => Boolean(d));

/** The tone of a photograph's own backdrop, so the plate matches the image. */
export const plateTone = (base: string | null | undefined): string => {
  if (!base) return 'var(--bone)';
  const tone = imageMeta[base]?.tone;
  return tone ?? 'var(--bone)';
};

/** The rendered dimensions of a generated image, for the intrinsic size box. */
export const renderedSize = (base: string): { width: number; height: number } => {
  const meta = imageMeta[base];
  if (!meta) return { width: 1600, height: 1600 };
  return { width: meta.w, height: meta.h };
};
