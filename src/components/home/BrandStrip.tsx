import Link from "next/link";
import type { Brand } from "@/lib/data/types";
import { localeHref, type Locale } from "@/lib/i18n/config";

export default function BrandStrip({
  brands,
  locale,
}: {
  brands: Brand[];
  locale: Locale;
}) {
  return (
    <div className="hide-scrollbar -mx-4 flex gap-8 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:justify-center md:gap-x-12 md:gap-y-6 md:px-0">
      {brands.map((brand) => (
        <Link
          key={brand.slug}
          href={localeHref(locale, `/brands/${brand.slug}`)}
          className="shrink-0 text-sm tracking-[0.22em] whitespace-nowrap text-ink-muted uppercase transition-colors hover:text-ink"
        >
          {brand.name}
        </Link>
      ))}
    </div>
  );
}
