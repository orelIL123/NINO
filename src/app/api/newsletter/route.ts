import { NextResponse } from "next/server";
import { subscribeToNewsletter, type NewsletterDraft } from "@/lib/api/leads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let draft: NewsletterDraft;
  try {
    draft = (await request.json()) as NewsletterDraft;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const result = await subscribeToNewsletter(draft);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
