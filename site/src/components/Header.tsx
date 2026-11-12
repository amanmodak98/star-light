'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import type { Category } from '@/lib/site';

const NAV = [
  { href: '/catalogue/', label: 'Catalogue' },
  { href: '/customise/', label: 'Customise' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
];

/**
 * The masthead.
 *
 * A client component so the current page can be marked in the navigation — the
 * ranges are passed in as props rather than imported, so the catalogue JSON
 * never travels to the browser.
 */
export function Header({ categories }: { categories: Category[] }) {
  const pathname = usePathname();

  return (
    <header className="masthead">
      <div className="container masthead__inner">
        <Link href="/" className="brand" aria-label="Beauty Art Lights, home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/seal-64.png"
            alt=""
            width={64}
            height={64}
            className="brand__seal"
          />
          <span>
            <span className="brand__word">Beauty Art Lights</span>
            <span className="brand__sub">Wholesale · Decor Lighting</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="nav__link"
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/catalogue/" className="btn btn--secondary">
          <span className="btn__label-full">Browse the catalogue</span>
          <span className="btn__label-short">Catalogue</span>
          <span className="btn__icon"><ArrowUpRight size={13} weight="light" aria-hidden="true" /></span>
        </Link>
      </div>

      {/* The ten ranges, always reachable — the source site hid half of them
          behind a dropdown that listed two empty categories. */}
      <div className="container" style={{ paddingBottom: '1rem' }}>
        <nav className="rail__track" aria-label="Product ranges" style={{ gap: '0.375rem' }}>
          {categories.map((cat) => {
            const active = pathname === `/catalogue/${cat.slug}/`;
            return (
              <Link
                key={cat.slug}
                href={`/catalogue/${cat.slug}/`}
                className="chip"
                aria-current={active ? 'true' : undefined}
                style={
                  active
                    ? { background: 'var(--ink)', borderColor: 'var(--ink)', color: 'var(--paper)' }
                    : undefined
                }
              >
                {cat.label}
                <span className="chip__count">{cat.skuCount}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
