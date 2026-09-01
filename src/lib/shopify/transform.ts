import { idFromGid } from "./client";
import type { ShopifyProduct, ShopifyVariant } from "./types";

import type {
  Category,
  Gender,
  Localized,
  Product,
  ProductColorOption,
} from "@/lib/data/types";
import { PRODUCT_COLORS } from "@/lib/admin/product-conventions";
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

function colorHex(...names: Array<string | undefined>): string {
  const normalized = names
    .filter((name): name is string => Boolean(name))
    .map((name) => name.trim().toLowerCase());
  return PRODUCT_COLORS.find(
    (color) =>
      normalized.includes(color.value.toLowerCase()) ||
      normalized.includes(color.label.toLowerCase())
  )?.hex ?? "#777777";
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
  const englishVariants = new Map(en.variants.edges.map(({ node }) => [node.id, node]));

  const price = Number(he.priceRange.minVariantPrice.amount);
  const compareAt = Number(he.compareAtPriceRange.minVariantPrice.amount);
  const onSale = compareAt > price;

  const collections = he.collections.edges.map((e) => e.node.handle);
  const categoryTag = he.tags.find((tag) => tag.toLowerCase().startsWith(CATEGORY_TAG_PREFIX));
  const merchandisingCategory = categoryTag?.slice(CATEGORY_TAG_PREFIX.length);

  // Group the Shopify variant matrix by colour. This preserves inventory for
  // every size/colour pair instead of treating the first colour as the product.
  const colorGroups = new Map<string, ProductColorOption>();
  variants.forEach((variant) => {
    const englishVariant = englishVariants.get(variant.id);
    const colorHe = optionValue(variant, COLOR_OPTIONS) ?? "";
    const colorEn = englishVariant
      ? optionValue(englishVariant, COLOR_OPTIONS) ?? colorHe
      : colorHe;
    const key = (colorEn || colorHe || "default").trim().toLowerCase();
    const size = optionValue(variant, SIZE_OPTIONS) ?? variant.title;
    const group = colorGroups.get(key) ?? {
      key,
      name: localized(colorHe, colorEn),
      hex: colorHex(colorEn, colorHe),
      sizes: [],
    };
    if (!group.sizes.some((item) => item.label === size)) {
      group.sizes.push({
        label: size,
        stock: variant.availableForSale ? (variant.quantityAvailable ?? 99) : 0,
        variantId: variant.id,
      });
    }
    colorGroups.set(key, group);
  });

  const colorOptions = [...colorGroups.values()];
  const aggregateSizes = new Map<string, Product["sizes"][number]>();
  colorOptions.forEach((color) => color.sizes.forEach((size) => {
    const current = aggregateSizes.get(size.label);
    aggregateSizes.set(size.label, {
      label: size.label,
      stock: (current?.stock ?? 0) + size.stock,
      variantId: current?.variantId ?? size.variantId,
    });
  }));
  const sizes = [...aggregateSizes.values()];

  const totalStock = sizes.reduce((sum, s) => sum + s.stock, 0);

  const badges: Product["badges"] = [];
  const lowerTags = he.tags.map((t) => t.toLowerCase());
  if (lowerTags.includes("new") || lowerTags.includes("חדש")) badges.push("new");
  if (lowerTags.includes("bestseller")) badges.push("bestseller");
  if (totalStock > 0 && totalStock <= 3) badges.push("last-units");

  const defaultColor = colorOptions[0];

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
      name: defaultColor?.name ?? localized("", ""),
      hex: defaultColor?.hex ?? "#777777",
    },
    colorOptions,
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
