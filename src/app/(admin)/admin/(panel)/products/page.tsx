import Link from "next/link";
import { Suspense } from "react";
import { rolesFor } from "@/components/admin/nav";
import { adminButton, card, Loading, PageTitle } from "@/components/admin/ui";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export default function ProductsPage() {
  return (
    <>
      <PageTitle
        title="Products"
        actions={
          <Link href="/admin/products/new/" className={adminButton}>
            Add a grade
          </Link>
        }
      />
      <Suspense fallback={<Loading />}>
        <ProductList />
      </Suspense>
    </>
  );
}

async function ProductList() {
  await requireUser(rolesFor("/admin/products/"));
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: {
      products: {
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: { id: true, name: true, tagline: true, published: true },
      },
    },
  });
  return (
    <div className="space-y-8">
      {categories.map((c) => (
        <section key={c.id} aria-labelledby={`cat-${c.id}`}>
          <h2 id={`cat-${c.id}`} className="mb-3 font-display text-lg font-semibold">
            {c.name}
          </h2>
          {c.products.length === 0 ? (
            <p className="text-sm text-mist">No grades in this category yet.</p>
          ) : (
            <ul className={`${card} divide-y divide-white/10`}>
              {c.products.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/products/${p.id}/`}
                    className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4 hover:bg-white/[0.03]"
                  >
                    <span>
                      <span className="font-medium">{p.name}</span> <span className="ml-2 text-sm text-mist">{p.tagline}</span>
                    </span>
                    {!p.published && <span className="text-xs tracking-wide text-[#FFC27A] uppercase">Hidden</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
