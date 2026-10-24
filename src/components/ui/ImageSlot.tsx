type ImageSlotProps = {
  label: string;
  className?: string;
  /** An uploaded photo; without one a plain steel texture is shown. */
  src?: string | null;
};

/** A photo, or a plain steel texture until one is uploaded in the admin. */
export function ImageSlot({ label, className, src }: ImageSlotProps) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- admin uploads are already sized; no image optimiser in the container
    return <img src={src} alt={label} loading="lazy" decoding="async" data-image-slot={label} className={`object-cover ${className ?? ""}`} />;
  }
  return <div role="img" aria-label={label} data-image-slot={label} className={`steel-texture grain relative overflow-hidden ${className ?? ""}`} />;
}
