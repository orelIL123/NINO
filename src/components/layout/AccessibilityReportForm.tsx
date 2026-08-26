"use client";

import { FormEvent, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function AccessibilityReportForm() {
  const { dict, locale } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          locale,
          message: `[Accessibility report] ${message}`,
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mt-12 border-t border-line pt-8" aria-labelledby="accessibility-report-title">
      <h2 id="accessibility-report-title" className="text-lg font-medium">
        {locale === "he" ? "טופס דיווח על בעיית נגישות" : "Accessibility feedback form"}
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        {locale === "he" ? "תארו את הבעיה ונחזור אליכם בהקדם." : "Describe the issue and we will get back to you shortly."}
      </p>
      <form onSubmit={submit} aria-label={locale === "he" ? "דיווח נגישות" : "Accessibility report"} className="mt-5 grid gap-4" noValidate>
        <label className="grid gap-1 text-sm"><span>{dict.pages.yourName}</span><input id="accessibility-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} autoComplete="name" className="border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink" /></label>
        <label className="grid gap-1 text-sm"><span>Email</span><input id="accessibility-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink" /></label>
        <label className="grid gap-1 text-sm"><span>{dict.pages.yourMessage}</span><textarea id="accessibility-message" value={message} onChange={(e) => setMessage(e.target.value)} required minLength={5} rows={4} className="resize-y border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink" /></label>
        <button type="submit" disabled={status === "sending"} className="w-fit bg-ink px-5 py-3 text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50">
          {status === "sending" ? dict.pages.messageSending : locale === "he" ? "שליחת דיווח" : "Send report"}
        </button>
        {status === "sent" && <p role="status" className="text-sm text-ink-soft">{dict.pages.messageSent}</p>}
        {status === "error" && <p role="alert" className="text-sm text-red-700">{dict.pages.messageFailed}</p>}
      </form>
    </section>
  );
}
