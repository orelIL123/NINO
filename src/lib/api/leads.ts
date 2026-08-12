import "server-only";

import { SITE } from "@/lib/site";

/* -------------------------------------------------------------------------- */
/*  LEADS — newsletter sign-ups and contact messages                          */
/*                                                                            */
/*  Delivery is provider-agnostic. Set RESEND_API_KEY and LEADS_FORWARD_TO to  */
/*  have submissions emailed to the boutique; without them every submission    */
/*  is still written to the server log as structured JSON, so nothing is ever  */
/*  silently dropped.                                                          */
/* -------------------------------------------------------------------------- */

export interface NewsletterDraft {
  email: string;
  locale?: string;
  /** Hidden field — real people leave it empty, bots fill it in. */
  company?: string;
}

export interface ContactDraft {
  name: string;
  email: string;
  phone?: string;
  message: string;
  locale?: string;
  company?: string;
}

export type LeadResult =
  | { ok: true }
  | { ok: false; error: "invalid_email" | "invalid_name" | "invalid_message" | "rejected" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/**
 * A filled honeypot means an automated submission. We answer with a normal
 * success so the bot has nothing to learn, but deliver nothing.
 */
function isBot(company?: string): boolean {
  return Boolean(company && company.trim());
}

async function deliver(subject: string, body: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEADS_FORWARD_TO ?? SITE.email;
  const from = process.env.LEADS_FROM ?? "NINO <onboarding@resend.dev>";

  if (!apiKey) {
    // No provider configured yet — keep the payload in the platform log so the
    // boutique can still recover it (Vercel -> Project -> Logs).
    console.info("[lead]", JSON.stringify({ subject, body }));
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text: body }),
  });

  if (!res.ok) {
    // Never lose the lead because the mailer had a bad day.
    console.error(
      "[lead] delivery failed",
      res.status,
      JSON.stringify({ subject, body })
    );
  }
}

export async function subscribeToNewsletter(
  draft: NewsletterDraft
): Promise<LeadResult> {
  if (isBot(draft.company)) return { ok: true };
  if (!isEmail(draft.email)) return { ok: false, error: "invalid_email" };

  await deliver(
    "NINO — new newsletter sign-up",
    [
      `Email:  ${draft.email.trim()}`,
      `Locale: ${draft.locale ?? "—"}`,
      `Time:   ${new Date().toISOString()}`,
    ].join("\n")
  );

  return { ok: true };
}

export async function sendContactMessage(
  draft: ContactDraft
): Promise<LeadResult> {
  if (isBot(draft.company)) return { ok: true };

  const name = draft.name?.trim() ?? "";
  const message = draft.message?.trim() ?? "";

  if (name.length < 2) return { ok: false, error: "invalid_name" };
  if (!isEmail(draft.email)) return { ok: false, error: "invalid_email" };
  if (message.length < 5) return { ok: false, error: "invalid_message" };

  await deliver(
    `NINO — message from ${name}`,
    [
      `Name:    ${name}`,
      `Email:   ${draft.email.trim()}`,
      `Phone:   ${draft.phone?.trim() || "—"}`,
      `Locale:  ${draft.locale ?? "—"}`,
      `Time:    ${new Date().toISOString()}`,
      "",
      message,
    ].join("\n")
  );

  return { ok: true };
}
