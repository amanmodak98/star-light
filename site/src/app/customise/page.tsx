import Link from 'next/link';
import { PlateImage } from '@/components/PlateImage';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Customise — Lighting Built From Your Drawing',
  description:
    'Send a drawing, a photograph, a link, or the measurements of a fixture you already own. Beauty Art Lights customises any type of lighting, including adjusting the measurements of an existing model.',
  path: '/customise/',
  images: ['/brand/og.jpg'],
});

export default function CustomisePage() {
  return (
    <div className="container section">
      <header style={{ maxWidth: '52ch', marginBottom: '4rem' }}>
        <h1 style={{ marginTop: 0 }}>Send a drawing. We will make it.</h1>
        <p className="lede" style={{ marginTop: '1.5rem' }}>
          We are manufacturers of lamp lights, and we can customise any type of lighting. If some
          measurements on a product need to be adjusted, or you would like a new product made
          from a drawing, a photograph, or anything else, tell us.
        </p>
      </header>

      <div className="split" style={{ alignItems: 'center' }}>
        <div className="prose">
          <h2 style={{ marginTop: 0 }}>What we can take on</h2>
          <ul>
            <li>A drawing or a sketch. Hand-drawn is fine.</li>
            <li>A photograph of a fixture you have seen or already own</li>
            <li>A link to a product, anywhere</li>
            <li>Adjustments to an existing model: measurements, material, colourway, size</li>
          </ul>

          <h2>What we will come back with</h2>
          <p>
            A specification we both agree on: material, finish, size, shade, fitting, and the
            dimensions in inches and centimetres. Then the commercial terms for your run:
            pricing, minimum order quantity, lead time, packaging, and the certification we can
            support on the finished goods.
          </p>

          <h2>How long it takes</h2>
          <p>
            We will come back to you on the specification and the terms for your run. Timelines
            depend on the fixture and the quantity, so we will give you a lead time in the quote
            rather than a general figure here.
          </p>

          <h2>What helps</h2>
          <p>
            The more we know up front, the closer the first quote is to the final one. A
            reference, the room it is going into, the finish you want, and roughly how many you
            need is usually enough to start.
          </p>
        </div>

        <div>
          <div className="plate" style={{ padding: '6px' }}>
            <span
              className="plate__frame plate__frame--cover"
              style={{ display: 'block', aspectRatio: '4 / 5' }}
            >
              <PlateImage
                base="editorial-1761134591"
                alt="A black cone table lamp lit on a console beside a sofa"
                sizes="(max-width: 900px) 92vw, 44vw"
                priority
              />
            </span>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingBottom: 0 }}>
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
              <h2 style={{ marginTop: 0, color: 'var(--paper)' }}>
                Send us a reference and a quantity.
              </h2>
              <p className="lede" style={{ marginTop: '0.75rem' }}>
                Include any drawing or photograph, the finish, and how many you need. We reply to
                every enquiry, usually within a working day.
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
      </section>
    </div>
  );
}
