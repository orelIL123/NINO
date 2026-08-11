import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale, localeHref } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SITE } from "@/lib/site";
import { UserIcon } from "@/components/ui/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).header.account, robots: { index: false } };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const copy = {
    he: "אזור החשבון האישי ייפתח בקרוב — כולל מעקב הזמנות ושמירת כתובות. בינתיים, אפשר לעקוב אחרי ההזמנה בוואטסאפ ולשמור פריטים במועדפים.",
    en: "Personal accounts are coming soon — order tracking and saved addresses included. In the meantime you can follow your order on WhatsApp and keep items in your wishlist.",
  }[locale];

  return (
    <div className="container-nino max-w-lg py-24 text-center">
      <UserIcon size={38} className="mx-auto text-line-strong" />
      <h1 className="mt-5 font-display text-3xl font-light">
        {dict.header.account}
      </h1>
      <p className="mt-4 text-sm text-ink-soft">{copy}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={localeHref(locale, "/wishlist")} className="btn btn-ghost">
          {dict.header.wishlist}
        </Link>
        <a
          href={`https://wa.me/${SITE.whatsapp}`}
          target="_blank"
          rel="noreferrer noopener"
          className="btn btn-primary"
        >
          {dict.pages.whatsapp}
        </a>
      </div>
    </div>
  );
}
