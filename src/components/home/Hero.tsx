import Image from "next/image";
import Link from "next/link";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeHref, type Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/utils/format";

/**
 * Full-bleed editorial hero: one campaign image, a centred serif headline and a
 * single call to action. The scrim only darkens the lower third so the garment
 * stays clean while the type keeps its contrast.
 */
export default function Hero({
  newCount,
  locale,
}: {
  newCount: number;
  locale: Locale;
}) {
  const dict = getDictionary(locale);

  return (
    <section className="relative">
      <div className="relative h-[80vh] min-h-[540px] w-full overflow-hidden bg-tile md:h-[88vh]">
        <Image
          src="/media/hero-main.jpg"
          alt={dict.home.heroTitle}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          /* Bias the crop upward so the graphic on the tee stays above the type. */
          className="object-cover object-[center_22%]"
        />

        {/*
          Cinematic scrim. The garment is white and the studio backdrop is pale,
          so the lower half needs real density before white type is readable —
          a light wash is not enough here.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,10,10,0.82)_0%,rgba(10,10,10,0.62)_18%,rgba(10,10,10,0.28)_38%,rgba(10,10,10,0.06)_58%,transparent_75%)]"
        />

        <div className="absolute inset-x-0 bottom-0 pb-12 md:pb-20">
          <div className="container-nino text-center text-white">
            <p className="eyebrow text-white/75">
              {formatNumber(newCount, locale)} · {dict.home.heroCountSuffix}
            </p>

            <h1 className="font-display mt-4 text-4xl leading-[1.1] font-light text-balance md:text-6xl lg:text-7xl">
              {dict.home.heroTitle}
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm text-white/85 md:text-base">
              {dict.home.heroSubtitle}
            </p>

            <Link
              href={localeHref(locale, "/category/new-in")}
              className="mt-8 inline-block border border-white/80 px-10 py-3.5 text-xs tracking-[0.22em] text-white uppercase transition-colors duration-300 hover:bg-white hover:text-ink focus-visible:bg-white focus-visible:text-ink"
            >
              {dict.home.shopNow}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
