import Image from "next/image";
import Link from "next/link";

import WishlistButton from "./WishlistButton";
import { brands } from "@/lib/data/catalog";
import type { Product } from "@/lib/data/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeHref, type Locale } from "@/lib/i18n/config";
import { discountPercent, formatPrice } from "@/lib/utils/format";

export default function ProductCard({
  product,
  locale,
  priority = false,
  sizes = "(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw",
}: {
  product: Product;
  locale: Locale;
  priority?: boolean;
  sizes?: string;
}) {
  const dict = getDictionary(locale);
  const brand = brands.find((b) => b.slug === product.brand);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const href = localeHref(locale, `/product/${product.slug}`);
  const colorways = product.relatedColors?.length ?? 0;
  const soldOut = product.sizes.every((s) => s.stock === 0);

  return (
    <article className="group relative">
      <Link href={href} className="block">
        <div className="relative aspect-3/4 overflow-hidden bg-tile">
          <Image
            src={product.images[0]}
            alt={product.title[locale]}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
          <Image
            src={product.images[1] ?? product.images[0]}
            alt=""
            aria-hidden="true"
            fill
            sizes={sizes}
            loading="lazy"
            className="scale-105 object-cover opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100"
          />

          <div className="absolute top-3 start-3 flex flex-col items-start gap-1.5">
            {discount && (
              <span
                dir="ltr"
                className="bg-sale px-2 py-1 text-[10px] font-medium tracking-widest text-white"
              >
                −{discount}%
              </span>
            )}
            {product.badges.includes("new") && !discount && (
              <span className="bg-ink px-2 py-1 text-[10px] font-medium tracking-widest text-white">
                {dict.product.new}
              </span>
            )}
            {soldOut && (
              <span className="bg-canvas px-2 py-1 text-[10px] font-medium tracking-widest text-ink">
                {dict.product.outOfStock}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="absolute top-2.5 end-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100 max-lg:opacity-100">
        <WishlistButton
          item={{
            productId: product.id,
            slug: product.slug,
            title: product.title,
            brand: brand?.name ?? product.brand,
            price: product.price,
            image: product.images[0],
            color: product.color.name[locale],
          }}
        />
      </div>

      <div className="pt-3.5">
        <p className="eyebrow text-ink-muted">{brand?.name}</p>
        <h3 className="mt-1 text-sm leading-snug">
          <Link href={href} className="transition-colors hover:text-ink-soft">
            {product.title[locale]}
          </Link>
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span
            className={`text-sm ${discount ? "font-medium text-sale" : ""}`}
          >
            {formatPrice(product.price, locale)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-ink-muted line-through">
              {formatPrice(product.compareAtPrice, locale)}
            </span>
          )}
        </div>
        {colorways > 1 && (
          <p className="mt-1 text-xs text-ink-muted">
            {colorways} {dict.product.colors}
          </p>
        )}
      </div>
    </article>
  );
}
