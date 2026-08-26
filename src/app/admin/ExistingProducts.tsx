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
      id: string;
      title: string;
      price: string;
      inventoryQuantity: number;
      inventoryItem: { id: string } | null;
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
        setPrices(Object.fromEntries(data.products.map((product) => [product.id, product.variants.nodes[0]?.price || ""])));
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

  async function deleteProduct(product: ExistingProduct) {
    if (!window.confirm(`למחוק את המוצר “${product.title}” מ־Shopify? הפעולה לא ניתנת לביטול.`)) return;
    setDeletingId(product.id);
    setDeleteError("");
    try {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "מחיקת המוצר נכשלה");
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "מחיקת המוצר נכשלה");
    } finally {
      setDeletingId(null);
    }
  }

  async function updateProduct(product: ExistingProduct, action: "price" | "sold_out") {
    if (action === "sold_out" && !window.confirm(`לסמן את “${product.title}” כאזל מהמלאי?`)) return;
    const variants = product.variants.nodes
      .filter((variant) => variant.inventoryItem)
      .map((variant) => ({ id: variant.id, inventoryItemId: variant.inventoryItem!.id }));
    setUpdatingId(product.id);
    setDeleteError("");
    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, action, price: prices[product.id], variants }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "השינוי נכשל");
      if (action === "sold_out") {
        setProducts((current) => current.map((item) => item.id === product.id ? { ...item, totalInventory: 0, variants: { nodes: item.variants.nodes.map((variant) => ({ ...variant, inventoryQuantity: 0 })) } } : item));
      }
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "השינוי נכשל");
    } finally {
      setUpdatingId(null);
    }
  }

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
          {deleteError && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{deleteError}</p>}
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
                    className="object-contain"
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
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor={`price-${product.id}`}>מחיר חדש</label>
                    <input id={`price-${product.id}`} type="number" min="0.01" step="0.01" value={prices[product.id] || ""} onChange={(event) => setPrices((current) => ({ ...current, [product.id]: event.target.value }))} className="w-24 rounded-lg border border-black/15 px-2 py-1.5 text-xs" />
                    <button type="button" onClick={() => void updateProduct(product, "price")} disabled={updatingId === product.id} className="rounded-lg border border-black/15 px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50">עדכון מחיר</button>
                    <button type="button" onClick={() => void updateProduct(product, "sold_out")} disabled={updatingId === product.id || product.totalInventory === 0} className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-50">{product.totalInventory === 0 ? "אזל" : "סמן כאזל"}</button>
                  </div>
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
                  <button
                    type="button"
                    onClick={() => void deleteProduct(product)}
                    disabled={deletingId === product.id}
                    className="mt-3 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === product.id ? "מוחק…" : "מחיקת מוצר"}
                  </button>
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
