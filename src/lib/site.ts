/**
 * Single place for the boutique's real-world details.
 *
 * TODO — replace the placeholders below with the real ones before going live:
 * phone, whatsapp (international format, no +), email, street address.
 */

/**
 * The origin the site is actually served from.
 *
 * Canonical URLs, hreflang alternates and og:image are all resolved against
 * this, so pointing it at a domain that does not exist yet silently breaks
 * every social preview and tells Google to index a dead host. Prefer an
 * explicit value, then whatever Vercel is serving, and only then the final
 * domain.
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;

  // Stable production domain of the Vercel project.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

  // Per-deployment URL — correct for preview builds.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  if (process.env.NODE_ENV === "development") return "http://localhost:3000";

  return "https://nino-boutique.co.il";
}

export const SITE = {
  name: "NINO",
  url: resolveSiteUrl(),
  city: { he: "נתיבות", en: "Netivot" },
  address: { he: "נתיבות", en: "Netivot, Israel" },
  phone: "08-000-0000",
  whatsapp: "972500000000",
  email: "hello@nino-boutique.co.il",
  instagram: "https://www.instagram.com/ninoboutique_n/",
  instagramHandle: "@ninoboutique_n",
  hours: [
    { he: "ראשון – חמישי", en: "Sunday – Thursday", time: "10:00 – 21:00" },
    { he: "שישי", en: "Friday", time: "09:00 – 14:00" },
    { he: "שבת", en: "Saturday", time: "—" },
  ],
} as const;
