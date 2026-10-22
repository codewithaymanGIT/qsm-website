"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";

const ease = [0.16, 1, 0.3, 1] as const;

const headline = ["Specialized Tool Steel", "& Industrial Metal", "Solutions Since 2002"];

/** One brushed-steel plate. `gold` marks the top plate of the logo stack. */
function Plate({ gold, className }: { gold?: boolean; className: string }) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        background: gold
          ? "linear-gradient(100deg, #8c6c33 0%, #d9b877 38%, #b48d48 55%, #e6c98e 72%, #7a5d24 100%)"
          : "linear-gradient(100deg, #1b1b1b 0%, #3a3a3a 35%, #232323 55%, #464646 75%, #161616 100%)",
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
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yTop = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);
  const yMid = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const yLow = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
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
          <motion.div style={{ y: yLow }} className="absolute inset-0">
            <motion.div
              initial={{ opacity: 0, x: 120 }}
              animate={{ opacity: 0.55, x: 0 }}
              transition={{ duration: 1.6, delay: 0.1, ease }}
              className="absolute inset-0"
            >
              <Plate className="top-[62%] left-[24%] h-[17%] w-[76%] animate-[drift_14s_ease-in-out_infinite]" />
            </motion.div>
          </motion.div>
          <motion.div style={{ y: yMid }} className="absolute inset-0">
            <motion.div
              initial={{ opacity: 0, x: 160 }}
              animate={{ opacity: 0.9, x: 0 }}
              transition={{ duration: 1.6, delay: 0.25, ease }}
              className="absolute inset-0"
            >
              <Plate className="top-[38%] left-[12%] h-[17%] w-[76%] animate-[drift_12s_ease-in-out_-3s_infinite]" />
            </motion.div>
          </motion.div>
          <motion.div style={{ y: yTop }} className="absolute inset-0">
            <motion.div
              initial={{ opacity: 0, x: 200 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.6, delay: 0.4, ease }}
              className="absolute inset-0"
            >
              <Plate gold className="top-[14%] left-0 h-[17%] w-[76%] animate-[drift_10s_ease-in-out_-6s_infinite]" />
            </motion.div>
          </motion.div>
        </div>
        {/* Slow light sweep across the scene. */}
        <div className="absolute inset-y-0 -left-1/2 w-1/2 animate-[sweep_9s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/10 lg:bg-gradient-to-r lg:from-ink lg:via-ink/75 lg:to-transparent" />
      </div>

      <motion.div
        style={{ opacity: fade }}
        className="mx-auto w-full max-w-[1680px] px-5 pt-32 pb-16 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-8 flex items-center gap-4 text-[15px] text-surface/70"
        >
          <span className="h-px w-10 bg-gold" />
          Importer, stockist, distributor and trader
        </motion.p>
        <h1 className="text-display max-w-[14ch] font-semibold sm:max-w-none">
          {headline.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.35 + i * 0.12, ease }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.95, ease }}
          className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
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
        </motion.div>
      </motion.div>
    </section>
  );
}
