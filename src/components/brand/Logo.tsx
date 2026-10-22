type LogoProps = {
  variant?: "full" | "mark";
  tone?: "dark" | "light";
  className?: string;
};

/** Direction D, "Stacked Plates": three plates stepped like a stock rack, gold on top. */
export function LogoMark({ tone = "dark", className }: Omit<LogoProps, "variant">) {
  const plate = tone === "dark" ? "#F8F8F8" : "#0A0A0A";
  const gold = tone === "dark" ? "#C9A35D" : "#9C7A36";
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect x="4" y="12" width="40" height="10" fill={gold} />
      <rect x="4" y="22" width="40" height="1.5" fill="#000" opacity="0.35" />
      <rect x="12" y="27" width="40" height="10" fill={plate} />
      <rect x="20" y="42" width="40" height="10" fill={plate} opacity="0.5" />
    </svg>
  );
}

export function Logo({ variant = "full", tone = "dark", className }: LogoProps) {
  if (variant === "mark") return <LogoMark tone={tone} className={className} />;
  const text = tone === "dark" ? "text-surface" : "text-ink";
  const sub = tone === "dark" ? "text-gold" : "text-gold-deep";
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <LogoMark tone={tone} className="h-9 w-9 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[15px] font-semibold tracking-[0.04em] ${text}`}>
          QUALITY STEEL
        </span>
        <span className={`mt-1 font-display text-[9.5px] font-medium tracking-[0.36em] ${sub}`}>
          &amp; METALS
        </span>
      </span>
    </span>
  );
}
