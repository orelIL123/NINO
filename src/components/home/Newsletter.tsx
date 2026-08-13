"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { CheckIcon } from "@/components/ui/Icons";

export default function Newsletter() {
  const { dict, locale } = useLocale();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, company }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="relative isolate overflow-hidden border-y border-black/10 bg-[#f4f0e8] py-16">
      <div className="pointer-events-none absolute -z-10 size-72 -top-36 start-[8%] rounded-full bg-[#e9c88c]/45 blur-3xl animate-float" aria-hidden="true" />
      <div className="pointer-events-none absolute -z-10 size-64 -bottom-36 end-[10%] rounded-full bg-[#d9b7d6]/35 blur-3xl animate-float-reverse" aria-hidden="true" />
      <div className="container-nino relative mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl font-light md:text-4xl">
          {dict.newsletter.title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
          {dict.newsletter.text}
        </p>

        {status === "done" ? (
          <p
            role="status"
            className="mt-7 flex items-center justify-center gap-2 text-sm text-success"
          >
            <CheckIcon size={18} />
            {dict.newsletter.success}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7">
            <div className="flex flex-col gap-2 sm:flex-row">
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

              {/* Honeypot — hidden from people, irresistible to bots. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <button
                type="submit"
                disabled={status === "sending"}
                className="btn btn-primary shrink-0 shadow-[0_10px_30px_rgba(31,25,19,0.14)] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
              >
                {status === "sending"
                  ? dict.newsletter.submitting
                  : dict.newsletter.submit}
              </button>
            </div>

            {status === "error" && (
              <p role="alert" className="mt-3 text-sm text-sale">
                {dict.newsletter.error}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
