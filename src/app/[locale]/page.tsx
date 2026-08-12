import Link from "next/link";
import { notFound } from "next/navigation";

import Hero from "@/components/home/Hero";
import SectionHeader from "@/components/home/SectionHeader";
import EditorialBanner from "@/components/home/EditorialBanner";
import CategoryTiles, { tilesFromProducts } from "@/components/home/CategoryTiles";
import BrandStrip from "@/components/home/BrandStrip";
import ProductRail from "@/components/product/ProductRail";
import ProductCard from "@/components/product/ProductCard";
import {
  getBrands,
  getCategories,
  getNewItemsCount,
  getProducts,
} from "@/lib/api/products";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, localeHref } from "@/lib/i18n/config";
import { SITE } from "@/lib/site";
import { MapPinIcon, ReturnIcon, ShieldIcon, TruckIcon } from "@/components/ui/Icons";

export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const [
    newArrivals,
    bestSellers,
    saleItems,
    brands,
    newCount,
    categories,
  ] = await Promise.all([
    getProducts({ sort: "newest", limit: 10 }),
    getProducts({ sort: "popular", limit: 10 }),
    getProducts({ onSale: true, sort: "popular", limit: 10 }),
    getBrands(),
    getNewItemsCount(),
    getCategories(),
  ]);

  const categoryLabel = (slug: string) =>
    categories.find((c) => c.slug === slug)?.title[locale] ?? slug;

  const [tee, outer, sneaker, bag] = await Promise.all([
    getProducts({ category: "tshirts", limit: 1 }),
    getProducts({ category: "outerwear", limit: 1 }),
    getProducts({ category: "sneakers", limit: 1 }),
    getProducts({ category: "bags", limit: 1 }),
  ]);

  const tiles = tilesFromProducts(
    [
      { label: categoryLabel("tshirts"), slug: "tshirts", product: tee[0] },
      { label: categoryLabel("outerwear"), slug: "outerwear", product: outer[0] },
      { label: dict.nav.shoes, slug: "sneakers", product: sneaker[0] },
      { label: dict.nav.accessories, slug: "bags", product: bag[0] },
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
      <Hero newCount={newCount} locale={locale} />

      {/* New arrivals ---------------------------------------------------- */}
      <section className="container-nino py-14">
        <SectionHeader
          title={dict.home.newIn}
          href={localeHref(locale, "/category/new-in")}
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
      </section>

      <EditorialBanner
        image="/media/editorial-1.svg"
        eyebrow={dict.home.heroEyebrow}
        title={dict.home.editorialTitle}
        text={dict.home.editorialText}
        cta={dict.nav.shopAll}
        href={localeHref(locale, "/category/new-in")}
      />

      {/* Category tiles --------------------------------------------------- */}
      <section className="container-nino py-14">
        <SectionHeader title={dict.home.categoriesTitle} align="center" />
        <CategoryTiles tiles={tiles} />
      </section>

      {/* Clothing / Shoes -------------------------------------------------------- */}
      <section className="container-nino grid gap-3 pb-14 md:grid-cols-2 md:gap-5">
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
      </section>

      {/* Best sellers ----------------------------------------------------- */}
      <section className="container-nino pb-14">
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
      </section>

      <EditorialBanner
        image="/media/sale.svg"
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
        <section className="container-nino py-14">
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
        </section>
      )}

      {/* Brands ----------------------------------------------------------- */}
      <section className="border-y border-line bg-surface py-12">
        <div className="container-nino">
          <SectionHeader title={dict.home.brandsTitle} align="center" />
          <BrandStrip brands={brands} locale={locale} />
        </div>
      </section>

      {/* Visit the store -------------------------------------------------- */}
      <section className="container-nino grid items-center gap-8 py-16 md:grid-cols-2 md:gap-14">
        <div
          className="aspect-4/3 bg-cover bg-center"
          style={{ backgroundImage: "url(/media/store.svg)" }}
          aria-hidden="true"
        />
        <div>
          <p className="eyebrow text-ink-muted">{SITE.city[locale]}</p>
          <h2 className="mt-3 font-display text-3xl font-light md:text-4xl">
            {dict.home.visitTitle}
          </h2>
          <p className="mt-4 max-w-md text-sm text-ink-soft">
            {dict.home.visitText}
          </p>
          <p className="mt-4 text-sm">{dict.footer.hours}</p>
          <Link href={localeHref(locale, "/contact")} className="btn btn-ghost mt-6">
            {dict.home.visitCta}
          </Link>
        </div>
      </section>

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
