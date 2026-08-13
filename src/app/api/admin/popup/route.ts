import { NextResponse } from "next/server";

import { isAdminAuthenticated, isSameOrigin } from "@/lib/admin/auth";
import { assertNoUserErrors, shopifyAdmin } from "@/lib/shopify/admin";
import {
  EMPTY_POPUP,
  POPUP_KEY,
  POPUP_NAMESPACE,
  parsePopup,
  type WelcomePopup,
} from "@/lib/shopify/popup";

export const runtime = "nodejs";

/* -------------------------------------------------------------------------- */
/*  /api/admin/popup — read and write the first-visit popup                   */
/* -------------------------------------------------------------------------- */

const SHOP_QUERY = /* GraphQL */ `
  query PopupShop($namespace: String!, $key: String!) {
    shop {
      id
      metafield(namespace: $namespace, key: $key) {
        value
      }
    }
  }
`;

/**
 * Shop metafields are private by default. The definition below opts this one
 * key into Storefront reads so the public site can render it; without it the
 * saved config would be invisible to visitors.
 */
const DEFINITION_MUTATION = /* GraphQL */ `
  mutation PopupDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

const SET_MUTATION = /* GraphQL */ `
  mutation PopupSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface ShopResponse {
  shop: { id: string; metafield: { value: string } | null };
}

async function readShop(): Promise<ShopResponse["shop"]> {
  const data = await shopifyAdmin<ShopResponse>(SHOP_QUERY, {
    namespace: POPUP_NAMESPACE,
    key: POPUP_KEY,
  });
  return data.shop;
}

/** Creates the definition once. A repeat call is expected and harmless. */
async function ensureStorefrontVisible(): Promise<void> {
  try {
    await shopifyAdmin(DEFINITION_MUTATION, {
      definition: {
        name: "Welcome popup",
        namespace: POPUP_NAMESPACE,
        key: POPUP_KEY,
        type: "json",
        ownerType: "SHOP",
        access: { storefront: "PUBLIC_READ" },
      },
    });
  } catch (error) {
    // TAKEN / already-exists is the normal path on every save after the first.
    console.info("[admin/popup] definition already present", error);
  }
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const shop = await readShop();
    const popup = shop.metafield?.value
      ? parsePopup(JSON.parse(shop.metafield.value))
      : EMPTY_POPUP;
    return NextResponse.json({ ok: true, popup });
  } catch (error) {
    console.error("[admin/popup GET]", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "popup_load_failed" },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request) || !(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const incoming = parsePopup(body);

  // Only guard what would produce a broken popup. Everything else may be blank.
  if (incoming.enabled && (!incoming.title.he || !incoming.title.en)) {
    return NextResponse.json(
      { ok: false, error: "missing_title" },
      { status: 400 }
    );
  }
  if (incoming.ctaHref && !incoming.ctaHref.startsWith("/")) {
    return NextResponse.json(
      { ok: false, error: "cta_must_be_relative" },
      { status: 400 }
    );
  }

  try {
    const shop = await readShop();

    const previous = shop.metafield?.value
      ? parsePopup(JSON.parse(shop.metafield.value))
      : EMPTY_POPUP;

    // Any copy change re-shows the popup to visitors who already dismissed it.
    const contentChanged =
      JSON.stringify({ ...previous, version: 0, enabled: false }) !==
      JSON.stringify({ ...incoming, version: 0, enabled: false });

    const popup: WelcomePopup = {
      ...incoming,
      version: contentChanged ? previous.version + 1 : previous.version,
    };

    await ensureStorefrontVisible();

    const result = await shopifyAdmin<{
      metafieldsSet: { userErrors: Array<{ field?: string[]; message: string }> };
    }>(SET_MUTATION, {
      metafields: [
        {
          ownerId: shop.id,
          namespace: POPUP_NAMESPACE,
          key: POPUP_KEY,
          type: "json",
          value: JSON.stringify(popup),
        },
      ],
    });

    assertNoUserErrors(result.metafieldsSet.userErrors, "metafieldsSet");

    return NextResponse.json({ ok: true, popup });
  } catch (error) {
    console.error("[admin/popup POST]", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "popup_save_failed" },
      { status: 502 }
    );
  }
}
