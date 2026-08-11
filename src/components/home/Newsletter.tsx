"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { CheckIcon } from "@/components/ui/Icons";

export default function Newsletter() {
  const { dict } = useLocale();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="container-nino py-14">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl font-light md:text-4xl">
          {dict.newsletter.title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
          {dict.newsletter.text}
        </p>

        {done ? (
          <p className="mt-7 flex items-center justify-center gap-2 text-sm text-success">
            <CheckIcon size={18} />
            {dict.newsletter.success}
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: POST to /api/newsletter -> Firestore `newsletter` collection.
              if (email.includes("@")) setDone(true);
            }}
            className="mt-7 flex flex-col gap-2 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              {dict.newsletter.placeholder}
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={dict.newsletter.placeholder}
              className="field flex-1 text-center sm:text-start"
            />
            <button type="submit" className="btn btn-primary shrink-0">
              {dict.newsletter.submit}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
