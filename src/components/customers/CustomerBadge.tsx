import type { PartnerLogo } from "@/content/types";

/** A customer "sticker": the logo when uploaded, otherwise the name set large. */
export function CustomerBadge({ customer, hidden }: { customer: PartnerLogo; hidden?: boolean }) {
  return (
    <div
      data-logo=""
      aria-hidden={hidden || undefined}
      className={`flex h-28 w-64 shrink-0 items-center justify-center px-8 sm:h-32 sm:w-72 ${
        customer.src ? "bg-white shadow-[0_10px_30px_rgb(0_0_0/0.25)]" : "border border-white/12 bg-graphite"
      }`}
    >
      {customer.src ? (
        // Full-colour logo on a white tile, so every brand reads correctly on the navy page.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={customer.src} alt={customer.name} loading="lazy" className="max-h-[68%] max-w-full object-contain" />
      ) : (
        <span className="text-center font-display text-2xl leading-tight font-semibold tracking-tight text-surface/85 sm:text-[1.7rem]">
          {customer.name}
        </span>
      )}
    </div>
  );
}

/** Endless strip of customer badges; pauses on hover, static for reduced motion. */
export function CustomerMarquee({ customers }: { customers: PartnerLogo[] }) {
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-[marquee_45s_linear_infinite] gap-5 hover:[animation-play-state:paused]">
        {[...customers, ...customers].map((c, i) => (
          <CustomerBadge key={`${c.id}-${i}`} customer={c} hidden={i >= customers.length} />
        ))}
      </div>
    </div>
  );
}
