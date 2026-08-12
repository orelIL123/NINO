import { NextResponse } from "next/server";

import {
  adminAuthConfigured,
  adminSessionCookie,
  createAdminSession,
  isSameOrigin,
  verifyAdminPassword,
} from "@/lib/admin/auth";

export const runtime = "nodejs";

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_ATTEMPTS;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  if (!adminAuthConfigured()) {
    return NextResponse.json(
      { ok: false, error: "admin_not_configured" },
      { status: 503 }
    );
  }

  const key = clientKey(request);
  if (rateLimited(key)) {
    return NextResponse.json(
      { ok: false, error: "too_many_attempts" },
      { status: 429 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { password?: string }
    | null;
  if (!body?.password || !verifyAdminPassword(body.password)) {
    return NextResponse.json(
      { ok: false, error: "invalid_password" },
      { status: 401 }
    );
  }

  attempts.delete(key);
  const session = createAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "admin_not_configured" },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(session.name, session.value, session.options);
  return response;
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request))
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    adminSessionCookie.name,
    "",
    adminSessionCookie.deleteOptions
  );
  return response;
}
