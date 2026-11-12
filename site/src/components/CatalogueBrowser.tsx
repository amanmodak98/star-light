'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ProductPlate } from './ProductPlate';
import type { Facets, IndexRow } from '@/lib/site';

type Axis = 'category' | 'finish' | 'bulb_base' | 'number_of_bulbs' | 'power_source' | 'material';

const AXES: { key: Axis; param: string; label: string; get: (r: IndexRow) => string }[] = [
  { key: 'category', param: 'cat', label: 'Range', get: (r) => r.l },
  { key: 'finish', param: 'finish', label: 'Finish', get: (r) => r.f },
  { key: 'bulb_base', param: 'base', label: 'Bulb base', get: (r) => r.e },
  { key: 'number_of_bulbs', param: 'bulbs', label: 'Number of bulbs', get: (r) => String(r.b) },
  { key: 'power_source', param: 'power', label: 'Power source', get: (r) => r.p },
  { key: 'material', param: 'material', label: 'Material', get: (r) => r.m },
];

const slug = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export type Filters = Record<Axis, string[]>;

const EMPTY_FILTERS: Filters = {
  category: [],
  finish: [],
  bulb_base: [],
  number_of_bulbs: [],
  power_source: [],
  material: [],
};

/**
 * The faceted catalogue.
 *
 * Working filters are the clearest available differentiator: the incumbent
 * Indian B2B lighting marketplace serves its category pages with zero
 * checkboxes and zero selects. The filter state lives in the URL, so a buyer
 * can send a dealer the exact view they are looking at.
 */
export function CatalogueBrowser({
  rows,
  facets,
  lockedCategory,
}: {
  rows: IndexRow[];
  facets: Facets;
  lockedCategory?: string;
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [ready, setReady] = useState(false);

  /**
   * The URL carries a slug for each selected value; the facets carry the display
   * value. This maps between them in both directions, so a shared link restores
   * exactly the view it was sent from.
   */
  const slugToValue = useMemo(() => {
    const map = {} as Record<Axis, Map<string, string>>;
    for (const axis of AXES) {
      const m = new Map<string, string>();
      for (const opt of facets[axis.key] ?? []) {
        m.set(opt.slug ?? slug(opt.value), opt.value);
      }
      map[axis.key] = m;
    }
    return map;
  }, [facets]);

  // Read the URL once on mount so a shared link opens the same view.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next: Filters = { ...EMPTY_FILTERS };
    for (const axis of AXES) {
      const values = params.getAll(axis.param);
      if (values.length) {
        next[axis.key] = values
          .map((v) => slugToValue[axis.key].get(v))
          .filter((v): v is string => Boolean(v));
      }
    }
    if (lockedCategory) next.category = [lockedCategory];
    setFilters(next);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedCategory, slugToValue]);

  const writeUrl = (next: Filters) => {
    const params = new URLSearchParams();
    for (const axis of AXES) {
      for (const value of next[axis.key]) {
        const opt = (facets[axis.key] ?? []).find((o) => o.value === value);
        params.append(axis.param, opt?.slug ?? slug(value));
      }
    }
    const qs = params.toString();
    window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);
  };

  const toggle = (axis: Axis, value: string) => {
    const current = filters[axis];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const updated = { ...filters, [axis]: next };
    if (!lockedCategory) updated.category = filters.category;
    setFilters(updated);
    writeUrl(updated);
  };

  const clearAll = () => {
    const next = { ...EMPTY_FILTERS };
    if (lockedCategory) next.category = [lockedCategory];
    setFilters(next);
    writeUrl(next);
  };

  const passes = (row: IndexRow, axis: Axis, values: string[]) => {
    if (!values.length) return true;
    const get = AXES.find((a) => a.key === axis)!.get;
    const actual = get(row);
    return actual !== '' && values.includes(actual);
  };

  const matchesAll = (row: IndexRow, except?: Axis) =>
    AXES.every((axis) => (axis.key === except ? true : passes(row, axis.key, filters[axis.key])));

  const results = useMemo(
    () => rows.filter((r) => matchesAll(r)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, filters],
  );

  /**
   * Counts are computed with the axis being counted excluded, so an option
   * shows how many fixtures you would get if you added it — the behaviour a
   * buyer expects from a catalogue, and the one that stops dead ends.
   */
  const countFor = (axis: Axis, value: string) =>
    rows.filter((r) => matchesAll(r, axis) && passes(r, axis, [value])).length;

  const activeCount = AXES.reduce((n, axis) => n + filters[axis.key].length, 0);
  const hasFilters = activeCount > 0;

  return (
    <div className="catalogue">
      <aside className="filters" aria-label="Filter the catalogue">
        {AXES.map((axis) => {
          if (axis.key === 'finish') return null; // the finish gets the rail below
          const options = facets[axis.key] ?? [];
          if (!options.length) return null;
          return (
            <div className="filters__group" key={axis.key}>
              <div className="filters__head">
                <span className="label">{axis.label}</span>
              </div>
              {options.map((opt) => {
                const n = countFor(axis.key, opt.value);
                const checked = filters[axis.key].includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`filter-opt${n === 0 && !checked ? ' filter-opt--disabled' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={n === 0 && !checked}
                      onChange={() => toggle(axis.key, opt.value)}
                    />
                    <span>{opt.value}</span>
                    <span className="filter-opt__count">{n}</span>
                  </label>
                );
              })}
            </div>
          );
        })}

        {hasFilters && (
          <button type="button" className="btn btn--quiet" onClick={clearAll}>
            Clear all filters
          </button>
        )}
      </aside>

      <div>
        {/* The finish rail — the catalogue's real axis, given the prominence it
            deserves rather than being buried in a facet list. */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="filters__head" style={{ marginBottom: '0.75rem' }}>
            <span className="label">Finish</span>
            <span className="mono" style={{ color: 'var(--ink-3)' }}>
              {filters.finish.length ? `${filters.finish.length} selected` : 'all finishes'}
            </span>
          </div>
          <div className="rail__track">
            {(facets.finish ?? []).map((opt) => {
              const checked = filters.finish.includes(opt.value);
              const n = countFor('finish', opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  className="chip"
                  aria-pressed={checked}
                  disabled={n === 0 && !checked}
                  onClick={() => toggle('finish', opt.value)}
                >
                  <span className="swatch" style={{ '--swatch': opt.swatch } as React.CSSProperties} />
                  {opt.value}
                  <span className="chip__count">{n}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="results">
          <p className="results__count" aria-live="polite">
            {ready
              ? `${results.length} of ${rows.length} fixtures`
              : `Loading ${rows.length} fixtures…`}
          </p>
          {hasFilters && (
            <div className="results__actions">
              <button type="button" className="btn btn--quiet" onClick={clearAll}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {results.length ? (
          <div className="grid-products">
            {results.map((row) => (
              <ProductPlate key={`${row.d}-${row.s}`} row={row} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>No fixtures match that combination</h3>
            <p>
              Try removing a filter, or send us the specification you are looking for and we
              will tell you whether we can make it.
            </p>
            <Link href="/contact/" className="btn btn--secondary">
              Ask about a specification
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
