import { getImageProps } from "next/image";
import Link from "next/link";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeHref, type Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/utils/format";

/**
 * Full-bleed editorial hero: one campaign image, a centred serif headline and a
 * single call to action. The site chrome overlays the image on the homepage,
 * so this section intentionally fills the complete viewport.
 */
export default function Hero({
  newCount,
  locale,
}: {
  newCount: number;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const imageProps = {
    alt: dict.home.heroTitle,
    fill: true,
    priority: true,
    fetchPriority: "high" as const,
    sizes: "100vw",
  };
  const { props: desktopHero } = getImageProps({
    ...imageProps,
    src: "/media/HERO.png",
  });
  const { props: mobileHero } = getImageProps({
    ...imageProps,
    src: "/media/hf_20260812_115455_2b31f661-6561-451e-8d0d-851333e77739.png",
  });

  return (
    <section className="relative">
      <div className="relative h-svh min-h-[600px] w-full overflow-hidden bg-tile">
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet={mobileHero.srcSet}
            sizes={mobileHero.sizes}
          />
          {/* `getImageProps` keeps both art-directed sources optimized by Next. */}
          <img
            {...desktopHero}
            alt={dict.home.heroTitle}
            className="object-cover object-center"
          />
        </picture>

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
          {/* Staggered entrance — each line lands just after the one above it. */}
          <div className="container-nino text-center text-white">
            <p
              className="eyebrow rise text-white/75"
              style={{ animationDelay: "120ms" }}
            >
              {formatNumber(newCount, locale)} · {dict.home.heroCountSuffix}
            </p>

            <h1
              className="font-display rise mt-4 text-4xl leading-[1.1] font-light text-balance md:text-6xl lg:text-7xl"
              style={{ animationDelay: "240ms" }}
            >
              {dict.home.heroTitle}
            </h1>

            <p
              className="rise mx-auto mt-4 max-w-md text-sm text-white/85 md:text-base"
              style={{ animationDelay: "380ms" }}
            >
              {dict.home.heroSubtitle}
            </p>

            <div className="rise" style={{ animationDelay: "520ms" }}>
              <Link
                href={localeHref(locale, "/category/new-in")}
                className="group relative mt-8 inline-block overflow-hidden border border-white/80 px-10 py-3.5 text-xs tracking-[0.22em] text-white uppercase transition-[letter-spacing,color] duration-500 hover:tracking-[0.3em] hover:text-ink focus-visible:text-ink"
              >
                {/* White fill wipes in from the reading edge. */}
                <span
                  aria-hidden="true"
                  className="origin-reading-edge absolute inset-0 -z-10 scale-x-0 bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />
                {dict.home.shopNow}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
