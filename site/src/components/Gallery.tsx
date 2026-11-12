'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowsOut, X } from '@phosphor-icons/react/dist/ssr';
import type { ProductImage } from '@/lib/site';
import { ProductImage as Img } from './ProductImage';

/**
 * The product gallery: a large plate, six thumbnails, and a lightbox.
 * The full uncropped frame is what the lightbox shows, which is why the build
 * keeps the trimmed frame for the grid and lets the lightbox use the same asset
 * at its largest available size.
 */
export function Gallery({ images, alt }: { images: ProductImage[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const current = images[active];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowRight') setActive((a) => (a + 1) % images.length);
      if (e.key === 'ArrowLeft') setActive((a) => (a - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, images.length]);

  if (!current) {
    return (
      <div className="gallery__main" style={{ display: 'grid', placeItems: 'center' }}>
        <p className="label">No photograph available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="gallery__main">
        <Img
          base={current.base}
          alt={`${alt}, view ${active + 1} of ${images.length}`}
          sizes="(max-width: 940px) 92vw, 46vw"
          tone={current.tone}
          width={current.width}
          height={current.height}
          priority
        />
        {images.length > 1 && (
          <button
            type="button"
            className="lightbox__close"
            style={{ position: 'absolute', top: '1rem', right: '1rem', borderColor: 'var(--rule-strong)', color: 'var(--ink)' }}
            onClick={() => setOpen(true)}
            aria-label={`Enlarge ${alt}`}
          >
            <ArrowsOut size={15} weight="light" aria-hidden="true" />
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="gallery__thumbs">
          {images.map((img, i) => (
            <button
              key={img.base}
              type="button"
              className="gallery__thumb"
              aria-pressed={i === active}
              aria-label={`View ${alt}, image ${i + 1}`}
              onClick={() => setActive(i)}
            >
              <Img
                base={img.base}
                alt=""
                sizes="120px"
                tone={img.tone}
                width={img.width}
                height={img.height}
              />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <button
            ref={closeRef}
            type="button"
            className="lightbox__close"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X size={15} weight="light" aria-hidden="true" />
          </button>
          <img className="lightbox__img" src={`/img/${current.base}-1280.webp`} alt={`${alt}, enlarged`} />
          <p className="lightbox__caption">
            {alt} · {active + 1} / {images.length}
          </p>
        </div>
      )}
    </div>
  );
}
