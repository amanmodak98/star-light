import { plateTone, renderedSize } from '@/lib/catalogue';
import { ProductImage } from './ProductImage';

/**
 * The server-side wrapper: resolves an image's backdrop tone and rendered size
 * from the manifest, then hands them to the client-safe ProductImage.
 */
export function PlateImage({
  base,
  alt,
  sizes,
  priority,
  className,
}: {
  base: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const { width, height } = renderedSize(base);
  return (
    <ProductImage
      base={base}
      alt={alt}
      sizes={sizes}
      tone={plateTone(base)}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
