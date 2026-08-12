import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "nino_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sessionSecret(): string | null {
  const value = process.env.ADMIN_SESSION_SECRET?.trim();
  return value && value.length >= 32 ? value : null;
}

function signature(expiresAt: string): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  return createHmac("sha256", secret)
    .update(`nino-admin-v1:${expiresAt}`)
    .digest("base64url");
}

export function adminAuthConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_PANEL_PASSWORD?.trim() && sessionSecret()
  );
}

export function verifyAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PANEL_PASSWORD?.trim();
  return Boolean(expected && safeEqual(candidate, expected));
}

export function createAdminSession(): {
  name: string;
  value: string;
  options: {
    httpOnly: true;
    secure: boolean;
    sameSite: "strict";
    path: string;
    maxAge: number;
  };
} | null {
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  const digest = signature(expiresAt);
  if (!digest) return null;

  return {
    name: COOKIE_NAME,
    value: `${expiresAt}.${digest}`,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_SECONDS,
    },
  };
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [expiresAt, supplied] = token.split(".");
  if (!expiresAt || !supplied || Number(expiresAt) <= Date.now() / 1000)
    return false;

  const expected = signature(expiresAt);
  return Boolean(expected && safeEqual(supplied, expected));
}

export const adminSessionCookie = {
  name: COOKIE_NAME,
  deleteOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 0,
  },
};

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}
