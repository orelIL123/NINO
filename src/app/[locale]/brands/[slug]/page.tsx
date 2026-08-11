import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CollectionView, {
  type CollectionSearchParams,
} from "@/components/collection/CollectionView";
import { getBrandBySlug, getBrands } from "@/lib/api/products";
import { isLocale, localeHref, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateStaticParams() {
  const brands = await getBrands();
  return locales.flatMap((locale) =>
    brands.map((b) => ({ locale, slug: b.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const brand = await getBrandBySlug(slug);
  return brand ? { title: brand.name, description: brand.description[locale] } : {};
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<CollectionSearchParams>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();
  const dict = getDictionary(locale);

  return (
    <CollectionView
      locale={locale}
      title={brand.name}
      description={brand.description[locale]}
      base={{ brand: [slug] }}
      searchParams={await searchParams}
      crumbs={[
        { label: dict.nav.brands, href: localeHref(locale, "/brands") },
        { label: brand.name },
      ]}
    />
  );
}
