import Link from 'next/link';
import { categories, facets, site } from '@/lib/catalogue';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'About — A Manufacturer of Decorative Lighting',
  description:
    'Beauty Art Lights manufactures decorative lighting: indoor and outdoor lamps, pendants, wall sconces, chandeliers and handmade pieces for homes and hotels. Customisable, and sold wholesale.',
  path: '/about/',
});

export default function AboutPage() {
  return (
    <div className="container section">
      <header style={{ maxWidth: '50ch', marginBottom: '4rem' }}>
        <h1 style={{ marginTop: 0 }}>A workshop that makes lighting to order.</h1>
      </header>

      <dl className="facts">
        {[
          ['What we make', 'Indoor and outdoor lamps, lighting and handmade decorations'],
          ['Who we supply', 'Homes and hotels, through dealers and project trade'],
          ['How we work', 'Wholesale, enquiry-led, made to order'],
          ['In the range', '236 fixtures, 10 ranges, 12 finishes'],
          ['Custom work', 'Any type of lighting, from a drawing or a photograph'],
        ].map(([key, value]) => (
          <div key={key}>
            <dt className="label">{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className="split" style={{ alignItems: 'start' }}>
        <div className="prose">
          <p>
            We are manufacturers of lamp lights. Our range covers indoor and outdoor lamps,
            lighting and other handmade decorations for homes and hotels: wall sconces, pendant
            and hanging lights, chandeliers, floor and table lamps, tripods and vanity mirrors.
          </p>

          <p>
            We build decorative lighting for people who specify it: dealers, interior
            designers, hospitality projects and export buyers. That means the work starts with
            the specification rather than the photograph. What is the fixture, what is it made
            from, how many lights does it carry, what is the fitting, and what does it measure
            in inches and in centimetres.
          </p>

          <h2>Customisation is the business, not an add-on</h2>
          <p>
            We can customise any type of lighting. If some measurements on a product need
            adjusting, or you would like a new product made from a drawing, a photograph, or
            anything else, that is the same capability we use every day. Share your idea with
            us and our team will work from it.
          </p>

          <h2>What we publish, and why</h2>
          <p>
            The specification sheet is the honest description of a lighting fixture, and it is
            the part that decides whether a fixture can be used. So we publish it: material,
            finish, power source, voltage, bulb base, whether bulbs and shades are included,
            the number of lights, and the dimensions in both units.
          </p>
          <p>
            Where we do not hold information (certification marks, photometric data, carton
            details, lead time) we say so plainly and send it on request. We would rather say
            &ldquo;ask us&rdquo; than print a blank row or a guess.
          </p>

          <h2>The range today</h2>
          <p>
            {site.name} currently lists 236 fixtures across {categories.length} ranges and{' '}
            {facets.finish.length} finishes. Many designs are offered in several finishes, each
            with its own product code, so a dealer can quote an exact fixture rather than a
            finish family.
          </p>

          <h2>Working with us</h2>
          <p>
            Every enquiry is answered, usually within a working day. Send us a fixture and a
            quantity and we will come back with pricing, minimum order quantity, lead time and
            packaging for your run.
          </p>
        </div>

      </div>

      <div style={{ marginTop: '3rem' }}>
        <Link href="/customise/" className="btn btn--primary">
          Send us a drawing
        </Link>
      </div>
    </div>
  );
}
