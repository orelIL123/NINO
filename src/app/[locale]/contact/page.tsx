import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ContactForm from "./ContactForm";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SITE } from "@/lib/site";
import {
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsappIcon,
} from "@/components/ui/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).pages.contactTitle };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="container-nino py-12 md:py-16">
      <h1 className="font-display text-3xl font-light md:text-4xl">
        {dict.pages.contactTitle}
      </h1>
      <p className="mt-3 max-w-lg text-sm text-ink-soft">
        {dict.pages.contactText}
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="space-y-8">
          <div>
            <h2 className="eyebrow mb-3 text-ink-muted">
              {dict.pages.addressLabel}
            </h2>
            <p className="flex items-center gap-2.5 text-sm">
              <MapPinIcon size={18} />
              {SITE.address[locale]}
            </p>
          </div>

          <div className="space-y-3">
            <a
              href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}
              className="flex items-center gap-2.5 text-sm transition-opacity hover:opacity-70"
            >
              <PhoneIcon size={18} />
              {SITE.phone}
            </a>
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2.5 text-sm transition-opacity hover:opacity-70"
            >
              <WhatsappIcon size={18} />
              {dict.pages.whatsapp}
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2.5 text-sm transition-opacity hover:opacity-70"
            >
              <InstagramIcon size={18} />
              {SITE.instagramHandle}
            </a>
          </div>

          <div>
            <h2 className="eyebrow mb-3 text-ink-muted">
              {dict.pages.openingHours}
            </h2>
            <dl className="space-y-1.5 text-sm">
              {SITE.hours.map((row) => (
                <div key={row.time + row.en} className="flex justify-between gap-6 border-b border-line pb-1.5">
                  <dt className="text-ink-soft">{row[locale]}</dt>
                  <dd>{row.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
