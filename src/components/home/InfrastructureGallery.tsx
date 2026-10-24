import { Container } from "@/components/ui/Container";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { GalleryItem } from "@/content/types";

const aspect = { portrait: "aspect-[3/4]", landscape: "aspect-[4/3]", square: "aspect-square" };

export function InfrastructureGallery({ items }: { items: GalleryItem[] }) {
  return (
    <section className="py-24 lg:py-36">
      <Container>
        <Reveal>
          <SectionHeading
            kicker="Infrastructure"
            title="Where the steel waits for you."
            intro="Stock, cutting and finishing under one roof."
          />
        </Reveal>
        <div className="mt-16 columns-1 gap-5 sm:columns-2 lg:mt-20 lg:columns-3">
          {items.map((g) => (
            <Reveal key={g.id} className="mb-5 break-inside-avoid">
              <figure className={`group relative overflow-hidden ${aspect[g.aspect]}`}>
                <div className="absolute inset-0 transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]">
                  <ImageSlot label={g.label} src={g.src} className="h-full w-full" />
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
