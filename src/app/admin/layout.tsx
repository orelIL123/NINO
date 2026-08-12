import type { Metadata } from "next";
import localFont from "next/font/local";

import "../globals.css";

const assistantLatin = localFont({
  src: "../../fonts/assistant-latin-wght-normal.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--font-assistant-latin",
  fallback: ["system-ui", "arial"],
  adjustFontFallback: false,
});

const assistantHebrew = localFont({
  src: "../../fonts/assistant-hebrew-wght-normal.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--font-assistant-hebrew",
  fallback: ["system-ui", "arial"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "ניהול מוצרים · NINO",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${assistantLatin.variable} ${assistantHebrew.variable}`}
    >
      <body className="min-h-screen bg-[#f2f1ee]">{children}</body>
    </html>
  );
}
