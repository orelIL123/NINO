import Link from "next/link";
import { notFound } from "next/navigation";

import Hero from "@/components/home/Hero";
import StoreJsonLd from "@/components/seo/StoreJsonLd";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/home/SectionHeader";
import EditorialBanner from "@/components/home/EditorialBanner";
import CategoryTiles, { tilesFromProducts } from "@/components/home/CategoryTiles";
import ProductRail from "@/components/product/ProductRail";
import ProductCard from "@/components/product/ProductCard";
import {
  getCategoryLabel,
  getNewItemsCount,
  getProducts,
} from "@/lib/api/products";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, localeHref } from "@/lib/i18n/config";
import { SITE } from "@/lib/site";
import {
  fetchHomepageCollections,
  shopifyEnabled,
  type HomepageCollections,
} from "@/lib/shopify";
import { MapPinIcon, ReturnIcon, ShieldIcon, TruckIcon } from "@/components/ui/Icons";

export const revalidate = 3600;

async function getHomepageCollections(
  locale: "he" | "en"
): Promise<HomepageCollections | null> {
  if (!shopifyEnabled) return null;
  try {
    return await fetchHomepageCollections(locale);
  } catch (error) {
    console.error("[homepage] Shopify collection content failed", error);
    return null;
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const [newArrivals, bestSellers, saleItems, newCount, homepage] =
    await Promise.all([
      getProducts({ sort: "newest", limit: 10 }),
      getProducts({ sort: "popular", limit: 10 }),
      getProducts({ onSale: true, sort: "popular", limit: 10 }),
      getNewItemsCount(),
      getHomepageCollections(locale),
    ]);

  const [tee, outer, sneaker, bag] = await Promise.all([
    getProducts({ category: "tshirts", limit: 1 }),
    getProducts({ category: "outerwear", limit: 1 }),
    getProducts({ category: "sneakers", limit: 1 }),
    getProducts({ category: "bags", limit: 1 }),
  ]);

  const tiles = tilesFromProducts(
    [
      {
        label: getCategoryLabel("tshirts", locale),
        slug: "tshirts",
        product: tee[0],
        overrideImage: homepage?.tshirts?.image?.url,
      },
      {
        label: getCategoryLabel("outerwear", locale),
        slug: "outerwear",
        product: outer[0],
        overrideImage: homepage?.outerwear?.image?.url,
      },
      {
        label: dict.nav.shoes,
        slug: "sneakers",
        href: "/shoes",
        product: sneaker[0],
        overrideImage: homepage?.shoes?.image?.url,
      },
      {
        label: dict.nav.accessories,
        slug: "bags",
        href: "/accessories",
        product: bag[0],
        overrideImage: homepage?.accessories?.image?.url,
      },
    ],
    locale
  );

  const perks = [
    { icon: TruckIcon, text: dict.announcement.shipping },
    { icon: ReturnIcon, text: dict.announcement.returns },
    { icon: MapPinIcon, text: dict.announcement.store },
    { icon: ShieldIcon, text: locale === "he" ? "תשלום מאובטח" : "Secure payment" },
  ];

  return (
    <>
      <StoreJsonLd locale={locale} />

      <Hero newCount={newCount} locale={locale} />

      {/* New arrivals ---------------------------------------------------- */}
      <Reveal as="section" className="container-nino py-14">
      <SectionHeader
          title={dict.home.newIn}
          href={localeHref(locale, "/shop")}
          linkLabel={dict.common.viewAll}
        />
        <ProductRail>
          {newArrivals.map((product) => (
            <div
              key={product.slug}
              className="w-[46vw] shrink-0 snap-start sm:w-[31vw] lg:w-[23%] xl:w-[19%]"
            >
              <ProductCard
                product={product}
                locale={locale}
                sizes="(min-width: 1024px) 20vw, 46vw"
              />
            </div>
          ))}
        </ProductRail>
      </Reveal>

      <EditorialBanner
        image={homepage?.seasonal?.image?.url ?? "/media/editorial-1.svg"}
        eyebrow={homepage?.seasonal?.seo.title ?? dict.home.heroEyebrow}
        title={homepage?.seasonal?.title ?? dict.home.editorialTitle}
        text={homepage?.seasonal?.description ?? dict.home.editorialText}
        cta={dict.nav.shopAll}
        href={localeHref(locale, "/shop")}
      />

      {/* Category tiles --------------------------------------------------- */}
      <Reveal as="section" className="container-nino py-14">
        <SectionHeader title={dict.home.categoriesTitle} align="center" />
        <CategoryTiles tiles={tiles} />
      </Reveal>

      {/* Clothing / Shoes -------------------------------------------------------- */}
      <Reveal
        as="section"
        className="container-nino grid gap-3 pb-14 md:grid-cols-2 md:gap-5"
      >
        {[
          {
            label: dict.home.panelClothing,
            href: localeHref(locale, "/clothing"),
            image: "/media/editorial-3.svg",
          },
          {
            label: dict.home.panelShoes,
            href: localeHref(locale, "/shoes"),
            image: "/media/editorial-2.svg",
          },
        ].map((panel) => (
          <Link
            key={panel.href}
            href={panel.href}
            className="group relative flex min-h-[320px] items-end overflow-hidden md:min-h-[420px]"
          >
            <span
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04]"
              style={{ backgroundImage: `url(${panel.image})` }}
              aria-hidden="true"
            />
            <span className="absolute inset-0 bg-linear-to-t from-black/40 via-black/5 to-transparent" />
            <span className="relative w-full p-8 text-white">
              <span className="font-display block text-3xl font-light md:text-4xl">
                {panel.label}
              </span>
              <span className="eyebrow mt-2 inline-block border-b border-white/70 pb-0.5">
                {dict.nav.shopAll}
              </span>
            </span>
          </Link>
        ))}
      </Reveal>

      {/* Best sellers ----------------------------------------------------- */}
      <Reveal as="section" className="container-nino pb-14">
        <SectionHeader
          title={dict.home.trending}
          href={localeHref(locale, "/clothing")}
          linkLabel={dict.common.viewAll}
        />
        <ProductRail>
          {bestSellers.map((product) => (
            <div
              key={product.slug}
              className="w-[46vw] shrink-0 snap-start sm:w-[31vw] lg:w-[23%] xl:w-[19%]"
            >
              <ProductCard
                product={product}
                locale={locale}
                sizes="(min-width: 1024px) 20vw, 46vw"
              />
            </div>
          ))}
        </ProductRail>
      </Reveal>

      <EditorialBanner
        image="/media/nino-sale-glow.png"
        eyebrow={dict.nav.sale}
        title={dict.home.saleTitle}
        text={dict.home.saleText}
        cta={dict.nav.shopAll}
        href={localeHref(locale, "/sale")}
        height="short"
        align="center"
        tone="dark"
      />

      {/* Sale rail -------------------------------------------------------- */}
      {saleItems.length > 0 && (
        <Reveal as="section" className="container-nino py-14">
          <SectionHeader
            title={dict.home.saleTitle}
            href={localeHref(locale, "/sale")}
            linkLabel={dict.common.viewAll}
          />
          <ProductRail>
            {saleItems.map((product) => (
              <div
                key={product.slug}
                className="w-[46vw] shrink-0 snap-start sm:w-[31vw] lg:w-[23%] xl:w-[19%]"
              >
                <ProductCard
                  product={product}
                  locale={locale}
                  sizes="(min-width: 1024px) 20vw, 46vw"
                />
              </div>
            ))}
          </ProductRail>
        </Reveal>
      )}

      {/* Visit the store -------------------------------------------------- */}
      <Reveal
        as="section"
        className="relative isolate overflow-hidden border-y border-black/10 bg-[#f8f5ef] py-16"
      >
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center opacity-80"
          style={{ backgroundImage: "url(/media/visit-store-glow.png)" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 bg-white/55 backdrop-blur-[1px]" aria-hidden="true" />
        <div className="container-nino grid items-center gap-8 md:grid-cols-2 md:gap-14">
          <div className="aspect-4/3 rounded-sm bg-cover bg-center shadow-[0_24px_70px_rgba(90,55,20,0.12)]" style={{ backgroundImage: "url(/media/store.svg)" }} aria-hidden="true" />
          <div>
            <p className="eyebrow text-ink-muted">{SITE.city[locale]}</p>
            <h2 className="mt-3 font-display text-3xl font-light md:text-4xl">{dict.home.visitTitle}</h2>
            <p className="mt-4 max-w-md text-sm text-ink-soft">{dict.home.visitText}</p>
            <p className="mt-4 text-sm">{dict.footer.hours}</p>
            <Link href={localeHref(locale, "/contact")} className="btn btn-ghost mt-6">{dict.home.visitCta}</Link>
          </div>
        </div>
      </Reveal>

      {/* Perks ------------------------------------------------------------ */}
      <section className="border-t border-line">
        <div className="container-nino grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
          {perks.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.text}
                className="flex flex-col items-center gap-2 text-center"
              >
                <Icon size={24} className="text-ink-soft" />
                <p className="text-xs text-ink-soft">{perk.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
