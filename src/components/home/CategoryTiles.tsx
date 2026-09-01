import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/data/types";
import { localeHref, type Locale } from "@/lib/i18n/config";

export interface Tile {
  label: string;
  href: string;
  image: string;
  isEmpty?: boolean;
}

export default function CategoryTiles({ tiles, locale = "he" }: { tiles: Tile[]; locale?: Locale }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Link key={tile.href} href={tile.href} className="group block">
          <div className="relative aspect-4/5 overflow-hidden bg-tile">
            <Image
              src={tile.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 24vw, 48vw"
              loading="lazy"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            />
            {tile.isEmpty && <span className="absolute inset-0 flex items-center justify-center bg-black/20 px-3 text-center text-sm font-medium text-white">{locale === "he" ? "יתווספו פריטים בקרוב" : "More pieces coming soon"}</span>}
          </div>
          <p className="mt-3 text-center text-xs tracking-[0.14em] uppercase">
            <span className="link-underline">{tile.label}</span>
          </p>
        </Link>
      ))}
    </div>
  );
}

/** Builds tiles from products so each category shows a real item. */
export function tilesFromProducts(
  entries: {
    label: string;
    slug: string;
    href?: string;
    product?: Product;
    overrideImage?: string | null;
  }[],
  locale: Locale
): Tile[] {
  const fallbackBySlug: Record<string, string> = {
    tshirts: "/media/nino-clothing-fallback.webp",
    outerwear: "/media/nino-clothing-fallback.webp",
    sneakers: "/media/nino-shoes-fallback.webp",
    bags: "/media/nino-accessories-fallback.webp",
  };
  return entries.map((e) => ({
    label: e.label,
    href: localeHref(locale, e.href ?? `/category/${e.slug}`),
    image: e.overrideImage ?? e.product?.images[0] ?? fallbackBySlug[e.slug] ?? "/media/coming-soon.svg",
    isEmpty: !e.overrideImage && !e.product,
  }));
}
