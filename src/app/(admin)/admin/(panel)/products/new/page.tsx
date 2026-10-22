import Link from "next/link";
import { Suspense } from "react";
import { rolesFor } from "@/components/admin/nav";
import { Loading, PageTitle } from "@/components/admin/ui";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ProductForm } from "../ProductForm";

export default function NewProductPage() {
  return (
    <>
      <Link href="/admin/products/" className="text-sm text-mist hover:text-accent">
        ← All products
      </Link>
      <PageTitle title="Add a grade" />
      <Suspense fallback={<Loading />}>
        <NewProduct />
      </Suspense>
    </>
  );
}

async function NewProduct() {
  await requireUser(rolesFor("/admin/products/"));
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });
  return <ProductForm product={null} categories={categories} />;
}
