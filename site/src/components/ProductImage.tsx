import Image from 'next/image';
import type { CSSProperties } from 'react';

type Props = {
  /** The image's base file name, e.g. "626022801". */
  base: string;
  alt: string;
  sizes: string;
  /** The photograph's own backdrop colour, painted onto the plate behind it. */
  tone: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
};

/**
 * A catalogue photograph, rendered onto a plate painted in that photograph's own
 * backdrop tone. The seam between the image and its card therefore disappears
 * instead of showing as a rectangle.
 *
 * Deliberately free of any data import: this component is used inside client
 * components, and the catalogue JSON must not travel to the browser.
 */
export function ProductImage({
  base,
  alt,
  sizes,
  tone,
  width,
  height,
  priority,
  className,
}: Props) {
  return (
    <Image
      src={base}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
      style={{ '--plate': tone } as CSSProperties}
    />
  );
}
