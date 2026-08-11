"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/store/StoreProvider";
import { formatPrice, template } from "@/lib/utils/format";

export default function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const { dict, locale } = useLocale();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div>
      <p className="text-xs text-ink-soft">
        {remaining > 0
          ? template(dict.cart.freeShippingProgress, {
              amount: formatPrice(remaining, locale),
            })
          : dict.cart.freeShippingReached}
      </p>
      <div className="mt-2 h-0.5 w-full bg-line">
        <div
          className="h-full bg-ink transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
