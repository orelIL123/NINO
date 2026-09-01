import Image from "next/image";
import Link from "next/link";

import { localeHref, type Locale } from "@/lib/i18n/config";

export default function EmptyProducts({ locale, compact = false, image = "/media/coming-soon.svg" }: { locale: Locale; compact?: boolean; image?: string }) {
  const title = locale === "he" ? "יתווספו פריטים בקרוב" : "More pieces coming soon";
  const text = locale === "he" ? "אנחנו בוחרים את הפריטים הבאים בקפידה." : "We are carefully selecting the next pieces.";
  const action = locale === "he" ? "לכל הפריטים" : "Shop all pieces";
  return (
    <div className={`relative overflow-hidden border border-line bg-tile text-center ${compact ? "py-10" : "py-16"}`}>
      <Image src={image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover opacity-55" />
      <div className="relative mx-auto max-w-sm px-6">
        <p className="font-display text-2xl font-light md:text-3xl">{title}</p>
        <p className="mt-2 text-sm text-ink-soft">{text}</p>
        <Link href={localeHref(locale, "/shop")} className="btn btn-ghost mt-6">{action}</Link>
      </div>
    </div>
  );
}
