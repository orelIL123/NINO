import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProductGrid from "@/components/product/ProductGrid";
import { getCategories, getProducts } from "@/lib/api/products";
import { isLocale, localeHref } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).search.title, robots: { index: false } };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { q = "" } = await searchParams;
  const dict = getDictionary(locale);
  const query = q.trim();
  const [results, categories] = await Promise.all([
    query ? getProducts({ search: query, sort: "popular" }) : Promise.resolve([]),
    getCategories(),
  ]);

  return (
    <div className="container-nino py-10 md:py-14">
      <h1 className="font-display text-3xl font-light md:text-4xl">
        {query ? `${dict.search.resultsFor} "${query}"` : dict.search.title}
      </h1>
      {query && (
        <p className="mt-2 text-xs text-ink-muted">
          {results.length} {dict.listing.results}
        </p>
      )}

      {results.length > 0 ? (
        <div className="mt-9">
          <ProductGrid
            products={results}
            locale={locale}
            columns={5}
            priorityCount={5}
          />
        </div>
      ) : (
        <div className="mt-10 max-w-lg">
          {query && (
            <>
              <p className="text-base">{dict.search.noResults}</p>
              <p className="mt-2 text-sm text-ink-soft">
                {dict.search.noResultsText}
              </p>
            </>
          )}
          <ul className="mt-7 flex flex-wrap gap-2">
            {categories.slice(0, 10).map((c) => (
              <li key={c.slug}>
                <Link
                  href={localeHref(locale, `/category/${c.slug}`)}
                  className="inline-block border border-line px-3 py-1.5 text-xs transition-colors hover:border-ink"
                >
                  {c.title[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
