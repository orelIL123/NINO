/**
 * Generates lightweight studio-style product placeholders (SVG) into /public/products.
 *
 * These are stand-ins so the store looks complete before real photography exists.
 * When the real photos arrive, drop .jpg/.webp files into /public/products using the
 * same file names (or point `images` in the catalog at a Firebase Storage URL) and
 * nothing else has to change.
 *
 * Run with:  node scripts/generate-product-images.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/products");
mkdirSync(OUT, { recursive: true });

const BG = "#f1f0ee";
const BG_ALT = "#e9e7e4";

/** Silhouette path definitions on a 800x1000 canvas. */
const shapes = {
  tshirt: {
    body: "M322 262 L248 302 L206 404 L272 434 L294 380 L294 742 Q294 762 314 762 L486 762 Q506 762 506 742 L506 380 L528 434 L594 404 L552 302 L478 262 Q400 314 322 262 Z",
    lines: ["M322 262 Q400 314 478 262", "M294 500 L506 500"],
  },
  knit: {
    body: "M318 268 L232 308 L178 566 L252 590 L290 444 L290 786 Q290 804 308 804 L492 804 Q510 804 510 786 L510 444 L548 590 L622 566 L568 308 L482 268 Q400 322 318 268 Z",
    lines: [
      "M318 268 Q400 322 482 268",
      "M290 470 L510 470",
      "M290 590 L510 590",
      "M290 710 L510 710",
      "M178 566 L252 590",
      "M548 590 L622 566",
    ],
  },
  shirt: {
    body: "M326 262 L250 300 L208 408 L272 436 L296 384 L296 754 Q296 772 314 772 L486 772 Q504 772 504 754 L504 384 L528 436 L592 408 L550 300 L474 262 L400 316 Z",
    lines: [
      "M326 262 L400 316 L474 262",
      "M400 316 L400 772",
      "M296 470 L504 470",
    ],
    dots: [
      [400, 380],
      [400, 470],
      [400, 560],
      [400, 650],
    ],
  },
  dress: {
    body: "M332 274 L268 306 L236 402 L294 428 L312 384 L302 520 L246 806 Q400 848 554 806 L498 520 L488 384 L506 428 L564 402 L532 306 L468 274 Q400 322 332 274 Z",
    lines: ["M332 274 Q400 322 468 274", "M302 520 Q400 544 498 520"],
  },
  skirt: {
    body: "M304 322 L496 322 L566 730 Q400 762 234 730 Z",
    lines: ["M304 322 L496 322", "M400 344 L400 748"],
    rect: [300, 302, 200, 34],
  },
  pants: {
    body: "M300 300 L500 300 L522 800 L428 800 L400 528 L372 800 L278 800 Z",
    lines: ["M300 348 L500 348", "M400 348 L400 528"],
  },
  shorts: {
    body: "M300 302 L500 302 L520 574 L426 574 L400 446 L374 574 L280 574 Z",
    lines: ["M300 344 L500 344", "M400 344 L400 446"],
  },
  jacket: {
    body: "M320 258 L238 300 L192 474 L264 500 L292 414 L292 786 L392 786 L392 322 L408 322 L408 786 L508 786 L508 414 L536 500 L608 474 L562 300 L480 258 L400 316 Z",
    lines: ["M320 258 L400 316 L480 258"],
    dots: [
      [372, 430],
      [372, 520],
      [372, 610],
    ],
  },
  coat: {
    body: "M318 250 L232 294 L186 486 L258 512 L290 418 L290 846 L392 846 L392 316 L408 316 L408 846 L510 846 L510 418 L542 512 L614 486 L568 294 L482 250 L400 312 Z",
    lines: ["M318 250 L400 312 L482 250", "M290 640 L392 640", "M408 640 L510 640"],
    dots: [
      [370, 420],
      [370, 520],
    ],
  },
  sneaker: {
    body: "M198 716 Q184 604 248 578 L302 552 Q334 538 360 560 L424 616 Q474 652 546 668 L588 678 Q624 688 624 716 L624 730 Q624 748 604 748 L216 748 Q198 748 198 730 Z",
    lines: [
      "M198 714 L624 714",
      "M330 548 L386 640",
      "M262 588 L318 674",
      "M470 646 L448 700",
    ],
  },
  boot: {
    body: "M312 286 L428 286 Q444 286 444 304 L444 594 L558 644 Q606 666 606 718 L606 740 Q606 758 586 758 L318 758 Q298 758 298 738 L298 304 Q298 286 312 286 Z",
    lines: ["M298 730 L606 730", "M444 420 L298 420"],
  },
  heel: {
    body: "M290 540 Q318 528 356 552 Q392 620 452 654 Q520 690 590 706 Q620 714 612 732 Q603 748 582 742 L344 692 L344 776 L266 776 L266 690 Z",
    lines: ["M344 692 L582 742", "M266 704 L344 704"],
  },
  bag: {
    body: "M252 400 L548 400 L578 760 Q400 786 222 760 Z",
    lines: [],
    arcs: ["M330 400 Q330 288 400 288 Q470 288 470 400"],
  },
  cap: {
    body: "M232 574 Q232 400 400 400 Q568 400 568 574 L568 590 Q568 604 552 604 L248 604 Q232 604 232 590 Z M568 574 Q672 578 690 606 Q694 620 676 620 L568 620 Z",
    lines: ["M400 402 L400 574", "M300 430 Q400 470 500 430"],
  },
  sunglasses: {
    body: "M180 452 L360 452 Q380 452 380 474 L380 500 Q380 566 320 566 L268 566 Q206 566 196 502 Z M620 452 L440 452 Q420 452 420 474 L420 500 Q420 566 480 566 L532 566 Q594 566 604 502 Z M380 470 Q400 458 420 470 L420 484 Q400 474 380 484 Z",
    lines: [],
  },
  belt: {
    body: "M150 470 L560 470 L560 540 L150 540 Z M560 466 L640 466 Q664 466 664 492 L664 518 Q664 544 640 544 L560 544 Z",
    lines: [],
    holes: [
      [200, 505],
      [240, 505],
      [280, 505],
    ],
  },
  scarf: {
    body: "M298 236 L438 236 L470 812 L330 812 Z M424 268 L520 268 L562 780 L466 780 Z",
    lines: [
      "M298 300 L438 300",
      "M330 812 L330 856",
      "M366 812 L366 856",
      "M402 812 L402 856",
      "M438 812 L438 856",
      "M470 812 L470 856",
    ],
  },
};

export const silhouettes = Object.keys(shapes);

function shade(hex, amount) {
  const n = parseInt(hex.replace("#", ""), 16);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 255) + amount);
  const g = clamp(((n >> 8) & 255) + amount);
  const b = clamp((n & 255) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function buildSvg(silhouette, color, variant = 0) {
  const s = shapes[silhouette] ?? shapes.tshirt;
  const bg = variant % 2 === 0 ? BG : BG_ALT;
  const light = shade(color, 22);
  const dark = shade(color, -26);
  const stroke = shade(color, -52);
  const id = `g-${silhouette}-${variant}`;
  const rotate = variant === 1 ? ` transform="rotate(-4 400 500)"` : "";

  const parts = [];
  parts.push(
    `<rect width="800" height="1000" fill="${bg}"/>`,
    `<ellipse cx="400" cy="850" rx="230" ry="30" fill="#000" opacity="0.05"/>`
  );
  parts.push(`<g${rotate}>`);
  parts.push(
    `<path d="${s.body}" fill="url(#${id})" stroke="${stroke}" stroke-opacity="0.35" stroke-width="2" stroke-linejoin="round"/>`
  );
  for (const arc of s.arcs ?? []) {
    parts.push(
      `<path d="${arc}" fill="none" stroke="${stroke}" stroke-opacity="0.55" stroke-width="14" stroke-linecap="round"/>`
    );
  }
  for (const line of s.lines ?? []) {
    parts.push(
      `<path d="${line}" fill="none" stroke="${stroke}" stroke-opacity="0.28" stroke-width="2"/>`
    );
  }
  for (const [cx, cy] of s.dots ?? []) {
    parts.push(`<circle cx="${cx}" cy="${cy}" r="6" fill="${stroke}" fill-opacity="0.4"/>`);
  }
  for (const [cx, cy] of s.holes ?? []) {
    parts.push(`<circle cx="${cx}" cy="${cy}" r="7" fill="${bg}"/>`);
  }
  if (s.rect) {
    const [x, y, w, h] = s.rect;
    parts.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${dark}" rx="4"/>`
    );
  }
  parts.push(`</g>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" role="img"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="0.55" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>${parts.join(
    ""
  )}</svg>`;
}

/**
 * Editorial / banner placeholder (wide).
 * An abstract studio backdrop — soft light sweep, a couple of blurred forms and
 * a faint wordmark. Meant to be swapped for real photography.
 */
function buildBanner(name, tone) {
  const [a, b] = tone;
  const light = shade(a, 26);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0.85" y2="1">
    <stop offset="0" stop-color="${light}"/><stop offset="0.45" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
  </linearGradient>
  <radialGradient id="glow" cx="0.68" cy="0.28" r="0.62">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.34"/>
    <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000000" stop-opacity="0.16"/>
  </linearGradient>
  <filter id="soft"><feGaussianBlur stdDeviation="42"/></filter>
</defs>
<rect width="1600" height="900" fill="url(#bg)"/>
<rect width="1600" height="900" fill="url(#glow)"/>
<g filter="url(#soft)" opacity="0.5">
  <ellipse cx="1210" cy="330" rx="300" ry="300" fill="#ffffff" opacity="0.3"/>
  <ellipse cx="330" cy="690" rx="260" ry="220" fill="#000000" opacity="0.16"/>
  <ellipse cx="820" cy="120" rx="420" ry="150" fill="#ffffff" opacity="0.14"/>
</g>
<path d="M0 640 Q400 590 800 646 T1600 620 L1600 900 L0 900 Z" fill="url(#floor)"/>
<text x="800" y="500" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="150" font-weight="200" letter-spacing="70" fill="#ffffff" opacity="0.09">NINO</text>
</svg>`;
}

// ---------------------------------------------------------------------------

// Read the demo catalog and pull out (slug, silhouette, colour) for every row.
const { readFileSync } = await import("node:fs");
const catalogSrc = readFileSync(
  resolve(__dirname, "../src/lib/data/catalog.ts"),
  "utf8"
);

const palette = {};
for (const m of catalogSrc.matchAll(
  /^\s{2}(\w+):\s*\{\s*hex:\s*"(#[0-9a-fA-F]{6})"/gm
)) {
  palette[m[1]] = m[2];
}

const manifest = [];
for (const m of catalogSrc.matchAll(
  /^\s*\[\s*"([\w-]+)",\s*"[^"]*",\s*"[^"]*",\s*"[\w-]+",\s*"[\w-]+",\s*"(\w+)",\s*\d+,\s*\d+,\s*"(\w+)"/gm
)) {
  manifest.push({ slug: m[1], silhouette: m[2], hex: palette[m[3]] ?? "#999999" });
}

if (manifest.length === 0) {
  console.error("Could not parse any catalog rows — check the regex in this script.");
  process.exit(1);
}

let count = 0;
for (const item of manifest) {
  for (let v = 0; v < 2; v += 1) {
    writeFileSync(
      resolve(OUT, `${item.slug}-${v + 1}.svg`),
      buildSvg(item.silhouette, item.hex, v)
    );
    count += 1;
  }
}

const banners = {
  "hero-women": ["#d9cfc6", "#b9a898"],
  "hero-men": ["#c9ccd1", "#8f959d"],
  "editorial-1": ["#e5ddd4", "#c4b3a3"],
  "editorial-2": ["#cdd3d6", "#9aa5ab"],
  "editorial-3": ["#e3d9db", "#bda3a8"],
  "sale": ["#2a2a2a", "#575757"],
  "store": ["#d8d3cb", "#a9a094"],
};
const mediaOut = resolve(__dirname, "../public/media");
mkdirSync(mediaOut, { recursive: true });
for (const [name, tone] of Object.entries(banners)) {
  writeFileSync(resolve(mediaOut, `${name}.svg`), buildBanner(name, tone));
  count += 1;
}

console.log(`Generated ${count} placeholder images.`);
