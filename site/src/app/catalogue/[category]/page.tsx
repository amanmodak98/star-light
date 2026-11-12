import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CatalogueBrowser } from '@/components/CatalogueBrowser';
import { categories, facets, index } from '@/lib/catalogue';
import { pageMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return {};

  return pageMetadata({
    title: `${cat.label} — ${cat.skuCount} Wholesale Fixtures`,
    description: `${cat.skuCount} ${cat.fixture.toLowerCase()}s from the Beauty Art Lights wholesale range, with full specification, bulb base, power source and dimensions in inches and centimetres.`,
    path: `/catalogue/${cat.slug}/`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const rows = index.filter((r) => r.g === cat.slug);

  return (
    <div className="container section">
      <nav className="crumbs" style={{ marginBottom: '1.5rem' }} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="crumbs__sep" aria-hidden="true">
          /
        </span>
        <Link href="/catalogue/">Catalogue</Link>
        <span className="crumbs__sep" aria-hidden="true">
          /
        </span>
        <span aria-current="page">{cat.label}</span>
      </nav>

      <header style={{ maxWidth: '48ch', marginBottom: '3rem' }}>
        <h1 style={{ marginTop: 0 }}>{cat.label}</h1>
        <p className="lede" style={{ marginTop: '1.25rem' }}>
          {cat.fixture}s. {rows.length} of them, each published with its material, finish, power
          source, bulb base, and dimensions in both inches and centimetres.
        </p>
      </header>

      <CatalogueBrowser rows={rows} facets={facets} lockedCategory={cat.label} />
    </div>
  );
}
