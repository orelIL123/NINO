import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CollectionView, {
  groupTitle,
  type CollectionSearchParams,
} from "@/components/collection/CollectionView";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

const GROUP = "sale" as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: groupTitle(GROUP, locale) };
}

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<CollectionSearchParams>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  return (
    <CollectionView
      locale={locale}
      title={groupTitle(GROUP, locale)}
      description={GROUP === "sale" ? dict.home.saleText : undefined}
      base={{ group: GROUP }}
      searchParams={await searchParams}
      crumbs={[{ label: groupTitle(GROUP, locale) }]}
    />
  );
}
