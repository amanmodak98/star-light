import { site } from '@/lib/catalogue';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Privacy',
  description:
    'How Beauty Art Lights handles information submitted through this website. This site sets no cookies, runs no analytics, and sends no data to third parties.',
  path: '/privacy/',
});

export default function PrivacyPage() {
  return (
    <div className="container-narrow section">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ marginTop: 0 }}>What this site does with your information.</h1>
        <p className="lede" style={{ marginTop: '1.25rem' }}>
          This is a short policy because there is very little to describe.
        </p>
      </header>

      <div className="prose">
        <h2 style={{ marginTop: 0 }}>Enquiries</h2>
        <p>
          The enquiry forms on this site do not submit to a server. When you choose{' '}
          <strong>Send by email</strong>, your own email application opens with the message
          already written. When you choose <strong>Send on WhatsApp</strong>, WhatsApp opens with
          the message already written. The website itself neither receives nor stores what you
          type. The message travels directly from your device to the address you chose.
        </p>
        <p>
          If you send us an enquiry, we will keep it and use it to answer you and to prepare a
          quote. We do not sell it, and we do not pass it to third parties for marketing.
        </p>

        <h2>Cookies and tracking</h2>
        <p>
          This site sets no cookies, runs no analytics, embeds no third-party widgets, and loads
          no fonts or scripts from other companies. Your fonts and images are served from this
          domain, so visiting a page here does not tell anyone else that you were here.
        </p>

        <h2>Server logs</h2>
        <p>
          As with any website, the host serving these pages may keep standard server logs
          (the requested address, the time of the request, the browser used) for security and
          troubleshooting. Those logs are not used to build a profile of you.
        </p>

        <h2>Links to other sites</h2>
        <p>
          Where we link to another website, for example a supplier or a mail service, that site
          has its own privacy policy, and we are not responsible for it.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy, or a request to see or correct information you have sent
          us, write to{' '}
          <a href={`mailto:${site.email}`} style={{ color: 'var(--brass)' }}>
            {site.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
