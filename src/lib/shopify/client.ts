import "server-only";

/* -------------------------------------------------------------------------- */
/*  SHOPIFY STOREFRONT API CLIENT                                             */
/*                                                                            */
/*  Headless setup: Next.js owns the presentation, Shopify owns commerce      */
/*  (catalog, inventory, pricing, discounts, checkout).                       */
/*                                                                            */
/*  The Storefront access token is a *public* credential — it is scoped to    */
/*  read-only catalog access and is safe to ship. Never put an Admin API      */
/*  token or an app secret key here.                                          */
/* -------------------------------------------------------------------------- */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-01";

/** True when the store credentials are present, so callers can fall back. */
export const shopifyEnabled = Boolean(DOMAIN && TOKEN);

export class ShopifyError extends Error {
  constructor(
    message: string,
    readonly detail?: unknown
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/**
 * Runs a Storefront GraphQL operation.
 *
 * `revalidate` maps onto the Next.js data cache, so product pages stay static
 * and only refresh on the interval given (default: one hour).
 */
export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
  { revalidate = 3600 }: { revalidate?: number | false } = {}
): Promise<T> {
  if (!shopifyEnabled) {
    throw new ShopifyError(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN."
    );
  }

  const endpoint = `https://${DOMAIN}/api/${API_VERSION}/graphql.json`;

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN as string,
      },
      body: JSON.stringify({ query, variables }),
      next: revalidate === false ? { revalidate: 0 } : { revalidate },
    });
  } catch (cause) {
    throw new ShopifyError("Could not reach the Shopify Storefront API", cause);
  }

  if (!res.ok) {
    throw new ShopifyError(
      `Shopify responded ${res.status} ${res.statusText}`,
      await res.text().catch(() => undefined)
    );
  }

  const json = (await res.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new ShopifyError(
      json.errors.map((e) => e.message).join("; "),
      json.errors
    );
  }

  if (!json.data) {
    throw new ShopifyError("Shopify returned an empty response");
  }

  return json.data;
}

/** Shopify returns global IDs like `gid://shopify/Product/123`. */
export function idFromGid(gid: string): string {
  return gid.split("/").pop() ?? gid;
}
