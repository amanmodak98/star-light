import { CatalogueBrowser } from '@/components/CatalogueBrowser';
import { index, facets } from '@/lib/catalogue';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'The Catalogue — 236 Decorative Lighting Fixtures',
  description:
    'Every fixture in the Beauty Art Lights range, filtered by finish, bulb base, number of lights, power source and material. Full specification and dimensions on each one.',
  path: '/catalogue/',
});

export default function CataloguePage() {
  return (
    <div className="container section">
      <header style={{ maxWidth: '46ch', marginBottom: '3rem' }}>
        <h1 style={{ marginTop: 0 }}>Every fixture, filterable.</h1>
        <p className="lede" style={{ marginTop: '1.25rem' }}>
          {index.length} fixtures across ten ranges and twelve finishes. Filter by finish, bulb
          base, number of lights, power source or material. The URL keeps your view, so you can
          send a dealer exactly what you are looking at.
        </p>
      </header>

      <CatalogueBrowser rows={index} facets={facets} />
    </div>
  );
}
