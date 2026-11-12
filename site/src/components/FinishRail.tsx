import Link from 'next/link';
import { facets } from '@/lib/catalogue';

const slug = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * The finish rail.
 *
 * Finish is the catalogue's real axis — 12 finishes, with matte black, red, gold
 * brass and antique brass alone covering 78% of it — so it is given the
 * prominence of a first-class filter rather than being buried in a facet list.
 * The swatch is the actual finish colour, so a buyer can pick the one they need
 * before they read a single word of copy.
 */
export function FinishRail({ heading, note }: { heading?: string; note?: string }) {
  const finishes = facets.finish ?? [];

  return (
    <section className="rail">
      <div className="container">
        {heading && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <h2 style={{ fontSize: 'var(--step-2)' }}>{heading}</h2>
            {note && (
              <p className="mono" style={{ color: 'var(--ink-3)', maxWidth: '46ch' }}>
                {note}
              </p>
            )}
          </div>
        )}
        <div className="rail__track">
          {finishes.map((f) => (
            <Link key={f.value} href={`/catalogue/?finish=${slug(f.value)}`} className="chip">
              <span className="swatch" style={{ '--swatch': f.swatch } as React.CSSProperties} />
              {f.value}
              <span className="chip__count">{f.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
