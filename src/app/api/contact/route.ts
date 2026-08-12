import { NextResponse } from "next/server";
import { sendContactMessage, type ContactDraft } from "@/lib/api/leads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let draft: ContactDraft;
  try {
    draft = (await request.json()) as ContactDraft;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const result = await sendContactMessage(draft);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
