import type { ReactNode } from "react";

const TESTIMONIAL = {
  quote:
    "Tresta cut our feedback collection time in half. Within six weeks our pricing page conversion climbed 38 % — the testimonials just close the deal on their own.",
  author: "Priya Menon",
  role: "Head of Growth",
  company: "Orbis Software",
  initials: "PM",
};

const STATS = [
  { value: "14,200+", label: "Testimonials collected" },
  { value: "1,100+", label: "Active spaces" },
  { value: "4.9 / 5", label: "Average rating" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      {/* ── Left: Brand panel (desktop only) ── */}
      <aside
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-card border-r border-border"
      >
        {/* Grain texture overlay */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />

        {/* Ambient warm glow — top right */}
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full pointer-events-none bg-brand/[0.07]"
          style={{
            background:
              "radial-gradient(circle, var(--color-brand) 0%, transparent 70%)",
            opacity: 0.08,
          }}
        />
        {/* Ambient warm glow — bottom left (secondary) */}
        <div
          aria-hidden
          className="absolute -bottom-24 -left-24 w-[20rem] h-[20rem] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--color-brand) 0%, transparent 70%)",
            opacity: 0.04,
          }}
        />
        {/* Bottom vignette — uses card background token */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, var(--color-card), transparent)",
          }}
        />

        {/* ── Wordmark ── */}
        <div className="relative z-10 flex items-center gap-2.5 auth-stagger-1">
          <div
            className="w-7 h-7 rounded-[6px] flex items-center justify-center flex-shrink-0 bg-brand"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M7 1L13 4V10L7 13L1 10V4L7 1Z"
                fill="var(--color-card)"
                stroke="var(--color-card)"
                strokeWidth="0.5"
              />
            </svg>
          </div>
          <span
            className="font-semibold tracking-tight text-[1.05rem] text-foreground"
          >
            Tresta
          </span>
        </div>

        {/* ── Center content ── */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3 auth-stagger-2">
            <p
              className="text-[10px] font-semibold tracking-[0.16em] uppercase text-muted-foreground"
            >
              Testimonial platform
            </p>
            <h2
              className="text-[2rem] font-semibold tracking-tight leading-[1.15] text-foreground"
            >
              Collect trust.
              <br />
              Display proof.
              <br />
              <span className="text-brand">
                Grow faster.
              </span>
            </h2>
          </div>

          {/* Testimonial card */}
          <div
            className="rounded-xl p-5 space-y-4 auth-stagger-3 bg-muted/40 border border-border/50"
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

            <blockquote
              className="text-[0.8125rem] leading-[1.7] text-muted-foreground"
            >
              &ldquo;{TESTIMONIAL.quote}&rdquo;
            </blockquote>

            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold bg-brand/15 text-brand"
              >
                {TESTIMONIAL.initials}
              </div>
              <div>
                <p
                  className="text-[13px] font-medium text-foreground"
                >
                  {TESTIMONIAL.author}
                </p>
                <p
                  className="text-[11px] text-muted-foreground"
                >
                  {TESTIMONIAL.role}, {TESTIMONIAL.company}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div
          className="relative z-10 grid grid-cols-3 gap-6 pt-6 border-t border-border/50 auth-stagger-4"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p
                className="font-semibold text-lg tabular-nums tracking-tight text-foreground"
              >
                {stat.value}
              </p>
              <p
                className="text-[10px] leading-snug text-muted-foreground"
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Right: Form panel ── */}
      <main className="flex flex-col items-center justify-center min-h-svh bg-background px-6 py-12 relative">
        {/* Subtle warm radial on form side */}
        <div
          aria-hidden
          className="absolute top-0 left-0 w-full h-[40%] pointer-events-none opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, var(--color-brand) 0%, transparent 100%)",
            opacity: 0.04,
          }}
        />

        {/* Mobile-only wordmark */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10 relative z-10">
          <div className="w-7 h-7 rounded-[6px] bg-brand flex items-center justify-center flex-shrink-0">
            <svg
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M7 1L13 4V10L7 13L1 10V4L7 1Z"
                fill="var(--color-card)"
                stroke="var(--color-card)"
                strokeWidth="0.5"
              />
            </svg>
          </div>
          <span className="font-semibold tracking-tight text-[1.05rem] text-foreground">
            Tresta
          </span>
        </div>

        <div className="relative z-10 w-full flex justify-center">
          {children}
        </div>
      </main>
    </div>
  );
}
