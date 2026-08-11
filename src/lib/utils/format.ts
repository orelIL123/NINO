import type { Locale } from "@/lib/i18n/config";

const formatters: Partial<Record<Locale, Intl.NumberFormat>> = {};

export function formatPrice(amount: number, locale: Locale = "he"): string {
  const key = locale;
  if (!formatters[key]) {
    formatters[key] = new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-IL", {
      style: "currency",
      currency: "ILS",
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
      minimumFractionDigits: 0,
    });
  }
  return formatters[key]!.format(amount);
}

export function formatNumber(value: number, locale: Locale = "he"): string {
  return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-US").format(value);
}

export function discountPercent(price: number, compareAt?: number): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** Fills {placeholders} in a dictionary string. */
export function template(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
