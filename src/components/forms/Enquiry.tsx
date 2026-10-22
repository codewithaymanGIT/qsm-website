import { Suspense } from "react";
import { getProducts, getSettings } from "@/lib/content";
import { QuoteForm, QuoteFormFromUrl } from "./QuoteForm";

type Props = { defaultGrade?: string; service?: string; title?: string };

/** Server wrapper: feeds the form its grade list and contact number. */
export function Enquiry(props: Props) {
  const grades = getProducts().map((p) => ({ slug: p.slug, name: p.name }));
  const shared = { grades, whatsapp: getSettings().whatsapp, ...props };
  // Reading ?grade= needs a Suspense boundary in a static export; the fallback is the same form without it.
  return (
    <Suspense fallback={<QuoteForm {...shared} />}>
      <QuoteFormFromUrl {...shared} />
    </Suspense>
  );
}
