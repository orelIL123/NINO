import { idFromGid } from "./client";
import type { ShopifyProduct, ShopifyVariant } from "./types";

import type { Category, Gender, Localized, Product } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";

/* -------------------------------------------------------------------------- */
/*  SHOPIFY -> APP MODEL                                                      */
/*                                                                            */
/*  Everything downstream (pages, cards, filters) keeps talking to the same    */
/*  `Product` shape, so the UI never learns that the data moved to Shopify.    */
/* -------------------------------------------------------------------------- */

/** Option names we accept for size / colour, in both storefront languages. */
const SIZE_OPTIONS = ["size", "מידה"];
const COLOR_OPTIONS = ["color", "colour", "צבע"];

const GROUP_TAGS: Record<string, Category["group"]> = {
  new: "new",
  "new-in": "new",
  clothing: "clothing",
  shoes: "shoes",
  footwear: "shoes",
  accessories: "accessories",
  sale: "sale",
};

const CATEGORY_TAG_PREFIX = "category:";

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9֐-׿]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function optionValue(
  variant: ShopifyVariant,
  names: string[]
): string | undefined {
  return variant.selectedOptions.find((o) =>
    names.includes(o.name.trim().toLowerCase())
  )?.value;
}

/** Builds a `Localized` value from the per-language fetches. */
function localized(he: string, en: string): Localized {
  return { he: he || en, en: en || he };
}

function toGender(tags: string[]): Gender {
  const lower = tags.map((t) => t.toLowerCase());
  if (lower.includes("women") || lower.includes("נשים")) return "women";
  if (lower.includes("men") || lower.includes("גברים")) return "men";
  return "unisex";
}

function toGroup(
  tags: string[],
  collections: string[],
  onSale: boolean
): Category["group"] {
  if (onSale) return "sale";
  for (const key of [...tags, ...collections].map((v) => v.toLowerCase())) {
    const group = GROUP_TAGS[key];
    if (group) return group;
  }
  return "clothing";
}

/**
 * Turns the Hebrew and English versions of one Shopify product into the app's
 * `Product`. Pass the same node twice if the store has no translations yet.
 */
export function toProduct(he: ShopifyProduct, en: ShopifyProduct): Product {
  const variants = he.variants.edges.map((e) => e.node);
  const first = variants[0];

  const price = Number(he.priceRange.minVariantPrice.amount);
  const compareAt = Number(he.compareAtPriceRange.minVariantPrice.amount);
  const onSale = compareAt > price;

  const collections = he.collections.edges.map((e) => e.node.handle);
  const categoryTag = he.tags.find((tag) => tag.toLowerCase().startsWith(CATEGORY_TAG_PREFIX));
  const merchandisingCategory = categoryTag?.slice(CATEGORY_TAG_PREFIX.length);

  // Sizes come from the variant matrix; a variant with no size option still
  // needs one row so "add to cart" has something to select.
  const sizes = variants.map((v) => ({
    label: optionValue(v, SIZE_OPTIONS) ?? v.title,
    stock: v.availableForSale ? (v.quantityAvailable ?? 99) : 0,
  }));

  const totalStock = sizes.reduce((sum, s) => sum + s.stock, 0);

  const badges: Product["badges"] = [];
  const lowerTags = he.tags.map((t) => t.toLowerCase());
  if (lowerTags.includes("new") || lowerTags.includes("חדש")) badges.push("new");
  if (lowerTags.includes("bestseller")) badges.push("bestseller");
  if (totalStock > 0 && totalStock <= 3) badges.push("last-units");

  const colorName = first ? optionValue(first, COLOR_OPTIONS) : undefined;
  const colorNameEn = en.variants.edges[0]?.node
    ? optionValue(en.variants.edges[0].node, COLOR_OPTIONS)
    : undefined;

  return {
    id: idFromGid(he.id),
    slug: he.handle,
    sku: first?.sku ?? he.handle,
    title: localized(he.title, en.title),
    description: localized(he.description, en.description),
    details: {
      he: he.description.split("\n").filter(Boolean),
      en: en.description.split("\n").filter(Boolean),
    },
    brand: slugify(he.vendor || "nino"),
    category: slugify(merchandisingCategory || he.productType || collections[0] || "clothing"),
    group: toGroup(he.tags, collections, onSale),
    gender: toGender(he.tags),
    price,
    ...(onSale ? { compareAtPrice: compareAt } : {}),
    color: {
      name: localized(colorName ?? "", colorNameEn ?? ""),
      hex: "#000000",
    },
    sizes,
    images: he.images.edges.map((e) => e.node.url),
    badges,
    createdAt: he.createdAt,
    // Shopify has no public popularity score on the Storefront API; recency is
    // the closest stand-in until we wire an analytics-backed metafield.
    popularity: badges.includes("bestseller") ? 90 : 50,
  };
}

/** Shopify language codes, keyed by the app's locales. */
export const languageCode: Record<Locale, string> = {
  he: "HE",
  en: "EN",
};
