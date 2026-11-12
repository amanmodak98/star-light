import { GeneralEnquiryForm } from '@/components/EnquiryForm';
import { site } from '@/lib/catalogue';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Contact — Wholesale Enquiries',
  description:
    'Enquire about any fixture in the Beauty Art Lights range, or send a drawing to have one made to order. We reply to every enquiry, usually within a working day.',
  path: '/contact/',
});

export default function ContactPage() {
  return (
    <div className="container section">
      <header style={{ maxWidth: '48ch', marginBottom: '3rem' }}>
        <h1 style={{ marginTop: 0 }}>Tell us what you need.</h1>
        <p className="lede" style={{ marginTop: '1.25rem' }}>
          A fixture and a quantity, a drawing to build from, or a question about the range. We
          reply to every enquiry, usually within a working day.
        </p>
      </header>

      <div className="split" style={{ alignItems: 'start' }}>
        <div className="panel">
          <p className="label">Request a quote</p>
          <div style={{ marginTop: '1.5rem' }}>
            <GeneralEnquiryForm />
          </div>
        </div>

        <aside>
          <div className="panel">
            <p className="label">Reach us directly</p>
            <dl style={{ margin: '1.25rem 0 0' }}>
              {[
                ['Email', site.email, `mailto:${site.email}`],
                [
                  'WhatsApp',
                  site.whatsapp,
                  `https://wa.me/${site.whatsappNumber}`,
                ],
                ['Website', 'www.beautyartlights.com', 'https://beautyartlights.com'],
              ].map(([key, value, href]) => (
                <div
                  key={key}
                  style={{
                    display: 'grid',
                    gap: '0.25rem',
                    paddingBlock: '0.85rem',
                    borderBottom: '1px solid var(--rule)',
                  }}
                >
                  <dt className="label">{key}</dt>
                  <dd style={{ margin: 0 }}>
                    <a
                      href={href}
                      className="dl-link"
                      style={{ fontSize: '1rem', textDecoration: 'none' }}
                      {...(href.startsWith('http') ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
                    >
                      {value}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="panel" style={{ marginTop: '1.5rem' }}>
            <p className="label">Before you write</p>
            <p className="prose" style={{ fontSize: '0.9375rem', marginTop: '1rem' }}>
              Every fixture already publishes its material, finish, power source, voltage, bulb
              base, and dimensions in both inches and centimetres. If you need the commercial
              terms (pricing, minimum order quantity, lead time, packaging or certification)
              come with your enquiry.
            </p>
            <p className="prose" style={{ fontSize: '0.9375rem', marginTop: '1rem' }}>
              If you are looking for a fixture we do not list, send a drawing or a photograph and
              we will tell you whether we can make it.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
