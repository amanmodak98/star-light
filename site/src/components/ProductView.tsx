'use client';

import { useEffect, useState } from 'react';
import type { Design } from '@/lib/site';
import { findFinish, formatCanopy, formatDimensions } from '@/lib/site';
import { Gallery } from './Gallery';
import { EnquiryForm } from './EnquiryForm';

/**
 * Fields a wholesale buyer asks for that the source catalogue does not hold.
 * They are listed as available on request rather than shown blank — a blank row
 * reads as an oversight, and an invented value would be a lie.
 */
const ON_REQUEST = [
  'Wattage, lumens, CRI and colour temperature',
  'IP / outdoor rating',
  'Certification marks (BIS/ISI, CE, UL, RoHS)',
  'Minimum order quantity',
  'Carton dimensions, gross weight, units per carton',
  'Lead time and country of origin',
  'HS code',
];

export function ProductView({ design }: { design: Design }) {
  const [sku, setSku] = useState(design.finishes[0].sku);

  // A finish can be deep-linked (?sku=BT034) so a buyer can be sent straight to
  // the colour they need without going through the selector.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('sku');
    if (fromUrl && design.finishes.some((f) => f.sku === fromUrl)) {
      setSku(fromUrl);
    }
  }, [design]);

  const finish = findFinish(design, sku);

  const select = (next: string) => {
    setSku(next);
    const url = new URL(window.location.href);
    url.searchParams.set('sku', next);
    window.history.replaceState({}, '', url);
  };

  const dims = formatDimensions(finish.dimensions);
  const canopy = formatCanopy(finish.canopy);

  /**
   * The sheet is grouped into three clusters rather than one list of ten.
   * A buyer asks three separate questions: what is it, how is it fitted, and
   * what paperwork comes with it.
   */
  const specGroups: { title: string; rows: { key: string; value: string; mono?: boolean }[] }[] = [
    {
      title: 'The fixture',
      rows: [
        { key: 'Product code', value: finish.sku, mono: true },
        { key: 'Finish', value: finish.finish },
        { key: 'Material', value: finish.spec.material },
        { key: 'Number of bulbs', value: String(design.bulbs), mono: true },
      ],
    },
    {
      title: 'The installation',
      rows: [
        { key: 'Power source', value: finish.spec.power_source },
        { key: 'Voltage', value: finish.spec.voltage, mono: true },
        { key: 'Bulb base', value: finish.spec.bulb_base, mono: true },
        { key: 'Bulb included', value: finish.spec.bulb_included },
        { key: 'Shade included', value: finish.spec.shade_included },
        { key: 'Assembly required', value: finish.spec.assembly_required },
      ],
    },
  ];

  return (
    <div className="product">
      <Gallery
        key={finish.sku}
        images={finish.images}
        alt={`${design.name} in ${finish.finish}, ${finish.sku}`}
      />

      <div className="sticky-buy">
        <p className="label">Trade price</p>
        <p
          style={{
            fontSize: 'var(--step-2)',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            marginTop: '0.25rem',
          }}
        >
          Price on request
        </p>

        <div className="finishes" role="group" aria-label="Choose a finish">
          {design.finishes.map((f) => (
            <button
              key={f.sku}
              type="button"
              className="finish-opt"
              aria-current={f.sku === sku ? 'true' : undefined}
              onClick={() => select(f.sku)}
            >
              <span className="swatch" style={{ '--swatch': f.swatch } as React.CSSProperties} />
              {f.finish}
              <span className="finish-opt__sku">{f.sku}</span>
            </button>
          ))}
        </div>

        <p className="prose" style={{ maxWidth: '52ch' }}>
          {finish.description}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <a className="btn btn--brass" href="#enquiry">
            Request a quote
          </a>
          <a
            className="btn btn--secondary"
            href={`https://wa.me/911332351546?text=${encodeURIComponent(
              `Hello Beauty Art Lights,\n\nI would like a quote for ${design.name} in ${finish.finish} (${finish.sku}).`,
            )}`}
          >
            Ask on WhatsApp
          </a>
        </div>

        <h2 style={{ fontSize: 'var(--step-2)', marginTop: '3rem' }}>Specification</h2>
        <div className="spec" style={{ marginTop: '1rem' }}>
          {specGroups.map((group) => (
            <div className="spec__group" key={group.title}>
              <p className="spec__group-title">{group.title}</p>
              {group.rows.map((row) => (
                <div className="spec__row" key={row.key}>
                  <span className="spec__key">{row.key}</span>
                  <span className={`spec__value${row.mono ? ' spec__value--mono' : ''}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          ))}
          <div className="spec__group">
            <p className="spec__group-title">The paperwork</p>
            <div className="spec__row">
              <span className="spec__key">Certification</span>
              <span className="spec__value spec__value--pending">
                Not published for this item.{' '}
                <a href="#enquiry" style={{ color: 'var(--brass)' }}>
                  ask and we will send the compliance details
                </a>
              </span>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: 'var(--step-2)', marginTop: '2.5rem' }}>Dimensions</h2>
        {dims ? (
          <div className="spec" style={{ marginTop: '1rem' }}>
            <div className="spec__row">
              <span className="spec__key">Width × depth × height</span>
              <span className="spec__value spec__value--mono">{dims}</span>
            </div>
            {canopy && (
              <div className="spec__row">
                <span className="spec__key">Canopy</span>
                <span className="spec__value spec__value--mono">{canopy}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="spec__value spec__value--pending" style={{ marginTop: '1rem' }}>
            Dimensions were not recorded for this item. Ask and we will confirm them.
          </p>
        )}

        <h2 style={{ fontSize: 'var(--step-2)', marginTop: '2.5rem' }}>Also available on request</h2>
        <p className="prose" style={{ fontSize: '0.9375rem', marginTop: '0.5rem' }}>
          Alongside the specification above, we can supply:
        </p>
        <ul className="prose" style={{ marginTop: '0.75rem', paddingLeft: '1.1rem' }}>
          {ON_REQUEST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <p className="prose" style={{ fontSize: '0.9375rem', marginTop: '2rem' }}>
          <strong style={{ color: 'var(--ink)' }}>Suited to</strong>{' '}
          {design.suitedTo.join(', ')}.
        </p>
      </div>

      <section id="enquiry" style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
        <div className="panel">
          <h2 style={{ fontSize: 'var(--step-3)', marginTop: '0.5rem' }}>
            Request a quote for {design.name} in {finish.finish}
          </h2>
          <p className="lede" style={{ marginTop: '0.75rem', marginBottom: '2rem' }}>
            Tell us the quantity and destination. We reply to every enquiry, usually within a
            working day.
          </p>
          <EnquiryForm design={design} finish={finish} />
        </div>
      </section>
    </div>
  );
}
