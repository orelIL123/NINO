import "server-only";

import { shopifyEnabled, storefront } from "./client";

/* -------------------------------------------------------------------------- */
/*  WELCOME POPUP CONFIG                                                      */
/*                                                                            */
/*  Stored as a shop-level metafield so the boutique owns the copy and can    */
/*  change it from /admin without a deploy. Read through the Storefront API    */
/*  (not Admin) because that path is cacheable — the Admin client is           */
/*  deliberately no-store and has no business running on every page view.     */
/* -------------------------------------------------------------------------- */

export const POPUP_NAMESPACE = "custom";
export const POPUP_KEY = "welcome_popup";

export interface WelcomePopup {
  enabled: boolean;
  title: { he: string; en: string };
  body: { he: string; en: string };
  ctaLabel: { he: string; en: string };
  /** Locale-less path, e.g. "/shop". Empty hides the button. */
  ctaHref: string;
  imageUrl: string;
  /**
   * Bumped whenever the copy changes. Visitors who dismissed an older version
   * are shown the new one — without this, an edit would only ever reach people
   * who had never seen the popup at all.
   */
  version: number;
}

export const EMPTY_POPUP: WelcomePopup = {
  enabled: false,
  title: { he: "", en: "" },
  body: { he: "", en: "" },
  ctaLabel: { he: "", en: "" },
  ctaHref: "",
  imageUrl: "",
  version: 1,
};

const SHOP_METAFIELD_QUERY = /* GraphQL */ `
  query WelcomePopup($namespace: String!, $key: String!) {
    shop {
      metafield(namespace: $namespace, key: $key) {
        value
      }
    }
  }
`;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Coerces stored JSON into the shape the UI expects, whatever is in there. */
export function parsePopup(raw: unknown): WelcomePopup {
  if (!raw || typeof raw !== "object") return EMPTY_POPUP;
  const v = raw as Record<string, Record<string, unknown> | unknown>;
  const pair = (key: string) => {
    const group = (v[key] ?? {}) as Record<string, unknown>;
    return { he: str(group.he), en: str(group.en) };
  };

  return {
    enabled: v.enabled === true,
    title: pair("title"),
    body: pair("body"),
    ctaLabel: pair("ctaLabel"),
    ctaHref: str(v.ctaHref),
    imageUrl: str(v.imageUrl),
    version: Number.isFinite(v.version) ? Number(v.version) : 1,
  };
}

/**
 * Reads the popup config for the storefront.
 *
 * Returns null rather than throwing — a popup is decoration, and a Shopify
 * hiccup must never take the page down with it.
 */
export async function fetchWelcomePopup(): Promise<WelcomePopup | null> {
  if (!shopifyEnabled) return null;

  try {
    const data = await storefront<{
      shop: { metafield: { value: string } | null };
    }>(
      SHOP_METAFIELD_QUERY,
      { namespace: POPUP_NAMESPACE, key: POPUP_KEY },
      { revalidate: 300 }
    );

    const value = data.shop.metafield?.value;
    if (!value) return null;

    const popup = parsePopup(JSON.parse(value));
    return popup.enabled ? popup : null;
  } catch (error) {
    console.error("[popup] could not read the welcome popup config", error);
    return null;
  }
}
