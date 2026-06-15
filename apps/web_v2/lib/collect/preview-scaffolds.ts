/**
 * Mock host-page scaffolds for the studio's "On your site" preview.
 *
 * A hosted form is its own page, but most forms are *embedded* on the customer's
 * site. To make that real in the studio, we drop the rendered form fragment into
 * a faint, project-type-flavored mock page (nav + hero + the form in a section).
 * It is deliberately low-contrast so the form stays the hero — this is context,
 * not a competing design.
 */

import type { V2ProjectType } from "@workspace/types";

export type ScaffoldArchetype = "product" | "studio" | "store" | "generic";

const ARCHETYPE_BY_TYPE: Partial<
  Record<NonNullable<V2ProjectType>, ScaffoldArchetype>
> = {
  SAAS_APP: "product",
  PRODUCT: "product",
  MOBILE_APP: "product",
  COURSE: "product",
  PORTFOLIO: "studio",
  FREELANCE: "studio",
  AGENCY: "studio",
  CONSULTING_SERVICE: "studio",
  COMMUNITY: "studio",
  E_COMMERCE: "store",
};

export function archetypeForType(
  type: V2ProjectType | null,
): ScaffoldArchetype {
  if (!type) return "generic";
  return ARCHETYPE_BY_TYPE[type] ?? "generic";
}

interface Copy {
  nav: string[];
  headline: (brand: string) => string;
  sub: string;
  /** Number of faint placeholder tiles in the context band (0 = none). */
  tiles: number;
}

const COPY: Record<ScaffoldArchetype, Copy> = {
  product: {
    nav: ["Product", "Pricing", "Docs", "Sign in"],
    headline: (b) => `Ship faster with ${b}`,
    sub: "The workspace your team will actually enjoy using.",
    tiles: 3,
  },
  studio: {
    nav: ["Work", "About", "Services", "Contact"],
    headline: (b) => b,
    sub: "Selected work and the people behind it.",
    tiles: 3,
  },
  store: {
    nav: ["Shop", "Collections", "About", "Cart"],
    headline: (b) => b,
    sub: "Thoughtfully made goods, shipped worldwide.",
    tiles: 4,
  },
  generic: {
    nav: ["Home", "About", "Contact"],
    headline: (b) => `Welcome to ${b}`,
    sub: "We'd love to hear what you think.",
    tiles: 0,
  },
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface MockHostOptions {
  fragmentHtml: string;
  type: V2ProjectType | null;
  brandName: string;
  /** Form brand color, used only for the faintest of accents. */
  accent: string;
}

/**
 * A complete HTML document (for an iframe `srcDoc`) framing the form fragment in
 * a project-type-flavored mock site. The fragment ships its own `.sf-*` styles;
 * everything here is `mock-` scoped so the two never collide.
 */
export function renderMockHostPage({
  fragmentHtml,
  type,
  brandName,
  accent,
}: MockHostOptions): string {
  const archetype = archetypeForType(type);
  const copy = COPY[archetype];
  const brand = esc(brandName.trim() || "Your brand");
  const links = copy.nav
    .map(
      (l, i) =>
        `<span class="mock-link${i === 0 ? " is-active" : ""}">${esc(l)}</span>`,
    )
    .join("");
  const tiles =
    copy.tiles > 0
      ? `<div class="mock-band">${Array.from({ length: copy.tiles })
          .map(() => `<div class="mock-tile"></div>`)
          .join("")}</div>`
      : "";

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root{--mock-accent:${esc(accent)}}
*{box-sizing:border-box}
html,body{margin:0}
body{font:15px/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  color:#5b6573;background:#f5f6f8;-webkit-font-smoothing:antialiased}
.mock-nav{display:flex;align-items:center;gap:18px;padding:15px 26px;
  background:#fff;border-bottom:1px solid #eaecf0}
.mock-brand{display:flex;align-items:center;gap:9px;font-weight:680;
  color:#1d2530;font-size:14px;letter-spacing:-.01em}
.mock-dot{width:18px;height:18px;border-radius:6px;background:var(--mock-accent);
  opacity:.92}
.mock-links{display:flex;gap:18px;margin-left:auto;font-size:13px}
.mock-link{color:#7b8493}
.mock-link.is-active{color:#1d2530;font-weight:560}
.mock-hero{max-width:680px;margin:0 auto;padding:54px 26px 8px;text-align:center}
.mock-hero h1{margin:0 0 12px;font-size:clamp(24px,4.2vw,36px);color:#10151c;
  letter-spacing:-.025em;line-height:1.08;font-weight:680}
.mock-hero p{margin:0 auto;max-width:44ch;color:#7b8493;font-size:16px}
.mock-band{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;
  max-width:760px;margin:30px auto 0;padding:0 26px}
.mock-tile{height:74px;flex:1 1 150px;border-radius:12px;background:#fff;
  border:1px solid #eceef2}
.mock-section{padding:42px 18px 64px;display:flex;justify-content:center}
.mock-foot{padding:26px;text-align:center;color:#aab1bd;font-size:12px;
  border-top:1px solid #eaecf0;background:#fff}
@media (prefers-color-scheme:dark){
  body{background:#0e1116;color:#9aa3b0}
  .mock-nav,.mock-foot{background:#12161c;border-color:#1f242c}
  .mock-tile{background:#12161c;border-color:#1f242c}
  .mock-brand,.mock-link.is-active{color:#e8eaee}
  .mock-hero h1{color:#f1f3f5}.mock-hero p,.mock-link{color:#8a93a1}
}
</style></head>
<body>
<nav class="mock-nav"><span class="mock-brand"><span class="mock-dot"></span>${brand}</span>
<span class="mock-links">${links}</span></nav>
<header class="mock-hero"><h1>${esc(copy.headline(brand))}</h1><p>${esc(copy.sub)}</p></header>
${tiles}
<section class="mock-section">${fragmentHtml}</section>
<footer class="mock-foot">© ${brand} · Powered by Semblia</footer>
</body></html>`;
}
