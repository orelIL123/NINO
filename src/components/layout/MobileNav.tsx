"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import LocaleSwitcher from "./LocaleSwitcher";
import type { NavGroup } from "./Header";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { SITE } from "@/lib/site";
import {
  ChevronDown,
  CloseIcon,
  HeartIcon,
  InstagramIcon,
  UserIcon,
} from "@/components/ui/Icons";

export default function MobileNav({
  open,
  onClose,
  nav,
}: {
  open: boolean;
  onClose: () => void;
  nav: NavGroup[];
}) {
  const { dict, href } = useLocale();
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={dict.header.menu}
        className={`absolute inset-y-0 start-0 flex w-[86%] max-w-sm flex-col bg-canvas transition-transform duration-300 ease-out ${
          open
            ? "translate-x-0"
            : "ltr:-translate-x-full rtl:translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <LocaleSwitcher />
          <button type="button" onClick={onClose} aria-label={dict.header.close}>
            <CloseIcon size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="divide-y divide-line">
            {nav.map((item) => (
              <li key={item.key} className="py-1">
                {item.columns ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((e) => (e === item.key ? null : item.key))
                      }
                      aria-expanded={expanded === item.key}
                      className="flex w-full items-center justify-between py-3 text-start"
                    >
                      <span
                        className={`nav-link text-[13px] ${item.accent ? "text-sale" : ""}`}
                      >
                        {item.label}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${
                          expanded === item.key ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expanded === item.key && (
                      <ul className="animate-fade-in space-y-1 pb-3 ps-3">
                        {item.columns.flatMap((col) => col.links).map((l) => (
                          <li key={l.href}>
                            <Link
                              href={l.href}
                              onClick={onClose}
                              className="block py-1.5 text-sm text-ink-soft"
                            >
                              {l.label}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className="block py-1.5 text-sm font-medium underline"
                          >
                            {dict.nav.all}
                          </Link>
                        </li>
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`nav-link block py-3.5 text-[13px] ${
                      item.accent ? "text-sale" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3 border-t border-line px-5 py-5">
          <Link
            href={href("/wishlist")}
            onClick={onClose}
            className="flex items-center gap-3 text-sm"
          >
            <HeartIcon size={19} />
            {dict.header.wishlist}
          </Link>
          <Link
            href={href("/account")}
            onClick={onClose}
            className="flex items-center gap-3 text-sm"
          >
            <UserIcon size={19} />
            {dict.header.account}
          </Link>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-3 text-sm"
          >
            <InstagramIcon size={19} />
            {SITE.instagramHandle}
          </a>
        </div>
      </div>
    </div>
  );
}
