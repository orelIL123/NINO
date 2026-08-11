import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CollectionView, {
  type CollectionSearchParams,
} from "@/components/collection/CollectionView";
import { getCategories, getCategoryBySlug } from "@/lib/api/products";
import { isLocale, locales, localeHref } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateStaticParams() {
  const categories = await getCategories();
  return locales.flatMap((locale) =>
    categories.map((c) => ({ locale, slug: c.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.title[locale],
    alternates: { canonical: localeHref(locale, `/category/${slug}`) },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<CollectionSearchParams>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const dict = getDictionary(locale);
  const groupLabel = {
    new: dict.nav.new,
    women: dict.nav.women,
    men: dict.nav.men,
    shoes: dict.nav.shoes,
    accessories: dict.nav.accessories,
    sale: dict.nav.sale,
  }[category.group];

  return (
    <CollectionView
      locale={locale}
      title={category.title[locale]}
      base={
        slug === "new-in"
          ? { group: "new" }
          : { category: slug }
      }
      searchParams={await searchParams}
      crumbs={[
        {
          label: groupLabel,
          href:
            category.group === "new"
              ? undefined
              : localeHref(locale, `/${category.group}`),
        },
        { label: category.title[locale] },
      ]}
    />
  );
}
