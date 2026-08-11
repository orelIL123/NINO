"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { locales } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Swaps the locale segment while keeping the current path and query.
 * Reading the query needs a Suspense boundary so the rest of the page can
 * still be statically prerendered.
 */
export default function LocaleSwitcher({ className = "" }: { className?: string }) {
  return (
    <Suspense fallback={<LocaleLinks className={className} />}>
      <LocaleLinksWithQuery className={className} />
    </Suspense>
  );
}

function LocaleLinksWithQuery({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  return (
    <LocaleLinks className={className} query={searchParams?.toString()} />
  );
}

function LocaleLinks({
  className = "",
  query,
}: {
  className?: string;
  query?: string;
}) {
  const { locale } = useLocale();
  const pathname = usePathname() ?? "/";
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-line-strong">/</span>}
          <Link
            href={`/${l}${rest ? `/${rest}` : ""}${query ? `?${query}` : ""}`}
            hrefLang={l}
            aria-current={l === locale ? "true" : undefined}
            className={`nav-link transition-opacity ${
              l === locale ? "text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {l.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
