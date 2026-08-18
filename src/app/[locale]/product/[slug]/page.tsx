import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import ProductGallery from "@/components/product/ProductGallery";
import PurchasePanel from "@/components/product/PurchasePanel";
import ProductGrid from "@/components/product/ProductGrid";
import Accordion from "@/components/ui/Accordion";
import SectionHeader from "@/components/home/SectionHeader";
import {
  getAllProductSlugs,
  getBrandBySlug,
  getCategoryBySlug,
  getProductBySlug,
  getProductsBySlugs,
  getRelatedProducts,
} from "@/lib/api/products";
import { isLocale, localeHref, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { discountPercent, formatPrice } from "@/lib/utils/format";
import { SITE } from "@/lib/site";
import { MapPinIcon, ReturnIcon, TruckIcon } from "@/components/ui/Icons";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const brand = await getBrandBySlug(product.brand);

  return {
    title: `${product.title[locale]} · ${brand?.name ?? ""}`,
    description: product.description[locale],
    alternates: { canonical: localeHref(locale, `/product/${product.slug}`) },
    openGraph: {
      title: product.title[locale],
      description: product.description[locale],
      images: [{ url: product.images[0] }],
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const product = await getProductBySlug(slug);
  if (!product) notFound();
  if (product.slug !== slug) {
    permanentRedirect(localeHref(locale, `/product/${product.slug}`));
  }

  const dict = getDictionary(locale);
  const [brand, category, related, colorways] = await Promise.all([
    getBrandBySlug(product.brand),
    getCategoryBySlug(product.category),
    getRelatedProducts(product, 4),
    getProductsBySlugs(product.relatedColors ?? []),
  ]);

  const discount = discountPercent(product.price, product.compareAtPrice);
  const inStock = product.sizes.some((s) => s.stock > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title[locale],
    image: product.images.map((i) => `${SITE.url}${i}`),
    description: product.description[locale],
    sku: product.sku,
    brand: { "@type": "Brand", name: brand?.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "ILS",
      price: product.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE.url}${localeHref(locale, `/product/${slug}`)}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-nino py-6 md:py-8">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
            <li>
              <Link href={localeHref(locale, "/")} className="hover:text-ink">
                NINO
              </Link>
            </li>
            {category && (
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true">/</span>
                <Link
                  href={localeHref(locale, `/category/${category.slug}`)}
                  className="hover:text-ink"
                >
                  {category.title[locale]}
                </Link>
              </li>
            )}
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true">/</span>
              <span className="text-ink">{product.title[locale]}</span>
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,40%)] lg:gap-14">
          <ProductGallery images={product.images} alt={product.title[locale]} />

          <div className="lg:sticky lg:top-32 lg:self-start">
            <Link
              href={localeHref(locale, `/brands/${product.brand}`)}
              className="eyebrow text-ink-muted transition-colors hover:text-ink"
            >
              {brand?.name}
            </Link>
            <h1 className="mt-2 font-display text-3xl font-light md:text-4xl">
              {product.title[locale]}
            </h1>

            <div className="mt-3 flex items-baseline gap-3">
              <span
                className={`text-xl ${discount ? "font-medium text-sale" : ""}`}
              >
                {formatPrice(product.price, locale)}
              </span>
              {product.compareAtPrice && (
                <>
                  <span className="text-sm text-ink-muted line-through">
                    {formatPrice(product.compareAtPrice, locale)}
                  </span>
                  <span
                    dir="ltr"
                    className="bg-sale px-1.5 py-0.5 text-[10px] tracking-widest text-white"
                  >
                    −{discount}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              {dict.product.sku}: {product.sku}
            </p>

            {/* Colourways */}
            {colorways.length > 1 && (
              <div className="mt-6">
                <p className="eyebrow mb-2.5">
                  {dict.product.color}: {product.color.name[locale]}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorways.map((c) => (
                    <Link
                      key={c.slug}
                      href={localeHref(locale, `/product/${c.slug}`)}
                      aria-label={c.color.name[locale]}
                      title={c.color.name[locale]}
                      className={`relative h-14 w-11 overflow-hidden border ${
                        c.slug === product.slug
                          ? "border-ink"
                          : "border-line-strong hover:border-ink"
                      }`}
                    >
                      <Image
                        src={c.images[0]}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7">
              <PurchasePanel product={product} brandName={brand?.name ?? ""} />
            </div>

            <ul className="mt-7 space-y-2.5 border-y border-line py-5 text-xs text-ink-soft">
              <li className="flex items-center gap-2.5">
                <TruckIcon size={17} className="shrink-0" />
                {dict.announcement.shipping}
              </li>
              <li className="flex items-center gap-2.5">
                <ReturnIcon size={17} className="shrink-0" />
                {dict.announcement.returns}
              </li>
              <li className="flex items-center gap-2.5">
                <MapPinIcon size={17} className="shrink-0" />
                {dict.announcement.store}
              </li>
            </ul>

            <div className="mt-4">
              <Accordion title={dict.product.description} defaultOpen>
                <p>{product.description[locale]}</p>
              </Accordion>
              <Accordion title={dict.product.details}>
                <ul className="list-disc space-y-1.5 ps-4">
                  {product.details[locale].map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </Accordion>
              <Accordion title={dict.product.shipping}>
                <p>{dict.announcement.shipping}</p>
                <p className="mt-1.5">{dict.announcement.returns}</p>
                <p className="mt-1.5">{dict.announcement.store}</p>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-nino py-14">
          <SectionHeader title={dict.product.relatedTitle} align="center" />
          <ProductGrid products={related} locale={locale} columns={4} />
        </section>
      )}
    </>
  );
}
