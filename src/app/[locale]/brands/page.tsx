import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getBrands } from "@/lib/api/products";
import { isLocale, localeHref } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).nav.brands };
}

export default async function BrandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const brands = await getBrands();

  return (
    <div className="container-nino py-10 md:py-14">
      <h1 className="font-display text-3xl font-light md:text-4xl">
        {dict.nav.brands}
      </h1>

      <ul className="mt-9 grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <li key={brand.slug} className="bg-canvas">
            <Link
              href={localeHref(locale, `/brands/${brand.slug}`)}
              className="group flex h-full flex-col gap-2 p-7 transition-colors hover:bg-surface"
            >
              <span className="text-lg tracking-[0.2em]">{brand.name}</span>
              <span className="eyebrow text-ink-muted">
                {brand.country[locale]}
              </span>
              <span className="mt-1 text-sm text-ink-soft">
                {brand.description[locale]}
              </span>
              <span className="link-underline mt-auto pt-4 text-xs tracking-widest uppercase">
                {dict.nav.all}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
