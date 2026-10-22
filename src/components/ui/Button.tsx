import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  variant?: "gold" | "ghost" | "dark";
  children: ReactNode;
  className?: string;
  external?: boolean;
};

const variants = {
  gold: "bg-gold text-ink hover:bg-[#d8b679]",
  ghost: "border border-white/25 text-surface hover:border-gold hover:text-gold",
  dark: "bg-ink text-surface hover:bg-graphite",
};

export function Button({ href, variant = "gold", children, className, external }: ButtonProps) {
  const cls = `group inline-flex min-h-12 items-center justify-center gap-2.5 px-7 text-[15px] font-medium transition-colors duration-300 ${variants[variant]} ${className ?? ""}`;
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
