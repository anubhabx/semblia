import type { ReactNode } from "react";
import { TrestaWordmark } from "@/components/brand/tresta-mark";

const MANIFESTO = [
  ["01", "Collect", "first-party"],
  ["02", "Curate", "your voice"],
  ["03", "Display", "anywhere"],
] as const;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      {/* ── Left: Brand panel (desktop only) ── */}
      <aside className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-card border-r border-border">
        {/* Hairline grid — GPU-composited layer, never scrolls */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: [
              "linear-gradient(var(--color-border) 1px, transparent 1px)",
              "linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
            ].join(", "),
            backgroundSize: "32px 32px",
            opacity: 0.06,
          }}
        />

        {/* Single off-canvas brand accent — top-right only */}
        <div
          aria-hidden
          className="absolute -top-48 -right-48 w-[36rem] h-[36rem] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--color-brand) 0%, transparent 65%)",
            opacity: 0.07,
          }}
        />

        {/* Bottom vignette — pulls content off the grid */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, var(--color-card), transparent)",
          }}
        />

        {/* ── Wordmark + mono meta ── */}
        <div className="relative z-10 auth-stagger-1">
          <TrestaWordmark />
          <span className="block mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground/50 select-none">
            A studio for trust
          </span>
        </div>

        {/* ── Editorial center block ── */}
        <div className="relative z-10">
          {/* Display headline */}
          <div className="auth-stagger-2">
            <h2 className="text-[3.25rem] lg:text-[3.75rem] font-semibold tracking-[-0.025em] leading-[0.94] text-foreground">
              Collect trust.
              <br />
              Display proof.
              <br />
              <span className="text-brand">Grow faster.</span>
            </h2>
          </div>

          {/* Em-dash separator + numbered manifesto */}
          <div className="auth-stagger-3 mt-10">
            <p
              aria-hidden
              className="font-mono text-[11px] tracking-[0.35em] text-border/70 select-none mb-5"
            >
              ——
            </p>

            <div className="space-y-1">
              {MANIFESTO.map(([num, label, meta]) => (
                <div key={num} className="flex items-baseline">
                  <span className="font-mono tabular-nums text-[11px] text-muted-foreground/40 w-8 shrink-0 select-none">
                    {num}
                  </span>
                  <div className="border-l border-border/40 pl-4 flex items-baseline gap-2.5">
                    <span className="text-[13px] font-medium text-foreground leading-7">
                      {label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/30 select-none">
                      ·
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground/50 leading-7">
                      {meta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="relative z-10 auth-stagger-4">
          <p
            aria-hidden
            className="font-mono text-[11px] tracking-[0.35em] text-border/70 select-none mb-4"
          >
            ——
          </p>
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
            Built for product, marketing, and growth teams.
          </p>
          <span className="block mt-2 font-mono text-[9px] tracking-[0.22em] uppercase text-muted-foreground/30 select-none">
            Est. 2026
          </span>
        </div>
      </aside>

      {/* ── Right: Form panel ── */}
      <main className="flex flex-col min-h-svh bg-background relative">
        {/* Mobile-only wordmark */}
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
