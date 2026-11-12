import Link from 'next/link';
import { ProductImage } from './ProductImage';
import type { IndexRow } from '@/lib/site';

/**
 * The specimen plate — a product, its finish, and the code a buyer quotes it by.
 * The SKU is never optional: 153 of the 237 derived product names are shared by
 * more than one SKU, so the code is what actually identifies a fixture in trade.
 */
export function ProductPlate({ row }: { row: IndexRow }) {
  const alt = `${row.n} in ${row.f}, product code ${row.s}`;

  return (
    <Link href={`/products/${row.u}/?sku=${row.s}`} className="plate">
      <div className="plate__frame">
        {row.img ? (
          <ProductImage
            base={row.img}
            alt={alt}
            sizes="(max-width: 520px) 45vw, (max-width: 1024px) 30vw, 260px"
            tone={row.tone}
            width={row.w}
            height={row.h}
          />
        ) : (
          <span className="visually-hidden">No photograph available</span>
        )}
      </div>
      <span className="plate__finish">
        <span className="swatch" style={{ '--swatch': row.c } as React.CSSProperties} />
        {row.f}
      </span>
      <div className="plate__body">
        <span className="plate__name">{row.n}</span>
        <span className="plate__sku">{row.s}</span>
      </div>
    </Link>
  );
}
