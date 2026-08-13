"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type ExistingProduct = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED" | string;
  totalInventory: number;
  variants: {
    nodes: Array<{
      title: string;
      inventoryQuantity: number;
      selectedOptions: Array<{ name: string; value: string }>;
    }>;
  };
  updatedAt: string;
  image: { url: string; altText: string | null } | null;
  adminUrl: string | null;
};

const statusLabels: Record<string, string> = {
  ACTIVE: "פעיל",
  DRAFT: "טיוטה",
  ARCHIVED: "בארכיון",
};

export default function ExistingProducts({ refreshKey }: { refreshKey: number }) {
  const [products, setProducts] = useState<ExistingProduct[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/admin/products", { cache: "no-store" })
      .then(async (response) => ({
        response,
        data: (await response.json()) as {
          ok: boolean;
          products?: ExistingProduct[];
          truncated?: boolean;
          error?: string;
        },
      }))
      .then(({ response, data }) => {
        if (cancelled) return;
        setLoading(false);
        if (!response.ok || !data.ok || !data.products) {
          setError(data.error || "לא ניתן לטעון את המוצרים מ־Shopify");
          return;
        }
        setError("");
        setProducts(data.products);
        setTruncated(Boolean(data.truncated));
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setError("לא ניתן לטעון את המוצרים מ־Shopify");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("he");
    if (!needle) return products;
    return products.filter((product) =>
      [product.title, product.vendor, product.productType, product.handle]
        .join(" ")
        .toLocaleLowerCase("he")
        .includes(needle)
    );
  }, [products, query]);

  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_10px_45px_rgba(0,0,0,0.045)] md:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">מוצרים קיימים</h2>
          <p className="mt-1 text-sm text-black/50">
            {loading ? "טוען מ־Shopify…" : `${products.length} מוצרים בחנות`}
          </p>
        </div>
        <label className="w-full sm:max-w-xs">
          <span className="sr-only">חיפוש במוצרים קיימים</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="חיפוש לפי שם, מותג או סוג…"
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-black"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : loading ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[0, 1].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-[#efeee9]" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-[#efeee9] px-4 py-6 text-center text-sm text-black/55">
          עדיין אין מוצרים ב־Shopify.
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {visible.map((product) => (
              <article
                key={product.id}
                className="flex min-w-0 gap-4 rounded-2xl border border-black/10 p-3"
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[#eceae6]">
                  {product.image ? (
                    <Image
                      src={product.image.url}
                      alt={product.image.altText || product.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-black/35">
                      אין תמונה
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 py-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate font-bold">{product.title}</h3>
                    <span className="shrink-0 rounded-full bg-[#efeee9] px-2 py-0.5 text-[11px] font-semibold">
                      {statusLabels[product.status] || product.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-black/50">
                    {[product.vendor, product.productType].filter(Boolean).join(" · ") || "ללא סיווג"}
                  </p>
                  <p className="mt-2 text-xs text-black/60">
                    מלאי המוצר: <strong>{product.totalInventory}</strong>
                  </p>
                  {product.variants.nodes.length > 0 && (
                    <div className="mt-2 space-y-0.5 text-[11px] text-black/55">
                      {product.variants.nodes.map((variant) => {
                        const color = variant.selectedOptions.find((option) =>
                          ["color", "colour", "צבע"].includes(option.name.toLowerCase())
                        )?.value;
                        const size = variant.selectedOptions.find((option) =>
                          ["size", "מידה"].includes(option.name.toLowerCase())
                        )?.value;
                        return (
                          <p key={variant.title}>
                            {[color, size].filter(Boolean).join(" · ") || variant.title}: {variant.inventoryQuantity}
                          </p>
                        );
                      })}
                    </div>
                  )}
                  {product.adminUrl && (
                    <a
                      href={product.adminUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs font-semibold underline underline-offset-2"
                    >
                      פתיחה ועריכה ב־Shopify
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          {visible.length === 0 && (
            <p className="mt-6 text-center text-sm text-black/50">לא נמצאו מוצרים.</p>
          )}
          {truncated && (
            <p className="mt-4 text-xs text-amber-800">
              מוצגים 500 המוצרים שעודכנו לאחרונה.
            </p>
          )}
        </>
      )}
    </section>
  );
}
