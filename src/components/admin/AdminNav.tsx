import Link from "next/link";
import { ROLE_LABEL, requireUser } from "@/lib/server/auth";
import { signOut } from "./actions";
import { ADMIN_NAV } from "./nav";

export async function AdminNav() {
  const user = await requireUser();
  const items = ADMIN_NAV.filter((n) => n.roles.includes(user.role));
  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {items.map((n) => (
          <Link key={n.href} href={n.href} className="shrink-0 px-3 py-2.5 text-[15px] text-surface/75 hover:bg-white/5 hover:text-surface">
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6 hidden border-t border-white/10 pt-5 text-sm lg:block">
        <p className="text-surface/85">{user.name}</p>
        <p className="text-mist">{ROLE_LABEL[user.role]}</p>
        <form action={signOut} className="mt-3">
          <button type="submit" className="min-h-10 text-gold underline-offset-4 hover:underline">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
