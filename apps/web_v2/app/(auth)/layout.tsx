import type { ReactNode } from "react";
import { TrestaWordmark } from "@/components/brand/tresta-mark";
import { TestimonialCarousel } from "./_testimonial-carousel";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      {/* ── Left: Brand panel (desktop only) ── */}
      <aside className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-card border-r border-border">
        {/* Grain texture overlay */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
        {/* Ambient glow — top right */}
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--color-brand) 0%, transparent 70%)",
            opacity: 0.08,
          }}
        />
        {/* Ambient glow — bottom left */}
        <div
          aria-hidden
          className="absolute -bottom-24 -left-24 w-[20rem] h-[20rem] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--color-brand) 0%, transparent 70%)",
            opacity: 0.04,
          }}
        />
        {/* Bottom vignette */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, var(--color-card), transparent)",
          }}
        />

        {/* ── Wordmark ── */}
        <TrestaWordmark className="relative z-10 auth-stagger-1" />

        {/* ── Center content ── */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3 auth-stagger-2">
            <h2 className="text-[2rem] font-semibold tracking-tight leading-[1.15] text-foreground">
              Collect trust.
              <br />
              Display proof.
              <br />
              <span className="text-brand">Grow faster.</span>
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[280px]">
              Join 1,100+ teams using Tresta to turn customer stories into
              revenue.
            </p>
          </div>

          {/* Testimonial carousel */}
          <div className="auth-stagger-3">
            <TestimonialCarousel />
          </div>
        </div>

        {/* ── Footer — subtle trust signal ── */}
        <div className="relative z-10 auth-stagger-4">
          <p className="text-[11px] text-muted-foreground/50">
            Trusted by product, marketing, and growth teams worldwide.
          </p>
        </div>
      </aside>

      {/* ── Right: Form panel ── */}
      <main className="flex flex-col min-h-svh bg-background relative">
        {/* Subtle warm radial */}
        <div
          aria-hidden
          className="absolute top-0 left-0 w-full h-[40%] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, var(--color-brand) 0%, transparent 100%)",
            opacity: 0.04,
          }}
        />

        {/* Mobile-only wordmark — anchored to top */}
        <div className="lg:hidden px-6 pt-8 relative z-10">
          <TrestaWordmark />
        </div>

        {/* Form — centered in remaining space */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
          <div className="w-full max-w-[22rem]">{children}</div>
        </div>
      </main>
    </div>
  );
}
