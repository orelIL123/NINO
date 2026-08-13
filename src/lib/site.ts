/**
 * Single place for the boutique's real-world details.
 *
 * The street address still needs confirmation from the merchant.
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
  phone: "+972 54-680-9924",
  whatsapp: "972546809924",
  email: "Efrattorgeman123@gmail.com",
  instagram:
    "https://www.instagram.com/ninoboutique_n?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  instagramHandle: "@ninoboutique_n",
  hours: [
    { he: "שעות פעילות", en: "Opening hours", time: "10:00 – 21:00" },
  ],
} as const;
