import { jsonLd } from "@/lib/seo";

/** Structured data for search engines. jsonLd() escapes "<", so content can't close the tag. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}
