import type { NextConfig } from 'next';

/**
 * The site is a pure static export, and Next does not apply `redirects()` in an
 * export. The redirect map — every URL the source site ever published — is
 * written instead to public/_redirects (Netlify, Cloudflare Pages) and
 * vercel.json (Vercel), so it applies wherever the site is served from.
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    // The catalogue's images are pre-converted to WebP by scripts/optimize-images.mjs,
    // so the built-in optimiser is never used and the export stays self-contained.
    deviceSizes: [320, 640, 960, 1280],
    imageSizes: [320, 640, 960, 1280],
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
