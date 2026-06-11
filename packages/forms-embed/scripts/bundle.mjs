/**
 * Bundle the embed loader and ENFORCE the delivery budget.
 *
 * Produces:
 *   dist/embed.js      — IIFE, what <script src> on host pages loads
 *   dist/embed.esm.js  — ESM, for bundler-based consumers
 *
 * The 3 KB gzipped budget on the IIFE bundle is a hard architectural
 * constraint (docs/plans/2026-06-11-forms-v4-parametric-theming.md §4):
 * the build FAILS if the loader outgrows it. Raising the number requires a
 * deliberate decision, not a drive-by.
 */

import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";

const BUDGET_GZIP_BYTES = 3 * 1024;

const shared = {
  entryPoints: ["src/loader.ts"],
  bundle: true,
  minify: true,
  target: ["es2022"],
  legalComments: "none",
};

await build({ ...shared, format: "iife", outfile: "dist/embed.js" });
await build({ ...shared, format: "esm", outfile: "dist/embed.esm.js" });

const bundle = readFileSync("dist/embed.js");
const gzipped = gzipSync(bundle, { level: 9 }).byteLength;

console.log(
  `embed.js: ${bundle.byteLength} B raw, ${gzipped} B gzipped (budget ${BUDGET_GZIP_BYTES} B)`,
);

if (gzipped > BUDGET_GZIP_BYTES) {
  console.error(
    `\nDELIVERY BUDGET EXCEEDED: embed.js is ${gzipped} B gzipped, ` +
      `budget is ${BUDGET_GZIP_BYTES} B. Trim the loader or make a deliberate ` +
      "decision to raise the budget in docs/plans/2026-06-11-forms-v4-parametric-theming.md.",
  );
  process.exit(1);
}
