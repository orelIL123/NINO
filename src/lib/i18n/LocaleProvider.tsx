"use client";

import { createContext, useContext } from "react";
import type { Locale } from "./config";
import { localeHref } from "./config";
import type { Dictionary } from "./dictionaries";

interface LocaleValue {
  locale: Locale;
  dict: Dictionary;
  dir: "rtl" | "ltr";
  href: (path?: string) => string;
}

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const value: LocaleValue = {
    locale,
    dict,
    dir: locale === "he" ? "rtl" : "ltr",
    href: (path = "/") => localeHref(locale, path),
  };
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}
