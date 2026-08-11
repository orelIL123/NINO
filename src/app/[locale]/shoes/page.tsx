import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CollectionView, {
  groupTitle,
  type CollectionSearchParams,
} from "@/components/collection/CollectionView";
import { isLocale } from "@/lib/i18n/config";

const GROUP = "shoes" as const;

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

  return (
    <CollectionView
      locale={locale}
      title={groupTitle(GROUP, locale)}
      base={{ group: GROUP }}
      searchParams={await searchParams}
      crumbs={[{ label: groupTitle(GROUP, locale) }]}
    />
  );
}
