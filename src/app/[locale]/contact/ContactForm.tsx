"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { CheckIcon } from "@/components/ui/Icons";

export default function ContactForm() {
  const { dict, locale } = useLocale();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          message: String(data.get("message") ?? ""),
          company: String(data.get("company") ?? ""),
          locale,
        }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="flex items-center gap-2.5 border border-line p-6 text-sm text-success"
      >
        <CheckIcon size={20} />
        {dict.pages.messageSent}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-label={dict.pages.sendMessage} className="space-y-3">
      <h2 className="eyebrow mb-4 text-ink-muted">{dict.pages.sendMessage}</h2>

      <label className="block">
        <span className="mb-1.5 block text-xs text-ink-soft">
          {dict.pages.yourName}
        </span>
        <input name="name" required className="field" />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs text-ink-soft">
            {dict.checkout.email}
          </span>
          <input type="email" name="email" required className="field" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs text-ink-soft">
            {dict.checkout.phone}
          </span>
          <input type="tel" name="phone" className="field" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs text-ink-soft">
          {dict.pages.yourMessage}
        </span>
        <textarea name="message" rows={5} required className="field resize-y" />
      </label>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn btn-primary w-full disabled:opacity-60 sm:w-auto"
      >
        {status === "sending"
          ? dict.pages.messageSending
          : dict.pages.sendMessage}
      </button>

      {status === "error" && (
        <p role="alert" className="text-sm text-sale">
          {dict.pages.messageFailed}
        </p>
      )}
    </form>
  );
}
