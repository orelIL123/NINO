/**
 * Diagnoses the Shopify Storefront connection and says exactly what to fix.
 *
 *   npm run shopify:check
 *
 * Reads SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_ACCESS_TOKEN from .env.local
 * (or the real environment), then walks the connection one layer at a time so a
 * failure points at a single cause instead of a generic "unauthorized".
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/* ------------------------------- env loading ------------------------------ */

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, raw] = match;
    if (process.env[key]) continue;
    process.env[key] = raw.replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-01";

/* -------------------------------- reporting ------------------------------- */

const pass = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const fail = (m) => console.log(`  \x1b[31m✗\x1b[0m ${m}`);
const hint = (m) => console.log(`    \x1b[2m${m}\x1b[0m`);

function done(ok) {
  console.log();
  console.log(
    ok
      ? "\x1b[32mShopify is connected.\x1b[0m Remove the demo catalog whenever you like."
      : "\x1b[31mNot connected yet.\x1b[0m Fix the item above and run this again."
  );
  process.exit(ok ? 0 : 1);
}

async function query(body, headers = {}) {
  const res = await fetch(`https://${DOMAIN}/api/${VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON body — status alone is enough to classify it */
  }
  return { status: res.status, json };
}

/* --------------------------------- checks --------------------------------- */

console.log("\nShopify Storefront check\n");

// 1 — credentials present
if (!DOMAIN) {
  fail("SHOPIFY_STORE_DOMAIN is not set");
  hint("Add it to .env.local, e.g. your-store.myshopify.com");
  done(false);
}
pass(`domain: ${DOMAIN}`);

// 2 — token shape, when supplied. Tokenless access covers the core storefront.
if (TOKEN?.startsWith("shpss_")) {
  fail("that is an app secret key, not a Storefront token");
  hint("Secret keys grant write access and must never ship in a storefront.");
  done(false);
}
if (TOKEN?.startsWith("shpat_")) {
  fail("that is an Admin API token, not a Storefront token");
  done(false);
}
if (TOKEN?.startsWith("atkn_")) {
  fail("that is a Dev Dashboard token, not a Storefront token");
  done(false);
}
if (TOKEN) pass(`token: ${TOKEN.slice(0, 6)}… (${TOKEN.length} chars)`);
else pass("using supported tokenless Storefront access");

// 3 — API version reachable
const probe = await query({ query: "{shop{name}}" });
if (probe.json?.errors?.[0]?.extensions?.code === "NOT_FOUND") {
  fail(`API version ${VERSION} is not supported`);
  hint("Set SHOPIFY_API_VERSION to a current quarterly version.");
  done(false);
}
pass(`API version ${VERSION} accepted`);

// 4 — storefront published. Shows up unauthenticated, so check it before auth.
const locked = probe.json?.errors?.some((e) =>
  /locked|unavailable/i.test(e.message ?? "")
);
if (locked) {
  fail(`storefront is locked — "${probe.json.errors[0].message}"`);
  hint("Settings -> Plan: the store needs an active plan before it serves data.");
  hint("No token will work until this is resolved.");
  done(false);
}
pass("storefront is published");

// 5 — Storefront access (tokenless or token-based)
const storefrontHeaders = TOKEN
  ? { "X-Shopify-Storefront-Access-Token": TOKEN }
  : {};
const auth = await query(
  { query: "{shop{name primaryDomain{url}}}" },
  storefrontHeaders
);

if (auth.json?.errors?.some((e) => e.extensions?.code === "UNAUTHORIZED")) {
  fail("token rejected (UNAUTHORIZED)");
  hint("Most often this is the API key rather than the Storefront token —");
  hint("they look identical (32 hex chars) and sit on the same screen.");
  hint("The Storefront token only appears once Storefront API scopes are on.");
  done(false);
}
if (!auth.json?.data?.shop) {
  fail(`unexpected response (HTTP ${auth.status})`);
  hint(JSON.stringify(auth.json)?.slice(0, 200));
  done(false);
}
pass(`connected as "${auth.json.data.shop.name}"`);

// 6 — catalog readable, and shaped the way the transform expects
const cat = await query(
  {
    query: `{products(first:50){edges{node{
      handle title vendor productType tags
      images(first:1){edges{node{url}}}
      options{name}
    }}}}`,
  },
  storefrontHeaders
);

const nodes = cat.json?.data?.products?.edges?.map((e) => e.node) ?? [];
if (!nodes.length) {
  fail("no products are readable");
  hint("Either the catalog is empty, or the products are not published to");
  hint("this sales channel (product -> Publishing).");
  done(false);
}
pass(`${nodes.length} product(s) readable`);

// 7 — data hygiene. Not fatal, but each gap degrades the storefront.
console.log("\nCatalog shape\n");

const SIZE = ["size", "מידה"];
const COLOR = ["color", "colour", "צבע"];
const optionNames = (p) => p.options.map((o) => o.name.trim().toLowerCase());

const checks = [
  ["missing a vendor (brand)", (p) => !p.vendor?.trim()],
  ["missing a product type (category)", (p) => !p.productType?.trim()],
  ["no images", (p) => !p.images.edges.length],
  ["no Size option", (p) => !optionNames(p).some((n) => SIZE.includes(n))],
  ["no Color option", (p) => !optionNames(p).some((n) => COLOR.includes(n))],
  ["no tags", (p) => !p.tags.length],
];

let clean = true;
for (const [label, predicate] of checks) {
  const bad = nodes.filter(predicate);
  if (!bad.length) {
    pass(`every product has ${label.replace(/^(missing a|no) /, "")}`);
    continue;
  }
  clean = false;
  fail(`${bad.length}/${nodes.length} ${label}`);
  hint(bad.slice(0, 3).map((p) => p.handle).join(", "));
}

if (!clean) {
  console.log();
  console.log("  \x1b[2mThese are warnings — the site still renders, but the\x1b[0m");
  console.log("  \x1b[2maffected products lose filtering or size selection.\x1b[0m");
}

done(true);
