"use client";

import { useCallback, useEffect, useState } from "react";

type HomepageSection = {
  key: "tshirts" | "outerwear" | "shoes" | "accessories" | "seasonal";
  label: string;
  exists: boolean;
  collectionImage: string | null;
  automaticImage: string | null;
  eyebrowEn?: string;
  eyebrowHe?: string;
  titleEn?: string;
  titleHe?: string;
  descriptionEn?: string;
  descriptionHe?: string;
};

const inputClass =
  "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-black focus:ring-2 focus:ring-black/5";
const labelClass = "mb-2 block text-sm font-semibold text-black/75";

async function optimizeImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error("התמונה לא תקינה");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("התמונה לא תקינה");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.88)
  );
  if (!blob) throw new Error("התמונה לא תקינה");
  return new File([blob], "homepage-image.jpg", { type: "image/jpeg" });
}

export default function HomepageEditor() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/homepage", { cache: "no-store" });
    const data = (await response.json()) as {
      ok: boolean;
      sections?: HomepageSection[];
      error?: string;
    };
    setLoading(false);
    if (!response.ok || !data.ok || !data.sections) {
      setMessage(data.error || "לא ניתן לטעון את תוכן דף הבית");
      return;
    }
    setSections(data.sections);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/homepage", { cache: "no-store" })
      .then(async (response) => ({
        response,
        data: (await response.json()) as {
          ok: boolean;
          sections?: HomepageSection[];
          error?: string;
        },
      }))
      .then(({ response, data }) => {
        if (cancelled) return;
        setLoading(false);
        if (!response.ok || !data.ok || !data.sections) {
          setMessage(data.error || "לא ניתן לטעון את תוכן דף הבית");
          return;
        }
        setSections(data.sections);
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setMessage("לא ניתן לטעון את תוכן דף הבית");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function patchSection(key: HomepageSection["key"], patch: Partial<HomepageSection>) {
    setSections((current) =>
      current.map((section) =>
        section.key === key ? { ...section, ...patch } : section
      )
    );
  }

  async function save(
    section: HomepageSection,
    extra: Record<string, unknown> = {}
  ) {
    setBusyKey(section.key);
    setMessage("");
    const response = await fetch("/api/admin/homepage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: section.key,
        ...(section.key === "seasonal"
          ? {
              eyebrowEn: section.eyebrowEn,
              eyebrowHe: section.eyebrowHe,
              titleEn: section.titleEn,
              titleHe: section.titleHe,
              descriptionEn: section.descriptionEn,
              descriptionHe: section.descriptionHe,
            }
          : {}),
        ...extra,
      }),
    });
    const data = (await response.json()) as { ok: boolean; error?: string };
    if (!response.ok || !data.ok) throw new Error(data.error || "השמירה נכשלה");
    setMessage("השינוי נשמר ב־Shopify ויופיע באתר תוך רגע ✓");
    await load();
  }

  async function upload(section: HomepageSection, file: File | undefined) {
    if (!file) return;
    setBusyKey(section.key);
    setMessage("");
    try {
      const optimized = await optimizeImage(file);
      const form = new FormData();
      form.append("image", optimized);
      const uploadResponse = await fetch("/api/admin/uploads", {
        method: "POST",
        body: form,
      });
      const uploadData = (await uploadResponse.json()) as {
        ok: boolean;
        resourceUrl?: string;
        error?: string;
      };
      if (!uploadResponse.ok || !uploadData.ok || !uploadData.resourceUrl) {
        throw new Error(uploadData.error || "העלאת התמונה נכשלה");
      }
      await save(section, { imageUrl: uploadData.resourceUrl });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "השמירה נכשלה");
    } finally {
      setBusyKey(null);
    }
  }

  async function resetImage(section: HomepageSection) {
    try {
      await save(section, { removeImage: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "השמירה נכשלה");
    } finally {
      setBusyKey(null);
    }
  }

  async function saveSeasonal(section: HomepageSection) {
    try {
      await save(section);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "השמירה נכשלה");
    } finally {
      setBusyKey(null);
    }
  }

  const categories = sections.filter((section) => section.key !== "seasonal");
  const seasonal = sections.find((section) => section.key === "seasonal");

  return (
    <section className="mt-14 border-t border-black/10 pt-12">
      <p className="text-xs font-semibold tracking-[0.16em] text-black/40 uppercase">
        Homepage Admin
      </p>
      <h2 className="mt-2 text-3xl font-bold">עריכת דף הבית</h2>
      <p className="mt-2 max-w-2xl text-black/55">
        בלי תמונה ידנית, הכרטיסייה מציגה אוטומטית את המוצר החדש ביותר בקטגוריה.
      </p>

      {message && (
        <p className="mt-5 rounded-xl bg-[#efeee9] px-4 py-3 text-sm">{message}</p>
      )}

      {loading ? (
        <div className="mt-6 rounded-3xl bg-white p-7">טוען תוכן מ־Shopify…</div>
      ) : (
        <>
          <div className="mt-6 rounded-3xl bg-white p-5 shadow-[0_10px_45px_rgba(0,0,0,0.045)] md:p-7">
            <h3 className="text-xl font-bold">קנו לפי קטגוריה</h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((section) => {
                const image = section.collectionImage || section.automaticImage;
                const busy = busyKey === section.key;
                return (
                  <article key={section.key} className="rounded-2xl border border-black/10 p-3">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#eceae6]">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-black/40">
                          התמונה תופיע עם העלאת המוצר הראשון
                        </div>
                      )}
                      <span className="absolute right-2 top-2 rounded-full bg-black/80 px-2.5 py-1 text-[11px] text-white">
                        {section.collectionImage ? "תמונה ידנית" : "אוטומטי"}
                      </span>
                    </div>
                    <h4 className="mt-3 font-bold">{section.label}</h4>
                    {!section.exists && (
                      <p className="mt-1 text-xs text-red-700">הקולקציה חסרה ב־Shopify</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <label className="cursor-pointer rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white">
                        {busy ? "שומר…" : "החלפת תמונה"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          disabled={busy || !section.exists}
                          onChange={(event) => {
                            void upload(section, event.target.files?.[0]);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      {section.collectionImage && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void resetImage(section)}
                          className="rounded-lg border border-black/15 px-3 py-2 text-xs font-semibold disabled:opacity-40"
                        >
                          חזרה לאוטומטי
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {seasonal && (
            <div className="mt-6 rounded-3xl bg-white p-5 shadow-[0_10px_45px_rgba(0,0,0,0.045)] md:p-7">
              <h3 className="text-xl font-bold">קולקציית העונה</h3>
              <p className="mt-1 text-sm text-black/50">
                הטקסט והתמונה של הבאנר הגדול בדף הבית, בעברית ובאנגלית.
              </p>

              <div className="mt-5 grid gap-6 lg:grid-cols-[240px_1fr]">
                <div>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#eceae6]">
                    {(seasonal.collectionImage || seasonal.automaticImage) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={seasonal.collectionImage || seasonal.automaticImage || ""}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-black/40">
                        כרגע מוצגת תמונת ברירת המחדל
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <label className="cursor-pointer rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white">
                      {busyKey === seasonal.key ? "שומר…" : "החלפת תמונה"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={busyKey === seasonal.key}
                        onChange={(event) => {
                          void upload(seasonal, event.target.files?.[0]);
                          event.target.value = "";
                        }}
                      />
                    </label>
                    {seasonal.collectionImage && (
                      <button
                        type="button"
                        disabled={busyKey === seasonal.key}
                        onClick={() => void resetImage(seasonal)}
                        className="rounded-lg border border-black/15 px-3 py-2 text-xs font-semibold"
                      >
                        הסרת תמונה
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <TextField label="כותרת קטנה בעברית" value={seasonal.eyebrowHe || ""} onChange={(value) => patchSection("seasonal", { eyebrowHe: value })} />
                  <TextField label="כותרת קטנה באנגלית" value={seasonal.eyebrowEn || ""} onChange={(value) => patchSection("seasonal", { eyebrowEn: value })} dir="ltr" />
                  <TextField label="כותרת בעברית" value={seasonal.titleHe || ""} onChange={(value) => patchSection("seasonal", { titleHe: value })} />
                  <TextField label="כותרת באנגלית" value={seasonal.titleEn || ""} onChange={(value) => patchSection("seasonal", { titleEn: value })} dir="ltr" />
                  <TextArea label="תיאור בעברית" value={seasonal.descriptionHe || ""} onChange={(value) => patchSection("seasonal", { descriptionHe: value })} />
                  <TextArea label="תיאור באנגלית" value={seasonal.descriptionEn || ""} onChange={(value) => patchSection("seasonal", { descriptionEn: value })} dir="ltr" />
                  <button
                    type="button"
                    disabled={busyKey === seasonal.key}
                    onClick={() => void saveSeasonal(seasonal)}
                    className="rounded-xl bg-black px-6 py-3.5 font-bold text-white disabled:opacity-40 md:col-span-2 md:justify-self-end"
                  >
                    {busyKey === seasonal.key ? "שומר ב־Shopify…" : "שמירת תוכן דף הבית"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label>
      <span className={labelClass}>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} dir={dir} />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label>
      <span className={labelClass}>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} rows={5} dir={dir} />
    </label>
  );
}
