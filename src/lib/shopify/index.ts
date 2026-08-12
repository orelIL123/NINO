import "server-only";

import {
  shopifyEnabled,
  storefront,
  storefrontTokenEnabled,
} from "./client";
import {
  CART_CREATE_MUTATION,
  HOMEPAGE_COLLECTIONS_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
} from "./queries";
import { languageCode, toProduct } from "./transform";
import type { ShopifyCart, ShopifyProduct } from "./types";

import type { Product, SortKey } from "@/lib/data/types";

export { shopifyEnabled, ShopifyError } from "./client";

/* -------------------------------------------------------------------------- */
/*  PUBLIC API                                                                */
/*                                                                            */
/*  The store is bilingual, so each read fetches Hebrew and English in         */
/*  parallel and merges them into one localised `Product`.                     */
/* -------------------------------------------------------------------------- */

/** Maps the app's sort keys onto Storefront `ProductSortKeys`. */
const SORT: Record<SortKey, { sortKey: string; reverse: boolean }> = {
  newest: { sortKey: "CREATED_AT", reverse: true },
  popular: { sortKey: "BEST_SELLING", reverse: false },
  "price-asc": { sortKey: "PRICE", reverse: false },
  "price-desc": { sortKey: "PRICE", reverse: true },
};

type ProductsResponse = { products: { edges: Array<{ node: ShopifyProduct }> } };
type ProductResponse = { product: ShopifyProduct | null };

export interface HomepageCollection {
  handle: string;
  title: string;
  description: string;
  image: { url: string; altText: string | null } | null;
  seo: { title: string | null; description: string | null };
}

export interface HomepageCollections {
  tshirts: HomepageCollection | null;
  outerwear: HomepageCollection | null;
  shoes: HomepageCollection | null;
  accessories: HomepageCollection | null;
  seasonal: HomepageCollection | null;
}

/**
 * Reads a page of products. `query` accepts Shopify's search syntax, e.g.
 * `tag:new`, `product_type:Sneakers`, `available_for_sale:true`.
 */
export async function fetchProducts({
  first = 24,
  query,
  sort = "newest",
}: {
  first?: number;
  query?: string;
  sort?: SortKey;
} = {}): Promise<Product[]> {
  const { sortKey, reverse } = SORT[sort];

  const [he, en] = await Promise.all(
    (["he", "en"] as const).map((locale) =>
      storefront<ProductsResponse>(PRODUCTS_QUERY, {
        first,
        query,
        sortKey,
        reverse,
        language: languageCode[locale],
        includeInventory: storefrontTokenEnabled,
      })
    )
  );

  const enByHandle = new Map(
    en.products.edges.map(({ node }) => [node.handle, node])
  );

  return he.products.edges.map(({ node }) =>
    toProduct(node, enByHandle.get(node.handle) ?? node)
  );
}

/** Reads one product by its Shopify handle (our `slug`). */
export async function fetchProduct(handle: string): Promise<Product | null> {
  const [he, en] = await Promise.all(
    (["he", "en"] as const).map((locale) =>
      storefront<ProductResponse>(PRODUCT_BY_HANDLE_QUERY, {
        handle,
        language: languageCode[locale],
        includeInventory: storefrontTokenEnabled,
      })
    )
  );

  if (!he.product) return null;
  return toProduct(he.product, en.product ?? he.product);
}

/** Reads the localized collection content used by the homepage editor. */
export async function fetchHomepageCollections(
  locale: "he" | "en"
): Promise<HomepageCollections> {
  return storefront<HomepageCollections>(HOMEPAGE_COLLECTIONS_QUERY, {
    language: languageCode[locale],
  });
}

/**
 * Creates a Shopify cart and returns its hosted checkout URL. Payment, tax and
 * shipping are handled entirely by Shopify Checkout — we never see card data.
 */
export async function createCheckout(
  lines: Array<{ variantId: string; quantity: number }>
): Promise<{ checkoutUrl: string; cartId: string }> {
  const data = await storefront<{
    cartCreate: { cart: ShopifyCart | null; userErrors: Array<{ message: string }> };
  }>(
    CART_CREATE_MUTATION,
    {
      lines: lines.map((l) => ({
        merchandiseId: l.variantId,
        quantity: l.quantity,
      })),
    },
    { revalidate: false }
  );

  const { cart, userErrors } = data.cartCreate;

  if (userErrors.length || !cart) {
    throw new Error(
      userErrors.map((e) => e.message).join("; ") || "Could not create cart"
    );
  }

  return { checkoutUrl: cart.checkoutUrl, cartId: cart.id };
}

/** True when a live catalog is available, so callers can fall back to demo data. */
export function hasLiveCatalog(): boolean {
  return shopifyEnabled;
}
