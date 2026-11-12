import type { ImageLoaderProps } from 'next/image';

/**
 * Every catalogue photograph is pre-converted to WebP by scripts/optimize-images.mjs
 * and written to /public/img as {base}-{width}.webp. The manifest of real output
 * dimensions lives in src/data/images.json.
 *
 * Because the widths are generated ahead of time, this loader only has to resolve a
 * path — there is no runtime image optimiser, which is what lets the site export as
 * pure static files.
 *
 * Anything that is already a path (the seal, the Open Graph card) is passed through
 * untouched rather than being rewritten into the catalogue's WebP namespace.
 */
export default function catalogueImageLoader({ src, width }: ImageLoaderProps): string {
  if (src.includes('/')) return src;
  const base = src.replace(/\.[^.]+$/, '');
  return `/img/${base}-${width}.webp`;
}
