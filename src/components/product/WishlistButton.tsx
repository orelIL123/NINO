"use client";

import { useStore } from "@/lib/store/StoreProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { HeartIcon } from "@/components/ui/Icons";
import type { WishlistItem } from "@/lib/data/types";

export default function WishlistButton({
  item,
  className = "",
  size = 18,
}: {
  item: WishlistItem;
  className?: string;
  size?: number;
}) {
  const { toggleWishlist, inWishlist, ready } = useStore();
  const { dict } = useLocale();
  const active = ready && inWishlist(item.slug);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(item);
      }}
      aria-pressed={active}
      aria-label={active ? dict.product.removeFromWishlist : dict.product.addToWishlist}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-canvas/80 backdrop-blur transition-all hover:bg-canvas ${className}`}
    >
      <HeartIcon size={size} filled={active} />
    </button>
  );
}
