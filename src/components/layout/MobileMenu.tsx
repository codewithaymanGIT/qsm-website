"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/brand/Logo";
import { CloseIcon } from "@/components/ui/icons";
import type { NavLink } from "@/lib/nav";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
  phone: string;
  whatsappUrl: string;
};

export function MobileMenu({ open, onClose, links, phone, whatsappUrl }: MobileMenuProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col bg-ink lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex h-18 items-center justify-between px-5 sm:px-8">
            <Link href="/" onClick={onClose}>
              <Logo />
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center"
              autoFocus
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 pt-8 sm:px-8">
            <ul className="space-y-1">
              {[{ href: "/", label: "Home" }, ...links, { href: "/quote/", label: "Request a quote" }].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={l.href}
                    onClick={onClose}
                    className="block py-2 font-display text-[clamp(2rem,9vw,3rem)] font-semibold tracking-tight text-surface"
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-white/10 px-5 py-6 text-surface/70 sm:px-8">
            <a href={`tel:${phone}`} className="block py-1">{phone}</a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block py-1">
              Chat on WhatsApp
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
