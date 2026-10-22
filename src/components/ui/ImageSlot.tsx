type ImageSlotProps = {
  label: string;
  shot?: string;
  className?: string;
  /** Hide the label, e.g. for purely decorative slots. */
  quiet?: boolean;
  /** A real photo; when set it replaces the stand-in. */
  src?: string | null;
};

/**
 * Stand-in for photography until the company's shoot is delivered.
 * Shows a generated steel texture with what the photo should be.
 */
export function ImageSlot({ label, shot, className, quiet, src }: ImageSlotProps) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- admin uploads are already sized; no image optimiser in the container
    return <img src={src} alt={label} loading="lazy" decoding="async" className={`object-cover ${className ?? ""}`} />;
  }
  return (
    <div
      role="img"
      aria-label={label}
      data-image-slot={label}
      className={`steel-texture grain relative overflow-hidden ${className ?? ""}`}
    >
      {!quiet && (
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="text-[13px] font-medium text-surface/80">{label}</p>
          {shot && <p className="mt-1 text-xs leading-snug text-surface/45">Photo to come: {shot}</p>}
        </div>
      )}
    </div>
  );
}
