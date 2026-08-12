"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import {
  DEFAULT_SIZES,
  PRODUCT_TYPES,
  groupForProductType,
  type ProductType,
} from "@/lib/admin/product-conventions";

type UploadedImage = {
  id: string;
  file: File;
  preview: string;
  resourceUrl?: string;
};

const inputClass =
  "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-black focus:ring-2 focus:ring-black/5";
const labelClass = "mb-2 block text-sm font-semibold text-black/75";

function messageFor(error: string) {
  const messages: Record<string, string> = {
    invalid_password: "הסיסמה לא נכונה",
    too_many_attempts: "יותר מדי ניסיונות. נסה שוב בעוד כמה דקות",
    admin_not_configured: "האדמין עדיין לא הוגדר ב־Vercel",
    unauthorized: "החיבור פג. יש להתחבר שוב",
    invalid_image: "התמונה לא תקינה. השתמש ב־JPG, PNG או WebP",
    invalid_product: "יש שדה חסר או ערך לא תקין בטופס",
  };
  return messages[error] || error || "משהו השתבש. נסה שוב";
}

async function optimizeImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error("invalid_image");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("invalid_image");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.88)
  );
  if (!blob) throw new Error("invalid_image");
  const safeName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]+/g, "-");
  return new File([blob], `${safeName || "product"}.jpg`, {
    type: "image/jpeg",
  });
}

export default function AdminPanel({
  initialAuthenticated,
  authConfigured,
  shopifyConfigured,
}: {
  initialAuthenticated: boolean;
  authConfigured: boolean;
  shopifyConfigured: boolean;
}) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [productType, setProductType] = useState<ProductType>("T-shirts");
  const [sizes, setSizes] = useState(DEFAULT_SIZES.clothing);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const imagesRef = useRef<UploadedImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<
    | { ok: true; title: string; adminUrl?: string; warnings: string[] }
    | { ok: false; error: string; partialTitle?: string }
    | null
  >(null);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(
    () => () =>
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview)),
    []
  );

  const group = useMemo(() => groupForProductType(productType), [productType]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = (await response.json()) as { ok: boolean; error?: string };
    setLoginBusy(false);
    if (!response.ok || !data.ok) {
      setLoginError(messageFor(data.error || "login_failed"));
      return;
    }
    setPassword("");
    setAuthenticated(true);
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
  }

  function changeType(next: ProductType) {
    const previousGroup = groupForProductType(productType);
    const nextGroup = groupForProductType(next);
    setProductType(next);
    if (previousGroup !== nextGroup) setSizes(DEFAULT_SIZES[nextGroup]);
  }

  async function chooseImages(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files).slice(0, Math.max(0, 3 - images.length));
    try {
      const optimized = await Promise.all(selected.map(optimizeImage));
      setImages((current) => [
        ...current,
        ...optimized.map((file) => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
        })),
      ]);
    } catch (error) {
      setResult({
        ok: false,
        error: messageFor(error instanceof Error ? error.message : "invalid_image"),
      });
    }
  }

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return current.filter((image) => image.id !== id);
    });
  }

  async function uploadImages(title: string) {
    const uploaded = [] as Array<{ resourceUrl: string; alt: string }>;
    for (let index = 0; index < images.length; index += 1) {
      setProgress(`מעלה תמונה ${index + 1} מתוך ${images.length}…`);
      const form = new FormData();
      form.append("image", images[index].file);
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: form,
      });
      const data = (await response.json()) as {
        ok: boolean;
        resourceUrl?: string;
        error?: string;
      };
      if (!response.ok || !data.ok || !data.resourceUrl)
        throw new Error(data.error || "upload_failed");
      uploaded.push({
        resourceUrl: data.resourceUrl,
        alt: `${title} — תמונה ${index + 1}`,
      });
    }
    return uploaded;
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setResult(null);
    if (!images.length) {
      setResult({ ok: false, error: "יש לבחור לפחות תמונה אחת" });
      return;
    }

    setBusy(true);
    const form = new FormData(formElement);
    const title = String(form.get("title") || "").trim();
    try {
      const media = await uploadImages(title);
      setProgress("יוצר מוצר, מידות ומלאי ב־Shopify…");
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          titleHe: String(form.get("titleHe") || ""),
          description: String(form.get("description") || ""),
          descriptionHe: String(form.get("descriptionHe") || ""),
          vendor: String(form.get("vendor") || "NINO"),
          productType,
          gender: String(form.get("gender") || "men"),
          extraTags: ["new", "bestseller"].filter(
            (tag) => form.get(tag) === "on"
          ),
          sizes: sizes.split(",").map((size) => size.trim()).filter(Boolean),
          color: String(form.get("color") || ""),
          price: Number(form.get("price")),
          compareAtPrice: form.get("compareAtPrice")
            ? Number(form.get("compareAtPrice"))
            : undefined,
          stock: Number(form.get("stock")),
          skuPrefix: String(form.get("skuPrefix") || ""),
          publish: form.get("publish") === "on",
          media,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        product?: { title: string; adminUrl?: string };
        partialProduct?: { title: string };
        warnings?: string[];
      };
      if (!response.ok || !data.ok || !data.product) {
        setResult({
          ok: false,
          error: messageFor(data.error || "product_create_failed"),
          partialTitle: data.partialProduct?.title,
        });
        return;
      }

      setResult({
        ok: true,
        title: data.product.title,
        adminUrl: data.product.adminUrl,
        warnings: data.warnings || [],
      });
      formElement.reset();
      images.forEach((image) => URL.revokeObjectURL(image.preview));
      setImages([]);
      setProductType("T-shirts");
      setSizes(DEFAULT_SIZES.clothing);
    } catch (error) {
      setResult({
        ok: false,
        error: messageFor(error instanceof Error ? error.message : "upload_failed"),
      });
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  if (!authConfigured || !shopifyConfigured) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-5 py-12">
        <div className="w-full rounded-3xl bg-white p-7 shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
          <Brand />
          <h1 className="mt-8 text-2xl font-bold">האדמין כמעט מוכן</h1>
          <p className="mt-3 text-black/60">
            חסרים משתני הסביבה של האדמין או חיבור Shopify Admin ב־Vercel.
          </p>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center px-5 py-12">
        <form
          onSubmit={login}
          className="w-full rounded-3xl bg-white p-7 shadow-[0_20px_80px_rgba(0,0,0,0.08)] md:p-9"
        >
          <Brand />
          <h1 className="mt-10 text-3xl font-bold">כניסה לניהול מוצרים</h1>
          <p className="mt-2 text-black/55">ממשק פרטי שמחובר ישירות ל־Shopify</p>
          <label className="mt-8 block">
            <span className={labelClass}>סיסמת אדמין</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
              required
              autoFocus
              autoComplete="current-password"
            />
          </label>
          {loginError && <p className="mt-3 text-sm text-red-700">{loginError}</p>}
          <button
            type="submit"
            disabled={loginBusy}
            className="mt-6 w-full rounded-xl bg-black px-5 py-3.5 font-semibold text-white disabled:opacity-40"
          >
            {loginBusy ? "מתחבר…" : "כניסה"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Brand compact />
          <button onClick={logout} className="text-sm text-black/55 hover:text-black">
            יציאה
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8 md:py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-black/40 uppercase">
            Shopify Product Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">הוספת מוצר חדש</h1>
          <p className="mt-2 text-black/55">
            ממלאים, מעלים עד 3 תמונות — והמוצר נכנס ל־Shopify עם הקטגוריות הנכונות.
          </p>
        </div>

        <form onSubmit={createProduct} className="space-y-6">
          <Section title="תמונות" subtitle="בין תמונה אחת לשלוש. הראשונה תהיה התמונה הראשית.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image, index) => (
                <div key={image.id} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#eceae6]">
                  {/* A local object URL can't be handled by next/image. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.preview} alt="" className="h-full w-full object-cover" />
                  {index === 0 && (
                    <span className="absolute right-2 top-2 rounded-full bg-black px-2.5 py-1 text-xs text-white">
                      ראשית
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute bottom-2 left-2 rounded-full bg-white/95 px-3 py-1 text-xs shadow"
                  >
                    הסרה
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/20 bg-white text-center transition hover:border-black/45">
                  <span className="text-3xl font-light">+</span>
                  <span className="mt-2 text-sm font-semibold">הוספת תמונות</span>
                  <span className="mt-1 px-3 text-xs text-black/45">JPG, PNG או WebP</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    onChange={(event) => {
                      void chooseImages(event.target.files);
                      event.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
          </Section>

          <Section title="פרטי מוצר">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="שם באנגלית" name="title" placeholder="Oversized Dachshund Tee" required />
              <Field label="שם בעברית" name="titleHe" placeholder="טי שירט אוברסייז דקל" />
              <label className="md:col-span-2">
                <span className={labelClass}>תיאור באנגלית</span>
                <textarea name="description" rows={4} className={inputClass} />
              </label>
              <label className="md:col-span-2">
                <span className={labelClass}>תיאור בעברית</span>
                <textarea name="descriptionHe" rows={4} className={inputClass} />
              </label>
              <Field label="מותג" name="vendor" defaultValue="NINO" required />
              <label>
                <span className={labelClass}>סוג מוצר</span>
                <select
                  name="productType"
                  value={productType}
                  onChange={(event) => changeType(event.target.value as ProductType)}
                  className={inputClass}
                >
                  {PRODUCT_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelClass}>קהל</span>
                <select name="gender" className={inputClass} defaultValue="men">
                  <option value="men">גברים</option>
                  <option value="women">נשים</option>
                </select>
              </label>
              <div>
                <span className={labelClass}>קטגוריה אוטומטית</span>
                <div className="rounded-xl bg-[#efeee9] px-4 py-3 text-sm font-semibold">
                  {group === "clothing" ? "ביגוד" : group === "shoes" ? "נעליים" : "אקססוריז"}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-5 md:col-span-2">
                <Check name="new" label="חדש באתר" defaultChecked />
                <Check name="bestseller" label="רב־מכר" />
              </div>
            </div>
          </Section>

          <Section title="מידות, צבע ומלאי" subtitle="המלאי שיוזן יחול על כל מידה.">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className={labelClass}>מידות — מופרדות בפסיק</span>
                <input
                  value={sizes}
                  onChange={(event) => setSizes(event.target.value)}
                  className={inputClass}
                  required
                  dir="ltr"
                />
              </label>
              <Field label="צבע" name="color" defaultValue="White" required />
              <Field label="מלאי לכל מידה" name="stock" type="number" defaultValue="12" min="0" required />
              <Field label="מחיר ₪" name="price" type="number" step="0.01" min="0.01" defaultValue="149" required />
              <Field label="מחיר לפני הנחה ₪" name="compareAtPrice" type="number" step="0.01" min="0.01" />
              <Field label="קידומת SKU (רשות)" name="skuPrefix" placeholder="NINO-DACH" />
            </div>
          </Section>

          <Section title="פרסום">
            <Check
              name="publish"
              label="לפרסם מיד בחנות"
              description="אם כבוי, המוצר יישמר כטיוטה ב־Shopify."
              defaultChecked
            />
          </Section>

          {result && (
            <div className={`rounded-2xl border p-5 ${result.ok ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
              {result.ok ? (
                <>
                  <p className="font-bold">המוצר “{result.title}” נוצר בהצלחה ✓</p>
                  {result.warnings.map((warning) => (
                    <p key={warning} className="mt-2 text-sm text-amber-800">{warning}</p>
                  ))}
                  {result.adminUrl && (
                    <a href={result.adminUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold underline">
                      פתיחה ב־Shopify
                    </a>
                  )}
                </>
              ) : (
                <>
                  <p className="font-bold">לא הצלחתי להשלים את יצירת המוצר</p>
                  <p className="mt-2 text-sm">{result.error}</p>
                  {result.partialTitle && <p className="mt-2 text-xs">נוצרה טיוטה חלקית: {result.partialTitle}</p>}
                </>
              )}
            </div>
          )}

          <div className="sticky bottom-4 z-10 rounded-2xl border border-black/10 bg-white/95 p-3 shadow-[0_12px_50px_rgba(0,0,0,0.16)] backdrop-blur md:flex md:items-center md:justify-between">
            <p className="mb-3 text-sm text-black/55 md:mb-0">{busy ? progress : "המוצר יישמר ישירות ב־Shopify"}</p>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-black px-8 py-3.5 font-bold text-white disabled:opacity-40 md:w-auto"
            >
              {busy ? "עובד…" : "יצירת מוצר"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="leading-none">
      <div className={`${compact ? "text-2xl" : "text-3xl"} tracking-[0.22em]`}>NINO</div>
      <div className="mt-1 text-[9px] tracking-[0.28em] text-black/45">PRODUCT ADMIN</div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_10px_45px_rgba(0,0,0,0.045)] md:p-7">
      <h2 className="text-xl font-bold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-black/50">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label>
      <span className={labelClass}>{label}</span>
      <input className={inputClass} {...props} />
    </label>
  );
}

function Check({
  label,
  description,
  ...props
}: {
  label: string;
  description?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" className="mt-1 h-5 w-5 accent-black" {...props} />
      <span>
        <span className="block font-semibold">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-black/50">{description}</span>}
      </span>
    </label>
  );
}
