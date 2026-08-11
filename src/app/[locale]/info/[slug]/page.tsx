import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getInfoPage, infoPages } from "@/lib/data/pages";
import { isLocale, locales } from "@/lib/i18n/config";

type Params = Promise<{ locale: string; slug: string }>;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    infoPages.map((p) => ({ locale, slug: p.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const page = getInfoPage(slug);
  return page ? { title: page.title[locale] } : {};
}

export default async function InfoPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const page = getInfoPage(slug);
  if (!page) notFound();

  return (
    <article className="container-nino max-w-3xl py-12 md:py-16">
      <h1 className="font-display text-3xl font-light md:text-4xl">
        {page.title[locale]}
      </h1>
      {page.intro && (
        <p className="mt-4 text-base text-ink-soft">{page.intro[locale]}</p>
      )}

      <div className="mt-10 space-y-9">
        {page.blocks.map((block) => (
          <section key={block.heading.en}>
            <h2 className="text-lg font-medium">{block.heading[locale]}</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              {block.body[locale].map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-line-strong" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
