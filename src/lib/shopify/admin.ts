import "server-only";

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-01";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export interface ShopifyUserError {
  field?: string[] | null;
  message: string;
  code?: string | null;
}

export class ShopifyAdminError extends Error {
  constructor(
    message: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "ShopifyAdminError";
  }
}

export function shopifyAdminConfigured(): boolean {
  return Boolean(DOMAIN && TOKEN);
}

export async function shopifyAdmin<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  if (!DOMAIN || !TOKEN) {
    throw new ShopifyAdminError(
      "Shopify Admin is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN."
    );
  }

  const response = await fetch(
    `https://${DOMAIN}/admin/api/${VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    }
  );

  const json = (await response.json().catch(() => null)) as
    | GraphQLResponse<T>
    | null;

  if (!response.ok || !json) {
    throw new ShopifyAdminError(
      `Shopify Admin responded ${response.status}`,
      json
    );
  }

  if (json.errors?.length) {
    throw new ShopifyAdminError(
      json.errors.map((error) => error.message).join("; "),
      json.errors
    );
  }

  if (!json.data) throw new ShopifyAdminError("Shopify returned no data");
  return json.data;
}

export function assertNoUserErrors(
  errors: ShopifyUserError[],
  fallback: string
) {
  if (!errors.length) return;
  throw new ShopifyAdminError(
    errors.map((error) => error.message).join("; ") || fallback,
    errors
  );
}
