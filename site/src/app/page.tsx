import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { FinishRail } from '@/components/FinishRail';
import { PlateImage } from '@/components/PlateImage';
import { catalogue, categories, designs, facets } from '@/lib/catalogue';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Beauty Art Lights — Wholesale Decorative Lighting',
  description:
    'Wholesale decorative lighting, made to order. 236 fixtures across 10 ranges and 12 finishes, with full specification and dimensions published on every item.',
  path: '/',
  images: ['/brand/og.jpg'],
});

/**
 * The editorial interiors, assigned to the ranges they actually show. Eight of the
 * ten ranges have a photograph that depicts them; the two smallest — three and two
 * fixtures — get a typographic card instead, which reads as an index entry rather
 * than an empty box.
 */
const RANGE_IMAGE: Record<string, string> = {
  'wall-lights': 'editorial-1761135322',
  'floor-lamps': 'editorial-1761134241',
  'table-lamps': 'editorial-1761134591',
  'chandelier-lights': 'editorial-1761133840',
  'pendant-lights': 'editorial-1761134423',
  'tripod-floor-lamps': 'editorial-1761134673',
  'vertical-wall-lights': 'editorial-1761217527',
  'horizontal-wall-lights': 'editorial-1761136911',
};

/** A real fixture's specification, published as-is. */
const SPEC_EXAMPLE = designs.find((d) => d.finishes.length === 3 && d.bulbs > 1) ?? designs[0];

export default function HomePage() {
  const topFinishes = facets.finish.slice(0, 4);

  return (
    <>
      {/* ── hero ─────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero__inner">
          <div>
            <h1 className="hero__title display-xl">
              Lighting, <em>made to order.</em>
            </h1>
            <p className="lede" style={{ marginTop: '1.75rem' }}>
              Wholesale decorative lighting: {catalogue.meta.skuCount} fixtures across{' '}
              {categories.length} ranges and {facets.finish.length} finishes, with the full
              specification and the dimensions published on every single one. Anything else, we
              build from your drawing.
            </p>

            <div className="hero__actions">
              <Link href="/catalogue/" className="btn btn--primary">
                Browse the catalogue
                <span className="btn__icon">
                  <ArrowUpRight size={13} weight="light" aria-hidden="true" />
                </span>
              </Link>
              <Link href="/customise/" className="btn btn--secondary">
                Send us a drawing
              </Link>
            </div>
          </div>

          <div>
            <div className="plate" style={{ padding: '6px' }}>
              <div
                className="plate__frame plate__frame--cover"
                style={{ aspectRatio: '4 / 5' }}
              >
                <PlateImage
                  base="editorial-1761135431"
                  alt="A three-light gold spiral wall sconce lit against a cream wall"
                  sizes="(max-width: 940px) 92vw, 44vw"
                  priority
                  className="product-frame"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── the range in numbers ─────────────────────────────────────────── */}
      <section className="section-tight">
        <div className="container">
          <dl className="facts">
            {[
              ['Fixtures', String(catalogue.meta.skuCount)],
              ['Ranges', String(categories.length)],
              ['Finishes', String(facets.finish.length)],
              ['Bulb bases', 'E14 and E27'],
              ['Voltage', '110-240 V'],
            ].map(([key, value]) => (
              <div key={key}>
                <dt className="label">{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── the finish rail ──────────────────────────────────────────────── */}
      <FinishRail
        heading="Start with a finish."
        note="The axis the whole catalogue runs on. Pick one to see every fixture made in it."
      />

      {/* ── the ranges ───────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <header className="section-head">
            <h2>Ten ranges.</h2>
            <p className="lede">
              Wall sconces, pendants, chandeliers, floor and table lamps, tripods and vanity
              mirrors. Every one published with its dimensions, bulb base and power source.
            </p>
          </header>

          <div className="ranges">
            {categories.map((cat) => {
              const image = RANGE_IMAGE[cat.slug];
              return (
                <Link key={cat.slug} href={`/catalogue/${cat.slug}/`} className="range">
                  {image ? (
                    <span className="range__figure">
                      <PlateImage
                        base={image}
                        alt=""
                        sizes="(max-width: 620px) 92vw, (max-width: 1000px) 46vw, 30vw"
                      />
                    </span>
                  ) : (
                    <span className="range__figure range__figure--type">
                      <span className="range__type">{cat.fixture}</span>
                      <span className="label">{cat.skuCount} fixtures</span>
                    </span>
                  )}
                  <span className="range__name">{cat.label}</span>
                  <span className="range__meta">
                    {cat.fixture}
                    <span aria-hidden="true">·</span>
                    {cat.skuCount} fixtures
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── specification depth ──────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--bone)' }}>
        <div className="container">
          <div className="split">
            <div>
              <h2 style={{ marginTop: 0 }}>
                The specification <em style={{ fontStyle: 'normal', color: 'var(--brass)' }}>is</em>{' '}
                the product.
              </h2>
              <div className="prose" style={{ marginTop: '1.75rem' }}>
                <p>
                  Most catalogues in this trade publish a price band and little else. We publish
                  the whole sheet: material, finish, power source, voltage, bulb base, whether
                  shades and bulbs are included, and the dimensions in both inches and
                  centimetres. A buyer can compare two fixtures without asking us a single
                  question.
                </p>
                <p>
                  What we have is written down on the page. What we do not hold (certification
                  marks, photometric data, carton details, lead time) we say so plainly and send
                  it on request, rather than printing a blank row or guessing.
                </p>
              </div>
            </div>

            <div className="panel">
              <p className="label">A real specification sheet</p>
              <p style={{ fontSize: 'var(--step-1)', fontWeight: 500, marginTop: '0.5rem' }}>
                {SPEC_EXAMPLE.name} in {SPEC_EXAMPLE.finishes[0].finish}
              </p>
              <p className="mono" style={{ color: 'var(--ink-3)', marginTop: '0.25rem' }}>
                {SPEC_EXAMPLE.finishes[0].sku} · {SPEC_EXAMPLE.categoryLabel}
              </p>
              <div className="spec" style={{ marginTop: '1.5rem' }}>
                {[
                  [
                    'The fixture',
                    [
                      ['Material', SPEC_EXAMPLE.finishes[0].spec.material],
                      ['Number of bulbs', String(SPEC_EXAMPLE.bulbs)],
                    ],
                  ],
                  [
                    'The installation',
                    [
                      ['Power source', SPEC_EXAMPLE.finishes[0].spec.power_source],
                      ['Voltage', SPEC_EXAMPLE.finishes[0].spec.voltage],
                      ['Bulb base', SPEC_EXAMPLE.finishes[0].spec.bulb_base],
                      ['Bulb included', SPEC_EXAMPLE.finishes[0].spec.bulb_included],
                      ['Shade included', SPEC_EXAMPLE.finishes[0].spec.shade_included],
                    ],
                  ],
                ].map(([title, rows]) => (
                  <div className="spec__group" key={title as string}>
                    <p className="spec__group-title">{title as string}</p>
                    {(rows as [string, string][]).map(([key, value]) => (
                      <div className="spec__row" key={key}>
                        <span className="spec__key">{key}</span>
                        <span className="spec__value spec__value--mono">{value}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── customisation ────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <header className="section-head">
            <h2>Send a drawing. We will make it.</h2>
            <p className="lede">
              We manufacture lamp lights, and we can customise any type of lighting: adjust the
              measurements of an existing model, or build something new from a drawing, a photo,
              or a fixture you already own.
            </p>
          </header>

          <div className="steps">
            <div className="step">
              <h3>Send a reference</h3>
              <p>
                A sketch, a photograph, a link, or the measurements of a fixture you already use.
                Anything that shows the shape you want.
              </p>
            </div>
            <div className="step">
              <h3>Agree the specification</h3>
              <p>
                Material, colourway, size, shade and fitting. Adjust an existing design or build a
                new one to your dimensions.
              </p>
            </div>
            <div className="step">
              <h3>Get the commercial terms</h3>
              <p>
                Pricing, minimum order quantity, lead time, packaging and certification for your
                run, sent as a written quote against your reference.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <Link href="/customise/" className="btn btn--secondary">
              Send us a drawing
              <span className="btn__icon">
                <ArrowUpRight size={13} weight="light" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── what is published, what is on request ────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="panel">
            <h2 style={{ marginTop: 0, fontSize: 'var(--step-3)' }}>
              What we publish, and what we will send on request.
            </h2>

            <div className="columns" style={{ marginTop: '2.5rem' }}>
              <div>
                <p className="columns__head label">Published on every fixture</p>
                {[
                  'Material',
                  'Finish',
                  'Power source, hardwired or plug-in',
                  'Voltage',
                  'Bulb base, E14 or E27',
                  'Bulb and shade inclusion',
                  'Number of lights',
                  'Width, depth and height in inches and centimetres',
                  'Canopy dimensions where the fixture has one',
                ].map((item) => (
                  <p className="columns__item" key={item}>
                    {item}
                  </p>
                ))}
              </div>

              <div>
                <p className="columns__head label">Sent on request</p>
                {[
                  'Certification and compliance marks',
                  'Wattage, lumens, CRI and colour temperature',
                  'IP rating for outdoor-rated fixtures',
                  'Minimum order quantity',
                  'Carton dimensions, gross weight, units per carton',
                  'Lead time and country of origin',
                  'HS code and export documentation',
                ].map((item) => (
                  <p className="columns__item columns__item--pending" key={item}>
                    {item}
                  </p>
                ))}
                <p className="prose" style={{ fontSize: '0.9375rem', marginTop: '1.25rem' }}>
                  Ask on any product page and we will send the full compliance pack for that
                  fixture.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── the range of finishes, in numbers ────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <header className="section-head">
            <h2>Four finishes carry most of the range.</h2>
            <p className="lede">
              {topFinishes.map((f) => `${f.value} (${f.count})`).join(', ')}. Every one of them
              is available across the sconce, pendant and chandelier ranges.
            </p>
          </header>

          <div className="columns" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
            {topFinishes.map((f) => (
              <Link
                key={f.value}
                href={`/catalogue/?finish=${f.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="panel"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <span
                  style={{
                    display: 'block',
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '999px',
                    background: f.swatch,
                    boxShadow: 'inset 0 0 0 1px rgba(23,19,16,0.2)',
                  }}
                />
                <p style={{ fontWeight: 500, marginTop: '1rem' }}>{f.value}</p>
                <p className="mono" style={{ color: 'var(--ink-3)', marginTop: '0.25rem' }}>
                  {f.count} fixtures
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── enquiry ──────────────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="panel panel--ink">
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '2rem',
              }}
            >
              <div>
                <h2 style={{ marginTop: '0.75rem', color: 'var(--paper)' }}>
                  Tell us the fixture and the quantity.
                </h2>
                <p className="lede" style={{ marginTop: '0.75rem' }}>
                  Every item in the catalogue can be quoted. We reply to every enquiry, usually
                  within a working day.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link href="/contact/" className="btn btn--brass">
                  Request a quote
                </Link>
                <Link
                  href="/catalogue/"
                  className="btn"
                  style={{ borderColor: 'rgba(251,248,243,0.3)', color: 'var(--paper)' }}
                >
                  Browse the catalogue
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
