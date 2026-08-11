import Image from "next/image";
import Link from "next/link";

import { brands } from "@/lib/data/catalog";
import type { Product } from "@/lib/data/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeHref, type Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/utils/format";

/**
 * Split hero: a typographic block on one side, a rail of fresh arrivals on the
 * other — the same rhythm as the reference site's "1,379 New Items" opener.
 */
export default function Hero({
  products,
  newCount,
  locale,
}: {
  products: Product[];
  newCount: number;
  locale: Locale;
}) {
  const dict = getDictionary(locale);

  return (
    <section className="border-b border-line">
      <div className="container-nino grid items-center gap-8 py-10 lg:grid-cols-[minmax(240px,26%)_1fr] lg:gap-10 lg:py-14">
        <div className="text-center lg:text-start">
          <p className="eyebrow text-ink-muted">{dict.home.heroEyebrow}</p>
          <p className="mt-3 font-display text-6xl leading-[0.95] font-light md:text-7xl">
            {formatNumber(newCount, locale)}
          </p>
          <h1 className="font-display text-4xl leading-tight font-light md:text-5xl">
            {dict.home.heroCountSuffix}
          </h1>
          <div className="mt-5 space-y-0.5 text-sm text-ink-soft">
            <p>{dict.home.heroLine1}</p>
            <p>{dict.home.heroLine2}</p>
            <p>{dict.home.heroLine3}</p>
          </div>
          <Link
            href={localeHref(locale, "/category/new-in")}
            className="link-underline mt-7 inline-block text-xs tracking-[0.16em] uppercase"
          >
            {dict.home.shopNow}
          </Link>
        </div>

        <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:px-0">
          {products.slice(0, 5).map((product, i) => {
            const brand = brands.find((b) => b.slug === product.brand);
            return (
              <Link
                key={product.slug}
                href={localeHref(locale, `/product/${product.slug}`)}
                className="group w-[44vw] shrink-0 snap-start sm:w-[30vw] lg:w-auto"
              >
                <div className="relative aspect-3/4 overflow-hidden bg-tile">
                  <Image
                    src={product.images[0]}
                    alt={product.title[locale]}
                    fill
                    sizes="(min-width: 1024px) 16vw, 44vw"
                    priority={i < 3}
                    fetchPriority={i === 0 ? "high" : undefined}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <p className="eyebrow mt-3 text-center text-ink-soft">
                  {brand?.name}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
