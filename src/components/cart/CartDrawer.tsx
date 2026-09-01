"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import QuantityStepper from "./QuantityStepper";
import FreeShippingBar from "./FreeShippingBar";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useStore } from "@/lib/store/StoreProvider";
import { formatPrice } from "@/lib/utils/format";
import { BagIcon, CloseIcon, TrashIcon } from "@/components/ui/Icons";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";

export default function CartDrawer() {
  const { dict, locale, href } = useLocale();
  const {
    cart,
    cartCount,
    subtotal,
    shipping,
    total,
    drawerOpen,
    closeDrawer,
    removeFromCart,
    setQuantity,
  } = useStore();
  const dialogRef = useRef<HTMLElement>(null);
  useFocusTrap(dialogRef, drawerOpen, closeDrawer);

  return (
    <div
      className={`fixed inset-0 z-50 ${drawerOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!drawerOpen}
      inert={!drawerOpen ? true : undefined}
    >
      <div
        onClick={closeDrawer}
        className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={dict.cart.title}
        className={`absolute inset-y-0 start-0 flex w-full max-w-md flex-col bg-canvas shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen
            ? "translate-x-0"
            : "ltr:-translate-x-full rtl:translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="eyebrow">
            {dict.cart.title}
            {cartCount > 0 && ` (${cartCount})`}
          </h2>
          <button type="button" onClick={closeDrawer} aria-label={dict.header.close}>
            <CloseIcon size={22} />
          </button>
        </header>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <BagIcon size={40} className="text-line-strong" />
            <p className="text-base">{dict.cart.empty}</p>
            <p className="max-w-xs text-sm text-ink-soft">{dict.cart.emptyText}</p>
            <Link
              href={href("/category/new-in")}
              onClick={closeDrawer}
              className="btn btn-ghost mt-2"
            >
              {dict.nav.new}
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-5 py-4">
              <FreeShippingBar subtotal={subtotal} />
            </div>

            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {cart.map((line) => (
                <li key={`${line.slug}-${line.size}-${line.color}`} className="flex gap-4 py-5">
                  <Link
                    href={href(`/product/${line.slug}`)}
                    onClick={closeDrawer}
                    className="relative aspect-3/4 w-20 shrink-0 overflow-hidden bg-tile"
                  >
                    <Image
                      src={line.image}
                      alt={line.title[locale]}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <p className="eyebrow text-ink-muted">{line.brand}</p>
                    <Link
                      href={href(`/product/${line.slug}`)}
                      onClick={closeDrawer}
                      className="mt-0.5 block truncate text-sm"
                    >
                      {line.title[locale]}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {line.color} · {dict.product.size} {line.size}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <QuantityStepper
                        value={line.quantity}
                        onChange={(q) => setQuantity(line.slug, line.size, line.color, q)}
                      />
                      <span className="text-sm">
                        {formatPrice(line.price * line.quantity, locale)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(line.slug, line.size, line.color)}
                    aria-label={dict.cart.remove}
                    className="self-start p-1 text-ink-muted transition-colors hover:text-ink"
                  >
                    <TrashIcon size={17} />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="space-y-3 border-t border-line px-5 py-5">
              <div className="flex justify-between text-sm">
                <span className="text-ink-soft">{dict.cart.subtotal}</span>
                <span>{formatPrice(subtotal, locale)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-soft">{dict.cart.shipping}</span>
                <span>
                  {shipping === 0
                    ? dict.cart.freeShipping
                    : formatPrice(shipping, locale)}
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
                <span>{dict.cart.total}</span>
                <span>{formatPrice(total, locale)}</span>
              </div>

              <Link
                href={href("/checkout")}
                onClick={closeDrawer}
                className="btn btn-primary w-full"
              >
                {dict.cart.checkout}
              </Link>
              <Link
                href={href("/cart")}
                onClick={closeDrawer}
                className="block text-center text-xs underline underline-offset-4"
              >
                {dict.cart.title}
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
