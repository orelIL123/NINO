import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CollectionView, {
  type CollectionSearchParams,
} from "@/components/collection/CollectionView";
import { isLocale, localeHref } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: getDictionary(locale).nav.all,
    alternates: { canonical: localeHref(locale, "/shop") },
  };
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<CollectionSearchParams>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <CollectionView
      locale={locale}
      title={dict.nav.all}
      description={dict.home.heroSubtitle}
      base={{}}
      searchParams={await searchParams}
      crumbs={[{ label: dict.nav.all }]}
    />
  );
}
