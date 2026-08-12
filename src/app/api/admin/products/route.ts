import { NextResponse } from "next/server";

import { isAdminAuthenticated, isSameOrigin } from "@/lib/admin/auth";
import {
  groupForProductType,
  isProductType,
  type AdminProductDraft,
} from "@/lib/admin/product-conventions";
import {
  assertNoUserErrors,
  shopifyAdmin,
  type ShopifyUserError,
} from "@/lib/shopify/admin";

export const runtime = "nodejs";

const ADMIN_CONTEXT_QUERY = /* GraphQL */ `
  query AdminContext {
    locations(first: 10) {
      nodes {
        id
        name
        isActive
      }
    }
    publications(first: 20) {
      nodes {
        id
        name
      }
    }
  }
`;

const PRODUCT_CREATE_MUTATION = /* GraphQL */ `
  mutation CreateProduct(
    $product: ProductCreateInput!
    $media: [CreateMediaInput!]
  ) {
    productCreate(product: $product, media: $media) {
      product {
        id
        handle
        title
        options {
          id
          name
          values
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const VARIANTS_CREATE_MUTATION = /* GraphQL */ `
  mutation CreateVariants(
    $productId: ID!
    $variants: [ProductVariantsBulkInput!]!
  ) {
    productVariantsBulkCreate(
      productId: $productId
      variants: $variants
      strategy: REMOVE_STANDALONE_VARIANT
    ) {
      productVariants {
        id
        title
        price
        inventoryQuantity
        inventoryItem {
          id
          tracked
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

const PRODUCT_ACTIVATE_MUTATION = /* GraphQL */ `
  mutation ActivateProduct($product: ProductUpdateInput!) {
    productUpdate(product: $product) {
      product {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PRODUCT_PUBLISH_MUTATION = /* GraphQL */ `
  mutation PublishProduct($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      publishable {
        ... on Product {
          id
          handle
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const TRANSLATABLE_CONTENT_QUERY = /* GraphQL */ `
  query TranslationContent($id: ID!) {
    translatableResource(resourceId: $id) {
      translatableContent {
        key
        digest
      }
    }
  }
`;

const TRANSLATIONS_REGISTER_MUTATION = /* GraphQL */ `
  mutation RegisterTranslations(
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

interface AdminContext {
  locations: { nodes: Array<{ id: string; name: string; isActive: boolean }> };
  publications: { nodes: Array<{ id: string; name: string }> };
}

interface ProductCreateResponse {
  productCreate: {
    product: { id: string; handle: string; title: string } | null;
    userErrors: ShopifyUserError[];
  };
}

interface VariantsCreateResponse {
  productVariantsBulkCreate: {
    productVariants: Array<{ id: string }> | null;
    userErrors: ShopifyUserError[];
  };
}

interface MutationErrors {
  userErrors: ShopifyUserError[];
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

function skuPart(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase()
    .slice(0, 24);
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function parseDraft(body: unknown): AdminProductDraft | null {
  if (!body || typeof body !== "object") return null;
  const input = body as Record<string, unknown>;
  const title = normalizeText(input.title, 255);
  const vendor = normalizeText(input.vendor, 255);
  const productType = normalizeText(input.productType, 80);
  const color = normalizeText(input.color, 80);
  const price = Number(input.price);
  const compareAtPrice = input.compareAtPrice
    ? Number(input.compareAtPrice)
    : undefined;
  const stock = Number(input.stock);
  const sizes = Array.isArray(input.sizes)
    ? [...new Set(input.sizes.map((size) => normalizeText(size, 40)).filter(Boolean))]
    : [];
  const media = Array.isArray(input.media)
    ? input.media
        .slice(0, 3)
        .map((item) => item as Record<string, unknown>)
        .map((item) => ({
          resourceUrl: normalizeText(item.resourceUrl, 2048),
          alt: normalizeText(item.alt, 255),
        }))
        .filter((item) => isHttpsUrl(item.resourceUrl))
    : [];
  const extraTags = Array.isArray(input.extraTags)
    ? input.extraTags.filter(
        (tag): tag is "new" | "bestseller" =>
          tag === "new" || tag === "bestseller"
      )
    : [];

  if (
    !title ||
    !vendor ||
    !isProductType(productType) ||
    (input.gender !== "men" && input.gender !== "women") ||
    !color ||
    !Number.isFinite(price) ||
    price <= 0 ||
    (compareAtPrice !== undefined &&
      (!Number.isFinite(compareAtPrice) || compareAtPrice <= price)) ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    sizes.length < 1 ||
    sizes.length > 30 ||
    media.length < 1 ||
    media.length > 3
  ) {
    return null;
  }

  return {
    title,
    titleHe: normalizeText(input.titleHe, 255) || undefined,
    description: normalizeText(input.description, 10000) || undefined,
    descriptionHe: normalizeText(input.descriptionHe, 10000) || undefined,
    vendor,
    productType,
    gender: input.gender,
    extraTags,
    sizes,
    color,
    price,
    compareAtPrice,
    stock,
    skuPrefix: normalizeText(input.skuPrefix, 32) || undefined,
    publish: input.publish !== false,
    media,
  };
}

async function registerHebrewTranslations(
  productId: string,
  draft: AdminProductDraft
): Promise<void> {
  if (!draft.titleHe && !draft.descriptionHe) return;

  const content = await shopifyAdmin<{
    translatableResource: {
      translatableContent: Array<{ key: string; digest: string }>;
    } | null;
  }>(TRANSLATABLE_CONTENT_QUERY, { id: productId });
  const digests = new Map(
    content.translatableResource?.translatableContent.map((item) => [
      item.key,
      item.digest,
    ]) ?? []
  );

  const translations = [
    draft.titleHe && digests.get("title")
      ? {
          locale: "he",
          key: "title",
          value: draft.titleHe,
          translatableContentDigest: digests.get("title"),
        }
      : null,
    draft.descriptionHe && digests.get("body_html")
      ? {
          locale: "he",
          key: "body_html",
          value: toHtml(draft.descriptionHe),
          translatableContentDigest: digests.get("body_html"),
        }
      : null,
  ].filter(Boolean);

  if (!translations.length) return;
  const result = await shopifyAdmin<{
    translationsRegister: MutationErrors;
  }>(TRANSLATIONS_REGISTER_MUTATION, {
    resourceId: productId,
    translations,
  });
  assertNoUserErrors(
    result.translationsRegister.userErrors,
    "Could not save Hebrew translations"
  );
}

export async function POST(request: Request) {
  if (!isSameOrigin(request) || !(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const draft = parseDraft(await request.json().catch(() => null));
  if (!draft)
    return NextResponse.json({ ok: false, error: "invalid_product" }, { status: 400 });

  let created: { id: string; handle: string; title: string } | null = null;
  const warnings: string[] = [];

  try {
    const context = await shopifyAdmin<AdminContext>(ADMIN_CONTEXT_QUERY);
    const location = context.locations.nodes.find((item) => item.isActive);
    if (!location) throw new Error("No active Shopify inventory location was found");

    const onlineStorePublication = context.publications.nodes.find(
      (publication) => /online store/i.test(publication.name)
    );
    if (draft.publish && !onlineStorePublication)
      throw new Error("The Online Store publication was not found");

    const group = groupForProductType(draft.productType);
    const tags = [...new Set([group, draft.gender, ...draft.extraTags])];
    const product = await shopifyAdmin<ProductCreateResponse>(
      PRODUCT_CREATE_MUTATION,
      {
        product: {
          title: draft.title,
          descriptionHtml: draft.description ? toHtml(draft.description) : "",
          vendor: draft.vendor,
          productType: draft.productType,
          tags,
          status: "DRAFT",
          productOptions: [
            {
              name: "Size",
              position: 1,
              values: draft.sizes.map((name) => ({ name })),
            },
            {
              name: "Color",
              position: 2,
              values: [{ name: draft.color }],
            },
          ],
        },
        media: draft.media.map((item) => ({
          originalSource: item.resourceUrl,
          alt: item.alt || draft.title,
          mediaContentType: "IMAGE",
        })),
      }
    );
    assertNoUserErrors(product.productCreate.userErrors, "Could not create product");
    if (!product.productCreate.product)
      throw new Error("Shopify created no product record");
    created = product.productCreate.product;

    const prefix = skuPart(draft.skuPrefix || draft.title) || "NINO";
    const variants = await shopifyAdmin<VariantsCreateResponse>(
      VARIANTS_CREATE_MUTATION,
      {
        productId: created.id,
        variants: draft.sizes.map((size) => ({
          price: draft.price.toFixed(2),
          ...(draft.compareAtPrice
            ? { compareAtPrice: draft.compareAtPrice.toFixed(2) }
            : {}),
          taxable: true,
          inventoryPolicy: "DENY",
          inventoryItem: {
            sku: `${prefix}-${skuPart(draft.color)}-${skuPart(size)}`.slice(0, 64),
            tracked: true,
            requiresShipping: true,
          },
          inventoryQuantities: [
            { locationId: location.id, availableQuantity: draft.stock },
          ],
          optionValues: [
            { optionName: "Size", name: size },
            { optionName: "Color", name: draft.color },
          ],
        })),
      }
    );
    assertNoUserErrors(
      variants.productVariantsBulkCreate.userErrors,
      "Could not create variants"
    );

    try {
      await registerHebrewTranslations(created.id, draft);
    } catch (error) {
      console.error("[admin/product translation]", error);
      warnings.push("המוצר נוצר, אבל התרגום לעברית לא נשמר");
    }

    if (draft.publish) {
      const activated = await shopifyAdmin<{
        productUpdate: MutationErrors;
      }>(PRODUCT_ACTIVATE_MUTATION, {
        product: { id: created.id, status: "ACTIVE" },
      });
      assertNoUserErrors(activated.productUpdate.userErrors, "Could not activate product");

      const published = await shopifyAdmin<{
        publishablePublish: MutationErrors;
      }>(PRODUCT_PUBLISH_MUTATION, {
        id: created.id,
        input: [{ publicationId: onlineStorePublication?.id }],
      });
      assertNoUserErrors(
        published.publishablePublish.userErrors,
        "Could not publish product"
      );
    }

    const numericId = created.id.split("/").pop();
    const shopHandle = process.env.SHOPIFY_STORE_DOMAIN?.split(".")[0];
    return NextResponse.json({
      ok: true,
      product: {
        ...created,
        adminUrl:
          shopHandle && numericId
            ? `https://admin.shopify.com/store/${shopHandle}/products/${numericId}`
            : null,
      },
      warnings,
    });
  } catch (error) {
    console.error("[admin/product]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "product_create_failed",
        partialProduct: created,
      },
      { status: 502 }
    );
  }
}
