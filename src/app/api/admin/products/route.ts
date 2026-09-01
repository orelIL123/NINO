import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { isAdminAuthenticated, isSameOrigin } from "@/lib/admin/auth";
import {
  groupForProductType,
  isProductType,
  MERCHANDISING_CATEGORIES,
  type AdminProductDraft,
} from "@/lib/admin/product-conventions";
import {
  assertNoUserErrors,
  shopifyAdmin,
  type ShopifyUserError,
} from "@/lib/shopify/admin";
import { SHOPIFY_CATALOG_CACHE_TAG } from "@/lib/shopify/cache";

export const runtime = "nodejs";

const ADMIN_CONTEXT_QUERY = /* GraphQL */ `
  query AdminContext {
    shop { id }
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

const ADMIN_PRODUCTS_QUERY = /* GraphQL */ `
  query AdminProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        handle
        title
        vendor
        productType
        tags
        status
        totalInventory
        variants(first: 100) {
          nodes {
            id
            title
            price
            inventoryQuantity
            inventoryItem { id }
            selectedOptions {
              name
              value
            }
          }
        }
        updatedAt
        featuredMedia {
          preview {
            image {
              url
              altText
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
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

const ADMIN_PRODUCT_TAGS_QUERY = /* GraphQL */ `
  query AdminProductTags($id: ID!) {
    product(id: $id) { id tags }
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

const PRODUCT_DELETE_MUTATION = /* GraphQL */ `
  mutation DeleteProduct($id: ID!) {
    productDelete(input: { id: $id }) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;

const PRODUCT_VARIANTS_UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateProductPrices($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants { id price }
      userErrors { field message }
    }
  }
`;

const INVENTORY_SET_MUTATION = /* GraphQL */ `
  mutation SetInventory($input: InventorySetQuantitiesInput!) {
    inventorySetQuantities(input: $input) {
      inventoryAdjustmentGroup { createdAt }
      userErrors { field message }
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
  shop: { id: string };
  locations: { nodes: Array<{ id: string; name: string; isActive: boolean }> };
  publications: { nodes: Array<{ id: string; name: string }> };
}

interface AdminProductListResponse {
  products: {
    nodes: Array<{
      id: string;
      handle: string;
      title: string;
      vendor: string;
      productType: string;
      tags: string[];
      status: string;
      totalInventory: number;
      variants: {
        nodes: Array<{
          title: string;
          id: string;
          price: string;
          inventoryQuantity: number;
          inventoryItem: { id: string } | null;
          selectedOptions: Array<{ name: string; value: string }>;
        }>;
      };
      updatedAt: string;
      featuredMedia: {
        preview: { image: { url: string; altText: string | null } | null } | null;
      } | null;
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
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

interface ProductDeleteResponse {
  productDelete: {
    deletedProductId: string | null;
    userErrors: ShopifyUserError[];
  };
}

interface ProductActionBody {
  action?: unknown;
  productId?: unknown;
  price?: unknown;
  variants?: unknown;
  category?: unknown;
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
  const titleHe = normalizeText(input.titleHe, 255);
  const title = titleHe || normalizeText(input.title, 255);
  const vendor = normalizeText(input.vendor, 255);
  const productType = normalizeText(input.productType, 80);
  const merchandisingCategory = normalizeText(input.merchandisingCategory, 80);
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
    description:
      normalizeText(input.descriptionHe, 10000) ||
      normalizeText(input.description, 10000) ||
      undefined,
    descriptionHe: normalizeText(input.descriptionHe, 10000) || undefined,
    vendor,
    productType,
    merchandisingCategory: merchandisingCategory || undefined,
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

function productAdminUrl(productId: string): string | null {
  const numericId = productId.split("/").pop();
  const shopHandle = process.env.SHOPIFY_STORE_DOMAIN?.split(".")[0];
  return shopHandle && numericId
    ? `https://admin.shopify.com/store/${shopHandle}/products/${numericId}`
    : null;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const products: AdminProductListResponse["products"]["nodes"] = [];
    let after: string | null = null;
    let hasNextPage = true;

    while (hasNextPage && products.length < 500) {
      const data: AdminProductListResponse =
        await shopifyAdmin<AdminProductListResponse>(ADMIN_PRODUCTS_QUERY, {
          first: 100,
          after,
        });
      products.push(...data.products.nodes);
      hasNextPage = data.products.pageInfo.hasNextPage;
      after = data.products.pageInfo.endCursor;
    }

    return NextResponse.json({
      ok: true,
      products: products.map((product) => ({
        ...product,
        image: product.featuredMedia?.preview?.image ?? null,
        featuredMedia: undefined,
        adminUrl: productAdminUrl(product.id),
      })),
      truncated: hasNextPage,
    });
  } catch (error) {
    console.error("[admin/products list]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "products_load_failed",
      },
      { status: 502 }
    );
  }
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

    const storefrontPublications = context.publications.nodes.filter(
      (publication) =>
        /online store/i.test(publication.name) ||
        /nino next\.js storefront/i.test(publication.name)
    );
    if (draft.publish && !storefrontPublications.length)
      throw new Error("No storefront publication was found");

    const group = groupForProductType(draft.productType);
    const tags = [...new Set([group, draft.gender, ...(draft.merchandisingCategory ? [`category:${draft.merchandisingCategory}`] : []), ...draft.extraTags])];
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
        input: storefrontPublications.map((publication) => ({
          publicationId: publication.id,
        })),
      });
      assertNoUserErrors(
        published.publishablePublish.userErrors,
        "Could not publish product"
      );
    }

    if (draft.publish) {
      revalidateTag(SHOPIFY_CATALOG_CACHE_TAG, { expire: 0 });
    }
    return NextResponse.json({
      ok: true,
      product: {
        ...created,
        adminUrl: productAdminUrl(created.id),
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

export async function DELETE(request: Request) {
  if (!(await isSameOrigin(request)) || !(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!/^gid:\/\/shopify\/Product\/\d+$/.test(id)) {
    return NextResponse.json({ ok: false, error: "invalid_product_id" }, { status: 400 });
  }

  try {
    const result = await shopifyAdmin<ProductDeleteResponse>(PRODUCT_DELETE_MUTATION, { id });
    assertNoUserErrors(result.productDelete.userErrors, "Could not delete product");
    if (result.productDelete.deletedProductId !== id) {
      throw new Error("Shopify did not confirm product deletion");
    }
    revalidateTag(SHOPIFY_CATALOG_CACHE_TAG, { expire: 0 });
    return NextResponse.json({ ok: true, deletedProductId: id });
  } catch (error) {
    console.error("[admin/product delete]", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "product_delete_failed" },
      { status: 502 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await isSameOrigin(request)) || !(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as ProductActionBody | null;
  const action = body?.action;
  const productId = typeof body?.productId === "string" ? body.productId.trim() : "";
  if ((action !== "price" && action !== "sold_out" && action !== "category") || !/^gid:\/\/shopify\/Product\/\d+$/.test(productId)) {
    return NextResponse.json({ ok: false, error: "invalid_product_action" }, { status: 400 });
  }
  try {
    if (action === "category") {
      const category = normalizeText(body?.category, 80);
      if (!category || !MERCHANDISING_CATEGORIES.some((item) => item.slug === category)) {
        return NextResponse.json({ ok: false, error: "invalid_category" }, { status: 400 });
      }
      const current = await shopifyAdmin<{
        product: { id: string; tags: string[] } | null;
      }>(ADMIN_PRODUCT_TAGS_QUERY, { id: productId });
      const product = current.product;
      if (!product) throw new Error("Product not found");
      const tags = [
        ...product.tags.filter((tag) => !tag.toLowerCase().startsWith("category:")),
        `category:${category}`,
      ];
      const updated = await shopifyAdmin<{ productUpdate: MutationErrors }>(
        PRODUCT_ACTIVATE_MUTATION,
        { product: { id: productId, tags } }
      );
      assertNoUserErrors(updated.productUpdate.userErrors, "Could not update category");
      revalidateTag(SHOPIFY_CATALOG_CACHE_TAG, { expire: 0 });
      return NextResponse.json({ ok: true, category });
    }
    const context = await shopifyAdmin<AdminContext>(ADMIN_CONTEXT_QUERY);
    const location = context.locations.nodes.find((item) => item.isActive);
    if (!location) throw new Error("No active Shopify inventory location was found");
    const variants = Array.isArray(body?.variants)
      ? body.variants.filter(
          (item): item is { id: string; inventoryItemId: string } =>
            Boolean(item && typeof item === "object" && typeof (item as { id?: unknown }).id === "string" && typeof (item as { inventoryItemId?: unknown }).inventoryItemId === "string")
        )
      : [];
    if (!variants.length) throw new Error("No product variants were provided");

    if (action === "price") {
      const price = Number(body?.price);
      if (!Number.isFinite(price) || price <= 0 || price > 1_000_000) {
        return NextResponse.json({ ok: false, error: "invalid_price" }, { status: 400 });
      }
      const result = await shopifyAdmin<{ productVariantsBulkUpdate: { userErrors: ShopifyUserError[] } }>(PRODUCT_VARIANTS_UPDATE_MUTATION, {
        productId,
        variants: variants.map((variant) => ({ id: variant.id, price: price.toFixed(2) })),
      });
      assertNoUserErrors(result.productVariantsBulkUpdate.userErrors, "Could not update price");
    } else {
      const result = await shopifyAdmin<{ inventorySetQuantities: { userErrors: ShopifyUserError[] } }>(INVENTORY_SET_MUTATION, {
        input: {
          name: "available",
          reason: "correction",
          ignoreCompareQuantity: true,
          quantities: variants.map((variant) => ({ inventoryItemId: variant.inventoryItemId, locationId: location.id, quantity: 0 })),
        },
      });
      assertNoUserErrors(result.inventorySetQuantities.userErrors, "Could not update inventory");
    }
    revalidateTag(SHOPIFY_CATALOG_CACHE_TAG, { expire: 0 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`[admin/product ${String(action)}]`, error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "product_update_failed" }, { status: 502 });
  }
}
