import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";

import "../globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import WelcomePopup from "@/components/layout/WelcomePopup";
import CookieConsent from "@/components/layout/CookieConsent";
import { fetchWelcomePopup } from "@/lib/shopify/popup";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, locales, localeDirection } from "@/lib/i18n/config";
import { getCategories } from "@/lib/api/products";
import { SITE } from "@/lib/site";

/**
 * Fonts are self-hosted variable woff2 files (~67 KB for all three) — no
 * request to Google, no layout shift, and the build works offline.
 * Latin and Hebrew are separate faces so each locale only pays for what it uses.
 */
const assistantLatin = localFont({
  src: "../../fonts/assistant-latin-wght-normal.woff2",
  weight: "200 800",
  style: "normal",
  display: "swap",
  variable: "--font-assistant-latin",
  fallback: ["system-ui", "arial"],
  adjustFontFallback: false,
});

const assistantHebrew = localFont({
  src: "../../fonts/assistant-hebrew-wght-normal.woff2",
  weight: "200 800",
  style: "normal",
  display: "swap",
  variable: "--font-assistant-hebrew",
  fallback: ["system-ui", "arial"],
  adjustFontFallback: false,
});

const cormorant = localFont({
  src: "../../fonts/cormorant-garamond-latin-wght-normal.woff2",
  weight: "300 700",
  style: "normal",
  display: "swap",
  variable: "--font-cormorant",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: false,
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `NINO · ${dict.meta.tagline}`,
      template: `%s · NINO`,
    },
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { he: "/he", en: "/en" },
    },
    openGraph: {
      type: "website",
      siteName: "NINO",
      title: `NINO · ${dict.meta.tagline}`,
      description: dict.meta.description,
      locale: locale === "he" ? "he_IL" : "en_US",
      url: `/${locale}`,
      images: [
        {
          url: "/media/og-default.jpg",
          width: 1200,
          height: 630,
          alt: `NINO · ${dict.meta.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `NINO · ${dict.meta.tagline}`,
      description: dict.meta.description,
      images: ["/media/og-default.jpg"],
    },
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const [categories, popup] = await Promise.all([
    getCategories(),
    fetchWelcomePopup(),
  ]);

  return (
    <html
      lang={locale}
      dir={localeDirection[locale]}
      className={`${assistantLatin.variable} ${assistantHebrew.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col antialiased">
        <LocaleProvider locale={locale} dict={dict}>
          <StoreProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
            >
              {dict.common.skipToContent}
            </a>
            <Header categories={categories} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <CookieConsent />
            {popup && (
              <WelcomePopup
                locale={locale}
                content={{
                  title: popup.title[locale],
                  body: popup.body[locale],
                  ctaLabel: popup.ctaLabel[locale],
                  ctaHref: popup.ctaHref,
                  version: popup.version,
                }}
              />
            )}
          </StoreProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
