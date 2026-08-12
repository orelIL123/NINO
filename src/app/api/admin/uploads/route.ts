import { NextResponse } from "next/server";

import { isAdminAuthenticated, isSameOrigin } from "@/lib/admin/auth";
import {
  assertNoUserErrors,
  shopifyAdmin,
  type ShopifyUserError,
} from "@/lib/shopify/admin";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 4 * 1024 * 1024;

const STAGED_UPLOAD_MUTATION = /* GraphQL */ `
  mutation StagedUploads($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface StagedUploadResponse {
  stagedUploadsCreate: {
    stagedTargets: Array<{
      url: string;
      resourceUrl: string;
      parameters: Array<{ name: string; value: string }>;
    }> | null;
    userErrors: ShopifyUserError[];
  };
}

export async function POST(request: Request) {
  if (!isSameOrigin(request) || !(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const image = form?.get("image");
  if (!(image instanceof File)) {
    return NextResponse.json({ ok: false, error: "missing_image" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(image.type) || image.size <= 0 || image.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "invalid_image" },
      { status: 400 }
    );
  }

  try {
    const data = await shopifyAdmin<StagedUploadResponse>(
      STAGED_UPLOAD_MUTATION,
      {
        input: [
          {
            resource: "IMAGE",
            filename: image.name,
            mimeType: image.type,
            httpMethod: "POST",
            fileSize: String(image.size),
          },
        ],
      }
    );

    assertNoUserErrors(
      data.stagedUploadsCreate.userErrors,
      "Could not prepare the Shopify image upload"
    );
    const target = data.stagedUploadsCreate.stagedTargets?.[0];
    if (!target) throw new Error("Shopify returned no upload target");

    const upload = new FormData();
    for (const parameter of target.parameters)
      upload.append(parameter.name, parameter.value);
    upload.append("file", image, image.name);

    const result = await fetch(target.url, { method: "POST", body: upload });
    if (!result.ok) throw new Error(`Image upload failed (${result.status})`);

    return NextResponse.json({ ok: true, resourceUrl: target.resourceUrl });
  } catch (error) {
    console.error("[admin/upload]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "upload_failed",
      },
      { status: 502 }
    );
  }
}
