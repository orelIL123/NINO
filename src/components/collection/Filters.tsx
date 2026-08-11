"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { formatPrice } from "@/lib/utils/format";
import { PRICE_BANDS, type Facets } from "@/lib/data/filters";
import {
  CheckIcon,
  ChevronDown,
  CloseIcon,
  FilterIcon,
} from "@/components/ui/Icons";


export default function Filters({
  facets,
  total,
  children,
}: {
  facets: Facets;
  total: number;
  /** The product grid, rendered on the server and slotted in. */
  children: React.ReactNode;
}) {
  const { dict, locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const values = useCallback(
    (key: string) => params.get(key)?.split(",").filter(Boolean) ?? [],
    [params]
  );

  const push = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const toggle = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      const current = values(key);
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (updated.length) next.set(key, updated.join(","));
      else next.delete(key);
      push(next);
    },
    [params, push, values]
  );

  const setSingle = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      push(next);
    },
    [params, push]
  );

  const clearAll = () => router.replace(pathname, { scroll: false });

  const activeCount =
    values("brand").length +
    values("size").length +
    values("color").length +
    (params.get("price") ? 1 : 0) +
    (params.get("sale") ? 1 : 0);

  const sortOptions = [
    { value: "newest", label: dict.listing.sortNewest },
    { value: "popular", label: dict.listing.sortPopular },
    { value: "price-asc", label: dict.listing.sortPriceAsc },
    { value: "price-desc", label: dict.listing.sortPriceDesc },
  ];

  const panel = (
    <div className="space-y-7">
      <Group title={dict.listing.brand}>
        <ul className="space-y-2">
          {facets.brands.map((b) => {
            const checked = values("brand").includes(b.slug);
            return (
              <li key={b.slug}>
                <button
                  type="button"
                  onClick={() => toggle("brand", b.slug)}
                  className="flex w-full items-center gap-2.5 text-start text-sm"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                      checked ? "border-ink bg-ink text-white" : "border-line-strong"
                    }`}
                  >
                    {checked && <CheckIcon size={11} strokeWidth={2.5} />}
                  </span>
                  <span className={checked ? "" : "text-ink-soft"}>{b.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Group>

      <Group title={dict.listing.size}>
        <div className="flex flex-wrap gap-1.5">
          {facets.sizes.map((s) => {
            const checked = values("size").includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggle("size", s)}
                className={`min-w-10 border px-2.5 py-1.5 text-xs transition-colors ${
                  checked
                    ? "border-ink bg-ink text-white"
                    : "border-line-strong hover:border-ink"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Group>

      <Group title={dict.listing.color}>
        <ul className="flex flex-wrap gap-2.5">
          {facets.colors.map((c) => {
            const checked = values("color").includes(c.key);
            return (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => toggle("color", c.key)}
                  title={c.name[locale]}
                  aria-label={c.name[locale]}
                  aria-pressed={checked}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                    checked ? "border-ink ring-1 ring-ink ring-offset-2" : "border-line-strong"
                  }`}
                >
                  <span
                    className="h-5 w-5 rounded-full"
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </Group>

      <Group title={dict.listing.price}>
        <ul className="space-y-2">
          {PRICE_BANDS.map((band) => {
            const checked = params.get("price") === band.key;
            return (
              <li key={band.key}>
                <button
                  type="button"
                  onClick={() => setSingle("price", checked ? null : band.key)}
                  className="flex w-full items-center gap-2.5 text-start text-sm"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                      checked ? "border-ink bg-ink text-white" : "border-line-strong"
                    }`}
                  >
                    {checked && <CheckIcon size={11} strokeWidth={2.5} />}
                  </span>
                  <span dir="ltr" className={checked ? "" : "text-ink-soft"}>
                    {band.max > 9999
                      ? `${formatPrice(band.min, locale)}+`
                      : `${formatPrice(band.min, locale)} – ${formatPrice(band.max, locale)}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Group>

      <Group title={dict.listing.filters}>
        <button
          type="button"
          onClick={() => setSingle("sale", params.get("sale") ? null : "1")}
          className="flex w-full items-center gap-2.5 text-start text-sm"
        >
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
              params.get("sale")
                ? "border-ink bg-ink text-white"
                : "border-line-strong"
            }`}
          >
            {params.get("sale") && <CheckIcon size={11} strokeWidth={2.5} />}
          </span>
          <span className={params.get("sale") ? "" : "text-ink-soft"}>
            {dict.listing.onSale}
          </span>
        </button>
      </Group>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs underline underline-offset-4"
        >
          {dict.listing.clearAll}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Toolbar ------------------------------------------------------- */}
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-xs tracking-widest uppercase lg:hidden"
        >
          <FilterIcon size={17} />
          {dict.listing.filters}
          {activeCount > 0 && ` (${activeCount})`}
        </button>

        <p className="hidden text-xs text-ink-muted lg:block">
          {total} {dict.listing.results}
        </p>

        <label className="flex items-center gap-2 text-xs">
          <span className="sr-only sm:not-sr-only sm:tracking-widest sm:uppercase">
            {dict.listing.sort}
          </span>
          <span className="relative">
            <select
              value={params.get("sort") ?? "newest"}
              onChange={(e) => setSingle("sort", e.target.value)}
              className="appearance-none border-0 bg-transparent py-1 pe-6 ps-0 text-xs outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute end-0 top-1/2 -translate-y-1/2"
            />
          </span>
        </label>
      </div>

      {/* Sidebar + grid -------------------------------------------------- */}
      <div className="grid gap-8 lg:grid-cols-[200px_1fr] xl:grid-cols-[240px_1fr] xl:gap-12">
        <aside className="hidden lg:block">
          <div className="sticky top-32">{panel}</div>
        </aside>
        <div>{children}</div>
      </div>

      {/* Mobile drawer -------------------------------------------------- */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={dict.listing.filters}
          className={`absolute inset-y-0 start-0 flex w-[88%] max-w-sm flex-col bg-canvas transition-transform duration-300 ${
            open ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="eyebrow">{dict.listing.filters}</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={dict.header.close}
            >
              <CloseIcon size={22} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">{panel}</div>
          <div className="border-t border-line p-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-primary w-full"
            >
              {dict.listing.apply} ({total})
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="eyebrow mb-3 text-ink-muted">{title}</h3>
      {children}
    </section>
  );
}
