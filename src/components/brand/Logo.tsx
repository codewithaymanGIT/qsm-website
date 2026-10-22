// Quality Steel and Metals "QSM" logo, redrawn as a vector from the company's logo artwork.
// tone="dark" (dark backgrounds): the Q turns white so it stays visible; brand blue and green are unchanged.

type LogoProps = {
  variant?: "full" | "mark";
  tone?: "dark" | "light";
  className?: string;
};

export const BRAND = { blue: "#4C9BDF", green: "#55AC5D", grey: "#3A3A3C" };

/** The QSM mark: Q, SM, swoosh and underline. ViewBox keeps the artwork's proportions. */
export function LogoMark({ tone = "dark", className }: Omit<LogoProps, "variant">) {
  const q = tone === "dark" ? "#F5F8FC" : BRAND.grey;
  return (
    <svg viewBox="0 150 916 470" role="img" aria-label="QSM" className={className}>
      {/* Green swoosh over SM */}
      <path
        d="M405 212 C520 172 760 176 862 250 C918 298 920 404 852 522 C876 424 872 330 816 276 C736 214 566 200 405 212 Z"
        fill={BRAND.green}
      />
      {/* Small green stroke on the left */}
      <path d="M6 364 L38 344" stroke={BRAND.green} strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* Q: ring and tail */}
      <path
        fillRule="evenodd"
        fill={q}
        d="M232 156 C328 156 386 236 386 334 C386 432 328 512 232 512 C136 512 78 432 78 334 C78 236 136 156 232 156 Z M232 232 C182 232 150 276 150 334 C150 392 182 436 232 436 C282 436 316 392 316 334 C316 276 282 232 232 232 Z"
      />
      <path d="M214 396 L252 370 L386 490 L356 524 Z" fill={q} />
      {/* Green highlight inside the Q */}
      <path d="M184 280 C214 268 244 258 270 254" stroke={BRAND.green} strokeWidth="10" strokeLinecap="round" fill="none" />
      <text
        x="438"
        y="474"
        fill={BRAND.blue}
        fontFamily="'Times New Roman', Georgia, 'Noto Serif', serif"
        fontSize="182"
        fontWeight="600"
        letterSpacing="-4"
      >
        SM
      </text>
      {/* Blue wedge underline */}
      <path d="M28 513 L300 537 L665 588 L120 598 L92 585 Z" fill={BRAND.blue} />
    </svg>
  );
}

export function Logo({ variant = "full", tone = "dark", className }: LogoProps) {
  if (variant === "mark") return <LogoMark tone={tone} className={className} />;
  const text = tone === "dark" ? "text-surface" : "text-ink";
  const sub = tone === "dark" ? "text-accent" : "text-accent-deep";
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <LogoMark tone={tone} className="h-11 w-auto shrink-0 lg:h-12" />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[15px] font-semibold tracking-[0.04em] ${text}`}>QUALITY STEEL</span>
        <span className={`mt-1 font-display text-[9.5px] font-medium tracking-[0.36em] ${sub}`}>&amp; METALS</span>
      </span>
    </span>
  );
}
