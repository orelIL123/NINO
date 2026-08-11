import Link from "next/link";

import Filters from "./Filters";
import { PRICE_BANDS } from "@/lib/data/filters";
import ProductGrid from "@/components/product/ProductGrid";
import { getFacets, getProducts } from "@/lib/api/products";
import type { Category, ProductQuery, SortKey } from "@/lib/data/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeHref, type Locale } from "@/lib/i18n/config";

export type CollectionSearchParams = Record<string, string | string[] | undefined>;

const asString = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

const asList = (v: string | string[] | undefined) =>
  asString(v)?.split(",").filter(Boolean) ?? [];

export default async function CollectionView({
  locale,
  title,
  description,
  base,
  searchParams,
  crumbs = [],
}: {
  locale: Locale;
  title: string;
  description?: string;
  /** Fixed part of the query — the category or group this page represents. */
  base: Pick<ProductQuery, "group" | "category" | "brand" | "search">;
  searchParams: CollectionSearchParams;
  crumbs?: { label: string; href?: string }[];
}) {
  const dict = getDictionary(locale);

  const priceKey = asString(searchParams.price);
  const band = PRICE_BANDS.find((b) => b.key === priceKey);

  const query: ProductQuery = {
    ...base,
    brand: base.brand ?? (asList(searchParams.brand).length ? asList(searchParams.brand) : undefined),
    size: asList(searchParams.size).length ? asList(searchParams.size) : undefined,
    color: asList(searchParams.color).length ? asList(searchParams.color) : undefined,
    minPrice: band?.min,
    maxPrice: band?.max,
    onSale: searchParams.sale === "1" ? true : base.group === "sale" || undefined,
    sort: (asString(searchParams.sort) as SortKey) ?? "newest",
  };

  // Facets are built from the unfiltered set so options never disappear mid-flow.
  const [products, all] = await Promise.all([
    getProducts(query),
    getProducts({ ...base, onSale: base.group === "sale" || undefined }),
  ]);
  const facets = await getFacets(all);

  return (
    <div className="container-nino py-8 md:py-10">
      {crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
            <li>
              <Link href={localeHref(locale, "/")} className="hover:text-ink">
                NINO
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                <span aria-hidden="true">/</span>
                {c.href ? (
                  <Link href={c.href} className="hover:text-ink">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-ink">{c.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <header className="mb-7">
        <h1 className="font-display text-3xl font-light md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">{description}</p>
        )}
        <p className="mt-2 text-xs text-ink-muted lg:hidden">
          {products.length} {dict.listing.results}
        </p>
      </header>

      <Filters facets={facets} total={products.length}>
        {products.length === 0 ? (
          <div className="border border-line py-24 text-center">
            <p className="text-sm text-ink-soft">{dict.listing.noResults}</p>
          </div>
        ) : (
          <ProductGrid
            products={products}
            locale={locale}
            columns={4}
            priorityCount={4}
          />
        )}
      </Filters>
    </div>
  );
}

/** Shared helper for the group landing pages (women / men / shoes / …). */
export function groupTitle(group: Category["group"], locale: Locale) {
  const dict = getDictionary(locale);
  const map: Record<Category["group"], string> = {
    new: dict.nav.new,
    women: dict.nav.women,
    men: dict.nav.men,
    shoes: dict.nav.shoes,
    accessories: dict.nav.accessories,
    sale: dict.nav.sale,
  };
  return map[group];
}
