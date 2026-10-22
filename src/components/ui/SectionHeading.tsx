import type { ReactNode } from "react";

type SectionHeadingProps = {
  kicker?: string;
  title: ReactNode;
  intro?: ReactNode;
  tone?: "dark" | "light";
  className?: string;
};

export function SectionHeading({ kicker, title, intro, tone = "dark", className }: SectionHeadingProps) {
  const muted = tone === "dark" ? "text-mist" : "text-neutral-600";
  const kick = tone === "dark" ? "text-gold" : "text-gold-deep";
  return (
    <div className={`max-w-4xl ${className ?? ""}`}>
      {kicker && <p className={`mb-5 text-sm font-medium ${kick}`}>{kicker}</p>}
      <h2 className="text-h2 font-semibold">{title}</h2>
      {intro && <p className={`mt-6 max-w-2xl text-lg leading-relaxed ${muted}`}>{intro}</p>}
    </div>
  );
}
