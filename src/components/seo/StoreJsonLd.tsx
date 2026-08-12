import { SITE } from "@/lib/site";
import { localeHref, type Locale } from "@/lib/i18n/config";

/* -------------------------------------------------------------------------- */
/*  LOCAL BUSINESS STRUCTURED DATA                                            */
/*                                                                            */
/*  NINO is a physical boutique, so the home page describes a ClothingStore    */
/*  (a LocalBusiness subtype). This is what feeds Google's local results and   */
/*  the knowledge panel.                                                       */
/* -------------------------------------------------------------------------- */

/**
 * `src/lib/site.ts` still ships dial-a-zero placeholders for some contact
 * fields. Publishing those in structured data is worse than publishing
 * nothing — Google will happily surface a phone number that rings nobody —
 * so each one is emitted only once it looks real.
 */
function isPlaceholder(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits && /^0+$/.test(digits.replace(/^972/, ""))) return true;
  return value.includes("000-0000") || value.includes("nino-boutique.co.il");
}

/** Schema.org day names, in the order `SITE.hours` lists them. */
const DAY_SPANS = [
  ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
  ["Friday"],
  ["Saturday"],
];

export default function StoreJsonLd({ locale }: { locale: Locale }) {
  const openingHours = SITE.hours.flatMap((entry, i) => {
    const [open, close] = entry.time.split("–").map((t) => t.trim());
    if (!open || !close || open === "—") return [];
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_SPANS[i],
        opens: open,
        closes: close,
      },
    ];
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": `${SITE.url}/#store`,
    name: SITE.name,
    url: `${SITE.url}${localeHref(locale)}`,
    image: `${SITE.url}/media/og-default.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.city[locale],
      addressCountry: "IL",
    },
    areaServed: SITE.city[locale],
    currenciesAccepted: "ILS",
    sameAs: [SITE.instagram],
    openingHoursSpecification: openingHours,
    ...(isPlaceholder(SITE.phone) ? {} : { telephone: SITE.phone }),
    ...(isPlaceholder(SITE.email) ? {} : { email: SITE.email }),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: `${SITE.url}${localeHref(locale)}`,
    name: SITE.name,
    inLanguage: locale === "he" ? "he-IL" : "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}${localeHref(locale, "/search")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([jsonLd, website]),
      }}
    />
  );
}
