import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { isAdminAuthenticated, isSameOrigin } from "@/lib/admin/auth";
import {
  assertNoUserErrors,
  shopifyAdmin,
  type ShopifyUserError,
} from "@/lib/shopify/admin";
import { SHOPIFY_CATALOG_CACHE_TAG } from "@/lib/shopify/cache";

export const runtime = "nodejs";

const COLLECTIONS = {
  tshirts: { handle: "t-shirts", label: "טי שירט" },
  outerwear: { handle: "jackets-coats", label: "ג׳קטים ומעילים" },
  shoes: { handle: "shoes", label: "נעליים" },
  accessories: { handle: "accessories", label: "אקססוריז" },
  seasonal: { handle: "new-in", label: "קולקציית העונה" },
} as const;

type HomepageKey = keyof typeof COLLECTIONS;

const COLLECTIONS_QUERY = /* GraphQL */ `
  query HomepageAdminCollections {
    collections(first: 50) {
      nodes {
        id
        handle
        title
        descriptionHtml
        image {
          id
          url
          altText
        }
        seo {
          title
          description
        }
        translations(locale: "he") {
          key
          value
          locale
        }
        products(first: 1) {
          nodes {
            featuredImage {
              url
            }
          }
        }
      }
    }
  }
`;

const COLLECTION_UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateHomepageCollection($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection {
        id
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const TRANSLATABLE_CONTENT_QUERY = /* GraphQL */ `
  query HomepageTranslationContent($id: ID!) {
    translatableResource(resourceId: $id) {
      translatableContent {
        key
        digest
      }
    }
  }
`;

const TRANSLATIONS_REGISTER_MUTATION = /* GraphQL */ `
  mutation RegisterHomepageTranslations(
    $resourceId: ID!
    $translations: [TranslationInput!]!
  ) {
    translationsRegister(
      resourceId: $resourceId
      translations: $translations
    ) {
      translations {
        key
        locale
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface CollectionNode {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  image: { id: string; url: string; altText: string | null } | null;
  seo: { title: string | null; description: string | null };
  translations: Array<{ key: string; value: string; locale: string }>;
  products: { nodes: Array<{ featuredImage: { url: string } | null }> };
}

interface CollectionsResponse {
  collections: { nodes: CollectionNode[] };
}

function normalizeText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toHtml(value: string): string {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

function htmlToText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

async function getCollections(): Promise<CollectionNode[]> {
  const data = await shopifyAdmin<CollectionsResponse>(COLLECTIONS_QUERY);
  return data.collections.nodes;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const byHandle = new Map(
      (await getCollections()).map((collection) => [collection.handle, collection])
    );

    const sections = Object.entries(COLLECTIONS).map(([key, config]) => {
      const collection = byHandle.get(config.handle);
      const translated = new Map(
        collection?.translations.map((item) => [item.key, item.value]) ?? []
      );
      return {
        key,
        label: config.label,
        exists: Boolean(collection),
        collectionImage: collection?.image?.url ?? null,
        automaticImage: collection?.products.nodes[0]?.featuredImage?.url ?? null,
        ...(key === "seasonal"
          ? {
              eyebrowEn: collection?.seo.title ?? "Seasonal collection",
              eyebrowHe: translated.get("meta_title") ?? "קולקציית העונה",
              titleEn:
                collection?.seo.title && collection?.title
                  ? collection.title
                  : "The new season",
              titleHe: translated.get("title") ?? "העונה החדשה",
              descriptionEn:
                collection?.seo.title && collection?.descriptionHtml
                  ? htmlToText(collection.descriptionHtml)
                  : "Clean cuts, comfortable fabrics and calm colours. A collection selected item by item for the boutique in Netivot.",
              descriptionHe:
                translated.get("body_html")
                  ? htmlToText(translated.get("body_html") || "")
                  : "גזרות נקיות, בדים נעימים וצבעוניות רגועה. הקולקציה שנבחרה פריט-פריט עבור הבוטיק בנתיבות.",
            }
          : {}),
      };
    });

    return NextResponse.json({ ok: true, sections });
  } catch (error) {
    console.error("[admin/homepage GET]", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "homepage_load_failed" },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request) || !(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const key = body?.key;
  if (typeof key !== "string" || !(key in COLLECTIONS)) {
    return NextResponse.json({ ok: false, error: "invalid_homepage_section" }, { status: 400 });
  }

  try {
    const sectionKey = key as HomepageKey;
    const collection = (await getCollections()).find(
      (item) => item.handle === COLLECTIONS[sectionKey].handle
    );
    if (!collection) throw new Error("Shopify collection was not found");

    const input: Record<string, unknown> = { id: collection.id };
    if (body?.removeImage === true) {
      input.image = null;
    } else if (typeof body?.imageUrl === "string") {
      const imageUrl = normalizeText(body.imageUrl, 2048);
      if (!isHttpsUrl(imageUrl)) throw new Error("invalid_image");
      input.image = {
        src: imageUrl,
        altText: `${COLLECTIONS[sectionKey].label} — תמונת כרטיסייה`,
      };
    }

    let hebrew: Record<string, string> | null = null;
    if (sectionKey === "seasonal") {
      const eyebrowEn = normalizeText(body?.eyebrowEn, 70);
      const eyebrowHe = normalizeText(body?.eyebrowHe, 70);
      const titleEn = normalizeText(body?.titleEn, 255);
      const titleHe = normalizeText(body?.titleHe, 255);
      const descriptionEn = normalizeText(body?.descriptionEn, 2000);
      const descriptionHe = normalizeText(body?.descriptionHe, 2000);
      if (!eyebrowEn || !eyebrowHe || !titleEn || !titleHe || !descriptionEn || !descriptionHe) {
        return NextResponse.json({ ok: false, error: "missing_homepage_content" }, { status: 400 });
      }
      input.title = titleEn;
      input.descriptionHtml = toHtml(descriptionEn);
      input.seo = { title: eyebrowEn };
      hebrew = {
        title: titleHe,
        body_html: toHtml(descriptionHe),
        meta_title: eyebrowHe,
      };
    }

    const updated = await shopifyAdmin<{
      collectionUpdate: {
        collection: { id: string; handle: string } | null;
        userErrors: ShopifyUserError[];
      };
    }>(COLLECTION_UPDATE_MUTATION, { input });
    assertNoUserErrors(updated.collectionUpdate.userErrors, "Could not update collection");

    if (hebrew) {
      const content = await shopifyAdmin<{
        translatableResource: {
          translatableContent: Array<{ key: string; digest: string }>;
        } | null;
      }>(TRANSLATABLE_CONTENT_QUERY, { id: collection.id });
      const digests = new Map(
        content.translatableResource?.translatableContent.map((item) => [
          item.key,
          item.digest,
        ]) ?? []
      );
      const translations = Object.entries(hebrew)
        .filter(([translationKey]) => digests.has(translationKey))
        .map(([translationKey, value]) => ({
          locale: "he",
          key: translationKey,
          value,
          translatableContentDigest: digests.get(translationKey),
        }));
      if (translations.length) {
        const result = await shopifyAdmin<{
          translationsRegister: { userErrors: ShopifyUserError[] };
        }>(TRANSLATIONS_REGISTER_MUTATION, {
          resourceId: collection.id,
          translations,
        });
        assertNoUserErrors(
          result.translationsRegister.userErrors,
          "Could not save Hebrew homepage translations"
        );
      }
    }

    revalidateTag(SHOPIFY_CATALOG_CACHE_TAG, { expire: 0 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/homepage POST]", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "homepage_update_failed" },
      { status: 502 }
    );
  }
}
