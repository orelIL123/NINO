import type { Locale } from "@/lib/i18n/config";

/** A string that exists in every supported language. */
export type Localized = Record<Locale, string>;

export type Gender = "women" | "men" | "unisex";

export interface Brand {
  slug: string;
  name: string;
  country: Localized;
  description: Localized;
}

export interface Category {
  slug: string;
  title: Localized;
  /** Top level group the category belongs to (used for the mega menu). */
  group: "new" | "women" | "men" | "shoes" | "accessories" | "sale";
  gender: Gender;
  image?: string;
  /** Featured in "shop by category" tiles on the home page. */
  featured?: boolean;
}

export interface ProductSize {
  label: string;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  title: Localized;
  description: Localized;
  details: Record<Locale, string[]>;
  brand: string;
  category: string;
  group: Category["group"];
  gender: Gender;
  /** Price in ILS, tax included. */
  price: number;
  /** Original price when the item is discounted. */
  compareAtPrice?: number;
  color: { name: Localized; hex: string };
  /** Other colourways of the same style (product slugs). */
  relatedColors?: string[];
  sizes: ProductSize[];
  images: string[];
  badges: Array<"new" | "bestseller" | "last-units">;
  /** ISO date — drives "newest" sorting. */
  createdAt: string;
  /** 0-100, drives "best selling" sorting. */
  popularity: number;
}

/**
 * Cart and wishlist entries carry a snapshot of the product so the client
 * bundle never has to ship (or re-fetch) the whole catalog. When Firestore is
 * wired up, re-validate price and stock server-side at checkout.
 */
export interface CartLine {
  productId: string;
  slug: string;
  size: string;
  quantity: number;
  title: Localized;
  brand: string;
  price: number;
  image: string;
  color: string;
}

export type WishlistItem = Omit<CartLine, "size" | "quantity">;

export type SortKey = "newest" | "popular" | "price-asc" | "price-desc";

export interface ProductQuery {
  group?: Category["group"];
  category?: string;
  brand?: string[];
  size?: string[];
  color?: string[];
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  search?: string;
  sort?: SortKey;
  limit?: number;
  exclude?: string[];
}
