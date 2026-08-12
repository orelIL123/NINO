import "server-only";

import { cache } from "react";

import {
  brands,
  categories,
  colorList,
  priceBounds,
  products,
} from "@/lib/data/catalog";
import type {
  Brand,
  Category,
  Product,
  ProductQuery,
  SortKey,
} from "@/lib/data/types";
import { fetchProducts, shopifyEnabled } from "@/lib/shopify";

/* -------------------------------------------------------------------------- */
/*  DATA ACCESS LAYER                                                         */
/*                                                                            */
/*  Reads the live Shopify catalog when the store is configured, and the local */
/*  demo catalog otherwise. Filtering and sorting stay in memory either way,   */
/*  so both sources behave identically and no page or component changes.      */
/* -------------------------------------------------------------------------- */

/** Upper bound on a single Storefront page — plenty for a boutique. */
const CATALOG_PAGE_SIZE = 250;

/**
 * The product set every query below is built from.
 *
 * `cache` dedupes this within a single render pass; the Storefront client adds
 * the cross-request HTTP cache on top. If Shopify is unreachable or the token
 * is wrong we serve the demo catalog rather than failing the page — a
 * storefront that renders stale products beats one that returns a 500.
 */
const getCatalog = cache(async (): Promise<Product[]> => {
  if (!shopifyEnabled) return products;

  try {
    const live = await fetchProducts({ first: CATALOG_PAGE_SIZE });
    return live.length ? live : products;
  } catch (error) {
    console.error("[catalog] Shopify read failed — serving demo catalog", error);
    return products;
  }
});

function sortProducts(list: Product[], sort: SortKey = "newest"): Product[] {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "popular":
      return copy.sort((a, b) => b.popularity - a.popularity);
    case "newest":
    default:
      return copy.sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
      );
  }
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const {
    group,
    category,
    brand,
    size,
    color,
    minPrice,
    maxPrice,
    onSale,
    search,
    sort,
    limit,
    exclude,
  } = query;

  let list = await getCatalog();

  if (group) {
    list =
      group === "new"
        ? list.filter((p) => p.badges.includes("new"))
        : group === "sale"
          ? list.filter((p) => p.compareAtPrice)
          : list.filter((p) => p.group === group);
  }
  if (category) list = list.filter((p) => p.category === category);
  if (brand?.length) list = list.filter((p) => brand.includes(p.brand));
  if (size?.length)
    list = list.filter((p) =>
      p.sizes.some((s) => size.includes(s.label) && s.stock > 0)
    );
  if (color?.length)
    list = list.filter((p) => color.includes(p.color.name.en.toLowerCase()));
  if (typeof minPrice === "number") list = list.filter((p) => p.price >= minPrice);
  if (typeof maxPrice === "number") list = list.filter((p) => p.price <= maxPrice);
  if (onSale) list = list.filter((p) => Boolean(p.compareAtPrice));
  if (exclude?.length) list = list.filter((p) => !exclude.includes(p.slug));
  if (search) {
    const q = search.trim().toLowerCase();
    if (q) {
      const known = await getBrands();
      list = list.filter((p) => {
        const brandName = known.find((b) => b.slug === p.brand)?.name ?? "";
        return [
          p.title.he,
          p.title.en,
          brandName,
          p.category,
          p.color.name.he,
          p.color.name.en,
          p.sku,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      });
    }
  }

  const sorted = sortProducts(list, sort);
  return limit ? sorted.slice(0, limit) : sorted;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const list = await getCatalog();
  return list.find((p) => p.slug === slug) ?? null;
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  const set = new Set(slugs);
  const list = await getCatalog();
  return list.filter((p) => set.has(p.slug));
}

export async function getRelatedProducts(
  product: Product,
  count = 4
): Promise<Product[]> {
  const list = await getCatalog();
  const sameCategory = list.filter(
    (p) => p.category === product.category && p.slug !== product.slug
  );
  const sameBrand = list.filter(
    (p) =>
      p.brand === product.brand &&
      p.slug !== product.slug &&
      !sameCategory.includes(p)
  );
  return [...sameCategory, ...sameBrand].slice(0, count);
}

export async function getAllProductSlugs(): Promise<string[]> {
  const list = await getCatalog();
  return list.map((p) => p.slug);
}

/**
 * Navigation categories.
 *
 * The curated list in the demo catalog carries copy and grouping we cannot
 * derive from Shopify, so it stays authoritative for anything it already
 * describes. Product types that only exist upstream are appended, which keeps
 * a newly added Shopify category reachable instead of invisible.
 */
export async function getCategories(): Promise<Category[]> {
  if (!shopifyEnabled) return categories;

  const list = await getCatalog();
  const known = new Set(categories.map((c) => c.slug));

  const discovered = new Map<string, Category>();
  for (const product of list) {
    if (known.has(product.category) || discovered.has(product.category)) continue;
    const label = product.category.replace(/-/g, " ");
    discovered.set(product.category, {
      slug: product.category,
      title: { he: label, en: label },
      group: product.group,
      gender: product.gender,
    });
  }

  return [...categories, ...discovered.values()];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await getCategories();
  return all.find((c) => c.slug === slug) ?? null;
}

/** Brands, extended with any Shopify vendor the demo catalog does not list. */
export async function getBrands(): Promise<Brand[]> {
  if (!shopifyEnabled) return brands;

  const list = await getCatalog();
  const known = new Set(brands.map((b) => b.slug));

  const discovered = new Map<string, Brand>();
  for (const product of list) {
    if (known.has(product.brand) || discovered.has(product.brand)) continue;
    const name = product.brand.replace(/-/g, " ").toUpperCase();
    discovered.set(product.brand, {
      slug: product.brand,
      name,
      country: { he: "", en: "" },
      description: { he: "", en: "" },
    });
  }

  return [...brands, ...discovered.values()];
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const all = await getBrands();
  return all.find((b) => b.slug === slug) ?? null;
}

/** Facet values available for the filter sidebar, scoped to a product set. */
export async function getFacets(list: Product[]) {
  const brandSlugs = new Set(list.map((p) => p.brand));
  const sizeLabels = new Set(list.flatMap((p) => p.sizes.map((s) => s.label)));
  const colorKeys = new Set(list.map((p) => p.color.name.en.toLowerCase()));
  const allBrands = await getBrands();

  return {
    brands: allBrands.filter((b) => brandSlugs.has(b.slug)),
    sizes: Array.from(sizeLabels).sort((a, b) => {
      const order = ["XS", "S", "M", "L", "XL", "XXL", "ONE SIZE"];
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return Number(a) - Number(b);
    }),
    colors: colorList.filter((c) => colorKeys.has(c.name.en.toLowerCase())),
    price: priceRangeFor(list),
  };
}

/** Slider bounds for the price facet, widened to round hundreds. */
function priceRangeFor(list: Product[]): { min: number; max: number } {
  if (!shopifyEnabled || !list.length) return priceBounds;

  const prices = list.map((p) => p.price);
  return {
    min: Math.floor(Math.min(...prices) / 100) * 100,
    max: Math.ceil(Math.max(...prices) / 100) * 100,
  };
}

export async function getNewItemsCount(): Promise<number> {
  const list = await getCatalog();

  // A live store reports what it actually carries. The demo catalog is too
  // small to look like a real boutique, so it keeps the inflated counter that
  // mirrors the reference site's "1,379 New Items".
  if (shopifyEnabled) return list.filter((p) => p.badges.includes("new")).length;

  return list.length * 26 + 51;
}
