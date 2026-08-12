import "server-only";

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const STATIC_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-01";

let cachedToken: { value: string; expiresAt: number } | null = null;

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
  return Boolean(
    DOMAIN && (STATIC_TOKEN || (CLIENT_ID && CLIENT_SECRET))
  );
}

async function adminAccessToken(forceRefresh = false): Promise<string> {
  if (STATIC_TOKEN) return STATIC_TOKEN;
  if (!DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
    throw new ShopifyAdminError(
      "Shopify Admin is not configured. Set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET."
    );
  }

  if (!forceRefresh && cachedToken && cachedToken.expiresAt > Date.now())
    return cachedToken.value;

  const response = await fetch(
    `https://${DOMAIN}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      cache: "no-store",
    }
  );
  const payload = (await response.json().catch(() => null)) as
    | { access_token?: string; expires_in?: number; error?: string }
    | null;

  if (!response.ok || !payload?.access_token) {
    throw new ShopifyAdminError(
      payload?.error || `Shopify token exchange failed (${response.status})`
    );
  }

  cachedToken = {
    value: payload.access_token,
    expiresAt:
      Date.now() + Math.max(60, (payload.expires_in ?? 86_400) - 300) * 1000,
  };
  return cachedToken.value;
}

async function adminRequest(
  query: string,
  variables: Record<string, unknown>,
  forceRefresh = false
): Promise<Response> {
  const token = await adminAccessToken(forceRefresh);
  return fetch(`https://${DOMAIN}/admin/api/${VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
}

export async function shopifyAdmin<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  if (!shopifyAdminConfigured()) {
    throw new ShopifyAdminError(
      "Shopify Admin is not configured. Set the store domain and app credentials."
    );
  }

  let response = await adminRequest(query, variables);
  if (response.status === 401 && !STATIC_TOKEN) {
    cachedToken = null;
    response = await adminRequest(query, variables, true);
  }

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
