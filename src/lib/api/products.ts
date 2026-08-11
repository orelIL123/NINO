import "server-only";

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

/* -------------------------------------------------------------------------- */
/*  DATA ACCESS LAYER                                                         */
/*                                                                            */
/*  Every function here is async on purpose. Today they read from the local    */
/*  demo catalog; when Firestore is ready, swap the body of each function for  */
/*  a Firestore query (see src/lib/firebase/README.md) and no page or          */
/*  component has to be touched.                                              */
/* -------------------------------------------------------------------------- */

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

  let list = products;

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
      list = list.filter((p) => {
        const brandName = brands.find((b) => b.slug === p.brand)?.name ?? "";
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
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  const set = new Set(slugs);
  return products.filter((p) => set.has(p.slug));
}

export async function getRelatedProducts(
  product: Product,
  count = 4
): Promise<Product[]> {
  const sameCategory = products.filter(
    (p) => p.category === product.category && p.slug !== product.slug
  );
  const sameBrand = products.filter(
    (p) =>
      p.brand === product.brand &&
      p.slug !== product.slug &&
      !sameCategory.includes(p)
  );
  return [...sameCategory, ...sameBrand].slice(0, count);
}

export async function getAllProductSlugs(): Promise<string[]> {
  return products.map((p) => p.slug);
}

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getBrands(): Promise<Brand[]> {
  return brands;
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  return brands.find((b) => b.slug === slug) ?? null;
}

/** Facet values available for the filter sidebar, scoped to a product set. */
export async function getFacets(list: Product[]) {
  const brandSlugs = new Set(list.map((p) => p.brand));
  const sizeLabels = new Set(list.flatMap((p) => p.sizes.map((s) => s.label)));
  const colorKeys = new Set(list.map((p) => p.color.name.en.toLowerCase()));

  return {
    brands: brands.filter((b) => brandSlugs.has(b.slug)),
    sizes: Array.from(sizeLabels).sort((a, b) => {
      const order = ["XS", "S", "M", "L", "XL", "XXL", "ONE SIZE"];
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return Number(a) - Number(b);
    }),
    colors: colorList.filter((c) => colorKeys.has(c.name.en.toLowerCase())),
    price: priceBounds,
  };
}

export async function getNewItemsCount(): Promise<number> {
  // Mirrors the "1,379 New Items" counter on the reference site.
  return products.length * 26 + 51;
}
