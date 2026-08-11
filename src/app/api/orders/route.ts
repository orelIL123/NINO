import { NextResponse } from "next/server";
import { createOrder, type OrderDraft } from "@/lib/api/orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let draft: OrderDraft;
  try {
    draft = (await request.json()) as OrderDraft;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const result = await createOrder(draft);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
