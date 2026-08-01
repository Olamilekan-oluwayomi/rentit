/**
 * generate-icon-png.mjs
 *
 * Rasterizes the RentIt SVG icon (public/favicon.svg) into a 192x192 PNG
 * suitable for use as a Web Push notification icon (Chrome does not render
 * SVG notification icons).
 *
 * Usage:
 *   node scripts/generate-icon-png.mjs
 *
 * The favicon.svg uses a 32x32 viewBox with `width`/`height` attributes, so
 * the SVG is rendered at density 432 (6x the librsvg default of 72) which
 * yields exactly 32 * 432 / 72 = 192px. No lossy resizing step is needed.
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "public", "favicon.svg");
const OUT = join(ROOT, "public", "icon-192.png");
const SIZE = 192;
const DENSITY = (72 * SIZE) / 32; // 432 → exact 192px intrinsic render

const svg = await readFile(SRC);

const png = await sharp(svg, { density: DENSITY })
  .resize(SIZE, SIZE, { fit: "cover" })
  .png({ compressionLevel: 9 })
  .toBuffer();

await writeFile(OUT, png);

const metadata = await sharp(png).metadata();
console.log(`Wrote ${OUT}`);
console.log(`  size:  ${metadata.width}x${metadata.height}`);
console.log(`  bytes: ${png.length}`);
