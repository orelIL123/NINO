"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { CheckIcon } from "@/components/ui/Icons";

export default function ContactForm() {
  const { dict } = useLocale();
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex items-center gap-2.5 border border-line p-6 text-sm text-success">
        <CheckIcon size={20} />
        {dict.pages.messageSent}
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: POST to /api/contact and forward to the boutique's inbox.
        setSent(true);
      }}
      className="space-y-3"
    >
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

      <button type="submit" className="btn btn-primary w-full sm:w-auto">
        {dict.pages.sendMessage}
      </button>
    </form>
  );
}
