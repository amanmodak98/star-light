import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container section">
      <div style={{ maxWidth: '46ch', margin: '0 auto', textAlign: 'center' }}>
        <p className="label">404</p>
        <h1 style={{ marginTop: '0.75rem' }}>That page is not here.</h1>
        <p className="lede" style={{ margin: '1.25rem auto 0' }}>
          The link may be old. The catalogue has been rebuilt since the previous site, or the
          fixture may have been renumbered.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Link href="/catalogue/" className="btn btn--primary">
            Browse the catalogue
          </Link>
          <Link href="/contact/" className="btn btn--secondary">
            Ask us directly
          </Link>
        </div>
      </div>
    </div>
  );
}
