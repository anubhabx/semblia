"use client";

import { useState, useEffect } from "react";
import { ChatText, PuzzlePiece, ChartBar } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/*
 * Product capability showcase — replaces fake testimonials.
 * Shows what Tresta actually does in 3 auto-advancing slides.
 * These are factual feature descriptions, not invented quotes.
 */

const CAPABILITIES = [
  {
    Icon: ChatText,
    label: "Collect",
    headline: "One link, unlimited stories",
    description:
      "Share a branded collection page. Customers leave video or text testimonials in under 2 minutes — no login, no friction.",
  },
  {
    Icon: PuzzlePiece,
    label: "Curate",
    headline: "Review, approve, organize",
    description:
      "Every submission lands in a clean inbox. Tag, filter, and approve with one click. Keep the gold, archive the rest.",
  },
  {
    Icon: ChartBar,
    label: "Display",
    headline: "Embed trust anywhere",
    description:
      "Drop a Wall of Love, carousel, or grid onto any page. Customizable widgets that match your brand — zero code required.",
  },
];

const INTERVAL = 4500;

export function CapabilityShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % CAPABILITIES.length);
        setIsTransitioning(false);
      }, 200);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const cap = CAPABILITIES[activeIndex];

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-xl p-5 space-y-4 bg-muted/40 border border-border/50",
          "transition-opacity duration-200",
          isTransitioning ? "opacity-0" : "opacity-100",
        )}
      >
        {/* Step badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10">
            <cap.Icon className="size-4 text-brand" weight="duotone" />
          </div>
          <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-brand">
            {cap.label}
          </span>
        </div>

        {/* Headline */}
        <p className="text-[15px] font-semibold tracking-tight text-foreground leading-snug">
          {cap.headline}
        </p>

        {/* Description */}
        <p className="text-[0.8125rem] leading-[1.7] text-muted-foreground">
          {cap.description}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-1.5">
        {CAPABILITIES.map((c, i) => (
          <button
            key={c.label}
            type="button"
            aria-label={`View: ${c.label}`}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setActiveIndex(i);
                setIsTransitioning(false);
              }, 200);
            }}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === activeIndex
                ? "w-5 bg-brand"
                : "w-1.5 bg-border hover:bg-muted-foreground/30",
            )}
          />
        ))}
      </div>
    </div>
  );
}
