import type { Role } from "@/generated/prisma/client";

export type AdminNavItem = { href: string; label: string; roles: Role[] };

const CONTENT: Role[] = ["ADMIN", "EDITOR"];

/** Single source for both the menu and the role checks in each page. */
export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin/", label: "Dashboard", roles: ["ADMIN", "EDITOR", "SALES"] },
  { href: "/admin/leads/", label: "Enquiries", roles: ["ADMIN", "EDITOR", "SALES"] },
  { href: "/admin/products/", label: "Products", roles: CONTENT },
  { href: "/admin/categories/", label: "Categories", roles: CONTENT },
  { href: "/admin/services/", label: "Services", roles: CONTENT },
  { href: "/admin/gallery/", label: "Gallery", roles: CONTENT },
  { href: "/admin/customers/", label: "Customers", roles: CONTENT },
  { href: "/admin/downloads/", label: "Downloads", roles: CONTENT },
  { href: "/admin/settings/", label: "Contact & timeline", roles: CONTENT },
  { href: "/admin/seo/", label: "SEO", roles: CONTENT },
  { href: "/admin/users/", label: "Users", roles: ["ADMIN"] },
];

export const rolesFor = (href: string) => ADMIN_NAV.find((n) => n.href === href)!.roles;
