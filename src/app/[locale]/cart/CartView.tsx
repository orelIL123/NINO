"use client";

import Image from "next/image";
import Link from "next/link";

import QuantityStepper from "@/components/cart/QuantityStepper";
import FreeShippingBar from "@/components/cart/FreeShippingBar";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useStore } from "@/lib/store/StoreProvider";
import { formatPrice } from "@/lib/utils/format";
import { TrashIcon } from "@/components/ui/Icons";

export default function CartView() {
  const { dict, locale, href } = useLocale();
  const {
    cart,
    cartCount,
    subtotal,
    shipping,
    total,
    setQuantity,
    removeFromCart,
    ready,
  } = useStore();

  if (!ready) {
    return <div className="container-nino py-24" aria-busy="true" />;
  }

  if (cart.length === 0) {
    return (
      <div className="container-nino py-24 text-center">
        <h1 className="font-display text-3xl font-light">{dict.cart.empty}</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-ink-soft">
          {dict.cart.emptyText}
        </p>
        <Link href={href("/category/new-in")} className="btn btn-primary mt-7">
          {dict.cart.continue}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-nino py-10 md:py-14">
      <h1 className="font-display text-3xl font-light md:text-4xl">
        {dict.cart.title}{" "}
        <span className="text-base text-ink-muted">
          ({cartCount} {dict.cart.items})
        </span>
      </h1>

      <div className="mt-9 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <ul className="divide-y divide-line border-y border-line">
          {cart.map((line) => (
            <li
              key={`${line.slug}-${line.size}-${line.color}`}
              className="flex gap-4 py-6 md:gap-6"
            >
              <Link
                href={href(`/product/${line.slug}`)}
                className="relative aspect-3/4 w-24 shrink-0 overflow-hidden bg-tile md:w-32"
              >
                <Image
                  src={line.image}
                  alt={line.title[locale]}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <p className="eyebrow text-ink-muted">{line.brand}</p>
                <Link
                  href={href(`/product/${line.slug}`)}
                  className="mt-1 text-base"
                >
                  {line.title[locale]}
                </Link>
                <p className="mt-1 text-xs text-ink-muted">
                  {line.color} · {dict.product.size} {line.size}
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-4 pt-4">
                  <QuantityStepper
                    value={line.quantity}
                    onChange={(q) => setQuantity(line.slug, line.size, line.color, q)}
                  />
                  <button
                    type="button"
                    onClick={() => removeFromCart(line.slug, line.size, line.color)}
                    className="flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
                  >
                    <TrashIcon size={15} />
                    {dict.cart.remove}
                  </button>
                </div>
              </div>

              <p className="shrink-0 text-sm font-medium">
                {formatPrice(line.price * line.quantity, locale)}
              </p>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="border border-line p-6">
            <h2 className="eyebrow mb-5">{dict.checkout.summary}</h2>
            <FreeShippingBar subtotal={subtotal} />

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">{dict.cart.subtotal}</dt>
                <dd>{formatPrice(subtotal, locale)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">{dict.cart.shipping}</dt>
                <dd>
                  {shipping === 0
                    ? dict.cart.freeShipping
                    : formatPrice(shipping, locale)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
                <dt>{dict.cart.total}</dt>
                <dd>{formatPrice(total, locale)}</dd>
              </div>
            </dl>

            <Link href={href("/checkout")} className="btn btn-primary mt-6 w-full">
              {dict.cart.checkout}
            </Link>
            <Link
              href={href("/category/new-in")}
              className="mt-4 block text-center text-xs underline underline-offset-4"
            >
              {dict.cart.continue}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
