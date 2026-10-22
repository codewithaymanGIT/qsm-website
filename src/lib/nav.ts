import { getPartners } from "./content";

export type NavLink = { href: string; label: string };

/** Clients & Partners only appears once real logos exist. */
export async function getNavLinks(): Promise<NavLink[]> {
  return [
    { href: "/about/", label: "About" },
    { href: "/products/", label: "Products" },
    { href: "/services/", label: "Services" },
    { href: "/weight-calculator/", label: "Weight calculator" },
    ...((await getPartners()).length > 0 ? [{ href: "/clients-partners/", label: "Clients & Partners" }] : []),
    { href: "/contact/", label: "Contact" },
  ];
}
