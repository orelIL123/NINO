"use client";

import { useState } from "react";

import QuantityStepper from "@/components/cart/QuantityStepper";
import WishlistButton from "./WishlistButton";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useStore } from "@/lib/store/StoreProvider";
import type { Product } from "@/lib/data/types";

export default function PurchasePanel({
  product,
  brandName,
}: {
  product: Product;
  brandName: string;
}) {
  const { dict, locale } = useLocale();
  const { addToCart } = useStore();
  const colors = product.colorOptions?.length
    ? product.colorOptions
    : [{ key: "default", name: product.color.name, hex: product.color.hex, sizes: product.sizes }];
  const [colorKey, setColorKey] = useState(colors[0].key);
  const selectedColor = colors.find((color) => color.key === colorKey) ?? colors[0];
  const [size, setSize] = useState<string | null>(
    selectedColor.sizes.length === 1 && selectedColor.sizes[0].stock > 0
      ? selectedColor.sizes[0].label
      : null
  );
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(false);

  const soldOut = colors.every((color) => color.sizes.every((item) => item.stock === 0));
  const selected = selectedColor.sizes.find((item) => item.label === size);

  const submit = () => {
    if (!size) {
      setError(true);
      return;
    }
    addToCart({
      productId: product.id,
      variantId: selected?.variantId,
      slug: product.slug,
      size,
      quantity,
      title: product.title,
      brand: brandName,
      price: product.price,
      image: product.images[0],
      color: selectedColor.name[locale],
    });
  };

  return (
    <div className="space-y-5">
      {colors.length > 1 && (
        <div>
          <div className="mb-2.5 flex items-baseline gap-2">
            <span className="eyebrow">{dict.product.color}</span>
            <span className="text-xs text-ink-muted">{selectedColor.name[locale]}</span>
          </div>
          <div className="flex flex-wrap gap-3" role="group" aria-label={dict.product.color}>
            {colors.map((color) => {
              const active = color.key === selectedColor.key;
              const unavailable = color.sizes.every((item) => item.stock === 0);
              return (
                <button
                  key={color.key}
                  type="button"
                  title={color.name[locale]}
                  aria-label={color.name[locale]}
                  aria-pressed={active}
                  onClick={() => {
                    setColorKey(color.key);
                    const available = color.sizes.filter((item) => item.stock > 0);
                    setSize(available.length === 1 ? available[0].label : null);
                    setQuantity(1);
                    setError(false);
                  }}
                  className={`relative h-8 w-8 rounded-full border-2 p-0.5 transition ${
                    active ? "border-ink" : "border-transparent hover:border-line-strong"
                  } ${unavailable ? "opacity-40" : ""}`}
                >
                  <span
                    className="block h-full w-full rounded-full border border-black/15"
                    style={{ backgroundColor: color.hex }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes ---------------------------------------------------------- */}
      <div>
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="eyebrow">{dict.product.size}</span>
          <span className="text-xs text-ink-muted">{dict.product.sizeGuide}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedColor.sizes.map((s) => {
            const disabled = s.stock === 0;
            const active = s.label === size;
            return (
              <button
                key={s.label}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setSize(s.label);
                  setError(false);
                }}
                aria-pressed={active}
                className={`relative min-w-12 border px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-line-strong hover:border-ink"
                } ${
                  disabled
                    ? "cursor-not-allowed text-ink-muted opacity-45 hover:border-line-strong"
                    : ""
                }`}
              >
                {s.label}
                {disabled && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  >
                    <span className="h-px w-full rotate-[-20deg] bg-current opacity-50" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {error && (
          <p className="mt-2 text-xs text-sale" role="alert">
            {dict.product.selectSize}
          </p>
        )}
        {selected && selected.stock > 0 && selected.stock <= 3 && (
          <p className="mt-2 text-xs text-sale">{dict.product.lowStock}</p>
        )}
      </div>

      {/* Quantity ------------------------------------------------------- */}
      <div className="flex items-center gap-4">
        <span className="eyebrow">{dict.product.quantity}</span>
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          max={Math.min(10, selected?.stock ?? 10)}
        />
      </div>

      {/* Actions -------------------------------------------------------- */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={soldOut}
          className="btn btn-primary flex-1"
        >
          {soldOut ? dict.product.outOfStock : dict.product.addToCart}
        </button>
        <WishlistButton
          size={20}
          className="h-auto! w-13! rounded-none! border border-ink bg-transparent!"
          item={{
            productId: product.id,
            slug: product.slug,
            title: product.title,
            brand: brandName,
            price: product.price,
            image: product.images[0],
            color: selectedColor.name[locale],
          }}
        />
      </div>
    </div>
  );
}
