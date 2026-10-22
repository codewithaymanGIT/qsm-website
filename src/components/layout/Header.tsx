"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { MenuIcon, PhoneIcon } from "@/components/ui/icons";
import type { NavLink } from "@/lib/nav";
import { MobileMenu } from "./MobileMenu";

type HeaderProps = { links: NavLink[]; phone: string; whatsappUrl: string };

export function Header({ links, phone, whatsappUrl }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-500 ${
          scrolled ? "border-b border-white/8 bg-ink/90 backdrop-blur-md" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-18 max-w-[1680px] items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-12">
          <Link href="/" aria-label="Quality Steel and Metals, home">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {links.map((l) => {
                const active = pathname.startsWith(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative py-2 text-[15px] transition-colors hover:text-surface ${
                        active ? "text-surface" : "text-surface/65"
                      }`}
                    >
                      {l.label}
                      <span
                        className={`absolute -bottom-0.5 left-0 h-px bg-gold transition-[width] duration-500 ${
                          active ? "w-full" : "w-0"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={`tel:${phone}`}
              className="hidden items-center gap-2 text-[15px] text-surface/75 transition-colors hover:text-gold xl:inline-flex"
            >
              <PhoneIcon className="h-4 w-4" />
              {phone}
            </a>
            <Link
              href="/quote/"
              className="hidden min-h-11 items-center bg-gold px-5 text-[15px] font-medium text-ink transition-colors hover:bg-[#d8b679] sm:inline-flex"
            >
              Request quote
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="inline-flex h-11 w-11 items-center justify-center text-surface lg:hidden"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} links={links} phone={phone} whatsappUrl={whatsappUrl} />
    </>
  );
}
