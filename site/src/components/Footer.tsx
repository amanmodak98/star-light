import Link from 'next/link';
import { categories, site } from '@/lib/catalogue';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Link href="/" className="brand" style={{ marginBottom: '1.25rem' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/seal-64.png" alt="" width={64} height={64} className="brand__seal" />
              <span>
                <span className="brand__word">Beauty Art Lights</span>
                <span className="brand__sub">Wholesale · Decor Lighting</span>
              </span>
            </Link>
            <p className="prose" style={{ fontSize: '0.9375rem', maxWidth: '34ch' }}>
              Manufacturers of decorative lighting: indoor and outdoor lamps, pendants, sconces,
              chandeliers and handmade pieces for homes and hotels.
            </p>
          </div>

          <div>
            <p className="footer__head">Ranges</p>
            <ul className="footer__list">
              {categories.slice(0, 7).map((c) => (
                <li key={c.slug}>
                  <Link href={`/catalogue/${c.slug}/`}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="footer__head">The catalogue</p>
            <ul className="footer__list">
              <li>
                <Link href="/catalogue/">All fixtures</Link>
              </li>
              {categories.slice(7).map((c) => (
                <li key={c.slug}>
                  <Link href={`/catalogue/${c.slug}/`}>{c.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/customise/">Customise a fixture</Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="footer__head">Contact</p>
            <ul className="footer__list">
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${site.whatsappNumber}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  WhatsApp {site.whatsapp}
                </a>
              </li>
              <li>
                <Link href="/contact/">Contact us</Link>
              </li>
              <li>
                <Link href="/about/">About us</Link>
              </li>
              <li>
                <Link href="/privacy/">Privacy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__base">
          <span>© {new Date().getFullYear()} Beauty Art Lights</span>
          <span>We typically reply in 24-48 hours</span>
        </div>
      </div>
    </footer>
  );
}
