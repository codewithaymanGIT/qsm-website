import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { getCategories, getServices, getSettings } from "@/lib/content";
import { getNavLinks } from "@/lib/nav";

export function Footer() {
  const s = getSettings();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/8 bg-ink pb-24 lg:pb-0">
      <div className="mx-auto grid max-w-[1680px] gap-14 px-5 py-20 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-12">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-6 leading-relaxed text-mist">
            Importer, stockist, distributor and trader of tool steel, die steel, plastic mould steel and special
            alloy steel since 2002.
          </p>
        </div>
        <FooterList title="Products" items={getCategories().map((c) => ({ href: `/products/${c.slug}/`, label: c.name }))} />
        <FooterList
          title="Company"
          items={[
            ...getNavLinks(),
            ...getServices().map((sv) => ({ href: `/services/${sv.slug}/`, label: sv.name })),
          ]}
        />
        <div>
          <h2 className="font-display text-sm font-medium text-gold">Contact</h2>
          <address className="mt-5 space-y-2 not-italic text-surface/75">
            <p>{s.contactName}</p>
            <p><a href={`tel:${s.phone}`} className="hover:text-gold">{s.phone}</a></p>
            <p><a href={`mailto:${s.email}`} className="hover:text-gold">{s.email}</a></p>
            <p className="text-mist">{s.officeAddress}</p>
          </address>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1680px] flex-col gap-2 border-t border-white/8 px-5 py-6 text-sm text-mist sm:flex-row sm:justify-between sm:px-8 lg:px-12">
        <p>© {year} {s.companyName}</p>
        <p>Established 2002</p>
      </div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="font-display text-sm font-medium text-gold">{title}</h2>
      <ul className="mt-5 space-y-2.5">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="text-surface/75 transition-colors hover:text-gold">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
