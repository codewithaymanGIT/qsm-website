import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "section";
};

/**
 * Subtle scroll reveal driven purely by CSS scroll timelines (see globals.css).
 * Content is visible at rest: browsers without scroll timelines, no-JS
 * visitors, crawlers and reduced-motion users simply see it in place.
 */
export function Reveal({ children, className, as: Tag = "div" }: RevealProps) {
  return (
    <Tag data-reveal="" className={className}>
      {children}
    </Tag>
  );
}
