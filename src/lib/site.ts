/**
 * Single place for the boutique's real-world details.
 *
 * TODO — replace the placeholders below with the real ones before going live:
 * phone, whatsapp (international format, no +), email, street address.
 */
export const SITE = {
  name: "NINO",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nino-boutique.co.il",
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
