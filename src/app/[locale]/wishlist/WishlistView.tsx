"use client";

import Image from "next/image";
import Link from "next/link";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useStore } from "@/lib/store/StoreProvider";
import { formatPrice } from "@/lib/utils/format";
import { HeartIcon } from "@/components/ui/Icons";

export default function WishlistView() {
  const { dict, locale, href } = useLocale();
  const { wishlist, toggleWishlist, ready } = useStore();

  if (!ready) return <div className="container-nino py-24" aria-busy="true" />;

  return (
    <div className="container-nino py-10 md:py-14">
      <h1 className="font-display text-3xl font-light md:text-4xl">
        {dict.wishlist.title}
      </h1>

      {wishlist.length === 0 ? (
        <div className="py-20 text-center">
          <HeartIcon size={38} className="mx-auto text-line-strong" />
          <p className="mt-4 text-base">{dict.wishlist.empty}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
            {dict.wishlist.emptyText}
          </p>
          <Link href={href("/category/new-in")} className="btn btn-ghost mt-7">
            {dict.nav.new}
          </Link>
        </div>
      ) : (
        <div className="mt-9 grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
          {wishlist.map((item) => (
            <article key={item.slug} className="group relative">
              <Link href={href(`/product/${item.slug}`)}>
                <div className="relative aspect-3/4 overflow-hidden bg-tile">
                  <Image
                    src={item.image}
                    alt={item.title[locale]}
                    fill
                    sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </Link>
              <button
                type="button"
                onClick={() => toggleWishlist(item)}
                aria-label={dict.product.removeFromWishlist}
                className="absolute top-2.5 end-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-canvas/85 backdrop-blur"
              >
                <HeartIcon size={18} filled />
              </button>
              <div className="pt-3.5">
                <p className="eyebrow text-ink-muted">{item.brand}</p>
                <h2 className="mt-1 text-sm">
                  <Link href={href(`/product/${item.slug}`)}>
                    {item.title[locale]}
                  </Link>
                </h2>
                <p className="mt-1.5 text-sm">{formatPrice(item.price, locale)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
