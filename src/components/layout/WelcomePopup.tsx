"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { localeHref, type Locale } from "@/lib/i18n/config";
import { CloseIcon } from "@/components/ui/Icons";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";

/* -------------------------------------------------------------------------- */
/*  First-visit popup                                                         */
/*                                                                            */
/*  Content comes from /admin. Shown once per visitor per content version, so  */
/*  editing the copy reaches people who already dismissed the previous one.   */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "nino:popup-seen";

export interface WelcomePopupContent {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  version: number;
}

export default function WelcomePopup({
  content,
  locale,
}: {
  content: WelcomePopupContent;
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Private-mode Safari throws on storage access; a popup is not worth a crash.
    let seen: string | null = null;
    try {
      seen = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return;
    }
    if (seen === String(content.version)) return;

    // Let the page paint first — arriving on top of a blank screen reads as an
    // error, arriving over the hero reads as a greeting.
    const timer = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, [content.version]);

  useEffect(() => {
    if (!open) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  useFocusTrap(dialogRef, open, dismiss);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(content.version));
    } catch {
      /* dismissal simply will not persist */
    }
  }, [content.version]);

  if (!open) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-popup-title"
      aria-describedby="welcome-popup-body"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={dismiss}
        className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[2px]"
      />

      <div ref={dialogRef} className="animate-fade-up relative w-full max-w-md border border-line bg-canvas p-8 text-center shadow-2xl sm:p-10">
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute end-3 top-3 p-2 text-ink-muted transition-colors hover:text-ink"
        >
          <CloseIcon size={18} />
        </button>

        <h2
          id="welcome-popup-title"
          className="font-display text-3xl leading-tight font-light text-balance md:text-4xl"
        >
          {content.title}
        </h2>

        {content.body && (
          <p id="welcome-popup-body" className="mx-auto mt-4 max-w-sm text-sm text-ink-soft">
            {content.body}
          </p>
        )}

        {content.ctaHref && content.ctaLabel && (
          <Link
            href={localeHref(locale, content.ctaHref)}
            onClick={dismiss}
            className="btn btn-primary mt-7 w-full sm:w-auto"
          >
            {content.ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
