import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";

const headline = ["Specialized Tool Steel", "& Industrial Metal", "Solutions Since 2002"];

/** One brushed-steel plate. `accent` marks the top plate of the logo stack. */
function Plate({ accent, className }: { accent?: boolean; className: string }) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        background: accent
          ? "linear-gradient(100deg, #2F6FE0 0%, #79B6EA 38%, #4D8FEF 55%, #A9D1FF 72%, #1D5BD8 100%)"
          : "linear-gradient(100deg, #0E2242 0%, #2A4A7A 35%, #13294D 55%, #355A8E 75%, #0B1C38 100%)",
        boxShadow: "0 40px 80px rgb(0 0 0 / 0.6), inset 0 1px 0 rgb(255 255 255 / 0.18)",
      }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.05) 0 1px, transparent 1px 4px)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[14%] bg-black/45" />
    </div>
  );
}

export function Hero({ videoSrc }: { videoSrc: string | null }) {
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
      <div className="steel-texture grain absolute inset-0 -z-20" />
      {videoSrc && (
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-50"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        />
      )}

      {/* Stacked plates: the logo motif at architectural scale. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 [perspective:1400px]">
        <div className="absolute top-[12%] right-[-30%] h-[70%] w-[95%] [transform:rotateX(14deg)_rotateY(-22deg)_rotateZ(-6deg)] sm:right-[-18%] lg:top-[10%] lg:right-[-8%] lg:w-[62%]">
          <div className="parallax-low absolute inset-0">
            <div className="hero-plate absolute inset-0" style={{ opacity: 0.55, animationDelay: "0.1s" }}>
              <Plate className="top-[62%] left-[24%] h-[17%] w-[76%] animate-[drift_14s_ease-in-out_infinite]" />
            </div>
          </div>
          <div className="parallax-mid absolute inset-0">
            <div className="hero-plate absolute inset-0" style={{ opacity: 0.9, animationDelay: "0.25s" }}>
              <Plate className="top-[38%] left-[12%] h-[17%] w-[76%] animate-[drift_12s_ease-in-out_-3s_infinite]" />
            </div>
          </div>
          <div className="parallax-top absolute inset-0">
            <div className="hero-plate absolute inset-0" style={{ opacity: 1, animationDelay: "0.4s" }}>
              <Plate accent className="top-[14%] left-0 h-[17%] w-[76%] animate-[drift_10s_ease-in-out_-6s_infinite]" />
            </div>
          </div>
        </div>
        {/* Slow light sweep across the scene. */}
        <div className="absolute inset-y-0 -left-1/2 w-1/2 animate-[sweep_9s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/10 lg:bg-gradient-to-r lg:from-ink lg:via-ink/75 lg:to-transparent" />
      </div>

      <div
        className="hero-content mx-auto w-full max-w-[1680px] px-5 pt-32 pb-16 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24"
      >
        <p
          className="hero-fade mb-8 flex items-center gap-4 text-[15px] text-surface/70"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="h-px w-10 bg-accent" />
          Importer, stockist, distributor and trader
        </p>
        <h1 className="text-display max-w-[14ch] font-semibold sm:max-w-none">
          {headline.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <span className="hero-rise block" style={{ animationDelay: `${0.35 + i * 0.12}s` }}>
                {line}
              </span>
            </span>
          ))}
        </h1>
        <div
          className="hero-fade mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
          style={{ animationDelay: "0.95s" }}
        >
          <p className="max-w-xl text-lg leading-relaxed text-surface/70">
            Tool steel, die steel, plastic mould steel and special alloy steel, cut and finished to your size.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="/quote/">Request quote</Button>
            <Button href="/products/" variant="ghost">
              View products
              <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
