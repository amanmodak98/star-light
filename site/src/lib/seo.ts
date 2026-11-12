import type { Metadata } from 'next';
import { SITE_URL } from './catalogue';

export const siteUrl = SITE_URL;

/**
 * One place for every page's metadata, so canonical, Open Graph and Twitter cards
 * can never drift apart. The source site had none of these — no canonical tags, no
 * Open Graph, no Twitter cards — which is the first thing to fix on an SEO rebuild.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
  type = 'website',
  images,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  type?: 'website' | 'article' | 'product';
  images?: string[];
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImages = (images ?? []).map((src) => ({
    url: src.startsWith('http') ? src : `${SITE_URL}${src}`,
    width: 1200,
    height: 630,
    alt: title,
  }));

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Beauty Art Lights',
      locale: 'en',
      type: type === 'product' ? 'website' : type,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages.map((i) => i.url),
    },
  };
}

/**
 * JSON-LD, serialised for a <script type="application/ld+json"> block.
 * Everything published here is a value the scrape actually holds.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
