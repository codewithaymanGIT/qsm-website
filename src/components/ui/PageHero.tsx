import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "./Container";

type Crumb = { href: string; label: string };

type PageHeroProps = {
  title: ReactNode;
  intro?: ReactNode;
  crumbs?: Crumb[];
  children?: ReactNode;
  /** Very large title, used for grade names. */
  huge?: boolean;
};

/** Header band for inner pages: the stacked-plate motif at rest, no imagery needed. */
export function PageHero({ title, intro, crumbs, children, huge }: PageHeroProps) {
  return (
    <section className="steel-texture grain relative isolate overflow-hidden border-b border-white/8 pt-36 pb-16 lg:pt-44 lg:pb-24">
      <div aria-hidden="true" className="absolute top-24 -right-24 -z-10 hidden w-[42%] max-w-[640px] md:block">
        <div className="hero-plate h-10 w-[78%] bg-gradient-to-r from-[#7a5d24] via-[#d9b877] to-[#8c6c33] opacity-70 lg:h-14" />
        <div className="hero-plate mt-4 ml-[10%] h-10 w-[78%] bg-gradient-to-r from-[#1b1b1b] via-[#3a3a3a] to-[#161616] lg:h-14" style={{ animationDelay: "0.12s" }} />
        <div className="hero-plate mt-4 ml-[20%] h-10 w-[78%] bg-gradient-to-r from-[#1b1b1b] via-[#3a3a3a] to-[#161616] opacity-50 lg:h-14" style={{ animationDelay: "0.24s" }} />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
      <Container>
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-mist">
              {crumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  <Link href={c.href} className="hover:text-gold">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1
          className={`hero-fade font-semibold ${
            huge
              ? "font-display text-[clamp(4.5rem,15vw,13rem)] leading-[0.85] tracking-[-0.045em]"
              : "text-display max-w-[16ch]"
          }`}
        >
          {title}
        </h1>
        {intro && (
          <p className="hero-fade mt-8 max-w-2xl text-lg leading-relaxed text-surface/70" style={{ animationDelay: "0.15s" }}>
            {intro}
          </p>
        )}
        {children}
      </Container>
    </section>
  );
}
