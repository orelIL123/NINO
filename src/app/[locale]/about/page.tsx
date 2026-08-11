import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BrandStrip from "@/components/home/BrandStrip";
import { getBrands } from "@/lib/api/products";
import { isLocale, localeHref } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SITE } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).pages.aboutTitle };
}

const copy = {
  he: [
    "NINO הוא בוטיק אופנה בנתיבות. התחלנו בחנות אחת, עם רעיון פשוט: להביא לעיר מותגים שאי אפשר למצוא בכל מקום, ולתת לאנשים יחס אישי בזמן שהם בוחרים.",
    "כל קולקציה נבחרת אצלנו פריט-פריט. אנחנו מחפשים גזרות שנשארות יפות אחרי עשר כביסות, בדים שנעימים באמת, וצבעוניות שמסתדרת עם מה שכבר יש לכם בארון.",
    "האתר הוא המשך של אותו רעיון: מה שיש בחנות — נמצא גם כאן. אפשר להזמין הביתה, ואפשר להזמין ולאסוף מאיתנו, ואם יש התלבטות במידה, אנחנו במרחק הודעה.",
  ],
  en: [
    "NINO is a fashion boutique in Netivot. We started with one store and a simple idea: bring labels to town that you can't find everywhere, and give people real attention while they choose.",
    "Every collection is picked piece by piece. We look for cuts that still look good after ten washes, fabrics that actually feel good, and colours that work with what's already in your wardrobe.",
    "This site is the same idea, extended: what's in the store is here too. Order to your door, or order and collect from us — and if you're torn between two sizes, we're one message away.",
  ],
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const brands = await getBrands();

  return (
    <>
      <section className="container-nino max-w-3xl py-12 md:py-20">
        <p className="eyebrow text-ink-muted">{SITE.city[locale]}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight font-light md:text-5xl">
          {dict.pages.aboutTitle}
        </h1>
        <div className="mt-8 space-y-5 text-base text-ink-soft">
          {copy[locale].map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <Link href={localeHref(locale, "/contact")} className="btn btn-ghost mt-9">
          {dict.pages.contactTitle}
        </Link>
      </section>

      <section
        className="h-64 bg-cover bg-center md:h-96"
        style={{ backgroundImage: "url(/media/store.svg)" }}
        aria-hidden="true"
      />

      <section className="border-b border-line bg-surface py-12">
        <div className="container-nino">
          <h2 className="mb-8 text-center font-display text-2xl font-light">
            {dict.home.brandsTitle}
          </h2>
          <BrandStrip brands={brands} locale={locale} />
        </div>
      </section>
    </>
  );
}
