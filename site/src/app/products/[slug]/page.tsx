import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProductView } from '@/components/ProductView';
import { PlateImage } from '@/components/PlateImage';
import { designs, getDesign, relatedDesigns, site, SITE_URL } from '@/lib/catalogue';
import { jsonLd, pageMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return designs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const design = getDesign(slug);
  if (!design) return {};

  return pageMetadata({
    title: `${design.name} — ${design.categoryLabel}`,
    description: design.metaDescription,
    path: `/products/${design.slug}/`,
    keywords: design.keywords,
    type: 'product',
    images: design.images.map((i) => `/img/${i.base}-1280.webp`),
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const design = getDesign(slug);
  if (!design) notFound();

  const related = relatedDesigns(design);
  const primary = design.finishes[0];

  /**
   * Product-snippet class only. Merchant listings require a published price
   * above zero, which this catalogue does not have and will not invent, so no
   * `offers` block is emitted. Google's variesBy whitelist excludes bulb base,
   * so each finish is carried as its own SKU inside one product group.
   */
  const structured = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organisation`,
        name: site.name,
        url: SITE_URL,
        email: site.email,
        description:
          'Wholesale manufacturer of decorative lighting: indoor and outdoor lamps, pendants, wall sconces, chandeliers and handmade pieces for homes and hotels.',
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: site.name,
        publisher: { '@id': `${SITE_URL}/#organisation` },
      },
      {
        '@type': 'Product',
        '@id': `${SITE_URL}/products/${design.slug}/#product`,
        name: design.name,
        description: design.description,
        sku: primary.sku,
        productGroupID: primary.sku,
        category: design.categoryLabel,
        material: primary.spec.material,
        brand: { '@type': 'Brand', name: site.name },
        image: design.images.map((i) => `${SITE_URL}/img/${i.base}-1280.webp`),
        keywords: design.keywords,
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Power source', value: primary.spec.power_source },
          { '@type': 'PropertyValue', name: 'Voltage', value: primary.spec.voltage },
          { '@type': 'PropertyValue', name: 'Bulb base', value: primary.spec.bulb_base },
          {
            '@type': 'PropertyValue',
            name: 'Number of lights',
            value: String(design.bulbs),
          },
        ],
        hasVariant: design.finishes.map((f) => ({
          '@type': 'Product',
          name: f.skuName,
          sku: f.sku,
          color: f.finish,
          material: f.spec.material,
          image: f.images.map((i) => `${SITE_URL}/img/${i.base}-1280.webp`),
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Catalogue', item: `${SITE_URL}/catalogue/` },
          {
            '@type': 'ListItem',
            position: 3,
            name: design.categoryLabel,
            item: `${SITE_URL}/catalogue/${design.categorySlug}/`,
          },
          { '@type': 'ListItem', position: 4, name: design.name, item: `${SITE_URL}/products/${design.slug}/` },
        ],
      },
    ],
  };

  return (
    <div className="container section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structured) }}
      />

      <nav className="crumbs" style={{ marginBottom: '2rem' }} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="crumbs__sep" aria-hidden="true">
          /
        </span>
        <Link href="/catalogue/">Catalogue</Link>
        <span className="crumbs__sep" aria-hidden="true">
          /
        </span>
        <Link href={`/catalogue/${design.categorySlug}/`}>{design.categoryLabel}</Link>
        <span className="crumbs__sep" aria-hidden="true">
          /
        </span>
        <span aria-current="page">{design.name}</span>
      </nav>

      <header style={{ marginBottom: '2.5rem', maxWidth: '54ch' }}>
        <h1 style={{ marginTop: 0 }}>{design.name}</h1>
        <p className="lede" style={{ marginTop: '1rem' }}>
          {design.finishes.length > 1
            ? `${design.categoryLabel}. Available in ${design.finishes.map((f) => f.finish).join(', ')}. Each finish is a separate product code, so pick the one you need and quote it by code.`
            : `${design.categoryLabel}. One finish, one product code. Full specification below.`}
        </p>
      </header>

      <ProductView design={design} />

      {/* ── the other finishes of this design, as photographs ───────────── */}
      {design.finishes.length > 1 && (
        <section style={{ marginTop: '5rem' }}>
          <h2 style={{ fontSize: 'var(--step-3)', marginTop: '0.75rem' }}>
            The same fixture, in {design.finishes.length - 1} other finish
            {design.finishes.length > 2 ? 'es' : ''}.
          </h2>
          <div className="grid-products" style={{ marginTop: '2rem' }}>
            {design.finishes.map((f) => (
              <Link
                key={f.sku}
                href={`/products/${design.slug}/?sku=${f.sku}`}
                className="plate"
              >
                <span className="plate__frame">
                  {f.images[0] && (
                    <PlateImage
                      base={f.images[0].base}
                      alt={`${design.name} in ${f.finish}, product code ${f.sku}`}
                      sizes="(max-width: 520px) 45vw, (max-width: 1024px) 30vw, 260px"
                    />
                  )}
                </span>
                <span className="plate__finish">
                  <span className="swatch" style={{ '--swatch': f.swatch } as React.CSSProperties} />
                  {f.finish}
                </span>
                <span className="plate__body">
                  <span className="plate__name">{design.name}</span>
                  <span className="plate__sku">{f.sku}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── more from the same range ────────────────────────────────────── */}
      {related.length > 0 && (
        <section style={{ marginTop: '5rem' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: 'var(--step-3)', marginTop: '0' }}>
                More from {design.categoryLabel}
              </h2>
            </div>
            <Link href={`/catalogue/${design.categorySlug}/`} className="btn btn--quiet">
              See all {design.categoryLabel}
            </Link>
          </div>

          <div className="grid-products">
            {related.map((d) => {
              const f = d.finishes[0];
              return (
                <Link key={d.id} href={`/products/${d.slug}/`} className="plate">
                  <span className="plate__frame">
                    {f.images[0] && (
                      <PlateImage
                        base={f.images[0].base}
                        alt={`${d.name} in ${f.finish}, product code ${f.sku}`}
                        sizes="(max-width: 520px) 45vw, (max-width: 1024px) 30vw, 260px"
                      />
                    )}
                  </span>
                  <span className="plate__finish">
                    <span className="swatch" style={{ '--swatch': f.swatch } as React.CSSProperties} />
                    {f.finish}
                  </span>
                  <span className="plate__body">
                    <span className="plate__name">{d.name}</span>
                    <span className="plate__sku">{f.sku}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
