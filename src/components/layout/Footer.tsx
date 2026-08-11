"use client";

import Link from "next/link";
import Logo from "./Logo";
import Newsletter from "@/components/home/Newsletter";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { SITE } from "@/lib/site";
import {
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsappIcon,
} from "@/components/ui/Icons";

export default function Footer() {
  const { dict, locale, href } = useLocale();
  const year = new Date().getFullYear();

  const columns = [
    {
      title: dict.footer.shop,
      links: [
        { label: dict.nav.new, href: href("/category/new-in") },
        { label: dict.nav.clothing, href: href("/clothing") },
        { label: dict.nav.shoes, href: href("/shoes") },
        { label: dict.nav.accessories, href: href("/accessories") },
        { label: dict.nav.sale, href: href("/sale") },
      ],
    },
    {
      title: dict.footer.info,
      links: [
        { label: dict.footer.about, href: href("/about") },
        { label: dict.footer.shippingInfo, href: href("/info/shipping") },
        { label: dict.footer.returns, href: href("/info/returns") },
        { label: dict.footer.faq, href: href("/info/faq") },
        { label: dict.footer.terms, href: href("/info/terms") },
        { label: dict.footer.accessibility, href: href("/info/accessibility") },
      ],
    },
  ];

  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <Newsletter />

      <div className="container-nino grid gap-10 border-t border-line py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo href={href("/")} size="sm" />
          <p className="mt-4 max-w-xs text-sm text-ink-soft">
            {dict.meta.description}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center border border-line-strong transition-colors hover:border-ink"
            >
              <InstagramIcon size={17} />
            </a>
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="WhatsApp"
              className="flex h-9 w-9 items-center justify-center border border-line-strong transition-colors hover:border-ink"
            >
              <WhatsappIcon size={17} />
            </a>
            <a
              href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}
              aria-label={dict.pages.phone}
              className="flex h-9 w-9 items-center justify-center border border-line-strong transition-colors hover:border-ink"
            >
              <PhoneIcon size={17} />
            </a>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="eyebrow mb-4 text-ink-muted">{col.title}</h2>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-soft transition-colors hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="eyebrow mb-4 text-ink-muted">{dict.footer.contact}</h2>
          <address className="space-y-2.5 text-sm text-ink-soft not-italic">
            <p className="flex items-start gap-2">
              <MapPinIcon size={16} className="mt-0.5 shrink-0" />
              {SITE.address[locale]}
            </p>
            <p>
              <a
                href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}
                className="transition-colors hover:text-ink"
              >
                {SITE.phone}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${SITE.email}`}
                className="transition-colors hover:text-ink"
              >
                {SITE.email}
              </a>
            </p>
            <p className="pt-1 text-xs">{dict.footer.hours}</p>
          </address>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-nino flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-xs text-ink-muted">
            © {year} NINO · {dict.footer.rights}
          </p>
          <div className="flex items-center gap-2" aria-label={dict.footer.payments}>
            {["VISA", "MC", "AMEX", "BIT", "PAYPAL"].map((p) => (
              <span
                key={p}
                className="border border-line-strong px-2 py-1 text-[10px] tracking-widest text-ink-muted"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
