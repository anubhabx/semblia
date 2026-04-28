"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    quote:
      "Tresta cut our feedback collection time in half. Within six weeks our pricing page conversion climbed 38%.",
    author: "Priya Menon",
    role: "Head of Growth",
    company: "Orbis Software",
    initials: "PM",
  },
  {
    quote:
      "We went from zero social proof to a wall of trust in two weeks. The embeddable widgets made it effortless.",
    author: "Marcus Chen",
    role: "Product Lead",
    company: "Strato Labs",
    initials: "MC",
  },
  {
    quote:
      "Our sales team used to chase case studies for months. Now customers share their stories in under 2 minutes.",
    author: "Elena Torres",
    role: "VP Marketing",
    company: "Kindra Health",
    initials: "ET",
  },
];

const INTERVAL = 5000;

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        setIsTransitioning(false);
      }, 200);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const t = TESTIMONIALS[activeIndex];

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-xl p-5 space-y-4 bg-muted/40 border border-border/50",
          "transition-opacity duration-200",
          isTransitioning ? "opacity-0" : "opacity-100",
        )}
      >
        {/* Stars */}
        <div className="flex gap-[3px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              aria-hidden
              width="12"
              height="12"
              viewBox="0 0 13 13"
              fill="none"
            >
              <path
                d="M6.5 1l1.44 2.92 3.22.47-2.33 2.27.55 3.21L6.5 8.26 3.62 9.87l.55-3.21L1.84 4.39l3.22-.47L6.5 1z"
                className="fill-brand stroke-brand"
                strokeWidth="0.4"
                strokeLinejoin="round"
              />
            </svg>
          ))}
        </div>

        {/* Quote */}
        <blockquote className="text-[0.8125rem] leading-[1.7] text-muted-foreground">
          &ldquo;{t.quote}&rdquo;
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold bg-brand/15 text-brand">
            {t.initials}
          </div>
          <div>
            <p className="text-[13px] font-medium text-foreground">
              {t.author}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {t.role}, {t.company}
            </p>
          </div>
        </div>
      </div>

      {/* Carousel indicators */}
      <div className="flex items-center justify-center gap-1.5">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`View testimonial ${i + 1}`}
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
