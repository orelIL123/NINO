import type { MetadataRoute } from "next";
import { getAllProductSlugs, getBrands, getCategories } from "@/lib/api/products";
import { infoPages } from "@/lib/data/pages";
import { locales } from "@/lib/i18n/config";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, brands, productSlugs] = await Promise.all([
    getCategories(),
    getBrands(),
    getAllProductSlugs(),
  ]);

  const paths = [
    "",
    "/clothing",
    "/shoes",
    "/accessories",
    "/shop",
    "/sale",
    "/brands",
    "/about",
    "/contact",
    ...categories.map((c) => `/category/${c.slug}`),
    ...brands.map((b) => `/brands/${b.slug}`),
    ...productSlugs.map((s) => `/product/${s}`),
    ...infoPages.map((p) => `/info/${p.slug}`),
  ];

  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${SITE.url}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
      priority: path === "" ? 1 : path.startsWith("/product/") ? 0.7 : 0.8,
    }))
  );
}
