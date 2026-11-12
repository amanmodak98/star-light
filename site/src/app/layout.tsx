import type { Metadata, Viewport } from 'next';
import '@/styles/fonts.css';
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/components.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { SITE_URL, categories } from '@/lib/catalogue';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Beauty Art Lights, Wholesale Decorative Lighting',
    template: '%s | Beauty Art Lights',
  },
  description:
    'Wholesale decorative lighting, made to order. 236 fixtures across 10 ranges and 12 finishes, with full specification, dimensions in inches and centimetres, and a quote for every item.',
  applicationName: 'Beauty Art Lights',
  authors: [{ name: 'Beauty Art Lights' }],
  openGraph: {
    type: 'website',
    siteName: 'Beauty Art Lights',
    locale: 'en',
    url: SITE_URL,
    title: 'Beauty Art Lights — Wholesale Decorative Lighting',
    description:
      '236 fixtures across 10 ranges and 12 finishes, with full specification and a quote for every item.',
    images: [{ url: '/brand/og.jpg', width: 1200, height: 630, alt: 'Beauty Art Lights' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beauty Art Lights — Wholesale Decorative Lighting',
    description: 'Wholesale decorative lighting, made to order.',
    images: ['/brand/og.jpg'],
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#FBF8F3',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header categories={categories} />
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
